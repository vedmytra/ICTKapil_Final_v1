import Papa from "papaparse";
import { NewTrade, Trade, TradeDirection } from "@/types/trade";

const EXPORT_COLUMNS = [
  "symbol",
  "direction",
  "status",
  "entryPrice",
  "exitPrice",
  "stopLoss",
  "takeProfit",
  "lotSize",
  "pnl",
  "pnlPercent",
  "fees",
  "entryDate",
  "exitDate",
  "strategy",
  "tags",
  "notes",
  "emotion",
] as const;

export function exportTradesToCSV(trades: Trade[]): string {
  const rows = trades.map((t) => ({
    symbol: t.symbol,
    direction: t.direction,
    status: t.status,
    entryPrice: t.entryPrice,
    exitPrice: t.exitPrice ?? "",
    stopLoss: t.stopLoss ?? "",
    takeProfit: t.takeProfit ?? "",
    lotSize: t.lotSize,
    pnl: t.pnl ?? "",
    pnlPercent: t.pnlPercent ?? "",
    fees: t.fees ?? "",
    entryDate: t.entryDate,
    exitDate: t.exitDate ?? "",
    strategy: t.strategy ?? "",
    tags: t.tags.join("|"),
    notes: (t.notes ?? "").replace(/\n/g, " "),
    emotion: t.emotion ?? "",
  }));
  return Papa.unparse({ fields: [...EXPORT_COLUMNS], data: rows });
}

export function downloadCSV(csv: string, filename = "trades-export.csv") {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ParsedRow {
  [key: string]: string;
}

export interface CSVImportResult {
  valid: NewTrade[];
  errors: { row: number; message: string }[];
}

const REQUIRED_FIELDS = ["symbol", "direction", "entryPrice", "lotSize", "entryDate"];

export function parseTradesCSV(file: File): Promise<CSVImportResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid: NewTrade[] = [];
        const errors: { row: number; message: string }[] = [];

        results.data.forEach((row, idx) => {
          const missing = REQUIRED_FIELDS.filter((f) => !row[f]);
          if (missing.length > 0) {
            errors.push({
              row: idx + 2, // +1 header, +1 1-indexed
              message: `Missing required field(s): ${missing.join(", ")}`,
            });
            return;
          }

          const direction = row.direction?.toLowerCase() as TradeDirection;
          if (direction !== "long" && direction !== "short") {
            errors.push({
              row: idx + 2,
              message: `Invalid direction "${row.direction}" (expected long/short)`,
            });
            return;
          }

          const entryPrice = Number(row.entryPrice);
          const lotSize = Number(row.lotSize);
          if (Number.isNaN(entryPrice) || Number.isNaN(lotSize)) {
            errors.push({
              row: idx + 2,
              message: "entryPrice and lotSize must be numeric",
            });
            return;
          }

          valid.push({
            symbol: row.symbol.toUpperCase(),
            direction,
            status: (row.status as Trade["status"]) || "closed",
            entryPrice,
            exitPrice: row.exitPrice ? Number(row.exitPrice) : undefined,
            stopLoss: row.stopLoss ? Number(row.stopLoss) : undefined,
            takeProfit: row.takeProfit ? Number(row.takeProfit) : undefined,
            lotSize,
            pnl: row.pnl ? Number(row.pnl) : undefined,
            pnlPercent: row.pnlPercent ? Number(row.pnlPercent) : undefined,
            fees: row.fees ? Number(row.fees) : undefined,
            entryDate: row.entryDate,
            exitDate: row.exitDate || undefined,
            strategy: row.strategy || undefined,
            tags: row.tags ? row.tags.split("|").filter(Boolean) : [],
            notes: row.notes || undefined,
            screenshotUrls: [],
            emotion: (row.emotion as Trade["emotion"]) || undefined,
          });
        });

        resolve({ valid, errors });
      },
      error: (err) => reject(err),
    });
  });
}
