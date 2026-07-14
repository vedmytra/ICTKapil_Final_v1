"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { BacktestEntry, NewBacktestEntry, Strategy } from "@/types/trade";
import {
  subscribeToBacktests,
  createBacktestEntry,
  updateBacktestEntry,
  deleteBacktestEntry,
  computeBacktestStats,
  statsByStrategyId,
} from "@/lib/backtestService";
import { subscribeToStrategies } from "@/lib/strategyService";
import { uploadBacktestScreenshot, deleteTradeScreenshot } from "@/lib/storageService";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import BacktestForm from "@/components/BacktestForm";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="glass-card rounded-card p-4">
      <div className="text-xs text-grey mb-1">{label}</div>
      <div className={clsx("text-lg font-semibold", tone === "up" && "text-profit", tone === "down" && "text-loss")}>
        {value}
      </div>
    </div>
  );
}

export default function BacktestingPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<BacktestEntry[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BacktestEntry | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const u1 = subscribeToBacktests(user.uid, setEntries);
    const u2 = subscribeToStrategies(user.uid, setStrategies);
    return () => { u1(); u2(); };
  }, [user]);

  const strategyName = (id: string) => strategies.find((s) => s.id === id)?.name ?? "Unknown";

  const { searchTerm, setSearchTerm, activeFilters, setFilter, clearFilters, filtered } =
    useSearchFilter(entries, {
      searchFields: (e) => [e.symbol, strategyName(e.strategyId), ...e.tags, e.notes ?? ""],
    });

  const stats = computeBacktestStats(filtered);
  const byStrategy = statsByStrategyId(entries);

  const strategyBars = strategies.map((s) => ({
    name: s.name,
    winRate: Number((byStrategy[s.id]?.winRate ?? 0).toFixed(1)),
    setups: byStrategy[s.id]?.totalSetups ?? 0,
  })).filter((s) => s.setups > 0);

  const outcomePie = [
    { name: "Win", value: filtered.filter((e) => e.outcome === "win").length, color: "#4ADE80" },
    { name: "Loss", value: filtered.filter((e) => e.outcome === "loss").length, color: "#F87171" },
    { name: "Breakeven", value: filtered.filter((e) => e.outcome === "breakeven").length, color: "#94a3b8" },
  ].filter((s) => s.value > 0);

  const handleCreate = async (entry: NewBacktestEntry) => {
    if (!user) return;
    await createBacktestEntry(user.uid, entry);
    setShowForm(false);
  };

  const handleUpdate = async (entry: NewBacktestEntry) => {
    if (!editing) return;
    await updateBacktestEntry(editing.id, entry);
    setEditing(null);
  };

  const handleDelete = async (entry: BacktestEntry) => {
    if (!confirm(`Delete this ${entry.symbol} setup?`)) return;
    for (const url of entry.screenshotUrls) await deleteTradeScreenshot(url);
    await deleteBacktestEntry(entry.id);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !uploadTargetId || !e.target.files?.length) return;
    const entry = entries.find((en) => en.id === uploadTargetId);
    if (!entry) return;
    const urls = [...entry.screenshotUrls];
    for (const file of Array.from(e.target.files)) {
      try {
        urls.push(await uploadBacktestScreenshot(user.uid, entry.id, file));
      } catch (err: any) {
        alert(err.message ?? "Upload failed");
      }
    }
    await updateBacktestEntry(entry.id, { screenshotUrls: urls });
    setUploadTargetId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Backtesting</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search setups..."
              className="pl-9 pr-3 py-2 bg-black/25 border border-white/10 rounded-xl text-sm w-40 sm:w-48"
            />
          </div>
          <select
            value={activeFilters.strategyId ?? ""}
            onChange={(e) => setFilter("strategyId", e.target.value)}
            className="px-2 py-2 bg-black/25 border border-white/10 rounded-xl text-sm"
          >
            <option value="">All strategies</option>
            {strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={activeFilters.outcome ?? ""}
            onChange={(e) => setFilter("outcome", e.target.value)}
            className="px-2 py-2 bg-black/25 border border-white/10 rounded-xl text-sm"
          >
            <option value="">All outcomes</option>
            <option value="win">Wins</option>
            <option value="loss">Losses</option>
            <option value="breakeven">Breakeven</option>
          </select>
          {(searchTerm || Object.values(activeFilters).some(Boolean)) && (
            <button onClick={clearFilters} className="text-xs text-grey hover:text-white">
              Clear
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            disabled={strategies.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-bg-1 font-semibold text-sm disabled:opacity-40 whitespace-nowrap"
            title={strategies.length === 0 ? "Create a strategy first" : ""}
          >
            <Plus size={16} /> New Setup
          </button>
        </div>
      </div>

      {strategies.length === 0 && (
        <div className="glass-card rounded-card p-3 text-sm text-grey">
          Add a strategy in the Strategy Library first — backtest setups are tagged to a strategy.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard label="Setups" value={String(stats.totalSetups)} />
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} />
        <StatCard label="Total PnL" value={stats.totalPnl.toFixed(2)} tone={stats.totalPnl >= 0 ? "up" : "down"} />
        <StatCard label="Total R" value={stats.totalR.toFixed(2)} tone={stats.totalR >= 0 ? "up" : "down"} />
        <StatCard label="Expectancy (R)" value={stats.expectancy.toFixed(2)} tone={stats.expectancy >= 0 ? "up" : "down"} />
        <StatCard label="Profit Factor" value={Number.isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card rounded-card p-4">
          <h2 className="text-sm text-grey mb-3">Win Rate by Strategy</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={strategyBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#BABABA" }} />
              <YAxis tick={{ fontSize: 11, fill: "#BABABA" }} unit="%" />
              <Tooltip contentStyle={{ background: "#161316", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Bar dataKey="winRate" fill="#4ADE80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card rounded-card p-4">
          <h2 className="text-sm text-grey mb-3">Outcome Split</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={outcomePie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                {outcomePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#161316", border: "1px solid rgba(255,255,255,0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {(showForm || editing) && (
        <div className="glass-card rounded-card p-5">
          <h2 className="text-lg font-medium mb-4">{editing ? "Edit Setup" : "New Setup"}</h2>
          <BacktestForm
            strategies={strategies}
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleScreenshotUpload} />

      <div className="overflow-x-auto border border-white/10 rounded-card">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-white/[0.03] text-grey text-left">
            <tr>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Strategy</th>
              <th className="px-4 py-3">Dir</th>
              <th className="px-4 py-3">Outcome</th>
              <th className="px-4 py-3">PnL</th>
              <th className="px-4 py-3">R</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Shots</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-medium">{e.symbol}</td>
                <td className="px-4 py-3 text-grey">{strategyName(e.strategyId)}</td>
                <td className="px-4 py-3 capitalize">{e.direction}</td>
                <td className="px-4 py-3">
                  <span className={clsx(
                    "text-xs px-2 py-0.5 rounded-full",
                    e.outcome === "win" && "bg-profit/15 text-profit",
                    e.outcome === "loss" && "bg-loss/15 text-loss",
                    e.outcome === "breakeven" && "bg-slate-500/15 text-grey"
                  )}>
                    {e.outcome}
                  </span>
                </td>
                <td className={clsx("px-4 py-3 font-medium", e.pnl >= 0 ? "text-profit" : "text-loss")}>
                  {e.pnl.toFixed(2)}
                </td>
                <td className="px-4 py-3">{e.pnlR !== undefined ? `${e.pnlR.toFixed(2)}R` : "—"}</td>
                <td className="px-4 py-3 text-grey">{new Date(e.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => { setUploadTargetId(e.id); fileInputRef.current?.click(); }}
                    className="flex items-center gap-1 text-xs text-grey hover:text-white"
                  >
                    <ImageIcon size={14} /> {e.screenshotUrls.length || ""}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(e)} className="text-grey hover:text-white"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(e)} className="text-grey hover:text-loss"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-grey">No backtest setups match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
