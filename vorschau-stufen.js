/* ============================================================
   Design-Vorschau – Dienstleistungen als Scroll-Ablauf.
   Laeuft nur auf der Vorschau-Seite.
   ============================================================ */
(function () {
  const stufen = document.querySelector(".stufen");
  if (!stufen) return;

  const karten = Array.prototype.slice.call(stufen.querySelectorAll(".stufe"));
  const bilder = Array.prototype.slice.call(stufen.querySelectorAll(".stufen-bild"));
  const balken = stufen.querySelector(".stufen-fortschritt");
  const schiene = stufen.querySelector(".stufen-schiene");
  const anzahl = karten.length;
  if (!anzahl) return;

  let aktiv = -1;

  function setzen(i) {
    aktiv = i;
    stufen.setAttribute("data-aktiv", String(i));
    karten.forEach((k, n) => k.classList.toggle("aktiv", n === i));
    bilder.forEach((b, n) => b.classList.toggle("aktiv", n === i));
  }

  function rechnen() {
    // Auf schmalen Bildschirmen steht alles untereinander – nichts zu steuern.
    if (window.matchMedia("(max-width: 960px)").matches) {
      if (aktiv !== 0) setzen(0);
      return;
    }
    const r = stufen.getBoundingClientRect();
    const weg = r.height - window.innerHeight;
    const anteil = weg > 0 ? Math.min(Math.max(-r.top / weg, 0), 1) : 0;
    const i = Math.min(Math.floor(anteil * anzahl), anzahl - 1);
    if (i !== aktiv) setzen(i);
    if (balken && schiene) {
      balken.style.height = anteil * Math.max(schiene.getBoundingClientRect().height - 24, 0) + "px";
    }
  }

  setzen(0);
  addEventListener("scroll", rechnen, { passive: true });
  addEventListener("resize", rechnen);
  addEventListener("load", rechnen);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") rechnen();
  });
  rechnen();
})();
