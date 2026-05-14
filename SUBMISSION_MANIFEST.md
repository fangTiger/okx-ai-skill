# Submission Manifest

## Included

- `skills/agentic-contest-trader/SKILL.md`
- `prompts/agentic_registration_prompt.md`
- `config/contest.config.json`
- `config/risk.config.json`
- `scripts/check_compliance.ts`
- `scripts/validate_config.ts`
- `scripts/summarize_trades.ts`
- `tests/compliance.test.ts`
- `tests/invalid_trade_filter.test.ts`
- `tests/risk_policy.test.ts`
- `tests/skill_quality.test.ts`
- `examples/compliant_trade_plan.json`
- `examples/rejected_wallet_export_plan.json`
- `examples/rejected_non_counting_swap_plan.json`
- `examples/trades.sample.jsonl`
- `examples/daily_report.md`
- `docs/strategy.md`
- `docs/risk_policy.md`
- `docs/observability.md`
- `docs/judge_walkthrough.md`
- `docs/submission_checklist.md`
- `docs/submission_review.md`
- `logs/.gitkeep`
- `.gitignore`
- `README.md`
- `SUBMISSION_EVIDENCE.md`
- `SUBMISSION_MANIFEST.md`
- `package.json`

## Excluded From Submission

- Root-level team strategy profiles and team prompts.
- Root-level dry-run or live reports.
- Root-level Codex/OpenSpec/session-state files.
- `.venv`, `.idea`, `.git`, `.agents`, runtime bindings, and local cache files.
- Any real wallet logs, addresses, email addresses, verification codes, private keys, seed phrases, API keys, or screenshots.
- Any root-level team profiles, team prompts, or strategy reports.

## Packaging Note

Submit this directory as the Skill Quality Award package root:

```text
skill-quality-award/agentic-contest-trader/
```

If a GitHub link is required, create a repository whose root is this directory or publish only this directory as the submitted package.
