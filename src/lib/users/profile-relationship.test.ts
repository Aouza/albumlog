import { describe, expect, it } from "vitest";
import { canViewAlbumsInCommon, getProfileRelationship } from "./profile-relationship";

describe("profile relationship", () => {
  it("treats the current user's own profile as self", () => {
    expect(getProfileRelationship({ currentUserId: "user-a", profileUserId: "user-a" })).toBe(
      "self",
    );
  });

  it("treats accepted connections as connected", () => {
    expect(
      getProfileRelationship({
        currentUserId: "user-a",
        profileUserId: "user-b",
        connectionStatus: "accepted",
      }),
    ).toBe("connected");
  });

  it("does not expose social details for non-connected users", () => {
    expect(
      getProfileRelationship({
        currentUserId: "user-a",
        profileUserId: "user-b",
        connectionStatus: "pending",
      }),
    ).toBe("none");
    expect(canViewAlbumsInCommon("none")).toBe(false);
    expect(canViewAlbumsInCommon("connected")).toBe(true);
  });
});
