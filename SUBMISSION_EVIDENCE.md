# Submission Evidence

This file summarizes what is included in the package and how a reviewer can verify it. It is not a copy of any external scoring rubric.

## Package Scope

- The package is self-contained under `skill-quality-award/agentic-contest-trader/`.
- Root-project strategy files, dry-run/live reports, Codex/OpenSpec state, virtualenvs, IDE files, and wallet materials are excluded.
- `SUBMISSION_MANIFEST.md` lists the exact files intended for submission.

## Primary Stack

- `skills/agentic-contest-trader/SKILL.md` states that OnchainOS and Agentic Wallet are the primary information source and trading tool.
- `config/contest.config.json` declares `["OnchainOS", "Agentic Wallet"]` as the primary stack.
- `scripts/check_compliance.ts` rejects a plan when `signal_source` is not `OnchainOS`.
- `tests/compliance.test.ts` covers non-OnchainOS rejection.

## Skill Shape

- `SKILL.md` starts with YAML frontmatter containing `name` and `description`.
- `SKILL.md` lists trigger phrases and non-trigger guardrails.
- `SKILL.md` defines required inputs, workflow steps, output format, and proceed/reject examples.
- `tests/skill_quality.test.ts` checks these structural properties.

## Strategy And Risk Evidence

- `docs/strategy.md` describes the OnchainOS signal path and Agentic Wallet execution boundary.
- `docs/risk_policy.md` defines risk limits, stop conditions, and fail-closed behavior.
- `scripts/check_compliance.ts` rejects non-eligible chains, non-counting swaps, wallet export, multi-account use, wash trading, circular trading, external hedging, missing risk fields, invalid numeric domains, and incomplete exit/logging plans.
- `tests/*.test.ts` covers compliant and rejected trade plans.

## Observability Evidence

- `scripts/summarize_trades.ts` summarizes local JSONL logs.
- `examples/trades.sample.jsonl` and `examples/daily_report.md` show redacted sample inputs and outputs.
- No real wallet address, private key, seed phrase, email, verification code, API key, or live transaction log is required.

## Local Verification

```bash
npm test
npm run validate:config
node --experimental-strip-types scripts/check_compliance.ts config/contest.config.json examples/compliant_trade_plan.json config/risk.config.json
node --experimental-strip-types scripts/summarize_trades.ts examples/trades.sample.jsonl config/risk.config.json
```
