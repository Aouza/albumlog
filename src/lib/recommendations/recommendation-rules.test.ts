import { describe, expect, it } from "vitest";
import {
  RecommendationSelfSendError,
  canCancelRecommendation,
  canRespondToRecommendation,
  ensureCanSendRecommendation,
} from "./recommendation-rules";

describe("recommendation rules", () => {
  it("rejects recommendations sent to yourself", () => {
    expect(() => ensureCanSendRecommendation("user-a", "user-a")).toThrow(
      RecommendationSelfSendError,
    );
  });

  it("allows recommendations between different users", () => {
    expect(() => ensureCanSendRecommendation("user-a", "user-b")).not.toThrow();
  });

  it("allows only the sender to cancel a pending recommendation", () => {
    expect(
      canCancelRecommendation({ senderId: "sender", status: "pending" }, "sender"),
    ).toBe(true);
    expect(
      canCancelRecommendation({ senderId: "sender", status: "pending" }, "receiver"),
    ).toBe(false);
    expect(
      canCancelRecommendation({ senderId: "sender", status: "accepted" }, "sender"),
    ).toBe(false);
  });

  it("allows only the receiver to respond to a pending recommendation", () => {
    expect(
      canRespondToRecommendation({ receiverId: "receiver", status: "pending" }, "receiver"),
    ).toBe(true);
    expect(
      canRespondToRecommendation({ receiverId: "receiver", status: "pending" }, "sender"),
    ).toBe(false);
    expect(
      canRespondToRecommendation({ receiverId: "receiver", status: "cancelled" }, "receiver"),
    ).toBe(false);
  });
});
