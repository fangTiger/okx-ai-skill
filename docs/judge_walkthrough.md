# Judge Walkthrough

This walkthrough is written for an automated or human reviewer evaluating the Skill Quality Award submission.

## 1. Confirm Package Scope

Use this directory as the submission root:

```text
skill-quality-award/agentic-contest-trader/
```

The package excludes root-project team strategies, live reports, runtime bindings, Codex/OpenSpec state, `.venv`, and IDE files. See `SUBMISSION_MANIFEST.md`.

## 2. Review The Skill

Open:

```text
skills/agentic-contest-trader/SKILL.md
```

Check that it covers:

- Purpose.
- Hard compliance rules.
- Competition eligibility targets.
- Allowed chains.
- Disallowed trade types.
- Pre-trade checklist.
- Signal model.
- Position sizing.
- Execution rules.
- Exit rules.
- Observability.
- Daily report.
- Stop conditions.

## 3. Review Award Criteria Mapping

Open:

```text
QUALITY_AWARD_RUBRIC.md
```

This maps the submission to:

- Strategy completeness.
- Risk control framework.
- Execution reliability.
- User safety onboarding.
- Observability.

## 4. Run Local Verification

From this directory:

```bash
npm test
npm run validate:config
```

Expected result:

- `npm test` passes 24 tests.
- `validate:config` returns `valid: true`.

## 5. Run Example Compliance Checks

Compliant plan:

```bash
node --experimental-strip-types scripts/check_compliance.ts config/contest.config.json examples/compliant_trade_plan.json config/risk.config.json
```

Expected:

```json
{
  "pass": true,
  "fail_reasons": []
}
```

Wallet export rejection:

```bash
node --experimental-strip-types scripts/check_compliance.ts config/contest.config.json examples/rejected_wallet_export_plan.json config/risk.config.json
```

Expected:

```json
{
  "pass": false,
  "fail_reasons": ["wallet_export_forbidden"]
}
```

Non-counting swap rejection:

```bash
node --experimental-strip-types scripts/check_compliance.ts config/contest.config.json examples/rejected_non_counting_swap_plan.json config/risk.config.json
```

Expected:

```json
{
  "pass": false,
  "fail_reasons": ["non_counting_swap"]
}
```

## 6. Review Observability Output

Sample local log:

```text
examples/trades.sample.jsonl
```

Generate a local summary:

```bash
node --experimental-strip-types scripts/summarize_trades.ts examples/trades.sample.jsonl config/risk.config.json
```

Expected fields:

- `total_valid_volume_usd`
- `realized_pnl_usd`
- `average_realized_pnl_pct`
- `number_of_trades`
- `invalid_or_suspicious_entries`
- `wallet_reserve_warning`
- `markdown_daily_report`

A readable example report is included at:

```text
examples/daily_report.md
```

## 7. Safety Review

The package should not contain:

- Real email addresses.
- Verification codes.
- API keys.
- Private keys.
- Seed phrases.
- Real wallet addresses.
- Live transaction logs.

The package should also not implement:

- Multi-account coordination.
- Wash trading.
- Circular trading.
- External reverse hedging.
- Real wallet connection or automatic live execution.

## 8. Live Use Boundary

This package is ready for static Skill Quality Award review and local offline verification. It is not a live execution proof. Real Agentic Wallet registration, funding, dry-run, and any small live trade must be performed manually in the official Agent environment.
