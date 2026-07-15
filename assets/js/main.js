// LA English — shared behavior across all pages

(function () {
  // ---- CONFIG: update this with the real business WhatsApp number ----
  window.LA_ENGLISH_WHATSAPP_NUMBER = "9665XXXXXXXX"; // full international number, no + or spaces
  window.LA_ENGLISH_DEFAULT_MSG = {
    en: "Hi! I'd like to know more about LA English classes.",
    ar: "مرحباً! أود معرفة المزيد عن دورات إل إيه إنجلش."
  };
  // ----------------------------------------------------------------------

  function buildWaLink(msgKey) {
    const lang = document.documentElement.getAttribute("lang") || "en";
    const msg = (msgKey && window.LA_ENGLISH_DEFAULT_MSG[msgKey]) || window.LA_ENGLISH_DEFAULT_MSG[lang] || window.LA_ENGLISH_DEFAULT_MSG.en;
    return `https://wa.me/${window.LA_ENGLISH_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  function refreshWaLinks() {
    document.querySelectorAll("[data-wa-link]").forEach((el) => {
      el.setAttribute("href", buildWaLink(el.getAttribute("data-wa-link")));
    });
  }

  function setLanguage(lang) {
    const html = document.documentElement;
    html.setAttribute("lang", lang === "ar" ? "ar" : "en");
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    document.querySelectorAll("[data-en]").forEach((el) => {
      const text = lang === "ar" ? el.getAttribute("data-ar") : el.getAttribute("data-en");
      if (text !== null) el.textContent = text;
    });

    document.querySelectorAll("[data-en-html]").forEach((el) => {
      const html_ = lang === "ar" ? el.getAttribute("data-ar-html") : el.getAttribute("data-en-html");
      if (html_ !== null) el.innerHTML = html_;
    });

    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    try { localStorage.setItem("laEnglishLang", lang); } catch (e) { /* ignore */ }
    refreshWaLinks();

    // Let page-specific scripts (levels.js, teachers.js) know to re-render
    document.dispatchEvent(new CustomEvent("laEnglishLangChange", { detail: { lang } }));
  }

  function initLangToggle() {
    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => setLanguage(btn.getAttribute("data-lang")));
    });
    let saved = "en";
    try { saved = localStorage.getItem("laEnglishLang") || "en"; } catch (e) { /* ignore */ }
    setLanguage(saved);
  }

  function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
    });
  }

  // ---- Logo: two-color dashed line, measured against the actual rendered wordmark ----
  window.layoutLogoLine = function (wordmarkId, greenId, accentId) {
    const text = document.getElementById(wordmarkId);
    if (!text) return;
    const bbox = text.getBBox();
    const startX = bbox.x;
    const endX = bbox.x + bbox.width;
    const total = endX - startX;
    if (total <= 0) return;

    const dashCount = 9, gapCount = 8, ratio = 12 / 8;
    const g = total / (dashCount * ratio + gapCount);
    const d = ratio * g;
    const greenLen = 6 * d + 5 * g;
    const accentStart = startX + greenLen + g;

    const green = document.getElementById(greenId);
    green.setAttribute("x1", startX);
    green.setAttribute("x2", startX + greenLen);
    green.setAttribute("stroke-dasharray", d + " " + g);
    green.setAttribute("stroke-dashoffset", "0");

    const accent = document.getElementById(accentId);
    accent.setAttribute("x1", accentStart);
    accent.setAttribute("x2", endX);
    accent.setAttribute("stroke-dasharray", d + " " + g);
    accent.setAttribute("stroke-dashoffset", "0");
  };

  window.layoutAllLogos = function () {
    document.querySelectorAll("[data-logo-wordmark]").forEach((el) => {
      const suffix = el.getAttribute("data-logo-wordmark");
      window.layoutLogoLine("wordmark-" + suffix, "seg-green-" + suffix, "seg-accent-" + suffix);
    });
  };

  function initLogos() {
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load("800 32px Archivo"), document.fonts.ready])
        .then(window.layoutAllLogos).catch(window.layoutAllLogos);
    } else {
      window.addEventListener("load", window.layoutAllLogos);
    }
    setTimeout(window.layoutAllLogos, 350);
    window.addEventListener("resize", window.layoutAllLogos);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLangToggle();
    initMobileNav();
    initLogos();
    refreshWaLinks();
  });
})();
