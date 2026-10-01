"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Video } from "./Video";

// `image` doubles as the video poster. `fit: contain` shows the whole image (e.g. a collage) over a blurred copy of itself.
export type Chapter = { title: string; lead: string; paragraphs: string[]; image: string; video?: string; fit?: "cover" | "contain" };

function Media({ c }: { c: Chapter }) {
  if (c.video) return <Video src={c.video} poster={c.image} title={c.title} />;
  const sizes = "(min-width: 768px) 55vw, 100vw";
  if (c.fit === "contain")
    return (
      <>
        <Image src={c.image} alt="" fill sizes="20vw" className="scale-110 object-cover opacity-50 blur-2xl" />
        <Image src={c.image} alt="" fill sizes={sizes} className="object-contain" />
      </>
    );
  return <Image src={c.image} alt="" fill sizes={sizes} className="object-cover" />;
}

// "A = B" titles get an accent-colored "=".
function Title({ text }: { text: string }) {
  const [left, right] = text.split(/\s*=\s*/);
  return right ? (<>{left} <span className="text-accent">=</span> {right}</>) : <>{left}</>;
}

// Desktop: media pinned on the left, crossfading to whichever chapter is mid-screen.
// Mobile: each chapter carries its own media inline.
export function Chapters({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="mx-auto grid max-w-[1400px] px-5 md:grid-cols-[1.15fr_1fr] md:gap-14 md:px-12">
      <div className="sticky top-18 hidden h-[calc(100dvh-4.5rem)] items-center md:flex">
        <div className="relative aspect-[4/3] max-h-[78vh] w-full overflow-hidden bg-night-2">
          {chapters.map((c, i) => (
            <div
              key={c.title}
              aria-hidden={i !== active}
              className={`absolute inset-0 transition duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${i === active ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
            >
              <Media c={c} />
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/70 to-transparent" />
          <div className="absolute inset-x-6 bottom-6 flex gap-2">
            {chapters.map((c, i) => (
              <span key={c.title} className="relative h-0.5 flex-1 overflow-hidden bg-paper/25">
                <span className={`absolute inset-0 origin-left bg-paper transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${i <= active ? "scale-x-100" : "scale-x-0"}`} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        {chapters.map((c, i) => (
          <article
            key={c.title}
            data-i={i}
            ref={(el) => { refs.current[i] = el; }}
            className="flex flex-col justify-center py-14 md:min-h-[calc(100dvh-4.5rem)] md:py-24"
          >
            <div className="reveal relative mb-10 aspect-[4/3] overflow-hidden bg-night-2 md:hidden">
              <Media c={c} />
            </div>
            <h2 className="reveal text-[2.75rem] font-black leading-[0.95] tracking-[-0.04em] md:text-5xl xl:text-6xl">
              <Title text={c.title} />
            </h2>
            <p className="reveal mt-8 max-w-[34ch] text-xl font-semibold leading-snug md:text-2xl">{c.lead}</p>
            {c.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="reveal mt-5 max-w-[58ch] leading-relaxed text-muted-2">{p}</p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
