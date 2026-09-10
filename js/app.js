/**
 * VOIR — GSAP + Lenis + ScrollTrigger Animation Engine
 */
(function () {
  "use strict";

  const prefersReduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 900px)").matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------
     Utilities
  ------------------------------------------ */

  function splitText(el, type) {
    if (!el || el.dataset.splitDone) return;
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.textContent = "";

    if (type === "words") {
      const words = text.split(/\s+/);
      words.forEach((word, i) => {
        const wrap = document.createElement("span");
        wrap.className = "split-word";
        const inner = document.createElement("span");
        inner.textContent = word;
        wrap.appendChild(inner);
        el.appendChild(wrap);
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(" "));
        }
      });
    } else {
      // lines — approximate by wrapping whole text as one or split by punctuation/soft breaks
      const parts = text.split(/(?<=[.!?])\s+/);
      const lines = parts.length > 1 ? parts : [text];
      lines.forEach((line, i) => {
        const wrap = document.createElement("span");
        wrap.className = "split-line";
        wrap.style.display = "block";
        const inner = document.createElement("span");
        inner.textContent = line;
        wrap.appendChild(inner);
        el.appendChild(wrap);
        if (i < lines.length - 1) {
          // keep spacing via block display
        }
      });
    }
    el.dataset.splitDone = "true";
  }

  function prepareSplits() {
    document.querySelectorAll('[data-split="words"]').forEach((el) => {
      splitText(el, "words");
    });
    document.querySelectorAll('[data-split="lines"]').forEach((el) => {
      splitText(el, "lines");
    });
  }

  function revealImmediate() {
    document.querySelectorAll("[data-reveal], [data-split]").forEach((el) => {
      el.classList.add("reveal-done");
    });
    document.querySelectorAll(".split-word > span, .split-line > span").forEach((el) => {
      gsap.set(el, { y: 0 });
    });
  }

  /* ------------------------------------------
     Lenis smooth scroll
  ------------------------------------------ */

  let lenis = null;

  function initLenis() {
    if (prefersReduced || typeof Lenis === "undefined") return;

    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -72, duration: 1.4 });
        } else {
          const top = target.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
        }
        closeMobileNav();
      });
    });
  }

  function bindAnchorFallback() {
    if (lenis) return;
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      if (anchor.dataset.bound) return;
      anchor.dataset.bound = "1";
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
        closeMobileNav();
      });
    });
  }

  /* ------------------------------------------
     Preloader
  ------------------------------------------ */

  function runPreloader() {
    return new Promise((resolve) => {
      const preloader = document.getElementById("preloader");
      const progress = document.getElementById("preloaderProgress");
      const percent = document.getElementById("preloaderPercent");
      const brand = preloader
        ? preloader.querySelector(".preloader__brand")
        : null;
      const logoFill = document.getElementById("preloaderLogoFill");
      const progressWrap = preloader
        ? preloader.querySelector(".preloader__progress-wrap")
        : null;

      if (!preloader || prefersReduced) {
        if (preloader) preloader.remove();
        document.body.classList.remove("is-loading");
        resolve();
        return;
      }

      document.body.classList.add("is-loading");

      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        document.body.classList.remove("is-loading");
        preloader.classList.add("is-done");
        gsap.set(preloader, { display: "none" });
        resolve();
      };

      const setLoadProgress = (raw) => {
        const v = Math.max(0, Math.min(100, Math.round(raw)));
        const remain = 100 - v;
        if (logoFill) {
          gsap.set(logoFill, { clipPath: "inset(0 " + remain + "% 0 0)" });
        }
        if (progress) gsap.set(progress, { scaleX: v / 100 });
        if (percent) percent.textContent = v + "%";
      };

      gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(progressWrap, { opacity: 0, scaleX: 0.88 });
      gsap.set(percent, { opacity: 0, y: 10 });
      gsap.set(brand, { opacity: 0, y: 18 });
      setLoadProgress(0);

      const counter = { value: 0 };
      const tl = gsap.timeline({ onComplete: finish });

      /* Brand settles in (ghost visible first) */
      tl.to(brand, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power3.out",
      });

      /* Progress track + percent */
      tl.to(
        progressWrap,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.55,
          ease: "power2.out",
        },
        "-=0.3"
      );

      tl.to(
        percent,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        "<0.05"
      );

      /* Fill white through VOIR + bar + % together */
      tl.to(
        counter,
        {
          value: 100,
          duration: 2.35,
          ease: "power2.inOut",
          onUpdate: () => setLoadProgress(counter.value),
        },
        "-=0.15"
      );

      /* Soft flash at full */
      tl.to(brand, {
        opacity: 0.92,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
      });

      /* Exit */
      tl.to(
        brand,
        {
          y: -22,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
        },
        "+=0.18"
      );

      tl.to(
        [progressWrap, percent],
        {
          opacity: 0,
          y: -12,
          duration: 0.4,
          ease: "power2.in",
        },
        "<"
      );

      tl.to(
        preloader,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.95,
          ease: "power4.inOut",
        },
        "-=0.12"
      );

      window.setTimeout(finish, 6000);
    });
  }

  /* ------------------------------------------
     Navigation
  ------------------------------------------ */

  function initNav() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (!nav) return;

    let lastY = 0;

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        if (y > 60) nav.classList.add("is-scrolled");
        else nav.classList.remove("is-scrolled");

        if (y > lastY + 4 && y > 120) nav.classList.add("is-hidden");
        else if (y < lastY - 4) nav.classList.remove("is-hidden");
        lastY = y;
      },
    });

    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const open = toggle.classList.toggle("is-open");
        links.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });

      links.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", closeMobileNav);
      });
    }
  }

  function closeMobileNav() {
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (toggle) {
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    if (links) links.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* ------------------------------------------
     Hero entrance
  ------------------------------------------ */

  function animateHero() {
    const titleWords = document.querySelectorAll(".hero__title .split-word > span");
    const eyebrow = document.querySelector(".hero__eyebrow");
    const desc = document.querySelector(".hero__desc");
    const ctas = document.querySelector(".hero__ctas");
    const scrollHint = document.querySelector(".hero__scroll");
    const bgImage = document.querySelector(".hero__bg-image");

    if (prefersReduced) {
      revealImmediate();
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (bgImage) {
      gsap.fromTo(bgImage, { scale: 1.2, opacity: 0.6 }, { scale: 1.08, opacity: 1, duration: 2, ease: "power2.out" });
    }

    if (eyebrow) {
      gsap.set(eyebrow, { opacity: 0, y: 20 });
      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.1);
    }

    if (titleWords.length) {
      tl.to(
        titleWords,
        { y: 0, duration: 1.05, stagger: 0.08, ease: "power4.out" },
        0.2
      );
    }

    if (desc) {
      gsap.set(desc, { opacity: 0, y: 24 });
      tl.to(desc, { opacity: 1, y: 0, duration: 0.8 }, 0.55);
    }

    if (ctas) {
      gsap.set(ctas, { opacity: 0, y: 24 });
      tl.to(ctas, { opacity: 1, y: 0, duration: 0.8 }, 0.7);
    }

    if (scrollHint) {
      gsap.set(scrollHint, { opacity: 0 });
      tl.to(scrollHint, { opacity: 1, duration: 0.6 }, 1.0);
    }
  }

  /* ------------------------------------------
     Featured horizontal slider
  ------------------------------------------ */

  function renderFeaturedSlider() {
    const track = el("featTrack");
    if (!track || !window.VOIR) return;
    const picks = window.VOIR.models.filter(function (m) {
      return ["VR55FLG14KQ", "VR32FLG12KQ", "VTN55CU2EB", "VTQ43CF2EB", "VTQ40CF2EB", "VTQ32CH2EB"].indexOf(m.id) !== -1;
    });
    track.innerHTML = picks
      .map(function (m) {
        const seriesName = window.VOIR.series[m.series].name;
        const seriesClass =
          m.series === "additional" || m.series === "core" ? "feat-slide--core" : "feat-slide--zenith";
        return (
          '<article class="feat-slide ' +
          seriesClass +
          '" data-model="' +
          escapeHtml(m.id) +
          '">' +
          '<div class="feat-slide__media"><img src="' +
          escapeHtml(m.image) +
          '" alt="' +
          escapeHtml(m.id) +
          '" /></div>' +
          '<div class="feat-slide__body">' +
          "<span>" +
          escapeHtml(seriesName) +
          "</span>" +
          "<h3>" +
          escapeHtml(m.size) +
          " " +
          escapeHtml(m.id) +
          "</h3>" +
          "<p>" +
          (m.qled ? "QLED" : "Non-QLED") +
          " · " +
          escapeHtml(m.resolutionLabel) +
          " · " +
          escapeHtml(m.os) +
          "</p>" +
          '<a href="tv.html?model=' +
          encodeURIComponent(m.id) +
          '" class="feat-slide__link">View Specifications →</a>' +
          "</div></article>"
        );
      })
      .join("");
  }

  function initFeaturedSlider() {
    const wrap = document.getElementById("featCarousel") || document.querySelector(".featured-slider__wrap");
    const track = document.getElementById("featTrack");
    if (!wrap || !track) return;

    const originals = Array.from(track.querySelectorAll(".feat-slide"));
    if (!originals.length) return;

    track.innerHTML = track.innerHTML + track.innerHTML;
    let slides = Array.from(track.querySelectorAll(".feat-slide"));
    const count = originals.length;

    let setWidth = 0;
    let x = 0;
    let targetX = 0;
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let dragged = false;
    let paused = false;
    let resumeTimer = null;
    let snapMode = false;
    const autoSpeed = prefersReduced ? 0 : 0.45;
    const ease = 0.12;

    function measure() {
      slides = Array.from(track.querySelectorAll(".feat-slide"));
      if (slides.length < 2) return;
      const half = Math.floor(slides.length / 2);
      setWidth = slides[half].offsetLeft - slides[0].offsetLeft;
    }

    function wrapX(value) {
      if (!setWidth) return value;
      while (value <= -setWidth) value += setWidth;
      while (value > 0) value -= setWidth;
      return value;
    }

    // Use layout metrics (not getBoundingClientRect) so scale never fights itself
    function paintSlides() {
      if (!setWidth) return;
      const viewCenter = -x + wrap.clientWidth / 2;
      let best = null;
      let bestAbs = Infinity;

      slides.forEach(function (slide) {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const offset = (slideCenter - viewCenter) / Math.max(wrap.clientWidth * 0.42, 1);
        const t = Math.max(-1, Math.min(1, offset));
        const abs = Math.abs(t);
        const scale = 1.04 - abs * 0.16;
        const opacity = 1 - abs * 0.38;
        const rotateY = t * -16;
        const lift = (1 - abs) * 12;

        slide.style.transform =
          "translateY(" +
          -lift +
          "px) rotateY(" +
          rotateY +
          "deg) scale(" +
          scale +
          ")";
        slide.style.opacity = String(opacity);
        slide.style.zIndex = String(Math.round((1 - abs) * 20));

        if (abs < bestAbs) {
          bestAbs = abs;
          best = slide;
        }
      });

      slides.forEach(function (slide) {
        slide.classList.toggle("is-active", slide === best);
      });
    }

    function nearestTarget() {
      if (!setWidth || !slides.length) return x;
      const viewCenter = -x + wrap.clientWidth / 2;
      let bestX = x;
      let bestDist = Infinity;
      // Only consider first set — clones share the same relative spacing
      for (let i = 0; i < count; i++) {
        const slide = slides[i];
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const desired = -(slideCenter - wrap.clientWidth / 2);
        const dist = Math.abs(desired - x);
        // also check +setWidth and -setWidth equivalents
        [desired, desired - setWidth, desired + setWidth].forEach(function (candidate) {
          const d = Math.abs(candidate - x);
          if (d < bestDist) {
            bestDist = d;
            bestX = candidate;
          }
        });
      }
      return wrapX(bestX);
    }

    function pauseAuto(ms) {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
      if (ms) {
        resumeTimer = setTimeout(function () {
          paused = false;
          snapMode = false;
        }, ms);
      }
    }

    function stepBy(dir) {
      if (!setWidth || !count) return;
      snapMode = true;
      pauseAuto(2800);
      const step = setWidth / count;
      targetX = wrapX(targetX - dir * step);
    }

    measure();
    x = wrapX(-setWidth * 0.12);
    targetX = x;
    paintSlides();

    window.addEventListener("resize", function () {
      measure();
      x = wrapX(x);
      targetX = x;
      paintSlides();
    });

    const prev = document.getElementById("featPrev");
    const next = document.getElementById("featNext");
    prev && prev.addEventListener("click", function () { stepBy(-1); });
    next && next.addEventListener("click", function () { stepBy(1); });

    wrap.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      isDown = true;
      dragged = false;
      snapMode = false;
      pauseAuto(0);
      startX = e.clientX;
      scrollStart = x;
      wrap.classList.add("is-dragging");
      wrap.setPointerCapture(e.pointerId);
    });

    wrap.addEventListener("pointermove", function (e) {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) dragged = true;
      x = scrollStart + dx;
      targetX = x;
    });

    function endDrag() {
      if (!isDown) return;
      isDown = false;
      wrap.classList.remove("is-dragging");
      snapMode = true;
      targetX = nearestTarget();
      pauseAuto(2400);
    }

    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);
    wrap.addEventListener("mouseenter", function () {
      if (isDown) return;
      snapMode = true;
      targetX = nearestTarget();
      pauseAuto(0);
    });
    wrap.addEventListener("mouseleave", function () {
      if (!isDown) pauseAuto(600);
    });

    slides.forEach(function (slide) {
      slide.addEventListener("click", function (e) {
        if (dragged) e.preventDefault();
      });
    });

    if (!prefersReduced) {
      gsap.fromTo(
        wrap,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrap,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    function tick() {
      if (!isDown) {
        if (!paused && !snapMode) {
          targetX -= autoSpeed;
        }
        targetX = wrapX(targetX);
        x += (targetX - x) * (snapMode || paused ? ease : 0.2);
        x = wrapX(x);
        // Keep target near x during free autoplay so wrap stays stable
        if (!paused && !snapMode) targetX = x;
      } else {
        x = wrapX(x);
      }

      track.style.transform = "translate3d(" + x + "px, 0, 0)";
      paintSlides();
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ------------------------------------------
     Scroll reveals
  ------------------------------------------ */

  function initScrollReveals() {
    if (prefersReduced) {
      revealImmediate();
      return;
    }

    // Fade reveals (skip hero + cards handled by stagger)
    gsap.utils
      .toArray('[data-reveal="fade"], [data-reveal="card"]')
      .filter(
        (el) =>
          !el.closest(".hero") &&
          !el.closest(".technology") &&
          !el.closest(".lifestyle") &&
          !el.classList.contains("cat-card") &&
          !el.classList.contains("feature-card")
      )
      .forEach((el) => {
        const isCard = el.getAttribute("data-reveal") === "card";
        gsap.fromTo(
          el,
          { opacity: 0, y: isCard ? 56 : 40 },
          {
            opacity: 1,
            y: 0,
            duration: isCard ? 0.95 : 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });

    // Clip-path image reveals (skip hero — handled in animateHero)
    gsap.utils.toArray('[data-reveal="clip"]').forEach((el) => {
      if (el.closest(".hero")) return;
      gsap.fromTo(
        el,
        { clipPath: "inset(12% 12% 12% 12% round 24px)", opacity: 0.4 },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          opacity: 1,
          duration: 1.6,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    gsap.utils.toArray('[data-reveal="clip-left"]').forEach((el) => {
      const img = el.querySelector(".showcase__img, .clip-reveal-inner, img");
      gsap.fromTo(
        el,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.55,
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        }
      );
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.12, x: -30 },
          {
            scale: 1,
            x: 0,
            duration: 1.9,
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    gsap.utils.toArray('[data-reveal="clip-right"]').forEach((el) => {
      const img = el.querySelector(".showcase__img, img");
      gsap.fromTo(
        el,
        { clipPath: "inset(0 0 0 100%)" },
        {
          clipPath: "inset(0 0 0 0%)",
          duration: 1.55,
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        }
      );
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.12, x: 30 },
          {
            scale: 1,
            x: 0,
            duration: 1.9,
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    // Smooth image fades for lifestyle / category media
    gsap.utils.toArray(".cat-card__img, .lifestyle__media img").forEach((img) => {
      gsap.fromTo(
        img,
        { scale: 1.06, opacity: 0.85 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: img.closest(".cat-card, .lifestyle__card") || img,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Split lines / words on scroll
    document.querySelectorAll('[data-split="lines"], [data-split="words"]').forEach((el) => {
      if (el.closest(".hero")) return; // hero handled separately
      const inners = el.querySelectorAll(".split-word > span, .split-line > span");
      if (!inners.length) return;
      gsap.fromTo(
        inners,
        { y: "110%" },
        {
          y: "0%",
          duration: 1.15,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }

  /* ------------------------------------------
     Parallax
  ------------------------------------------ */

  function initParallax() {
    if (prefersReduced || isMobile) return;

    ScrollTrigger.matchMedia({
      "(min-width: 901px)": function () {
        document.querySelectorAll("[data-parallax]").forEach((el) => {
          const speed = parseFloat(el.getAttribute("data-parallax")) || 0.2;
          const distance = speed * 120;
          gsap.to(el, {
            y: -distance,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section") || el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        });

        // Soft parallax on hero background
        const heroBg = document.querySelector(".hero__bg-image");
        if (heroBg) {
          gsap.to(heroBg, {
            y: 80,
            ease: "none",
            scrollTrigger: {
              trigger: "#hero",
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      },
    });
  }

  /* ------------------------------------------
     Technology pinned storytelling (no overlap)
  ------------------------------------------ */

  function initTechnology() {
    const section = document.getElementById("technology");
    if (!section) return;

    const headerBits = section.querySelectorAll(".technology__title, .technology__desc, .btn--ghost-light");
    const cards = section.querySelectorAll(".technology__card");

    if (prefersReduced) {
      gsap.set([headerBits, cards], { autoAlpha: 1, y: 0, clearProps: "transform" });
      return;
    }

    gsap.fromTo(
      headerBits,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section.querySelector(".technology__grid"),
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* ------------------------------------------
     Horizontal explore drag
  ------------------------------------------ */

  function initExploreDrag() {
    const wrap = document.querySelector(".explore__track-wrap");
    const track = document.getElementById("exploreTrack");
    if (!wrap || !track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    // Use transform-based drag for smoother feel with Lenis
    let currentX = 0;
    let targetX = 0;
    let maxScroll = 0;

    function measure() {
      maxScroll = Math.max(0, track.scrollWidth - wrap.clientWidth);
    }
    measure();
    window.addEventListener("resize", measure);

    wrap.addEventListener("pointerdown", (e) => {
      isDown = true;
      startX = e.clientX;
      scrollLeft = targetX;
      wrap.setPointerCapture(e.pointerId);
    });

    wrap.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      targetX = Math.min(0, Math.max(-maxScroll, scrollLeft + dx));
    });

    wrap.addEventListener("pointerup", () => {
      isDown = false;
    });
    wrap.addEventListener("pointercancel", () => {
      isDown = false;
    });

    // Wheel horizontal
    wrap.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          targetX = Math.min(0, Math.max(-maxScroll, targetX - e.deltaY));
        }
      },
      { passive: false }
    );

    function tick() {
      currentX += (targetX - currentX) * 0.12;
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ------------------------------------------
     Category card stagger grouping
  ------------------------------------------ */

  function initCategoryStagger() {
    if (prefersReduced) return;
    const cards = gsap.utils.toArray(".categories__grid .cat-card");
    if (!cards.length) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".categories__grid",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* ------------------------------------------
     Feature cards stagger
  ------------------------------------------ */

  function initFeatureStagger() {
    if (prefersReduced) return;
    const cards = gsap.utils.toArray(".feature-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features__grid",
          start: "top 82%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* Extra scroll motion — section headers, lifestyle, promo, CTA */
  function initExtraMotion() {
    if (prefersReduced) return;

    // Section eyebrows slide-in from left
    gsap.utils.toArray(".section__eyebrow").forEach((el) => {
      if (el.closest(".hero") || el.closest(".technology")) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -28 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Lifestyle — simple fade up (VIZIO-style)
    const lifestyleHeader = document.querySelector(".lifestyle__title");
    if (lifestyleHeader) {
      gsap.fromTo(
        lifestyleHeader,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#lifestyle",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    gsap.utils.toArray(".lifestyle__card").forEach((item, i) => {
      gsap.fromTo(
        item,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          delay: i * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Promo: cinematic bg parallax + content presence
    const promoSection = document.querySelector(".promo");
    const promoBgImage = document.querySelector(".promo__bg-image");
    const promoInner = document.querySelector(".promo__inner");
    if (promoSection && promoBgImage && !prefersReduced) {
      gsap.fromTo(
        promoBgImage,
        { scale: 1.18, yPercent: -4 },
        {
          scale: 1.02,
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: promoSection,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.1,
          },
        }
      );
    }
    if (promoInner) {
      const promoCopy = promoInner.querySelectorAll(".promo__copy > *");
      const promoPanel = promoInner.querySelector(".promo__panel");
      if (promoCopy.length) {
        gsap.fromTo(
          promoCopy,
          { opacity: 0, y: 40, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: promoInner,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          }
        );
      }
      if (promoPanel) {
        gsap.fromTo(
          promoPanel,
          { opacity: 0, x: 48, rotateY: -6 },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            duration: 1.05,
            delay: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: promoInner,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          }
        );
        const rows = promoPanel.querySelectorAll(".emi-table tbody tr");
        if (rows.length) {
          gsap.fromTo(
            rows,
            { opacity: 0, x: 16 },
            {
              opacity: 1,
              x: 0,
              duration: 0.55,
              stagger: 0.07,
              ease: "power2.out",
              scrollTrigger: {
                trigger: promoPanel,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      }
    }

    // Explore tiles cascade
    const tiles = gsap.utils.toArray(".explore__tile");
    if (tiles.length) {
      gsap.fromTo(
        tiles,
        { opacity: 0, y: 50, rotateY: 8 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 0.85,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".explore__track",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Final CTA buttons pop
    const ctaActions = document.querySelector(".final-cta__actions");
    if (ctaActions) {
      gsap.fromTo(
        ctaActions.querySelectorAll(".btn"),
        { opacity: 0, y: 24, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: ctaActions,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Footer columns rise
    gsap.fromTo(
      ".footer__col",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".footer",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );

    // Showcase chips polish
    document.querySelectorAll(".showcase__chips").forEach((list) => {
      const items = list.querySelectorAll("span");
      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: list,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Soft scrub on section titles (desktop)
    if (!isMobile) {
      gsap.utils.toArray(".showcase__heading, .promo__title").forEach((title) => {
        gsap.to(title, {
          y: -18,
          ease: "none",
          scrollTrigger: {
            trigger: title,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      });
    }
  }

  /* ------------------------------------------
     Newsletter (UX only)
  ------------------------------------------ */

  function initNewsletter() {
    const form = document.getElementById("newsletterForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("newsletterEmail");
      if (input && input.value) {
        input.value = "";
        input.placeholder = "Thanks — you're on the list";
      }
    });
  }

  function initStatsCount() {
    if (prefersReduced) {
      document.querySelectorAll(".stats__num[data-count]").forEach((el) => {
        el.textContent = el.getAttribute("data-count");
      });
      return;
    }

    const section = document.getElementById("stats");
    if (!section) return;

    const nums = section.querySelectorAll(".stats__num[data-count]");
    let played = false;

    ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      onEnter: () => {
        if (played) return;
        played = true;
        nums.forEach((el) => {
          const target = parseInt(el.getAttribute("data-count"), 10) || 0;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.val);
            },
          });
        });
      },
    });
  }

  /* ------------------------------------------
     VOIR data-driven UI
  ------------------------------------------ */

  function el(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function modelCardHtml(m) {
    const seriesMeta = window.VOIR.series[m.series] || {};
    const qled = m.qled ? "QLED" : "Non-QLED";
    const chip = m.series === "additional" ? "chip--orange" : "chip--teal";
    const highlights = [
      "Resolution: " + (m.resolution || ""),
      "Panel: " + (m.panelType || "Pixel Pure Panel"),
      "OS: " + (m.os || ""),
      "Brightness: " + (m.peakBrightness || ""),
      "RAM & Storage: " + (m.ramStorage || ""),
    ]
      .map(escapeHtml)
      .join("<br>");
    return (
      '<article class="model-card model-card--' +
      escapeHtml(m.series) +
      '">' +
      '<div class="model-card__media"><img src="' +
      escapeHtml(m.image) +
      '" alt="' +
      escapeHtml(m.id) +
      '" /></div>' +
      '<div class="model-card__body">' +
      '<div class="model-card__meta">' +
      '<span class="chip ' +
      chip +
      '">' +
      escapeHtml(seriesMeta.name || m.series) +
      "</span>" +
      '<span class="chip">' +
      escapeHtml(m.size) +
      "</span>" +
      '<span class="chip ' +
      chip +
      '">' +
      qled +
      "</span>" +
      '<span class="chip">' +
      escapeHtml(m.resolutionLabel) +
      "</span></div>" +
      '<h3 class="model-card__id">' +
      escapeHtml(m.id) +
      "</h3>" +
      '<p class="model-card__facts">' +
      highlights +
      "</p>" +
      '<button type="button" class="btn btn--primary js-view-specs" data-series="' +
      escapeHtml(m.series) +
      '" data-model="' +
      escapeHtml(m.id) +
      '" data-cursor="Explore">View Specifications</button>' +
      '<a class="model-card__spec-link" href="tv.html?model=' +
      encodeURIComponent(m.id) +
      '">Open full page →</a>' +
      "</div></article>"
    );
  }

  function initFeatureTabs() {
    const tabs = el("featureTabs");
    const nameEl = el("featureName");
    const tagEl = el("featureTagline");
    const groupEl = el("featureGroup");
    const countEl = el("featureCount");
    const imageEl = el("featureImage");
    if (!tabs || !window.VOIR) return;

    const features = window.VOIR.features;
    const images = [
      "images/tv-hero.jpg",
      "images/zenith-55.jpg",
      "images/core-40.jpg",
      "images/lifestyle-1.jpg",
      "images/zenith-32.jpg",
      "images/core-55.jpg",
      "images/tv-angle.jpg",
      "images/lifestyle-2.jpg",
    ];
    let index = 0;
    let timer = null;

    function keepTabVisible(btn) {
      if (!btn || !tabs) return;
      // Only nudge the tabs row horizontally — never scroll the page.
      const overflowX = tabs.scrollWidth > tabs.clientWidth + 2;
      if (!overflowX) return;
      const btnLeft = btn.offsetLeft;
      const btnRight = btnLeft + btn.offsetWidth;
      const viewLeft = tabs.scrollLeft;
      const viewRight = viewLeft + tabs.clientWidth;
      if (btnLeft < viewLeft) {
        tabs.scrollTo({ left: btnLeft - 12, behavior: "smooth" });
      } else if (btnRight > viewRight) {
        tabs.scrollTo({ left: btnRight - tabs.clientWidth + 12, behavior: "smooth" });
      }
    }

    function show(i) {
      index = (i + features.length) % features.length;
      const f = features[index];
      let activeBtn = null;
      tabs.querySelectorAll(".feature-tab").forEach(function (btn, idx) {
        const on = idx === index;
        btn.classList.toggle("is-active", on);
        if (on) activeBtn = btn;
      });
      keepTabVisible(activeBtn);
      if (groupEl) groupEl.textContent = f.group;
      if (nameEl) nameEl.textContent = f.name;
      if (tagEl) tagEl.textContent = f.tagline;
      if (countEl) countEl.textContent = index + 1 + " / " + features.length;
      if (imageEl) {
        imageEl.src = images[index % images.length];
        imageEl.alt = f.name;
      }
    }

    tabs.innerHTML = features
      .map(function (f, i) {
        return (
          '<button type="button" class="feature-tab' +
          (i === 0 ? " is-active" : "") +
          '" role="tab" data-index="' +
          i +
          '">' +
          escapeHtml(f.name) +
          "</button>"
        );
      })
      .join("");

    tabs.addEventListener("click", function (e) {
      const btn = e.target.closest(".feature-tab");
      if (!btn) return;
      show(parseInt(btn.getAttribute("data-index"), 10));
      restart();
    });

    function restart() {
      if (timer) clearInterval(timer);
      if (prefersReduced) return;
      timer = setInterval(function () {
        show(index + 1);
      }, 4200);
    }

    show(0);
    restart();
  }

  function renderPromise() {
    const grid = el("promiseGrid");
    if (!grid || !window.VOIR) return;
    grid.innerHTML = window.VOIR.catalogue.pillars
      .map(function (col) {
        const items = col.items
          .map(function (it) {
            return (
              '<div class="promise-item"><strong>' +
              escapeHtml(it.name) +
              "</strong><span>" +
              escapeHtml(it.text) +
              "</span></div>"
            );
          })
          .join("");
        return (
          '<article class="promise-col"><h3>' +
          escapeHtml(col.title) +
          "</h3><p>" +
          escapeHtml(col.text) +
          "</p>" +
          items +
          "</article>"
        );
      })
      .join("");
  }

  function renderPointers() {
    const host = el("pointerGroups");
    if (!host || !window.VOIR) return;

    const meta = {
      Picture: {
        role: "hero",
        image: "images/lifestyle-1.jpg",
        className: "ptr--hero",
      },
      Sound: {
        role: "stack",
        image: "images/soundbar.jpg",
        className: "ptr--stack ptr--sound",
      },
      Processor: {
        role: "stack",
        image: "images/tech.jpg",
        className: "ptr--stack ptr--processor",
      },
      "Smart Features": {
        role: "band",
        image: "images/showcase-tv.jpg",
        className: "ptr--band",
      },
      Panel: {
        role: "pair",
        image: "images/zenith-55.jpg",
        className: "ptr--pair ptr--panel",
      },
      Aesthetics: {
        role: "pair",
        image: "images/remote.jpg",
        className: "ptr--pair ptr--aesthetics",
      },
    };

    const order = [
      "Picture",
      "Sound",
      "Processor",
      "Smart Features",
      "Panel",
      "Aesthetics",
    ];
    const byGroup = {};
    window.VOIR.pointers.forEach(function (g) {
      byGroup[g.group] = g;
    });

    host.innerHTML = order
      .map(function (name) {
        const g = byGroup[name];
        const m = meta[name];
        if (!g || !m) return "";
        const lead = g.items[0];
        const rest = g.items.slice(1);
        const secondaryLimit = m.role === "stack" ? 2 : m.role === "pair" ? 3 : 5;
        const specs =
          '<ul class="ptr__specs">' +
          (lead
            ? '<li class="is-lead">' + escapeHtml(lead.title) + "</li>"
            : "") +
          rest
            .slice(0, secondaryLimit)
            .map(function (it) {
              return "<li>" + escapeHtml(it.title) + "</li>";
            })
            .join("") +
          "</ul>";

        const media =
          '<div class="ptr__media"><img src="' +
          escapeHtml(m.image) +
          '" alt="" loading="lazy" /></div><div class="ptr__shade" aria-hidden="true"></div>';
        const body =
          '<div class="ptr__body">' +
          '<p class="ptr__label">' +
          escapeHtml(g.group) +
          "</p>" +
          '<h3 class="ptr__hero-spec">' +
          escapeHtml(lead ? lead.title : g.group) +
          "</h3>" +
          '<p class="ptr__desc">' +
          escapeHtml(lead ? lead.text : "") +
          "</p>" +
          specs +
          "</div>";

        return (
          '<article class="ptr ' +
          m.className +
          '" data-reveal="card">' +
          media +
          body +
          "</article>"
        );
      })
      .join("");
  }

  function renderCompareTable(seriesId, focusModelId) {
    const panel = el("comparePanel");
    if (!panel || !window.VOIR) return;
    const models = window.VOIR.modelsBySeries(seriesId);
    if (!models.length) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    const seriesName = window.VOIR.series[seriesId].name;
    const groupOrder = ["Display", "Sound", "Features", "Hardware", "Smart Features", "Additional"];
    const groupsHtml = groupOrder
      .map(function (group) {
        const labelSet = [];
        models.forEach(function (m) {
          const rows = (m.specs && m.specs[group]) || [];
          rows.forEach(function (row) {
            if (labelSet.indexOf(row[0]) === -1) labelSet.push(row[0]);
          });
        });
        if (!labelSet.length) return "";
        const head =
          "<thead><tr><th>Specification</th>" +
          models
            .map(function (m) {
              const active = m.id === focusModelId ? " is-focus" : "";
              return '<th class="' + active.trim() + '">' + escapeHtml(m.id) + "</th>";
            })
            .join("") +
          "</tr></thead>";
        const body =
          "<tbody>" +
          labelSet
            .map(function (label) {
              return (
                "<tr><th>" +
                escapeHtml(label) +
                "</th>" +
                models
                  .map(function (m) {
                    const rows = (m.specs && m.specs[group]) || [];
                    const found = rows.find(function (r) {
                      return r[0] === label;
                    });
                    const val = found ? found[1] : "—";
                    const display = val === "" ? "—" : val;
                    return "<td>" + escapeHtml(display) + "</td>";
                  })
                  .join("") +
                "</tr>"
              );
            })
            .join("") +
          "</tbody>";
        return (
          '<div class="compare-group"><h3>' +
          escapeHtml(group) +
          '</h3><div class="compare-wrap"><table class="compare-table">' +
          head +
          body +
          "</table></div></div>"
        );
      })
      .join("");

    panel.hidden = false;
    panel.innerHTML =
      '<div class="compare-panel__head">' +
      "<div><p class=\"section__eyebrow\">Compare</p><h2 class=\"section__title\" style=\"font-size:1.5rem\">" +
      escapeHtml(seriesName) +
      " specifications</h2></div>" +
      '<button type="button" class="btn btn--secondary" id="compareClose">Close</button>' +
      "</div>" +
      groupsHtml;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    const closeBtn = el("compareClose");
    if (closeBtn) {
      closeBtn.onclick = function () {
        panel.hidden = true;
        panel.innerHTML = "";
      };
    }
  }

  function renderModelGrid(seriesId) {
    const grid = el("modelGrid");
    if (!grid || !window.VOIR) return;
    const list = window.VOIR.modelsBySeries(seriesId);
    grid.innerHTML = list.map(modelCardHtml).join("");
  }

  function initSeriesTabs() {
    const tabs = el("seriesTabs");
    if (!tabs) return;
    let series = window.VOIR.resolveSeriesId(location.hash || "zenith");
    tabs.querySelectorAll(".series-tab").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-series") === series);
    });
    renderModelGrid(series);
    tabs.addEventListener("click", function (e) {
      const btn = e.target.closest(".series-tab");
      if (!btn) return;
      series = btn.getAttribute("data-series");
      tabs.querySelectorAll(".series-tab").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      history.replaceState(null, "", "#" + series);
      renderModelGrid(series);
      const panel = el("comparePanel");
      if (panel) {
        panel.hidden = true;
        panel.innerHTML = "";
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });

    const products = el("products");
    if (products) {
      products.addEventListener("click", function (e) {
        const btn = e.target.closest(".js-view-specs");
        if (!btn) return;
        const sid = btn.getAttribute("data-series");
        const mid = btn.getAttribute("data-model");
        renderCompareTable(sid, mid);
      });
    }
  }

  function renderSpecPage() {
    const root = el("specRoot");
    if (!root || !window.VOIR) return;
    const params = new URLSearchParams(location.search);
    const id = params.get("model");
    const m = id ? window.VOIR.getModel(id) : null;
    if (!m) {
      root.innerHTML =
        '<div class="section__header"><p class="section__eyebrow">Specifications</p><h1 class="section__title">Select a model</h1><p class="section__lead"><a href="tvs.html">Browse TVs</a></p></div>';
      return;
    }
    document.title = m.id + " — VOIR Specifications";
    const chips =
      '<div class="model-card__meta" style="margin:16px 0">' +
      '<span class="chip">' +
      escapeHtml(m.size) +
      '</span><span class="chip ' +
      (m.series === "additional" ? "chip--orange" : "chip--teal") +
      '">' +
      (m.qled ? "QLED" : "Non-QLED") +
      '</span><span class="chip">' +
      escapeHtml(m.resolutionLabel) +
      '</span><span class="chip">' +
      escapeHtml(m.os) +
      "</span></div>";
    const groups = Object.keys(m.specs)
      .map(function (group) {
        const rows = m.specs[group]
          .map(function (row) {
            const value = row[1] === "" || row[1] == null ? "—" : row[1];
            return "<tr><th>" + escapeHtml(row[0]) + "</th><td>" + escapeHtml(value) + "</td></tr>";
          })
          .join("");
        return (
          '<div class="spec-group"><h3>' +
          escapeHtml(group) +
          '</h3><div class="spec-wrap"><table class="spec-table">' +
          rows +
          "</table></div></div>"
        );
      })
      .join("");
    root.innerHTML =
      '<div class="spec-hero">' +
      '<div class="spec-hero__media"><img src="' +
      escapeHtml(m.image) +
      '" alt="' +
      escapeHtml(m.id) +
      '" /></div>' +
      "<div><p class=\"section__eyebrow\">" +
      escapeHtml(window.VOIR.series[m.series].name) +
      "</p><h1 class=\"section__title\">" +
      escapeHtml(m.id) +
      "</h1>" +
      chips +
      '<p class="section__lead" style="margin-top:16px">' +
      escapeHtml(m.processor) +
      "</p>" +
      '<a href="tvs.html#' +
      m.series +
      '" class="btn btn--secondary" style="margin-top:16px">Back to series</a></div></div>' +
      '<div style="margin-top:48px">' +
      groups +
      "</div>";
  }

  function renderAbout() {
    if (!window.VOIR) return;
    const copy = el("aboutCopy");
    if (copy) {
      const story = (window.VOIR.about.storyline || [])
        .map(function (p) {
          return "<p style=\"margin-bottom:16px\">" + escapeHtml(p) + "</p>";
        })
        .join("");
      const aboutUs =
        '<h3 style="margin:32px 0 16px;font-size:1.25rem">About Us</h3>' +
        (window.VOIR.about.aboutUs || [])
          .map(function (p) {
            return "<p style=\"margin-bottom:16px\">" + escapeHtml(p) + "</p>";
          })
          .join("");
      copy.innerHTML = story + aboutUs;
    }
    const values = el("valuesGrid");
    if (values) {
      values.innerHTML = window.VOIR.about.values
        .map(function (v) {
          return (
            '<article class="value-card"><h3>' +
            escapeHtml(v.title) +
            "</h3><p>" +
            escapeHtml(v.text) +
            "</p></article>"
          );
        })
        .join("");
    }
    const mission = el("missionText");
    const vision = el("visionText");
    if (mission) mission.textContent = window.VOIR.about.mission;
    if (vision) vision.textContent = window.VOIR.about.vision;
    const team = el("teamGrid");
    if (team) {
      team.innerHTML = window.VOIR.team
        .map(function (person) {
          const paras = person.paragraphs
            .map(function (p) {
              return "<p>" + escapeHtml(p) + "</p>";
            })
            .join("");
          return (
            '<article class="team-card"><h3>' +
            escapeHtml(person.name) +
            "</h3>" +
            paras +
            "</article>"
          );
        })
        .join("");
    }
  }

  function initRecruitForm() {
    const form = el("recruitForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const status = el("recruitStatus");
      const email = window.VOIR.contacts.email;
      if (status) {
        status.textContent =
          "Thank you. Please also send your resume to " + email + ".";
      }
      form.reset();
    });
  }

  function initSupportTabs() {
    const tabs = el("supportTabs");
    if (!tabs || !window.VOIR) return;

    const c = window.VOIR.contacts;
    const social = window.VOIR.social;
    const serviceLink = el("supportServiceLink");
    const emailLink = el("supportEmailLink");
    const callLink = el("supportCallLink");
    const businessLink = el("supportBusinessLink");
    const socialHost = el("supportSocial");

    if (serviceLink && c.serviceForm) serviceLink.href = c.serviceForm;
    if (emailLink && c.email) {
      emailLink.href = "mailto:" + c.email;
      emailLink.textContent = c.email;
    }
    if (callLink && c.phoneHref) {
      callLink.href = c.phoneHref;
      callLink.textContent = c.phone;
    }
    if (businessLink && c.businessEmail) {
      businessLink.href = "mailto:" + c.businessEmail;
      businessLink.textContent = c.businessEmail;
    }
    if (socialHost && social) {
      socialHost.innerHTML =
        '<a href="' +
        escapeHtml(social.instagram) +
        '" class="footer__social-link" target="_blank" rel="noopener" aria-label="Instagram">IG</a>' +
        '<a href="' +
        escapeHtml(social.facebook) +
        '" class="footer__social-link" target="_blank" rel="noopener" aria-label="Facebook">FB</a>';
    }

    function show(id) {
      tabs.querySelectorAll(".support-tab").forEach(function (btn) {
        const on = btn.getAttribute("data-support-tab") === id;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.querySelectorAll(".support-panel").forEach(function (panel) {
        const on = panel.id === "support-panel-" + id;
        panel.classList.toggle("is-active", on);
        if (on) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
    }

    tabs.addEventListener("click", function (e) {
      const btn = e.target.closest(".support-tab");
      if (!btn) return;
      show(btn.getAttribute("data-support-tab"));
    });

    show("service");
  }

  /* ------------------------------------------
     Boot
  ------------------------------------------ */

  async function boot() {
    renderFeaturedSlider();
    renderPromise();
    renderPointers();
    initFeatureTabs();
    initSeriesTabs();
    renderSpecPage();
    renderAbout();
    initRecruitForm();
    initSupportTabs();

    prepareSplits();
    initNav();
    initLenis();
    bindAnchorFallback();
    initNewsletter();

    await runPreloader();

    animateHero();
    initFeaturedSlider();
    initScrollReveals();
    initParallax();
    initTechnology();
    initExploreDrag();
    initCategoryStagger();
    initFeatureStagger();
    initExtraMotion();
    initStatsCount();

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
