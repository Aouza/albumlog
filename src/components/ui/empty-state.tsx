import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/16 bg-[#0b0b16]/72 p-8 text-center shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#8f97ff]">
        <Icon size={24} />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/48">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#4f5bff] px-4 text-sm font-semibold text-white shadow-[0_0_34px_rgba(79,91,255,0.34)] transition hover:bg-[#6570ff]"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
