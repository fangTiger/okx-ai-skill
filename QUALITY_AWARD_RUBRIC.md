# Skill Quality Award Rubric

This document maps the package to the OKX Agentic Wallet Trading Competition Skill Quality Award scoring model: 50% AI score and 50% human score.

## Hard Requirement

Skill must use onchainOS / OnchainOS as the primary information source and trading tool.

Status: `PASS`

Evidence:

- `skills/agentic-contest-trader/SKILL.md` says the primary information source and trading tool must be OnchainOS and Agentic Wallet.
- `config/contest.config.json` sets `execution.primary_stack` to `["OnchainOS", "Agentic Wallet"]`.
- `scripts/check_compliance.ts` rejects plans whose `signal_source` is not `OnchainOS`.
- `tests/compliance.test.ts` covers non-OnchainOS rejection.

## AI Score Criteria

### 1. Structure And Metadata (25 pts)

Status: `PASS`

Evidence:

- `skills/agentic-contest-trader/SKILL.md` starts with YAML frontmatter containing only `name` and `description`.
- Directory organization is narrow and reviewable: `skills/`, `config/`, `scripts/`, `tests/`, `examples/`, `docs/`, `prompts/`, `logs/`.
- `SUBMISSION_MANIFEST.md` lists the exact submission package and excludes root-project strategy pollution.
- `tests/skill_quality.test.ts` checks frontmatter, description length, and SKILL.md size control.

### 2. Trigger Description Quality (25 pts)

Status: `PASS`

Evidence:

- YAML `description` starts with `Use when` and includes common user intents: OKX Agentic Wallet Trading Competition, Agentic Contest, OnchainOS signal checks, Solana / X Layer compliance, pre-trade risk review, daily reports, and Skill Quality Award review.
- `SKILL.md` has explicit `Trigger Phrases` in English and Chinese.
- `SKILL.md` has `Non-Trigger Guardrails` for unrelated market chat, generic price lookup, wallet export, multi-account behavior, volume farming, and legal/tax/financial-advice requests.
- `tests/skill_quality.test.ts` checks trigger and guardrail coverage.

### 3. Instruction Quality (30 pts)

Status: `PASS`

Evidence:

- `SKILL.md` explains the reason behind each core step: OnchainOS-first evidence, Agentic Wallet eligibility, allowed-chain filtering, fail-closed compliance checks, risk sizing, and local logging.
- `SKILL.md` defines required inputs and tells the agent to reject missing or unverifiable plans instead of guessing.
- `SKILL.md` defines a compact output format with `decision`, `chain`, `onchainos_evidence`, `eligibility_checks`, `risk_checks`, `execution_note`, `logging_plan`, and `next_review`.
- `SKILL.md` includes proceed and reject examples.
- `scripts/check_compliance.ts` provides exact reason codes for rejected plans.

### 4. Execution Efficiency And Performance (20 pts)

Status: `PASS`

Evidence:

- Repeated logic is scripted: `validate_config.ts`, `check_compliance.ts`, and `summarize_trades.ts`.
- `package.json` exposes reusable commands: `npm test`, `npm run validate:config`, `npm run check:compliance`, and `npm run summarize`.
- Error handling is fail-closed: missing fields, invalid numeric domains, non-counting swaps, wallet export, multi-account use, wash trading, circular trading, and external hedging return explicit fail reasons.
- The package is local and offline; it does not call external HTTP services or connect to a real wallet.

## Human Score Criteria

### 1. Strategy Executability

Status: `PASS`

Evidence:

- `docs/strategy.md` explains the strategy sequence from OnchainOS signal evidence to Agentic Wallet manual confirmation.
- `docs/risk_policy.md` defines risk limits and stop conditions.
- `examples/compliant_trade_plan.json` can be checked locally before manual execution.
- `docs/judge_walkthrough.md` gives a short runbook for human reviewers.

### 2. Strategy Result Effectiveness

Status: `PASS WITH LIVE-USE CAVEAT`

Evidence:

- The strategy optimizes for realized PnL, realized PnL%, valid trading volume, and wallet total value.
- `scripts/summarize_trades.ts` summarizes valid volume, realized PnL, average realized PnL%, suspicious entries, and reserve warnings.
- `examples/daily_report.md` shows the expected daily review artifact.

Live-use caveat:

- This package is a static Skill Quality Award submission. It does not include real wallet balance, real transaction hashes, dry-run proof, or live trade proof.

### 3. Strategy Theme Innovation

Status: `PASS`

Evidence:

- The theme is an OnchainOS-first contest trader that treats compliance and eligibility as first-class strategy gates instead of after-the-fact reporting.
- It separates signal quality, execution eligibility, risk budget, and observability into independently testable artifacts.
- It avoids risky leaderboard gaming patterns such as volume farming, multi-account behavior, and non-counting swaps.

## Score-Oriented Summary

This package is optimized for both automated and human review:

- AI can discover the skill through YAML metadata and trigger phrases.
- AI can avoid misuse through explicit non-trigger guardrails.
- Human reviewers can run local scripts and examples without secrets or wallet access.
- Compliance gates are executable and covered by tests.
- OnchainOS / Agentic Wallet is the stated and tested primary stack.
