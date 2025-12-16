/** * Audit service * Central immutable event writer */ import { db } from "../db";
import {
  AuditEvent,
  AuditEventType,
  AuditSeverity,
  AuditActor,
  AuditContext,
} from "./audit.types";
export async function writeAuditEvent(params: {
  type: AuditEventType;
  severity?: AuditSeverity;
  actor: AuditActor;
  context?: AuditContext;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<AuditEvent> {
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
  await db.table<AuditEvent>("auditEvents").add(event);
  return event;
}
