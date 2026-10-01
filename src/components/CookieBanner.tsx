"use client";

import Link from "next/link";
import { setConsent, useConsent } from "@/lib/consent";

export function CookieBanner() {
  const consent = useConsent();
  if (consent) return null;
  return (
    <div role="region" aria-label="Cookies" className="enter fixed inset-x-0 bottom-0 z-50 border-t border-line bg-night/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-12">
        <p className="max-w-[70ch] text-sm leading-relaxed text-muted-2">
          Usamos cookies propias necesarias y, si lo aceptas, cookies de terceros para mostrarte los reproductores de Spotify.{" "}
          <Link href="/politica-de-cookies" className="underline underline-offset-2 hover:text-paper">Más información sobre las cookies</Link>
        </p>
        <div className="flex gap-3">
          <button onClick={() => setConsent("essential")} className="btn btn-ghost h-10 px-4 text-sm">Solo necesarias</button>
          <button onClick={() => setConsent("all")} className="btn btn-accent h-10 px-4 text-sm">Aceptar todas</button>
        </div>
      </div>
    </div>
  );
}
