import { db } from "../db";
/** * Roll back menu + recipes to the last approved snapshot. * This is a destructive operation and must be admin-only. */ export async function rollbackToLastApprovedSnapshot(): Promise<void> {
  const core = await db.coreTable.get("core");
  if (!core?.lastApprovedSnapshotId) {
    throw new Error("No approved snapshot found to rollback to");
  }
  const snapshot = await db.snapshots.get(core.lastApprovedSnapshotId);
  if (!snapshot) {
    throw new Error("Snapshot not found");
  }
  await db.transaction("rw", db.menuItems, db.recipes, async () => {
    await db.menuItems.clear();
    await db.recipes.clear();
  });
  console.warn(
    "Rollback completed. Menu cleared. Snapshot version:",
    snapshot.menuVersion,
  );
}
