// ============================================================
// QOM Baukasten – Storyblok Visual Editor (Stufe 2)
// Läuft NUR innerhalb des Storyblok-Editors (?_storyblok=...).
// Holt den Entwurfs-Stand, aktualisiert die Seite live beim
// Tippen und macht Sektionen klickbar (öffnet das passende Feld).
// Auf der normalen Live-Seite macht dieses Skript nichts.
// ============================================================

(function () {
  if (!/[?&]_storyblok=/.test(window.location.search)) return;

  var meta = document.querySelector('meta[name="sb-preview-token"]');
  if (!meta || !meta.content) return;
  var token = meta.content;

  // --- Einfache Felder: <el data-sb="feldname"> / <img data-sb-img="feldname"> ---
  function setScalars(c) {
    document.querySelectorAll("[data-sb]").forEach(function (el) {
      var v = c[el.getAttribute("data-sb")];
      if (v !== undefined && v !== null && v !== "") el.textContent = v;
    });
    document.querySelectorAll("[data-sb-img]").forEach(function (el) {
      var v = c[el.getAttribute("data-sb-img")];
      if (v) el.src = v;
    });
  }

  // --- Listen-Einträge: <el data-sb-uid="..."> mit Kindern data-sb-f / data-sb-f-img ---
  function indexBloks(c) {
    var map = {};
    Object.keys(c).forEach(function (k) {
      var v = c[k];
      if (Array.isArray(v)) {
        v.forEach(function (b) {
          if (b && b._uid) map[b._uid] = b;
        });
      }
    });
    return map;
  }

  function setBloks(c) {
    var map = indexBloks(c);
    document.querySelectorAll("[data-sb-uid]").forEach(function (el) {
      var b = map[el.getAttribute("data-sb-uid")];
      if (!b) return;
      el.querySelectorAll("[data-sb-f]").forEach(function (f) {
        var v = b[f.getAttribute("data-sb-f")];
        if (v !== undefined && v !== null) f.textContent = v;
      });
      el.querySelectorAll("[data-sb-f-img]").forEach(function (f) {
        var v = b[f.getAttribute("data-sb-f-img")];
        if (v) f.src = v;
      });
      // Klick-auf-Element → passendes Feld im Editor öffnen
      if (b._editable) {
        var m = b._editable.match(/\{.*\}/);
        if (m) {
          el.setAttribute("data-blok-c", m[0]);
          try {
            var info = JSON.parse(m[0]);
            el.setAttribute("data-blok-uid", info.id + "-" + info.uid);
          } catch (e) {}
        }
      }
    });
  }

  function apply(content) {
    if (!content) return;
    setScalars(content);
    setBloks(content);
  }

  // 1) Entwurfs-Stand laden und anwenden
  fetch(
    "https://api.storyblok.com/v2/cdn/stories/site?version=draft&token=" +
      token + "&cv=" + Date.now()
  )
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && d.story) apply(d.story.content);
      loadBridge();
    })
    .catch(loadBridge);

  // 2) Storyblok-Bridge laden: Live-Updates beim Tippen
  function loadBridge() {
    var s = document.createElement("script");
    s.src = "https://app.storyblok.com/f/storyblok-v2-latest.js";
    s.onload = function () {
      var bridge = new window.StoryblokBridge();
      bridge.on(["input"], function (e) {
        if (e && e.story) apply(e.story.content);
      });
      bridge.on(["published", "change"], function () {
        window.location.reload();
      });
    };
    document.head.appendChild(s);
  }
})();
