import { describe, expect, it } from "vitest";
import { isAlbumStatus, normalizeAlbumStatus } from "./album-status";

describe("album status", () => {
  it("accepts only current AlbumLog statuses", () => {
    expect(isAlbumStatus("want_to_listen")).toBe(true);
    expect(isAlbumStatus("listened")).toBe(true);
    expect(isAlbumStatus("favorite")).toBe(true);
    expect(isAlbumStatus("abandoned")).toBe(true);
    expect(isAlbumStatus("relisten")).toBe(true);
    expect(isAlbumStatus("listening")).toBe(false);
  });

  it("normalizes unsupported persisted statuses to want_to_listen", () => {
    expect(normalizeAlbumStatus("listening")).toBe("want_to_listen");
    expect(normalizeAlbumStatus("unknown")).toBe("want_to_listen");
    expect(normalizeAlbumStatus("favorite")).toBe("favorite");
  });
});
