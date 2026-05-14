# Submission Checklist

## Readiness

- [x] README 明确 Skill 目标和比赛约束。
- [x] Skill 文档明确以 OnchainOS / Agentic Wallet 为主要数据源和交易工具。
- [x] 策略文档描述完整的信号、执行与复盘框架。
- [x] 风控文档定义风险等级、滑点、准备金和停止条件。
- [x] 可观测性文档说明日志字段、日报输出和告警条件。
- [x] 本地脚本可离线校验配置、检查合规、汇总交易日志。
- [x] README 或 Skill 文档提供用户安全引导，明确不得导出钱包或粘贴 secrets。
- [x] `docs/submission_review.md` 已更新当前 pass/fail、缺失项、建议改进和 secret scan 结论。
- [x] `SUBMISSION_EVIDENCE.md` 已汇总提交范围、主工具链、风控、可观测性和本地验证证据。
- [x] `docs/judge_walkthrough.md` 已提供评审者运行路径。
- [x] `examples/` 已提供通过、拒绝和日报样例。

## Compliance

- [x] 没有真实 API key、邮箱、验证码、私钥、助记词、钱包地址。
- [x] 没有多账号、wash trading、circular trading、external reverse hedge 的实现。
- [x] 明确禁止稳定币、主网币、wrapped 主网币之间的非计分互换。
- [x] 明确要求单一 Agentic Wallet 账号且禁止导出钱包。
- [x] 缺少资格证据、OnchainOS 来源证据、仓位或日损字段时默认拒绝。

## Review Template

- Pass/Fail:
- Missing items:
- Recommended changes:
- Secret scan conclusion:
