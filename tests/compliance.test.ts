import test from 'node:test';
import assert from 'node:assert/strict';

import { checkCompliance, evaluateTradePlan } from '../scripts/check_compliance.ts';

const contestConfig = {
  allowed_chains: ['solana', 'x_layer'],
  execution: {
    require_agentic_wallet: true,
    single_registered_account_only: true,
    wallet_export_disqualifies: true,
    primary_stack: ['OnchainOS', 'Agentic Wallet'],
  },
  tracked_metrics: [
    'realized_pnl_usd',
    'realized_pnl_pct',
    'valid_trading_volume_usd',
    'wallet_total_value_usd',
  ],
  disallowed_swap_groups: {
    stablecoins: ['USDC', 'USDT'],
    native_tokens: {
      solana: ['SOL'],
      x_layer: ['OKB'],
    },
    wrapped_native_tokens: {
      solana: ['WSOL'],
      x_layer: ['WOKB'],
    },
  },
};

const riskConfig = {
  max_okx_risk_level: 2,
  max_slippage_bps: 150,
  minimum_wallet_reserve_usd: 250,
  require_stop_loss: true,
  require_take_profit: true,
  require_tx_logging_plan: true,
  max_position_size_pct: 12,
  max_daily_loss_pct: 4,
};

function basePlan() {
  return {
    chain: 'solana',
    execution_method: 'Agentic Wallet',
    from_symbol: 'TOKEN_A',
    to_symbol: 'TOKEN_B',
    multi_account: false,
    registered_account_count: 1,
    wallet_exported: false,
    wash_trading: false,
    circular_trading: false,
    external_reverse_hedge: false,
    signal_source: 'OnchainOS',
    okx_risk_level: 2,
    slippage_bps: 80,
    position_size_pct: 8,
    daily_loss_pct: 1,
    wallet_value_after_trade_usd: 800,
    stop_loss: { type: 'percent', value: 6 },
    take_profit: { type: 'rr', value: 1.8 },
    tx_logging_plan: 'log tx hash, score and rationale to local jsonl',
  };
}

test('passes a compliant Solana trade plan', () => {
  const result = checkCompliance(basePlan(), contestConfig, riskConfig);

  assert.equal(result.pass, true);
  assert.deepEqual(result.fail_reasons, []);
});

test('fails and returns explicit compliance reasons', () => {
  const result = evaluateTradePlan(contestConfig, riskConfig, {
    ...basePlan(),
    chain: 'ethereum',
    execution_method: 'manual_wallet',
    from_symbol: 'USDC',
    to_symbol: 'USDT',
    multi_account: true,
    registered_account_count: 2,
    wallet_exported: true,
    wash_trading: true,
    circular_trading: true,
    external_reverse_hedge: true,
    okx_risk_level: 4,
    slippage_bps: 250,
    position_size_pct: 20,
    daily_loss_pct: 8,
    wallet_value_after_trade_usd: 120,
    stop_loss: null,
    take_profit: null,
    tx_logging_plan: '',
  });

  assert.equal(result.pass, false);
  assert.deepEqual(result.fail_reasons, [
    'chain_not_allowed',
    'agentic_wallet_required',
    'non_counting_swap',
    'multi_account_forbidden',
    'wallet_export_forbidden',
    'wash_trading_forbidden',
    'circular_trading_forbidden',
    'external_reverse_hedge_forbidden',
    'risk_level_exceeded',
    'slippage_limit_exceeded',
    'position_size_limit_exceeded',
    'daily_loss_limit_exceeded',
    'wallet_reserve_breached',
    'missing_stop_loss',
    'missing_take_profit',
    'missing_tx_logging_plan',
  ]);
});

test('fails when wallet export disqualifies the plan', () => {
  const result = checkCompliance({
    ...basePlan(),
    wallet_exported: true,
  }, contestConfig, riskConfig);

  assert.equal(result.pass, false);
  assert.deepEqual(result.fail_reasons, ['wallet_export_forbidden']);
});

test('fails when more than one registered account is declared', () => {
  const result = checkCompliance({
    ...basePlan(),
    registered_account_count: 2,
  }, contestConfig, riskConfig);

  assert.equal(result.pass, false);
  assert.deepEqual(result.fail_reasons, ['multi_account_forbidden']);
});

test('fails when eligibility evidence is missing', () => {
  const partialPlan = {
    chain: 'solana',
    execution_method: 'Agentic Wallet',
    from_symbol: 'TOKEN_A',
    to_symbol: 'TOKEN_B',
    stop_loss: { type: 'percent', value: 6 },
    take_profit: { type: 'rr', value: 1.8 },
    tx_logging_plan: 'log locally',
  };

  const result = checkCompliance(partialPlan as ReturnType<typeof basePlan>, contestConfig, riskConfig);

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('missing_signal_source'), true);
  assert.equal(result.fail_reasons.includes('missing_multi_account_flag'), true);
  assert.equal(result.fail_reasons.includes('registered_account_count_invalid'), true);
  assert.equal(result.fail_reasons.includes('missing_wallet_exported_flag'), true);
  assert.equal(result.fail_reasons.includes('missing_position_size_pct'), true);
  assert.equal(result.fail_reasons.includes('missing_daily_loss_pct'), true);
});

test('fails instead of throwing when core trade identity is missing', () => {
  const result = checkCompliance({
    multi_account: false,
    registered_account_count: 1,
    wallet_exported: false,
    wash_trading: false,
    circular_trading: false,
    external_reverse_hedge: false,
    signal_source: 'OnchainOS',
    okx_risk_level: 2,
    slippage_bps: 80,
    position_size_pct: 8,
    daily_loss_pct: 1,
    wallet_value_after_trade_usd: 800,
    stop_loss: { type: 'percent', value: 6 },
    take_profit: { type: 'rr', value: 1.8 },
    tx_logging_plan: 'log locally',
  } as ReturnType<typeof basePlan>, contestConfig, riskConfig);

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('missing_chain'), true);
  assert.equal(result.fail_reasons.includes('missing_execution_method'), true);
  assert.equal(result.fail_reasons.includes('missing_trade_symbols'), true);
});

test('fails instead of throwing when only chain is missing', () => {
  const result = checkCompliance({
    execution_method: 'Agentic Wallet',
    from_symbol: 'USDC',
    to_symbol: 'USDT',
    multi_account: false,
    registered_account_count: 1,
    wallet_exported: false,
    wash_trading: false,
    circular_trading: false,
    external_reverse_hedge: false,
    signal_source: 'OnchainOS',
    okx_risk_level: 2,
    slippage_bps: 80,
    position_size_pct: 8,
    daily_loss_pct: 1,
    wallet_value_after_trade_usd: 800,
    stop_loss: { type: 'percent', value: 6 },
    take_profit: { type: 'rr', value: 1.8 },
    tx_logging_plan: 'log locally',
  } as ReturnType<typeof basePlan>, contestConfig, riskConfig);

  assert.equal(result.pass, false);
  assert.deepEqual(result.fail_reasons, ['missing_chain']);
});

test('fails when core risk fields are missing or not numeric', () => {
  const missingResult = checkCompliance({
    ...basePlan(),
    okx_risk_level: undefined as unknown as number,
    slippage_bps: undefined as unknown as number,
    wallet_value_after_trade_usd: undefined as unknown as number,
  }, contestConfig, riskConfig);

  assert.equal(missingResult.pass, false);
  assert.equal(missingResult.fail_reasons.includes('missing_okx_risk_level'), true);
  assert.equal(missingResult.fail_reasons.includes('missing_slippage_bps'), true);
  assert.equal(missingResult.fail_reasons.includes('missing_wallet_value_after_trade_usd'), true);

  const invalidTypeResult = checkCompliance({
    ...basePlan(),
    okx_risk_level: 'low' as unknown as number,
    slippage_bps: 'tight' as unknown as number,
    wallet_value_after_trade_usd: 'high' as unknown as number,
  }, contestConfig, riskConfig);

  assert.equal(invalidTypeResult.pass, false);
  assert.equal(invalidTypeResult.fail_reasons.includes('missing_okx_risk_level'), true);
  assert.equal(invalidTypeResult.fail_reasons.includes('missing_slippage_bps'), true);
  assert.equal(invalidTypeResult.fail_reasons.includes('missing_wallet_value_after_trade_usd'), true);
});

test('fails when numeric risk fields are negative', () => {
  const result = checkCompliance({
    ...basePlan(),
    okx_risk_level: -1,
    slippage_bps: -5,
    position_size_pct: -2,
    daily_loss_pct: -1,
    wallet_value_after_trade_usd: -100,
  }, contestConfig, riskConfig);

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('okx_risk_level_invalid'), true);
  assert.equal(result.fail_reasons.includes('slippage_bps_invalid'), true);
  assert.equal(result.fail_reasons.includes('position_size_pct_invalid'), true);
  assert.equal(result.fail_reasons.includes('daily_loss_pct_invalid'), true);
  assert.equal(result.fail_reasons.includes('wallet_value_after_trade_usd_invalid'), true);
});

test('fails when risk triggers are empty objects', () => {
  const result = checkCompliance({
    ...basePlan(),
    stop_loss: {},
    take_profit: {},
  }, contestConfig, riskConfig);

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('missing_stop_loss'), true);
  assert.equal(result.fail_reasons.includes('missing_take_profit'), true);
});

test('fails when signal source is not OnchainOS', () => {
  const result = checkCompliance({
    ...basePlan(),
    signal_source: 'other',
  }, contestConfig, riskConfig);

  assert.equal(result.pass, false);
  assert.deepEqual(result.fail_reasons, ['onchainos_source_required']);
});

test('fails when position or daily loss limits are exceeded', () => {
  const result = checkCompliance({
    ...basePlan(),
    position_size_pct: 13,
    daily_loss_pct: 5,
  }, contestConfig, riskConfig);

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('position_size_limit_exceeded'), true);
  assert.equal(result.fail_reasons.includes('daily_loss_limit_exceeded'), true);
});
