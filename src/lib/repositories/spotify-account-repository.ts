import type { SpotifySession, SpotifyTokenResponse } from "@/lib/auth/spotify";
import { prisma } from "@/lib/db/prisma";
import { encryptToken } from "@/lib/security/token-crypto";

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
      displayName: profile.name,
      avatarUrl: profile.avatarUrl,
    },
  });

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

  return user;
}
