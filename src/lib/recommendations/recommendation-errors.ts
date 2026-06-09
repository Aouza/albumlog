import { RecommendationSelfSendError } from "@/lib/recommendations/recommendation-rules";

export class RecommendationAlbumNotFoundError extends Error {
  constructor() {
    super("Album not found");
    this.name = "RecommendationAlbumNotFoundError";
  }
}

export class RecommendationConnectionRequiredError extends Error {
  constructor() {
    super("Recommendations require an accepted connection");
    this.name = "RecommendationConnectionRequiredError";
  }
}

export class RecommendationNotFoundError extends Error {
  constructor() {
    super("Recommendation not found");
    this.name = "RecommendationNotFoundError";
  }
}

export class RecommendationForbiddenError extends Error {
  constructor() {
    super("Recommendation action forbidden");
    this.name = "RecommendationForbiddenError";
  }
}

export function getRecommendationErrorResponse(error: unknown) {
  if (error instanceof RecommendationSelfSendError) {
    return {
      status: 400,
      body: {
        error: "self_recommendation",
        message: "Voce nao pode recomendar um album para si mesmo.",
      },
    };
  }

  if (error instanceof RecommendationAlbumNotFoundError) {
    return {
      status: 404,
      body: {
        error: "album_not_found",
        message: "Album nao encontrado no catalogo do AlbumLog.",
      },
    };
  }

  if (error instanceof RecommendationConnectionRequiredError) {
    return {
      status: 403,
      body: {
        error: "connection_required",
        message: "Voce so pode recomendar albuns para conexoes aceitas.",
      },
    };
  }

  if (error instanceof RecommendationNotFoundError) {
    return {
      status: 404,
      body: {
        error: "recommendation_not_found",
        message: "Recomendacao nao encontrada.",
      },
    };
  }

  if (error instanceof RecommendationForbiddenError) {
    return {
      status: 403,
      body: {
        error: "recommendation_forbidden",
        message: "Voce nao pode executar essa acao nesta recomendacao.",
      },
    };
  }

  return {
    status: 500,
    body: {
      error: "recommendation_failed",
      message: "Nao foi possivel concluir a recomendacao agora.",
    },
  };
}
