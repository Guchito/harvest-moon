// Spotify embed from any playlist URL the editor pastes (share links include ?si=..., that's fine).
export function SpotifyPlaylist({ url, title }: { url: string; title: string }) {
  const id = url.match(/playlist\/([A-Za-z0-9]+)/)?.[1];
  if (!id) return null;
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
