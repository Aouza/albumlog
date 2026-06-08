"use client";

import type { AlbumStatus } from "@/types/album";
import { albumStatusLabels, albumStatuses } from "@/types/album";

export function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: AlbumStatus;
  onChange: (status: AlbumStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as AlbumStatus)}
      disabled={disabled}
      className="h-10 rounded-xl border border-white/10 bg-[#11111d] px-3 text-sm font-medium text-white outline-none transition focus:border-[#4f5bff] focus:ring-2 focus:ring-[#4f5bff]/25 disabled:cursor-wait disabled:opacity-60"
    >
      {albumStatuses.map((status) => (
        <option key={status} value={status}>
          {albumStatusLabels[status]}
        </option>
      ))}
    </select>
  );
}
