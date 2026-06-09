import { describe, expect, it } from "vitest";
import { decryptToken, encryptToken } from "./token-crypto";

describe("token crypto", () => {
  const secret = Buffer.alloc(32, 7).toString("base64");

  it("roundtrips a token without storing the raw value", () => {
    const encrypted = encryptToken("spotify-token", secret);

    expect(encrypted).not.toContain("spotify-token");
    expect(decryptToken(encrypted, secret)).toBe("spotify-token");
  });

  it("rejects malformed encrypted values", () => {
    expect(() => decryptToken("broken", secret)).toThrow("Invalid encrypted token");
  });
});
