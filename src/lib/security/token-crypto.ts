import crypto from "node:crypto";

function getKey(secret: string) {
  const key = Buffer.from(secret, "base64");

  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_SECRET must decode to 32 bytes");
  }

  return key;
}

export function encryptToken(value: string, secret: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptToken(value: string, secret: string) {
  const [ivValue, authTagValue, encryptedValue] = value.split(".");

  if (!ivValue || !authTagValue || !encryptedValue) {
    throw new Error("Invalid encrypted token");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getKey(secret),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
