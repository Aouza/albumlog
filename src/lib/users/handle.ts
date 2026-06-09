export function normalizeHandleBase(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);

  return normalized || "user";
}

export function buildHandleCandidates(displayName: string) {
  const base = normalizeHandleBase(displayName);

  return Array.from({ length: 50 }, (_, index) => (index === 0 ? base : `${base}-${index + 1}`));
}
