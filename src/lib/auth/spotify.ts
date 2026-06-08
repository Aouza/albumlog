import crypto from "node:crypto";

export type SpotifySession = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  spotifyTokenExpiresAt?: number;
  spotifyScope?: string;
};

export type OAuthState = {
  nonce: string;
  createdAt: number;
};

export type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

type SpotifyProfileResponse = {
  id: string;
  display_name: string | null;
  email?: string;
  images?: Array<{ url: string }>;
};

const spotifyScopes = ["user-read-email", "user-read-private", "user-library-read"];

function base64Url(buffer: Buffer) {
  return buffer.toString("base64url");
}

async function hmac(value: string, secret: string) {
  return base64Url(crypto.createHmac("sha256", secret).update(value).digest());
}

export function generateState() {
  return base64Url(crypto.randomBytes(32));
}

export async function createOAuthState(secret: string) {
  const state: OAuthState = {
    nonce: generateState(),
    createdAt: Date.now(),
  };
  const payload = base64Url(Buffer.from(JSON.stringify(state), "utf8"));
  const signature = await hmac(payload, secret);

  return `${payload}.${signature}`;
}

export async function readOAuthState(token: string | undefined, secret: string) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = await hmac(payload, secret);

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OAuthState;
    const tenMinutes = 10 * 60 * 1000;

    if (!state.nonce || Date.now() - state.createdAt > tenMinutes) {
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

export function buildSpotifyAuthorizeUrl({
  clientId,
  redirectUri,
  state,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const url = new URL("https://accounts.spotify.com/authorize");

  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", spotifyScopes.join(" "));
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);

  return url;
}

export async function exchangeCodeForToken({
  code,
  clientId,
  clientSecret,
  redirectUri,
}: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error("Spotify token exchange failed");
  }

  return (await response.json()) as SpotifyTokenResponse;
}

export async function refreshSpotifyToken({
  refreshToken,
  clientId,
  clientSecret,
}: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Spotify token refresh failed");
  }

  return (await response.json()) as SpotifyTokenResponse;
}

export async function fetchSpotifyProfile(accessToken: string): Promise<SpotifySession> {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Spotify profile request failed");
  }

  const profile = (await response.json()) as SpotifyProfileResponse;

  return {
    id: profile.id,
    name: profile.display_name ?? "Spotify User",
    email: profile.email ?? "",
    avatarUrl: profile.images?.[0]?.url ?? "",
  };
}

export async function createSessionToken(session: SpotifySession, secret: string) {
  const payload = base64Url(Buffer.from(JSON.stringify(session), "utf8"));
  const signature = await hmac(payload, secret);

  return `${payload}.${signature}`;
}

export async function readSessionToken(token: string | undefined, secret: string) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = await hmac(payload, secret);

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SpotifySession;
  } catch {
    return null;
  }
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

export function getAppOriginFromRedirectUri(redirectUri: string) {
  const url = new URL(redirectUri);

  return url.origin;
}
