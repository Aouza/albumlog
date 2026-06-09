export class SyncAlreadyRunningError extends Error {
  constructor() {
    super("Spotify library sync already running");
    this.name = "SyncAlreadyRunningError";
  }
}

export function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export function getSpotifySyncErrorResponse(error?: unknown) {
  if (error instanceof SyncAlreadyRunningError) {
    return {
      status: 409,
      body: {
        error: "sync_already_running",
        message: "Sua biblioteca Spotify ja esta sendo atualizada.",
      },
    };
  }

  return {
    status: 502,
    body: {
      error: "spotify_sync_failed",
      message: "Nao foi possivel atualizar sua biblioteca Spotify agora.",
    },
  };
}
