import Dexie, { Table } from "dexie";
import { TemplateRegistry } from "../templates";
import { AuditEvent } from "../audit/audit.types";
import { TableSession } from "../ops/ops.types";

/* ======================================================
   CORE STATE
====================================================== */
export interface CoreState {
  id: "core";
  schemaVersion: number;
  lastApprovedSnapshotId?: string;
  updatedAt: number;
}

/* ======================================================
   TEMPLATE SAFETY
====================================================== */
export type TemplateId = keyof typeof TemplateRegistry;

/* ======================================================
   MENU
====================================================== */
export interface MenuItem {
  id: string;
  nameTR: string;
  nameEN?: string;
  templateId: TemplateId;
  recipeId?: string;
  tags: string[];
  available: boolean;
  createdAt: number;
  updatedAt: number;
}

/* ======================================================
   RECIPE
====================================================== */
export interface Recipe {
  id: string;
  ingredients: string[];
  steps: string[];
  pairings?: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

/* ======================================================
   CHANGESET
====================================================== */
export type ChangeSetStatus = "draft" | "review" | "approved" | "published";

export interface ChangeSet {
  id: string;
  baseSnapshotId?: string;
  status: ChangeSetStatus;
  patches: any[];
  createdAt: number;
  approvedAt?: number;
  approvedBy?: string;
}

/* ======================================================
   SNAPSHOT
====================================================== */
export interface Snapshot {
  id: string;
  contentHash: string;
  menuVersion: number;
  createdAt: number;
  approvedBy?: string;
}

/* ======================================================
   DATABASE
====================================================== */
class QRMenuDB extends Dexie {
  core!: Table<CoreState, "core">;
  menuItems!: Table<MenuItem, string>;
  recipes!: Table<Recipe, string>;
  changeSets!: Table<ChangeSet, string>;
  snapshots!: Table<Snapshot, string>;
  auditEvents!: Table<AuditEvent, string>;
  tableSessions!: Table<TableSession, string>;

  constructor() {
    super("qr-menu-db");

    // v1 — Core system
    this.version(1).stores({
      core: "id",
      menuItems: "id, templateId, available, updatedAt",
      recipes: "id, updatedAt",
      changeSets: "id, status, createdAt",
      snapshots: "id, menuVersion, createdAt",
      auditEvents: "id, type, severity, createdAt",
    });

    // v2 — OPS / Table Sessions
    this.version(2).stores({
      tableSessions: "id, tableNumber, status, openedAt",
    });
  }
}

export const db = new QRMenuDB();
