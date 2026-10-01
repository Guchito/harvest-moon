import { getPage } from "@/lib/content";

export function LegalPage({ name }: { name: string }) {
  const page = getPage(name);
  return (
    <section className="mx-auto max-w-[1400px] px-5 pt-16 pb-24 md:px-12 md:pt-24">
      <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-6xl">{page.title}</h1>
      <div className="prose mt-12" dangerouslySetInnerHTML={{ __html: page.html }} />
    </section>
  );
}
