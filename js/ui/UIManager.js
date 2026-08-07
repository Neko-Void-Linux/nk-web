import { detectLanguageFromTimezone } from "../services/LanguageService.js";
import { initTypewriter, initQuoteHover } from "../components/Typewriter.js";
import { initLightbox } from "../components/Lightbox.js";

export const UIManager = {
  currentLang: "en",

  init() {
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
