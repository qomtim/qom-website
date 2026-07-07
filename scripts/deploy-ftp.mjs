// ============================================================
// QOM Baukasten – robuster FTP-Deploy
// Findet den Website-Ordner SELBST, egal wo der FTP-Benutzer
// landet (Hosting-Root, /sites oder direkt im Website-Ordner),
// und spiegelt dist/ dorthin. Keine Ordner-Raterei mehr.
// ============================================================

import { Client } from "basic-ftp";

const HOST = (process.env.FTP_SERVER || "").trim();
const USER = (process.env.FTP_USERNAME || "").trim();
const PASS = process.env.FTP_PASSWORD || "";
const SITE = "neu.quitordinarymarketing.ch";

if (!HOST || !USER || !PASS) {
  console.error("❌ FTP_SERVER, FTP_USERNAME oder FTP_PASSWORD fehlt.");
  process.exit(1);
}

const client = new Client(30000);

try {
  await client.access({ host: HOST, user: USER, password: PASS, secure: true, secureOptions: { rejectUnauthorized: false } });
  console.log(`✓ Verbunden als ${USER}`);

  const names = (await client.list()).map((f) => f.name);
  console.log("Inhalt des Start-Ordners:", names.join(", ") || "(leer)");

  // Website-Ordner automatisch finden:
  let target;
  if (names.includes(SITE)) {
    target = SITE; // Start = /sites → eine Ebene rein
  } else if (names.includes("sites")) {
    target = `sites/${SITE}`; // Start = Hosting-Root → zwei Ebenen rein
  } else if (names.includes(".user.ini") || names.includes(".htaccess") || names.includes("index.html")) {
    target = "."; // Start = direkt im Website-Ordner
  } else {
    console.error("❌ Konnte den Website-Ordner nicht erkennen. Inhalt siehe oben.");
    process.exit(1);
  }
  console.log(`→ Ziel erkannt: ${target === "." ? "Start-Ordner (= Website-Ordner)" : target}`);

  if (target !== ".") await client.cd(target);
  await client.uploadFromDir("dist");
  console.log("✅ Upload abgeschlossen – Website ist aktuell.");
} catch (err) {
  console.error("❌ FTP-Fehler:", err.message);
  process.exit(1);
} finally {
  client.close();
}
