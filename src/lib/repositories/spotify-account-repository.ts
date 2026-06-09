import crypto from "node:crypto";
import type { SpotifySession, SpotifyTokenResponse } from "@/lib/auth/spotify";
import { prisma } from "@/lib/db/prisma";
import { encryptToken } from "@/lib/security/token-crypto";
import { buildHandleCandidates } from "@/lib/users/handle";

async function createUniqueHandle(displayName: string) {
  const candidates = buildHandleCandidates(displayName);
  const existingHandles = await prisma.user.findMany({
    where: { handle: { in: candidates } },
    select: { handle: true },
  });
  const usedHandles = new Set(existingHandles.map((user) => user.handle));
  const handle = candidates.find((candidate) => !usedHandles.has(candidate));

  if (!handle) {
    return `${candidates[0]}-${crypto.randomUUID().slice(0, 8)}`;
  }

  return handle;
}

function isLegacyBackfillHandle(handle: string) {
  return handle.startsWith("cm") || handle.startsWith("demo-user-");
}

async function ensureFriendlyHandle(user: { id: string; handle: string; displayName: string }) {
  if (!isLegacyBackfillHandle(user.handle)) {
    return user.handle;
  }

  const handle = await createUniqueHandle(user.displayName);

  await prisma.user.update({
    where: { id: user.id },
    data: { handle },
  });

  return handle;
}

export async function upsertSpotifyAccount({
  profile,
  token,
  tokenEncryptionSecret,
}: {
  profile: SpotifySession;
  token: SpotifyTokenResponse;
  tokenEncryptionSecret: string;
}) {
  const user = await prisma.user.upsert({
    where: { spotifyUserId: profile.id },
    update: {
      displayName: profile.name,
      avatarUrl: profile.avatarUrl,
    },
    create: {
      spotifyUserId: profile.id,
      handle: await createUniqueHandle(profile.name),
      displayName: profile.name,
      avatarUrl: profile.avatarUrl,
    },
  });
  const handle = await ensureFriendlyHandle(user);

  await prisma.spotifyAccount.upsert({
    where: { userId: user.id },
    update: {
      spotifyUserId: profile.id,
      displayName: profile.name,
      avatarUrl: profile.avatarUrl,
      accessTokenEncrypted: encryptToken(token.access_token, tokenEncryptionSecret),
      refreshTokenEncrypted: token.refresh_token
        ? encryptToken(token.refresh_token, tokenEncryptionSecret)
        : undefined,
      scope: token.scope,
      tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
      lastProfileSyncedAt: new Date(),
    },
    create: {
      userId: user.id,
      spotifyUserId: profile.id,
      displayName: profile.name,
      avatarUrl: profile.avatarUrl,
      accessTokenEncrypted: encryptToken(token.access_token, tokenEncryptionSecret),
      refreshTokenEncrypted: token.refresh_token
        ? encryptToken(token.refresh_token, tokenEncryptionSecret)
        : null,
      scope: token.scope,
      tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
    },
  });

  return { ...user, handle };
}
