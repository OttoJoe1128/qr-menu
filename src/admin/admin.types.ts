/** * Admin domain types * Central authority definitions */ /* ======================================================   PERMISSIONS   ====================================================== */ export type AdminPermission =

    | "APPROVE_CHANGESET"
    | "PUBLISH_CHANGESET"
    | "ROLLBACK"
    | "VIEW_AUDIT"
    | "MANAGE_ADMINS";
/* ======================================================   ROLES   ====================================================== */ export type AdminRole =
  "OWNER" | "ADMIN" | "REVIEWER";
/* ======================================================   SESSION   ====================================================== */ export interface AdminSession {
  adminId: string;
  role: AdminRole;
  permissions: AdminPermission[];
  issuedAt: number;
  expiresAt?: number;
}
