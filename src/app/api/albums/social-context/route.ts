import { NextResponse } from "next/server";
import { getCurrentAlbumLogUser } from "@/lib/auth/current-user";
import { getAlbumSocialContext } from "@/lib/repositories/album-social-context-repository";
import {
  ALBUM_SOCIAL_CONTEXT_MAX_IDS,
  getLimitedAlbumContextIds,
} from "@/lib/social/album-social-context";

export async function POST(request: Request) {
  const user = await getCurrentAlbumLogUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { albumIds?: unknown } | null;

  if (!Array.isArray(body?.albumIds)) {
    return NextResponse.json(
      { error: "invalid_album_ids", message: "Informe uma lista de albuns valida." },
      { status: 400 },
    );
  }

  const albumIds = getLimitedAlbumContextIds(
    body.albumIds.filter((albumId): albumId is string => typeof albumId === "string"),
  );

  if (body.albumIds.length > ALBUM_SOCIAL_CONTEXT_MAX_IDS) {
    return NextResponse.json(
      {
        error: "too_many_album_ids",
        message: `Envie no maximo ${ALBUM_SOCIAL_CONTEXT_MAX_IDS} albuns por requisicao.`,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(await getAlbumSocialContext(user.id, albumIds));
}
