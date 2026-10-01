import { Resend } from "resend";

// Single outbound-mail helper. Contact, booking and lighting requests all go through here.
// ponytail: plain text only; add a React email template when a request type needs formatting.
export async function sendMail({ subject, text, replyTo }: { subject: string; text: string; replyTo?: string }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM ?? "Harvest Moon <onboarding@resend.dev>",
    to: process.env.MAIL_TO ?? "info@harvestmoonevents.eu",
    replyTo,
    subject,
    text,
  });
  if (error) throw new Error(error.message);
}
