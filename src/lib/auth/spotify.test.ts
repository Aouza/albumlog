import { describe, expect, it } from "vitest";
import {
  buildSpotifyAuthorizeUrl,
  createOAuthState,
  createSessionToken,
  generateState,
  getAppOriginFromRedirectUri,
  readOAuthState,
  readSessionToken,
} from "./spotify";

describe("spotify auth helpers", () => {
  it("builds the Spotify authorize URL with required params", () => {
    const url = buildSpotifyAuthorizeUrl({
      clientId: "client-id",
      redirectUri: "http://127.0.0.1:3000/api/auth/spotify/callback",
      state: "state-123",
    });

    expect(url.origin).toBe("https://accounts.spotify.com");
    expect(url.pathname).toBe("/authorize");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("client-id");
    expect(url.searchParams.get("redirect_uri")).toBe("http://127.0.0.1:3000/api/auth/spotify/callback");
    expect(url.searchParams.get("state")).toBe("state-123");
    expect(url.searchParams.get("scope")).toContain("user-read-email");
  });

  it("generates unpredictable state values", () => {
    const first = generateState();
    const second = generateState();

    expect(first).toHaveLength(43);
    expect(second).toHaveLength(43);
    expect(first).not.toBe(second);
  });

  it("roundtrips a signed session token and rejects tampering", async () => {
    const secret = "test-secret-at-least-32-characters";
    const session = {
      id: "spotify-user",
      name: "Spotify User",
      email: "alison@example.com",
      avatarUrl: "https://example.com/avatar.jpg",
      spotifyAccessToken: "access-token",
      spotifyRefreshToken: "refresh-token",
      spotifyTokenExpiresAt: 1893456000000,
    };

    const token = await createSessionToken(session, secret);
    const parsed = await readSessionToken(token, secret);
    const tampered = await readSessionToken(`${token.slice(0, -1)}x`, secret);

    expect(parsed).toEqual(session);
    expect(tampered).toBeNull();
  });

  it("roundtrips signed OAuth state without relying on a browser cookie", async () => {
    const secret = "test-secret-at-least-32-characters";
    const state = await createOAuthState(secret);
    const parsed = await readOAuthState(state, secret);
    const tampered = await readOAuthState(`${state.slice(0, -1)}x`, secret);

    expect(parsed?.nonce).toHaveLength(43);
    expect(parsed?.createdAt).toBeTypeOf("number");
    expect(tampered).toBeNull();
  });

  it("derives the app origin from the configured redirect URI", () => {
    expect(
      getAppOriginFromRedirectUri("http://127.0.0.1:3000/api/auth/spotify/callback"),
    ).toBe("http://127.0.0.1:3000");
  });
});
