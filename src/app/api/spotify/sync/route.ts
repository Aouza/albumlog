import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSessionToken,
  getRequiredEnv,
  readSessionToken,
  refreshSpotifyToken,
} from "@/lib/auth/spotify";
import { prisma } from "@/lib/db/prisma";
import { getSpotifySyncErrorResponse } from "@/lib/sync/spotify-sync-errors";
import { syncSpotifyLibrary } from "@/lib/sync/spotify-library-sync";

export async function POST() {
  const cookieStore = await cookies();
  const sessionSecret = getRequiredEnv("AUTH_SESSION_SECRET");
  const session = await readSessionToken(cookieStore.get("albumlog_session")?.value, sessionSecret);

  if (!session?.spotifyAccessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { spotifyUserId: session.id } });

  if (!user) {
    return NextResponse.json({ error: "user_not_persisted" }, { status: 409 });
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

  let summary;

  try {
    summary = await syncSpotifyLibrary({
      userId: user.id,
      accessToken,
    });
  } catch (error) {
    console.error("[spotify-sync] manual sync failed", {
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    const safeError = getSpotifySyncErrorResponse();

    return NextResponse.json(safeError.body, { status: safeError.status });
  }

  const response = NextResponse.json({ summary });

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
