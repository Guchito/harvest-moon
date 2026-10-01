import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/ContactForm";
import { getArtists, getPage, getSite } from "@/lib/content";

export const metadata: Metadata = { title: "Contacto" };

export default async function Contact({ searchParams }: PageProps<"/contact">) {
  const page = getPage("contacto");
  const site = getSite();
  const { dj, enviado, error } = await searchParams;

  return (
    <>
      {/* Full-bleed hero: original photo, darkened at the bottom so the text stays readable. */}
      <section className="relative isolate flex min-h-[70dvh] items-end overflow-hidden md:min-h-[75vh] md:max-h-[760px]">
        <Image src={page.image!} alt="" fill priority sizes="100vw" className="drift -z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/55 to-night/25" />
        <div className="mx-auto w-full max-w-[1400px] px-5 pt-32 pb-14 md:px-12 md:pb-20">
          <h1 className="enter text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-7xl">{page.title}</h1>
          {page.subtitle && <p className="enter mt-6 max-w-[55ch] text-lg leading-relaxed text-muted-2" style={{ "--d": "120ms" } as React.CSSProperties}>{page.subtitle}</p>}
        </div>
      </section>
      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 md:grid-cols-[3fr_2fr] md:px-12 md:py-24">
        <div>
          {enviado && <p className="mb-8 border border-accent px-5 py-4 font-semibold">Recibido. Te contestamos lo antes posible.</p>}
          {error && <p className="mb-8 border border-red-400 px-5 py-4 font-semibold text-red-300">No se pudo enviar. Revisa los datos o escríbenos a {site.email}.</p>}
          <ContactForm artists={getArtists().map((a) => ({ slug: a.slug, name: a.name }))} preselect={typeof dj === "string" ? dj : undefined} />
        </div>
        <address className="flex flex-col gap-3 text-lg not-italic text-muted-2 md:pt-2">
          <a href={`mailto:${site.email}`} className="font-semibold text-paper hover:text-accent">{site.email}</a>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-accent">{site.phone}</a>
          <span>{site.address}</span>
        </address>
      </section>
    </>
  );
}
