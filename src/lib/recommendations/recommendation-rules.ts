export type AlbumRecommendationStatus = "pending" | "accepted" | "dismissed" | "cancelled";

export class RecommendationSelfSendError extends Error {
  constructor() {
    super("Users cannot recommend albums to themselves");
    this.name = "RecommendationSelfSendError";
  }
}

export function ensureCanSendRecommendation(senderId: string, receiverId: string) {
  if (senderId === receiverId) {
    throw new RecommendationSelfSendError();
  }
}

export function canCancelRecommendation(
  recommendation: { senderId: string; status: AlbumRecommendationStatus },
  currentUserId: string,
) {
  return recommendation.senderId === currentUserId && recommendation.status === "pending";
}

export function canRespondToRecommendation(
  recommendation: { receiverId: string; status: AlbumRecommendationStatus },
  currentUserId: string,
) {
  return recommendation.receiverId === currentUserId && recommendation.status === "pending";
}
