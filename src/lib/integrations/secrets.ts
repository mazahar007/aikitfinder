import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Encryption for provider credentials (AES-256-GCM).
 *
 * A credential typed into the admin panel is encrypted here, on the server,
 * before it is sent to the database, so the database never holds it in plain
 * text. The key is INTEGRATIONS_ENCRYPTION_KEY: 32 random bytes, base64.
 * Without it, saving credentials is switched off; nothing falls back to plain
 * text.
 */
function loadKey(): Buffer | null {
  const raw = process.env.INTEGRATIONS_ENCRYPTION_KEY;
  if (!raw) return null;
  const key = Buffer.from(raw, "base64");
  return key.length === 32 ? key : null;
}

const key = loadKey();
export const secretStorageConfigured = key !== null;

/** "v1.<iv>.<tag>.<data>", all base64url. Matches the database's format check. */
export function encryptSecret(plain: string): string {
  if (!key) throw new Error("Secret storage is not configured");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    data.toString("base64url"),
  ].join(".");
}

/** For adapters, on the server only. Never called for a response to the browser. */
export function decryptSecret(value: string): string {
  if (!key) throw new Error("Secret storage is not configured");
  const [version, iv, tag, data] = value.split(".");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("Unrecognized secret format");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

/** The last characters of a credential, for recognition. Short values show nothing. */
export function secretHint(plain: string): string {
  return plain.length >= 12 ? plain.slice(-4) : "";
}
