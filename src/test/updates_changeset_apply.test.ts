import { beforeEach, describe, expect, test } from "vitest";
import { db } from "../db";
import { applyChangeSet } from "../updates/applyChangeSet";

describe("Updates / applyChangeSet", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  test("approved değilse hata fırlatır", async () => {
    await expect(
      applyChangeSet({
        id: "cs_1",
        status: "draft",
        patches: [],
        createdAt: Date.now(),
      }),
    ).rejects.toThrow("is not approved");
  });

  test("ADD_MENU_ITEM patch'i menüye yazar", async () => {
    await applyChangeSet({
      id: "cs_2",
      status: "approved",
      patches: [
        {
          type: "ADD_MENU_ITEM",
          payload: {
            id: "menu_1",
            nameTR: "Kahvaltı Tabağı",
            templateId: "food_detail_v1",
            tags: ["breakfast"],
            available: true,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ],
      createdAt: Date.now(),
      approvedAt: Date.now(),
      approvedBy: "admin_1",
    });
    const kayitli = await db.menuItems.get("menu_1");
    expect(kayitli?.nameTR).toBe("Kahvaltı Tabağı");
    expect(kayitli?.templateId).toBe("food_detail_v1");
    expect(kayitli?.available).toBe(true);
  });
});

