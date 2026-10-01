import Link from "next/link";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "./Logo";

export const NAV = [
  { href: "/artistas", label: "Artistas" },
  { href: "/about", label: "Servicios" },
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/blog-de-novedades", label: "Blog" },
  { href: "/contact", label: "Contacto" },
];

// Mobile menu is a native <details>: no client JS, closes on navigation because the page re-renders.
export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-[1400px] items-center justify-between px-5 md:px-12">
        <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tight">
          <Logo className="size-9" />
          Harvest Moon
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-8 text-sm font-semibold lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-accent">
              {n.label}
            </Link>
          ))}
          <Link href="/contact" className="btn btn-accent h-10 px-4 text-sm">
            Pedir presupuesto
          </Link>
        </nav>
        <details className="group lg:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center" aria-label="Menú">
            <List size={26} weight="bold" className="group-open:hidden" />
            <X size={26} weight="bold" className="hidden group-open:block" />
          </summary>
          <nav aria-label="Principal" className="absolute inset-x-0 top-18 flex flex-col border-b border-line bg-night p-5 text-lg font-semibold">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="py-3">
                {n.label}
              </Link>
            ))}
            <Link href="/contact" className="btn btn-accent mt-3">
              Pedir presupuesto
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
