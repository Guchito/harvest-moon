"use client";

import { useSyncExternalStore } from "react";

// Spotify consent, kept in localStorage. Given by clicking "Escuchar" on any player; withdrawn from the cookie policy page.
const KEY = "hm-spotify";
const listeners = new Set<() => void>();
const set = (on: boolean) => {
  if (on) localStorage.setItem(KEY, "1");
  else localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
};

export const acceptSpotify = () => set(true);
export const revokeSpotify = () => set(false);

export const useSpotifyAccepted = () =>
  useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => localStorage.getItem(KEY) === "1",
    () => false,
  );
