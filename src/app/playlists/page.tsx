import type { Metadata } from "next";
import { SpotifyPlaylist } from "@/components/SpotifyPlaylist";
import { getPlaylists } from "@/lib/content";

export const metadata: Metadata = { title: "Playlists" };

export default function Playlists() {
  const playlists = getPlaylists();
  return (
    <section className="mx-auto max-w-[1400px] px-5 pt-16 pb-24 md:px-12 md:pt-24">
      <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-7xl">Nuestras playlists</h1>
      <p className="mt-6 max-w-[55ch] text-lg text-muted-2">Escucha lo que suena en nuestras fiestas.</p>
      <div className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.map((p) => (
          <div key={p.slug}>
            <SpotifyPlaylist url={p.spotify} title={p.title} />
            <p className="mt-3 text-sm text-muted">{p.styles.join(" · ")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
