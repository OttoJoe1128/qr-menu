import { beforeEach, describe, expect, test } from "vitest";
import { db } from "../db";
import { computeMenuContentHash } from "../updates/snapshotService";

describe("Snapshot / İçerik Hash", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  test("menü içeriği değişince hash değişir", async () => {
    const hash1 = await computeMenuContentHash();
    await db.menuItems.put({
      id: "menu_1",
      nameTR: "Kahvaltı",
      templateId: "food_detail_v1",
      tags: ["breakfast"],
      available: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const hash2 = await computeMenuContentHash();
    expect(hash2).not.toBe(hash1);
  });
});

