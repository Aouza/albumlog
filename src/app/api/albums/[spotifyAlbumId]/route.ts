import { NextResponse } from "next/server";
import { getCurrentAlbumLogUser } from "@/lib/auth/current-user";
import { isAlbumStatus } from "@/lib/albums/album-status";
import { getAlbumDetailForUser } from "@/lib/repositories/album-repository";
import {
  updateUserAlbumEntry,
  UserAlbumCatalogEntryNotFoundError,
} from "@/lib/repositories/user-album-repository";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ spotifyAlbumId: string }> },
) {
  const user = await getCurrentAlbumLogUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    status?: unknown;
    rating?: unknown;
    review?: unknown;
  } | null;

  if (!isAlbumStatus(body?.status)) {
    return NextResponse.json(
      { error: "invalid_status", message: "Informe um status valido." },
      { status: 400 },
    );
  }

  if (
    body.rating !== undefined &&
    body.rating !== null &&
    (typeof body.rating !== "number" || body.rating < 0.5 || body.rating > 5)
  ) {
    return NextResponse.json(
      { error: "invalid_rating", message: "Informe uma nota entre 0.5 e 5.0." },
      { status: 400 },
    );
  }

  try {
    const userAlbum = await updateUserAlbumEntry({
      userId: user.id,
      spotifyAlbumId: decodeURIComponent((await params).spotifyAlbumId),
      status: body.status,
      rating: typeof body.rating === "number" ? body.rating : null,
      review: typeof body.review === "string" ? body.review : "",
    });

    return NextResponse.json({ userAlbum });
  } catch (error) {
    if (error instanceof UserAlbumCatalogEntryNotFoundError) {
      return NextResponse.json(
        {
          error: "album_not_found",
          message: "Album nao encontrado no catalogo do AlbumLog.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: "album_update_failed",
        message: "Nao foi possivel salvar sua entrada agora.",
      },
      { status: 500 },
    );
  }
}
