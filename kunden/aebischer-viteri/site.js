/* Aebischer & Viteri – Seitenlogik ohne Abhängigkeiten:
   Handy-Menü, Kopfzeile bei Scroll, sanftes Einblenden, Laufband der
   Werkstatt-Bilder und das Mehrschritt-Anfrageformular. Das Senden selbst
   übernimmt portal.js (window.qomKontaktSenden). */
(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.add('js');
  var reduziert = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Jahr im Fuss ---------------------------------------------------------
  var jahr = document.getElementById('jahr');
  if (jahr) jahr.textContent = String(new Date().getFullYear());

  // ---- Handy-Menü -----------------------------------------------------------
  var knopf = document.querySelector('.menue-knopf');
  var menue = document.getElementById('menue');
  function menueSetzen(offen) {
    if (!knopf || !menue) return;
    knopf.setAttribute('aria-expanded', String(offen));
    knopf.setAttribute('aria-label', offen ? 'Menü schliessen' : 'Menü öffnen');
    menue.hidden = !offen;
    document.body.classList.toggle('menue-offen', offen);
    // Hinter dem Menü liegende Inhalte für Tastatur und Screenreader sperren
    document.querySelectorAll('main, footer').forEach(function (el) { el.inert = offen; });
    if (offen) { var erster = menue.querySelector('a'); if (erster) erster.focus(); }
  }
  if (knopf && menue) {
    knopf.addEventListener('click', function () { menueSetzen(menue.hidden); });
    menue.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menueSetzen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menue.hidden) { menueSetzen(false); knopf.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && !menue.hidden) menueSetzen(false);
    });
  }

  // ---- Kopfzeile: feiner Schatten sobald gescrollt --------------------------
  var kopfzeile = document.getElementById('kopfzeile');
  function kopfPruefen() {
    if (kopfzeile) kopfzeile.classList.toggle('gescrollt', window.scrollY > 8);
  }
  kopfPruefen();
  window.addEventListener('scroll', kopfPruefen, { passive: true });
  // Sanftes Scrollen erst nach dem Laden – ein Aufruf mit #anker springt sofort hin
  if (!reduziert) window.addEventListener('load', function () { html.style.scrollBehavior = 'smooth'; });

  // ---- Sanftes Einblenden beim Scrollen -------------------------------------
  var REVEAL = '.abschnitt-kopf, .leistung, .usp, .bento-kachel, .material, .referenz, ' +
    '.schritt, .team-karte, .karte, .detail, .auftrag, .faq, .team-teaser > *, ' +
    '.geschichte > *, .werkstatt > *, .material-fotos figure, .material-karte, .mosaik .projekt, ' +
    '.hero-text, .hero-bild, .seitenkopf .wrap > *, .anfrage-links, .anfrage-rechts, .rechtsblock';
  if (!reduziert && 'IntersectionObserver' in window) {
    var elemente = document.querySelectorAll(REVEAL);
    var zaehler = {};
    elemente.forEach(function (el) {
      el.classList.add('reveal');
      // Geschwister nacheinander (gestaffelt), damit Raster lebendig wirken
      var eltern = el.parentElement;
      var id = eltern ? (eltern.dataset.revealId || (eltern.dataset.revealId = String(Math.random()))) : 'x';
      zaehler[id] = (zaehler[id] || 0) + 1;
      el.style.transitionDelay = Math.min(zaehler[id] - 1, 6) * 70 + 'ms';
    });
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); beobachter.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    elemente.forEach(function (el) { beobachter.observe(el); });
    // Sicherheitsnetz: Ist nach 2,5 s etwas noch nicht sichtbar (z. B. verstecktes
    // Fenster), trotzdem zeigen – niemand soll vor leeren Flächen sitzen.
    setTimeout(function () {
      elemente.forEach(function (el) { el.classList.add('in'); });
    }, 2500);
  }

  // ---- Laufband: Bilder einmal verdoppeln, damit die Schleife nahtlos ist ----
  document.querySelectorAll('[data-laufband]').forEach(function (band) {
    var spur = band.querySelector('.laufband-spur');
    if (!spur || spur.dataset.verdoppelt) return;
    if (reduziert) { band.classList.add('statisch'); return; }
    // Per HTML verdoppeln (cloneNode würde alle Lazy-Bilder sofort laden)
    var anzahl = spur.children.length;
    spur.insertAdjacentHTML('beforeend', spur.innerHTML);
    Array.prototype.slice.call(spur.children, anzahl).forEach(function (kopie) {
      kopie.setAttribute('aria-hidden', 'true');
    });
    spur.dataset.verdoppelt = '1';
    var pause = band.querySelector('.laufband-pause');
    if (pause) {
      pause.addEventListener('click', function () {
        var an = band.classList.toggle('pausiert');
        pause.setAttribute('aria-pressed', String(an));
        pause.textContent = an ? 'Weiterlaufen' : 'Anhalten';
      });
    }
    // Dauer nach Breite: ~ 45 px pro Sekunde
    function tempo() {
      var breite = spur.scrollWidth / 2;
      if (breite > 0) spur.style.animationDuration = Math.max(30, Math.round(breite / 45)) + 's';
    }
    tempo();
    window.addEventListener('load', tempo);
    window.addEventListener('resize', tempo);
  });

  // ---- Mehrschritt-Anfrageformular -----------------------------------------
  var form = document.getElementById('anfrageFormular');
  if (!form) return;

  var stufen = Array.prototype.slice.call(form.querySelectorAll('.stufe'));
  var balken = form.querySelector('.fortschritt-balken');
  // Standard-Fehlertexte merken, damit eine Server-Meldung sie nicht dauerhaft ersetzt
  stufen.forEach(function (s) { var f = s.querySelector('.fehler'); if (f) f.dataset.standard = f.textContent; });
  // Automatisch weiter nur nach Zeigereingabe (Maus/Touch) – Tastaturnutzer
  // sollen die Optionen mit den Pfeiltasten durchgehen können.
  var perZeiger = false;
  form.addEventListener('pointerdown', function () { perZeiger = true; });
  form.addEventListener('keydown', function () { perZeiger = false; }, true);
  // Fokus-Ring auf Optionen auch ohne :has()-Unterstützung
  form.addEventListener('focusin', function (e) {
    var o = e.target.closest('.option');
    if (o) { try { if (e.target.matches(':focus-visible')) o.classList.add('fokus'); } catch (x) { o.classList.add('fokus'); } }
  });
  form.addEventListener('focusout', function (e) {
    var o = e.target.closest('.option');
    if (o) o.classList.remove('fokus');
  });
  var SCHRITTE = 5;
  var aktuell = 1;

  function feld(name) { return form.elements[name]; }
  function gewaehlt(name) {
    return Array.prototype.map.call(
      form.querySelectorAll('input[name="' + name + '"]:checked'),
      function (i) { return i.value; }
    );
  }
  function optionenMarkieren(stufe) {
    stufe.querySelectorAll('.option').forEach(function (o) {
      var inp = o.querySelector('input');
      o.classList.toggle('gewaehlt', !!(inp && inp.checked));
    });
  }

  function zeigen(n) {
    stufen.forEach(function (s) { s.hidden = Number(s.dataset.stufe) !== n; });
    aktuell = n;
    if (balken) balken.style.width = (Math.min(n, SCHRITTE) / SCHRITTE * 100) + '%';
    var titel = form.querySelector('.stufe:not([hidden]) h2');
    if (titel) {
      titel.setAttribute('tabindex', '-1');
      try { titel.focus({ preventScroll: true }); } catch (e) { titel.focus(); }
    }
    // Am Handy: Formular oben im Bild halten
    var oben = form.getBoundingClientRect().top;
    if (oben < 0 || oben > window.innerHeight * 0.5) {
      form.scrollIntoView({ behavior: reduziert ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function pruefen(n) {
    var s = stufen[n - 1];
    var fehler = s.querySelector('.fehler');
    var ok = true;
    if (n === 1) ok = gewaehlt('anliegen').length > 0;
    if (n === 2) ok = gewaehlt('produkt').length > 0;
    var meldung = '';
    if (n === 5) {
      var name = feld('name').value.trim();
      var email = feld('email').value.trim();
      var einv = feld('einverstanden').checked;
      var emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email);
      ok = Boolean(name) && emailOk && einv;
      [['name', Boolean(name)], ['email', emailOk], ['einverstanden', einv]].forEach(function (p) {
        feld(p[0]).setAttribute('aria-invalid', p[1] ? 'false' : 'true');
      });
      if (!ok) {
        meldung = !name ? 'Bitte Ihren Namen angeben.'
          : !emailOk ? 'Bitte eine gültige E-Mail-Adresse angeben.'
          : 'Bitte das Einverständnis zum Datenschutz bestätigen.';
        (!name ? feld('name') : !emailOk ? feld('email') : feld('einverstanden')).focus();
      }
    }
    if (fehler) {
      if (!ok) fehler.textContent = meldung || fehler.dataset.standard || fehler.textContent;
      fehler.hidden = ok;
    }
    return ok;
  }

  form.addEventListener('click', function (e) {
    var weiter = e.target.closest('.weiter');
    var zurueck = e.target.closest('.zurueck');
    if (weiter && pruefen(aktuell)) zeigen(aktuell + 1);
    if (zurueck && aktuell > 1) zeigen(aktuell - 1);
  });

  form.addEventListener('change', function (e) {
    var inp = e.target;
    var s = inp.closest('.stufe');
    if (!s) return;
    var n = Number(s.dataset.stufe);
    var fehler = s.querySelector('.fehler');
    if (fehler) fehler.hidden = true;

    // Material: «weiss ich noch nicht» schliesst die anderen aus
    if (n === 3 && inp.type === 'checkbox') {
      var offen = s.querySelector('input[value="Weiss ich noch nicht"]');
      if (inp === offen && inp.checked) {
        s.querySelectorAll('input[type="checkbox"]').forEach(function (c) { if (c !== offen) c.checked = false; });
      } else if (inp.checked && offen) {
        offen.checked = false;
      }
    }
    optionenMarkieren(s);

    // Einfachauswahl in Schritt 1 und 2: automatisch weiter (kurz sichtbar lassen)
    if ((n === 1 || n === 2) && inp.type === 'radio' && inp.checked && perZeiger) {
      setTimeout(function () { if (aktuell === n) zeigen(n + 1); }, 320);
    }
  });

  // Enter in Textfeldern soll nicht vorzeitig abschicken (ausser im letzten Schritt)
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || aktuell >= SCHRITTE) return;
    var tag = e.target.tagName;
    if (tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return; // Knöpfe und Links behalten ihr Verhalten
    e.preventDefault();
    if (pruefen(aktuell)) zeigen(aktuell + 1);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (aktuell !== SCHRITTE) { zeigen(SCHRITTE); return; }
    if (!pruefen(SCHRITTE)) return;

    var d = {
      anliegen: gewaehlt('anliegen')[0] || 'keine Angabe',
      produkt: gewaehlt('produkt')[0] || 'keine Angabe',
      material: gewaehlt('material').join(', ') || 'keine Angabe',
      menge: gewaehlt('menge')[0] || 'keine Angabe',
      termin: gewaehlt('termin')[0] || 'keine Angabe',
      name: feld('name').value.trim(),
      firma: feld('firma').value.trim(),
      email: feld('email').value.trim(),
      telefon: feld('telefon').value.trim(),
      nachricht: feld('nachricht').value.trim(),
      website: feld('bemerkung_intern').value
    };
    var zusammenfassung = 'Anliegen: ' + d.anliegen
      + '\nProdukt: ' + d.produkt
      + '\nMaterial: ' + d.material
      + '\nStückzahl: ' + d.menge
      + '\nTermin: ' + d.termin;
    var text = zusammenfassung
      + '\nFirma: ' + (d.firma || '–')
      + '\nTelefon: ' + (d.telefon || '–')
      + '\n\nNachricht:\n' + (d.nachricht || '(keine weitere Beschreibung)')
      + '\n\n— gesendet über das Anfrageformular der Website';

    var senden = form.querySelector('.senden');
    var fehler = stufen[SCHRITTE - 1].querySelector('.fehler');
    var sendenHtml = senden.innerHTML;
    senden.disabled = true;
    senden.setAttribute('aria-busy', 'true');
    senden.textContent = 'Wird gesendet …';

    var uebermitteln = window.qomKontaktSenden || function () {
      return Promise.reject(new Error('Das Formular ist noch nicht angeschlossen. Bitte per E-Mail oder WhatsApp melden.'));
    };
    uebermitteln({ name: d.name, email: d.email, nachricht: text, website: d.website })
      .then(function () {
        var box = document.getElementById('zusammenfassung');
        if (box) box.textContent = zusammenfassung;
        zeigen(6);
        if (balken) balken.style.width = '100%';
      })
      .catch(function (err) {
        senden.disabled = false;
        senden.removeAttribute('aria-busy');
        senden.innerHTML = sendenHtml.replace('Anfrage senden', 'Nochmals senden');
        if (fehler) {
          fehler.textContent = (err && err.message) || 'Senden gerade nicht möglich – bitte per E-Mail oder WhatsApp melden.';
          fehler.hidden = false;
        }
      });
  });
})();
