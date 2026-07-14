import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NewTrade, Trade } from "@/types/trade";

const COLLECTION = "trades";

function tradesCol() {
  return collection(db, COLLECTION);
}

export async function createTrade(userId: string, trade: NewTrade): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(tradesCol(), {
    ...trade,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateTrade(
  tradeId: string,
  updates: Partial<NewTrade>
): Promise<void> {
  const ref = doc(db, COLLECTION, tradeId);
  await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteTrade(tradeId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, tradeId));
}

export async function getTrades(userId: string): Promise<Trade[]> {
  const q = query(
    tradesCol(),
    where("userId", "==", userId),
    orderBy("entryDate", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Trade));
}

/** Real-time subscription — use in components with useEffect cleanup. */
export function subscribeToTrades(
  userId: string,
  callback: (trades: Trade[]) => void
): () => void {
  const q = query(
    tradesCol(),
    where("userId", "==", userId),
    orderBy("entryDate", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Trade)));
  });
}

/** Recompute derived fields (pnl, pnlPercent) when a trade is closed. */
export function computeTradeOutcome(trade: NewTrade): {
  pnl: number;
  pnlPercent: number;
} {
  if (trade.exitPrice === undefined) return { pnl: 0, pnlPercent: 0 };
  const diff =
    trade.direction === "long"
      ? trade.exitPrice - trade.entryPrice
      : trade.entryPrice - trade.exitPrice;
  const pnl = diff * trade.lotSize - (trade.fees ?? 0);
  const pnlPercent = (diff / trade.entryPrice) * 100;
  return { pnl, pnlPercent };
}

export function timestampToISO(ts: Timestamp): string {
  return ts.toDate().toISOString();
}
