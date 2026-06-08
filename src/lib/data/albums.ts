import type {
  Album,
  AlbumDetail,
  DashboardStats,
  LibraryEntry,
  LibraryFilters,
  UpdateUserAlbumInput,
  UserAlbum,
} from "@/types/album";

export async function searchAlbums(_query: string): Promise<Album[]> {
  void _query;

  return [];
}

export async function getLibrary(
  _filters: LibraryFilters = { status: "all", query: "" },
): Promise<LibraryEntry[]> {
  void _filters;

  return [];
}

export async function getAlbumDetail(_id: string): Promise<AlbumDetail | null> {
  void _id;

  return null;
}

export async function updateUserAlbum(input: UpdateUserAlbumInput): Promise<UserAlbum> {
  throw new Error(`Album updates require a real catalog entry: ${input.albumId}`);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    totalAlbums: 0,
    listenedAlbums: 0,
    totalArtists: 0,
    totalReviews: 0,
    estimatedHours: 0,
    averageRating: 0,
  };
}
