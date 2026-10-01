import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { getArtists, getPage, getSite } from "@/lib/content";

export const metadata: Metadata = { title: "Contacto" };

export default async function Contact({ searchParams }: PageProps<"/contact">) {
  const page = getPage("contacto");
  const site = getSite();
  const { dj } = await searchParams;

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} image={page.image} />
      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-24 md:grid-cols-[3fr_2fr] md:px-12">
        <ContactForm endpoint={site.formEndpoint} artists={getArtists().map((a) => ({ slug: a.slug, name: a.name }))} preselect={typeof dj === "string" ? dj : undefined} />
        <address className="flex flex-col gap-3 text-lg not-italic text-muted-2 md:pt-2">
          <a href={`mailto:${site.email}`} className="font-semibold text-paper hover:text-accent">{site.email}</a>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-accent">{site.phone}</a>
          <span>{site.address}</span>
        </address>
      </section>
    </>
  );
}
