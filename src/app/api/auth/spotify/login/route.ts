import { NextResponse } from "next/server";
import { buildSpotifyAuthorizeUrl, createOAuthState } from "@/lib/auth/spotify";

export async function GET() {
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const sessionSecret = process.env.AUTH_SESSION_SECRET;

  if (!redirectUri || !clientId || !sessionSecret) {
    return NextResponse.redirect(new URL("/login?error=missing_spotify_config", "http://127.0.0.1:3000"));
  }

  const url = buildSpotifyAuthorizeUrl({
    clientId,
    redirectUri,
    state: await createOAuthState(sessionSecret),
  });

  return NextResponse.redirect(url);
}
