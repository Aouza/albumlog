import { cookies } from "next/headers";
import { getRequiredEnv, readSessionToken } from "@/lib/auth/spotify";
import { prisma } from "@/lib/db/prisma";

export async function getCurrentAlbumLogUser() {
  const cookieStore = await cookies();
  const session = await readSessionToken(
    cookieStore.get("albumlog_session")?.value,
    getRequiredEnv("AUTH_SESSION_SECRET"),
  );

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { spotifyUserId: session.id },
    select: {
      id: true,
      spotifyUserId: true,
      displayName: true,
      avatarUrl: true,
    },
  });
}
