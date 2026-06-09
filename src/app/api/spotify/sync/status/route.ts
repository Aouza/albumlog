import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRequiredEnv, readSessionToken } from "@/lib/auth/spotify";
import { prisma } from "@/lib/db/prisma";
import { getLatestSpotifyLibrarySyncStatus } from "@/lib/repositories/spotify-sync-repository";

export async function GET() {
  const cookieStore = await cookies();
  const session = await readSessionToken(
    cookieStore.get("albumlog_session")?.value,
    getRequiredEnv("AUTH_SESSION_SECRET"),
  );

  if (!session) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { spotifyUserId: session.id },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ sync: null });
  }

  return NextResponse.json({ sync: await getLatestSpotifyLibrarySyncStatus(user.id) });
}
