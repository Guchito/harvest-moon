import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Aviso legal", robots: { index: false } };

export default function Page() {
  return <LegalPage name="aviso-legal" />;
}
