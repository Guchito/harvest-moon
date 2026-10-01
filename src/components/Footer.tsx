import Link from "next/link";
import { InstagramLogo, SpotifyLogo } from "@phosphor-icons/react/dist/ssr";
import { getSite } from "@/lib/content";
import { Logo } from "./Logo";
import { NAV } from "@/lib/nav";

export function Footer() {
  const s = getSite();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-12">
        <div>
          <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tight">
            <Logo className="size-9" />
            Harvest Moon
          </Link>
          <p className="mt-3 text-sm text-muted">{s.tagline}</p>
          <div className="mt-5 flex gap-3">
            {s.instagram && (
              <a href={s.instagram} aria-label="Instagram" className="hover:text-accent"><InstagramLogo size={24} /></a>
            )}
            {s.spotify && (
              <a href={s.spotify} aria-label="Spotify" className="hover:text-accent"><SpotifyLogo size={24} /></a>
            )}
          </div>
        </div>
        <nav aria-label="Pie" className="flex flex-col gap-2 text-sm font-semibold">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-accent">{n.label}</Link>
          ))}
          <Link href="/contact" className="hover:text-accent">Contacto</Link>
          <Link href="/terminos-y-condiciones" className="hover:text-accent">Términos y condiciones</Link>
          <Link href="/aviso-legal" className="hover:text-accent">Aviso legal</Link>
          <Link href="/politica-de-privacidad" className="hover:text-accent">Privacidad</Link>
          <Link href="/politica-de-cookies" className="hover:text-accent">Cookies</Link>
        </nav>
        <address className="flex flex-col gap-2 text-sm not-italic text-muted-2">
          <a href={`mailto:${s.email}`} className="hover:text-accent">{s.email}</a>
          <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:text-accent">{s.phone}</a>
          <span>{s.address}</span>
        </address>
      </div>
      <p className="mx-auto max-w-[1400px] px-5 pb-8 text-xs text-muted md:px-12">
        © {new Date().getFullYear()} {s.name}
      </p>
    </footer>
  );
}
