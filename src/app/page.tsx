import Image from "next/image";
import Link from "next/link";
import { ArtistCard } from "@/components/ArtistCard";
import { PostCard } from "@/components/PostCard";
import { getArtists, getPage, getPosts } from "@/lib/content";

type Inicio = { services: { title: string; text: string }[] };

export default function Home() {
  const page = getPage<Inicio>("inicio");
  const artists = getArtists().slice(0, 3);
  const posts = getPosts().slice(0, 2);

  return (
    <>
      <section className="grid md:min-h-[min(calc(100dvh-4.5rem),820px)] md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-end px-5 pt-16 pb-16 md:px-12 md:pb-24">
          <h1 className="text-6xl font-black leading-[0.9] tracking-[-0.045em] md:text-8xl lg:text-[7.5vw]">
            {page.title.replace(/,\s*(.+)$/, ",")}
            {page.title.includes(",") && (
              <>
                <br />
                <span className="text-accent">{page.title.split(/,\s*/)[1]}</span>
              </>
            )}
          </h1>
          <p className="mt-7 max-w-[52ch] text-lg leading-relaxed text-muted-2">{page.subtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/artistas" className="btn btn-paper">Ver artistas</Link>
            <Link href="/contact" className="btn btn-ghost">Pedir presupuesto</Link>
          </div>
        </div>
        <div className="relative min-h-[60vw] md:min-h-0">
          <Image src={page.image!} alt="" fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover grayscale" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-night to-transparent to-35% md:block" />
        </div>
      </section>

      <ul className="grid border-y border-line md:grid-cols-3">
        {page.services.map((s) => (
          <li key={s.title} className="border-b border-line px-5 py-8 last:border-b-0 md:border-r md:border-b-0 md:px-12 md:py-10 md:last:border-r-0">
            <strong className="block text-2xl font-black tracking-tight md:text-[1.75rem]">{s.title}</strong>
            <span className="mt-2 block text-sm text-muted">{s.text}</span>
          </li>
        ))}
      </ul>

      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-12 md:py-24">
        <h2 className="text-4xl font-black tracking-[-0.035em] md:text-6xl">Un DJ para cada ocasión</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {artists.map((a) => <ArtistCard key={a.slug} a={a} />)}
        </div>
      </section>

      <section className="bg-paper text-night">
        <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-12 md:py-24">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-4xl font-black tracking-[-0.035em] md:text-6xl">Blog</h2>
            <Link href="/blog-de-novedades" className="btn btn-ink h-10 px-4 text-sm">Ver todo</Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {posts.map((p) => <PostCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-12 md:py-24">
        <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: page.html }} />
        <Link href="/contact" className="btn btn-accent mt-10">Pedir presupuesto</Link>
      </section>
    </>
  );
}
