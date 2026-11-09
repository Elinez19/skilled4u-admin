import crypto from "node:crypto";

const ENCRYPTION_PREFIX = "v1:";

function getKycMasterSecret(): string {
  const secret =
    process.env.KYC_ENCRYPTION_KEY?.trim() ||
    process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error(
      "KYC_ENCRYPTION_KEY or BETTER_AUTH_SECRET must be configured with at least 16 characters"
    );
  }
  return secret;
}

function deriveAesKey(): Buffer {
  return crypto
    .createHash("sha256")
    .update(`s4u-kyc-aes256gcm:${getKycMasterSecret()}`)
    .digest();
}

function deriveBlindIndexSecret(): Buffer {
  return crypto
    .createHash("sha256")
    .update(`s4u-kyc-blind-index:${getKycMasterSecret()}`)
    .digest();
}

/**
 * Masks an 11-digit NIN so only the last 4 digits are visible (e.g. "*******4519").
 */
export function maskNin(ninInput: string | null | undefined): string | null {
  if (!ninInput) return null;
  const trimmed = ninInput.trim();
  if (!trimmed) return null;
  if (/^\*{7}\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 4) {
    return `*******${digits.slice(-4)}`;
  }
  return "***********";
}

/**
 * Computes a deterministic HMAC-SHA256 blind index over a normalized 11-digit NIN.
 * Used to detect duplicate NIN registrations across Artisan accounts without storing plaintext NINs.
 */
export function hashNinBlindIndex(plainNin: string): string {
  const normalized = plainNin.replace(/\D/g, "").trim();
  return crypto
    .createHmac("sha256", deriveBlindIndexSecret())
    .update(normalized)
    .digest("hex");
}

/**
 * Encrypts a plaintext 11-digit NIN using AES-256-GCM with a random 12-byte IV and 16-byte auth tag.
 * Output format: `v1:<iv_base64url>:<authTag_base64url>:<ciphertext_base64url>`
 */
export function encryptNin(plainNin: string): string {
  const normalized = plainNin.replace(/\D/g, "").trim();
  const key = deriveAesKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(normalized, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${ENCRYPTION_PREFIX}${iv.toString("base64url")}:${authTag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

/**
 * Decrypts an AES-256-GCM encrypted NIN (`v1:...`).
 * Gracefully handles legacy 11-digit plaintext NIN values if encountered during migration.
 */
export function decryptNin(
  encryptedOrPlain: string | null | undefined
): string | null {
  if (!encryptedOrPlain) return null;
  const trimmed = encryptedOrPlain.trim();
  if (!trimmed) return null;

  if (!trimmed.startsWith(ENCRYPTION_PREFIX)) {
    if (/^\d{11}$/.test(trimmed)) {
      return trimmed;
    }
    return null;
  }

  try {
    const payload = trimmed.slice(ENCRYPTION_PREFIX.length);
    const parts = payload.split(":");
    if (parts.length !== 3) return null;

    const [ivB64, tagB64, dataB64] = parts;
    const iv = Buffer.from(ivB64, "base64url");
    const authTag = Buffer.from(tagB64, "base64url");
    const encrypted = Buffer.from(dataB64, "base64url");

    const decipher = crypto.createDecipheriv("aes-256-gcm", deriveAesKey(), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");

    return decrypted;
  } catch {
    return null;
  }
}

/**
 * Produces the encrypted ciphertext, blind-index hash, and masked display value for an 11-digit NIN.
 */
export function prepareNinStorage(plainNin: string): {
  ninEncrypted: string;
  ninHash: string;
  ninMasked: string;
} {
  const normalized = plainNin.replace(/\D/g, "").trim();
  return {
    ninEncrypted: encryptNin(normalized),
    ninHash: hashNinBlindIndex(normalized),
    ninMasked: maskNin(normalized) || "*******0000",
  };
}

