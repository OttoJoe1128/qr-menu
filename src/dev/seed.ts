import "fake-indexeddb/auto";
import { webcrypto } from "node:crypto";
(globalThis as any).crypto = webcrypto;
import { db } from "../db";
import { createChangeSet } from "../updates/changeSetService";
import { applyChangeSet } from "../updates/applyChangeSet";
import { createApprovedSnapshot } from "../updates/snapshotService";
async function seed() {
  console.log("Seeding database...");
  const cs = createChangeSet([
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-1",
        nameTR: "Izgara Tavuk",
        nameEN: "Grilled Chicken",
        templateId: "food_detail_v1",
        recipeId: undefined,
        tags: ["chicken", "grill"],
        available: true,
      },
    },
  ]);
  await applyChangeSet(cs);
  const snapshot = await createApprovedSnapshot("seed");
  console.log(" Snapshot:", snapshot);
  const menuItems = await db.menuItems.toArray();
  console.log("Menu items:", menuItems);
  console.log("Seed completed");
}
seed().catch((err) => {
  console.error("Seed failed:", err);
});
