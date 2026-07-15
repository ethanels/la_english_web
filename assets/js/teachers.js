// LA English — renders teacher cards from teachers-data.js (scales automatically as more are added)

(function () {
  const SILHOUETTE_SVG = `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="38" r="18" fill="currentColor"/>
      <path d="M14 90c0-20 16-32 36-32s36 12 36 32" fill="currentColor"/>
    </svg>`;

  function renderTeachers(lang) {
    const grid = document.getElementById("teacher-grid");
    if (!grid) return;
    grid.innerHTML = "";

    window.LA_ENGLISH_TEACHERS.forEach((t) => {
      const card = document.createElement("div");
      card.className = "teacher-card";

      const photo = document.createElement("div");
      photo.className = "teacher-photo";
      if (t.photo) {
        const img = document.createElement("img");
        img.src = t.photo;
        img.alt = lang === "ar" ? t.name.ar : t.name.en;
        img.style.width = "100%"; img.style.height = "100%"; img.style.objectFit = "cover";
        photo.appendChild(img);
      } else {
        photo.innerHTML = SILHOUETTE_SVG;
      }

      const name = document.createElement("h3");
      name.textContent = lang === "ar" ? t.name.ar : t.name.en;

      const origin = document.createElement("div");
      origin.className = "teacher-origin";
      origin.textContent = lang === "ar" ? t.origin.ar : t.origin.en;

      const bio = document.createElement("p");
      bio.textContent = lang === "ar" ? t.bio.ar : t.bio.en;

      const hobby = document.createElement("p");
      hobby.style.fontStyle = "italic";
      hobby.style.fontSize = "0.85rem";
      hobby.textContent = lang === "ar" ? t.hobby.ar : t.hobby.en;

      card.appendChild(photo);
      card.appendChild(name);
      card.appendChild(origin);
      card.appendChild(bio);
      card.appendChild(hobby);
      grid.appendChild(card);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    let saved = "en";
    try { saved = localStorage.getItem("laEnglishLang") || "en"; } catch (e) { /* ignore */ }
    renderTeachers(saved);
  });

  document.addEventListener("laEnglishLangChange", (e) => {
    renderTeachers(e.detail.lang);
  });
})();
