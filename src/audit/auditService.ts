import { db } from "../db";
import {
  AuditEvent,
  AuditEventType,
  AuditSeverity,
  AuditActor,
  AuditContext,
} from "./audit.types";
/** * Centralized audit writer * This is the ONLY place where audit logs are written. * All admin, security, and governance actions must pass here. */ export async function writeAuditEvent(params: {
  type: AuditEventType;
  severity?: AuditSeverity;
  actor: AuditActor;
  context?: AuditContext;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const event: AuditEvent = {
    id: globalThis.crypto.randomUUID(),
    type: params.type,
    severity: params.severity ?? "INFO",
    actor: params.actor,
    context: params.context ?? {},
    message: params.message,
    metadata: params.metadata,
    createdAt: Date.now(),
  };
  await db.transaction("rw", db.auditEvents, async () => {
    await db.auditEvents.put(event);
  });
}
