import { beforeEach, describe, expect, test } from "vitest";
import { db } from "../db";
import { createApprovedSnapshot } from "../updates/snapshotService";

describe("Updates / createApprovedSnapshot", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  test("snapshot oluşturur ve core.lastApprovedSnapshotId günceller", async () => {
    const snapshot = await createApprovedSnapshot("admin_1");
    const core = await db.coreTable.get("core");
    expect(snapshot.menuVersion).toBe(1);
    expect(core?.lastApprovedSnapshotId).toBe(snapshot.id);
  });

  test("ikinci snapshot versiyonu artırır", async () => {
    const snapshot1 = await createApprovedSnapshot("admin_1");
    const snapshot2 = await createApprovedSnapshot("admin_1");
    expect(snapshot2.menuVersion).toBe(snapshot1.menuVersion + 1);
  });
});

