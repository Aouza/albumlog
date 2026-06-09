-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "spotifyUserId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyUserId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "accessTokenEncrypted" TEXT NOT NULL,
    "refreshTokenEncrypted" TEXT,
    "scope" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastProfileSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "spotifyAlbumId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "spotifyUrl" TEXT NOT NULL,
    "releaseDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAlbum" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "review" TEXT NOT NULL DEFAULT '',
    "listenedAt" TIMESTAMP(3),
    "spotifySavedAt" TIMESTAMP(3),
    "removedFromSpotify" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyLibrarySync" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "lastFullSyncedAt" TIMESTAMP(3),
    "totalImported" INTEGER NOT NULL DEFAULT 0,
    "totalUpdated" INTEGER NOT NULL DEFAULT 0,
    "totalMarkedRemoved" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyLibrarySync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_spotifyUserId_key" ON "User"("spotifyUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAccount_userId_key" ON "SpotifyAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAccount_spotifyUserId_key" ON "SpotifyAccount"("spotifyUserId");

-- CreateIndex
CREATE INDEX "SpotifyAccount_spotifyUserId_idx" ON "SpotifyAccount"("spotifyUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Album_spotifyAlbumId_key" ON "Album"("spotifyAlbumId");

-- CreateIndex
CREATE INDEX "UserAlbum_userId_spotifySavedAt_idx" ON "UserAlbum"("userId", "spotifySavedAt");

-- CreateIndex
CREATE INDEX "UserAlbum_userId_status_idx" ON "UserAlbum"("userId", "status");

-- CreateIndex
CREATE INDEX "UserAlbum_albumId_idx" ON "UserAlbum"("albumId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAlbum_userId_albumId_key" ON "UserAlbum"("userId", "albumId");

-- CreateIndex
CREATE INDEX "SpotifyLibrarySync_userId_startedAt_idx" ON "SpotifyLibrarySync"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "SpotifyLibrarySync_status_idx" ON "SpotifyLibrarySync"("status");

-- AddForeignKey
ALTER TABLE "SpotifyAccount" ADD CONSTRAINT "SpotifyAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlbum" ADD CONSTRAINT "UserAlbum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlbum" ADD CONSTRAINT "UserAlbum_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifyLibrarySync" ADD CONSTRAINT "SpotifyLibrarySync_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
