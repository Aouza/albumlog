import { describe, expect, it } from "vitest";
import { buildHandleCandidates, normalizeHandleBase } from "./handle";

describe("user handles", () => {
  it("normalizes display names into URL-safe handles", () => {
    expect(normalizeHandleBase("Alison Souza")).toBe("alison-souza");
    expect(normalizeHandleBase("Lucas Demo!!!")).toBe("lucas-demo");
    expect(normalizeHandleBase("  @Metalcore BR  ")).toBe("metalcore-br");
  });

  it("falls back to user when the display name has no usable characters", () => {
    expect(normalizeHandleBase("!!!")).toBe("user");
  });

  it("builds deterministic conflict candidates", () => {
    expect(buildHandleCandidates("Lucas Demo").slice(0, 4)).toEqual([
      "lucas-demo",
      "lucas-demo-2",
      "lucas-demo-3",
      "lucas-demo-4",
    ]);
  });
});
