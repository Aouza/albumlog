"use client";

import Image from "next/image";
import type { AlbumSocialContext } from "@/types/album-social-context";

function InitialAvatar({ name }: { name: string }) {
  return (
    <span className="flex size-7 items-center justify-center rounded-full border-2 border-[#0b0b16] bg-white/[0.08] text-[11px] font-semibold text-white">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function AlbumSocialStack({ context }: { context?: AlbumSocialContext }) {
  if (!context || context.total === 0) {
    return null;
  }

  const hiddenTotal = Math.max(0, context.total - context.connections.length);
  const title =
    context.total === 1
      ? `${context.connections[0]?.name} tambem tem este album`
      : `${context.total} conexoes tambem tem este album`;

  return (
    <div className="flex items-center gap-2" title={title}>
      <div className="flex -space-x-2">
        {context.connections.map((connection) =>
          connection.avatarUrl ? (
            <Image
              key={connection.id}
              src={connection.avatarUrl}
              alt={connection.name}
              width={28}
              height={28}
              className="size-7 rounded-full border-2 border-[#0b0b16] object-cover"
            />
          ) : (
            <InitialAvatar key={connection.id} name={connection.name} />
          ),
        )}
        {hiddenTotal > 0 && (
          <span className="flex size-7 items-center justify-center rounded-full border-2 border-[#0b0b16] bg-[#4f5bff] text-[11px] font-semibold text-white">
            +{hiddenTotal}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-white/42">
        {context.total === 1 ? "1 conexao" : `${context.total} conexoes`}
      </span>
    </div>
  );
}
