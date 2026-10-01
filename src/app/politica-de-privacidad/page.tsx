import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Política de privacidad", robots: { index: false } };

export default function Page() {
  return <LegalPage name="privacidad" />;
}
