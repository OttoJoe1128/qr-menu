/** * Admin authorization policy * Central permission enforcement layer */ import {
  AdminSession,
  AdminPermission,
} from "./admin.types";
/** * Throws if the admin session does not have the required permission */ export function assertPermission(
  session: AdminSession,
  permission: AdminPermission,
): void {
  if (!session || !session.permissions) {
    throw new Error("Invalid admin session");
  }
  if (!session.permissions.includes(permission)) {
    throw new Error(`Permission denied: missing ${permission}`);
  }
}
/** * Helper to check permission without throwing */ export function hasPermission(
  session: AdminSession,
  permission: AdminPermission,
): boolean {
  if (!session || !session.permissions) {
    return false;
  }
  return session.permissions.includes(permission);
}
