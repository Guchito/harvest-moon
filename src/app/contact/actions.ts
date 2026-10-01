"use server";

import { redirect } from "next/navigation";
import { sendMail } from "@/lib/mail";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function submitContact(fd: FormData) {
  if (str(fd, "website")) redirect("/contact?enviado=1"); // honeypot: bots fill it, humans never see it

  const name = str(fd, "name"), email = str(fd, "email"), message = str(fd, "message");
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !message || message.length > 5000) {
    redirect("/contact?error=1");
  }

  const lines = [
    `Nombre: ${name}`,
    `Email: ${email}`,
    `Teléfono: ${str(fd, "phone") || "-"}`,
    `Fecha del evento: ${str(fd, "date") || "-"}`,
    `Tipo de evento: ${str(fd, "type") || "-"}`,
    `DJ: ${str(fd, "dj") || "Sin preferencia"}`,
    "",
    message,
  ];

  try {
    await sendMail({ subject: `Solicitud de presupuesto · ${name}`, text: lines.join("\n"), replyTo: email });
  } catch (e) {
    console.error("contact mail failed", e);
    redirect("/contact?error=1");
  }
  redirect("/contact?enviado=1");
}
