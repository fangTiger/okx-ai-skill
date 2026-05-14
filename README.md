# OKX Agentic Contest Trader Skill

这是一个干净的 Skill Quality Award 提交包，只包含 OKX Agentic Wallet Trading Competition 所需的 Skill、配置、离线校验脚本、测试和提交审查材料。

本目录刻意不包含根项目里的 team strategy、dry-run/live 报告、Codex/OpenSpec 运行态、`.venv`、IDE 文件或任何真实钱包材料。

## 目标

- 以单一 Agentic Wallet 账号合规参与比赛。
- 使用 OnchainOS / Agentic Wallet 作为主要数据源和交易工具。
- 仅覆盖 Solana 与 X Layer。
- 跟踪 realized PnL、realized PnL%、valid trading volume、wallet total value。
- 提供离线合规检查、配置校验和交易日志汇总。
- 不连接真实钱包，不读取 secrets，不执行自动实盘交易。

## 目录

- `skills/agentic-contest-trader/SKILL.md`：带 YAML 元数据、触发描述、输出格式和示例的 Skill 主文件。
- `prompts/agentic_registration_prompt.md`：官方注册提示词与安全提醒。
- `config/contest.config.json`：比赛边界和禁止行为配置。
- `config/risk.config.json`：风险阈值与执行必填项。
- `scripts/check_compliance.ts`：拟交易计划合规检查。
- `scripts/validate_config.ts`：配置结构校验。
- `scripts/summarize_trades.ts`：离线交易日志汇总和 Markdown 日报。
- `tests/*.test.ts`：Node 原生测试。
- `examples/`：合规计划、违规计划和日报输出样例。
- `docs/`：策略、风控、可观测性、提交清单与审查报告。
- `SUBMISSION_EVIDENCE.md`：提交包内容、验证路径和安全边界的证据索引。
- `SUBMISSION_MANIFEST.md`：提交包清单和排除项。

## 本地验证

```bash
npm test
npm run validate:config
node --experimental-strip-types scripts/check_compliance.ts config/contest.config.json examples/compliant_trade_plan.json config/risk.config.json
node --experimental-strip-types scripts/summarize_trades.ts examples/trades.sample.jsonl config/risk.config.json
```

合规检查示例：

```bash
node --experimental-strip-types scripts/check_compliance.ts config/contest.config.json examples/compliant_trade_plan.json config/risk.config.json
```

## 安全边界

- 不包含 API key、邮箱、验证码、私钥、助记词或真实钱包地址。
- 不实现多账号、wash trading、circular trading、外部反向对冲或真实钱包连接。
- 不提供具体代币买卖建议；示例 token 名称均为中性占位。
- 真实注册、充值、交易确认必须只在官方 Agentic Wallet / OnchainOS 环境里人工执行。

## 给评审者的快速路径

1. 阅读 `SUBMISSION_EVIDENCE.md`。
2. 阅读 `docs/judge_walkthrough.md`。
3. 运行 `npm test` 和 `npm run validate:config`。
4. 用 `examples/` 下的 JSON 文件验证通过与拒绝路径。
5. 检查 `SUBMISSION_MANIFEST.md`，确认没有根项目污染物进入提交包。
