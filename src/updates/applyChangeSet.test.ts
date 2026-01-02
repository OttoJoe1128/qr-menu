import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { applyChangeSet } from "./applyChangeSet";
import { ChangeSet, MenuCategory, MenuItem, db } from "../db";

function createChangeSet(patches: any[]): ChangeSet {
  const simdi: number = Date.now();
  return {
    id: "cs-test",
    status: "approved",
    patches,
    createdAt: simdi,
    approvedAt: simdi,
    approvedBy: "test",
    baseSnapshotId: undefined,
  };
}

describe("applyChangeSet", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it("kategori slug tekrarini engeller", async () => {
    const kategori1: MenuCategory = {
      id: "k1",
      nameTR: "Ana Yemek",
      nameEN: "Main",
      slug: "ana_yemek",
      imageUrl: undefined,
      sortOrder: 1,
      active: true,
      createdAt: 0,
      updatedAt: 0,
    };
    await applyChangeSet(createChangeSet([{ type: "ADD_CATEGORY", payload: kategori1 }]));
    const kategori2: MenuCategory = {
      ...kategori1,
      id: "k2",
      nameTR: "Ana Yemek 2",
    };
    await expect(applyChangeSet(createChangeSet([{ type: "ADD_CATEGORY", payload: kategori2 }]))).rejects.toThrow(
      "Category already exists (slug): ana_yemek",
    );
  });

  it("kategori pasife alindiginda bagli urunleri otomatik pasife alir", async () => {
    const kategori: MenuCategory = {
      id: "k1",
      nameTR: "Ana Yemek",
      nameEN: "Main",
      slug: "ana_yemek",
      imageUrl: undefined,
      sortOrder: 1,
      active: true,
      createdAt: 0,
      updatedAt: 0,
    };
    const urun1: MenuItem = {
      id: "m1",
      nameTR: "Izgara Tavuk",
      nameEN: "Grilled Chicken",
      templateId: "food_detail_v1",
      recipeId: undefined,
      categoryId: "k1",
      tags: [],
      available: true,
      createdAt: 0,
      updatedAt: 0,
    };
    const urun2: MenuItem = {
      id: "m2",
      nameTR: "Izgara Köfte",
      nameEN: "Grilled Meatballs",
      templateId: "food_detail_v1",
      recipeId: undefined,
      categoryId: "k1",
      tags: [],
      available: true,
      createdAt: 0,
      updatedAt: 0,
    };
    await applyChangeSet(createChangeSet([{ type: "ADD_CATEGORY", payload: kategori }]));
    await applyChangeSet(createChangeSet([{ type: "ADD_MENU_ITEM", payload: urun1 }]));
    await applyChangeSet(createChangeSet([{ type: "ADD_MENU_ITEM", payload: urun2 }]));
    await applyChangeSet(createChangeSet([{ type: "UPDATE_CATEGORY", payload: { ...kategori, active: false } }]));
    const actual1: MenuItem | undefined = await db.menuItems.get("m1");
    const actual2: MenuItem | undefined = await db.menuItems.get("m2");
    expect(actual1?.available).toBe(false);
    expect(actual2?.available).toBe(false);
  });
});

