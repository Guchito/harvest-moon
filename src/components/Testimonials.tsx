"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Testimonial } from "@/lib/content";

// Screens of scrolling each quote stays on. Raise to linger longer, lower to move faster.
const SCREENS_PER_QUOTE = 1.4;
const screens = (n: number) => `calc(${n} * (100dvh - 4.5rem))`;

// Scroll-pinned: the section is SCREENS_PER_QUOTE viewports tall per quote. The visible part sticks under
// the header while invisible full-height steps scroll past; whichever step crosses the
// middle of the screen picks the active quote. After the last one the page scrolls on.
export function Testimonials({
  items,
  background,
}: {
  items: Testimonial[];
  background: string;
}) {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) =>
            e.isIntersecting &&
            setActive(Number((e.target as HTMLElement).dataset.i)),
        ),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    steps.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) =>
    steps.current[i]?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });

  return (
    <section
      aria-labelledby="testimonios"
      className="relative"
      style={{ height: screens(items.length * SCREENS_PER_QUOTE + 1) }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {items.map((t, i) => (
          // Quotes switch when a step crosses mid-screen, so the first and last steps get an extra
          // half screen; otherwise they'd show for half a screen less than the middle ones.
          <div
            key={t.slug}
            data-i={i}
            ref={(el) => {
              steps.current[i] = el;
            }}
            style={{
              height: screens(
                SCREENS_PER_QUOTE +
                  (i === 0 ? 0.5 : 0) +
                  (i === items.length - 1 ? 0.5 : 0),
              ),
            }}
            className="scroll-mt-18"
          />
        ))}
      </div>

      <div className="sticky top-18 isolate flex h-[calc(100dvh-4.5rem)] flex-col justify-center overflow-hidden">
        <Image
          src={background}
          alt=""
          fill
          sizes="100vw"
          className="drift -z-20 object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night via-night/60 to-night" />

        <div className="mx-auto w-full max-w-[1400px] px-5 md:px-12">
          <h2
            id="testimonios"
            className="text-4xl font-black tracking-[-0.035em] md:text-6xl"
          >
            Lo que dicen <span className="text-accent">de nosotros</span>
          </h2>

          <div className="mt-8 grid md:mt-14">
            {items.map((t, i) => (
              <figure
                key={t.slug}
                aria-hidden={i !== active}
                className={`[grid-area:1/1] transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                  i === active
                    ? "translate-y-0 opacity-100"
                    : i < active
                      ? "pointer-events-none -translate-y-6 opacity-0"
                      : "pointer-events-none translate-y-6 opacity-0"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="block h-12 text-[6rem] font-black leading-none text-accent md:h-20 md:text-[10rem]"
                >
                  “
                </span>
                <blockquote className="max-w-[40ch] text-xl font-bold leading-[1.2] tracking-[-0.02em] sm:text-2xl md:text-4xl md:leading-[1.15] lg:text-[2.75rem]">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4 md:mt-8">
                  <span className="h-px w-10 bg-accent" />
                  <span>
                    <span className="block text-lg font-black tracking-tight">
                      {t.name}
                    </span>
                    <span className="block text-sm text-muted-2">
                      {t.event}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div
            role="tablist"
            aria-label="Testimonios"
            className="mt-10 grid grid-cols-3 gap-4 md:mt-16 md:gap-8"
          >
            {items.map((t, i) => (
              <button
                key={t.slug}
                role="tab"
                aria-selected={i === active}
                onClick={() => goTo(i)}
                className="group text-left"
              >
                <span className="relative block h-0.5 overflow-hidden bg-paper/20">
                  <span
                    className={`absolute inset-0 origin-left bg-accent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${i <= active ? "scale-x-100" : "scale-x-0"}`}
                  />
                </span>
                <span
                  className={`mt-3 block text-sm font-semibold transition-colors md:text-base ${i === active ? "text-paper" : "text-muted group-hover:text-paper"}`}
                >
                  {t.name}
                </span>
                <span className="hidden text-xs text-muted md:block">
                  {t.event}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
