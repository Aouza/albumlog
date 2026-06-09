import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readSessionToken } from "@/lib/auth/spotify";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("albumlog_session")?.value;
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    return NextResponse.json({ user: null });
  }

  const user = await readSessionToken(token, secret);

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const persistedUser = await prisma.user.findUnique({
    where: { spotifyUserId: user.id },
    select: { id: true, handle: true, displayName: true, avatarUrl: true },
  });

  return NextResponse.json({
    user: {
      id: persistedUser?.id ?? user.id,
      spotifyUserId: user.id,
      handle: persistedUser?.handle ?? null,
      name: persistedUser?.displayName ?? user.name,
      email: user.email,
      avatarUrl: persistedUser?.avatarUrl ?? user.avatarUrl,
      hasSpotifyLibraryScope: user.spotifyScope?.split(" ").includes("user-library-read") ?? false,
    },
  });
}
