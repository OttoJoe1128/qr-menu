import { db } from "../db";
/** * Initializes core system state * This runs once on first app load */ export async function initCore() {
  const existing = await db.core.get("core");
  if (!existing) {
    await db.core.put({ id: "core", schemaVersion: 1, updatedAt: Date.now() });
  }
}
