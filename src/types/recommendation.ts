import type { Album } from "@/types/album";
import type { AlbumRecommendationStatus } from "@/lib/recommendations/recommendation-rules";

export type RecommendationUser = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
};

export type AlbumRecommendationItem = {
  id: string;
  status: AlbumRecommendationStatus;
  message: string;
  createdAt: string;
  respondedAt: string | null;
  album: Album;
  sender: RecommendationUser;
  receiver: RecommendationUser;
};

export type AlbumRecommendationsPayload = {
  outgoing: AlbumRecommendationItem[];
};

export type IncomingRecommendationsPayload = {
  recommendations: AlbumRecommendationItem[];
};
