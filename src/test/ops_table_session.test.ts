import { describe, expect, test, beforeEach } from "vitest";
import { db } from "../db";
import { closeTableSession, openTableSession } from "../ops/opsService";

describe("Ops / Masa Oturumu", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  test("masa oturumu açılır ve kapatılır", async () => {
    const session = await openTableSession("10");
    expect(session.tableNumber).toBe("10");
    expect(session.status).toBe("OPEN");
    await closeTableSession(session.id);
    const kayitli = await db.tableSessions.get(session.id);
    expect(kayitli?.status).toBe("CLOSED");
    expect(typeof kayitli?.closedAt).toBe("number");
  });
});

