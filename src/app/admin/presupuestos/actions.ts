"use server";

import { redirect } from "next/navigation";
import {
  clearQuoteSession,
  createQuoteSession,
  isQuoteAuthConfigured,
  verifyQuoteCredentials,
} from "@/lib/quote-auth";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function loginQuoteAdmin(formData: FormData) {
  if (!isQuoteAuthConfigured()) redirect("/admin/presupuestos?error=setup");

  const username = formString(formData, "username");
  const password = formString(formData, "password");
  if (!verifyQuoteCredentials(username, password)) {
    redirect("/admin/presupuestos?error=invalid");
  }

  await createQuoteSession();
  redirect("/admin/presupuestos");
}

export async function logoutQuoteAdmin() {
  await clearQuoteSession();
  redirect("/admin/presupuestos");
}
