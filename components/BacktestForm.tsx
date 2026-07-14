import { useState, FormEvent } from "react";
import { BacktestEntry, NewBacktestEntry, Strategy } from "@/types/trade";
import { computeBacktestOutcome } from "@/lib/backtestService";

interface Props {
  strategies: Strategy[];
  initial?: BacktestEntry;
  onSubmit: (entry: NewBacktestEntry) => Promise<void>;
  onCancel: () => void;
}

const empty = (strategyId: string): NewBacktestEntry => ({
  strategyId,
  symbol: "",
  direction: "long",
  entryPrice: 0,
  exitPrice: 0,
  stopLoss: undefined,
  takeProfit: undefined,
  lotSize: 1,
  pnl: 0,
  pnlR: undefined,
  outcome: "breakeven",
  timeframe: "15m",
  date: new Date().toISOString().slice(0, 16),
  notes: "",
  screenshotUrls: [],
  tags: [],
});

export default function BacktestForm({ strategies, initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<NewBacktestEntry>(
    initial ?? empty(strategies[0]?.id ?? "")
  );
  const [tagInput, setTagInput] = useState((initial?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);

  const set = (field: keyof NewBacktestEntry, value: any) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const outcome = computeBacktestOutcome(form);
      const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
      await onSubmit({ ...form, ...outcome, tags });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Strategy</label>
          <select
            required
            value={form.strategyId}
            onChange={(e) => set("strategyId", e.target.value)}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Symbol</label>
          <input
            required
            value={form.symbol}
            onChange={(e) => set("symbol", e.target.value.toUpperCase())}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
            placeholder="XAUUSD"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Direction</label>
          <select
            value={form.direction}
            onChange={(e) => set("direction", e.target.value)}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Timeframe</label>
          <input
            value={form.timeframe}
            onChange={(e) => set("timeframe", e.target.value)}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
            placeholder="15m"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Lot Size</label>
          <input
            required
            type="number"
            step="0.01"
            value={form.lotSize}
            onChange={(e) => set("lotSize", Number(e.target.value))}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Date</label>
          <input
            required
            type="datetime-local"
            value={form.date.slice(0, 16)}
            onChange={(e) => set("date", e.target.value)}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Entry Price</label>
          <input
            required
            type="number"
            step="any"
            value={form.entryPrice}
            onChange={(e) => set("entryPrice", Number(e.target.value))}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Exit Price</label>
          <input
            required
            type="number"
            step="any"
            value={form.exitPrice}
            onChange={(e) => set("exitPrice", Number(e.target.value))}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Stop Loss</label>
          <input
            type="number"
            step="any"
            value={form.stopLoss ?? ""}
            onChange={(e) => set("stopLoss", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Tags</label>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          placeholder="killzone, A+, london-open"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Notes</label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border border-surface-border hover:bg-surface-light">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-profit text-black font-medium disabled:opacity-50">
          {saving ? "Saving..." : "Save Setup"}
        </button>
      </div>
    </form>
  );
}
