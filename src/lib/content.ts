import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = path.join(process.cwd(), "content");
export const SITE_URL = "https://www.harvestmoonevents.eu";

export type Artist = {
  slug: string;
  name: string;
  photo: string;
  genres: string[];
  spotify?: string;
  instagram?: string;
  order: number;
  html: string;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  cover: string;
  excerpt: string;
  html: string;
};

export type Playlist = {
  slug: string;
  title: string;
  spotify: string;
  cover?: string;
  styles: string[];
  featured: boolean;
  order: number;
};

export type Testimonial = { slug: string; quote: string; name: string; event: string; order: number };

export type Page<T = Record<string, unknown>> = T & {
  title: string;
  subtitle?: string;
  image?: string;
  html: string;
};

export type Site = {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  spotify: string;
};

function read(file: string) {
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const site = getSite();
  const pageContent = content
    .replaceAll("{{EMAIL}}", site.email)
    .replaceAll("{{ADDRESS}}", site.address)
    .replaceAll("{{PHONE}}", site.phone);
  return { data, html: marked.parse(pageContent, { async: false }) as string };
}

function dir(name: string) {
  const d = path.join(ROOT, name);
  return fs
    .readdirSync(d)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.md$/, ""), ...read(path.join(d, f)) }));
}

export function getArtists(): Artist[] {
  return dir("artistas")
    .map(({ slug, data, html }) => ({ slug, html, ...(data as Omit<Artist, "slug" | "html">) }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getArtist(slug: string) {
  return getArtists().find((a) => a.slug === slug);
}

export function getPosts(): Post[] {
  return dir("blog")
    .map(({ slug, data, html }) => ({
      slug,
      html,
      ...(data as Omit<Post, "slug" | "html" | "date">),
      date: new Date(data.date as string).toISOString().slice(0, 10), // YAML gives a Date, CMS may give a string
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  return getPosts().find((p) => p.slug === slug);
}

export function getPlaylists(): Playlist[] {
  return dir("playlists")
    .map(({ slug, data }) => ({ slug, ...(data as Omit<Playlist, "slug">), styles: (data.styles as string[]) ?? [] }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getTestimonials(): Testimonial[] {
  return dir("testimonios")
    .map(({ slug, data }) => ({ slug, ...(data as Omit<Testimonial, "slug">) }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getPage<T = Record<string, unknown>>(name: string): Page<T> {
  const { data, html } = read(path.join(ROOT, "pages", `${name}.md`));
  return { ...(data as Page<T>), html };
}

export function getSite(): Site {
  const site = JSON.parse(fs.readFileSync(path.join(ROOT, "site.json"), "utf8"));
  // Fail the Vercel build instead of publishing blank contact details; local dev still works without them.
  const missing = ["EMAIL", "PHONE", "ADDRESS"].filter((k) => !process.env[k]);
  if (process.env.VERCEL && missing.length) throw new Error(`Missing env: ${missing.join(", ")}`);
  return {
    ...site,
    email: process.env.EMAIL ?? "",
    phone: process.env.PHONE ?? "",
    address: process.env.ADDRESS ?? "",
  };
}

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}
