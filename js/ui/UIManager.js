import { detectLanguageFromTimezone } from "../services/LanguageService.js";
import { initTypewriter, initQuoteHover } from "../components/Typewriter.js";
import { initLightbox } from "../components/Lightbox.js";

export const UIManager = {
  currentLang: "en",

  init() {
    this.injectStaticUI();
    const detectedLang = detectLanguageFromTimezone();
    console.log(`Detected language from timezone: ${detectedLang}`);
    this.currentLang = detectedLang;

    this.updateLanguageUI(detectedLang);
    initTypewriter();
    initQuoteHover(this);
    initLightbox();
    this.initNavTabs();
    this.initLangDropdown();
    this.exposeGlobals();
  },

  // UI que solo tiene sentido con JavaScript: se crea aquí para que no
  // aparezca en navegadores de terminal ni en el modo sin JS.
  injectStaticUI() {
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks) return;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mobile-menu-toggle";
    toggle.setAttribute("aria-label", "Toggle menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = `
      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="10" y1="12" x2="20" y2="12"></line>
        <line x1="6" y1="18" x2="20" y2="18"></line>
      </svg>
      <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    toggle.addEventListener("click", () => this.toggleMobileMenu());
    navLinks.before(toggle);

    const langSwitchLi = document.createElement("li");
    langSwitchLi.className = "nav-item lang-switch-mobile";
    langSwitchLi.innerHTML = `
      <div class="lang-switch-inline">
        <button type="button" id="btn-en-mobile" class="lang-btn-pill active" data-lang="en">EN</button>
        <button type="button" id="btn-es-mobile" class="lang-btn-pill" data-lang="es">ES</button>
        <button type="button" id="btn-ja-mobile" class="lang-btn-pill" data-lang="ja">JA</button>
      </div>
    `;
    langSwitchLi.querySelectorAll(".lang-btn-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setLanguage(btn.dataset.lang);
        this.closeMobileMenu();
      });
    });
    navLinks.appendChild(langSwitchLi);

    const langDropdown = document.createElement("div");
    langDropdown.className = "lang-dropdown";
    langDropdown.id = "lang-dropdown";
    langDropdown.innerHTML = `
      <button type="button" class="lang-dropdown-trigger" id="lang-trigger" aria-label="Change language" aria-expanded="false">
        <svg class="lang-globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M2 12h20"></path>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <span class="lang-current" id="lang-current-label">EN</span>
        <svg class="lang-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="lang-dropdown-menu" id="lang-menu">
        <button type="button" class="lang-option active" id="btn-en" data-lang="en">
          <span class="lang-name">English</span><span class="lang-code">EN</span>
          <span class="lang-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
        </button>
        <button type="button" class="lang-option" id="btn-es" data-lang="es">
          <span class="lang-name">Español</span><span class="lang-code">ES</span>
          <span class="lang-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
        </button>
        <button type="button" class="lang-option" id="btn-ja" data-lang="ja">
          <span class="lang-name">日本語</span><span class="lang-code">JA</span>
          <span class="lang-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
        </button>
      </div>
    `;
    langDropdown.querySelectorAll(".lang-option").forEach((opt) => {
      opt.addEventListener("click", () => this.setLanguage(opt.dataset.lang));
    });
    const navbarRight = document.querySelector(".navbar-right");
    if (navbarRight) navbarRight.appendChild(langDropdown);
  },

  updateLanguageUI(lang) {
    document.body.classList.remove("lang-en", "lang-es", "lang-ja");
    document.body.classList.add(`lang-${lang}`);

    document
      .querySelectorAll(".lang-option")
      .forEach((opt) => opt.classList.remove("active"));
    const activeDesktop = document.getElementById(`btn-${lang}`);
    if (activeDesktop) activeDesktop.classList.add("active");

    document
      .querySelectorAll(".lang-btn-pill")
      .forEach((btn) => btn.classList.remove("active"));
    const activeMobile = document.getElementById(`btn-${lang}-mobile`);
    if (activeMobile) activeMobile.classList.add("active");

    const label = document.getElementById("lang-current-label");
    if (label) label.textContent = lang.toUpperCase();
  },

  initNavTabs() {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".app-section");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("data-target");

        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        sections.forEach((sec) => {
          sec.classList.remove("active");
          sec.style.display = "none";
        });

        const targetSec = document.getElementById(targetId);
        if (targetSec) {
          targetSec.style.display = "block";

          void targetSec.offsetWidth;
          targetSec.classList.add("active");
        }
      });
    });
  },

  initLangDropdown() {
    const langDropdown = document.getElementById("lang-dropdown");
    if (!langDropdown) return;
    langDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle("open");
    });
    document.addEventListener("click", () => {
      langDropdown.classList.remove("open");
    });
  },

  setLanguage(lang) {
    if (!["en", "es", "ja"].includes(lang)) return;
    this.currentLang = lang;

    const quoteTypewriter = document.getElementById("quote-typewriter");
    if (quoteTypewriter) {
      quoteTypewriter.textContent = "";
      const quoteBox = document.getElementById("quote-box");
      if (quoteBox) {
        quoteBox.dataset.typing = "false";
        quoteBox.dataset.complete = "false";
      }
    }

    this.updateLanguageUI(lang);
    const langDropdown = document.getElementById("lang-dropdown");
    if (langDropdown) langDropdown.classList.remove("open");
  },

  exposeGlobals() {
    window.setLang = this.setLanguage.bind(this);
    window.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    window.closeMobileMenu = this.closeMobileMenu.bind(this);
  },

  toggleMobileMenu() {
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (mobileMenuToggle && navLinks) {
      mobileMenuToggle.classList.toggle("active");
      navLinks.classList.toggle("active");

      const isExpanded = navLinks.classList.contains("active");
      mobileMenuToggle.setAttribute("aria-expanded", isExpanded.toString());
    }
  },

  closeMobileMenu() {
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (mobileMenuToggle && navLinks) {
      mobileMenuToggle.classList.remove("active");
      navLinks.classList.remove("active");

      mobileMenuToggle.setAttribute("aria-expanded", "false");
    }
  },
};
