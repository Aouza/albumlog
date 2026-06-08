import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getRequiredEnv,
  readSessionToken,
  refreshSpotifyToken,
} from "@/lib/auth/spotify";
import { fetchCatalogAlbums } from "@/lib/spotify/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  if (!query.trim()) {
    return NextResponse.json({ albums: [] });
  }

  const cookieStore = await cookies();
  const sessionSecret = getRequiredEnv("AUTH_SESSION_SECRET");
  const sessionToken = cookieStore.get("albumlog_session")?.value;
  const session = await readSessionToken(sessionToken, sessionSecret);

  if (!session?.spotifyAccessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  let accessToken = session.spotifyAccessToken;
  let nextSession = session;

  if (session.spotifyRefreshToken && (session.spotifyTokenExpiresAt ?? 0) <= Date.now() + 60_000) {
    const refreshed = await refreshSpotifyToken({
      refreshToken: session.spotifyRefreshToken,
      clientId: getRequiredEnv("SPOTIFY_CLIENT_ID"),
      clientSecret: getRequiredEnv("SPOTIFY_CLIENT_SECRET"),
    });

    accessToken = refreshed.access_token;
    nextSession = {
      ...session,
      spotifyAccessToken: refreshed.access_token,
      spotifyRefreshToken: refreshed.refresh_token ?? session.spotifyRefreshToken,
      spotifyTokenExpiresAt: Date.now() + refreshed.expires_in * 1000,
      spotifyScope: refreshed.scope || session.spotifyScope,
    };
  }

  const albums = await fetchCatalogAlbums(accessToken, query);
  const response = NextResponse.json({ albums });

  if (nextSession !== session) {
    response.cookies.set("albumlog_session", await createSessionToken(nextSession, sessionSecret), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}
