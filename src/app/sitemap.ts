import type { MetadataRoute } from "next";
import { getArtists, getPosts } from "@/lib/content";

const BASE = "https://www.harvestmoonevents.eu";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ["", "/artistas", "/about", "/quienes-somos", "/playlists", "/blog-de-novedades", "/contact", "/terminos-y-condiciones"];
  return [
    ...fixed.map((p) => ({ url: BASE + p, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...getArtists().map((a) => ({ url: `${BASE}/artistas/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...getPosts().map((p) => ({ url: `${BASE}/blog-de-novedades/${p.slug}`, lastModified: p.date, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
