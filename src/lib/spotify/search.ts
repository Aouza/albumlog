import type { Album } from "@/types/album";

export type SpotifySearchAlbum = {
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

type SpotifySearchResponse = {
  albums: {
    items: SpotifySearchAlbum[];
  };
};

export function mapSpotifySearchAlbum(album: SpotifySearchAlbum): Album {
  return {
    id: album.id,
    spotifyId: album.id,
    title: album.name,
    artist: album.artists.map((artist) => artist.name).join(", "),
    coverUrl: album.images[0]?.url ?? "",
    releaseDate: album.release_date,
    genres: album.genres ?? [],
    externalUrl: album.external_urls.spotify ?? "",
  };
}

export async function fetchCatalogAlbums(accessToken: string, query: string, limit = 10) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", normalizedQuery);
  url.searchParams.set("type", "album");
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Spotify album search request failed");
  }

  const payload = (await response.json()) as SpotifySearchResponse;

  return payload.albums.items.map(mapSpotifySearchAlbum);
}
