import { db, Snapshot } from "../db";
export async function createSnapshot(
  menuVersion: number,
  approvedBy?: string,
): Promise<Snapshot> {
  const snapshot: Snapshot = {
    id: crypto.randomUUID(),
    contentHash: crypto.randomUUID(),
    menuVersion,
    createdAt: Date.now(),
    approvedBy,
  };
  await db.snapshots.put(snapshot);
  return snapshot;
}
