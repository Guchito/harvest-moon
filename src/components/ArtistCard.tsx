import Image from "next/image";
import Link from "next/link";
import type { Artist } from "@/lib/content";

export function ArtistCard({ a, priority = false }: { a: Artist; priority?: boolean }) {
  return (
    <Link href={`/artistas/${a.slug}`} className="group reveal flex flex-col gap-3.5">
      <div className="relative aspect-[4/5] overflow-hidden bg-night-2">
        <Image
          src={a.photo}
          alt={a.name}
          fill
          priority={priority}
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover grayscale transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
        />
      </div>
      <h3 className="text-2xl font-black tracking-tight group-hover:text-accent">{a.name}</h3>
      <p className="-mt-2 text-sm text-muted">{a.genres.join(" · ")}</p>
    </Link>
  );
}
