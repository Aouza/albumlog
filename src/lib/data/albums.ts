import type {
  Album,
  AlbumDetail,
  DashboardStats,
  LibraryEntry,
  LibraryFilters,
  UpdateUserAlbumInput,
  UserAlbum,
} from "@/types/album";

async function fetchSavedLibrary() {
  const response = await fetch("/api/spotify/saved-albums");

  if (response.status === 401 || response.status === 403) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Unable to load saved Spotify albums");
  }

  const payload = (await response.json()) as { albums: LibraryEntry[] };

  return payload.albums;
}

function matchesQuery(entry: LibraryEntry, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [entry.album.title, entry.album.artist, ...entry.album.genres]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

export async function searchAlbums(_query: string): Promise<Album[]> {
  const library = await fetchSavedLibrary();

  return library.filter((entry) => matchesQuery(entry, _query)).map((entry) => entry.album);
}

export async function searchCatalogAlbums(query: string): Promise<Album[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const response = await fetch(`/api/spotify/search-albums?q=${encodeURIComponent(normalizedQuery)}`);

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Unable to search Spotify albums");
  }

  const payload = (await response.json()) as { albums: Album[] };

  return payload.albums;
}

export async function getLibrary(
  _filters: LibraryFilters = { status: "all", query: "" },
): Promise<LibraryEntry[]> {
  const library = await fetchSavedLibrary();

  return library
    .filter((entry) => _filters.status === "all" || entry.userAlbum.status === _filters.status)
    .filter((entry) => matchesQuery(entry, _filters.query));
}

export async function getAlbumDetail(_id: string): Promise<AlbumDetail | null> {
  const response = await fetch(`/api/albums/${encodeURIComponent(_id)}`);

  if (response.status === 401 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to load album detail");
  }

  return (await response.json()) as AlbumDetail;
}

export async function updateUserAlbum(input: UpdateUserAlbumInput): Promise<UserAlbum> {
  const response = await fetch(`/api/albums/${encodeURIComponent(input.albumId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: input.status,
      rating: input.rating ?? null,
      review: input.review ?? "",
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;

    throw new Error(body?.message ?? "Nao foi possivel salvar sua entrada agora.");
  }

  const payload = (await response.json()) as { userAlbum: UserAlbum };

  return payload.userAlbum;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const library = await fetchSavedLibrary();
  const artists = new Set(library.map((entry) => entry.album.artist));

  return {
    totalAlbums: library.length,
    listenedAlbums: 0,
    totalArtists: artists.size,
    totalReviews: 0,
    estimatedHours: library.length,
    averageRating: 0,
  };
}
