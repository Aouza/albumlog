import type { User } from "@/types/user";
import type {
  Album,
  AlbumDetail,
  DashboardStats,
  LibraryEntry,
  LibraryFilters,
  UpdateUserAlbumInput,
  UserAlbum,
} from "@/types/album";

export const currentUser: User = {
  id: "user-alison",
  name: "Alison",
  email: "alison@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  createdAt: "2026-01-04T10:00:00.000Z",
};

const albums: Album[] = [
  {
    id: "the-dark-pool",
    spotifyId: "spotify-the-dark-pool",
    title: "The Dark Pool",
    artist: "Thornhill",
    coverUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80",
    releaseDate: "2019-10-25",
    genres: ["Metalcore", "Alternative metal"],
    externalUrl: "https://open.spotify.com",
  },
  {
    id: "heroine",
    spotifyId: "spotify-heroine",
    title: "Heroine",
    artist: "Thornhill",
    coverUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
    releaseDate: "2022-06-03",
    genres: ["Alternative rock", "Metalcore"],
    externalUrl: "https://open.spotify.com",
  },
  {
    id: "bodies",
    spotifyId: "spotify-bodies",
    title: "Bodies",
    artist: "Thornhill",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80",
    releaseDate: "2025-04-04",
    genres: ["Alternative metal"],
    externalUrl: "https://open.spotify.com",
  },
  {
    id: "blackwater-park",
    spotifyId: "spotify-blackwater-park",
    title: "Blackwater Park",
    artist: "Opeth",
    coverUrl: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=600&q=80",
    releaseDate: "2001-03-12",
    genres: ["Progressive metal", "Death metal"],
    externalUrl: "https://open.spotify.com",
  },
  {
    id: "kind-of-blue",
    spotifyId: "spotify-kind-of-blue",
    title: "Kind of Blue",
    artist: "Miles Davis",
    coverUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80",
    releaseDate: "1959-08-17",
    genres: ["Jazz", "Modal jazz"],
    externalUrl: "https://open.spotify.com",
  },
  {
    id: "ants-from-up-there",
    spotifyId: "spotify-ants-from-up-there",
    title: "Ants From Up There",
    artist: "Black Country, New Road",
    coverUrl: "https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=600&q=80",
    releaseDate: "2022-02-04",
    genres: ["Art rock", "Post-rock"],
    externalUrl: "https://open.spotify.com",
  },
];

const initialLibrary: UserAlbum[] = [
  {
    id: "entry-dark-pool",
    userId: currentUser.id,
    albumId: "the-dark-pool",
    status: "favorite",
    rating: 4.5,
    review: "Excelente producao. Atmosfera pesada e emocional.",
    listenedAt: "2026-05-18T19:30:00.000Z",
    createdAt: "2026-05-12T12:00:00.000Z",
    updatedAt: "2026-05-18T21:00:00.000Z",
  },
  {
    id: "entry-heroine",
    userId: currentUser.id,
    albumId: "heroine",
    status: "listening",
    rating: null,
    review: "",
    listenedAt: null,
    createdAt: "2026-06-02T16:00:00.000Z",
    updatedAt: "2026-06-03T10:00:00.000Z",
  },
  {
    id: "entry-kind-of-blue",
    userId: currentUser.id,
    albumId: "kind-of-blue",
    status: "listened",
    rating: 5,
    review: "Um daqueles discos que parece mudar o ar da sala.",
    listenedAt: "2026-04-03T22:00:00.000Z",
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-03T23:00:00.000Z",
  },
  {
    id: "entry-ants",
    userId: currentUser.id,
    albumId: "ants-from-up-there",
    status: "want_to_listen",
    rating: null,
    review: "",
    listenedAt: null,
    createdAt: "2026-06-06T09:00:00.000Z",
    updatedAt: "2026-06-06T09:00:00.000Z",
  },
];

let library = structuredClone(initialLibrary);

function wait<T>(value: T) {
  return new Promise<T>((resolve) => {
    globalThis.setTimeout(() => resolve(value), 120);
  });
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function findAlbum(albumId: string) {
  return albums.find((album) => album.id === albumId) ?? null;
}

function toLibraryEntry(userAlbum: UserAlbum): LibraryEntry | null {
  const album = findAlbum(userAlbum.albumId);

  if (!album) {
    return null;
  }

  return { album, userAlbum };
}

export function resetMockLibrary() {
  library = structuredClone(initialLibrary);
}

export async function searchAlbums(query: string) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return wait(albums);
  }

  return wait(
    albums.filter((album) =>
      [album.title, album.artist, ...album.genres]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    ),
  );
}

export async function getLibrary(filters: LibraryFilters = { status: "all", query: "" }) {
  const normalizedQuery = normalize(filters.query);

  const entries = library
    .map(toLibraryEntry)
    .filter((entry): entry is LibraryEntry => Boolean(entry))
    .filter((entry) => filters.status === "all" || entry.userAlbum.status === filters.status)
    .filter((entry) => {
      if (!normalizedQuery) {
        return true;
      }

      return [entry.album.title, entry.album.artist, ...entry.album.genres]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .sort((a, b) => b.userAlbum.updatedAt.localeCompare(a.userAlbum.updatedAt));

  return wait(entries);
}

export async function getAlbumDetail(id: string): Promise<AlbumDetail | null> {
  const album = findAlbum(id);

  if (!album) {
    return wait(null);
  }

  return wait({
    album,
    userAlbum: library.find((entry) => entry.albumId === id) ?? null,
  });
}

export async function updateUserAlbum(input: UpdateUserAlbumInput) {
  const now = new Date().toISOString();
  const existing = library.find((entry) => entry.albumId === input.albumId);
  const listenedAt =
    input.status === "listened" || input.status === "favorite" ? (existing?.listenedAt ?? now) : null;

  const nextEntry: UserAlbum = {
    id: existing?.id ?? `entry-${input.albumId}`,
    userId: currentUser.id,
    albumId: input.albumId,
    status: input.status,
    rating: input.rating ?? existing?.rating ?? null,
    review: input.review ?? existing?.review ?? "",
    listenedAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    library = library.map((entry) => (entry.albumId === input.albumId ? nextEntry : entry));
  } else {
    library = [nextEntry, ...library];
  }

  return wait(nextEntry);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const entries = library.map(toLibraryEntry).filter((entry): entry is LibraryEntry => Boolean(entry));
  const ratedEntries = entries.filter((entry) => entry.userAlbum.rating);
  const totalRating = ratedEntries.reduce((sum, entry) => sum + (entry.userAlbum.rating ?? 0), 0);
  const artists = new Set(entries.map((entry) => entry.album.artist));

  return wait({
    totalAlbums: entries.length,
    listenedAlbums: entries.filter((entry) =>
      ["listened", "favorite", "relisten"].includes(entry.userAlbum.status),
    ).length,
    totalArtists: artists.size,
    totalReviews: entries.filter((entry) => entry.userAlbum.review.trim()).length,
    estimatedHours: entries.length * 1,
    averageRating: ratedEntries.length ? Number((totalRating / ratedEntries.length).toFixed(1)) : 0,
  });
}
