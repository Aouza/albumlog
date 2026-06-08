import { describe, expect, it } from "vitest";
import { mapSpotifySavedAlbum } from "./albums";

describe("Spotify saved albums mapper", () => {
  it("maps a saved Spotify album into AlbumLog library entry shape", () => {
    const entry = mapSpotifySavedAlbum({
      added_at: "2026-06-08T12:00:00Z",
      album: {
        id: "spotify-album-id",
        name: "Album Name",
        artists: [{ name: "Artist One" }, { name: "Artist Two" }],
        images: [{ url: "https://i.scdn.co/image/cover", height: 640, width: 640 }],
        release_date: "2026-01-01",
        external_urls: { spotify: "https://open.spotify.com/album/spotify-album-id" },
        genres: ["rock"],
      },
    });

    expect(entry.album).toEqual({
      id: "spotify-album-id",
      spotifyId: "spotify-album-id",
      title: "Album Name",
      artist: "Artist One, Artist Two",
      coverUrl: "https://i.scdn.co/image/cover",
      releaseDate: "2026-01-01",
      genres: ["rock"],
      externalUrl: "https://open.spotify.com/album/spotify-album-id",
    });
    expect(entry.userAlbum.status).toBe("want_to_listen");
    expect(entry.userAlbum.rating).toBeNull();
    expect(entry.userAlbum.review).toBe("");
    expect(entry.userAlbum.createdAt).toBe("2026-06-08T12:00:00Z");
  });
});
