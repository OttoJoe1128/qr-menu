import { ChangeSet } from "../db";

function createUuidV4(): string {
  const bytes: Uint8Array = new Uint8Array(16);
  if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
    throw new Error("Crypto API missing: getRandomValues");
  }
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex: string[] = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
  return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
}

export function createChangeSet(patches: any[]): ChangeSet {
  return {
    id: createUuidV4(),
    status: "draft",
    patches,
    createdAt: Date.now(),
  };
}
