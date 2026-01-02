import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { applyChangeSet } from "./applyChangeSet";
import { ChangeSet, MenuCategory, db } from "../db";

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
});

