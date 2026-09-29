/* ==========================================================================
   HABITAT — main.js
   Vanilla JS only. Each feature is a guard-claused init function.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: solid background after scroll ---------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;

    var toggle = function () {
      if (window.scrollY > 40) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mainNav");
    var backdrop = document.getElementById("navBackdrop");
    if (!toggle || !nav) return;

    var open = function () {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      if (backdrop) { backdrop.hidden = false; requestAnimationFrame(function () { backdrop.classList.add("is-open"); }); }
    };
    var close = function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      if (backdrop) {
        backdrop.classList.remove("is-open");
        window.setTimeout(function () { backdrop.hidden = true; }, 380);
      }
    };

    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) close();
      else open();
    });

    if (backdrop) backdrop.addEventListener("click", close);

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        close();
        toggle.focus();
      }
    });

    // Reset when resizing back to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && nav.classList.contains("is-open")) close();
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#" || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start"
        });
      });
    });
  }

  /* ---------- Portfolio filter ---------- */
  function initPortfolioFilter() {
    var group = document.getElementById("projectFilters");
    var grid = document.getElementById("projectsGrid");
    if (!group || !grid) return;

    var buttons = group.querySelectorAll(".filter-btn");
    var items = grid.querySelectorAll(".project");
    var empty = document.getElementById("filterEmpty");

    group.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;

      buttons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      var filter = btn.getAttribute("data-filter");
      var shown = 0;

      items.forEach(function (item) {
        var match = filter === "all" || item.getAttribute("data-category") === filter;
        if (match) {
          item.classList.remove("is-hidden");
          shown++;
        } else {
          item.classList.add("is-hidden");
        }
      });

      if (empty) empty.hidden = shown !== 0;
    });
  }

  /* ---------- Furniture row: arrow controls ---------- */
  function initProductSlider() {
    var track = document.getElementById("productsTrack");
    var prev = document.getElementById("prodPrev");
    var next = document.getElementById("prodNext");
    if (!track || !prev || !next) return;

    var step = function () {
      var card = track.querySelector(".product");
      var w = card ? card.getBoundingClientRect().width : 300;
      return w + 22; // card width + gap
    };

    prev.addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: prefersReduced ? "auto" : "smooth" });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Testimonial slider ---------- */
  function initTestimonials() {
    var viewport = document.getElementById("tstViewport");
    var dotsWrap = document.getElementById("tstDots");
    var prev = document.getElementById("tstPrev");
    var next = document.getElementById("tstNext");
    if (!viewport) return;

    var slides = Array.prototype.slice.call(viewport.querySelectorAll(".tst__slide"));
    if (slides.length < 2) return;

    var index = 0;
    var timer = null;

    // Build dots
    var dots = [];
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.className = "tst__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
        dot.addEventListener("click", function () { go(i, true); });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function go(i, userAction) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, si) { s.classList.toggle("is-active", si === index); });
      dots.forEach(function (d, di) { d.classList.toggle("is-active", di === index); });
      if (userAction) restart();
    }

    function nextSlide() { go(index + 1); }

    function restart() {
      if (prefersReduced) return;
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(nextSlide, 6500);
    }

    if (prev) prev.addEventListener("click", function () { go(index - 1, true); });
    if (next) next.addEventListener("click", function () { go(index + 1, true); });

    // Pause on hover
    viewport.addEventListener("mouseenter", function () { if (timer) window.clearInterval(timer); });
    viewport.addEventListener("mouseleave", restart);

    restart();
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contact form validation ---------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var success = document.getElementById("formSuccess");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(field, on) {
      var row = field.closest(".form-row") || field.parentElement;
      if (!row) return;
      row.classList.toggle("has-error", on);
    }

    function validateField(field) {
      var val = (field.value || "").trim();
      var ok = true;
      if (field.hasAttribute("required") && !val) ok = false;
      else if (field.type === "email" && !emailRe.test(val)) ok = false;
      else if (field.id === "cf-message" && val.length < 10) ok = false;
      setError(field, !ok);
      return ok;
    }

    var fields = form.querySelectorAll("[required]");

    fields.forEach(function (field) {
      field.addEventListener("blur", function () { validateField(field); });
      field.addEventListener("input", function () {
        var row = field.closest(".form-row");
        if (row && row.classList.contains("has-error")) validateField(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var firstBad = null;
      fields.forEach(function (field) {
        if (!validateField(field)) {
          valid = false;
          if (!firstBad) firstBad = field;
        }
      });

      if (!valid) {
        if (firstBad) firstBad.focus();
        if (success) success.classList.remove("show");
        return;
      }

      if (success) success.classList.add("show");
      form.reset();
      window.setTimeout(function () {
        if (success) success.classList.remove("show");
      }, 6000);
    });
  }

  /* ---------- Newsletter (footer) ---------- */
  function initNewsletter() {
    var form = document.getElementById("newsForm");
    if (!form) return;
    var input = form.querySelector("input[type='email']");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!input) return;
      var val = (input.value || "").trim();
      if (!emailRe.test(val)) {
        input.focus();
        input.style.borderColor = "#C6A56A";
        return;
      }
      input.value = "";
      input.placeholder = "Thank you — you're on the list";
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initHeader();
    initMobileNav();
    initSmoothScroll();
    initPortfolioFilter();
    initProductSlider();
    initTestimonials();
    initReveal();
    initContactForm();
    initNewsletter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
