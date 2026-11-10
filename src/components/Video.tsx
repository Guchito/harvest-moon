"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const m = matchMedia(REDUCED);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

// Muted looping clip that plays only while on screen (display:none copies never start).
// Reduced motion or blocked autoplay (iOS low-power mode) -> native controls instead.
export function Video({ src, title, poster }: { src: string; title: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useSyncExternalStore(subscribe, () => matchMedia(REDUCED).matches, () => false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => setBlocked(true));
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" controls={reduced || blocked} aria-label={title} className="h-full w-full object-cover" />
  );
}
