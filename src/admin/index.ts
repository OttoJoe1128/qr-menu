/** * Admin module public surface * Only exports safe, intended entry points */ /* =======================   TYPES   ======================= */ export type {
  AdminSession,
  AdminRole,
  AdminPermission,
} from "./admin.types";
/* =======================   QUERIES   ======================= */ export {
  buildAdminSession,
  resolvePermissionsForRole,
} from "./adminQueries";
/* =======================   ACTIONS   ======================= */ export {
  approveChangeSet,
  publishChangeSet,
  rollbackMenu,
} from "./adminActions";
/* =======================   POLICY (ADVANCED)   ======================= */ export {
  assertPermission,
  hasPermission,
} from "./adminPolicy";
