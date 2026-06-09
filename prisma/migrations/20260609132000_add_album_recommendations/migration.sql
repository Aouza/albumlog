CREATE TABLE "AlbumRecommendation" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlbumRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AlbumRecommendation_senderId_status_idx" ON "AlbumRecommendation"("senderId", "status");
CREATE INDEX "AlbumRecommendation_receiverId_status_idx" ON "AlbumRecommendation"("receiverId", "status");
CREATE INDEX "AlbumRecommendation_albumId_idx" ON "AlbumRecommendation"("albumId");

CREATE UNIQUE INDEX "AlbumRecommendation_pending_unique"
ON "AlbumRecommendation"("senderId", "receiverId", "albumId")
WHERE "status" = 'pending';

ALTER TABLE "AlbumRecommendation"
ADD CONSTRAINT "AlbumRecommendation_senderId_fkey"
FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AlbumRecommendation"
ADD CONSTRAINT "AlbumRecommendation_receiverId_fkey"
FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AlbumRecommendation"
ADD CONSTRAINT "AlbumRecommendation_albumId_fkey"
FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
