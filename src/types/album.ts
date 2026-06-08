export type AlbumStatus =
  | "want_to_listen"
  | "listening"
  | "listened"
  | "favorite"
  | "abandoned"
  | "relisten";

export type Album = {
  id: string;
  spotifyId: string;
  title: string;
  artist: string;
  coverUrl: string;
  releaseDate: string;
  genres: string[];
  externalUrl: string;
};

export type UserAlbum = {
  id: string;
  userId: string;
  albumId: string;
  status: AlbumStatus;
  rating: number | null;
  review: string;
  listenedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LibraryEntry = {
  album: Album;
  userAlbum: UserAlbum;
};

export type AlbumDetail = {
  album: Album;
  userAlbum: UserAlbum | null;
};

export type LibraryFilters = {
  status: AlbumStatus | "all";
  query: string;
};

export type UpdateUserAlbumInput = {
  albumId: string;
  status: AlbumStatus;
  rating?: number | null;
  review?: string;
};

export type DashboardStats = {
  totalAlbums: number;
  listenedAlbums: number;
  totalArtists: number;
  totalReviews: number;
  estimatedHours: number;
  averageRating: number;
};

export const albumStatusLabels: Record<AlbumStatus, string> = {
  want_to_listen: "Quero ouvir",
  listening: "Ouvindo",
  listened: "Ouvido",
  favorite: "Favorito",
  abandoned: "Abandonado",
  relisten: "Reouvir",
};

export const albumStatuses = Object.keys(albumStatusLabels) as AlbumStatus[];
