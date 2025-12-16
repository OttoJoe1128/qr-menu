/** * Admin actions * All privileged write operations live here */ import { db } from "../db";
import { applyChangeSet } from "../updates/applyChangeSet";
import { createApprovedSnapshot } from "../updates/snapshotService";
import { AdminSession } from "./admin.types";
import { assertPermission } from "./adminPolicy";
export async function approveChangeSet(
  session: AdminSession,
  changeSetId: string,
): Promise<void> {
  assertPermission(session, "APPROVE_CHANGESET");
  const cs = await db.changeSets.get(changeSetId);
  if (!cs) {
    throw new Error("ChangeSet not found");
  }
  if (cs.status !== "review") {
    throw new Error("Only review ChangeSets can be approved");
  }
  await db.changeSets.put({
    ...cs,
    status: "approved",
    approvedAt: Date.now(),
    approvedBy: session.adminId,
  });
}
export async function publishChangeSet(
  session: AdminSession,
  changeSetId: string,
): Promise<void> {
  assertPermission(session, "PUBLISH_CHANGESET");
  const cs = await db.changeSets.get(changeSetId);
  if (!cs) {
    throw new Error("ChangeSet not found");
  }
  if (cs.status !== "approved") {
    throw new Error("Only approved ChangeSets can be published");
  }
  await applyChangeSet(cs);
  await db.changeSets.put({ ...cs, status: "published" });
  await createApprovedSnapshot(session.adminId);
}
export async function rollbackMenu(session: AdminSession): Promise<void> {
  assertPermission(session, "ROLLBACK");
  console.warn("Rollback triggered by admin:", session.adminId);
}
