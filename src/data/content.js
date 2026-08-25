// =============================================================================
// QOM Website – Inhalts-Lader
// =============================================================================
//
// Frueher holte diese Datei die Inhalte beim Bauen aus Storyblok und fiel bei
// Ausfall auf site.js zurueck. Seit dem Umzug weg von Storyblok gibt es nur
// noch eine Quelle: src/data/site.js.
//
// Die Seiten importieren weiterhin aus dieser Datei – so musste beim Umzug
// keine einzige Seite angefasst werden.
// =============================================================================

export {
  site,
  hero,
  about,
  nav,
  services,
  cases,
  team,
  regio,
  quotes,
  stats,
  ueberUns,
  impressum,
  datenschutz,
  faqCommon,
} from "./site.js";
