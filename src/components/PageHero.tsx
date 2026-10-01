import Image from "next/image";

// Title block shared by inner pages. Image is optional.
export function PageHero({ title, subtitle, image }: { title: string; subtitle?: string; image?: string }) {
  return (
    <section className="mx-auto grid max-w-[1400px] items-end gap-10 px-5 pt-16 pb-12 md:grid-cols-2 md:px-12 md:pt-24">
      <div>
        <h1 className="enter text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-7xl">{title}</h1>
        {subtitle && <p className="enter mt-6 max-w-[55ch] text-lg leading-relaxed text-muted-2" style={{ "--d": "120ms" } as React.CSSProperties}>{subtitle}</p>}
      </div>
      {image && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={image} alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      )}
    </section>
  );
}
