import test from 'node:test';
import assert from 'node:assert/strict';

import { summarizeTrades } from '../scripts/summarize_trades.ts';
import { validateContestConfig, validateRiskConfig } from '../scripts/validate_config.ts';

test('validates contest and risk config structures', () => {
  const contestResult = validateContestConfig({
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
  });
  const riskResult = validateRiskConfig({
    max_okx_risk_level: 2,
    max_slippage_bps: 150,
    minimum_wallet_reserve_usd: 250,
    require_stop_loss: true,
    require_take_profit: true,
    require_tx_logging_plan: true,
    max_position_size_pct: 12,
    max_daily_loss_pct: 4,
  });

  assert.equal(contestResult.valid, true);
  assert.equal(riskResult.valid, true);
});

test('rejects incomplete contest execution config', () => {
  const contestResult = validateContestConfig({
    allowed_chains: ['solana', 'x_layer'],
    execution: {
      require_agentic_wallet: true,
      single_registered_account_only: 'yes',
      wallet_export_disqualifies: 1,
      primary_stack: ['Agentic Wallet'],
    },
    tracked_metrics: ['realized_pnl_usd'],
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
  });

  assert.equal(contestResult.valid, false);
  assert.deepEqual(contestResult.errors, [
    'execution_single_registered_account_only_invalid',
    'execution_wallet_export_disqualifies_invalid',
    'execution_primary_stack_invalid',
    'tracked_metrics_invalid',
  ]);
});

test('rejects incomplete risk config', () => {
  const riskResult = validateRiskConfig({
    max_okx_risk_level: 0,
    max_slippage_bps: -10,
  });

  assert.equal(riskResult.valid, false);
  assert.deepEqual(riskResult.errors, [
    'max_okx_risk_level_invalid',
    'max_slippage_bps_invalid',
    'minimum_wallet_reserve_usd_invalid',
    'require_stop_loss_invalid',
    'require_take_profit_invalid',
    'require_tx_logging_plan_invalid',
    'max_position_size_pct_invalid',
    'max_daily_loss_pct_invalid',
  ]);
});

test('summarizes trade logs and emits markdown report', () => {
  const result = summarizeTrades([
    {
      timestamp: '2026-05-13T09:00:00+08:00',
      chain: 'solana',
      token_symbol: 'TOKEN_A',
      token_address: 'REDACTED',
      side: 'buy',
      amount_usd: 300,
      valid_competition_volume: true,
      risk_level: '2',
      score: 0.7,
      tx_hash: 'hash-1',
      realized_pnl_usd: 12,
      realized_pnl_pct: 4,
      wallet_value_usd_after_trade: 780,
      compliance_notes: 'compliant',
    },
    {
      timestamp: '2026-05-13T13:00:00+08:00',
      chain: 'x_layer',
      token_symbol: 'TOKEN_C',
      token_address: 'REDACTED',
      side: 'sell',
      amount_usd: 150,
      valid_competition_volume: false,
      risk_level: '3',
      score: 0.4,
      tx_hash: '',
      realized_pnl_usd: -5,
      realized_pnl_pct: -3.3,
      wallet_value_usd_after_trade: 220,
      compliance_notes: 'reserve low',
    },
  ], { minimum_wallet_reserve_usd: 250 });

  assert.equal(result.total_valid_volume_usd, 300);
  assert.equal(result.realized_pnl_usd, 7);
  assert.equal(result.average_realized_pnl_pct, 0.35);
  assert.equal(result.number_of_trades, 2);
  assert.equal(result.invalid_or_suspicious_entries.length, 1);
  assert.equal(result.wallet_reserve_warning, true);
  assert.match(result.markdown_daily_report, /Total valid volume/);
});
