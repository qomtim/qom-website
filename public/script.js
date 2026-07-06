// QOM Prototyp v2 – Interaktionen & Animationen

// ---------- Scroll-Fortschrittsbalken ----------
const progress = document.createElement("div");
progress.className = "scroll-progress";
document.body.appendChild(progress);
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  progress.style.width = pct + "%";
}, { passive: true });

// Touch-Gerät? (kein Hover) → Maus-Effekte deaktivieren
const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ---------- Cursor-Glow (nur Desktop) ----------
if (hasHover) {
  const glow = document.createElement("div");
  glow.className = "cursor-dot";
  document.body.appendChild(glow);
  window.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  }, { passive: true });
}

// ---------- Mobile-Navigation ----------
const burger = document.querySelector(".burger");
const navLinks = document.querySelector(".nav-links");
if (burger) {
  burger.addEventListener("click", () => navLinks.classList.toggle("open"));
  // Menü schliessen, sobald ein Link gewählt wird
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );
}

// ---------- FAQ-Accordion ----------
document.querySelectorAll(".faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const answer = item.querySelector(".faq-a");
    const isOpen = item.classList.contains("open");

    item.closest(".faq").querySelectorAll(".faq-item.open").forEach((other) => {
      if (other !== item) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = null;
      }
    });

    item.classList.toggle("open", !isOpen);
    answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
  });
});

// ---------- Scroll-Reveal ----------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal, .img-reveal").forEach((el) => observer.observe(el));

// ---------- Zähler-Animation ----------
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    counterObs.unobserve(e.target);
    const el = e.target;
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.5 });
document.querySelectorAll("[data-count]").forEach((el) => counterObs.observe(el));

// ---------- Service-Rows: Vorschaubild folgt dem Cursor (nur Desktop) ----------
if (hasHover) document.querySelectorAll(".service-row").forEach((row) => {
  const src = row.dataset.img;
  if (!src) return;
  let preview = null;

  row.addEventListener("mouseenter", () => {
    preview = document.createElement("div");
    preview.className = "row-preview";
    preview.innerHTML = `<img src="${src}" alt="" />`;
    document.body.appendChild(preview);
    requestAnimationFrame(() => preview.classList.add("on"));
  });

  row.addEventListener("mousemove", (e) => {
    if (!preview) return;
    preview.style.left = e.clientX + 40 + "px";
    preview.style.top = e.clientY + "px";
  });

  row.addEventListener("mouseleave", () => {
    if (!preview) return;
    const p = preview;
    preview = null;
    p.classList.remove("on");
    setTimeout(() => p.remove(), 250);
  });
});

// ---------- 3D-Tilt auf Karten (nur Desktop) ----------
if (hasHover) document.querySelectorAll(".card, .quote-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${y * -6}deg) translateY(-4px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

// ---------- Magnetische Buttons (nur Desktop) ----------
if (hasHover) document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});
