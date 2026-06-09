import { describe, expect, it } from "vitest";
import { getSpotifySyncErrorResponse } from "./spotify-sync-errors";

describe("getSpotifySyncErrorResponse", () => {
  it("returns a safe response for unexpected sync failures", () => {
    expect(getSpotifySyncErrorResponse(new Error("database password leaked in stack"))).toEqual({
      status: 502,
      body: {
        error: "spotify_sync_failed",
        message: "Nao foi possivel atualizar sua biblioteca Spotify agora.",
      },
    });
  });
});
