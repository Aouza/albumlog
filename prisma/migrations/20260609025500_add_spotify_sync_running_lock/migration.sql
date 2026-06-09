-- Prevent concurrent Spotify library syncs for the same user.
CREATE UNIQUE INDEX "SpotifyLibrarySync_userId_syncing_key"
ON "SpotifyLibrarySync"("userId")
WHERE "status" = 'syncing';
