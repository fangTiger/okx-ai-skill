# Agentic Contest Trader

## Purpose

以单一 Agentic Wallet 注册账号为前提，为 OKX Agentic Wallet Trading Competition 提供合规交易决策框架、执行前核查、风险控制、可观测性和日报模板。主要数据源和交易工具必须是 OnchainOS 与 Agentic Wallet。

## Hard Compliance Rules

- 只允许一个已注册的 Agentic Wallet 账号。
- 不得导出钱包；一旦导出立即停止参与并视为资格失效。
- 只能在 Solana 与 X Layer 上通过 Agentic Wallet 发起 token trades。
- 禁止多账号协同、wash trading、circular trading、外部反向对冲。
- 稳定币、主网币、wrapped 主网币之间的互换不计入有效 volume 与 PnL，不得作为比赛策略核心。
- 不暴露私钥、助记词、验证码、邮箱、钱包地址或任何 secrets。

## Competition Eligibility Targets

- 比赛时间窗口：2026-05-07 18:00 至 2026-05-21 18:00（UTC+8）。
- 注册提示词：`Register me for the Agentic Trading Contest`。
- 重点指标：realized PnL、realized PnL%、valid trading volume、wallet total value。
- 提交目标：展示策略完整性、风险控制框架、执行可靠性、用户安全 onboarding、可观测性。

## Allowed Chains

- `solana`
- `x_layer`

## Disallowed Trade Types

- 稳定币对稳定币互换。
- 主网币对稳定币互换。
- 主网币对 wrapped 主网币互换。
- wrapped 主网币对稳定币互换。
- 任何被标记为 wash trading、circular trading、multi-account、external reverse hedge 的交易。

## Pre-Trade Checklist

1. 当前计划是否发生在 Solana 或 X Layer。
2. 执行路径是否明确为 Agentic Wallet。
3. 拟交易是否避开稳定币、主网币、wrapped 主网币之间的非计分互换。
4. OKX 风险等级是否不高于本地阈值。
5. 预计滑点、仓位和成交后钱包准备金是否在阈值内。
6. 是否补齐 stop loss、take profit 和 tx logging plan。
7. 是否记录交易理由、预期退出条件和失败回滚条件。

## Signal Model

- 使用 OnchainOS 提供的链上活跃度、流动性变化、异常成交分布和叙事热度作为一级信号。
- 使用 Agentic Wallet 可见的账户状态、已实现收益和仓位占用作为二级约束。
- 只接受“信号强度、流动性、执行可行性、风险预算”四项同时满足的计划。
- 不输出具体代币推荐，只输出是否进入候选池以及需要的证据。

## Position Sizing

- 单笔风险敞口受本地 `max_position_size_pct` 和 `minimum_wallet_reserve_usd` 限制。
- 当 realized PnL 回撤扩大或当天损失接近 `max_daily_loss_pct` 时，自动降低名义仓位。
- 若链上深度不足以在滑点阈值内完成交易，则缩量或放弃。

## Execution Rules

- 所有交易前先运行本地合规检查。
- 仅在 Agentic Wallet 内确认执行，不提供自动下单或真实钱包连接。
- 记录 tx hash、时间、链、信号摘要、分数、风险等级和合规注记到本地日志。
- 若任一规则无法确认，默认不交易。

## Exit Rules

- 每笔交易必须预设 stop loss 与 take profit。
- 当信号失效、流动性恶化、滑点上升或钱包准备金跌破阈值时，停止新开仓并评估退出。
- 若出现规则争议或资格风险，优先保护参赛资格而非追求成交。

## Observability

- 本地记录 realized PnL、realized PnL%、valid trading volume、wallet total value。
- 每日汇总 invalid 或 suspicious entries，尤其是非计分互换、缺失 tx hash、低准备金和高风险等级。
- 输出 Markdown 日报，保留策略说明、执行偏差和第二天改进点。

## Daily Report

- 日期与时区。
- valid trading volume。
- realized PnL / realized PnL%。
- 交易笔数。
- invalid/suspicious 事件。
- 钱包准备金告警。
- 次日动作：继续观察、降低风险或暂停。

## Stop Conditions

- 检测到多账号、wash trading、circular trading、外部反向对冲。
- 发现钱包已导出或资格存在争议。
- OKX 风险等级、滑点或准备金超阈值。
- 缺失 stop loss、take profit 或 tx logging plan。
- 无法通过 OnchainOS / Agentic Wallet 获取足够执行证据。
