"use client";

import { SpotifyLogo } from "@phosphor-icons/react/dist/ssr";
import { setConsent, useConsent } from "@/lib/consent";

// Spotify embed from any playlist URL the editor pastes (share links include ?si=..., that's fine).
// The iframe sets third-party cookies, so it only loads after consent; before that, a same-size card.
export function SpotifyPlaylist({ url, title }: { url: string; title: string }) {
  const consent = useConsent();
  const id = url.match(/playlist\/([A-Za-z0-9]+)/)?.[1];
  if (!id) return null;

  if (consent !== "all") {
    return (
      <div className="reveal flex h-[352px] w-full flex-col items-start justify-between rounded-xl border border-line bg-night-2 p-6">
        <div>
          <SpotifyLogo size={36} className="text-muted" />
          <p className="mt-5 text-2xl font-black tracking-tight">{title}</p>
          <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-muted-2">El reproductor de Spotify usa cookies de terceros.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setConsent("all")} className="btn btn-accent h-10 px-4 text-sm">Aceptar y escuchar</button>
          <a href={`https://open.spotify.com/playlist/${id}`} target="_blank" rel="noopener" className="btn btn-ghost h-10 px-4 text-sm">Abrir en Spotify</a>
        </div>
      </div>
    );
  }

  return (
    <iframe
      title={`Playlist ${title} en Spotify`}
      src={`https://open.spotify.com/embed/playlist/${id}?theme=0`}
      height={352}
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      className="reveal w-full"
    />
  );
}
