import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatDate, getPost, getPosts } from "@/lib/content";

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog-de-novedades/[slug]">): Promise<Metadata> {
  const p = getPost((await params).slug);
  return p ? { title: p.title, description: p.excerpt, openGraph: { images: [p.cover] } } : {};
}

export default async function Post({ params }: PageProps<"/blog-de-novedades/[slug]">) {
  const p = getPost((await params).slug);
  if (!p) notFound();

  return (
    <article className="bg-paper text-night">
      <div className="mx-auto max-w-[1400px] px-5 pt-16 md:px-12 md:pt-24">
        <time dateTime={p.date} className="text-sm text-night/60">{formatDate(p.date)}</time>
        <h1 className="mt-3 max-w-[20ch] text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-7xl">{p.title}</h1>
        <div className="relative mt-12 aspect-[21/9] overflow-hidden">
          <Image src={p.cover} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-12 md:py-20">
        <div className="prose prose-paper" dangerouslySetInnerHTML={{ __html: p.html }} />
      </div>
    </article>
  );
}
