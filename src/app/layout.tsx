import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.harvestmoonevents.eu"),
  title: { default: "Harvest Moon · DJs para bodas y eventos en Barcelona", template: "%s · Harvest Moon" },
  description: "Agencia de DJs en Barcelona para bodas, eventos de empresa y pool parties en hoteles.",
  openGraph: { type: "website", locale: "es_ES", siteName: "Harvest Moon" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${archivo.variable} h-full font-sans`}>
      <body className="flex min-h-full flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
