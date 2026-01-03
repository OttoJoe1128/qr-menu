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
        id: "menu-kahvalti-1",
        nameTR: "Smashed Avocado on Sourdough",
        nameEN: "Smashed Avocado on Sourdough",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: undefined,
        tags: ["avocado", "healthy", "vegetarian"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-2",
        nameTR: "Southern Thai Roti Set",
        nameEN: "Southern Thai Roti Set",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: undefined,
        tags: ["thai", "local", "roti"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-3",
        nameTR: "The Brook Big Breakfast",
        nameEN: "The Brook Big Breakfast",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: undefined,
        tags: ["english", "classic", "hearty"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-4",
        nameTR: "Tropical Smoothie Bowl",
        nameEN: "Tropical Smoothie Bowl",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: undefined,
        tags: ["smoothie", "vegan", "healthy", "tropical"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-5",
        nameTR: "Royal Eggs Benedict",
        nameEN: "Royal Eggs Benedict",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: undefined,
        tags: ["eggs", "classic", "benedict"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-6",
        nameTR: "American Pancake Stack",
        nameEN: "American Pancake Stack",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: undefined,
        tags: ["pancake", "american", "sweet"],
        available: true,
      },
    },
    {
      type: "ADD_MENU_ITEM",
      payload: {
        id: "menu-kahvalti-7",
        nameTR: "Continental Breakfast",
        nameEN: "Continental Breakfast",
        templateId: "food_detail_v1",
        categoryId: "cat-kahvalti",
        recipeId: undefined,
        tags: ["continental", "light", "classic"],
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
