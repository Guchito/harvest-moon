"use client";

import { useSyncExternalStore } from "react";

// Cookie consent, kept in localStorage. Only third-party embeds (Spotify) depend on it today.
const KEY = "hm-consent";
export type Consent = "all" | "essential" | null;

const listeners = new Set<() => void>();
const read = (): Consent => (typeof window === "undefined" ? null : (localStorage.getItem(KEY) as Consent));

export function setConsent(value: Exclude<Consent, null>) {
  localStorage.setItem(KEY, value);
  listeners.forEach((l) => l());
}

export function useConsent(): Consent {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    read,
    () => null,
  );
}
