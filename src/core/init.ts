import { db } from "../db";
/** * Initializes core system state * This runs once on first app load */ export async function initCore() {
  const existing = await db.coreTable.get("core");
  if (!existing) {
    await db.coreTable.put({
      id: "core",
      schemaVersion: 1,
      updatedAt: Date.now(),
    });
  }
}
