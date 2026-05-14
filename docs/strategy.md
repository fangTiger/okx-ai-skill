# Strategy Framework

## Objective

本策略文档服务于 Skill Quality Award 的“策略完整性”要求，目标是在不提供具体代币推荐的前提下，定义一套可解释、可审计、可收敛的研究与执行流程。

## Signal Layers

1. 一级信号：OnchainOS 上的链上活跃地址变化、成交密度、流动性增减、叙事热度。
2. 二级信号：Agentic Wallet 内账户净值、已实现盈亏、可用准备金和最近执行质量。
3. 三级过滤：风险等级、预计滑点、交易是否计入比赛 volume、是否满足日志与退出要求。

## Decision Flow

- 先判断交易是否属于比赛有效类型。
- 再判断当前链、执行方式和账户状态是否满足资格要求。
- 然后评估信号是否足够强，是否值得占用风险预算。
- 最后只允许输出三类结论：`candidate`、`watchlist`、`reject`。

## Execution Doctrine

- 候选计划必须附带进入理由、退出条件和失败条件。
- 所有拟交易在执行前都要经过 `check_compliance.ts`。
- 一旦出现不计分互换、准备金不足、风险等级超限或缺少日志计划，立即拒绝执行。

## Post-Trade Review

- 每日通过 `summarize_trades.ts` 生成日报。
- 对每笔异常成交记录原因，区分策略失效、执行偏差和合规问题。
- 次日只允许调整流程参数，不允许通过扩大风险或引入禁止行为追求收益。
