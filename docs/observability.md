# Observability

## Logging Standard

离线日志文件为 `logs/trades.jsonl`，每一行至少记录：

- `timestamp`
- `chain`
- `token_symbol`
- `token_address`
- `side`
- `amount_usd`
- `valid_competition_volume`
- `risk_level`
- `score`
- `tx_hash`
- `realized_pnl_usd`
- `realized_pnl_pct`
- `wallet_value_usd_after_trade`
- `compliance_notes`

## Daily Metrics

- total valid volume
- realized PnL
- average realized PnL%
- number of trades
- invalid or suspicious entries
- wallet reserve warning

## Alert Conditions

- 任意交易缺失 tx hash。
- 任意交易不计入 valid competition volume。
- 钱包准备金低于阈值。
- 连续多笔交易风险等级触及上限。

## Operator Routine

1. 开盘前用 `validate_config.ts` 检查本地配置结构。
2. 每笔拟交易先跑 `check_compliance.ts`。
3. 每日收盘后跑 `summarize_trades.ts` 生成日报。
4. 将异常条目映射回策略、风控和执行环节，修复流程而不是扩大风险。
