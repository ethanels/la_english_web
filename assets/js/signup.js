// LA English — Free Lesson Signup Form logic

(function () {
  // ---- CONFIG: paste the deployed Google Apps Script Web App URL here ----
  window.LA_ENGLISH_FORM_ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
  // -------------------------------------------------------------------------

  function currentLang() {
    return document.documentElement.getAttribute("lang") === "ar" ? "ar" : "en";
  }

  function populateSelect(select, items, placeholderEn, placeholderAr, lang) {
    const prevValue = select.value;
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = lang === "ar" ? placeholderAr : placeholderEn;
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    items.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.en; // keep English as the stored value for consistent spreadsheet data
      opt.textContent = lang === "ar" ? item.ar : item.en;
      select.appendChild(opt);
    });

    if (prevValue) select.value = prevValue;
  }

  function populatePhoneCodeSelect(select, items, placeholderEn, placeholderAr, lang) {
    const prevValue = select.value;
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = lang === "ar" ? placeholderAr : placeholderEn;
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    items.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.dial;
      opt.dataset.full = item.dial + " " + (lang === "ar" ? item.ar : item.en);
      opt.textContent = opt.dataset.full;
      select.appendChild(opt);
    });

    if (prevValue) select.value = prevValue;
    compactPhoneSelection(select);
  }

  // Dropdown list always shows "+dial Country"; the closed box shows just "+dial" once a code is picked.
  function expandPhoneOptions(select) {
    Array.from(select.options).forEach((opt) => {
      if (opt.dataset.full) opt.textContent = opt.dataset.full;
    });
  }

  function compactPhoneSelection(select) {
    const opt = select.options[select.selectedIndex];
    if (opt && opt.value) opt.textContent = opt.value;
  }

  function renderFormOptions(lang) {
    const reasonSelect = document.getElementById("reason");
    const countrySelect = document.getElementById("country");
    const provinceSelect = document.getElementById("province");
    const whatsappCodeSelect = document.getElementById("whatsappCode");

    if (reasonSelect) {
      populateSelect(reasonSelect, window.LA_ENGLISH_REASONS,
        "Select a reason", "اختر سببًا", lang);
    }
    if (countrySelect) {
      populateSelect(countrySelect, window.LA_ENGLISH_COUNTRIES,
        "Select a country", "اختر دولة", lang);
    }
    if (provinceSelect) {
      populateSelect(provinceSelect, window.LA_ENGLISH_SAUDI_PROVINCES,
        "Select a province", "اختر منطقة", lang);
    }
    if (whatsappCodeSelect) {
      populatePhoneCodeSelect(whatsappCodeSelect, window.LA_ENGLISH_COUNTRY_CODES,
        "Country code", "رمز الدولة", lang);
    }
    toggleProvinceField();
  }

  function toggleProvinceField() {
    const countrySelect = document.getElementById("country");
    const provinceField = document.getElementById("province-field");
    if (!countrySelect || !provinceField) return;
    provinceField.style.display = countrySelect.value === "Saudi Arabia" ? "block" : "none";
  }

  function validateWhatsApp(countryCode, localNumber) {
    // Country code must be one of the selected dial codes; local number is 6-12 digits (basic sanity check).
    return /^\+[1-9]\d{0,3}$/.test(countryCode.trim()) && /^\d{6,12}$/.test(localNumber.trim());
  }

  function showMessage(type, textEn, textAr) {
    const msg = document.getElementById("form-msg");
    if (!msg) return;
    msg.textContent = currentLang() === "ar" ? textAr : textEn;
    msg.className = "form-msg show " + type;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const whatsappCode = form.whatsappCode.value.trim();
    const whatsappLocal = form.whatsapp.value.trim();
    const reason = form.reason.value;
    const country = form.country.value;
    const province = form.province ? form.province.value : "";

    if (!firstName || !lastName || !reason || !country || !whatsappCode) {
      showMessage("error", "Please fill in all required fields.", "يرجى تعبئة جميع الحقول المطلوبة.");
      return;
    }
    if (!validateWhatsApp(whatsappCode, whatsappLocal)) {
      showMessage("error", "Please select your country code and enter a valid WhatsApp number (6-12 digits, no leading 0 or +).", "يرجى اختيار رمز الدولة وإدخال رقم واتساب صحيح (6-12 رقمًا، بدون صفر أو + في البداية).");
      return;
    }
    const whatsapp = whatsappCode + whatsappLocal;

    const payload = {
      firstName, lastName, whatsapp, reason, country,
      region: country === "Saudi Arabia" ? province : "",
      submittedAt: new Date().toISOString(),
      language: currentLang()
    };

    const submitBtn = form.querySelector("[type=submit]");
    if (submitBtn) submitBtn.disabled = true;

    if (!window.LA_ENGLISH_FORM_ENDPOINT || window.LA_ENGLISH_FORM_ENDPOINT.indexOf("PASTE_YOUR") === 0) {
      // Endpoint not configured yet — don't silently fail, tell whoever's testing.
      showMessage("error",
        "Form isn't connected to a submission endpoint yet — see assets/js/signup.js.",
        "لم يتم ربط النموذج بعد بجهة استقبال البيانات — راجع assets/js/signup.js.");
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    fetch(window.LA_ENGLISH_FORM_ENDPOINT, {
      method: "POST",
      mode: "no-cors", // Apps Script web apps don't return readable CORS responses; fire-and-forget
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })
      .then(() => {
        form.reset();
        showMessage("success",
          "Thanks! We've received your request and will reach out on WhatsApp soon.",
          "شكرًا لك! لقد استلمنا طلبك وسنتواصل معك قريبًا عبر واتساب.");
      })
      .catch(() => {
        showMessage("error",
          "Something went wrong sending your request. Please try again or message us on WhatsApp.",
          "حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى أو مراسلتنا عبر واتساب.");
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  }

  document.addEventListener("DOMContentLoaded", () => {
    let saved = "en";
    try { saved = localStorage.getItem("laEnglishLang") || "en"; } catch (e) { /* ignore */ }
    renderFormOptions(saved);

    const countrySelect = document.getElementById("country");
    if (countrySelect) countrySelect.addEventListener("change", toggleProvinceField);

    const whatsappCodeSelect = document.getElementById("whatsappCode");
    if (whatsappCodeSelect) {
      whatsappCodeSelect.addEventListener("mousedown", () => expandPhoneOptions(whatsappCodeSelect));
      whatsappCodeSelect.addEventListener("focus", () => expandPhoneOptions(whatsappCodeSelect));
      whatsappCodeSelect.addEventListener("change", () => compactPhoneSelection(whatsappCodeSelect));
      whatsappCodeSelect.addEventListener("blur", () => compactPhoneSelection(whatsappCodeSelect));
    }

    const whatsappInput = document.getElementById("whatsapp");
    const whatsappError = document.getElementById("whatsapp-error");
    if (whatsappInput && whatsappError) {
      whatsappInput.addEventListener("input", () => {
        const hasInvalidChars = /\D/.test(whatsappInput.value);
        if (hasInvalidChars) whatsappInput.value = whatsappInput.value.replace(/\D/g, "");
        whatsappError.classList.toggle("show", hasInvalidChars);
      });
    }

    const form = document.getElementById("signup-form");
    if (form) form.addEventListener("submit", handleSubmit);
  });

  document.addEventListener("laEnglishLangChange", (e) => {
    renderFormOptions(e.detail.lang);
  });
})();
