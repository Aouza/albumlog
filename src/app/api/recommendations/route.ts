import { NextResponse } from "next/server";
import { getCurrentAlbumLogUser } from "@/lib/auth/current-user";
import { getRecommendationErrorResponse } from "@/lib/recommendations/recommendation-errors";
import {
  createAlbumRecommendations,
  listIncomingRecommendations,
} from "@/lib/repositories/recommendation-repository";

export async function GET() {
  const user = await getCurrentAlbumLogUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    recommendations: await listIncomingRecommendations(user.id),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentAlbumLogUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    spotifyAlbumId?: unknown;
    receiverIds?: unknown;
    message?: unknown;
  } | null;

  if (typeof body?.spotifyAlbumId !== "string") {
    return NextResponse.json(
      { error: "invalid_album", message: "Informe um album valido." },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(body.receiverIds) ||
    body.receiverIds.length === 0 ||
    body.receiverIds.some((receiverId) => typeof receiverId !== "string")
  ) {
    return NextResponse.json(
      { error: "invalid_receivers", message: "Escolha ao menos uma conexao." },
      { status: 400 },
    );
  }

  try {
    const outgoing = await createAlbumRecommendations({
      senderId: user.id,
      spotifyAlbumId: body.spotifyAlbumId,
      receiverIds: body.receiverIds,
      message: typeof body.message === "string" ? body.message : "",
    });

    return NextResponse.json({ outgoing }, { status: 201 });
  } catch (error) {
    const response = getRecommendationErrorResponse(error);

    return NextResponse.json(response.body, { status: response.status });
  }
}
