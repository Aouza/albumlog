"use client";

import { Check, Search, UserPlus, UsersRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useConnectionAction,
  useConnectionUserSearch,
  useConnections,
  useSendConnectionRequest,
} from "@/lib/queries/connections";
import type { ConnectionItem, ConnectionSearchResult } from "@/types/connection";

function Avatar({ user }: { user: { name: string; avatarUrl: string } }) {
  return user.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.avatarUrl} alt="" className="size-11 rounded-2xl object-cover" />
  ) : (
    <div className="flex size-11 items-center justify-center rounded-2xl bg-white/[0.06] text-sm font-semibold text-white/64">
      {user.name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function UserIdentity({ user }: { user: { name: string; handle: string } }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-white">{user.name}</p>
      <p className="truncate text-xs text-white/40">@{user.handle}</p>
    </div>
  );
}

function ConnectionRow({
  connection,
  variant,
  onAction,
  isPending,
}: {
  connection: ConnectionItem;
  variant: "accepted" | "incoming" | "outgoing";
  onAction: (connectionId: string, action: "accept" | "decline" | "remove") => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar user={connection.user} />
        <div className="min-w-0">
          <UserIdentity user={connection.user} />
          <p className="text-xs text-white/40">
            {variant === "accepted"
              ? "Conectado"
              : variant === "incoming"
                ? "Quer se conectar"
                : "Convite enviado"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {variant === "incoming" && (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onAction(connection.id, "accept")}
              className="flex size-9 items-center justify-center rounded-xl bg-[#eef33f] text-[#080813] transition hover:bg-[#f5f86c] disabled:opacity-60"
              title="Aceitar conexao"
            >
              <Check size={17} />
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onAction(connection.id, "decline")}
              className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/10 disabled:opacity-60"
              title="Recusar conexao"
            >
              <X size={17} />
            </button>
          </>
        )}
        {variant !== "incoming" && (
          <>
            {variant === "accepted" && (
              <Link
                href={`/users/${connection.user.handle}`}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/68 transition hover:bg-white/10"
              >
                Ver perfil
              </Link>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() => onAction(connection.id, "remove")}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/58 transition hover:bg-white/10 disabled:opacity-60"
            >
              {variant === "accepted" ? "Remover" : "Cancelar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function UserSearchRow({
  user,
  onSend,
  isPending,
}: {
  user: ConnectionSearchResult;
  onSend: (receiverId: string) => void;
  isPending: boolean;
}) {
  const label =
    user.connectionStatus === "accepted"
      ? "Conectado"
      : user.connectionDirection === "incoming"
        ? "Convite recebido"
        : user.connectionDirection === "outgoing"
          ? "Convite enviado"
          : "Conectar";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar user={user} />
        <UserIdentity user={user} />
      </div>
      <button
        type="button"
        disabled={Boolean(user.connectionStatus) || isPending}
        onClick={() => onSend(user.id)}
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/68 transition hover:bg-white/10 disabled:cursor-default disabled:opacity-50"
      >
        {label}
      </button>
    </div>
  );
}

export default function ConnectionsPage() {
  const [query, setQuery] = useState("");
  const connections = useConnections();
  const searchResults = useConnectionUserSearch(query);
  const sendConnection = useSendConnectionRequest();
  const connectionAction = useConnectionAction();
  const isMutating = sendConnection.isPending || connectionAction.isPending;

  function handleAction(connectionId: string, action: "accept" | "decline" | "remove") {
    connectionAction.mutate({ connectionId, action });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[#0b0b16]/86 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#eef33f]">Social</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Conexoes</h1>
        <p className="mt-2 max-w-2xl text-white/52">
          Envie convites, aceite conexoes e prepare sua biblioteca para recomendacoes de amigos.
        </p>
      </section>

      <section className="space-y-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/38" size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busque usuarios por nome ou @handle"
            className="h-14 w-full rounded-2xl border border-white/10 bg-[#0b0b16]/86 pl-12 pr-4 text-base text-white shadow-[0_18px_55px_rgba(0,0,0,0.32)] outline-none backdrop-blur-xl transition placeholder:text-white/32 focus:border-[#4f5bff] focus:ring-2 focus:ring-[#4f5bff]/25"
          />
        </label>
        {query.trim().length >= 2 && (
          <div className="grid gap-3 lg:grid-cols-2">
            {searchResults.data?.map((user) => (
              <UserSearchRow
                key={user.id}
                user={user}
                isPending={isMutating}
                onSend={(receiverId) => sendConnection.mutate(receiverId)}
              />
            ))}
          </div>
        )}
      </section>

      {(sendConnection.isError || connectionAction.isError) && (
        <p className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100">
          {(sendConnection.error ?? connectionAction.error)?.message ??
            "Nao foi possivel concluir a acao."}
        </p>
      )}

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Convites recebidos</h2>
          {connections.data?.incoming.map((connection) => (
            <ConnectionRow
              key={connection.id}
              connection={connection}
              variant="incoming"
              isPending={isMutating}
              onAction={handleAction}
            />
          ))}
          {connections.data?.incoming.length === 0 && (
            <EmptyState
              icon={UserPlus}
              title="Nenhum convite pendente"
              description="Quando alguem quiser se conectar com voce, o convite aparece aqui."
            />
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Conexoes</h2>
          {connections.data?.accepted.map((connection) => (
            <ConnectionRow
              key={connection.id}
              connection={connection}
              variant="accepted"
              isPending={isMutating}
              onAction={handleAction}
            />
          ))}
          {connections.data?.accepted.length === 0 && (
            <EmptyState
              icon={UsersRound}
              title="Nenhuma conexao ainda"
              description="Busque usuarios e envie convites para comparar bibliotecas depois."
            />
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Enviados</h2>
          {connections.data?.outgoing.map((connection) => (
            <ConnectionRow
              key={connection.id}
              connection={connection}
              variant="outgoing"
              isPending={isMutating}
              onAction={handleAction}
            />
          ))}
          {connections.data?.outgoing.length === 0 && (
            <EmptyState
              icon={UserPlus}
              title="Nenhum convite enviado"
              description="Os convites enviados ficam aqui ate serem aceitos ou cancelados."
            />
          )}
        </div>
      </section>
    </div>
  );
}
