import {
  ConnectionDuplicateError,
  ConnectionForbiddenError,
  ConnectionNotFoundError,
  ConnectionSelfRequestError,
} from "@/lib/repositories/connection-repository";

export function getConnectionErrorResponse(error: unknown) {
  if (error instanceof ConnectionSelfRequestError) {
    return {
      status: 400,
      body: { error: "self_connection", message: "Voce nao pode criar conexao com voce mesmo." },
    };
  }

  if (error instanceof ConnectionDuplicateError) {
    return {
      status: 409,
      body: { error: "connection_exists", message: "Essa conexao ja existe." },
    };
  }

  if (error instanceof ConnectionForbiddenError) {
    return {
      status: 403,
      body: { error: "connection_forbidden", message: "Voce nao pode alterar essa conexao." },
    };
  }

  if (error instanceof ConnectionNotFoundError) {
    return {
      status: 404,
      body: { error: "connection_not_found", message: "Conexao nao encontrada." },
    };
  }

  return {
    status: 500,
    body: { error: "connection_failed", message: "Nao foi possivel concluir a acao." },
  };
}
