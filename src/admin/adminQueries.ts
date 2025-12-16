/** * Admin read-only queries * No mutations allowed in this module */ import {
  AdminRole,
  AdminPermission,
  AdminSession,
} from "./admin.types";
/* ======================================================   ROLE  PERMISSION MAP   ====================================================== */ const ROLE_PERMISSIONS: Record<
  AdminRole,
  AdminPermission[]
> = {
  OWNER: [
    "APPROVE_CHANGESET",
    "PUBLISH_CHANGESET",
    "ROLLBACK",
    "VIEW_AUDIT",
    "MANAGE_ADMINS",
  ],
  ADMIN: ["APPROVE_CHANGESET", "PUBLISH_CHANGESET", "VIEW_AUDIT"],
  REVIEWER: ["APPROVE_CHANGESET"],
};
/* ======================================================   QUERIES   ====================================================== */ export function resolvePermissionsForRole(
  role: AdminRole,
): AdminPermission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
export function buildAdminSession(
  adminId: string,
  role: AdminRole,
): AdminSession {
  const permissions = resolvePermissionsForRole(role);
  return { adminId, role, permissions, issuedAt: Date.now() };
}
