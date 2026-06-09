import { prisma } from "@/lib/db/prisma";
import { mapPersistedUserAlbumToLibraryEntry } from "@/lib/repositories/library-mapper";
import { canViewAlbumsInCommon, getProfileRelationship } from "@/lib/users/profile-relationship";
import type { AlbumInCommon, PublicUserProfile, UserProfilePayload } from "@/types/user-profile";

function mapPublicUserProfile(user: {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
}): PublicUserProfile {
  return {
    id: user.id,
    name: user.displayName,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
  };
}

async function getConnectionStatus(currentUserId: string | null, profileUserId: string) {
  if (!currentUserId || currentUserId === profileUserId) {
    return null;
  }

  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: currentUserId, receiverId: profileUserId },
        { requesterId: profileUserId, receiverId: currentUserId },
      ],
    },
    select: { status: true },
  });

  return connection?.status ?? null;
}

async function getAlbumsInCommon(
  currentUserId: string,
  profileUserId: string,
): Promise<AlbumInCommon[]> {
  const currentUserAlbums = await prisma.userAlbum.findMany({
    where: {
      userId: currentUserId,
      removedFromSpotify: false,
    },
    include: { album: true },
    orderBy: { spotifySavedAt: "desc" },
  });
  const currentUserAlbumByAlbumId = new Map(
    currentUserAlbums.map((userAlbum) => [userAlbum.albumId, userAlbum]),
  );
  const profileUserAlbums = await prisma.userAlbum.findMany({
    where: {
      userId: profileUserId,
      removedFromSpotify: false,
      albumId: { in: Array.from(currentUserAlbumByAlbumId.keys()) },
    },
    include: { album: true },
    orderBy: { spotifySavedAt: "desc" },
  });

  return profileUserAlbums.flatMap((profileUserAlbum) => {
    const currentUserAlbum = currentUserAlbumByAlbumId.get(profileUserAlbum.albumId);

    if (!currentUserAlbum) {
      return [];
    }

    const currentEntry = mapPersistedUserAlbumToLibraryEntry(currentUserId, currentUserAlbum);
    const profileEntry = mapPersistedUserAlbumToLibraryEntry(profileUserId, profileUserAlbum);

    return [
      {
        album: profileEntry.album,
        currentUserAlbum: currentEntry.userAlbum,
        profileUserAlbum: profileEntry.userAlbum,
      },
    ];
  });
}

export async function getUserProfileByHandle(
  handle: string,
  currentUserId: string | null,
): Promise<UserProfilePayload | null> {
  const user = await prisma.user.findUnique({
    where: { handle },
    select: {
      id: true,
      displayName: true,
      handle: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    return null;
  }

  const connectionStatus = await getConnectionStatus(currentUserId, user.id);
  const relationship = getProfileRelationship({
    currentUserId,
    profileUserId: user.id,
    connectionStatus: connectionStatus as Parameters<typeof getProfileRelationship>[0]["connectionStatus"],
  });
  const albumsInCommon =
    currentUserId && canViewAlbumsInCommon(relationship)
      ? await getAlbumsInCommon(currentUserId, user.id)
      : [];

  return {
    user: mapPublicUserProfile(user),
    relationship,
    albumsInCommon,
    albumsInCommonTotal: albumsInCommon.length,
  };
}
