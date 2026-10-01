import Link from "next/link";
import { NAV } from "@/lib/nav";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-[1400px] items-center justify-between px-5 md:px-12">
        <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tight">
          <Logo className="size-9" />
          Harvest Moon
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-7 text-sm font-semibold xl:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="nav-link hover:text-accent">
              {n.label}
            </Link>
          ))}
          <Link href="/contact" className="btn btn-accent h-10 px-4 text-sm">
            Pedir presupuesto
          </Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
