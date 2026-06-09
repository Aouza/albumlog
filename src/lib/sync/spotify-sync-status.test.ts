import { describe, expect, it } from "vitest";
import { mapSpotifySyncStatus } from "./spotify-sync-status";

describe("mapSpotifySyncStatus", () => {
  it("returns null when the user has no sync runs", () => {
    expect(mapSpotifySyncStatus(null)).toBeNull();
  });

  it("serializes the latest sync run for the client", () => {
    expect(
      mapSpotifySyncStatus({
        status: "idle",
        syncType: "manual_full",
        startedAt: new Date("2026-06-08T22:00:00.000Z"),
        finishedAt: new Date("2026-06-08T22:01:00.000Z"),
        lastSyncedAt: new Date("2026-06-08T22:01:00.000Z"),
        lastFullSyncedAt: new Date("2026-06-08T22:01:00.000Z"),
        totalImported: 12,
        totalUpdated: 0,
        totalMarkedRemoved: 2,
        errorMessage: null,
      }),
    ).toEqual({
      status: "idle",
      syncType: "manual_full",
      startedAt: "2026-06-08T22:00:00.000Z",
      finishedAt: "2026-06-08T22:01:00.000Z",
      lastSyncedAt: "2026-06-08T22:01:00.000Z",
      lastFullSyncedAt: "2026-06-08T22:01:00.000Z",
      totalImported: 12,
      totalUpdated: 0,
      totalMarkedRemoved: 2,
      errorMessage: null,
    });
  });
});
