import { db, Snapshot } from "../db";
/** * sha256(JSON) -> hex * Uses WebCrypto (browser) and Node (via globalThis.crypto = webcrypto) */ async function sha256Hex(
  input: string,
): Promise<string> {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error(
      "WebCrypto subtle API missing. In Node, set globalThis.crypto = webcrypto before calling snapshot functions.",
    );
  }
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hashBuf = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function computeMenuContentHash(): Promise<string> {
  const menuItems = await db.menuItems.orderBy("id").toArray();
  const recipes = await db.recipes.orderBy("id").toArray();
  const payload = JSON.stringify({ menuItems, recipes });
  return sha256Hex(payload);
}
export async function createApprovedSnapshot(
  approvedBy?: string,
): Promise<Snapshot> {
  const last = await db.snapshots.orderBy("menuVersion").last();
  const nextVersion = (last?.menuVersion ?? 0) + 1;
  const contentHash = await computeMenuContentHash();
  const snapshot: Snapshot = {
    id: globalThis.crypto.randomUUID(),
    contentHash,
    menuVersion: nextVersion,
    createdAt: Date.now(),
    approvedBy,
  };
  await db.transaction("rw", db.snapshots, db.core, async () => {
    await db.snapshots.put(snapshot);
    const core = await db.core.get("core");
    if (!core) {
      await db.core.put({
        id: "core",
        schemaVersion: 1,
        lastApprovedSnapshotId: snapshot.id,
        updatedAt: Date.now(),
      });
    } else {
      await db.core.put({
        ...core,
        lastApprovedSnapshotId: snapshot.id,
        updatedAt: Date.now(),
      });
    }
  });
  return snapshot;
}
