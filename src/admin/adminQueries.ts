import { db } from "../db";
import { AdminSession } from "./admin.types";
import { assertPermission } from "./adminPolicy";
/* ======================================================   ADMIN READ-ONLY QUERIES   Safe for dashboards and monitoring   ====================================================== */ export async function getCoreState(
  session: AdminSession,
) {
  assertPermission(session, "VIEW_ADMIN_DASHBOARD");
  return db.core.get("core");
}
export async function listChangeSets(session: AdminSession) {
  assertPermission(session, "VIEW_ADMIN_DASHBOARD");
  return db.changeSets.orderBy("createdAt").reverse().toArray();
}
export async function getChangeSetById(
  session: AdminSession,
  changeSetId: string,
) {
  assertPermission(session, "VIEW_ADMIN_DASHBOARD");
  return db.changeSets.get(changeSetId);
}
export async function listSnapshots(session: AdminSession) {
  assertPermission(session, "VIEW_ADMIN_DASHBOARD");
  return db.snapshots.orderBy("menuVersion").reverse().toArray();
}
export async function getSnapshotById(
  session: AdminSession,
  snapshotId: string,
) {
  assertPermission(session, "VIEW_ADMIN_DASHBOARD");
  return db.snapshots.get(snapshotId);
}
export async function listMenuItems(session: AdminSession) {
  assertPermission(session, "VIEW_ADMIN_DASHBOARD");
  return db.menuItems.orderBy("updatedAt").reverse().toArray();
}
export async function listRecipes(session: AdminSession) {
  assertPermission(session, "VIEW_ADMIN_DASHBOARD");
  return db.recipes.orderBy("updatedAt").reverse().toArray();
}
