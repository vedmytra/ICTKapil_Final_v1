"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Trade, NewTrade } from "@/types/trade";
import {
  subscribeToTrades,
  createTrade,
  updateTrade,
  deleteTrade,
} from "@/lib/tradesService";
import {
  uploadTradeScreenshot,
  deleteTradeScreenshot,
} from "@/lib/storageService";
import { exportTradesToCSV, downloadCSV, parseTradesCSV } from "@/lib/csvService";
import { groupPnlByDay } from "@/lib/analytics";
import TradeForm from "@/components/TradeForm";
import { Plus, Trash2, Pencil, Upload, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  getDay,
} from "date-fns";
import clsx from "clsx";

function TradeCalendar({ trades }: { trades: Trade[] }) {
  const [cursor, setCursor] = useState(new Date());
  const pnlByDay = groupPnlByDay(trades);
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const leadingBlanks = getDay(monthStart);
  const monthTotal = days.reduce(
    (sum, d) => sum + (pnlByDay[format(d, "yyyy-MM-dd")] ?? 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setCursor(subMonths(cursor, 1))} className="p-1.5 rounded-md hover:bg-white/5">
            <ChevronLeft size={18} />
          </button>
          <span className="w-36 text-center font-medium">{format(cursor, "MMMM yyyy")}</span>
          <button onClick={() => setCursor(addMonths(cursor, 1))} className="p-1.5 rounded-md hover:bg-white/5">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className={clsx("font-semibold", monthTotal >= 0 ? "text-profit" : "text-loss")}>
          Month total: {monthTotal.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs text-grey px-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const pnl = pnlByDay[key];
          const hasTrades = pnl !== undefined;
          return (
            <div
              key={key}
              className={clsx(
                "aspect-square rounded-md border p-2 flex flex-col justify-between text-xs",
                !isSameMonth(day, cursor) && "opacity-40",
                hasTrades
                  ? pnl >= 0
                    ? "bg-profit/10 border-profit/30"
                    : "bg-loss/10 border-loss/30"
                  : "bg-white/[0.03] border-white/10"
              )}
            >
              <span className="text-grey">{format(day, "d")}</span>
              {hasTrades && (
                <span className={clsx("font-semibold", pnl >= 0 ? "text-profit" : "text-loss")}>
                  {pnl >= 0 ? "+" : ""}
                  {pnl.toFixed(0)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function JournalPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [view, setView] = useState<"table" | "calendar">("table");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Trade | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTrades(user.uid, setTrades);
    return unsub;
  }, [user]);

  const handleCreate = async (trade: NewTrade) => {
    if (!user) return;
    await createTrade(user.uid, trade);
    setShowForm(false);
  };

  const handleUpdate = async (trade: NewTrade) => {
    if (!editing) return;
    await updateTrade(editing.id, trade);
    setEditing(null);
  };

  const handleDelete = async (trade: Trade) => {
    if (!confirm(`Delete trade ${trade.symbol}? This cannot be undone.`)) return;
    for (const url of trade.screenshotUrls) await deleteTradeScreenshot(url);
    await deleteTrade(trade.id);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !uploadTargetId || !e.target.files?.length) return;
    const trade = trades.find((t) => t.id === uploadTargetId);
    if (!trade) return;
    const urls: string[] = [...trade.screenshotUrls];
    for (const file of Array.from(e.target.files)) {
      try {
        const url = await uploadTradeScreenshot(user.uid, trade.id, file);
        urls.push(url);
      } catch (err: any) {
        alert(err.message ?? "Upload failed");
      }
    }
    await updateTrade(trade.id, { screenshotUrls: urls });
    setUploadTargetId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExport = () => {
    downloadCSV(exportTradesToCSV(trades));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.length) return;
    const file = e.target.files[0];
    const { valid, errors } = await parseTradesCSV(file);
    setImportErrors(errors.map((er) => `Row ${er.row}: ${er.message}`));
    for (const trade of valid) {
      await createTrade(user.uid, trade);
    }
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Trade Journal</h1>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-xl border border-white/10 p-1">
            <button
              onClick={() => setView("table")}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium",
                view === "table" ? "bg-accent text-bg-1" : "text-grey"
              )}
            >
              Table
            </button>
            <button
              onClick={() => setView("calendar")}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium",
                view === "calendar" ? "bg-accent text-bg-1" : "text-grey"
              )}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm"
          >
            <Upload size={16} /> Import CSV
          </button>
          <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-bg-1 font-semibold text-sm"
          >
            <Plus size={16} /> New Trade
          </button>
        </div>
      </div>

      {importErrors.length > 0 && (
        <div className="bg-loss/10 border border-loss/30 rounded-xl p-3 text-sm text-loss space-y-1">
          <div className="flex justify-between">
            <strong>Import completed with {importErrors.length} error(s):</strong>
            <button onClick={() => setImportErrors([])}><X size={16} /></button>
          </div>
          {importErrors.slice(0, 10).map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      {(showForm || editing) && (
        <div className="glass-card rounded-card p-5">
          <h2 className="text-lg font-medium mb-4">{editing ? "Edit Trade" : "New Trade"}</h2>
          <TradeForm
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleScreenshotUpload} />

      {view === "calendar" ? (
        <TradeCalendar trades={trades} />
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-card">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-grey text-left">
              <tr>
                <th className="px-4 py-3">Symbol</th>
                <th className="px-4 py-3">Dir</th>
                <th className="px-4 py-3">Entry</th>
                <th className="px-4 py-3">Exit</th>
                <th className="px-4 py-3">Lot</th>
                <th className="px-4 py-3">PnL</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Screenshots</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium">{t.symbol}</td>
                  <td className="px-4 py-3 capitalize">{t.direction}</td>
                  <td className="px-4 py-3">{t.entryPrice}</td>
                  <td className="px-4 py-3">{t.exitPrice ?? "—"}</td>
                  <td className="px-4 py-3">{t.lotSize}</td>
                  <td className={`px-4 py-3 font-medium ${(t.pnl ?? 0) >= 0 ? "text-profit" : "text-loss"}`}>
                    {t.pnl !== undefined ? t.pnl.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3 text-grey">{new Date(t.entryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setUploadTargetId(t.id);
                        fileInputRef.current?.click();
                      }}
                      className="text-xs text-grey hover:text-white"
                    >
                      {t.screenshotUrls.length > 0 ? `${t.screenshotUrls.length} image(s)` : "Add"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(t)} className="text-grey hover:text-white">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(t)} className="text-grey hover:text-loss">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-grey">
                    No trades yet — add your first trade or import a CSV.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
