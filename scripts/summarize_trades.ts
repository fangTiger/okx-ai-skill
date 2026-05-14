import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type TradeLogEntry = {
  timestamp: string;
  chain: string;
  token_symbol: string;
  token_address: string;
  side: string;
  amount_usd: number;
  valid_competition_volume: boolean;
  risk_level: string | number;
  score: number;
  tx_hash: string;
  realized_pnl_usd: number;
  realized_pnl_pct: number;
  wallet_value_usd_after_trade: number;
  compliance_notes: string;
};

export type SuspiciousEntry = {
  index: number;
  reasons: string[];
  timestamp: string;
  token_symbol: string;
};

export type TradeSummary = {
  total_valid_volume_usd: number;
  realized_pnl_usd: number;
  average_realized_pnl_pct: number;
  number_of_trades: number;
  invalid_or_suspicious_entries: SuspiciousEntry[];
  wallet_reserve_warning: boolean;
  markdown_daily_report: string;
};

export type SummarizeTradesOptions = {
  minimum_wallet_reserve_usd?: number;
};

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function resolveMinimumWalletReserveUsd(options?: number | SummarizeTradesOptions): number {
  if (typeof options === 'number') {
    return options;
  }

  if (typeof options?.minimum_wallet_reserve_usd === 'number') {
    return options.minimum_wallet_reserve_usd;
  }

  return 0;
}

function buildMarkdownReport(summary: TradeSummary): string {
  const reserveLine = summary.wallet_reserve_warning ? 'Reserve warning: YES' : 'Reserve warning: NO';
  const suspiciousCount = summary.invalid_or_suspicious_entries.length;

  return [
    '# Agentic Contest Daily Report',
    '',
    `- Total valid volume: $${summary.total_valid_volume_usd.toFixed(2)}`,
    `- Realized PnL: $${summary.realized_pnl_usd.toFixed(2)}`,
    `- Average realized PnL%: ${summary.average_realized_pnl_pct.toFixed(2)}%`,
    `- Number of trades: ${summary.number_of_trades}`,
    `- Invalid or suspicious entries: ${suspiciousCount}`,
    `- ${reserveLine}`,
  ].join('\n');
}

export function summarizeTrades(
  entries: TradeLogEntry[],
  options?: number | SummarizeTradesOptions,
): TradeSummary {
  const minimumWalletReserveUsd = resolveMinimumWalletReserveUsd(options);
  const totalValidVolume = entries.reduce((sum, entry) => {
    return sum + (entry.valid_competition_volume ? entry.amount_usd : 0);
  }, 0);

  const realizedPnl = entries.reduce((sum, entry) => sum + entry.realized_pnl_usd, 0);
  const averageRealizedPnlPct = entries.length === 0
    ? 0
    : roundToTwo(entries.reduce((sum, entry) => sum + entry.realized_pnl_pct, 0) / entries.length);

  const invalidOrSuspiciousEntries = entries.reduce<SuspiciousEntry[]>((acc, entry, index) => {
    const reasons: string[] = [];

    if (!entry.valid_competition_volume) {
      reasons.push('invalid_competition_volume');
    }

    if (typeof entry.tx_hash !== 'string' || entry.tx_hash.trim().length === 0) {
      reasons.push('missing_tx_hash');
    }

    if (entry.wallet_value_usd_after_trade < minimumWalletReserveUsd) {
      reasons.push('wallet_reserve_warning');
    }

    if (reasons.length > 0) {
      acc.push({
        index,
        reasons,
        timestamp: entry.timestamp,
        token_symbol: entry.token_symbol,
      });
    }

    return acc;
  }, []);

  const walletReserveWarning = entries.some((entry) => entry.wallet_value_usd_after_trade < minimumWalletReserveUsd);

  const summary: TradeSummary = {
    total_valid_volume_usd: roundToTwo(totalValidVolume),
    realized_pnl_usd: roundToTwo(realizedPnl),
    average_realized_pnl_pct: averageRealizedPnlPct,
    number_of_trades: entries.length,
    invalid_or_suspicious_entries: invalidOrSuspiciousEntries,
    wallet_reserve_warning: walletReserveWarning,
    markdown_daily_report: '',
  };

  summary.markdown_daily_report = buildMarkdownReport(summary);
  return summary;
}

async function readJsonLines(filePath: string): Promise<TradeLogEntry[]> {
  const content = await readFile(resolve(filePath), 'utf8');
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as TradeLogEntry);
}

async function readMinimumReserveUsd(riskConfigPath: string): Promise<number> {
  const content = await readFile(resolve(riskConfigPath), 'utf8');
  const parsed = JSON.parse(content) as { minimum_wallet_reserve_usd?: number };
  return typeof parsed.minimum_wallet_reserve_usd === 'number' ? parsed.minimum_wallet_reserve_usd : 0;
}

async function main() {
  const logPath = process.argv[2] ?? 'logs/trades.jsonl';
  const riskConfigPath = process.argv[3] ?? 'config/risk.config.json';
  const entries = await readJsonLines(logPath);
  const minimumReserveUsd = await readMinimumReserveUsd(riskConfigPath);
  const summary = summarizeTrades(entries, minimumReserveUsd);
  console.log(JSON.stringify(summary, null, 2));
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ error: message }, null, 2));
    process.exitCode = 1;
  });
}
