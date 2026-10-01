import Image from "next/image";
import Link from "next/link";
import { formatDate, type Post } from "@/lib/content";

// Rendered on the light "paper" blog surfaces.
export function PostCard({ p }: { p: Post }) {
  return (
    <Link href={`/blog-de-novedades/${p.slug}`} className="group reveal block">
      <div className="relative aspect-video overflow-hidden bg-night/5">
        <Image src={p.cover} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <time dateTime={p.date} className="mt-4 block text-sm text-night/60">{formatDate(p.date)}</time>
      <h3 className="mt-1 text-2xl font-extrabold tracking-tight group-hover:underline">{p.title}</h3>
      <p className="mt-1.5 text-[15px] text-night/70">{p.excerpt}</p>
    </Link>
  );
}
