// LA English — renders the 12 levels and draws a swerving dotted progress line through them

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

      const node = document.createElement("div");
      node.className = "level-node";
      node.textContent = lang === "ar" ? easternArabicNumeral(item.level) : String(item.level);

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
      row.appendChild(node);
      row.appendChild(card);
      track.appendChild(row);
    });

    requestAnimationFrame(drawTrackLine);
  }

  function drawTrackLine() {
    const track = document.getElementById("levels-track");
    const svg = document.getElementById("track-line-svg");
    if (!track || !svg) return;

    const trackRect = track.getBoundingClientRect();
    const nodes = track.querySelectorAll(".level-node");
    if (!nodes.length) return;

    svg.setAttribute("width", trackRect.width);
    svg.setAttribute("height", trackRect.height);
    svg.setAttribute("viewBox", `0 0 ${trackRect.width} ${trackRect.height}`);

    const points = Array.from(nodes).map((n) => {
      const r = n.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - trackRect.left,
        y: r.top + r.height / 2 - trackRect.top
      };
    });

    if (points.length < 2) { svg.innerHTML = ""; return; }

    let d = `M ${points[0].x} ${points[0].y} `;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i], p1 = points[i + 1];
      const midY = (p0.y + p1.y) / 2;
      d += `C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y} `;
    }

    svg.innerHTML = `<path d="${d}" fill="none" stroke="#167544" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"/>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    let saved = "en";
    try { saved = localStorage.getItem("laEnglishLang") || "en"; } catch (e) { /* ignore */ }
    renderLevels(saved);
    window.addEventListener("resize", drawTrackLine);
  });

  document.addEventListener("laEnglishLangChange", (e) => {
    renderLevels(e.detail.lang);
  });
})();
