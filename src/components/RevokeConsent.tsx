"use client";

import { revokeSpotify, useSpotifyAccepted } from "@/lib/consent";

export function RevokeConsent() {
  const accepted = useSpotifyAccepted();
  if (!accepted) return <p className="mt-8 text-sm text-muted">No has aceptado las cookies de Spotify.</p>;
  return (
    <button onClick={revokeSpotify} className="btn btn-ghost mt-8 h-10 px-4 text-sm">
      Retirar consentimiento de Spotify
    </button>
  );
}
