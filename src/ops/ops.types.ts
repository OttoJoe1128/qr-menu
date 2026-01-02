/**
 * OPS / TABLE SESSION DOMAIN
 * Guest-facing, read-only with limited session state
 */

export type TableSessionStatus = "OPEN" | "CLOSED";

export interface TableSession {
  id: string; // uuid
  tableNumber: string;
  status: TableSessionStatus;

  // Optional guest info
  guestEmail?: string;
  guestPhone?: string;

  openedAt: number;
  closedAt?: number;
}
