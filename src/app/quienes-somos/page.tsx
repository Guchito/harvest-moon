import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { getPage } from "@/lib/content";

export const metadata: Metadata = { title: "Quiénes somos" };

export default function QuienesSomos() {
  const page = getPage("quienes-somos");
  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} image={page.image} />
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-12">
        <div className="prose" dangerouslySetInnerHTML={{ __html: page.html }} />
      </section>
    </>
  );
}
