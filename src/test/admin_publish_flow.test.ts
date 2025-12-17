import { beforeEach, describe, expect, test } from "vitest";
import { db } from "../db";
import { publishChangeSet } from "../admin/adminActions";

describe("Admin / publishChangeSet (uçtan uca)", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  test("approved ChangeSet yayınlanır, snapshot oluşur ve audit yazılır", async () => {
    await db.changeSets.put({
      id: "cs_1",
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

    const session = {
      adminId: "admin_1",
      role: "ADMIN",
      permissions: ["PUBLISH_CHANGESET"],
      issuedAt: Date.now(),
    } as const;

    await publishChangeSet(session, "cs_1");

    const published = await db.changeSets.get("cs_1");
    expect(published?.status).toBe("published");
    expect(await db.menuItems.get("menu_1")).toBeTruthy();
    expect(await db.snapshots.count()).toBe(1);
    expect(await db.auditEvents.count()).toBe(1);
    const event = await db.auditEvents.orderBy("createdAt").last();
    expect(event?.type).toBe("CHANGESET_PUBLISHED");
  });
});

