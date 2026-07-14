import { useState, FormEvent } from "react";
import { NewTrade, Trade } from "@/types/trade";
import { computeTradeOutcome } from "@/lib/tradesService";

interface Props {
  initial?: Trade;
  onSubmit: (trade: NewTrade) => Promise<void>;
  onCancel: () => void;
}

const emptyForm: NewTrade = {
  symbol: "",
  direction: "long",
  status: "closed",
  entryPrice: 0,
  exitPrice: undefined,
  stopLoss: undefined,
  takeProfit: undefined,
  lotSize: 1,
  fees: 0,
  entryDate: new Date().toISOString().slice(0, 16),
  exitDate: undefined,
  strategy: "",
  tags: [],
  notes: "",
  screenshotUrls: [],
  emotion: "neutral",
};

export default function TradeForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<NewTrade>(
    initial
      ? { ...initial }
      : emptyForm
  );
  const [tagInput, setTagInput] = useState(form.tags.join(", "));
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof NewTrade, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
      const outcome =
        form.status === "closed" && form.exitPrice !== undefined
          ? computeTradeOutcome(form)
          : { pnl: form.pnl ?? 0, pnlPercent: form.pnlPercent ?? 0 };
      await onSubmit({ ...form, tags, ...outcome });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Symbol</label>
          <input
            required
            value={form.symbol}
            onChange={(e) => handleChange("symbol", e.target.value.toUpperCase())}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
            placeholder="EURUSD"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Direction</label>
          <select
            value={form.direction}
            onChange={(e) => handleChange("direction", e.target.value)}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Lot Size</label>
          <input
            required
            type="number"
            step="0.01"
            value={form.lotSize}
            onChange={(e) => handleChange("lotSize", Number(e.target.value))}
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
            onChange={(e) => handleChange("entryPrice", Number(e.target.value))}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Exit Price</label>
          <input
            type="number"
            step="any"
            value={form.exitPrice ?? ""}
            onChange={(e) =>
              handleChange("exitPrice", e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Stop Loss</label>
          <input
            type="number"
            step="any"
            value={form.stopLoss ?? ""}
            onChange={(e) =>
              handleChange("stopLoss", e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Take Profit</label>
          <input
            type="number"
            step="any"
            value={form.takeProfit ?? ""}
            onChange={(e) =>
              handleChange("takeProfit", e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Entry Date</label>
          <input
            required
            type="datetime-local"
            value={form.entryDate.slice(0, 16)}
            onChange={(e) => handleChange("entryDate", e.target.value)}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Exit Date</label>
          <input
            type="datetime-local"
            value={form.exitDate?.slice(0, 16) ?? ""}
            onChange={(e) => handleChange("exitDate", e.target.value || undefined)}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Strategy</label>
          <input
            value={form.strategy ?? ""}
            onChange={(e) => handleChange("strategy", e.target.value)}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
            placeholder="ICT Killzone Reversal"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Emotion</label>
          <select
            value={form.emotion}
            onChange={(e) => handleChange("emotion", e.target.value)}
            className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          >
            <option value="neutral">Neutral</option>
            <option value="confident">Confident</option>
            <option value="fearful">Fearful</option>
            <option value="greedy">Greedy</option>
            <option value="revenge">Revenge</option>
            <option value="fomo">FOMO</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Tags (comma separated)</label>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
          placeholder="breakout, london-session, A+"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Notes</label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={4}
          className="w-full bg-surface-light border border-surface-border rounded-md px-3 py-2"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-surface-border text-slate-300 hover:bg-surface-light"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-md bg-profit/90 hover:bg-profit text-black font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Trade"}
        </button>
      </div>
    </form>
  );
}
