// LA English — renders the 12 levels as alternating white/green cards

(function () {
  function easternArabicNumeral(n) {
    const map = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
    return String(n).split("").map((d) => map[parseInt(d, 10)]).join("");
  }

  function renderLevels(lang) {
    const track = document.getElementById("levels-track");
    if (!track) return;
    track.querySelectorAll(".level-row").forEach((el) => el.remove());

    window.LA_ENGLISH_LEVELS.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "level-row" + (idx % 2 === 1 ? " align-right" : "");
      row.dataset.levelIndex = idx;

      const card = document.createElement("div");
      card.className = "level-card";

      const name = document.createElement("div");
      name.className = "level-name";
      name.textContent = lang === "ar" ? ("المستوى " + easternArabicNumeral(item.level)) : ("Level " + item.level);

      const ul = document.createElement("ul");
      item.statements.forEach((s) => {
        const li = document.createElement("li");
        li.textContent = lang === "ar" ? s.ar : s.en;
        ul.appendChild(li);
      });

      card.appendChild(name);
      card.appendChild(ul);
      row.appendChild(card);
      track.appendChild(row);
    });

    equalizeCardHeights();
  }

  function equalizeCardHeights() {
    const track = document.getElementById("levels-track");
    if (!track) return;
    const cards = track.querySelectorAll(".level-card");
    if (!cards.length) return;

    cards.forEach((c) => { c.style.height = "auto"; });
    const max = Math.max(...Array.from(cards).map((c) => c.getBoundingClientRect().height));
    cards.forEach((c) => { c.style.height = max + "px"; });
  }

  document.addEventListener("DOMContentLoaded", () => {
    let saved = "en";
    try { saved = localStorage.getItem("laEnglishLang") || "en"; } catch (e) { /* ignore */ }
    renderLevels(saved);
    window.addEventListener("resize", equalizeCardHeights);
    window.addEventListener("load", equalizeCardHeights);
  });

  document.addEventListener("laEnglishLangChange", (e) => {
    renderLevels(e.detail.lang);
  });
})();
