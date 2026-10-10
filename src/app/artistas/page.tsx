import type { Metadata } from "next";
import { ArtistCard } from "@/components/ArtistCard";
import { getArtists } from "@/lib/content";

export const metadata: Metadata = { title: "Artistas" };

export default function Artistas() {
  const artists = getArtists();
  return (
    <section className="mx-auto max-w-[1400px] px-5 pt-16 pb-24 md:px-12 md:pt-24">
      <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-7xl">Un DJ para cada ocasión</h1>
      <p className="mt-6 max-w-[55ch] text-lg text-muted-2">Bodas, fiestas temáticas, pool parties, fiestas electrónicas, afterworks y eventos corporativos.</p>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {artists.map((a, i) => <ArtistCard key={a.slug} a={a} priority={i < 3} />)}
      </div>
    </section>
  );
}
