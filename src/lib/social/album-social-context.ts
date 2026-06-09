export const ALBUM_SOCIAL_CONTEXT_MAX_IDS = 300;
export const ALBUM_SOCIAL_CONTEXT_VISIBLE_CONNECTIONS = 4;

export function getLimitedAlbumContextIds(
  spotifyAlbumIds: string[],
  limit = ALBUM_SOCIAL_CONTEXT_MAX_IDS,
) {
  const uniqueIds = new Set<string>();

  for (const id of spotifyAlbumIds) {
    const normalizedId = id.trim();

    if (normalizedId) {
      uniqueIds.add(normalizedId);
    }

    if (uniqueIds.size >= limit) {
      break;
    }
  }

  return Array.from(uniqueIds);
}
