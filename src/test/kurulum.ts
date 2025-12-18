import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

async function ensureWebCryptoIsReady(): Promise<void> {
  const hasSubtle = Boolean(globalThis.crypto && globalThis.crypto.subtle);
  if (hasSubtle) {
    return;
  }
  const moduleCrypto = await import("node:crypto");
  globalThis.crypto = moduleCrypto.webcrypto as unknown as Crypto;
}

await ensureWebCryptoIsReady();

