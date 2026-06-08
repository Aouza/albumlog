"use client";

import { Disc3, Home, Library, Search, Sparkles, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/search", label: "Busca", icon: Search },
  { href: "/library", label: "Biblioteca", icon: Library },
  { href: "/profile", label: "Perfil", icon: UserCircle },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-white">
      <aside className="fixed left-4 top-4 z-30 hidden h-[calc(100vh-2rem)] w-[92px] flex-col items-center rounded-[24px] border border-white/10 bg-[#080813]/86 py-5 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:flex">
        <Link
          href="/"
          className="flex size-12 items-center justify-center rounded-2xl bg-[#3f46ff] text-white shadow-[0_0_38px_rgba(63,70,255,0.55)]"
          title="AlbumLog"
        >
          <Disc3 size={23} />
        </Link>
        <nav className="mt-10 flex flex-1 flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.04] text-white/54 transition hover:border-white/15 hover:bg-white/[0.09] hover:text-white",
                  active && "border-white/20 bg-white text-[#080813] shadow-[0_0_30px_rgba(255,255,255,0.18)]",
                )}
                title={item.label}
              >
                <Icon size={19} />
              </Link>
            );
          })}
        </nav>
        <div className="flex size-12 items-center justify-center rounded-2xl border border-[#eef33f]/30 bg-[#eef33f]/10 text-[#eef33f]">
          <Sparkles size={19} />
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070711]/76 backdrop-blur-xl lg:ml-[124px]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-base font-semibold lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#3f46ff] text-white">
              <Disc3 size={20} />
            </span>
            AlbumLog
          </Link>
          <div className="hidden items-center gap-3 lg:flex">
            <p className="text-sm font-semibold text-white">AlbumLog</p>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/48">
              music diary
            </span>
          </div>
          <nav className="flex items-center gap-1 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white",
                    active && "bg-white text-[#080813] shadow-sm",
                  )}
                  title={item.label}
                >
                  <Icon size={17} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="hidden h-11 min-w-[320px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/42 md:flex">
            <Search size={17} />
            Tap / to search your catalog
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:pl-[148px] lg:pr-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
