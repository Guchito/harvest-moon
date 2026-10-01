import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = { title: "Blog" };

export default function Blog() {
  const posts = getPosts();
  return (
    <section className="bg-paper text-night">
      <div className="mx-auto max-w-[1400px] px-5 pt-16 pb-24 md:px-12 md:pt-24">
        <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-7xl">Blog</h1>
        <div className="mt-14 grid gap-x-6 gap-y-14 md:grid-cols-2">
          {posts.map((p) => <PostCard key={p.slug} p={p} />)}
        </div>
      </div>
    </section>
  );
}
