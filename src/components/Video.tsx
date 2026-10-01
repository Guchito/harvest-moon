"use client";

import { useEffect, useRef, useState } from "react";

// Muted looping clip that plays only while on screen (display:none copies never start).
// Reduced motion or blocked autoplay (iOS low-power mode) -> native controls instead.
export function Video({ src, title, poster }: { src: string; title: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [controls, setControls] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setControls(true);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => setControls(true));
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" controls={controls} aria-label={title} className="h-full w-full object-cover" />
  );
}
