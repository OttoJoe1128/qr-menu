import { AdminSession } from "../../../admin/admin.types";

export function createUuidV4(): string {
  const bytes = new Uint8Array(16);
  if (!globalThis.crypto || !globalThis.crypto.getRandomValues) throw new Error("Crypto API eksik");
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
  return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
}

export function createKayitId(): string {
  if (globalThis.crypto && "randomUUID" in globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return createUuidV4();
}

export function resolveHataMesaji(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Beklenmeyen bir hata oluştu.";
}

export function createAdminSession(): AdminSession {
  const issuedAt = Date.now();
  return {
    adminId: "owner_local",
    role: "OWNER",
    permissions: ["VIEW_ADMIN_DASHBOARD", "APPROVE_CHANGESET", "PUBLISH_CHANGESET", "ROLLBACK", "VIEW_AUDIT", "MANAGE_ADMINS"],
    issuedAt,
    expiresAt: issuedAt + 1000 * 60 * 60 * 12,
  };
}

export function parseEtiketler(input: string): string[] {
  return Array.from(new Set(input.split(",").map(t => t.trim()).filter(t => t.length > 0)));
}

export function parseSatirlar(input: string): string[] {
  return input.split("\n").map(s => s.trim()).filter(s => s.length > 0);
}

export function createSlug(input: string): string {
  const trMap: Record<string, string> = { ı:"i", İ:"i", ş:"s", Ş:"s", ğ:"g", Ğ:"g", ü:"u", Ü:"u", ö:"o", Ö:"o", ç:"c", Ç:"c" };
  return input.split("").map(c => trMap[c] ?? c).join("").toLowerCase().trim()
    .replace(/[^a-z0-9\s_-]/g, "").replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
}
