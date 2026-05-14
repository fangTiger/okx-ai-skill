import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateTradePlan } from '../scripts/check_compliance.ts';

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
    execution_method: 'agentic_wallet',
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
    slippage_bps: 100,
    position_size_pct: 8,
    daily_loss_pct: 1,
    wallet_value_after_trade_usd: 1200,
    stop_loss: { type: 'percent', value: 5 },
    take_profit: { type: 'percent', value: 9 },
    tx_logging_plan: 'persist tx hash and compliance notes locally',
  };
}

test('rejects SOL to USDC', () => {
  const result = evaluateTradePlan(contestConfig, riskConfig, {
    ...basePlan(),
    from_symbol: 'SOL',
    to_symbol: 'USDC',
  });

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('non_counting_swap'), true);
});

test('rejects SOL to WSOL', () => {
  const result = evaluateTradePlan(contestConfig, riskConfig, {
    ...basePlan(),
    from_symbol: 'SOL',
    to_symbol: 'WSOL',
  });

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('non_counting_swap'), true);
});

test('rejects USDC to USDT', () => {
  const result = evaluateTradePlan(contestConfig, riskConfig, {
    ...basePlan(),
    from_symbol: 'USDC',
    to_symbol: 'USDT',
  });

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('non_counting_swap'), true);
});

test('rejects X Layer native token to stablecoin', () => {
  const result = evaluateTradePlan(contestConfig, riskConfig, {
    ...basePlan(),
    chain: 'x_layer',
    from_symbol: 'OKB',
    to_symbol: 'USDC',
  });

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('non_counting_swap'), true);
});

test('allows non-stable token to token trade under compliant conditions', () => {
  const result = evaluateTradePlan(contestConfig, riskConfig, {
    ...basePlan(),
    from_symbol: 'TOKEN_B',
    to_symbol: 'TOKEN_A',
  });

  assert.equal(result.pass, true);
});

test('rejects risk level at or above 3', () => {
  const result = evaluateTradePlan(contestConfig, riskConfig, {
    ...basePlan(),
    okx_risk_level: 3,
  });

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('risk_level_exceeded'), true);
});

test('rejects slippage above configured limit', () => {
  const result = evaluateTradePlan(contestConfig, riskConfig, {
    ...basePlan(),
    slippage_bps: 200,
  });

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('slippage_limit_exceeded'), true);
});

test('rejects wallet value below reserve', () => {
  const result = evaluateTradePlan(contestConfig, riskConfig, {
    ...basePlan(),
    wallet_value_after_trade_usd: 200,
  });

  assert.equal(result.pass, false);
  assert.equal(result.fail_reasons.includes('wallet_reserve_breached'), true);
});
