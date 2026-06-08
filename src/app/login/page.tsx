import { Disc3, Music2 } from "lucide-react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <LoginContent searchParams={searchParams} />
  );
}

async function LoginContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <div className="mx-auto grid min-h-[calc(100vh-130px)] max-w-5xl items-center gap-6 lg:grid-cols-[1fr_420px]">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b16]/88 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7c86ff] to-transparent" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#eef33f]">
          AlbumLog + Spotify
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white md:text-6xl">
          Entre com sua conta Spotify.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-white/58">
          Use o Spotify como identidade inicial do AlbumLog. Depois conectamos seu catalogo,
          artistas favoritos e historico musical com mais profundidade.
        </p>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#0b0b16]/88 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#1db954] text-black shadow-[0_0_34px_rgba(29,185,84,0.4)]">
          <Music2 size={25} />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-white">Login seguro</h2>
        <p className="mt-2 text-sm leading-6 text-white/52">
          Voce sera redirecionado para o Spotify e voltara para o AlbumLog apos autorizar.
        </p>

        {params.error && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            Nao foi possivel concluir o login: {params.error}
          </div>
        )}

        <a
          href="/api/auth/spotify/login"
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1db954] px-4 text-sm font-semibold text-black transition hover:bg-[#27d765]"
        >
          <Disc3 size={18} />
          Entrar com Spotify
        </a>
      </section>
    </div>
  );
}
