import { describe, expect, it } from "vitest";
import { SyncAlreadyRunningError, getSpotifySyncErrorResponse } from "./spotify-sync-errors";

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

  it("returns a conflict response when the user already has a running sync", () => {
    expect(getSpotifySyncErrorResponse(new SyncAlreadyRunningError())).toEqual({
      status: 409,
      body: {
        error: "sync_already_running",
        message: "Sua biblioteca Spotify ja esta sendo atualizada.",
      },
    });
  });
});
