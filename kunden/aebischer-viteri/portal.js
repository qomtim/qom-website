/* Holt die im QOM-Portal bearbeiteten Inhalte und setzt sie auf der Seite ein.
   - Standard: veröffentlichte Inhalte (Lese-Token).
   - Vorschau-Modus (?preview=<preview_token>): zeigt den Entwurf.
   - Live-Vorschau: der Editor schickt Änderungen per postMessage → sofort sichtbar.
   - Block-Seiten: Container mit data-qom-bloecke="<sammlung>" werden aus den
     Portal-Blöcken aufgebaut (im Design dieser Website).
   - Anfrageformular: site.js baut die Nachricht zusammen und ruft
     window.qomKontaktSenden auf (definiert hier, kennt das Token).
   Fällt das Portal aus, bleiben die fest hinterlegten Inhalte stehen. */
(function () {
  var PORTAL = 'https://portal.quitordinarymarketing.ch';
  var SLUG = 'aebischer-viteri';
  var PUB_TOKEN = '-Woi0QpSgBDzxIwygmif1dr2lXCIYj8Ni8ktiWUQjzs';

  // ---- Hilfen -------------------------------------------------------------

  function esc(text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, function (z) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[z];
    });
  }

  function absatz(text) {
    return esc(text).replace(/\n/g, '<br>');
  }

  // *wort* → <em>wort</em> (kursives Serif-Wort in Überschriften), sicher escaped
  function hervorheben(text) {
    return esc(text).replace(/\*(\S(?:[^*]*?\S)?)\*/g, '<em>$1</em>');
  }

  function sichereUrl(wert) {
    var url = String(wert || '').trim();
    if (!url) return '';
    if (url.charAt(0) === '/') return PORTAL + url;
    if (/^https?:\/\//i.test(url)) return url;
    if (/^[a-z0-9_\-./#?=&%]+$/i.test(url) && url.indexOf(':') === -1) return url; // relativ
    return '';
  }

  // Farb-Felder aus dem Portal steuern CSS-Variablen der Website
  var FARB_ZIELE = { farbe_akzent: '--accent' };

  function huelleVon(el) {
    var auswahl = el.getAttribute('data-qom-huelle');
    if (auswahl) {
      try { var h = el.closest(auswahl); if (h) return h; } catch (fehler) {}
    }
    return el;
  }

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

  // Normale Bildfelder (ohne festen Platzhalter): nach «Bild entfernen» im
  // Portal soll keine leere Fläche bleiben, sondern ein «Foto folgt».
  function platzhalterSetzen(img, zeigen) {
    var next = img.nextElementSibling;
    var p = next && next.classList && next.classList.contains('qom-platzhalter') ? next : null;
    if (zeigen && !p && !(img.parentElement && img.parentElement.querySelector('.platzhalter'))) {
      p = document.createElement('div');
      p.className = 'qom-platzhalter';
      p.setAttribute('aria-hidden', 'true');
      p.innerHTML = '<span class="mono">Foto folgt</span>';
      img.insertAdjacentElement('afterend', p);
    } else if (!zeigen && p) {
      p.remove();
    }
  }

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
      if (wert && /^#[0-9a-f]{3,8}$/i.test(String(wert).trim())) {
        document.documentElement.style.setProperty(FARB_ZIELE[key], String(wert).trim());
      }
    });
    document.querySelectorAll('[data-qom]').forEach(function (el) {
      var key = el.getAttribute('data-qom');
      if (!Object.prototype.hasOwnProperty.call(felder, key)) return; // Feld nicht dabei → fester Inhalt bleibt
      var val = felder[key];
      if (val == null) return;
      val = String(val);
      var istBild = el.tagName === 'IMG' || el.hasAttribute('data-qom-bg');

      // Geleertes Feld heisst wirklich leeren: Text weg, Bild weg (Platzhalter erscheint).
      if (val === '') {
        if (el.tagName === 'IMG') { el.removeAttribute('src'); elementZeigen(el, false, 'leer'); platzhalterSetzen(el, true); }
        else if (el.hasAttribute('data-qom-bg')) el.style.backgroundImage = '';
        else {
          el.textContent = '';
          if (el.hasAttribute('data-qom-huelle')) elementZeigen(el, false, 'leer');
        }
        return;
      }

      if (istBild && val.charAt(0) === '/') val = PORTAL + val;
      if (el.tagName === 'IMG') { el.setAttribute('src', val); elementZeigen(el, true, 'leer'); platzhalterSetzen(el, false); }
      else if (el.hasAttribute('data-qom-bg')) el.style.backgroundImage = "url('" + val + "')";
      else {
        if (el.hasAttribute('data-qom-em')) el.innerHTML = hervorheben(val);
        else el.textContent = val;
        if (val.indexOf('\n') !== -1 && !el.style.whiteSpace) el.style.whiteSpace = 'pre-line';
        if (el.hasAttribute('data-qom-huelle')) elementZeigen(el, true, 'leer');
        var link = el.closest('a');
        if (link && el.hasAttribute('data-qom-mailto')) link.setAttribute('href', 'mailto:' + val.trim());
        if (link && el.hasAttribute('data-qom-tel')) link.setAttribute('href', 'tel:' + val.replace(/[^+0-9]/g, ''));
      }
    });
  }

  // ---- Anfrageformular: Versand über das Portal -----------------------------
  // site.js baut aus den Auswahlschritten eine Nachricht und ruft dies auf.
  window.qomKontaktSenden = function (daten) {
    return fetch(PORTAL + '/api/v1/projects/' + SLUG + '/kontakt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: PUB_TOKEN,
        name: daten.name || '',
        email: daten.email || '',
        nachricht: daten.nachricht || '',
        website: daten.website || ''
      })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (k) {
        if (!r.ok) throw new Error((k && k.fehler) || 'Senden fehlgeschlagen – bitte nochmals versuchen.');
        return k;
      });
    }, function () {
      // Netzwerkfehler (offline, Werbeblocker, Portal nicht erreichbar)
      throw new Error('Keine Verbindung zum Server – bitte per E-Mail oder WhatsApp melden.');
    });
  };

  // ---- Block-Vorlagen (im Design dieser Website) ---------------------------

  function wrap(innen, schmal) {
    return '<div class="wrap' + (schmal ? ' schmal' : '') + '">' + innen + '</div>';
  }

  var VORLAGEN = {
    text: function (b) {
      return '<section class="qom-block">' + wrap(
        (b.titel ? '<h2 class="display">' + hervorheben(b.titel) + '</h2>' : '')
        + (b.text ? '<p class="lead">' + absatz(b.text) + '</p>' : ''), true) + '</section>';
    },
    bild: function (b) {
      var url = sichereUrl(b.bild);
      if (!url) return '';
      return '<section class="qom-block">' + wrap(
        '<img src="' + esc(url) + '" alt="' + esc(b.unterschrift) + '" loading="lazy" class="qom-bild">'
        + (b.unterschrift ? '<p class="mono klein" style="margin-top:12px;color:var(--muted)">' + esc(b.unterschrift) + '</p>' : '')) + '</section>';
    },
    bild_text: function (b) {
      var url = sichereUrl(b.bild);
      var bildHtml = url ? '<img src="' + esc(url) + '" alt="' + esc(b.titel) + '" loading="lazy">' : '<span></span>';
      var textHtml = '<div>'
        + (b.titel ? '<h2 class="display">' + hervorheben(b.titel) + '</h2>' : '')
        + (b.text ? '<p>' + absatz(b.text) + '</p>' : '')
        + '</div>';
      var innen = b.seite === 'rechts' ? textHtml + bildHtml : bildHtml + textHtml;
      return '<section class="qom-block">' + wrap('<div class="qom-split">' + innen + '</div>') + '</section>';
    },
    galerie: function (b) {
      var bilder = (b.bilder || []).map(function (e) { return sichereUrl(e.bild); }).filter(Boolean);
      if (!bilder.length) return '';
      var kopf = (b.titel || b.text)
        ? '<div class="abschnitt-kopf">' + (b.titel ? '<h2 class="display">' + hervorheben(b.titel) + '</h2>' : '')
          + (b.text ? '<p class="lead">' + absatz(b.text) + '</p>' : '') + '</div>'
        : '';
      if (b.darstellung === 'slider') {
        return '<section class="qom-block">' + (kopf ? wrap(kopf) : '')
          + '<div class="laufband" data-laufband><div class="laufband-spur">'
          + bilder.map(function (url) { return '<figure class="projekt"><img src="' + esc(url) + '" alt="" loading="lazy"></figure>'; }).join('')
          + '</div></div></section>';
      }
      var n = bilder.length;
      var hero = n >= 5 && (n + 3) % 3 === 0;
      var spalten = n <= 3 ? n : 3;
      return '<section class="qom-block">' + wrap(kopf
        + '<div class="qom-mosaik' + (hero ? ' qom-hero' : '') + '" style="--qom-spalten:' + spalten + '">'
        + bilder.map(function (url) { return '<img src="' + esc(url) + '" alt="" loading="lazy">'; }).join('')
        + '</div>') + '</section>';
    },
    collage: function (b) {
      var bilder = (b.bilder || []).map(function (e) { return sichereUrl(e.bild); }).filter(Boolean).slice(0, 4);
      if (!bilder.length) return '';
      var n = bilder.length;
      var spalten = n === 1 ? 1 : 2;
      var klasse = 'qom-mosaik' + (n === 3 ? ' qom-collage-3' : '');
      return '<section class="qom-block">' + wrap(
        '<div class="' + klasse + '" style="--qom-spalten:' + spalten + '">'
        + bilder.map(function (url) { return '<img src="' + esc(url) + '" alt="" loading="lazy">'; }).join('')
        + '</div>') + '</section>';
    },
    kacheln: function (b) {
      var kacheln = (b.kacheln || []).filter(function (k) { return sichereUrl(k.bild) || k.titel; });
      if (!kacheln.length) return '';
      return '<section class="qom-block">' + wrap('<div class="qom-kacheln">'
        + kacheln.map(function (k) {
            var ziel = sichereUrl(k.link);
            if (!ziel || /^kontakt\.html/i.test(ziel)) ziel = 'anfrage.html';
            var bild = sichereUrl(k.bild);
            return '<a class="qom-kachel" href="' + esc(ziel || '#') + '">'
              + (bild ? '<img src="' + esc(bild) + '" alt="' + esc(k.titel) + '" loading="lazy">' : '')
              + '<div class="qom-kachel-text"><b>' + esc(k.titel) + '</b>'
              + (k.text ? '<span>' + absatz(k.text) + '</span>' : '')
              + '</div></a>';
          }).join('')
        + '</div>') + '</section>';
    },
    stimme: function (b) {
      if (!b.zitat) return '';
      return '<section class="qom-block">' + wrap(
        '<figure class="qom-stimme"><blockquote>&#8222;' + absatz(b.zitat) + '&#8220;</blockquote>'
        + (b.name ? '<figcaption>&#8212; ' + esc(b.name) + '</figcaption>' : '') + '</figure>', true) + '</section>';
    },
    stimmen: function (b) {
      var liste = (b.stimmen || []).filter(function (s) { return s.zitat || s.name; });
      if (!liste.length) return '';
      return '<section class="qom-block">' + wrap(
        (b.titel ? '<div class="abschnitt-kopf"><h2 class="display">' + hervorheben(b.titel) + '</h2></div>' : '')
        + '<div class="qom-stimmen">'
        + liste.map(function (s) {
            var anzahl = Math.max(0, Math.min(5, parseInt(s.sterne, 10) || 0));
            var sterne = anzahl ? '<div class="qom-sterne">' + new Array(anzahl + 1).join('&#9733;') + '</div>' : '';
            var wer = [esc(s.name), esc(s.ort)].filter(Boolean).join(' &#183; ');
            return '<figure class="qom-stimme">' + sterne
              + '<blockquote>&#8222;' + absatz(s.zitat) + '&#8220;</blockquote>'
              + (wer ? '<figcaption>' + wer + '</figcaption>' : '') + '</figure>';
          }).join('')
        + '</div>') + '</section>';
    },
    kennzahlen: function (b) {
      var zahlen = (b.zahlen || []).filter(function (z) { return z.zahl || z.label; });
      if (!zahlen.length) return '';
      return '<section class="qom-block">' + wrap('<div class="qom-zahlen">'
        + zahlen.map(function (z) {
            return '<div><div class="qom-zahl">' + esc(z.zahl) + '</div>'
              + '<div class="mono klein" style="color:var(--muted);margin-top:4px">' + esc(z.label) + '</div></div>';
          }).join('')
        + '</div>') + '</section>';
    },
    faq: function (b) {
      var fragen = (b.fragen || []).filter(function (f) { return f.frage; });
      if (!fragen.length) return '';
      return '<section class="qom-block">' + wrap('<div class="faq">'
        + fragen.map(function (f) {
            return '<details class="faq-eintrag"><summary><span>' + esc(f.frage) + '</span>'
              + '<span class="faq-plus" aria-hidden="true"></span></summary>'
              + '<p>' + absatz(f.antwort) + '</p></details>';
          }).join('')
        + '</div>', true) + '</section>';
    },
    cta: function (b) {
      if (!b.titel) return '';
      var ziel = sichereUrl(b.link);
      if (!ziel || /^kontakt\.html/i.test(ziel)) ziel = 'anfrage.html';
      return '<section class="qom-block">' + wrap('<div class="qom-cta">'
        + '<h2 class="display">' + hervorheben(b.titel) + '</h2>'
        + (b.button ? '<a href="' + esc(ziel) + '" class="btn btn-akzent">' + esc(b.button) + '</a>' : '')
        + '</div>') + '</section>';
    },
  };

  var ABSTAND = { eng: 'qom-abstand-eng', normal: '', weit: 'qom-abstand-weit' };

  function bloeckeRendern(sammlungen) {
    if (!sammlungen) return;
    document.querySelectorAll('[data-qom-bloecke]').forEach(function (container) {
      var key = container.getAttribute('data-qom-bloecke');
      var sammlung = sammlungen[key];
      if (!sammlung) return;
      if (!sammlung.eintraege || !sammlung.eintraege.length) { container.innerHTML = ''; return; }
      var htmlTeile = [];
      var indexListe = [];
      var abstaende = [];
      sammlung.eintraege.forEach(function (block, index) {
        var vorlage = VORLAGEN[block.__typ];
        var html = vorlage ? vorlage(block) : '';
        if (html) {
          htmlTeile.push(html);
          indexListe.push(index);
          abstaende.push(ABSTAND[block.abstand] || '');
        }
      });
      container.innerHTML = htmlTeile.join('');
      if (htmlTeile.length) {
        Array.prototype.forEach.call(container.children, function (el, i) {
          if (abstaende[i]) el.classList.add(abstaende[i]);
        });
        container.querySelectorAll('[data-laufband]').forEach(laufbandStarten);
        vorschauKlickbarMachen(container, key, indexListe);
      }
    });
  }

  // Laufband für Galerie-Blöcke (site.js läuft nur beim Seitenstart)
  function laufbandStarten(band) {
    var spur = band.querySelector('.laufband-spur');
    if (!spur || spur.dataset.verdoppelt) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { band.classList.add('statisch'); return; }
    Array.prototype.slice.call(spur.children).forEach(function (k) {
      var kopie = k.cloneNode(true);
      kopie.setAttribute('aria-hidden', 'true');
      spur.appendChild(kopie);
    });
    spur.dataset.verdoppelt = '1';
    function tempo() {
      var breite = spur.scrollWidth / 2;
      if (breite > 0) spur.style.animationDuration = Math.max(30, Math.round(breite / 45)) + 's';
    }
    tempo();
    window.addEventListener('load', tempo);
    window.addEventListener('resize', tempo);
  }

  // ---- Vorschau-Modus (Editor-iframe) --------------------------------------

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

  var SEITEN_KEYS = {
    'index.html': 'seite_start', '': 'seite_start',
    'angebot.html': 'seite_angebot',
    'zusammenarbeit.html': 'seite_on_demand',
    'referenzen.html': 'seite_referenzen',
    'ueber-uns.html': 'seite_ueber_uns',
    'anfrage.html': 'seite_anfrage',
    'impressum.html': 'seite_impressum',
    'datenschutz.html': 'seite_datenschutz',
    'agb.html': 'seite_agb',
  };

  function festeAbschnitteKlickbarMachen() {
    if (!vorschauModus) return;
    var datei = location.pathname.split('/').pop();
    var seitenKey = SEITEN_KEYS[datei];
    if (!seitenKey) return;
    vorschauStilSicherstellen();
    document.querySelectorAll('section').forEach(function (abschnitt) {
      if (abschnitt.closest('[data-qom-bloecke]')) return;
      abschnitt.classList.add('qom-block-klickbar');
      var tag = document.createElement('span');
      tag.className = 'qom-block-tag';
      tag.textContent = '✎ Bearbeiten';
      abschnitt.appendChild(tag);
      abschnitt.addEventListener('click', function (e) {
        if (e.target.closest('a, button, input, textarea, label, summary')) return;
        e.preventDefault();
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

  // ---- Inhalte laden --------------------------------------------------------

  var m = location.search.match(/[?&]preview=([^&]+)/);
  var previewToken = m ? decodeURIComponent(m[1]) : '';
  var vorschauModus = Boolean(previewToken);
  var url = previewToken
    ? PORTAL + '/api/v1/projects/' + SLUG + '/content?version=draft&token=' + encodeURIComponent(previewToken)
    : PORTAL + '/api/v1/projects/' + SLUG + '/content?token=' + encodeURIComponent(PUB_TOKEN);

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

  festeAbschnitteKlickbarMachen();

  if (vorschauModus) {
    parent.postMessage({ typ: 'qom-seite-geladen', url: location.href }, '*');
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|#)/i.test(href)) return;
      if (href.indexOf('preview=') !== -1) return;
      var teile = href.split('#');
      var basis = teile[0];
      var anker = teile.length > 1 ? '#' + teile.slice(1).join('#') : '';
      if (!basis) return; // reiner Anker bleibt unangetastet
      e.preventDefault();
      location.href = basis + (basis.indexOf('?') >= 0 ? '&' : '?')
        + 'preview=' + encodeURIComponent(previewToken) + anker;
    }, true);
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== PORTAL) return; // nur der Editor darf Inhalte einspielen
    var d = e.data;
    if (!d) return;
    if (d.typ === 'qom-vorschau' && d.feld) {
      var o = {}; o[d.feld] = d.wert; anwenden(o);
    } else if (d.typ === 'qom-vorschau-sichtbar' && d.feld) {
      document.querySelectorAll('[data-qom="' + String(d.feld).replace(/"/g, '') + '"]')
        .forEach(function (el) { elementZeigen(el, !!d.sichtbar, 'versteckt'); });
    } else if (d.typ === 'qom-block-zeigen') {
      blockZeigen(String(d.sammlung || ''), Number(d.index) || 0);
    }
  });
})();
