/* ============================================================
   SimpleSite — app.js
   ------------------------------------------------------------
   Small, dependency-free behaviours:
     1. Set the current year in the footer
     2. Mobile menu toggle (hamburger)
     3. Dark / light theme toggle (saved in localStorage)
     4. Interactive click counter
     5. Reveal-on-scroll animations
   Each block is wrapped in a function and called once the DOM
   is ready. Because the <script> tag uses `defer`, the HTML is
   already parsed when this runs.
   ============================================================ */

(function () {
  "use strict";

  /* --------------------------------------------------------
     Tiny helper: document.getElementById shortcut
     -------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);

  /* ========================================================
     1. FOOTER YEAR
     ======================================================== */
  function initFooterYear() {
    const yearEl = $("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ========================================================
     2. MOBILE MENU TOGGLE
     --------------------------------------------------------
     Toggles the .is-open class on both the hamburger button
     and the nav links list, and updates ARIA attributes for
     accessibility.
     ======================================================== */
  function initMobileMenu() {
    const menuBtn = $("menuToggle");
    const navLinks = $("navLinks");
    if (!menuBtn || !navLinks) return;

    const toggleMenu = (force) => {
      // force lets us explicitly open (true) or close (false)
      const willOpen =
        typeof force === "boolean"
          ? force
          : !navLinks.classList.contains("is-open");

      navLinks.classList.toggle("is-open", willOpen);
      menuBtn.classList.toggle("is-open", willOpen);
      menuBtn.setAttribute("aria-expanded", String(willOpen));
    };

    // Click the hamburger to open/close
    menuBtn.addEventListener("click", () => toggleMenu());

    // Close the menu after clicking any link (nice UX on mobile)
    navLinks.addEventListener("click", (event) => {
      if (event.target.matches("a")) toggleMenu(false);
    });

    // Close the menu if the user resizes up to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) toggleMenu(false);
    });
  }

  /* ========================================================
     3. THEME TOGGLE (dark / light)
     --------------------------------------------------------
     The theme is controlled by a data-theme attribute on <html>,
     which the CSS uses to swap colour variables. We remember the
     user's choice in localStorage so it persists between visits.
     ======================================================== */
  const THEME_KEY = "simplesite-theme";

    // Returns "light" or "dark".
  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = document.querySelector(".theme-icon");
    // Sun in dark mode (click to go light), moon in light mode.
    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";

    const toggle = $("themeToggle");
    if (toggle) toggle.setAttribute("aria-pressed", String(theme === "dark"));
  }

  function initThemeToggle() {
    const toggle = $("themeToggle");
    if (!toggle) return;

    // Load the saved theme (or the user's OS preference on first visit)
    const stored = localStorage.getItem(THEME_KEY);
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ? getStoredTheme() : prefersDark ? "dark" : "light";

    applyTheme(initial);

    toggle.addEventListener("click", () => {
      const next =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  /* ========================================================
     4. INTERACTIVE COUNTER
     --------------------------------------------------------
     Increments an <output> element when a button is clicked,
     and adds a quick CSS "bump" animation for feedback.
     ======================================================== */
  function initCounter() {
    const countBtn = $("countBtn");
    const resetBtn = $("resetBtn");
    const output = $("counterOutput");
    if (!countBtn || !output) return;

    let count = 0;

    const render = () => {
      output.value = count; // <output> supports .value
      output.textContent = count;
      // Re-trigger the bump animation by toggling the class
      output.classList.remove("bump");
      // forces reflow so the animation restarts
      void output.offsetWidth;
      output.classList.add("bump");
    };

    countBtn.addEventListener("click", () => {
      count += 1;
      render();
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        count = 0;
        render();
      });
    }
  }

  /* ========================================================
     5. REVEAL ON SCROLL
     --------------------------------------------------------
     Adds the .is-visible class to .reveal elements as they
     enter the viewport, triggering the CSS transition.
     Uses IntersectionObserver — modern and efficient.
     ======================================================== */
  function initRevealOnScroll() {
    const revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;

    // Feature check: if IO isn't supported, just show everything.
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target); // only animate once
          }
        });
      },
      { threshold: 0.15 } // 15% visible triggers it
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ========================================================
     BOOTSTRAP — run everything once the DOM is ready.
     ======================================================== */
  function init() {
    initFooterYear();
    initMobileMenu();
    initThemeToggle();
    initCounter();
    initRevealOnScroll();
  }

  // `defer` already guarantees the DOM is parsed, but this guard
  // makes the script safe if it's ever loaded differently.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
