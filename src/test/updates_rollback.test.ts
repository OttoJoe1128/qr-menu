import { beforeEach, describe, expect, test } from "vitest";
import { db } from "../db";
import { rollbackToLastApprovedSnapshot } from "../updates/rollbackService";

describe("Updates / rollbackToLastApprovedSnapshot", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  test("onaylı snapshot yoksa hata fırlatır", async () => {
    await expect(rollbackToLastApprovedSnapshot()).rejects.toThrow(
      "No approved snapshot found",
    );
  });

  test("menü ve reçeteleri temizler", async () => {
    await db.coreTable.put({
      id: "core",
      schemaVersion: 1,
      lastApprovedSnapshotId: "snapshot_1",
      updatedAt: Date.now(),
    });
    await db.snapshots.put({
      id: "snapshot_1",
      contentHash: "hash",
      menuVersion: 1,
      createdAt: Date.now(),
      approvedBy: "admin_1",
    });
    await db.menuItems.put({
      id: "menu_1",
      nameTR: "Kahvaltı",
      templateId: "food_detail_v1",
      tags: ["breakfast"],
      available: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await db.recipes.put({
      id: "recipe_1",
      ingredients: ["yumurta"],
      steps: ["pişir"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    expect(await db.menuItems.count()).toBe(1);
    expect(await db.recipes.count()).toBe(1);
    await rollbackToLastApprovedSnapshot();
    expect(await db.menuItems.count()).toBe(0);
    expect(await db.recipes.count()).toBe(0);
  });
});

