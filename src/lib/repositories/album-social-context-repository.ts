import type { AlbumSocialContextPayload } from "@/types/album-social-context";
import { prisma } from "@/lib/db/prisma";
import {
  ALBUM_SOCIAL_CONTEXT_VISIBLE_CONNECTIONS,
  getLimitedAlbumContextIds,
} from "@/lib/social/album-social-context";

function getConnectionUserId(
  connection: { requesterId: string; receiverId: string },
  currentUserId: string,
) {
  return connection.requesterId === currentUserId ? connection.receiverId : connection.requesterId;
}

export async function getAlbumSocialContext(
  currentUserId: string,
  spotifyAlbumIds: string[],
): Promise<AlbumSocialContextPayload> {
  const albumIds = getLimitedAlbumContextIds(spotifyAlbumIds);

  if (albumIds.length === 0) {
    return { albums: {} };
  }

  const connections = await prisma.connection.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: currentUserId }, { receiverId: currentUserId }],
    },
    select: { requesterId: true, receiverId: true },
  });
  const connectionUserIds = connections.map((connection) =>
    getConnectionUserId(connection, currentUserId),
  );

  if (connectionUserIds.length === 0) {
    return { albums: Object.fromEntries(albumIds.map((id) => [id, { connections: [], total: 0 }])) };
  }

  const friendAlbums = await prisma.userAlbum.findMany({
    where: {
      userId: { in: connectionUserIds },
      removedFromSpotify: false,
      album: { spotifyAlbumId: { in: albumIds } },
    },
    include: {
      album: { select: { spotifyAlbumId: true } },
      user: { select: { id: true, displayName: true, handle: true, avatarUrl: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  const grouped = new Map<
    string,
    {
      usersById: Map<string, { id: string; name: string; handle: string; avatarUrl: string }>;
    }
  >();

  for (const friendAlbum of friendAlbums) {
    const spotifyAlbumId = friendAlbum.album.spotifyAlbumId;
    const group = grouped.get(spotifyAlbumId) ?? { usersById: new Map() };

    group.usersById.set(friendAlbum.user.id, {
      id: friendAlbum.user.id,
      name: friendAlbum.user.displayName,
      handle: friendAlbum.user.handle,
      avatarUrl: friendAlbum.user.avatarUrl,
    });
    grouped.set(spotifyAlbumId, group);
  }

  return {
    albums: Object.fromEntries(
      albumIds.map((spotifyAlbumId) => {
        const connectionsForAlbum = Array.from(
          grouped.get(spotifyAlbumId)?.usersById.values() ?? [],
        );

        return [
          spotifyAlbumId,
          {
            connections: connectionsForAlbum.slice(0, ALBUM_SOCIAL_CONTEXT_VISIBLE_CONNECTIONS),
            total: connectionsForAlbum.length,
          },
        ];
      }),
    ),
  };
}
