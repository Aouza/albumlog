import { NextResponse } from "next/server";
import { getCurrentAlbumLogUser } from "@/lib/auth/current-user";
import { getAlbumDetailForUser } from "@/lib/repositories/album-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ spotifyAlbumId: string }> },
) {
  const user = await getCurrentAlbumLogUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const detail = await getAlbumDetailForUser(user.id, decodeURIComponent((await params).spotifyAlbumId));

  if (!detail) {
    return NextResponse.json({ error: "album_not_found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}
