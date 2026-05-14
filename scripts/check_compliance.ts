import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

import { validateContestConfig, validateRiskConfig } from './validate_config.ts';

export type ContestConfig = {
  allowed_chains: string[];
  execution: {
    require_agentic_wallet: boolean;
    single_registered_account_only: boolean;
    wallet_export_disqualifies: boolean;
    primary_stack: string[];
  };
  tracked_metrics: string[];
  disallowed_swap_groups: {
    stablecoins: string[];
    native_tokens: Record<string, string[]>;
    wrapped_native_tokens: Record<string, string[]>;
  };
};

export type RiskConfig = {
  max_okx_risk_level: number;
  max_slippage_bps: number;
  minimum_wallet_reserve_usd: number;
  require_stop_loss: boolean;
  require_take_profit: boolean;
  require_tx_logging_plan: boolean;
  max_position_size_pct: number;
  max_daily_loss_pct: number;
};

export type TradePlan = {
  chain: string;
  execution_method: string;
  from_symbol: string;
  to_symbol: string;
  multi_account: boolean;
  registered_account_count: number;
  wallet_exported: boolean;
  wash_trading: boolean;
  circular_trading: boolean;
  external_reverse_hedge: boolean;
  signal_source: string;
  okx_risk_level: number;
  slippage_bps: number;
  position_size_pct: number;
  daily_loss_pct: number;
  wallet_value_after_trade_usd: number;
  stop_loss: unknown;
  take_profit: unknown;
  tx_logging_plan: string;
};

export type ComplianceResult = {
  pass: boolean;
  fail_reasons: string[];
};

function normalizeExecutionMethod(method: string): string {
  return method.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function categorizeSymbol(chain: string, symbol: string, config: ContestConfig): 'stablecoin' | 'native' | 'wrapped_native' | 'other' {
  const normalizedSymbol = normalizeSymbol(symbol);
  const normalizedChain = chain.trim().toLowerCase();

  if (config.disallowed_swap_groups.stablecoins.map(normalizeSymbol).includes(normalizedSymbol)) {
    return 'stablecoin';
  }

  const nativeTokens = config.disallowed_swap_groups.native_tokens[normalizedChain] ?? [];
  if (nativeTokens.map(normalizeSymbol).includes(normalizedSymbol)) {
    return 'native';
  }

  const wrappedNativeTokens = config.disallowed_swap_groups.wrapped_native_tokens[normalizedChain] ?? [];
  if (wrappedNativeTokens.map(normalizeSymbol).includes(normalizedSymbol)) {
    return 'wrapped_native';
  }

  return 'other';
}

function isPresentObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function isMissingLoggingPlan(value: string): boolean {
  return typeof value !== 'string' || value.trim().length === 0;
}

function hasMultipleRegisteredAccounts(plan: TradePlan): boolean {
  return plan.multi_account || plan.registered_account_count > 1;
}

function hasValidRiskTrigger(value: unknown): boolean {
  if (!isPresentObject(value)) {
    return false;
  }

  const candidate = value as { type?: unknown; value?: unknown };
  return typeof candidate.type === 'string' && candidate.type.trim().length > 0 && isFiniteNumber(candidate.value) && candidate.value > 0;
}

function usesRequiredPrimaryStack(config: ContestConfig, plan: TradePlan): boolean {
  const required = config.execution.primary_stack.map(normalizeText);
  return required.includes('onchainos') && normalizeText(plan.signal_source) === 'onchainos';
}

export function isNonCountingSwap(config: ContestConfig, plan: TradePlan): boolean {
  const fromCategory = categorizeSymbol(plan.chain, plan.from_symbol, config);
  const toCategory = categorizeSymbol(plan.chain, plan.to_symbol, config);

  return fromCategory !== 'other' && toCategory !== 'other';
}

export function evaluateTradePlan(
  contestConfig: ContestConfig,
  riskConfig: RiskConfig,
  plan: TradePlan,
): ComplianceResult {
  const failReasons: string[] = [];
  const hasChain = typeof plan.chain === 'string' && plan.chain.trim().length > 0;
  const hasExecutionMethod = typeof plan.execution_method === 'string' && plan.execution_method.trim().length > 0;
  const hasTradeSymbols =
    typeof plan.from_symbol === 'string' &&
    plan.from_symbol.trim().length > 0 &&
    typeof plan.to_symbol === 'string' &&
    plan.to_symbol.trim().length > 0;

  const normalizedChain = hasChain ? plan.chain.trim().toLowerCase() : '';
  const normalizedExecutionMethod = hasExecutionMethod ? normalizeExecutionMethod(plan.execution_method) : '';

  if (!hasChain) {
    failReasons.push('missing_chain');
  }

  if (hasChain && !contestConfig.allowed_chains.map((item) => item.toLowerCase()).includes(normalizedChain)) {
    failReasons.push('chain_not_allowed');
  }

  if (!hasExecutionMethod) {
    failReasons.push('missing_execution_method');
  }

  if (hasExecutionMethod && contestConfig.execution.require_agentic_wallet && normalizedExecutionMethod !== 'agentic_wallet') {
    failReasons.push('agentic_wallet_required');
  }

  if (typeof plan.signal_source !== 'string' || plan.signal_source.trim().length === 0) {
    failReasons.push('missing_signal_source');
  } else if (!usesRequiredPrimaryStack(contestConfig, plan)) {
    failReasons.push('onchainos_source_required');
  }

  if (!hasTradeSymbols) {
    failReasons.push('missing_trade_symbols');
  }

  if (hasChain && hasTradeSymbols && isNonCountingSwap(contestConfig, plan)) {
    failReasons.push('non_counting_swap');
  }

  if (!isBoolean(plan.multi_account)) {
    failReasons.push('missing_multi_account_flag');
  }

  if (!Number.isInteger(plan.registered_account_count) || plan.registered_account_count < 1) {
    failReasons.push('registered_account_count_invalid');
  }

  if (contestConfig.execution.single_registered_account_only && hasMultipleRegisteredAccounts(plan)) {
    failReasons.push('multi_account_forbidden');
  }

  if (!isBoolean(plan.wallet_exported)) {
    failReasons.push('missing_wallet_exported_flag');
  }

  if (contestConfig.execution.wallet_export_disqualifies && plan.wallet_exported) {
    failReasons.push('wallet_export_forbidden');
  }

  if (!isBoolean(plan.wash_trading)) {
    failReasons.push('missing_wash_trading_flag');
  }

  if (plan.wash_trading) {
    failReasons.push('wash_trading_forbidden');
  }

  if (!isBoolean(plan.circular_trading)) {
    failReasons.push('missing_circular_trading_flag');
  }

  if (plan.circular_trading) {
    failReasons.push('circular_trading_forbidden');
  }

  if (!isBoolean(plan.external_reverse_hedge)) {
    failReasons.push('missing_external_reverse_hedge_flag');
  }

  if (plan.external_reverse_hedge) {
    failReasons.push('external_reverse_hedge_forbidden');
  }

  if (!isFiniteNumber(plan.okx_risk_level)) {
    failReasons.push('missing_okx_risk_level');
  } else if (plan.okx_risk_level < 0) {
    failReasons.push('okx_risk_level_invalid');
  } else if (plan.okx_risk_level > riskConfig.max_okx_risk_level) {
    failReasons.push('risk_level_exceeded');
  }

  if (!isFiniteNumber(plan.slippage_bps)) {
    failReasons.push('missing_slippage_bps');
  } else if (plan.slippage_bps < 0) {
    failReasons.push('slippage_bps_invalid');
  } else if (plan.slippage_bps > riskConfig.max_slippage_bps) {
    failReasons.push('slippage_limit_exceeded');
  }

  if (!isFiniteNumber(plan.position_size_pct)) {
    failReasons.push('missing_position_size_pct');
  } else if (plan.position_size_pct < 0) {
    failReasons.push('position_size_pct_invalid');
  } else if (plan.position_size_pct > riskConfig.max_position_size_pct) {
    failReasons.push('position_size_limit_exceeded');
  }

  if (!isFiniteNumber(plan.daily_loss_pct)) {
    failReasons.push('missing_daily_loss_pct');
  } else if (plan.daily_loss_pct < 0) {
    failReasons.push('daily_loss_pct_invalid');
  } else if (plan.daily_loss_pct > riskConfig.max_daily_loss_pct) {
    failReasons.push('daily_loss_limit_exceeded');
  }

  if (!isFiniteNumber(plan.wallet_value_after_trade_usd)) {
    failReasons.push('missing_wallet_value_after_trade_usd');
  } else if (plan.wallet_value_after_trade_usd < 0) {
    failReasons.push('wallet_value_after_trade_usd_invalid');
  } else if (plan.wallet_value_after_trade_usd < riskConfig.minimum_wallet_reserve_usd) {
    failReasons.push('wallet_reserve_breached');
  }

  if (riskConfig.require_stop_loss && !hasValidRiskTrigger(plan.stop_loss)) {
    failReasons.push('missing_stop_loss');
  }

  if (riskConfig.require_take_profit && !hasValidRiskTrigger(plan.take_profit)) {
    failReasons.push('missing_take_profit');
  }

  if (riskConfig.require_tx_logging_plan && isMissingLoggingPlan(plan.tx_logging_plan)) {
    failReasons.push('missing_tx_logging_plan');
  }

  return {
    pass: failReasons.length === 0,
    fail_reasons: failReasons,
  };
}

export function checkCompliance(
  plan: TradePlan,
  contestConfig: ContestConfig,
  riskConfig: RiskConfig,
): ComplianceResult {
  return evaluateTradePlan(contestConfig, riskConfig, plan);
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(resolve(filePath), 'utf8');
  return JSON.parse(content) as T;
}

async function readPlanInput(input: string): Promise<TradePlan> {
  try {
    await access(resolve(input), constants.R_OK);
    return readJsonFile<TradePlan>(input);
  } catch {
    return JSON.parse(input) as TradePlan;
  }
}

async function main() {
  const contestPath = process.argv[2] ?? 'config/contest.config.json';
  const planInput = process.argv[3];
  const riskPath = process.argv[4] ?? 'config/risk.config.json';

  if (!planInput) {
    console.error('Usage: node --experimental-strip-types scripts/check_compliance.ts <contest-config> <plan-json-or-path> [risk-config]');
    process.exitCode = 1;
    return;
  }

  const contestConfig = await readJsonFile<ContestConfig>(contestPath);
  const riskConfig = await readJsonFile<RiskConfig>(riskPath);
  const configErrors = [
    ...validateContestConfig(contestConfig).errors,
    ...validateRiskConfig(riskConfig).errors,
  ];

  if (configErrors.length > 0) {
    console.log(JSON.stringify({ pass: false, fail_reasons: configErrors }, null, 2));
    process.exitCode = 1;
    return;
  }

  const plan = await readPlanInput(planInput);
  const result = checkCompliance(plan, contestConfig, riskConfig);
  console.log(JSON.stringify(result, null, 2));

  if (!result.pass) {
    process.exitCode = 1;
  }
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ pass: false, fail_reasons: ['runtime_error'], error: message }, null, 2));
    process.exitCode = 1;
  });
}
