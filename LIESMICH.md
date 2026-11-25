# Fertig gebaute Agentur-Website

Dieser Zweig enthaelt **nur den Build** von `qom-website` (Astro, `npm run build`),
damit der Infomaniak-Apache-Server die Seite per `git pull` holen kann – dort ist
kein Node installiert, es kann also nicht auf dem Server gebaut werden.

Nicht von Hand bearbeiten. Ablauf bei Aenderungen:

    npm run build          # im Hauptzweig
    # dist/ in diesen Zweig kopieren und pushen
    # danach auf dem Server:  cd ~/sites/quitordinarymarketing.ch && git pull
