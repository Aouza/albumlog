import { NextResponse } from "next/server";
import { getCurrentAlbumLogUser } from "@/lib/auth/current-user";
import { listOutgoingAlbumRecommendations } from "@/lib/repositories/recommendation-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ spotifyAlbumId: string }> },
) {
  const user = await getCurrentAlbumLogUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    outgoing: await listOutgoingAlbumRecommendations(
      user.id,
      decodeURIComponent((await params).spotifyAlbumId),
    ),
  });
}
