"use client";

// Repurposed during the Phase 1-5 merge: the scaffold's "Notes" stub had no
// counterpart in the ported project, while Phase 5's fully-built Strategy
// Library had no home in the scaffold's routes. Rather than discard a
// complete feature, it now lives at this route. The sidebar label was
// updated to match (see components/layout/sidebar.tsx).

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { NewStrategy, Strategy } from "@/types/trade";
import {
  subscribeToStrategies,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  STRATEGY_COLORS,
} from "@/lib/strategyService";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const emptyForm: NewStrategy = {
  name: "",
  description: "",
  rules: [],
  timeframes: [],
  markets: [],
  tags: [],
  color: STRATEGY_COLORS[0],
};

function StrategyForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Strategy;
  onSubmit: (s: NewStrategy) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<NewStrategy>(initial ?? emptyForm);
  const [rulesText, setRulesText] = useState((initial?.rules ?? []).join("\n"));
  const [timeframesText, setTimeframesText] = useState((initial?.timeframes ?? []).join(", "));
  const [marketsText, setMarketsText] = useState((initial?.markets ?? []).join(", "));
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        rules: rulesText.split("\n").map((r) => r.trim()).filter(Boolean),
        timeframes: timeframesText.split(",").map((t) => t.trim()).filter(Boolean),
        markets: marketsText.split(",").map((m) => m.trim()).filter(Boolean),
        tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-grey mb-1">Strategy Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2"
          placeholder="ICT Silver Bullet"
        />
      </div>
      <div>
        <label className="block text-sm text-grey mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={2}
          className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm text-grey mb-1">Rules (one per line)</label>
        <textarea
          value={rulesText}
          onChange={(e) => setRulesText(e.target.value)}
          rows={4}
          className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2"
          placeholder={"Wait for liquidity sweep\nConfirm FVG on 1m\nEnter on retracement"}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-grey mb-1">Timeframes</label>
          <input
            value={timeframesText}
            onChange={(e) => setTimeframesText(e.target.value)}
            className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2"
            placeholder="1m, 5m, 15m"
          />
        </div>
        <div>
          <label className="block text-sm text-grey mb-1">Markets</label>
          <input
            value={marketsText}
            onChange={(e) => setMarketsText(e.target.value)}
            className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2"
            placeholder="Forex, Gold, Indices"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-grey mb-1">Tags</label>
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2"
          placeholder="ny-session, killzone"
        />
      </div>
      <div>
        <label className="block text-sm text-grey mb-2">Color</label>
        <div className="flex gap-2">
          {STRATEGY_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setForm((p) => ({ ...p, color: c }))}
              className="w-7 h-7 rounded-full border-2"
              style={{
                backgroundColor: c,
                borderColor: form.color === c ? "#fff" : "transparent",
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-accent text-bg-1 font-semibold disabled:opacity-50">
          {saving ? "Saving..." : "Save Strategy"}
        </button>
      </div>
    </form>
  );
}

export default function StrategyLibraryPage() {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Strategy | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToStrategies(user.uid, setStrategies);
  }, [user]);

  const { searchTerm, setSearchTerm, filtered } = useSearchFilter(strategies, {
    searchFields: (s) => [s.name, s.description, ...s.tags, ...s.markets],
  });

  const handleCreate = async (s: NewStrategy) => {
    if (!user) return;
    await createStrategy(user.uid, s);
    setShowForm(false);
  };

  const handleUpdate = async (s: NewStrategy) => {
    if (!editing) return;
    await updateStrategy(editing.id, s);
    setEditing(null);
  };

  const handleDelete = async (s: Strategy) => {
    if (!confirm(`Delete strategy "${s.name}"?`)) return;
    await deleteStrategy(s.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Strategy Library</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search strategies..."
              className="pl-9 pr-3 py-2 bg-black/25 border border-white/10 rounded-xl text-sm w-48"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-bg-1 font-semibold text-sm whitespace-nowrap"
          >
            <Plus size={16} /> New Strategy
          </button>
        </div>
      </div>

      {(showForm || editing) && (
        <div className="glass-card rounded-card p-5">
          <h2 className="text-lg font-medium mb-4">{editing ? "Edit Strategy" : "New Strategy"}</h2>
          <StrategyForm
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="glass-card rounded-card p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <h3 className="font-medium">{s.name}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(s)} className="text-grey hover:text-white">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(s)} className="text-grey hover:text-loss">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {s.description && <p className="text-sm text-grey">{s.description}</p>}
            {s.rules.length > 0 && (
              <ul className="text-xs text-grey space-y-1 list-disc list-inside">
                {s.rules.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
                {s.rules.length > 3 && <li>+{s.rules.length - 3} more</li>}
              </ul>
            )}
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
              {[...s.timeframes, ...s.markets].map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-black/25 border border-white/10 text-grey">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-grey py-10">
            No strategies match — add one to build your playbook.
          </div>
        )}
      </div>
    </div>
  );
}
