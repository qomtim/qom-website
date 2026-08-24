/* Holt die im QOM-Portal bearbeiteten Inhalte und setzt sie auf der Seite ein.
   - Standard: veröffentlichte Inhalte (Lese-Token).
   - Vorschau-Modus (?preview=<preview_token>): zeigt den Entwurf.
   - Live-Vorschau: der Editor schickt Änderungen per postMessage → sofort sichtbar.
   - Block-Seiten: Container mit data-qom-bloecke="<sammlung>" werden aus den
     Portal-Blöcken aufgebaut (im Design dieser Website). Der statische Inhalt
     im Container bleibt als Fallback stehen, bis Blöcke geladen sind.
   Fällt das Portal aus, bleiben die fest hinterlegten Inhalte stehen. */
(function () {
  var PORTAL = 'https://portal.quitordinarymarketing.ch';
  var SLUG = 'di-pietro-gartenbau';
  var PUB_TOKEN = 'jCuovXdTEdOoBWbBbEg18-fuvGrrUe6gZ7-SQtMAsaY';

  // ---- Hilfen -------------------------------------------------------------

  function esc(text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, function (z) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[z];
    });
  }

  // Zeilenumbrüche im Text als <br> (nach dem Escapen, also sicher)
  function absatz(text) {
    return esc(text).replace(/\n/g, '<br>');
  }

  // Bild-/Link-Adressen absichern: Portal-Uploads absolut machen,
  // nur http(s) und relative Pfade zulassen (kein javascript: o.ä.).
  function sichereUrl(wert) {
    var url = String(wert || '').trim();
    if (!url) return '';
    if (url.charAt(0) === '/') return PORTAL + url;
    if (/^https?:\/\//i.test(url)) return url;
    if (/^[a-z0-9_\-./#?=&%]+$/i.test(url) && url.indexOf(':') === -1) return url; // relativ
    return '';
  }

  // Farb-Felder aus dem Portal steuern CSS-Variablen der Website
  // (z.B. 'farbe_footer' → Hintergrund des Footer-/CTA-Bands).
  var FARB_ZIELE = { farbe_footer: '--gray' };

  // Was genau soll verschwinden, wenn ein Feld ausgeblendet wird?
  // Standard: das Element selbst. Mit data-qom-huelle="<css-auswahl>" kann die
  // Seite stattdessen einen umgebenden Kasten angeben (z.B. eine ganze Karte).
  function huelleVon(el) {
    var auswahl = el.getAttribute('data-qom-huelle');
    if (auswahl) {
      try { var h = el.closest(auswahl); if (h) return h; } catch (fehler) {}
    }
    return el;
  }

  // Ein Element kann aus zwei Gruenden verschwinden: das Feld wurde geleert
  // ('leer') oder im Portal ausgeblendet ('versteckt'). Beide werden getrennt
  // gemerkt, sonst hebt der eine Grund den anderen versehentlich auf.
  function elementZeigen(el, zeigen, grund) {
    var ziel = huelleVon(el);
    var gruende = (ziel.getAttribute('data-qom-aus') || '').split(' ').filter(Boolean);
    var pos = gruende.indexOf(grund || 'leer');
    if (zeigen) { if (pos >= 0) gruende.splice(pos, 1); }
    else if (pos < 0) { gruende.push(grund || 'leer'); }

    if (gruende.length) {
      if (!ziel.hasAttribute('data-qom-display')) {
        ziel.setAttribute('data-qom-display', ziel.style.display || '');
      }
      ziel.setAttribute('data-qom-aus', gruende.join(' '));
      ziel.style.display = 'none';
    } else {
      ziel.removeAttribute('data-qom-aus');
      if (ziel.hasAttribute('data-qom-display')) {
        ziel.style.display = ziel.getAttribute('data-qom-display');
        ziel.removeAttribute('data-qom-display');
      }
    }
  }

  // Im Portal ausgeblendete Felder auf der Seite verstecken (Inhalt bleibt im
  // Portal erhalten). 'liste' ist die Liste der ausgeblendeten Feld-Schluessel.
  function verstecktAnwenden(liste) {
    if (!liste) return;
    var aus = {};
    liste.forEach(function (k) { aus[k] = true; });
    document.querySelectorAll('[data-qom]').forEach(function (el) {
      elementZeigen(el, !aus[el.getAttribute('data-qom')], 'versteckt');
    });
  }

  function anwenden(felder) {
    if (!felder) return;
    Object.keys(FARB_ZIELE).forEach(function (key) {
      var wert = felder[key];
      if (wert) document.documentElement.style.setProperty(FARB_ZIELE[key], wert);
    });
    document.querySelectorAll('[data-qom]').forEach(function (el) {
      var key = el.getAttribute('data-qom');
      if (!Object.prototype.hasOwnProperty.call(felder, key)) return; // Feld nicht dabei -> fester Inhalt bleibt
      var val = felder[key];
      if (val == null) return;
      var istBild = el.tagName === 'IMG' || el.hasAttribute('data-qom-bg');

      // Geleertes Feld heisst wirklich leeren: Text weg, Bild weg.
      // (Frueher wurde ein leerer Wert ignoriert - dann liess sich nichts entfernen.)
      if (val === '') {
        if (el.tagName === 'IMG') { el.removeAttribute('src'); elementZeigen(el, false, 'leer'); }
        else if (el.hasAttribute('data-qom-bg')) el.style.backgroundImage = '';
        else el.textContent = '';
        return;
      }

      if (istBild && val.charAt(0) === '/') val = PORTAL + val;
      if (el.tagName === 'IMG') { el.setAttribute('src', val); elementZeigen(el, true, 'leer'); }
      else if (el.hasAttribute('data-qom-bg')) el.style.backgroundImage = "url('" + val + "')";
      else {
        el.textContent = val;
        // E-Mail-/Telefon-Elemente: auch den Link des umgebenden <a> mitziehen
        var link = el.closest('a');
        if (link && el.hasAttribute('data-qom-mailto')) link.setAttribute('href', 'mailto:' + val);
        if (link && el.hasAttribute('data-qom-tel')) link.setAttribute('href', 'tel:' + val.replace(/[^+0-9]/g, ''));
      }
    });
  }

  // Kontaktformular: schickt die Nachricht über das Portal an die im Editor
  // hinterlegte Ziel-Adresse. Das versteckte Feld 'website' ist ein Honeypot.
  function kontaktFormularVerdrahten() {
    var form = document.querySelector('form[data-qom-kontakt]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var knopf = form.querySelector('button[type="submit"]');
      var felder = form.querySelectorAll('input, textarea');
      var daten = { token: PUB_TOKEN, name: '', email: '', nachricht: '', website: '' };
      felder.forEach(function (f) {
        if (f.type === 'email') daten.email = f.value;
        else if (f.tagName === 'TEXTAREA') daten.nachricht = f.value;
        else if (f.name === 'website') daten.website = f.value;
        else if (f.type === 'text') daten.name = f.value;
      });
      if (knopf) { knopf.disabled = true; knopf.textContent = 'Wird gesendet …'; }
      fetch(PORTAL + '/api/v1/projects/' + SLUG + '/kontakt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(daten),
      }).then(function (r) { return r.json().then(function (k) { return { ok: r.ok, k: k }; }); })
        .then(function (res) {
          if (knopf) knopf.disabled = false;
          if (res.ok) {
            if (knopf) knopf.textContent = '✓ Nachricht gesendet';
            form.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach(function (f) { f.value = ''; });
          } else if (knopf) {
            knopf.textContent = (res.k && res.k.fehler) || 'Senden fehlgeschlagen – bitte nochmals versuchen';
          }
        }).catch(function () {
          if (knopf) { knopf.disabled = false; knopf.textContent = 'Senden fehlgeschlagen – bitte nochmals versuchen'; }
        });
    });
  }

  // ---- Block-Vorlagen (im Design dieser Website) ---------------------------

  var VORLAGEN = {
    text: function (b) {
      return '<section class="section-tight"><div class="container center">'
        + (b.titel ? '<h2>' + esc(b.titel) + '</h2>' : '')
        + (b.text ? '<p class="lead">' + absatz(b.text) + '</p>' : '')
        + '</div></section>';
    },
    bild: function (b) {
      var url = sichereUrl(b.bild);
      if (!url) return '';
      return '<section class="section-tight"><div class="container center">'
        + '<img src="' + esc(url) + '" alt="' + esc(b.unterschrift) + '" loading="lazy" style="width:100%;border-radius:18px;object-fit:cover">'
        + (b.unterschrift ? '<p class="lead" style="font-size:1rem;margin-top:14px">' + esc(b.unterschrift) + '</p>' : '')
        + '</div></section>';
    },
    bild_text: function (b) {
      var url = sichereUrl(b.bild);
      var bildHtml = url ? '<img src="' + esc(url) + '" alt="' + esc(b.titel) + '" loading="lazy">' : '<span></span>';
      var textHtml = '<div>'
        + (b.titel ? '<h2>' + esc(b.titel) + '</h2>' : '')
        + (b.text ? '<p>' + absatz(b.text) + '</p>' : '')
        + '</div>';
      var innen = b.seite === 'rechts' ? textHtml + bildHtml : bildHtml + textHtml;
      return '<section class="section-tight"><div class="container detail">' + innen + '</div></section>';
    },
    galerie: function (b) {
      var bilder = (b.bilder || []).map(function (e) { return sichereUrl(e.bild); }).filter(Boolean);
      if (!bilder.length) return '';

      var kopf = (b.titel || b.text)
        ? '<div class="container qom-mosaik-kopf">'
            + (b.titel ? '<h2>' + esc(b.titel) + '</h2>' : '')
            + (b.text ? '<p class="lead">' + absatz(b.text) + '</p>' : '')
          + '</div>'
        : '';

      // Solange das Portal die Einstellung "Darstellung" noch nicht kennt,
      // entscheidet die Seite selbst: Referenzen bleibt laufender Streifen,
      // alle anderen Galerien werden Mosaik. Sobald das Feld gepflegt ist,
      // hat es Vorrang.
      var art = b.darstellung;
      if (!art) art = (b.__sammlung === 'seite_referenzen') ? 'slider' : 'mosaik';

      if (art === 'mosaik') {
        bildStilSicherstellen();
        // Spaltenzahl so waehlen, dass das Mosaik ohne Loecher aufgeht.
        // Mit grossem erstem Bild (2x2) braucht es n+3 Zellen; das geht nur
        // auf, wenn n+3 durch die Spaltenzahl teilbar ist. Sonst gleichmaessiges
        // Raster ohne Hero – das sieht auch mit angebrochener letzter Reihe gut
        // aus, waehrend ein grosses Bild plus ein einzelnes kleines unfertig wirkt.
        var n = bilder.length, spalten, hero = false;
        if (n <= 4) {
          spalten = n;
        } else {
          var kandidat = [4, 3].filter(function (sp) { return (n + 3) % sp === 0 && (n + 3) / sp >= 2; });
          if (kandidat.length) { spalten = kandidat[0]; hero = true; }
          else { spalten = (n % 4 === 0) ? 4 : (n % 3 === 0 ? 3 : 4); }
        }
        var klassen = 'qom-mosaik' + (hero ? ' qom-hero' : '') + (n === 1 ? ' qom-eins' : '');
        return '<section class="section-tight">' + kopf + '<div class="container">'
          + '<div class="' + klassen + '" style="grid-template-columns:repeat(' + spalten + ',1fr)">'
          + bilder.map(function (url) { return '<img src="' + esc(url) + '" alt="" loading="lazy">'; }).join('')
          + '</div></div></section>';
      }

      return '<section class="section-tight">' + kopf + '<div class="slider"><div class="slide-track">'
        + bilder.map(function (url) { return '<img src="' + esc(url) + '" alt="" loading="lazy">'; }).join('')
        + '</div></div></section>';
    },
    collage: function (b) {
      var bilder = (b.bilder || []).map(function (e) { return sichereUrl(e.bild); }).filter(Boolean).slice(0, 4);
      if (!bilder.length) return '';
      var stil, extra = '';
      if (bilder.length === 1) {
        stil = 'display:grid;grid-template-columns:1fr;gap:14px';
      } else if (bilder.length === 2) {
        stil = 'display:grid;grid-template-columns:1fr 1fr;gap:14px';
      } else if (bilder.length === 3) {
        // Grosses Bild links, zwei kleinere rechts übereinander
        stil = 'display:grid;grid-template-columns:1.6fr 1fr;grid-template-rows:1fr 1fr;gap:14px';
        extra = 'erste-hoch';
      } else {
        stil = 'display:grid;grid-template-columns:1fr 1fr;gap:14px';
      }
      return '<section class="section-tight"><div class="container"><div style="' + stil + '">'
        + bilder.map(function (url, i) {
            var span = (extra === 'erste-hoch' && i === 0) ? 'grid-row:span 2;' : '';
            var hoehe = (extra === 'erste-hoch' && i === 0) ? 'height:100%;min-height:100%;' : 'aspect-ratio:4/3;';
            return '<img src="' + esc(url) + '" alt="" loading="lazy" style="' + span + hoehe
              + 'width:100%;object-fit:cover;border-radius:14px;display:block">';
          }).join('')
        + '</div></div></section>';
    },
    kacheln: function (b) {
      var kacheln = (b.kacheln || []).filter(function (k) { return sichereUrl(k.bild) || k.titel; });
      if (!kacheln.length) return '';
      // Sobald eine Kachel einen Beschreibungstext hat, steht der Text UNTER
      // dem Bild statt darauf – nur so ist er lesbar (besonders am Handy).
      var mitText = kacheln.some(function (k) { return (k.text || '').trim(); });
      if (mitText) bildStilSicherstellen();
      return '<section class="section-tight"><div class="container"><div class="cards">'
        + kacheln.map(function (k) {
            var ziel = sichereUrl(k.link);
            var bild = sichereUrl(k.bild);
            if (!mitText) {
              return '<a class="card" href="' + esc(ziel || '#') + '">'
                + (bild ? '<img src="' + esc(bild) + '" alt="' + esc(k.titel) + '" loading="lazy">' : '')
                + '<span>' + esc(k.titel) + '</span></a>';
            }
            return '<a class="qom-kachel" href="' + esc(ziel || '#') + '">'
              + (bild ? '<img src="' + esc(bild) + '" alt="' + esc(k.titel) + '" loading="lazy">' : '')
              + '<div class="qom-kachel-text"><b>' + esc(k.titel) + '</b>'
              + (k.text ? '<span>' + absatz(k.text) + '</span>' : '')
              + '</div></a>';
          }).join('')
        + '</div></div></section>';
    },
    stimme: function (b) {
      if (!b.zitat) return '';
      return '<section class="section-tight"><div class="container center">'
        + '<p style="font-size:1.45rem;font-weight:600;line-height:1.5">&#8222;' + absatz(b.zitat) + '&#8220;</p>'
        + (b.name ? '<p class="lead" style="font-size:1rem">&#8212; ' + esc(b.name) + '</p>' : '')
        + '</div></section>';
    },
    stimmen: function (b) {
      var liste = (b.stimmen || []).filter(function (s) { return s.zitat || s.name; });
      if (!liste.length) return '';
      return '<section class="section-tight"><div class="container">'
        + (b.titel ? '<h2 class="center" style="margin-bottom:44px">' + esc(b.titel) + '</h2>' : '')
        + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px">'
        + liste.map(function (s) {
            var anzahl = Math.max(0, Math.min(5, parseInt(s.sterne, 10) || 0));
            var sterne = anzahl
              ? '<div style="color:#f0a500;letter-spacing:3px;font-size:1rem;margin-bottom:14px">'
                + new Array(anzahl + 1).join('&#9733;') + '</div>'
              : '';
            var wer = [esc(s.name), esc(s.ort)].filter(Boolean).join(' &#183; ');
            return '<figure style="margin:0;background:#f4f4f2;border:1px solid rgba(0,0,0,.06);border-radius:var(--radius,20px);padding:32px">'
              + sterne
              + '<blockquote style="margin:0;font-size:1.05rem;line-height:1.65">&#8222;' + absatz(s.zitat) + '&#8220;</blockquote>'
              + (wer ? '<figcaption style="margin-top:18px;font-weight:600">' + wer + '</figcaption>' : '')
              + '</figure>';
          }).join('')
        + '</div></div></section>';
    },
    kennzahlen: function (b) {
      var zahlen = (b.zahlen || []).filter(function (z) { return z.zahl || z.label; });
      if (!zahlen.length) return '';
      return '<section class="section-tight"><div class="container" style="display:flex;gap:56px;flex-wrap:wrap;justify-content:center;text-align:center">'
        + zahlen.map(function (z) {
            return '<div><div style="font-size:2.6rem;font-weight:700;font-family:var(--font-head,inherit)">' + esc(z.zahl) + '</div>'
              + '<div class="lead" style="font-size:1rem;margin-top:2px">' + esc(z.label) + '</div></div>';
          }).join('')
        + '</div></section>';
    },
    faq: function (b) {
      var fragen = (b.fragen || []).filter(function (f) { return f.frage; });
      if (!fragen.length) return '';
      return '<section class="section-tight"><div class="container" style="max-width:820px">'
        + fragen.map(function (f) {
            return '<details style="border-bottom:1px solid rgba(128,128,128,.25);padding:14px 0">'
              + '<summary style="font-weight:600;cursor:pointer;font-size:1.05rem">' + esc(f.frage) + '</summary>'
              + '<p class="lead" style="font-size:1rem;margin-top:8px">' + absatz(f.antwort) + '</p></details>';
          }).join('')
        + '</div></section>';
    },
    cta: function (b) {
      if (!b.titel) return '';
      var ziel = sichereUrl(b.link);
      return '<section class="cta-band" style="padding:70px 0"><div class="container cta-inner">'
        + '<h2>' + esc(b.titel) + '</h2>'
        + (b.button ? '<a href="' + esc(ziel || '#') + '" class="btn btn-lime">' + esc(b.button) + '</a>' : '')
        + '</div></section>';
    },
  };

  // Abstand pro Block. Ohne das haben zwei aufeinanderfolgende Bloecke je
  // 64 px oben UND unten - also 128 px dazwischen, was viel zu viel ist.
  var ABSTAND = { eng: '14px', normal: '36px', weit: '72px' };

  // Mosaik-Collage und Kacheln mit Text. Als eigenes Stil-Element, damit die
  // style.css der Kundenseite unangetastet bleibt.
  function bildStilSicherstellen() {
    if (document.getElementById('qom-bild-stil')) return;
    var stil = document.createElement('style');
    stil.id = 'qom-bild-stil';
    stil.textContent = [
      '.qom-mosaik{display:grid;gap:14px;grid-auto-rows:170px;grid-auto-flow:dense}',
      '.qom-mosaik img{width:100%;height:100%;object-fit:cover;border-radius:18px;display:block}',
      '.qom-mosaik.qom-hero img:first-child{grid-column:span 2;grid-row:span 2}',
      // Ohne grosses erstes Bild: Kacheln nach Seitenverhaeltnis statt fester
      // Zeilenhoehe. Sonst werden bei wenigen Bildern flache Streifen daraus
      // (zwei Bilder auf 1152 px Breite waren nur 170 px hoch).
      '.qom-mosaik:not(.qom-hero){grid-auto-rows:auto}',
      '.qom-mosaik:not(.qom-hero) img{height:auto;aspect-ratio:4/3}',
      '.qom-mosaik .qom-nur-handy{display:none}',
      '.qom-mosaik-kopf{text-align:center;margin-bottom:34px}',
      '.qom-mosaik-kopf p{margin:14px auto 0;max-width:62ch}',
      // Kacheln mit Beschreibungstext: Text unter dem Bild statt darauf
      '.qom-kachel{position:relative;display:block;border-radius:20px;overflow:hidden;',
      '  background:#f4f4f2;border:1px solid rgba(0,0,0,.06);color:inherit;',
      '  box-shadow:0 6px 18px rgba(0,0,0,.08);transition:transform .35s ease,box-shadow .35s ease}',
      '.qom-kachel:hover{transform:translateY(-5px);box-shadow:0 18px 44px rgba(0,0,0,.17)}',
      '.qom-kachel img{width:100%;aspect-ratio:16/10;object-fit:cover;display:block;transition:transform .4s ease}',
      '.qom-kachel:hover img{transform:scale(1.04)}',
      '.qom-kachel-text{padding:20px 22px 24px}',
      '.qom-kachel-text b{display:block;font-family:var(--font-head,inherit);font-weight:600;font-size:1.25rem;margin-bottom:6px}',
      '.qom-kachel-text span{display:block;color:var(--muted,#6f6f6f);font-size:.98rem;line-height:1.55}',
      '@media(max-width:720px){',
      '  .qom-mosaik{grid-template-columns:1fr 1fr !important;grid-auto-rows:125px;gap:10px}',
      '  .qom-mosaik.qom-eins{grid-template-columns:1fr !important;grid-auto-rows:210px}',
      '  .qom-mosaik.qom-hero img:first-child{grid-column:span 2;grid-row:span 2}',
      '  .qom-mosaik .qom-nur-handy{display:block}',
      '  .qom-kachel img{aspect-ratio:16/9}',
      '  .qom-kachel-text{padding:16px 18px 20px}',
      '}',
    ].join('');
    document.head.appendChild(stil);
  }

  function abstandStilSicherstellen() {
    if (document.getElementById('qom-abstand-stil')) return;
    var stil = document.createElement('style');
    stil.id = 'qom-abstand-stil';
    var regeln = '';
    Object.keys(ABSTAND).forEach(function (name) {
      // Zwei Klassen tief, damit die Regel sicher vor .section-tight gewinnt.
      regeln += '[data-qom-bloecke] > .qom-abstand-' + name
        + '{padding-top:' + ABSTAND[name] + ';padding-bottom:' + ABSTAND[name] + '}';
    });
    stil.textContent = regeln;
    document.head.appendChild(stil);
  }

  // Auf Leistungsseiten stehen ein bis zwei Bilder ueber dem Text. Am Handy
  // sind sie ausgeblendet (style.css), weil sie den Text nach unten druecken.
  // Damit sie trotzdem zu sehen sind, haengen wir sie dort unten ans Mosaik.
  // Auf dem Desktop bleiben diese Kopien unsichtbar - dort stehen die Bilder
  // ja bereits neben dem Text.
  function seitenBilderAnsMosaik(container) {
    var mosaik = container.querySelector('.qom-mosaik');
    if (!mosaik || mosaik.getAttribute('data-qom-ergaenzt')) return;
    var detail = document.querySelector('.detail');
    if (!detail) return;

    var quelle = detail.firstElementChild;
    if (!quelle) return;
    var bilder = [];
    if (quelle.classList && quelle.classList.contains('detail-imgs')) {
      bilder = Array.prototype.slice.call(quelle.querySelectorAll('img'));
    } else if (quelle.tagName === 'IMG') {
      bilder = [quelle];
    }

    var angehaengt = 0;
    bilder.forEach(function (b) {
      // Leere Felder und im Portal ausgeblendete Bilder nicht mitnehmen.
      if (!b.getAttribute('src') || b.getAttribute('data-qom-aus')) return;
      var kopie = document.createElement('img');
      kopie.src = b.src;
      kopie.alt = b.alt || '';
      kopie.loading = 'lazy';
      kopie.className = 'qom-nur-handy';
      mosaik.appendChild(kopie);
      angehaengt++;
    });
    if (angehaengt) {
      mosaik.setAttribute('data-qom-ergaenzt', '1');
      // Erst dieses Merkmal erlaubt der Gestaltung, die Bilder oben am Handy
      // auszublenden. Gibt es kein Mosaik (oder laeuft dieses Skript nicht),
      // bleiben sie stehen - lieber doppelt als verschwunden.
      document.documentElement.classList.add('qom-bilder-verschoben');
    }
  }

  function bloeckeRendern(sammlungen) {
    if (!sammlungen) return;
    document.querySelectorAll('[data-qom-bloecke]').forEach(function (container) {
      var key = container.getAttribute('data-qom-bloecke');
      var sammlung = sammlungen[key];
      // Sammlung gibt es gar nicht -> fester Inhalt bleibt als Fallback stehen.
      if (!sammlung) return;
      // Sammlung ist leer (alle Bloecke geloescht) -> Bereich wirklich leeren,
      // sonst kaeme der urspruengliche feste Inhalt wieder zum Vorschein.
      if (!sammlung.eintraege || !sammlung.eintraege.length) { container.innerHTML = ''; return; }
      // Pro Block rendern und merken, welcher Block-Index zu welchem
      // gerenderten Element gehört (leere Blöcke erzeugen kein Element).
      var htmlTeile = [];
      var indexListe = [];
      var abstaende = [];
      sammlung.eintraege.forEach(function (block, index) {
        var vorlage = VORLAGEN[block.__typ];
        block.__sammlung = key;
        var html = vorlage ? vorlage(block) : '';
        if (html) {
          htmlTeile.push(html);
          indexListe.push(index);
          abstaende.push(ABSTAND[block.abstand] ? block.abstand : 'normal');
        }
      });
      container.innerHTML = htmlTeile.join('');
      if (htmlTeile.length) {
        abstandStilSicherstellen();
        Array.prototype.forEach.call(container.children, function (el, i) {
          el.classList.add('qom-abstand-' + (abstaende[i] || 'normal'));
        });
        seitenBilderAnsMosaik(container);
        container.querySelectorAll('.slider').forEach(sliderStarten);
        vorschauKlickbarMachen(container, key, indexListe);
      }
    });
  }

  // Im Vorschau-Modus (Editor-iframe): Blöcke sind anklickbar und öffnen
  // ihre Einstellungen im Editor („✎ Bearbeiten" wie im Prototyp).
  function vorschauKlickbarMachen(container, key, indexListe) {
    if (!vorschauModus) return;
    vorschauStilSicherstellen();
    Array.prototype.forEach.call(container.children, function (element, i) {
      var blockIndex = indexListe[i];
      if (blockIndex == null) return;
      element.setAttribute('data-qom-block-index', blockIndex);
      element.classList.add('qom-block-klickbar');
      var tag = document.createElement('span');
      tag.className = 'qom-block-tag';
      tag.textContent = '✎ Bearbeiten';
      element.appendChild(tag);
      element.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        parent.postMessage({ typ: 'qom-block-klick', sammlung: key, index: blockIndex }, '*');
      });
    });
  }

  function vorschauStilSicherstellen() {
    if (document.getElementById('qom-vorschau-stil')) return;
    var stil = document.createElement('style');
    stil.id = 'qom-vorschau-stil';
    stil.textContent = '.qom-block-klickbar{position:relative;cursor:pointer}'
      + '.qom-block-klickbar:hover{box-shadow:inset 0 0 0 2px #1ba0e8}'
      + '.qom-block-tag{position:absolute;top:8px;right:10px;font:700 11px/1 -apple-system,sans-serif;'
      + 'letter-spacing:.04em;text-transform:uppercase;color:#fff;background:#1ba0e8;'
      + 'padding:4px 8px;border-radius:6px;opacity:0;transition:opacity .12s;pointer-events:none;z-index:5}'
      + '.qom-block-klickbar:hover .qom-block-tag{opacity:1}'
      + '.qom-block-markiert{box-shadow:inset 0 0 0 3px #1ba0e8 !important;transition:box-shadow .2s}';
    document.head.appendChild(stil);
  }

  // Im Vorschau-Modus: auch die festen Abschnitte (Hero, Detailtexte …) sind
  // anklickbar und führen im Editor zur passenden Seiten-Karte.
  var SEITEN_KEYS = {
    'index.html': 'seite_start', '': 'seite_start',
    'ueber-mich.html': 'seite_ueber_mich',
    'dienstleistungen.html': 'seite_dienstleistungen',
    'referenzen.html': 'seite_referenzen',
    'baggerarbeiten.html': 'seite_baggerarbeiten',
    'gartenarbeiten.html': 'seite_gartenarbeiten',
    'tiefbauarbeiten.html': 'seite_tiefbauarbeiten',
    'kranarbeiten.html': 'seite_kranarbeiten',
    'kontakt.html': 'seite_kontakt',
  };

  function festeAbschnitteKlickbarMachen() {
    if (!vorschauModus) return;
    var datei = location.pathname.split('/').pop();
    var seitenKey = SEITEN_KEYS[datei];
    if (!seitenKey) return;
    vorschauStilSicherstellen();
    document.querySelectorAll('section').forEach(function (abschnitt) {
      if (abschnitt.closest('[data-qom-bloecke]')) return; // Blöcke haben eigene Klicks
      abschnitt.classList.add('qom-block-klickbar');
      var tag = document.createElement('span');
      tag.className = 'qom-block-tag';
      tag.textContent = '✎ Bearbeiten';
      abschnitt.appendChild(tag);
      abschnitt.addEventListener('click', function (e) {
        if (e.target.closest('a, button, input, textarea, label')) return; // Navigation/Formular nicht kapern
        e.preventDefault();
        // So präzise wie möglich: erst das angeklickte Element selbst, dann
        // das nächstgelegene bearbeitbare Feld im Abschnitt, sonst die Seite.
        var getroffen = e.target.closest('[data-qom]');
        var marker = getroffen || abschnitt.querySelector('[data-qom]');
        parent.postMessage({
          typ: 'qom-feld-klick',
          feld: marker ? marker.getAttribute('data-qom') : '',
          sammlung: seitenKey,
        }, '*');
      });
    });
  }

  // Der Editor meldet, welcher Block gerade bearbeitet wird → hinscrollen
  // und kurz markieren, damit sofort klar ist, um welchen es geht.
  var markierTimer = null;
  function blockZeigen(sammlungKey, index) {
    var container = document.querySelector('[data-qom-bloecke="' + sammlungKey + '"]');
    if (!container) return;
    var element = container.querySelector('[data-qom-block-index="' + index + '"]');
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.querySelectorAll('.qom-block-markiert').forEach(function (m) { m.classList.remove('qom-block-markiert'); });
    element.classList.add('qom-block-markiert');
    clearTimeout(markierTimer);
    markierTimer = setTimeout(function () { element.classList.remove('qom-block-markiert'); }, 1800);
  }

  // Slider-Verhalten für dynamisch gerenderte Blöcke (site.js läuft nur beim
  // Seitenstart): Endlos-Schleife, sanftes Auto-Laufen, ziehbar mit der Maus.
  function sliderStarten(slider) {
    var track = slider.querySelector('.slide-track');
    if (!track || slider.dataset.qomSlider) return;
    slider.dataset.qomSlider = '1';
    track.innerHTML += track.innerHTML;
    var halb = 0;

    // Bei wenigen Bildern ist der Inhalt gleich breit wie das Fenster – dann
    // gibt es nichts zu scrollen und der Slider steht still. Deshalb so lange
    // weiter verdoppeln, bis der Inhalt klar breiter ist. Verdoppeln erhaelt
    // die zwei identischen Haelften, auf denen der Endlos-Sprung beruht.
    function messen() {
      var runden = 0;
      // Obergrenze bei der Anzahl: Sind die Bilder beim Messen noch nicht
      // geladen, ist scrollWidth zu klein und die Schleife wuerde unnoetig oft
      // verdoppeln (aus 14 Bildern wurden so 112 Elemente).
      while (slider.clientWidth > 0 && track.scrollWidth > 0
             && track.scrollWidth < slider.clientWidth * 2
             && track.children.length < 16 && runden < 3) {
        track.innerHTML += track.innerHTML;
        runden++;
      }
      halb = track.scrollWidth / 2;
    }
    window.addEventListener('load', messen);
    window.addEventListener('resize', messen);
    setTimeout(messen, 500);
    setTimeout(messen, 1500);

    var jetzt = function () { return Date.now(); };
    var ziehen = false, startX = 0, startLinks = 0, letzte = 0;
    // Eigene (automatische) Scroll-Schritte dürfen die „Nutzer fasst an →
    // pausieren"-Logik nicht auslösen, sonst pausiert sich der Slider selbst.
    var eigenesScrollBis = 0;
    function schleife() {
      if (!ziehen && (jetzt() - letzte > 700)) {
        eigenesScrollBis = jetzt() + 120;
        slider.scrollLeft += 0.85;
      }
      if (halb) {
        if (slider.scrollLeft >= halb) { eigenesScrollBis = jetzt() + 120; slider.scrollLeft -= halb; }
        else if (slider.scrollLeft <= 0 && letzte > 0) { eigenesScrollBis = jetzt() + 120; slider.scrollLeft += halb; }
      }
      requestAnimationFrame(schleife);
    }
    requestAnimationFrame(schleife);

    slider.addEventListener('pointerdown', function (e) {
      letzte = jetzt();
      if (e.pointerType === 'mouse') {
        ziehen = true; startX = e.clientX; startLinks = slider.scrollLeft;
        slider.classList.add('greift');
        try { slider.setPointerCapture(e.pointerId); } catch (x) {}
        e.preventDefault();
      }
    });
    slider.addEventListener('pointermove', function (e) {
      if (ziehen) slider.scrollLeft = startLinks - (e.clientX - startX);
    });
    function los() { if (ziehen) { ziehen = false; slider.classList.remove('greift'); } letzte = jetzt(); }
    slider.addEventListener('pointerup', los);
    slider.addEventListener('pointercancel', los);
    slider.addEventListener('mouseleave', function () { if (ziehen) los(); });
    ['touchstart', 'wheel', 'scroll'].forEach(function (t) {
      slider.addEventListener(t, function () {
        if (t === 'scroll' && jetzt() < eigenesScrollBis) return; // eigener Schritt, kein Nutzer
        letzte = jetzt();
      }, { passive: true });
    });
  }

  // ---- Inhalte laden --------------------------------------------------------

  var m = location.search.match(/[?&]preview=([^&]+)/);
  var previewToken = m ? decodeURIComponent(m[1]) : '';
  var vorschauModus = Boolean(previewToken);
  var url = previewToken
    ? PORTAL + '/api/v1/projects/' + SLUG + '/content?version=draft&token=' + encodeURIComponent(previewToken)
    : PORTAL + '/api/v1/projects/' + SLUG + '/content?token=' + encodeURIComponent(PUB_TOKEN);

  // Favicon aus dem Portal (im GF-Bereich hinterlegt) anwenden
  function faviconAnwenden(projekt) {
    var favUrl = projekt && projekt.favicon_url;
    if (!favUrl) return;
    if (favUrl.charAt(0) === '/') favUrl = PORTAL + favUrl;
    var link = document.querySelector('link[rel~="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = favUrl;
  }

  if (PUB_TOKEN.slice(0, 2) !== '__') {
    fetch(url).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        anwenden(d.felder);
        verstecktAnwenden(d.versteckt);
        bloeckeRendern(d.sammlungen);
        faviconAnwenden(d.projekt);
      }).catch(function () {});
  }

  kontaktFormularVerdrahten();
  festeAbschnitteKlickbarMachen();

  // Dem Editor melden, welche Seite gerade in der Vorschau offen ist –
  // so lädt er nach Änderungen genau DIESE Seite neu (nicht die Startseite).
  if (vorschauModus) {
    parent.postMessage({ typ: 'qom-seite-geladen', url: location.href }, '*');
  }

  // Im Vorschau-Modus den Vorschau-Token beim Navigieren mitnehmen, damit
  // ALLE Seiten im Editor bearbeitbar bleiben (nicht nur die Startseite).
  // Delegiert, damit auch Links aus gerenderten Blöcken abgedeckt sind.
  if (vorschauModus) {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|#)/i.test(href)) return; // extern/Anker unangetastet
      if (href.indexOf('preview=') !== -1) return;
      e.preventDefault();
      location.href = href + (href.indexOf('?') >= 0 ? '&' : '?')
        + 'preview=' + encodeURIComponent(previewToken);
    }, true);
  }

  // Nachrichten vom Editor: Live-Tippen (qom-vorschau) und
  // „diesen Block zeigen" (qom-block-zeigen).
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d) return;
    if (d.typ === 'qom-vorschau' && d.feld) {
      var o = {}; o[d.feld] = d.wert; anwenden(o);
    } else if (d.typ === 'qom-vorschau-sichtbar' && d.feld) {
      // Der Editor hat ein Feld aus- oder eingeblendet -> sofort zeigen.
      document.querySelectorAll('[data-qom="' + String(d.feld).replace(/"/g, '') + '"]')
        .forEach(function (el) { elementZeigen(el, !!d.sichtbar, 'versteckt'); });
    } else if (d.typ === 'qom-block-zeigen') {
      blockZeigen(String(d.sammlung || ''), Number(d.index) || 0);
    }
  });
})();
