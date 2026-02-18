type VerifySiteLockSessionInput = {
  token: string | null | undefined;
  secret: string;
  maxAgeSeconds: number;
  nowMs?: number;
};

const NONCE_BYTE_LENGTH = 16;

const BYPASSED_EXACT_PATHS = new Set<string>([
  "/preview-access",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
]);

const BYPASSED_PREFIX_PATHS = [
  "/preview-access/",
  "/auth/",
  "/api/stripe/webhook",
  "/api/dev-login",
  "/dev/login",
];

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

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const cryptoApi = getWebCrypto();
  const key = await cryptoApi.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await cryptoApi.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToHex(new Uint8Array(signature));
}

function randomHex(byteLength: number): string {
  const cryptoApi = getWebCrypto();
  const bytes = new Uint8Array(byteLength);
  cryptoApi.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export function isSiteLockPathBypassed(pathname: string): boolean {
  if (BYPASSED_EXACT_PATHS.has(pathname)) return true;
  return BYPASSED_PREFIX_PATHS.some((prefix) => pathname.startsWith(prefix));
}

export function isSiteLockBypassTokenValid(
  inputToken: string | null | undefined,
  expectedToken: string
): boolean {
  const token = inputToken?.trim() ?? "";
  if (!token) return false;
  return timingSafeEqualString(token, expectedToken);
}

export async function createSiteLockSessionToken(
  secret: string,
  nowMs = Date.now()
): Promise<string> {
  const issuedAtMs = Math.floor(nowMs);
  const nonce = randomHex(NONCE_BYTE_LENGTH);
  const payload = `${issuedAtMs}.${nonce}`;
  const signature = await hmacSha256Hex(secret, payload);
  return `${payload}.${signature}`;
}

export async function isSiteLockSessionTokenValid(
  input: VerifySiteLockSessionInput
): Promise<boolean> {
  const token = input.token?.trim() ?? "";
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [issuedAtRaw, nonce, signature] = parts;
  if (!issuedAtRaw || !nonce || !signature) return false;

  const issuedAtMs = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAtMs) || issuedAtMs <= 0) return false;

  const nowMs = input.nowMs ?? Date.now();
  const ageMs = nowMs - issuedAtMs;
  if (ageMs < 0) return false;
  if (ageMs > input.maxAgeSeconds * 1000) return false;

  const expectedSignature = await hmacSha256Hex(input.secret, `${issuedAtRaw}.${nonce}`);
  return timingSafeEqualString(signature, expectedSignature);
}
