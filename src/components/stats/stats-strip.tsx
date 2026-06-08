import type { DashboardStats } from "@/types/album";

const labels: Array<{ key: keyof DashboardStats; label: string; suffix?: string }> = [
  { key: "totalAlbums", label: "Albuns" },
  { key: "listenedAlbums", label: "Ouvidos" },
  { key: "totalArtists", label: "Artistas" },
  { key: "totalReviews", label: "Reviews" },
  { key: "estimatedHours", label: "Horas", suffix: "h" },
  { key: "averageRating", label: "Media" },
];

export function StatsStrip({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {labels.map((item) => (
        <div
          key={item.key}
          className="rounded-2xl border border-white/10 bg-[#0b0b16]/86 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-xl"
        >
          <p className="text-xs font-semibold uppercase text-white/38">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {stats[item.key]}
            {item.suffix}
          </p>
        </div>
      ))}
    </div>
  );
}
