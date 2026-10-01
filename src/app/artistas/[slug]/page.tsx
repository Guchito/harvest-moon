import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InstagramLogo, SpotifyLogo } from "@phosphor-icons/react/dist/ssr";
import { getArtist, getArtists } from "@/lib/content";

export function generateStaticParams() {
  return getArtists().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/artistas/[slug]">): Promise<Metadata> {
  const a = getArtist((await params).slug);
  return { title: a?.name ?? "Artista", openGraph: a ? { images: [a.photo] } : undefined };
}

export default async function ArtistPage({ params }: PageProps<"/artistas/[slug]">) {
  const a = getArtist((await params).slug);
  if (!a) notFound();

  return (
    <article className="mx-auto grid max-w-[1400px] gap-12 px-5 pt-12 pb-24 md:grid-cols-[2fr_3fr] md:px-12 md:pt-20">
      <div className="relative aspect-[4/5] overflow-hidden bg-night-2">
        <Image src={a.photo} alt={a.name} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
      </div>
      <div>
        <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-7xl">{a.name}</h1>
        <p className="mt-5 text-lg text-accent">{a.genres.join(" · ")}</p>
        <p className="mt-1 text-sm text-muted">{a.events.join(" · ")}</p>
        <div className="prose mt-8" dangerouslySetInnerHTML={{ __html: a.html }} />
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href={`/contact?dj=${a.slug}`} className="btn btn-accent">Pedir presupuesto con {a.name}</Link>
          {a.spotify && <a href={a.spotify} aria-label="Spotify" className="hover:text-accent"><SpotifyLogo size={28} /></a>}
          {a.instagram && <a href={a.instagram} aria-label="Instagram" className="hover:text-accent"><InstagramLogo size={28} /></a>}
        </div>
      </div>
    </article>
  );
}
