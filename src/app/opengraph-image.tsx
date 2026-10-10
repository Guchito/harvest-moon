import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { Mark, archivoBlack } from "@/lib/og";

// Preview card shown when the URL is pasted in WhatsApp, iMessage, Slack, social...
export const alt = "Harvest Moon · DJs para bodas y fiestas en Barcelona";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const photo = `data:image/jpeg;base64,${fs.readFileSync(path.join(process.cwd(), "public/media/pages/pista.jpg")).toString("base64")}`;
  return new ImageResponse(
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0a0820", color: "#f2f0ff", fontFamily: "Archivo" }}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img src={photo} width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", backgroundImage: "linear-gradient(90deg, #0a0820 20%, rgba(10,8,32,0.75) 55%, rgba(10,8,32,0.15) 100%)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 40, letterSpacing: -1 }}>
        <Mark size={72} />
        Harvest Moon
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 132, lineHeight: 0.9, letterSpacing: -7 }}>
        <span>Nuestra música,</span>
        <span style={{ color: "#8f84ff" }}>tu fiesta.</span>
      </div>
      <div style={{ display: "flex", fontSize: 30, color: "#a9a4d6" }}>DJs para bodas, fiestas, pool parties y afterworks · Barcelona</div>
    </div>,
    { ...size, fonts: [{ name: "Archivo", data: archivoBlack(), weight: 900, style: "normal" }] },
  );
}
