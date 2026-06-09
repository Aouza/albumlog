import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRequiredEnv, readSessionToken } from "@/lib/auth/spotify";
import { getPersistedLibraryForSpotifyUser } from "@/lib/repositories/library-repository";

export async function GET() {
  const cookieStore = await cookies();
  const sessionSecret = getRequiredEnv("AUTH_SESSION_SECRET");
  const sessionToken = cookieStore.get("albumlog_session")?.value;
  const session = await readSessionToken(sessionToken, sessionSecret);

  if (!session?.spotifyAccessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  if (!session.spotifyScope?.split(" ").includes("user-library-read")) {
    return NextResponse.json({ error: "missing_scope" }, { status: 403 });
  }

  const persistedAlbums = await getPersistedLibraryForSpotifyUser(session.id);

  return NextResponse.json({ albums: persistedAlbums, source: "database" });
}
