// Small vanilla-JS replacements for the two interactions that depended on
// React state in the live Lovable app and can't work as static HTML alone.

(function () {
  "use strict";

  // 1. Header blur backdrop: fades in once the user scrolls past the top.
  var header = document.getElementById("site-header");
  var headerBlur = document.getElementById("header-blur");

  function updateHeaderOnScroll() {
    if (!headerBlur) return;
    if (window.scrollY > 24) {
      headerBlur.classList.add("header-blur-visible");
    } else {
      headerBlur.classList.remove("header-blur-visible");
    }
  }
  window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();

  // 2. Mobile nav: the overlay only existed in the DOM when open in the
  // live React app, so it wasn't captured by the static export. This
  // rebuilds open/close behavior for the markup added back into the page.
  var menuToggle = document.getElementById("mobile-menu-toggle");
  var menuClose = document.getElementById("mobile-menu-close");
  var mobileNav = document.getElementById("mobile-nav");

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add("is-open");
    document.body.style.overflow = "hidden";
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove("is-open");
    document.body.style.overflow = "";
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle) menuToggle.addEventListener("click", openMobileNav);
  if (menuClose) menuClose.addEventListener("click", closeMobileNav);

  // Close the menu whenever a nav link inside it is tapped.
  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });
  }

  // Close on Escape for keyboard users.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMobileNav();
  });
})();
