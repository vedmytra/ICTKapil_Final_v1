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
import { NewStrategy, Strategy } from "@/types/trade";

const COLLECTION = "strategies";

function strategiesCol() {
  return collection(db, COLLECTION);
}

export async function createStrategy(userId: string, strategy: NewStrategy): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(strategiesCol(), {
    ...strategy,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateStrategy(
  strategyId: string,
  updates: Partial<NewStrategy>
): Promise<void> {
  const ref = doc(db, COLLECTION, strategyId);
  await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteStrategy(strategyId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, strategyId));
}

export function subscribeToStrategies(
  userId: string,
  callback: (strategies: Strategy[]) => void
): () => void {
  const q = query(
    strategiesCol(),
    where("userId", "==", userId),
    orderBy("name", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Strategy)));
  });
}

export const STRATEGY_COLORS = [
  "#16c784", "#ea3943", "#3b82f6", "#f59e0b",
  "#a855f7", "#06b6d4", "#ec4899", "#84cc16",
];
