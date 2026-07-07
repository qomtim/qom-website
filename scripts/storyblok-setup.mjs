// ============================================================
// QOM Baukasten – Storyblok-Setup (einmalig, läuft in GitHub Actions)
// Legt die Komponenten (Schema) an und befüllt die "site"-Story
// mit den aktuellen Inhalten aus src/data/site.js.
// Idempotent: kann gefahrlos mehrfach laufen (aktualisiert statt dupliziert).
// ============================================================

import { site, services, cases, team, regio, quotes, stats, faqCommon, hero, about } from "../src/data/site.js";

const SPACE = (process.env.STORYBLOK_SPACE_ID || "").trim();
const TOKEN = (process.env.STORYBLOK_MANAGEMENT_TOKEN || "").trim();
if (!SPACE || !TOKEN) {
  console.error("FEHLER: STORYBLOK_SPACE_ID oder STORYBLOK_MANAGEMENT_TOKEN fehlt.");
  process.exit(1);
}
// Diagnose ohne Geheimnisse zu verraten:
console.log(`Diagnose: Space-ID hat ${SPACE.length} Zeichen, nur Ziffern: ${/^\d+$/.test(SPACE)} | Token hat ${TOKEN.length} Zeichen`);
if (!/^\d+$/.test(SPACE)) {
  console.error("❌ FEHLER: STORYBLOK_SPACE_ID darf nur aus Ziffern bestehen (keine #, Leerzeichen oder Buchstaben).");
  process.exit(1);
}

const API = `https://mapi.storyblok.com/v1/spaces/${SPACE}`;
const headers = { Authorization: TOKEN, "Content-Type": "application/json" };

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { ok: res.ok, status: res.status, json, text };
}

// Kurze Pause zwischen Calls (Rate-Limit der Management API)
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- 0) Verbindungs-Check mit klaren Fehlermeldungen ----------

async function preflight() {
  const r = await api("GET", "");
  if (r.status === 401) {
    console.error("❌ FEHLER: Der STORYBLOK_MANAGEMENT_TOKEN wird nicht akzeptiert (401).");
    console.error("   → Es muss ein PERSONAL ACCESS TOKEN sein: app.storyblok.com → Avatar oben rechts → My Account → Security → Personal Access Tokens.");
    console.error("   → NICHT der Preview-Token aus den Space-Settings.");
    process.exit(1);
  }
  if (r.status === 404) {
    console.error(`❌ FEHLER: Space mit ID "${SPACE}" nicht gefunden (404).`);
    console.error("   → STORYBLOK_SPACE_ID prüfen: Die Zahl in der URL app.storyblok.com/#/me/spaces/HIER/... (nur Ziffern).");
    process.exit(1);
  }
  if (!r.ok) {
    console.error(`❌ FEHLER beim Verbindungs-Check (${r.status}):`, r.text?.slice(0, 300));
    process.exit(1);
  }
  console.log(`✓ Verbindung ok – Space: ${r.json?.space?.name ?? SPACE}`);
}

await preflight();

// ---------- 1) Komponenten (Schema) ----------

const textField = (name, pos = 0) => ({ type: "text", display_name: name, pos });
const areaField = (name, pos = 0) => ({ type: "textarea", display_name: name, pos });
const bloksField = (name, whitelist, pos = 0) => ({
  type: "bloks",
  display_name: name,
  restrict_components: true,
  component_whitelist: whitelist,
  pos,
});

const components = [
  {
    name: "service",
    display_name: "Dienstleistung",
    is_nestable: true,
    schema: {
      num: textField("Nummer, z.B. (01)", 0),
      title: textField("Titel", 1),
      slug: textField("URL-Teil (nicht ändern)", 2),
      teaser: areaField("Kurzbeschrieb", 3),
      image: textField("Bild-URL", 4),
    },
  },
  {
    name: "case_study",
    display_name: "Case Study",
    is_nestable: true,
    schema: {
      tag: textField("Kategorie, z.B. Webdesign", 0),
      title: textField("Titel", 1),
      url: textField("Link zur Live-Seite", 2),
      link_label: textField("Link-Beschriftung", 3),
      text: areaField("Beschreibung", 4),
      image: textField("Bild-URL", 5),
    },
  },
  {
    name: "member",
    display_name: "Team-Mitglied",
    is_nestable: true,
    schema: {
      name: textField("Name", 0),
      role: textField("Funktion", 1),
      image: textField("Foto-URL", 2),
      linkedin: textField("LinkedIn-URL (optional)", 3),
    },
  },
  {
    name: "regio_item",
    display_name: "Regional-Karte",
    is_nestable: true,
    schema: {
      title: textField("Titel", 0),
      text: areaField("Text", 1),
      image: textField("Bild-URL", 2),
    },
  },
  {
    name: "quote",
    display_name: "Kundenstimme",
    is_nestable: true,
    schema: {
      text: areaField("Zitat", 0),
      who: textField("Wer (Name · Firma)", 1),
    },
  },
  {
    name: "stat",
    display_name: "Kennzahl",
    is_nestable: true,
    schema: {
      value: { type: "number", display_name: "Zahl", pos: 0 },
      suffix: textField("Anhängsel, z.B. + oder %", 1),
      label: areaField("Beschriftung", 2),
    },
  },
  {
    name: "faq_item",
    display_name: "FAQ-Eintrag",
    is_nestable: true,
    schema: {
      question: textField("Frage", 0),
      answer: areaField("Antwort", 1),
    },
  },
  {
    name: "site",
    display_name: "Website-Inhalte",
    is_root: true,
    is_nestable: false,
    schema: {
      hero_label: textField("Hero: Überzeile", 0),
      hero_title_1: textField("Hero: Titel Zeile 1", 1),
      hero_title_accent: textField("Hero: Titel farbig", 2),
      hero_title_2: textField("Hero: Titel Zeile 3", 3),
      hero_lead: areaField("Hero: Einleitungstext", 4),
      hero_image: textField("Hero: Bild-URL", 5),
      about_title: textField("Über uns: Titel", 6),
      about_text: areaField("Über uns: Text", 7),
      about_image: textField("Über uns: Bild-URL", 8),
      claim: textField("Claim (Footer)", 9),
      email: textField("E-Mail", 10),
      phone: textField("Telefon (Anzeige)", 11),
      phone_link: textField("Telefon (Link, ohne Leerzeichen)", 12),
      booking_url: textField("Buchungs-Link (TidyCal)", 13),
      booking_label: textField("Buchungs-Button-Text", 14),
      city: textField("Ort", 15),
      stats: bloksField("Kennzahlen", ["stat"], 16),
      services: bloksField("Dienstleistungen", ["service"], 17),
      cases: bloksField("Case Studies", ["case_study"], 18),
      team: bloksField("Team", ["member"], 19),
      regio: bloksField("Regional verankert", ["regio_item"], 20),
      quotes: bloksField("Kundenstimmen", ["quote"], 21),
      faq: bloksField("FAQ (Basis)", ["faq_item"], 22),
    },
  },
];

async function upsertComponents() {
  const existing = await api("GET", "/components/");
  if (!existing.ok) {
    console.error(`❌ FEHLER: Komponenten-Liste nicht lesbar (${existing.status}):`, existing.text?.slice(0, 300));
    process.exit(1);
  }
  const byName = new Map((existing.json?.components ?? []).map((c) => [c.name, c.id]));

  for (const comp of components) {
    const payload = { component: comp };
    if (byName.has(comp.name)) {
      const r = await api("PUT", `/components/${byName.get(comp.name)}`, payload);
      console.log(`Komponente aktualisiert: ${comp.name} (${r.status})`);
      if (!r.ok) { console.error(r.text?.slice(0, 400)); process.exit(1); }
    } else {
      const r = await api("POST", "/components/", payload);
      console.log(`Komponente erstellt: ${comp.name} (${r.status})`);
      if (!r.ok) { console.error(r.text?.slice(0, 400)); process.exit(1); }
    }
    await wait(400);
  }
}

// ---------- 2) Site-Story befüllen ----------

const b = (component, obj) => ({ component, ...obj });

const storyContent = {
  component: "site",
  hero_label: hero.label,
  hero_title_1: hero.title1,
  hero_title_accent: hero.titleAccent,
  hero_title_2: hero.title2,
  hero_lead: hero.lead,
  hero_image: hero.image,
  about_title: about.title,
  about_text: about.text,
  about_image: about.image,
  claim: site.claim,
  email: site.email,
  phone: site.phone,
  phone_link: site.phoneLink,
  booking_url: site.bookingUrl,
  booking_label: site.bookingLabel,
  city: site.city,
  stats: stats.map((s) => b("stat", { value: s.value, suffix: s.suffix, label: s.label })),
  services: services.map((s) => b("service", s)),
  cases: cases.map((c) => b("case_study", { tag: c.tag, title: c.title, url: c.url, link_label: c.linkLabel, text: c.text, image: c.image })),
  team: team.map((m) => b("member", { name: m.name, role: m.role, image: m.image, linkedin: m.linkedin ?? "" })),
  regio: regio.map((r) => b("regio_item", r)),
  quotes: quotes.map((q) => b("quote", q)),
  faq: faqCommon.map((f) => b("faq_item", { question: f.q, answer: f.a })),
};

async function upsertStory() {
  const found = await api("GET", "/stories/?with_slug=site");
  const existing = found.json?.stories?.[0];
  const payload = { story: { name: "Website-Inhalte", slug: "site", content: storyContent }, publish: 1 };

  if (existing) {
    const r = await api("PUT", `/stories/${existing.id}`, payload);
    console.log(`Story aktualisiert (${r.status})`);
    if (!r.ok) { console.error(r.text); process.exit(1); }
  } else {
    const r = await api("POST", "/stories", payload);
    console.log(`Story erstellt (${r.status})`);
    if (!r.ok) { console.error(r.text); process.exit(1); }
  }
}

await upsertComponents();
await upsertStory();
console.log("✅ Storyblok-Setup abgeschlossen. Inhalte sind unter app.storyblok.com bearbeitbar.");
