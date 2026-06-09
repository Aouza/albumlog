import { albumStatuses, type AlbumStatus } from "../../types/album";

const albumStatusSet = new Set<string>(albumStatuses);

export function isAlbumStatus(value: unknown): value is AlbumStatus {
  return typeof value === "string" && albumStatusSet.has(value);
}

export function normalizeAlbumStatus(value: unknown): AlbumStatus {
  return isAlbumStatus(value) ? value : "want_to_listen";
}
