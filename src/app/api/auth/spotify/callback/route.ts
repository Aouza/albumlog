import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  exchangeCodeForToken,
  fetchSpotifyProfile,
  getAppOriginFromRedirectUri,
  getRequiredEnv,
  readOAuthState,
} from "@/lib/auth/spotify";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const sessionSecret = getRequiredEnv("AUTH_SESSION_SECRET");
  const redirectUri = getRequiredEnv("SPOTIFY_REDIRECT_URI");
  const appOrigin = getAppOriginFromRedirectUri(redirectUri);

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, appOrigin));
  }

  if (!code || !(await readOAuthState(state ?? undefined, sessionSecret))) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", appOrigin));
  }

  try {
    const token = await exchangeCodeForToken({
      code,
      clientId: getRequiredEnv("SPOTIFY_CLIENT_ID"),
      clientSecret: getRequiredEnv("SPOTIFY_CLIENT_SECRET"),
      redirectUri,
    });
    const profile = await fetchSpotifyProfile(token.access_token);
    const sessionToken = await createSessionToken(profile, sessionSecret);

    const response = NextResponse.redirect(new URL("/profile?login=spotify", appOrigin));

    response.cookies.set("albumlog_session", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=spotify_auth_failed", appOrigin));
  }
}
