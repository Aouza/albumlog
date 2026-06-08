import type { Album, LibraryEntry } from "@/types/album";

export type SpotifySavedAlbum = {
  added_at: string;
  album: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    images: Array<{ url: string; height: number | null; width: number | null }>;
    release_date: string;
    external_urls: {
      spotify?: string;
    };
    genres?: string[];
  };
};

export type SpotifySavedAlbumsResponse = {
  items: SpotifySavedAlbum[];
  next: string | null;
  total: number;
};

export function mapSpotifySavedAlbum(savedAlbum: SpotifySavedAlbum): LibraryEntry {
  const album: Album = {
    id: savedAlbum.album.id,
    spotifyId: savedAlbum.album.id,
    title: savedAlbum.album.name,
    artist: savedAlbum.album.artists.map((artist) => artist.name).join(", "),
    coverUrl: savedAlbum.album.images[0]?.url ?? "",
    releaseDate: savedAlbum.album.release_date,
    genres: savedAlbum.album.genres ?? [],
    externalUrl: savedAlbum.album.external_urls.spotify ?? "",
  };

  return {
    album,
    userAlbum: {
      id: `spotify-saved-${album.id}`,
      userId: "spotify-current-user",
      albumId: album.id,
      status: "want_to_listen",
      rating: null,
      review: "",
      listenedAt: null,
      createdAt: savedAlbum.added_at,
      updatedAt: savedAlbum.added_at,
    },
  };
}

export async function fetchSavedAlbums(accessToken: string, limit = 50) {
  const firstPageUrl = new URL("https://api.spotify.com/v1/me/albums");
  const albums: LibraryEntry[] = [];
  let nextUrl: string | null = firstPageUrl.toString();

  firstPageUrl.searchParams.set("limit", String(limit));
  nextUrl = firstPageUrl.toString();

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Spotify saved albums request failed");
    }

    const payload = (await response.json()) as SpotifySavedAlbumsResponse;

    albums.push(...payload.items.map(mapSpotifySavedAlbum));
    nextUrl = payload.next;
  }

  return albums;
}
