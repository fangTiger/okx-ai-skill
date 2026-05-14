# Skill Quality Award Rubric

This document maps the submission package to the Skill Quality Award criteria listed on the OKX Agentic Wallet Trading Competition page: strategy completeness, risk control framework, execution reliability, user safety onboarding, and observability.

## 1. Strategy Completeness

### Evidence

- `skills/agentic-contest-trader/SKILL.md`
- `docs/strategy.md`
- `config/contest.config.json`

### What The Skill Provides

- A complete pre-trade decision path: chain eligibility, Agentic Wallet execution, valid trade type, signal quality, risk budget, and logging readiness.
- A signal model based on OnchainOS-observable market structure and Agentic Wallet account state.
- Position sizing and exit rules tied to realized PnL, wallet reserve, slippage, and signal invalidation.

### What It Intentionally Avoids

- No specific token buy/sell recommendations.
- No automated live execution from this repository.
- No strategy designed around volume inflation or artificial PnL.

## 2. Risk Control Framework

### Evidence

- `config/risk.config.json`
- `docs/risk_policy.md`
- `scripts/check_compliance.ts`
- `tests/compliance.test.ts`
- `tests/invalid_trade_filter.test.ts`
- `tests/risk_policy.test.ts`

### Controls

- Rejects chains outside Solana and X Layer.
- Requires Agentic Wallet execution.
- Rejects stablecoin, native token, and wrapped native token non-counting swaps.
- Rejects multi-account operation and `registered_account_count > 1`.
- Rejects wallet export when `wallet_export_disqualifies=true`.
- Rejects wash trading, circular trading, and external reverse hedging flags.
- Rejects high OKX risk level, excessive slippage, wallet reserve breach, and missing stop loss / take profit / tx logging plan.

## 3. Execution Reliability

### Evidence

- `scripts/validate_config.ts`
- `scripts/check_compliance.ts`
- `scripts/summarize_trades.ts`
- `examples/compliant_trade_plan.json`
- `examples/rejected_wallet_export_plan.json`
- `examples/rejected_non_counting_swap_plan.json`
- `examples/trades.sample.jsonl`

### Reliability Pattern

1. Validate configuration before trading.
2. Run compliance checks before each planned trade.
3. Reject uncertain or incomplete plans by default.
4. Log each completed transaction locally for daily review.
5. Summarize local logs without reading secrets or contacting external services.

## 4. User Safety Onboarding

### Evidence

- `README.md`
- `prompts/agentic_registration_prompt.md`
- `docs/judge_walkthrough.md`
- `docs/submission_review.md`

### Safety Guarantees

- The package tells users to install and use OnchainOS / Agentic Wallet in the official Agent environment.
- The official registration prompt is isolated in `prompts/agentic_registration_prompt.md`.
- The package explicitly warns against entering email, verification codes, private keys, seed phrases, wallet addresses, or API keys into local files.
- The package stops if wallet export or account eligibility is uncertain.

## 5. Observability

### Evidence

- `docs/observability.md`
- `scripts/summarize_trades.ts`
- `examples/daily_report.md`
- `examples/trades.sample.jsonl`

### Metrics

- Total valid volume.
- Realized PnL.
- Average realized PnL%.
- Number of trades.
- Invalid or suspicious entries.
- Wallet reserve warning.
- Markdown daily report for human review.

## Score-Oriented Summary

This package is optimized for AI and manual review clarity:

- It is self-contained in this directory.
- It has runnable tests and examples.
- It contains no live wallet connection.
- It documents why prohibited behavior is rejected.
- It includes a manifest that separates submission files from root-project strategy pollution.
