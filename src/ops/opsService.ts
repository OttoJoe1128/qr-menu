import { db } from "../db";
import { TableSession } from "./ops.types";

export async function openTableSession(
  tableNumber: string,
): Promise<TableSession> {
  const mevcut: TableSession | undefined = await db.tableSessions
    .where("tableNumber")
    .equals(tableNumber)
    .and((s: TableSession) => s.status === "OPEN")
    .first();
  if (mevcut) {
    return mevcut;
  }
  const session: TableSession = {
    id: crypto.randomUUID(),
    tableNumber,
    status: "OPEN",
    openedAt: Date.now(),
  };

  await db.tableSessions.put(session);
  return session;
}

export async function closeTableSession(sessionId: string): Promise<void> {
  const session = await db.tableSessions.get(sessionId);
  if (!session) throw new Error("Table session not found");

  await db.tableSessions.put({
    ...session,
    status: "CLOSED",
    closedAt: Date.now(),
  });
}
