export type ConnectionStatus = "pending" | "accepted" | "declined" | "blocked";

export class ConnectionSelfRequestError extends Error {
  constructor() {
    super("Users cannot connect to themselves");
    this.name = "ConnectionSelfRequestError";
  }
}

export function getConnectionPair(firstUserId: string, secondUserId: string) {
  if (firstUserId === secondUserId) {
    throw new ConnectionSelfRequestError();
  }

  const [userAId, userBId] = [firstUserId, secondUserId].sort();

  return { userAId, userBId };
}

export function canRespondToConnection(
  connection: { receiverId: string; status: ConnectionStatus },
  currentUserId: string,
) {
  return connection.receiverId === currentUserId && connection.status === "pending";
}
