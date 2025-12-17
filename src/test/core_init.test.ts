import { beforeEach, describe, expect, test } from "vitest";
import { db } from "../db";
import { initCore } from "../core/init";

describe("Core / initCore", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  test("ilk çalıştırmada core kaydı oluşturur", async () => {
    await initCore();
    const core = await db.coreTable.get("core");
    expect(core?.id).toBe("core");
    expect(core?.schemaVersion).toBe(1);
    expect(typeof core?.updatedAt).toBe("number");
  });

  test("core kaydı varsa tekrar oluşturmaz", async () => {
    await db.coreTable.put({
      id: "core",
      schemaVersion: 1,
      updatedAt: 111,
      lastApprovedSnapshotId: "snapshot_1",
    });
    await initCore();
    const core = await db.coreTable.get("core");
    expect(core?.updatedAt).toBe(111);
    expect(core?.lastApprovedSnapshotId).toBe("snapshot_1");
  });
});

