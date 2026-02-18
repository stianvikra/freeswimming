const SHA256_HASH_PATTERN = /^sha256:([0-9a-f]{64})$/i;

function getWebCrypto(): Crypto {
  if (typeof globalThis.crypto?.subtle === "object") {
    return globalThis.crypto;
  }

  throw new Error("Web Crypto API is not available.");
}

function bytesToHex(bytes: Uint8Array): string {
  let output = "";
  for (const value of bytes) {
    output += value.toString(16).padStart(2, "0");
  }
  return output;
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function hashSiteLockPasswordSha256(password: string): Promise<string> {
  const cryptoApi = getWebCrypto();
  const payload = new TextEncoder().encode(password);
  const digest = await cryptoApi.subtle.digest("SHA-256", payload);
  return bytesToHex(new Uint8Array(digest));
}

export async function isSiteLockPasswordValid(
  inputPassword: string,
  configuredHash: string
): Promise<boolean> {
  const match = configuredHash.trim().match(SHA256_HASH_PATTERN);
  if (!match) return false;

  const expectedHash = match[1].toLowerCase();
  const actualHash = await hashSiteLockPasswordSha256(inputPassword);
  return timingSafeEqualString(actualHash, expectedHash);
}
