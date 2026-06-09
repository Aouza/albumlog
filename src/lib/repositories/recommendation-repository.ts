import type { AlbumRecommendationStatus } from "@/lib/recommendations/recommendation-rules";
import type { AlbumRecommendationItem } from "@/types/recommendation";
import { prisma } from "@/lib/db/prisma";
import {
  RecommendationAlbumNotFoundError,
  RecommendationConnectionRequiredError,
  RecommendationForbiddenError,
  RecommendationNotFoundError,
} from "@/lib/recommendations/recommendation-errors";
import { getRecommendationLibraryDefaults } from "@/lib/recommendations/recommendation-library";
import {
  canCancelRecommendation,
  canRespondToRecommendation,
  ensureCanSendRecommendation,
} from "@/lib/recommendations/recommendation-rules";
import { mapPersistedAlbumToAlbum } from "@/lib/repositories/library-mapper";

type RecommendationRecord = {
  id: string;
  status: string;
  message: string;
  createdAt: Date;
  respondedAt: Date | null;
  sender: RecommendationUserRecord;
  receiver: RecommendationUserRecord;
  album: {
    spotifyAlbumId: string;
    title: string;
    artistName: string;
    coverUrl: string;
    releaseDate: string;
    spotifyUrl: string;
  };
};

type RecommendationUserRecord = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
};

function mapRecommendation(recommendation: RecommendationRecord): AlbumRecommendationItem {
  return {
    id: recommendation.id,
    status: recommendation.status as AlbumRecommendationStatus,
    message: recommendation.message,
    createdAt: recommendation.createdAt.toISOString(),
    respondedAt: recommendation.respondedAt?.toISOString() ?? null,
    album: mapPersistedAlbumToAlbum(recommendation.album),
    sender: {
      id: recommendation.sender.id,
      name: recommendation.sender.displayName,
      handle: recommendation.sender.handle,
      avatarUrl: recommendation.sender.avatarUrl,
    },
    receiver: {
      id: recommendation.receiver.id,
      name: recommendation.receiver.displayName,
      handle: recommendation.receiver.handle,
      avatarUrl: recommendation.receiver.avatarUrl,
    },
  };
}

async function assertAcceptedConnections(senderId: string, receiverIds: string[]) {
  const connections = await prisma.connection.findMany({
    where: {
      status: "accepted",
      OR: [
        { requesterId: senderId, receiverId: { in: receiverIds } },
        { receiverId: senderId, requesterId: { in: receiverIds } },
      ],
    },
    select: { requesterId: true, receiverId: true },
  });
  const connectedUserIds = new Set(
    connections.map((connection) =>
      connection.requesterId === senderId ? connection.receiverId : connection.requesterId,
    ),
  );

  if (receiverIds.some((receiverId) => !connectedUserIds.has(receiverId))) {
    throw new RecommendationConnectionRequiredError();
  }
}

export async function createAlbumRecommendations({
  senderId,
  spotifyAlbumId,
  receiverIds,
  message = "",
}: {
  senderId: string;
  spotifyAlbumId: string;
  receiverIds: string[];
  message?: string;
}) {
  const uniqueReceiverIds = Array.from(new Set(receiverIds));

  for (const receiverId of uniqueReceiverIds) {
    ensureCanSendRecommendation(senderId, receiverId);
  }

  const album = await prisma.album.findUnique({
    where: { spotifyAlbumId },
    select: { id: true },
  });

  if (!album) {
    throw new RecommendationAlbumNotFoundError();
  }

  await assertAcceptedConnections(senderId, uniqueReceiverIds);

  await prisma.albumRecommendation.createMany({
    data: uniqueReceiverIds.map((receiverId) => ({
      senderId,
      receiverId,
      albumId: album.id,
      status: "pending",
      message: message.trim(),
    })),
    skipDuplicates: true,
  });

  return listOutgoingAlbumRecommendations(senderId, spotifyAlbumId);
}

export async function listOutgoingAlbumRecommendations(
  senderId: string,
  spotifyAlbumId: string,
) {
  const recommendations = await prisma.albumRecommendation.findMany({
    where: {
      senderId,
      status: { in: ["pending", "accepted"] },
      album: { spotifyAlbumId },
    },
    include: { sender: true, receiver: true, album: true },
    orderBy: { createdAt: "desc" },
  });

  return recommendations.map(mapRecommendation);
}

export async function listIncomingRecommendations(receiverId: string) {
  const recommendations = await prisma.albumRecommendation.findMany({
    where: {
      receiverId,
      status: { in: ["pending", "accepted"] },
    },
    include: { sender: true, receiver: true, album: true },
    orderBy: [{ status: "desc" }, { updatedAt: "desc" }],
  });

  return recommendations.map(mapRecommendation);
}

export async function cancelRecommendation(recommendationId: string, currentUserId: string) {
  const recommendation = await prisma.albumRecommendation.findUnique({
    where: { id: recommendationId },
  });

  if (!recommendation) {
    throw new RecommendationNotFoundError();
  }

  if (
    !canCancelRecommendation(
      { senderId: recommendation.senderId, status: recommendation.status as AlbumRecommendationStatus },
      currentUserId,
    )
  ) {
    throw new RecommendationForbiddenError();
  }

  await prisma.albumRecommendation.update({
    where: { id: recommendationId },
    data: { status: "cancelled" },
  });
}

export async function acceptRecommendation(recommendationId: string, currentUserId: string) {
  const recommendation = await getRespondableRecommendation(recommendationId, currentUserId);
  const libraryDefaults = getRecommendationLibraryDefaults();

  await prisma.$transaction([
    prisma.albumRecommendation.update({
      where: { id: recommendationId },
      data: { status: "accepted", respondedAt: new Date() },
    }),
    prisma.userAlbum.upsert({
      where: {
        userId_albumId: {
          userId: currentUserId,
          albumId: recommendation.albumId,
        },
      },
      create: {
        userId: currentUserId,
        albumId: recommendation.albumId,
        ...libraryDefaults,
      },
      update: {
        removedFromSpotify: false,
      },
    }),
  ]);
}

export async function dismissRecommendation(recommendationId: string, currentUserId: string) {
  const recommendation = await getRespondableRecommendation(recommendationId, currentUserId);

  await prisma.albumRecommendation.update({
    where: { id: recommendation.id },
    data: { status: "dismissed", respondedAt: new Date() },
  });
}

async function getRespondableRecommendation(recommendationId: string, currentUserId: string) {
  const recommendation = await prisma.albumRecommendation.findUnique({
    where: { id: recommendationId },
  });

  if (!recommendation) {
    throw new RecommendationNotFoundError();
  }

  if (
    !canRespondToRecommendation(
      { receiverId: recommendation.receiverId, status: recommendation.status as AlbumRecommendationStatus },
      currentUserId,
    )
  ) {
    throw new RecommendationForbiddenError();
  }

  return recommendation;
}
