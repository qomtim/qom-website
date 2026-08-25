// ============================================================
// QOM Baukasten – Inhalts-Lader
// Holt beim Bauen die Inhalte aus Storyblok (Kundenoberfläche).
// Fällt automatisch auf src/data/site.js zurück, wenn kein Token
// gesetzt ist oder Storyblok nicht erreichbar ist.
// Die Seiten importieren IMMER aus dieser Datei.
// ============================================================

import * as fb from "./site.js";

async function fetchStory(slug) {
  const token = process.env.STORYBLOK_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.storyblok.com/v2/cdn/stories/${slug}?version=published&token=${token}&cv=${Date.now()}`
    );
    if (!res.ok) {
      console.warn(`[content] Storyblok "${slug}" antwortet mit ${res.status} – nutze Fallback.`);
      return null;
    }
    const data = await res.json();
    console.log(`[content] Story "${slug}" aus Storyblok geladen.`);
    return data.story?.content ?? null;
  } catch (e) {
    console.warn(`[content] Storyblok "${slug}" nicht erreichbar – nutze Fallback.`, e?.message);
    return null;
  }
}

const [c, uu, im, ds] = await Promise.all([
  fetchStory("site"),
  fetchStory("ueber-uns"),
  fetchStory("impressum"),
  fetchStory("datenschutz"),
]);

// Bilder in passender Groesse ausliefern lassen.
// Storyblok kann jedes Bild skalieren und als WebP zurueckgeben. Ohne das
// laedt die Startseite Bilder in Originalgroesse - eines davon war 6,5 MB
// gross, wodurch die Hover-Vorschau bei "Webdesign" sekundenlang leer blieb.
// Mit /m/<breite>x0/filters:format(webp) sind daraus 45 KB geworden.
function bild(url, breite = 1200) {
  const u = String(url || "");
  if (!u.includes("a.storyblok.com")) return u; // Fremde Quelle: unveraendert
  if (u.includes("/m/")) return u;              // schon umgewandelt
  return `${u}/m/${breite}x0/filters:format(webp)`;
}

// Hilfsfunktion: Storyblok-Wert nur nehmen, wenn er nicht leer ist
const pick = (v, fallback) => (v !== undefined && v !== null && v !== "" ? v : fallback);

export const site = {
  ...fb.site,
  claim: pick(c?.claim, fb.site.claim),
  email: pick(c?.email, fb.site.email),
  phone: pick(c?.phone, fb.site.phone),
  phoneLink: pick(c?.phone_link, fb.site.phoneLink),
  bookingUrl: pick(c?.booking_url, fb.site.bookingUrl),
  bookingLabel: pick(c?.booking_label, fb.site.bookingLabel),
  city: pick(c?.city, fb.site.city),
  logoUrl: bild(pick(c?.logo_url, fb.site.logoUrl), 500),
};

export const hero = {
  label: pick(c?.hero_label, fb.hero.label),
  title1: pick(c?.hero_title_1, fb.hero.title1),
  titleAccent: pick(c?.hero_title_accent, fb.hero.titleAccent),
  title2: pick(c?.hero_title_2, fb.hero.title2),
  lead: pick(c?.hero_lead, fb.hero.lead),
  image: bild(pick(c?.hero_image, fb.hero.image), 1400),
};

export const about = {
  title: pick(c?.about_title, fb.about.title),
  text: pick(c?.about_text, fb.about.text),
  image: bild(pick(c?.about_image, fb.about.image), 1000),
};

export const nav = fb.nav;

// uid = Storyblok-Element-ID (nötig fürs Klick-Editing im Visual Editor)
export const services = c?.services?.length
  ? c.services.map((s) => ({ num: s.num, title: s.title, slug: s.slug, teaser: s.teaser, image: bild(s.image, 1000), uid: s._uid }))
  : fb.services;

export const cases = c?.cases?.length
  ? c.cases.map((x) => ({ tag: x.tag, title: x.title, url: x.url, linkLabel: x.link_label, text: x.text, image: bild(x.image, 1100), uid: x._uid }))
  : fb.cases;

export const team = c?.team?.length
  ? c.team.map((m) => ({ name: m.name, role: m.role, image: bild(m.image, 700), uid: m._uid, linkedin: m.linkedin || null }))
  : fb.team;

export const regio = c?.regio?.length
  ? c.regio.map((r) => ({ title: r.title, text: r.text, image: bild(r.image, 800), uid: r._uid }))
  : fb.regio;

export const quotes = c?.quotes?.length
  ? c.quotes.map((q) => ({ text: q.text, who: q.who, uid: q._uid }))
  : fb.quotes;

export const stats = c?.stats?.length
  ? c.stats.map((s) => ({ value: Number(s.value) || 0, suffix: s.suffix || "", label: s.label, uid: s._uid }))
  : fb.stats;

export const faqCommon = c?.faq?.length
  ? c.faq.map((f) => ({ q: f.question, a: f.answer, uid: f._uid }))
  : fb.faqCommon;

// ---------- Unterseiten ----------

export const ueberUns = {
  label: pick(uu?.label, fb.ueberUns.label),
  titel1: pick(uu?.titel_1, fb.ueberUns.titel1),
  titelAccent: pick(uu?.titel_accent, fb.ueberUns.titelAccent),
  absatz1: pick(uu?.absatz_1, fb.ueberUns.absatz1),
  absatz2: pick(uu?.absatz_2, fb.ueberUns.absatz2),
  bild: bild(pick(uu?.bild, fb.ueberUns.bild), 1200),
  teamLabel: pick(uu?.team_label, fb.ueberUns.teamLabel),
  teamTitel: pick(uu?.team_titel, fb.ueberUns.teamTitel),
};

export const impressum = {
  adresse: pick(im?.adresse, fb.impressum.adresse),
  personen: pick(im?.personen, fb.impressum.personen),
  haftung: pick(im?.haftung, fb.impressum.haftung),
  urheber: pick(im?.urheber, fb.impressum.urheber),
};

export const datenschutz = {
  verantwortlich: pick(ds?.verantwortlich, fb.datenschutz.verantwortlich),
  erhebung: pick(ds?.erhebung, fb.datenschutz.erhebung),
  terminbuchung: pick(ds?.terminbuchung, fb.datenschutz.terminbuchung),
  hosting: pick(ds?.hosting, fb.datenschutz.hosting),
  weitergabe: pick(ds?.weitergabe, fb.datenschutz.weitergabe),
  rechte: pick(ds?.rechte, fb.datenschutz.rechte),
  aenderungen: pick(ds?.aenderungen, fb.datenschutz.aenderungen),
  stand: pick(ds?.stand, fb.datenschutz.stand),
};
