import type { ConnectionStatus } from "@/lib/connections/connection-rules";

export type ConnectionUser = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
};

export type ConnectionItem = {
  id: string;
  status: ConnectionStatus;
  direction: "incoming" | "outgoing" | "connected";
  user: ConnectionUser;
  createdAt: string;
  respondedAt: string | null;
};

export type ConnectionSearchResult = ConnectionUser & {
  connectionStatus: ConnectionStatus | null;
  connectionId: string | null;
  connectionDirection: "incoming" | "outgoing" | "connected" | null;
};

export type ConnectionsPayload = {
  accepted: ConnectionItem[];
  incoming: ConnectionItem[];
  outgoing: ConnectionItem[];
};
