export function getSpotifySyncErrorResponse() {
  return {
    status: 502,
    body: {
      error: "spotify_sync_failed",
      message: "Nao foi possivel atualizar sua biblioteca Spotify agora.",
    },
  };
}
