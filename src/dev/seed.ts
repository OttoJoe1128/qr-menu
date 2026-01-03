import "fake-indexeddb/auto";
import { db } from "../db";
import { createChangeSet } from "../updates/changeSetService";
import { applyChangeSet } from "../updates/applyChangeSet";
import { createApprovedSnapshot } from "../updates/snapshotService";
async function seed() {
  console.log("Seeding database...");
  const simdi = Date.now();
  const kategorilerCs = createChangeSet([
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-kahvalti",
        nameTR: "Kahvaltı",
        nameEN: "Breakfast",
        slug: "kahvalti",
        sortOrder: 1,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-corbalar",
        nameTR: "Çorbalar",
        nameEN: "Soups",
        slug: "corbalar",
        sortOrder: 2,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-baslangiclar",
        nameTR: "Başlangıçlar & Atıştırmalıklar",
        nameEN: "Starters & Appetizers",
        slug: "baslangiclar-atistirmaliklar",
        sortOrder: 3,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-phuket-imza",
        nameTR: "Phuket İmza Yemekleri",
        nameEN: "Phuket Signature Dishes",
        slug: "phuket-imza-yemekleri",
        sortOrder: 4,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-bati-anayemekleri",
        nameTR: "Batı Anayemekleri",
        nameEN: "Western Main Courses",
        slug: "bati-anayemekleri",
        sortOrder: 5,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-comfort-food",
        nameTR: "Comfort Food",
        nameEN: "Comfort Food",
        slug: "comfort-food",
        sortOrder: 6,
        active: true,
      },
    },
    {
      type: "ADD_CATEGORY",
      payload: {
        id: "cat-tatlilar",
        nameTR: "Tatlılar",
        nameEN: "Desserts",
        slug: "tatlilar",
        sortOrder: 7,
        active: true,
      },
    },
  ]);
  kategorilerCs.status = "approved";
  kategorilerCs.approvedAt = simdi;
  kategorilerCs.approvedBy = "seed";
  await applyChangeSet(kategorilerCs);
  console.log("✓ Kategoriler eklendi");
  const menuItemsCs = createChangeSet([
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-1",
        nameTR: "Izgara Tavuk",
        nameEN: "Grilled Chicken",
        templateId: "food_detail_v1",
        categoryId: "cat-bati-anayemekleri",
        recipeId: undefined,
        tags: ["chicken", "grill"],
        available: true,
      },
    },
  ]);
  menuItemsCs.status = "approved";
  menuItemsCs.approvedAt = simdi;
  menuItemsCs.approvedBy = "seed";
  await applyChangeSet(menuItemsCs);
  console.log("✓ Menu items eklendi");
  const snapshot = await createApprovedSnapshot("seed");
  console.log("✓ Snapshot:", snapshot);
  const kategoriler = await db.categories.toArray();
  const menuItems = await db.menuItems.toArray();
  console.log("Kategoriler:", kategoriler);
  console.log("Menu items:", menuItems);
  console.log("✓ Seed completed");
}
seed().catch((err) => {
  console.error("Seed failed:", err);
});
