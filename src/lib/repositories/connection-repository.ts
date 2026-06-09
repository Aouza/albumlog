import { prisma } from "@/lib/db/prisma";
import {
  ConnectionSelfRequestError,
  canRespondToConnection,
  getConnectionPair,
  type ConnectionStatus,
} from "@/lib/connections/connection-rules";
import type {
  ConnectionItem,
  ConnectionSearchResult,
  ConnectionUser,
  ConnectionsPayload,
} from "@/types/connection";

export class ConnectionNotFoundError extends Error {
  constructor() {
    super("Connection not found");
    this.name = "ConnectionNotFoundError";
  }
}

export class ConnectionForbiddenError extends Error {
  constructor() {
    super("Connection action forbidden");
    this.name = "ConnectionForbiddenError";
  }
}

export class ConnectionDuplicateError extends Error {
  constructor() {
    super("Connection already exists");
    this.name = "ConnectionDuplicateError";
  }
}

type ConnectionRecord = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: string;
  respondedAt: Date | null;
  createdAt: Date;
};

type ConnectionWithUsers = ConnectionRecord & {
  requester: ConnectionUserRecord;
  receiver: ConnectionUserRecord;
};

type ConnectionUserRecord = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
};

function mapUser(user: ConnectionUserRecord): ConnectionUser {
  return {
    id: user.id,
    name: user.displayName,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
  };
}

function getOtherUser(connection: ConnectionWithUsers, currentUserId: string) {
  return connection.requesterId === currentUserId ? connection.receiver : connection.requester;
}

function mapConnection(connection: ConnectionWithUsers, currentUserId: string): ConnectionItem {
  const direction =
    connection.status === "accepted"
      ? "connected"
      : connection.receiverId === currentUserId
        ? "incoming"
        : "outgoing";

  return {
    id: connection.id,
    status: connection.status as ConnectionStatus,
    direction,
    user: mapUser(getOtherUser(connection, currentUserId)),
    createdAt: connection.createdAt.toISOString(),
    respondedAt: connection.respondedAt?.toISOString() ?? null,
  };
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function createConnectionRequest(requesterId: string, receiverId: string) {
  const pair = getConnectionPair(requesterId, receiverId);

  try {
    return await prisma.connection.create({
      data: {
        requesterId,
        receiverId,
        ...pair,
        status: "pending",
      },
      include: { requester: true, receiver: true },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ConnectionDuplicateError();
    }

    throw error;
  }
}

export async function listConnections(currentUserId: string): Promise<ConnectionsPayload> {
  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ requesterId: currentUserId }, { receiverId: currentUserId }],
      status: { in: ["pending", "accepted"] },
    },
    include: {
      requester: true,
      receiver: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return connections.reduce<ConnectionsPayload>(
    (payload, connection) => {
      const mapped = mapConnection(connection, currentUserId);

      if (mapped.direction === "connected") {
        payload.accepted.push(mapped);
      } else if (mapped.direction === "incoming") {
        payload.incoming.push(mapped);
      } else {
        payload.outgoing.push(mapped);
      }

      return payload;
    },
    { accepted: [], incoming: [], outgoing: [] },
  );
}

export async function searchConnectableUsers(
  currentUserId: string,
  query: string,
): Promise<ConnectionSearchResult[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      OR: [
        { displayName: { contains: normalizedQuery, mode: "insensitive" } },
        { handle: { contains: normalizedQuery.replace(/^@/, ""), mode: "insensitive" } },
      ],
    },
    select: { id: true, handle: true, displayName: true, avatarUrl: true },
    take: 12,
    orderBy: { displayName: "asc" },
  });
  const connections = await prisma.connection.findMany({
    where: {
      OR: [
        { requesterId: currentUserId, receiverId: { in: users.map((user) => user.id) } },
        { receiverId: currentUserId, requesterId: { in: users.map((user) => user.id) } },
      ],
    },
    select: {
      id: true,
      requesterId: true,
      receiverId: true,
      status: true,
    },
  });
  const connectionByUser = new Map(
    connections.map((connection) => [
      connection.requesterId === currentUserId ? connection.receiverId : connection.requesterId,
      connection,
    ]),
  );

  return users.map((user) => {
    const connection = connectionByUser.get(user.id);
    const status = (connection?.status as ConnectionStatus | undefined) ?? null;
    const direction = !connection
      ? null
      : status === "accepted"
        ? "connected"
        : connection.receiverId === currentUserId
          ? "incoming"
          : "outgoing";

    return {
      id: user.id,
      name: user.displayName,
      handle: user.handle,
      avatarUrl: user.avatarUrl,
      connectionId: connection?.id ?? null,
      connectionStatus: status,
      connectionDirection: direction,
    };
  });
}

export async function acceptConnection(connectionId: string, currentUserId: string) {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new ConnectionNotFoundError();
  }

  if (!canRespondToConnection(connection as { receiverId: string; status: ConnectionStatus }, currentUserId)) {
    throw new ConnectionForbiddenError();
  }

  return prisma.connection.update({
    where: { id: connectionId },
    data: {
      status: "accepted",
      respondedAt: new Date(),
    },
  });
}

export async function declineConnection(connectionId: string, currentUserId: string) {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new ConnectionNotFoundError();
  }

  if (!canRespondToConnection(connection as { receiverId: string; status: ConnectionStatus }, currentUserId)) {
    throw new ConnectionForbiddenError();
  }

  return prisma.connection.update({
    where: { id: connectionId },
    data: {
      status: "declined",
      respondedAt: new Date(),
    },
  });
}

export async function removeConnection(connectionId: string, currentUserId: string) {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new ConnectionNotFoundError();
  }

  if (connection.requesterId !== currentUserId && connection.receiverId !== currentUserId) {
    throw new ConnectionForbiddenError();
  }

  await prisma.connection.delete({ where: { id: connectionId } });
}

export { ConnectionSelfRequestError };
