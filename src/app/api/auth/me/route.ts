import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readSessionToken } from "@/lib/auth/spotify";

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

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      hasSpotifyLibraryScope: user.spotifyScope?.split(" ").includes("user-library-read") ?? false,
    },
  });
}
