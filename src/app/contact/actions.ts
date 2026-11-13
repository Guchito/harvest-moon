"use server";

import { redirect } from "next/navigation";
import { sendMail } from "@/lib/mail";

// Single-line fields: newlines collapsed (name lands in the email subject), length capped.
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").replace(/\s+/g, " ").trim().slice(0, 200);

export async function submitContact(fd: FormData) {
  if (str(fd, "website")) redirect("/contact?enviado=1#formulario"); // honeypot: bots fill it, humans never see it

  const name = str(fd, "name"), email = str(fd, "email"), message = String(fd.get("message") ?? "").trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !message || message.length > 5000 || !fd.get("privacy")) {
    redirect("/contact?error=1#formulario");
  }

  const lines = [
    `Nombre: ${name}`,
    `Email: ${email}`,
    `Teléfono: ${str(fd, "phone") || "-"}`,
    `Fecha del evento: ${str(fd, "date") || "-"}`,
    `Tipo de evento: ${str(fd, "type") || "-"}`,
    "",
    message,
  ];

  try {
    await sendMail({ subject: `Solicitud de presupuesto · ${name}`, text: lines.join("\n"), replyTo: email });
  } catch (e) {
    console.error("contact mail failed", e);
    redirect("/contact?error=1#formulario");
  }
  redirect("/contact?enviado=1#formulario");
}
