import { db } from "../db";
import { applyChangeSet } from "../updates/applyChangeSet";
import { createApprovedSnapshot } from "../updates/snapshotService";
import { writeAuditEvent } from "../audit/auditService";
import { AdminSession } from "./admin.types";
import { assertPermission } from "./adminPolicy";
import { supabase } from "../services/supabaseClient"; // <-- BULUT KÖPRÜSÜ

export async function approveChangeSet(
  session: AdminSession,
  changeSetId: string,
): Promise<void> {
  assertPermission(session, "APPROVE_CHANGESET");
  const cs = await db.changeSets.get(changeSetId);
  if (!cs) throw new Error("ChangeSet not found");
  if (cs.status !== "review") {
    throw new Error("Only review ChangeSets can be approved");
  }
  await db.changeSets.put({ ...cs, status: "approved", approvedAt: Date.now(), approvedBy: session.adminId });
  await writeAuditEvent({ type: "CHANGESET_APPROVED", severity: "INFO", actor: { type: "ADMIN", id: session.adminId }, context: { changeSetId }, message: "ChangeSet approved by admin" });
}

export async function publishChangeSet(
  session: AdminSession,
  changeSetId: string,
): Promise<void> {
  assertPermission(session, "PUBLISH_CHANGESET");
  const cs = await db.changeSets.get(changeSetId);
  if (!cs) throw new Error("ChangeSet not found");
  if (cs.status !== "approved") {
    throw new Error("Only approved ChangeSets can be published");
  }

  // 🚀 BULUT (SUPABASE) SENKRONİZASYON KATMANI
  for (const patch of cs.patches) {
    try {
      // PostgreSQL 'upsert' komutu: Kayıt bulutta yoksa INSERT (Ekle), varsa UPDATE (Güncelle) yapar.
      if (patch.type === "ADD_CATEGORY" || patch.type === "UPDATE_CATEGORY") {
        const { error } = await supabase.from('categories').upsert(patch.payload);
        if (error) throw error;
      } 
      else if (patch.type === "ADD_RECIPE" || patch.type === "UPDATE_RECIPE") {
        const { error } = await supabase.from('recipes').upsert(patch.payload);
        if (error) throw error;
      } 
      else if (patch.type === "ADD_MENU_ITEM" || patch.type === "UPDATE_MENU_ITEM") {
        const { error } = await supabase.from('menuItems').upsert(patch.payload);
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Bulut eşitleme hatası:", err);
      throw new Error(`Buluta yazılamadı (${patch.type}): ` + err.message);
    }
  }

  // 🚀 YEREL (DEXIE) SENKRONİZASYON KATMANI
  await applyChangeSet(cs);
  await db.changeSets.put({ ...cs, status: "published" });
  
  const snapshot = await createApprovedSnapshot(session.adminId);
  
  await writeAuditEvent({
    type: "CHANGESET_PUBLISHED",
    severity: "INFO",
    actor: { type: "ADMIN", id: session.adminId },
    context: { changeSetId, snapshotId: snapshot.id },
    message: "ChangeSet published and synchronized to Supabase",
  });
}

export async function rollbackMenu(session: AdminSession): Promise<void> {
  assertPermission(session, "ROLLBACK");
  await writeAuditEvent({ type: "ROLLBACK_TRIGGERED", severity: "CRITICAL", actor: { type: "ADMIN", id: session.adminId }, message: "Rollback triggered by admin" });
}
