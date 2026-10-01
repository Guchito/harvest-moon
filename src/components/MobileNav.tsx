"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV } from "@/lib/nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  // 2px lines, 5px gaps: outer lines travel 7px to meet in the middle and form the X.
  // While open, any link click anywhere (logo included) or Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const line = "block h-0.5 w-6 bg-current transition duration-300 motion-reduce:transition-none";

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
        className="flex size-10 flex-col items-center justify-center gap-[5px]"
      >
        <span className={`${line} ${open ? "translate-y-[7px] rotate-45" : ""}`} />
        <span className={`${line} ${open ? "opacity-0" : ""}`} />
        <span className={`${line} ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
      </button>
      {/* Always mounted so closing animates too. Curtain: grid rows 0fr -> 1fr; links then rise in with a stagger. */}
      <div
        id="mobile-menu"
        inert={!open}
        className={`absolute inset-x-0 top-18 grid bg-night transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${open ? "grid-rows-[1fr] border-b border-line" : "grid-rows-[0fr]"}`}
      >
        <nav
          aria-label="Principal"
          className="overflow-hidden"
        >
          <div className="flex flex-col p-5 text-lg font-semibold">
            {[...NAV, { href: "/contact", label: "Pedir presupuesto", cta: true }].map((n, i) => (
              <Link
                key={n.href + n.label}
                href={n.href}
                style={{ transitionDelay: open ? `${80 + i * 40}ms` : "0ms" }}
                className={`${"cta" in n ? "btn btn-accent mt-3" : "py-3"} transition duration-300 motion-reduce:transition-none ${open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
