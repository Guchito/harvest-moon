"use client";

import { PlayIcon, SpotifyLogo } from "@phosphor-icons/react/dist/ssr";
import { acceptSpotify, useSpotifyAccepted } from "@/lib/consent";

// Spotify sets third-party cookies, so a same-size card stands in until the visitor clicks "Escuchar".
// That click is the consent, shared by every player on the site.
// Embed from any playlist URL the editor pastes (share links include ?si=..., that's fine).
export function SpotifyPlaylist({ url, title }: { url: string; title: string }) {
  const accepted = useSpotifyAccepted();
  const id = url.match(/playlist\/([A-Za-z0-9]+)/)?.[1];
  if (!id) return null;

  if (!accepted) {
    return (
      <div className="reveal flex h-[352px] w-full flex-col items-start justify-between rounded-xl border border-line bg-night-2 p-6">
        <div>
          <SpotifyLogo size={36} className="text-muted" />
          <p className="mt-5 text-2xl font-black tracking-tight">{title}</p>
        </div>
        <div>
          <button onClick={acceptSpotify} className="btn btn-accent h-10 gap-2 px-4 text-sm">
            <PlayIcon size={16} weight="fill" /> Escuchar
          </button>
          <p className="mt-3 max-w-[34ch] text-xs leading-relaxed text-muted">Al darle a escuchar aceptas las cookies de Spotify en todo el sitio.</p>
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
      className="w-full"
    />
  );
}
