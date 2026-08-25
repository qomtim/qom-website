// =============================================================================
// QOM Website – alle Inhalte
// =============================================================================
//
// Diese Datei ist die einzige Quelle fuer Texte und Bilder der Website.
// Frueher kamen die Inhalte aus Storyblok; seit dem Umzug stehen sie hier.
//
// Aendern: Wert anpassen, speichern, hochladen – die Seite ist rund eine
// Minute spaeter live. Bilder liegen unter public/bilder/ und werden mit
// "/bilder/<name>.webp" angesprochen.
// =============================================================================

export const site = {
  "name": "QOM – Quit Ordinary Marketing",
  "shortName": "QOM",
  "claim": "Ihr persönliches Marketing-Team aus Bösingen.",
  "email": "management@quitordinarymarketing.ch",
  "phone": "+41 78 683 03 27",
  "phoneLink": "+41786830327",
  "bookingUrl": "https://tidycal.com/waebertbusiness/erstgesprach-mit-tim",
  "bookingLabel": "Erstgespräch buchen",
  "city": "Bösingen",
  "year": 2026,
  "logoUrl": "/bilder/logo.webp"
};

export const hero = {
  "label": "Marketing-Agentur aus Bösingen",
  "title1": "Digitales",
  "titleAccent": "Wachstum",
  "title2": "aus Bösingen.",
  "lead": "Webseiten, Online-Shops & Social-Media-Kampagnen. Alles unter einem Dach – von Ihrem persönlichen Marketing-Team aus der Region.",
  "image": "/bilder/hero-team.webp"
};

export const about = {
  "title": "Ihr persönliches Marketing-Team",
  "text": "Wir lassen Unternehmen online wachsen. Wir sind QOM, ein junges Team aus Bösingen. Unsere Vision ist es, regionale Unternehmen mit unserem Know-how im digitalen Marketing auf dem Weg in die digitale Zukunft zu begleiten.",
  "image": "/bilder/ueber-uns-teaser.webp"
};

export const nav = [
  {
    "label": "Home",
    "href": "/"
  },
  {
    "label": "Über uns",
    "href": "/ueber-uns"
  },
  {
    "label": "Dienstleistungen",
    "href": "/#dienstleistungen"
  },
  {
    "label": "Projekte",
    "href": "/projekte"
  }
];

export const services = [
  {
    "num": "(01)",
    "title": "Webdesign",
    "slug": "webdesign",
    "teaser": "Webseiten, die nicht nur gut aussehen – sie führen Besucher übersichtlich durch Ihr Unternehmen, damit sie zu Anfragen und Kunden werden.",
    "image": "/bilder/leistung-webdesign.webp"
  },
  {
    "num": "(02)",
    "title": "Online-Shops",
    "slug": "online-shops",
    "teaser": "Seit über 6 Jahren erstellen wir Shopify-Shops, die professionell aussehen, verkaufen und ohne technisches Vorwissen einfach zu pflegen sind.",
    "image": "/bilder/leistung-online-shops.webp"
  },
  {
    "num": "(03)",
    "title": "Social Media Kampagnen",
    "slug": "social-media-kampagnen",
    "teaser": "Viel ungenutztes Potenzial in der lokalen Wirtschaft – mit vergleichsweise tiefen Werbekosten. Tim begleitet Sie von A bis Z.",
    "image": "/bilder/leistung-social-media-kampagnen.webp"
  }
];

export const cases = [
  {
    "tag": "Webdesign",
    "title": "Casa de Padel Murten",
    "url": "https://www.cdpadel.ch",
    "linkLabel": "cdpadel.ch →",
    "text": "Für die Padel-Halle in Murten haben wir eine moderne, performante Webseite entwickelt, die den Sport dynamisch inszeniert und die Online-Buchungen für neue Spieler vereinfacht.",
    "image": "/bilder/projekt-1.webp"
  },
  {
    "tag": "Webdesign",
    "title": "Costa Abdichtungen",
    "url": "https://www.costa-abdichtungen.ch",
    "linkLabel": "costa-abdichtungen.ch →",
    "text": "Für Costa Abdichtungen haben wir eine moderne und übersichtliche Webseite entwickelt, welche die Fachkompetenz im Bereich Sanierungen widerspiegelt und die digitale Kundenanfrage spürbar vereinfacht.",
    "image": "/bilder/projekt-2.webp"
  }
];

export const team = [
  {
    "name": "Tim Waeber",
    "role": "Leitung Marketing",
    "linkedin": "https://www.linkedin.com/in/tim-waeber-80919a392/",
    "image": "/bilder/team-1.webp"
  },
  {
    "name": "Ilies Chamakh",
    "role": "Leitung Kreation",
    "linkedin": "https://www.linkedin.com/in/ilies-chamakh-20119a34a",
    "image": "/bilder/team-2.webp"
  },
  {
    "name": "Patrice Von Arx",
    "role": "Leitung Verkauf",
    "linkedin": null,
    "image": "/bilder/team-3.webp"
  },
  {
    "name": "Andrej Bauer",
    "role": "Leitung Digitale Systeme",
    "linkedin": null,
    "image": "/bilder/team-4.webp"
  }
];

export const regio = [
  {
    "title": "Mitglied im KMU Verband Bern West",
    "text": "Als Teil des KMU Verbands Bern West sind wir aktiv mit regionalen Unternehmerinnen und Unternehmern vernetzt und nahe am lokalen Wirtschaftsraum.",
    "image": "/bilder/regional-1.webp"
  },
  {
    "title": "Engagement in der Jungen Wirtschaftskammer JCI",
    "text": "Wir engagieren uns aktiv in der Jungen Wirtschaftskammer und tauschen uns regelmässig mit anderen Unternehmern aus.",
    "image": "/bilder/regional-2.webp"
  },
  {
    "title": "Shopify-Auszeichnung",
    "text": "Über sechs Jahre E-Commerce-Erfahrung – ausgezeichnet für unsere Arbeit mit Shopify.",
    "image": "/bilder/regional-3.webp"
  },
  {
    "title": "Lokal engagiert",
    "text": "Ob Vereinsleben oder regionale Anlässe – wir sind dort präsent, wo unsere Kunden zuhause sind.",
    "image": "/bilder/regional-4.webp"
  }
];

export const quotes = [
  {
    "text": "«Danke an das Team QOM für die coole und unkomplizierte Zusammenarbeit. Die neue Webseite ist richtig stark geworden und die Beratung war top. Klare Empfehlung und weiter so!»",
    "who": "Brian Alicarte · Casa de Padel Murten"
  },
  {
    "text": "«Sehr professionelle Zusammenarbeit mit Quit Ordinary Marketing. Kreative Ideen, klare Strategien und schnelle Umsetzung. Besonders beeindruckt hat mich die individuelle Betreuung und das Verständnis für unsere Marke.»",
    "who": "Frosty Gains"
  }
];

export const stats = [
  {
    "value": 6,
    "suffix": "+",
    "label": "Jahre Shopify- und E-Commerce-Erfahrung"
  },
  {
    "value": 4,
    "suffix": "",
    "label": "Köpfe – ein festes Team, keine wechselnden Ansprechpartner"
  },
  {
    "value": 100,
    "suffix": "%",
    "label": "Regional – persönlich erreichbar, in der Region zuhause"
  }
];

// ---------- Unterseiten ----------

export const ueberUns = {
  "label": "Wer sind wir?",
  "titel1": "Von der Schulbank zum",
  "titelAccent": "Start-up",
  "absatz1": "Manche Freundschaften halten ein Leben lang – unsere gründete zusätzlich ein Unternehmen. Alles begann im Klassenzimmer der Handelsmittelschule in Freiburg. Zwischen Hausaufgaben und ersten Business-Cases merkten wir schnell: Die Chemie stimmt nicht nur beim Mittagessen, sondern auch bei der Arbeit.",
  "absatz2": "Schon damals haben wir unsere ersten unternehmerischen Projekte gestartet, Konzepte entworfen und gelernt, dass vier Köpfe mehr erreichen als einer. Heute bündeln wir diese Energie, um für lokale Unternehmen Webseiten und Online-Shops zu bauen, die keine Wünsche offenlassen.",
  "bild": "/bilder/ueber-uns-gross.webp",
  "teamLabel": "Unser Team",
  "teamTitel": "Vier Köpfe. Ein Ziel."
};

export const impressum = {
  "adresse": "QOM – Quit Ordinary Marketing einfache Gesellschaft\nIndustriestrasse 23\n3178 Bösingen\nSchweiz",
  "personen": "Tim Waeber, Ilies Chamakh, Patrice Von Arx, Andrej Bauer",
  "haftung": "Der Autor übernimmt keine Gewähr für die Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen. Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, die aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen entstanden sind, werden ausgeschlossen.",
  "urheber": "Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf dieser Website gehören ausschliesslich QOM – Quit Ordinary Marketing oder den speziell genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen."
};

export const datenschutz = {
  "verantwortlich": "QOM – Quit Ordinary Marketing, Bösingen (Schweiz)\nE-Mail: management@quitordinarymarketing.ch · Telefon: +41 78 683 03 27",
  "erhebung": "Wir bearbeiten Personendaten gemäss dem Schweizer Datenschutzgesetz (revDSG). Personendaten erheben wir, wenn Sie uns kontaktieren (per E-Mail, Telefon oder Kontaktformular), einen Termin über unser Buchungstool vereinbaren oder unsere Website besuchen.",
  "terminbuchung": "Für die Online-Terminbuchung nutzen wir TidyCal. Bei einer Buchung werden die von Ihnen angegebenen Daten (Name, E-Mail-Adresse, gewählter Termin) an TidyCal übermittelt. Es gilt zusätzlich die Datenschutzerklärung von TidyCal.",
  "hosting": "Diese Website wird bei Infomaniak in der Schweiz gehostet. Beim Besuch der Website werden technisch notwendige Daten (IP-Adresse, Datum und Uhrzeit des Zugriffs, Browsertyp) in Server-Logfiles gespeichert. Diese Daten verbleiben in der Schweiz.",
  "weitergabe": "Wir geben Personendaten nur weiter, wenn dies zur Vertragserfüllung notwendig ist, wir gesetzlich dazu verpflichtet sind oder Sie eingewilligt haben.",
  "rechte": "Sie haben das Recht auf Auskunft über Ihre bei uns gespeicherten Personendaten sowie auf deren Berichtigung oder Löschung. Wenden Sie sich dazu an management@quitordinarymarketing.ch.",
  "aenderungen": "Wir können diese Datenschutzerklärung jederzeit anpassen. Es gilt die jeweils aktuelle, auf dieser Website publizierte Fassung.",
  "stand": "Stand: Juli 2026"
};

// Gemeinsame FAQ (Basis)
export const faqCommon = [
  {
    "q": "Wie lange dauert es, bis man erste Erfolge sieht?",
    "a": "Nach einer Analyse- und Setup-Phase von ca. zwei Wochen sehen Sie bereits in der ersten Live-Woche messbare Leads."
  },
  {
    "q": "Wie unterscheidet sich Ihr Ansatz von anderen Agenturen?",
    "a": "Wir sind regional verankert und persönlich erreichbar – Sie arbeiten immer mit demselben festen Team statt mit wechselnden Ansprechpartnern. Und wir messen uns an konkreten Anfragen für Ihr Geschäft, nicht an hübscher Dekoration."
  },
  {
    "q": "Was, wenn ich bereits ein internes Marketing-Team habe?",
    "a": "Umso besser – wir ersetzen niemanden, wir ergänzen. Wir übernehmen genau die Bereiche, für die intern Kapazität oder Spezialwissen fehlt, und arbeiten eng mit Ihrem Team zusammen."
  },
  {
    "q": "Wieso sollte ich auf Social-Media-Ads setzen?",
    "a": "89 % der Schweizerinnen und Schweizer über 15 Jahren nutzen soziale Medien – auch die Generation 65+. Mit vergleichsweise tiefen Werbekosten erreichen Sie Ihre Wunschkunden punktgenau in Ihrer Region."
  },
  {
    "q": "Ist Ihr Angebot auch für kleinere Unternehmen aus der Region geeignet?",
    "a": "Genau dafür sind wir da. Unsere Lösungen sind auf die Bedürfnisse und Budgets regionaler KMU zugeschnitten – vom Einzelunternehmen bis zum etablierten Betrieb."
  }
];
