import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BacktestEntry, BacktestStats, NewBacktestEntry } from "@/types/trade";

const COLLECTION = "backtests";

function backtestsCol() {
  return collection(db, COLLECTION);
}

export async function createBacktestEntry(
  userId: string,
  entry: NewBacktestEntry
): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(backtestsCol(), {
    ...entry,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateBacktestEntry(
  entryId: string,
  updates: Partial<NewBacktestEntry>
): Promise<void> {
  const ref = doc(db, COLLECTION, entryId);
  await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteBacktestEntry(entryId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, entryId));
}

export function subscribeToBacktests(
  userId: string,
  callback: (entries: BacktestEntry[]) => void
): () => void {
  const q = query(
    backtestsCol(),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BacktestEntry)));
  });
}

/** Derives outcome + R-multiple from prices, direction, and stop distance. */
export function computeBacktestOutcome(
  entry: Pick<NewBacktestEntry, "direction" | "entryPrice" | "exitPrice" | "stopLoss" | "lotSize">
): { pnl: number; pnlR?: number; outcome: BacktestEntry["outcome"] } {
  const diff =
    entry.direction === "long"
      ? entry.exitPrice - entry.entryPrice
      : entry.entryPrice - entry.exitPrice;
  const pnl = diff * entry.lotSize;

  let pnlR: number | undefined;
  if (entry.stopLoss !== undefined) {
    const riskDistance = Math.abs(entry.entryPrice - entry.stopLoss);
    if (riskDistance > 0) {
      pnlR = diff / riskDistance;
    }
  }

  const outcome: BacktestEntry["outcome"] =
    pnl > 0 ? "win" : pnl < 0 ? "loss" : "breakeven";

  return { pnl, pnlR, outcome };
}

export function computeBacktestStats(entries: BacktestEntry[]): BacktestStats {
  if (entries.length === 0) {
    return {
      totalSetups: 0,
      winRate: 0,
      totalPnl: 0,
      totalR: 0,
      avgR: 0,
      expectancy: 0,
      profitFactor: 0,
    };
  }

  const wins = entries.filter((e) => e.outcome === "win");
  const losses = entries.filter((e) => e.outcome === "loss");
  const totalPnl = entries.reduce((sum, e) => sum + e.pnl, 0);
  const rEntries = entries.filter((e) => e.pnlR !== undefined);
  const totalR = rEntries.reduce((sum, e) => sum + (e.pnlR ?? 0), 0);
  const grossProfit = wins.reduce((sum, e) => sum + e.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, e) => sum + e.pnl, 0));
  const winRate = (wins.length / entries.length) * 100;
  const avgWinR =
    rEntries.filter((e) => (e.pnlR ?? 0) > 0).reduce((s, e) => s + (e.pnlR ?? 0), 0) /
    (wins.length || 1);
  const avgLossR =
    Math.abs(
      rEntries.filter((e) => (e.pnlR ?? 0) < 0).reduce((s, e) => s + (e.pnlR ?? 0), 0)
    ) / (losses.length || 1);

  return {
    totalSetups: entries.length,
    winRate,
    totalPnl,
    totalR,
    avgR: rEntries.length ? totalR / rEntries.length : 0,
    expectancy: (winRate / 100) * avgWinR - (1 - winRate / 100) * avgLossR,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
  };
}

/** Win rate + PnL grouped per strategy, for the Strategy Library performance view. */
export function statsByStrategyId(
  entries: BacktestEntry[]
): Record<string, BacktestStats> {
  const ids = Array.from(new Set(entries.map((e) => e.strategyId)));
  const result: Record<string, BacktestStats> = {};
  for (const id of ids) {
    result[id] = computeBacktestStats(entries.filter((e) => e.strategyId === id));
  }
  return result;
}
