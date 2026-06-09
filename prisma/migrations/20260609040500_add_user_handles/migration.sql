-- Add a stable public handle for user discovery and future profile URLs.
ALTER TABLE "User" ADD COLUMN "handle" TEXT;

UPDATE "User"
SET "handle" = lower(regexp_replace("id", '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "handle" IS NULL;

ALTER TABLE "User" ALTER COLUMN "handle" SET NOT NULL;

CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");
