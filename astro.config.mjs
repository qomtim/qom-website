import { defineConfig } from "astro/config";

// QOM Baukasten – statischer Output (kein Server nötig, läuft auf jedem Hosting)
export default defineConfig({
  output: "static",
  site: "https://neu.quitordinarymarketing.ch",
  trailingSlash: "ignore",
});
