// ============================================================
// QOM Baukasten – Inhalts-Lader
// Holt beim Bauen die Inhalte aus Storyblok (Kundenoberfläche).
// Fällt automatisch auf src/data/site.js zurück, wenn kein Token
// gesetzt ist oder Storyblok nicht erreichbar ist.
// Die Seiten importieren IMMER aus dieser Datei.
// ============================================================

import * as fb from "./site.js";

async function fetchStoryblok() {
  const token = process.env.STORYBLOK_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.storyblok.com/v2/cdn/stories/site?version=published&token=${token}&cv=${Date.now()}`
    );
    if (!res.ok) {
      console.warn(`[content] Storyblok antwortet mit ${res.status} – nutze Fallback-Inhalte.`);
      return null;
    }
    const data = await res.json();
    console.log("[content] Inhalte aus Storyblok geladen.");
    return data.story?.content ?? null;
  } catch (e) {
    console.warn("[content] Storyblok nicht erreichbar – nutze Fallback-Inhalte.", e?.message);
    return null;
  }
}

const c = await fetchStoryblok();

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
};

export const hero = {
  label: pick(c?.hero_label, fb.hero.label),
  title1: pick(c?.hero_title_1, fb.hero.title1),
  titleAccent: pick(c?.hero_title_accent, fb.hero.titleAccent),
  title2: pick(c?.hero_title_2, fb.hero.title2),
  lead: pick(c?.hero_lead, fb.hero.lead),
  image: pick(c?.hero_image, fb.hero.image),
};

export const about = {
  title: pick(c?.about_title, fb.about.title),
  text: pick(c?.about_text, fb.about.text),
  image: pick(c?.about_image, fb.about.image),
};

export const nav = fb.nav;

// uid = Storyblok-Element-ID (nötig fürs Klick-Editing im Visual Editor)
export const services = c?.services?.length
  ? c.services.map((s) => ({ num: s.num, title: s.title, slug: s.slug, teaser: s.teaser, image: s.image, uid: s._uid }))
  : fb.services;

export const cases = c?.cases?.length
  ? c.cases.map((x) => ({ tag: x.tag, title: x.title, url: x.url, linkLabel: x.link_label, text: x.text, image: x.image, uid: x._uid }))
  : fb.cases;

export const team = c?.team?.length
  ? c.team.map((m) => ({ name: m.name, role: m.role, image: m.image, linkedin: m.linkedin || null, uid: m._uid }))
  : fb.team;

export const regio = c?.regio?.length
  ? c.regio.map((r) => ({ title: r.title, text: r.text, image: r.image, uid: r._uid }))
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
