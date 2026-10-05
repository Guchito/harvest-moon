import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getSite } from "@/lib/content";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  // Vercel's production URL (the custom domain once attached), so share previews work before the DNS switch.
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://www.harvestmoonevents.eu"),
  title: { default: "Harvest Moon · DJs para bodas y eventos en Barcelona", template: "%s · Harvest Moon" },
  description: "Agencia de DJs en Barcelona para bodas, eventos de empresa y pool parties en hoteles.",
  openGraph: { type: "website", locale: "es_ES", siteName: "Harvest Moon" },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const s = getSite();
  // Structured data so Google can show the business card (name, phone, address) in results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: s.name,
    description: metadata.description,
    url: "https://www.harvestmoonevents.eu",
    email: s.email,
    telephone: s.phone,
    address: { "@type": "PostalAddress", streetAddress: s.address.split(",")[0], addressLocality: "Barcelona", addressCountry: "ES" },
    areaServed: "Barcelona",
    sameAs: [s.instagram, s.spotify].filter(Boolean),
  };
  return (
    <html lang="es" className={`${archivo.variable} h-full font-sans`}>
      <body className="flex min-h-full flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
