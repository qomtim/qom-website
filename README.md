# QOM Website – Baukasten-System

Die Website von QOM – Quit Ordinary Marketing, gebaut mit dem QOM-Baukasten:
**Astro** (statischer Output) · Komponenten-Bibliothek · automatischer Deploy zu **Infomaniak**.

## So funktioniert es

- **Inhalte** liegen zentral in `src/data/site.js` (später: Storyblok CMS)
- **Bausteine** in `src/components/` und `src/layouts/` – daraus wird jede Seite zusammengesetzt
- **Seiten** in `src/pages/` – eine Datei = eine URL
- **Design** in `public/styles.css` (CI-Farben als CSS-Variablen am Dateianfang)

## Deploy

Jeder Push auf `main` baut die Seite automatisch und lädt sie per FTP zu Infomaniak hoch
(siehe `.github/workflows/deploy.yml`). Die FTP-Zugangsdaten liegen als GitHub Secrets:
`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.

## Lokal arbeiten (optional)

```bash
npm install
npm run dev      # Vorschau auf localhost:4321
npm run build    # statischer Build nach dist/
```

Erstellt mit Claude · Juli 2026
