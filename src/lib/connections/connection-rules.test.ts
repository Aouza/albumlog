import { describe, expect, it } from "vitest";
import {
  ConnectionSelfRequestError,
  canRespondToConnection,
  getConnectionPair,
} from "./connection-rules";

describe("connection rules", () => {
  it("normalizes user pairs so duplicated reverse connections are impossible", () => {
    expect(getConnectionPair("user-b", "user-a")).toEqual({
      userAId: "user-a",
      userBId: "user-b",
    });
    expect(getConnectionPair("user-a", "user-b")).toEqual({
      userAId: "user-a",
      userBId: "user-b",
    });
  });

  it("rejects connection requests to yourself", () => {
    expect(() => getConnectionPair("user-a", "user-a")).toThrow(ConnectionSelfRequestError);
  });

  it("allows only the receiver to respond to a pending connection", () => {
    expect(canRespondToConnection({ receiverId: "receiver", status: "pending" }, "receiver")).toBe(
      true,
    );
    expect(canRespondToConnection({ receiverId: "receiver", status: "pending" }, "requester")).toBe(
      false,
    );
    expect(canRespondToConnection({ receiverId: "receiver", status: "accepted" }, "receiver")).toBe(
      false,
    );
  });
});
