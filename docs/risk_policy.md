# Risk Policy

## Core Limits

- `max_okx_risk_level`: 2
- `max_slippage_bps`: 150
- `minimum_wallet_reserve_usd`: 250
- `max_position_size_pct`: 12
- `max_daily_loss_pct`: 4

## Mandatory Controls

- 每笔交易必须同时具备 stop loss、take profit 和 tx logging plan。
- 若交易后钱包净值低于准备金阈值，拒绝执行。
- 若 OnchainOS 或 Agentic Wallet 任一侧证据不足，拒绝执行。
- 只允许单一注册账号；任何多账号协同信号都视为硬失败。

## Non-Negotiable Prohibitions

- wash trading
- circular trading
- external reverse hedge
- stablecoin/native/wrapped native 之间的非计分互换
- 钱包导出后的继续参赛

## Escalation Rules

- 当日累计回撤接近 `max_daily_loss_pct` 时，切换到只观察模式。
- 连续出现异常日志、缺失 tx hash 或频繁 reserve warning 时，暂停交易并复盘。
- 若规则与实际活动页描述冲突，优先以官方规则为准并停止执行。
