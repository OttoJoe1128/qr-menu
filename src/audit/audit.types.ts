/** * Audit domain types (enterprise) * Immutable event log for governance, traceability, and rollback safety. */ export type AuditActorType =
  "SYSTEM" | "ADMIN" | "STAFF" | "CUSTOMER";
export interface AuditActor {
  type: AuditActorType;
  id?: string;
  role?: string;
}
export type AuditEventType =
  | "AUTH_LOGIN"
  | "AUTH_LOGOUT"
  | "CHANGESET_CREATED"
  | "CHANGESET_SUBMITTED_REVIEW"
  | "CHANGESET_APPROVED"
  | "CHANGESET_PUBLISHED"
  | "SNAPSHOT_CREATED"
  | "ROLLBACK_TRIGGERED"
  | "ROLLBACK_COMPLETED"
  | "SECURITY_DENIED";
export type AuditSeverity = "INFO" | "WARN" | "CRITICAL";
export interface AuditContext {
  appVersion?: string;
  deviceId?: string;
  installId?: string;
  correlationId?: string;
  sessionId?: string;
  changeSetId?: string;
  snapshotId?: string;
}
export interface AuditEvent {
  id: string;
  type: AuditEventType;
  severity: AuditSeverity;
  actor: AuditActor;
  context: AuditContext;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}
