import { db } from "../db";

/**
 * Initializes core system state
 * This runs once on first app load
 */
export async function initCore() {
  try {
    // Vite derleme hatasını önlemek için db.core yerine doğrudan tabloyu çağırıyoruz
    const coreTable = db.table("core");
    const existing = await coreTable.get("core");
    
    if (!existing) {
      await coreTable.put({ id: "core", schemaVersion: 1, updatedAt: Date.now() });
    }
  } catch (error) {
    console.warn("Core init uyarısı (Göz ardı edilebilir):", error);
  }
}
