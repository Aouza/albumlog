import type { ConnectionStatus } from "@/lib/connections/connection-rules";

export type ProfileRelationship = "self" | "connected" | "none";

export function getProfileRelationship({
  currentUserId,
  profileUserId,
  connectionStatus,
}: {
  currentUserId: string | null;
  profileUserId: string;
  connectionStatus?: ConnectionStatus | null;
}): ProfileRelationship {
  if (currentUserId === profileUserId) {
    return "self";
  }

  if (connectionStatus === "accepted") {
    return "connected";
  }

  return "none";
}

export function canViewAlbumsInCommon(relationship: ProfileRelationship) {
  return relationship === "connected";
}
