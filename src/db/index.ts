import Dexie, { Table } from "dexie";
import { TemplateRegistry } from "../templates";
import { AuditEvent } from "../audit/audit.types";
import { TableSession } from "../ops/ops.types";

/* ======================================================
   CORE STATE
====================================================== */
export interface CoreState {
  id: "core";
  tenantId: string;
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
  tenantId: string;
  nameTR: string;
  nameEN?: string;
  templateId: TemplateId;
  recipeId?: string;
  categoryId?: string;
  tags: string[];
  available: boolean;
  createdAt: number;
  updatedAt: number;
  price: number;
  calories?: number;
  protein?: string;
  allergens?: string[];
}

/* ======================================================
   CATEGORIES
====================================================== */
export interface MenuCategory {
  id: string;
  tenantId: string;
  nameTR: string;
  nameEN?: string;
  slug: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

/* ======================================================
   RECIPE
====================================================== */
export interface Recipe {
  id: string;
  tenantId: string;
  heroImage: string;
  description: string;
  ingredients: string[];
  steps: string[];
  pairings?: string[];
  chefNotes?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

/* ======================================================
   RATINGS
====================================================== */
export interface MenuRating {
  id: string;
  tenantId: string;
  menuItemId: string;
  tableSessionId?: string;
  score: number;
  createdAt: number;
}

/* ======================================================
   CHANGESET
====================================================== */
export type ChangeSetStatus = "draft" | "review" | "approved" | "published";

export interface ChangeSet {
  id: string;
  tenantId: string;
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
  tenantId: string;
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
  categories!: Table<MenuCategory, string>;
  recipes!: Table<Recipe, string>;
  ratings!: Table<MenuRating, string>;
  changeSets!: Table<ChangeSet, string>;
  snapshots!: Table<Snapshot, string>;
  auditEvents!: Table<AuditEvent, string>;
  tableSessions!: Table<TableSession, string>;

  constructor() {
    super("qr-menu-db");

    this.version(1).stores({
      core: "id",
      menuItems: "id, templateId, available, updatedAt",
      recipes: "id, updatedAt",
      changeSets: "id, status, createdAt",
      snapshots: "id, menuVersion, createdAt",
      auditEvents: "id, type, severity, createdAt",
    });

    this.version(2).stores({
      tableSessions: "id, tableNumber, status, openedAt",
    });

    this.version(3).stores({
      menuItems: "id, templateId, categoryId, available, updatedAt",
      categories: "id, slug, active, sortOrder, updatedAt",
      ratings: "id, menuItemId, tableSessionId, createdAt",
    });

    // v4 — B2B SaaS Multi-Tenancy Migration
    this.version(4).stores({
      core: "id, tenantId",
      menuItems: "id, tenantId, templateId, categoryId, available, updatedAt",
      recipes: "id, tenantId, updatedAt",
      changeSets: "id, tenantId, status, createdAt",
      snapshots: "id, tenantId, menuVersion, createdAt",
      auditEvents: "id, tenantId, type, severity, createdAt",
      tableSessions: "id, tenantId, tableNumber, status, openedAt",
      categories: "id, tenantId, slug, active, sortOrder, updatedAt",
      ratings: "id, tenantId, menuItemId, tableSessionId, createdAt"
    }).upgrade(async (tx) => {
      const defaultTenant = "local_demo_tenant";
      await Promise.all([
        tx.table("menuItems").toCollection().modify(item => { item.tenantId = defaultTenant; }),
        tx.table("categories").toCollection().modify(cat => { cat.tenantId = defaultTenant; }),
        tx.table("recipes").toCollection().modify(rcp => { rcp.tenantId = defaultTenant; }),
        tx.table("ratings").toCollection().modify(rtg => { rtg.tenantId = defaultTenant; }),
        tx.table("changeSets").toCollection().modify(cs => { cs.tenantId = defaultTenant; }),
        tx.table("snapshots").toCollection().modify(snap => { snap.tenantId = defaultTenant; }),
        tx.table("auditEvents").toCollection().modify(audit => { audit.tenantId = defaultTenant; }),
        tx.table("tableSessions").toCollection().modify(ts => { ts.tenantId = defaultTenant; })
      ]);
    });
  }
}

export const db = new QRMenuDB();
