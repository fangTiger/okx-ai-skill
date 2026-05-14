import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

type ContestConfig = {
  allowed_chains?: unknown;
  execution?: {
    require_agentic_wallet?: unknown;
    single_registered_account_only?: unknown;
    wallet_export_disqualifies?: unknown;
    primary_stack?: unknown;
  };
  tracked_metrics?: unknown;
  disallowed_swap_groups?: {
    stablecoins?: unknown;
    native_tokens?: {
      solana?: unknown;
      x_layer?: unknown;
    };
    wrapped_native_tokens?: {
      solana?: unknown;
      x_layer?: unknown;
    };
  };
};

type RiskConfig = {
  max_okx_risk_level?: unknown;
  max_slippage_bps?: unknown;
  minimum_wallet_reserve_usd?: unknown;
  require_stop_loss?: unknown;
  require_take_profit?: unknown;
  require_tx_logging_plan?: unknown;
  max_position_size_pct?: unknown;
  max_daily_loss_pct?: unknown;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim().length > 0);
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function validateContestConfig(config: ContestConfig): ValidationResult {
  const errors: string[] = [];
  const allowedChains = config.allowed_chains;
  const primaryStack = config.execution?.primary_stack;
  const trackedMetrics = config.tracked_metrics;

  if (!isStringArray(allowedChains) || !allowedChains.includes('solana') || !allowedChains.includes('x_layer')) {
    errors.push('allowed_chains_invalid');
  }

  if (!isBoolean(config.execution?.require_agentic_wallet)) {
    errors.push('execution_require_agentic_wallet_invalid');
  }

  if (!isBoolean(config.execution?.single_registered_account_only)) {
    errors.push('execution_single_registered_account_only_invalid');
  }

  if (!isBoolean(config.execution?.wallet_export_disqualifies)) {
    errors.push('execution_wallet_export_disqualifies_invalid');
  }

  if (!isStringArray(primaryStack) || !primaryStack.includes('OnchainOS') || !primaryStack.includes('Agentic Wallet')) {
    errors.push('execution_primary_stack_invalid');
  }

  if (
    !isStringArray(trackedMetrics) ||
    !trackedMetrics.includes('realized_pnl_usd') ||
    !trackedMetrics.includes('realized_pnl_pct') ||
    !trackedMetrics.includes('valid_trading_volume_usd') ||
    !trackedMetrics.includes('wallet_total_value_usd')
  ) {
    errors.push('tracked_metrics_invalid');
  }

  if (!isStringArray(config.disallowed_swap_groups?.stablecoins)) {
    errors.push('stablecoins_invalid');
  }

  if (!isStringArray(config.disallowed_swap_groups?.native_tokens?.solana)) {
    errors.push('native_tokens_solana_invalid');
  }

  if (!isStringArray(config.disallowed_swap_groups?.native_tokens?.x_layer)) {
    errors.push('native_tokens_x_layer_invalid');
  }

  if (!isStringArray(config.disallowed_swap_groups?.wrapped_native_tokens?.solana)) {
    errors.push('wrapped_native_tokens_solana_invalid');
  }

  if (!isStringArray(config.disallowed_swap_groups?.wrapped_native_tokens?.x_layer)) {
    errors.push('wrapped_native_tokens_x_layer_invalid');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateRiskConfig(config: RiskConfig): ValidationResult {
  const errors: string[] = [];

  if (!isPositiveNumber(config.max_okx_risk_level)) {
    errors.push('max_okx_risk_level_invalid');
  }

  if (!isPositiveNumber(config.max_slippage_bps)) {
    errors.push('max_slippage_bps_invalid');
  }

  if (!isPositiveNumber(config.minimum_wallet_reserve_usd)) {
    errors.push('minimum_wallet_reserve_usd_invalid');
  }

  if (!isBoolean(config.require_stop_loss)) {
    errors.push('require_stop_loss_invalid');
  }

  if (!isBoolean(config.require_take_profit)) {
    errors.push('require_take_profit_invalid');
  }

  if (!isBoolean(config.require_tx_logging_plan)) {
    errors.push('require_tx_logging_plan_invalid');
  }

  if (!isPositiveNumber(config.max_position_size_pct)) {
    errors.push('max_position_size_pct_invalid');
  }

  if (!isPositiveNumber(config.max_daily_loss_pct)) {
    errors.push('max_daily_loss_pct_invalid');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(resolve(filePath), 'utf8');
  return JSON.parse(content) as T;
}

async function main() {
  const contestPath = process.argv[2] ?? 'config/contest.config.json';
  const riskPath = process.argv[3] ?? 'config/risk.config.json';

  const contestConfig = await readJsonFile<ContestConfig>(contestPath);
  const riskConfig = await readJsonFile<RiskConfig>(riskPath);
  const contestResult = validateContestConfig(contestConfig);
  const riskResult = validateRiskConfig(riskConfig);

  const output = {
    contest_config: contestResult,
    risk_config: riskResult,
    valid: contestResult.valid && riskResult.valid,
  };

  console.log(JSON.stringify(output, null, 2));

  if (!output.valid) {
    process.exitCode = 1;
  }
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ valid: false, error: message }, null, 2));
    process.exitCode = 1;
  });
}
