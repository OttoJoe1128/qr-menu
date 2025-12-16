import "fake-indexeddb/auto";
import { db, MenuItem } from "../db";
import { createChangeSet } from "../updates/changeSetService";
import { applyChangeSet } from "../updates/applyChangeSet";
async function seed() {
  console.log(" Seeding database...");
  const item: MenuItem = {
    id: "menu-1",
    nameTR: "Izgara Tavuk",
    nameEN: "Grilled Chicken",
    templateId: "food_detail_v1",
    recipeId: undefined,
    tags: ["chicken", "grill"],
    available: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const cs = createChangeSet([{ type: "ADD_MENU_ITEM", payload: item }]);
  cs.status = "approved";
  await applyChangeSet(cs);
  const items = await db.menuItems.toArray();
  console.log(" Menu items:", items);
  console.log(" Seed completed");
}
seed().catch((err) => {
  console.error(" Seed failed:", err);
});
