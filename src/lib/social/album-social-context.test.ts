import { describe, expect, it } from "vitest";
import { getLimitedAlbumContextIds } from "./album-social-context";

describe("album social context", () => {
  it("deduplicates ids and keeps the request bounded", () => {
    const ids = ["a", "b", "a", "c", "d"];

    expect(getLimitedAlbumContextIds(ids, 3)).toEqual(["a", "b", "c"]);
  });

  it("removes empty ids", () => {
    expect(getLimitedAlbumContextIds(["", "album", "  ", "album"], 10)).toEqual(["album"]);
  });
});
