import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "hm_quote_admin";
const COOKIE_PATH = "/admin";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

type AuthConfig = {
  username: string;
  password: string;
  sessionSecret: string;
};

function getAuthConfig(): AuthConfig | null {
  const { QUOTE_ADMIN_USERNAME, QUOTE_ADMIN_PASSWORD, QUOTE_SESSION_SECRET } = process.env;
  if (
    !QUOTE_ADMIN_USERNAME ||
    !QUOTE_ADMIN_PASSWORD ||
    QUOTE_ADMIN_PASSWORD.length < 12 ||
    !QUOTE_SESSION_SECRET ||
    QUOTE_SESSION_SECRET.length < 32
  ) {
    return null;
  }

  return {
    username: QUOTE_ADMIN_USERNAME,
    password: QUOTE_ADMIN_PASSWORD,
    sessionSecret: QUOTE_SESSION_SECRET,
  };
}

function equalSecret(actual: string, expected: string) {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  const length = Math.max(actualBytes.length, expectedBytes.length, 1);
  const actualPadded = Buffer.alloc(length);
  const expectedPadded = Buffer.alloc(length);
  actualBytes.copy(actualPadded);
  expectedBytes.copy(expectedPadded);

  return timingSafeEqual(actualPadded, expectedPadded) && actualBytes.length === expectedBytes.length;
}

function signTimestamp(timestamp: string, secret: string) {
  return createHmac("sha256", secret).update(`quote-admin:${timestamp}`).digest("hex");
}

export function isQuoteAuthConfigured() {
  return getAuthConfig() !== null;
}

export function verifyQuoteCredentials(username: string, password: string) {
  const config = getAuthConfig();
  if (!config || username.length > 128 || password.length > 256) return false;

  const validUsername = equalSecret(username, config.username);
  const validPassword = equalSecret(password, config.password);
  return validUsername && validPassword;
}

export async function createQuoteSession() {
  const config = getAuthConfig();
  if (!config) throw new Error("Quote admin credentials are not configured.");

  const timestamp = String(Math.floor(Date.now() / 1000));
  const value = `${timestamp}.${signTimestamp(timestamp, config.sessionSecret)}`;
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: COOKIE_PATH,
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearQuoteSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: COOKIE_PATH,
    maxAge: 0,
  });
}

export async function isQuoteAuthenticated() {
  const config = getAuthConfig();
  if (!config) return false;

  const cookieValue = (await cookies()).get(COOKIE_NAME)?.value;
  if (!cookieValue) return false;

  const [timestamp, signature, ...extra] = cookieValue.split(".");
  if (!timestamp || !signature || extra.length > 0 || !/^\d{10}$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(signature)) {
    return false;
  }

  const issuedAt = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(issuedAt) || issuedAt > now || now - issuedAt > SESSION_TTL_SECONDS) {
    return false;
  }

  return equalSecret(signature, signTimestamp(timestamp, config.sessionSecret));
}
