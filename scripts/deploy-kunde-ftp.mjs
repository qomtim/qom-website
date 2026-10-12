// ============================================================
// FTP-Deploy für eine KUNDENSEITE auf dem Infomaniak-Hosting.
// Lädt den Ordner $QUELLE in den Website-Ordner $SITE hoch.
// Streng: Findet das Skript den Ordner nicht eindeutig, bricht es ab –
// es lädt NIE in den Start-Ordner (das wäre die Agentur-Website).
// ============================================================
import { Client } from "basic-ftp";

const HOST = (process.env.FTP_SERVER || "").trim();
const USER = (process.env.FTP_USERNAME || "").trim();
const PASS = process.env.FTP_PASSWORD || "";
const SITE = (process.env.SITE || "").trim();
const QUELLE = (process.env.QUELLE || "").trim();

if (!HOST || !USER || !PASS || !SITE || !QUELLE) {
  console.error("❌ FTP_SERVER, FTP_USERNAME, FTP_PASSWORD, SITE oder QUELLE fehlt.");
  process.exit(1);
}

const client = new Client(30000);
try {
  await client.access({ host: HOST, user: USER, password: PASS, secure: true, secureOptions: { rejectUnauthorized: false } });
  console.log(`✓ Verbunden als ${USER}`);
  const names = (await client.list()).map((f) => f.name);
  console.log("Inhalt des Start-Ordners:", names.join(", ") || "(leer)");

  let target;
  if (names.includes(SITE)) target = SITE;                  // Start = /sites
  else if (names.includes("sites")) target = `sites/${SITE}`; // Start = Hosting-Root
  else {
    console.error(`❌ Ordner ${SITE} nicht gefunden – nichts hochgeladen. Inhalt siehe oben.`);
    process.exit(1);
  }
  await client.cd(target);
  console.log(`→ Ziel: ${target}`);
  console.log("Vorher im Ziel:", (await client.list()).map((f) => f.name).join(", ") || "(leer)");
  await client.uploadFromDir(QUELLE);
  console.log("Nachher im Ziel:", (await client.list()).map((f) => f.name).join(", "));
  console.log("✅ Upload abgeschlossen.");
} catch (err) {
  console.error("❌ FTP-Fehler:", err.message);
  process.exit(1);
} finally {
  client.close();
}
