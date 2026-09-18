// Small vanilla-JS replacements for interactions that depended on React
// state in the live Lovable app and can't work as static HTML alone.

(function () {
  "use strict";

  // 1. Header blur backdrop: fades in once the user scrolls past the top.
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

  // 2. Mobile nav dropdown: opens on hamburger tap, closes automatically on
  // an outside click/tap or on scroll (no dedicated close button).
  var menuToggle = document.getElementById("mobile-menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  var isOpen = false;

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add("is-open");
    isOpen = true;
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeMobileNav() {
    if (!mobileNav || !isOpen) return;
    mobileNav.classList.remove("is-open");
    isOpen = false;
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  // Close on any click/tap outside the dropdown itself.
  document.addEventListener("click", function (e) {
    if (!isOpen || !mobileNav) return;
    if (mobileNav.contains(e.target)) return;
    closeMobileNav();
  });

  // Close automatically as soon as the user scrolls.
  window.addEventListener(
    "scroll",
    function () {
      if (isOpen) closeMobileNav();
    },
    { passive: true }
  );

  // Close on Escape for keyboard users.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMobileNav();
  });

  // Close the menu whenever a nav link inside it is tapped.
  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });
  }

  // 3. Hero H1: split into words and reveal each one individually with a
  // blur-to-focus + fade-in animation on load. Plain text splits into plain
  // word spans; an element child (the gradient "shimmer" span) is split
  // word-by-word too, but each resulting word keeps the shimmer element's
  // own classes so the gradient text-clip effect still renders per word.
  var heroHeading = document.getElementById("hero-heading");
  if (heroHeading && !heroHeading.dataset.split) {
    var wordIndex = 0;
    var STAGGER = 0.085; // seconds between each word starting its reveal

    function splitTextIntoWords(text, extraClasses) {
      var parts = text.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (part) {
        if (part.trim().length === 0) {
          frag.appendChild(document.createTextNode(part));
        } else {
          var span = document.createElement("span");
          span.className = extraClasses ? "word-reveal " + extraClasses : "word-reveal";
          span.textContent = part;
          span.style.transitionDelay = (wordIndex * STAGGER) + "s";
          wordIndex++;
          frag.appendChild(span);
        }
      });
      return frag;
    }

    var childNodes = Array.prototype.slice.call(heroHeading.childNodes);
    childNodes.forEach(function (child) {
      if (child.nodeType === Node.TEXT_NODE) {
        child.parentNode.replaceChild(splitTextIntoWords(child.textContent), child);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
        // Split this element's own text into words, each word keeping the
        // element's original classes (e.g. font-script text-shimmer) so
        // the gradient effect still renders correctly per word.
        var originalClasses = child.className;
        var innerText = child.textContent;
        child.textContent = "";
        child.appendChild(splitTextIntoWords(innerText, originalClasses));
        // The wrapper span itself no longer needs its own shimmer classes
        // since each inner word now carries them individually.
        child.className = originalClasses
          .split(/\s+/)
          .filter(function (c) { return c !== "text-shimmer"; })
          .join(" ");
      }
    });

    heroHeading.dataset.split = "true";

    // Trigger the animation on the next frame so the initial (hidden)
    // state actually paints first.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        heroHeading.classList.add("words-revealed");
      });
    });
  }
  // 4. "Inquire on WhatsApp" button: pulls whatever the visitor has typed
  // into the contact form so far and opens a WhatsApp chat with it
  // pre-filled as a message (WhatsApp itself requires the person to hit
  // send — there's no way to submit on their behalf from a web page).
  var whatsappBtn = document.getElementById("whatsapp-inquire");
  var WHATSAPP_NUMBER = "923194411489"; // 0319 4411489 in international format

  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", function () {
      var name = (document.getElementById("contact-name") || {}).value || "";
      var email = (document.getElementById("contact-email") || {}).value || "";
      var project = (document.getElementById("contact-project") || {}).value || "";
      var message = (document.getElementById("contact-message") || {}).value || "";

      var lines = ["Hi HCY Digital, I'd like to inquire about a project."];
      if (name) lines.push("Name: " + name);
      if (email) lines.push("Email: " + email);
      if (project) lines.push("Project type: " + project);
      if (message) lines.push("Details: " + message);

      var text = encodeURIComponent(lines.join("\n"));
      window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text, "_blank", "noopener,noreferrer");
    });
  }
})();
