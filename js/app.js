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

      const done = function () {
        document.body.classList.remove("is-loading");
        if (preloader && preloader.parentNode) {
          preloader.remove();
        }
        resolve();
      };

      if (!preloader || prefersReduced || !window.gsap) {
        done();
        return;
      }

      document.body.classList.add("is-loading");

      let settled = false;
      const finish = function () {
        if (settled) return;
        settled = true;
        done();
      };

      const setLoadProgress = function (raw) {
        const v = Math.max(0, Math.min(100, Math.round(raw)));
        const remain = 100 - v;
        if (logoFill) {
          gsap.set(logoFill, { clipPath: "inset(0 " + remain + "% 0 0)" });
        }
        if (progress) gsap.set(progress, { scaleX: v / 100 });
        if (percent) percent.textContent = v + "%";
      };

      try {
        if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
        if (progressWrap) gsap.set(progressWrap, { opacity: 0, scaleX: 0.88 });
        if (percent) gsap.set(percent, { opacity: 0, y: 10 });
        if (brand) gsap.set(brand, { opacity: 0, y: 18 });
        setLoadProgress(0);

        const counter = { value: 0 };
        const tl = gsap.timeline({
          onComplete: finish,
          onError: finish,
        });

        if (brand) {
          tl.to(brand, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
          });
        }

        if (progressWrap) {
          tl.to(
            progressWrap,
            {
              opacity: 1,
              scaleX: 1,
              duration: 0.4,
              ease: "power2.out",
            },
            "-=0.2"
          );
        }

        if (percent) {
          tl.to(
            percent,
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              ease: "power2.out",
            },
            "<"
          );
        }

        tl.to(counter, {
          value: 100,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: function () {
            setLoadProgress(counter.value);
          },
        });

        tl.to(preloader, {
          opacity: 0,
          duration: 0.45,
          ease: "power2.in",
        });
      } catch (err) {
        finish();
      }

      window.setTimeout(finish, 3200);
    });
  }

  /* ------------------------------------------
     Navigation
  ------------------------------------------ */

  function initNav() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const drawer = document.getElementById("navDrawer");
    if (!nav) return;

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        if (nav.classList.contains("is-menu-open")) return;

        if (y > 60) nav.classList.add("is-scrolled");
        else if (!nav.classList.contains("nav--inner")) nav.classList.remove("is-scrolled");

        nav.classList.remove("is-hidden");
      },
    });

    if (toggle && drawer) {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const open = !drawer.classList.contains("is-open");
        setMobileNavOpen(open);
      });

      drawer.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", closeMobileNav);
      });
    }
  }

  function setMobileNavOpen(open) {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const drawer = document.getElementById("navDrawer");
    if (!drawer) return;

    if (open) {
      drawer.hidden = false;
      requestAnimationFrame(function () {
        drawer.classList.add("is-open");
      });
    } else {
      drawer.classList.remove("is-open");
      window.setTimeout(function () {
        if (!drawer.classList.contains("is-open")) drawer.hidden = true;
      }, 280);
    }

    if (toggle) {
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (nav) {
      nav.classList.toggle("is-menu-open", open);
      if (open) nav.classList.remove("is-hidden");
    }
    document.body.classList.toggle("nav-drawer-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  /* ------------------------------------------
     Hero entrance
  ------------------------------------------ */

  function animateHero() {
    const title = document.querySelector(".hero__title");
    const eyebrow = document.querySelector(".hero__eyebrow");
    const desc = document.querySelector(".hero__desc");
    const features = document.querySelector(".hero__features");
    const scrollHint = document.querySelector(".hero__scroll");
    const deck = document.querySelector(".hero__deck");
    const rail = document.querySelector(".hero__rail");
    const bgImage = document.querySelector(".hero__bg-slide.is-active");
    const overlay = document.querySelector(".hero__bg-overlay");

    if (prefersReduced) {
      revealImmediate();
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    if (bgImage) {
      gsap.fromTo(
        bgImage,
        { scale: 1.2, opacity: 0.4, filter: "brightness(0.7)" },
        { scale: 1, opacity: 1, filter: "brightness(1)", duration: 2.4, ease: "power2.out" }
      );
    }

    if (overlay) {
      gsap.fromTo(overlay, { opacity: 0.35 }, { opacity: 1, duration: 1.6, ease: "power2.out" });
    }

    if (eyebrow) {
      gsap.set(eyebrow, { opacity: 0, y: 24, letterSpacing: "0.28em" });
      tl.to(eyebrow, { opacity: 1, y: 0, letterSpacing: "0.18em", duration: 0.9 }, 0.12);
    }

    if (title) {
      gsap.set(title, { opacity: 0, y: 36 });
      tl.to(title, { opacity: 1, y: 0, duration: 1.05 }, 0.22);
    }

    if (desc) {
      gsap.set(desc, { opacity: 0, y: 24, filter: "blur(6px)" });
      tl.to(desc, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9 }, 0.45);
    }

    if (features) {
      const items = features.querySelectorAll("li");
      gsap.set(items, { opacity: 0, y: 16 });
      tl.to(items, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 }, 0.62);
    }

    if (rail) {
      gsap.set(rail, { opacity: 0 });
      tl.to(rail, { opacity: 1, duration: 0.8 }, 0.7);
    }

    if (scrollHint) {
      gsap.set(scrollHint, { opacity: 0, y: 10 });
      tl.to(scrollHint, { opacity: 1, y: 0, duration: 0.7 }, 0.9);
    }

    if (deck) {
      gsap.set(deck, { opacity: 0, y: 24 });
      tl.to(deck, { opacity: 1, y: 0, duration: 0.85 }, 0.85);
    }
  }

  /* ------------------------------------------
     Featured horizontal slider
  ------------------------------------------ */

  function renderFeaturedSlider() {
    const track = el("featTrack");
    const dotsHost = el("featDots");
    if (!track || !window.VOIR) return;
    const popularId = "VTN65CH2EB";
    const order = [
      "VTQ32CH2EB",
      "VTQ40CH2EB",
      "VTQ43CH2EB",
      "VTN55CH2EB",
      "VTN65CH2EB",
      "VR32FLG12KQ",
      "VR43FLG12KQ",
      "VR55FLG14KQ",
      "VR65FLG14KQ",
    ];
    const byId = {};
    window.VOIR.models.forEach(function (m) {
      byId[m.id] = m;
    });
    const picks = order
      .map(function (id) {
        return byId[id];
      })
      .filter(Boolean);

    track.innerHTML = picks
      .map(function (m) {
        const seriesName = window.VOIR.series[m.series].name;
        const seriesClass =
          m.series === "core" || m.series === "vantage" ? "feat-slide--core" : "feat-slide--zenith";
        const isPopular = m.id === popularId;
        const qledBadge =
          m.resolutionLabel === "UHD"
            ? "images/badges/qled-uhd.svg"
            : m.resolutionLabel === "FHD"
              ? "images/badges/qled-fhd.svg"
              : "images/badges/qled-hd.svg";
        const badges =
          m.series === "zenith"
            ? [
                { src: qledBadge, alt: "QLED " + m.resolutionLabel },
                { src: "images/badges/google-tv.svg", alt: "Google TV" },
                { src: "images/badges/dolby-audio.svg", alt: "Dolby Audio" },
              ]
            : [
                { src: qledBadge, alt: "QLED " + m.resolutionLabel },
                { src: "images/badges/google-tv.svg", alt: "Google TV" },
                { src: "images/badges/android-14.svg", alt: "Android 14" },
              ];
        const chips =
          '<div class="feat-slide__chips">' +
          badges
            .map(function (b) {
              return (
                '<img class="feat-slide__logo" src="' +
                escapeHtml(b.src) +
                '" alt="' +
                escapeHtml(b.alt) +
                '" loading="lazy" />'
              );
            })
            .join("") +
          "</div>";

        return (
          '<article class="feat-slide ' +
          seriesClass +
          (isPopular ? " feat-slide--popular" : "") +
          '" data-model="' +
          escapeHtml(m.id) +
          '">' +
          '<span class="feat-slide__size">' +
          escapeHtml(m.size) +
          "</span>" +
          (isPopular ? '<span class="feat-slide__badge">★ Most Popular</span>' : "") +
          '<div class="feat-slide__media"><img src="' +
          escapeHtml(m.image) +
          '" alt="' +
          escapeHtml(m.id) +
          '" loading="lazy" /></div>' +
          '<div class="feat-slide__body">' +
          '<span class="feat-slide__series">' +
          escapeHtml(seriesName) +
          "</span>" +
          '<h3 class="feat-slide__model">' +
          escapeHtml(m.id) +
          "</h3>" +
          '<p class="feat-slide__specs">' +
          (m.qled ? "QLED" : "LED") +
          " · " +
          escapeHtml(m.resolutionLabel) +
          " · " +
          escapeHtml(m.os) +
          "</p>" +
          chips +
          '<a href="tv.html?model=' +
          encodeURIComponent(m.id) +
          '" class="feat-slide__link">View Specifications →</a>' +
          "</div></article>"
        );
      })
      .join("");

    if (dotsHost) {
      const dotCount = Math.min(4, picks.length);
      dotsHost.innerHTML = Array.from({ length: dotCount })
        .map(function (_, i) {
          return (
            '<button type="button" class="featured-slider__dot' +
            (i === 0 ? " is-active" : "") +
            '" data-feat-dot="' +
            i +
            '" aria-label="Slide group ' +
            (i + 1) +
            '"></button>'
          );
        })
        .join("");
    }
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
    const mobileMq = window.matchMedia("(max-width: 900px)");
    function isMobileSlider() {
      return mobileMq.matches;
    }
    const autoSpeed = prefersReduced ? 0 : 0.45;
    const ease = 0.12;

    function measure() {
      slides = Array.from(track.querySelectorAll(".feat-slide"));
      if (slides.length < 2) return;

      if (isMobileSlider()) {
        // Force a stable card width, then pad sides so the active card can sit dead-center.
        const cardW = Math.min(wrap.clientWidth - 48, Math.round(wrap.clientWidth * 0.82));
        slides.forEach(function (slide) {
          slide.style.flex = "0 0 " + cardW + "px";
          slide.style.width = cardW + "px";
          slide.style.maxWidth = cardW + "px";
          slide.style.margin = "0";
        });
        track.style.gap = "16px";
        const sidePad = Math.max(24, (wrap.clientWidth - cardW) / 2);
        track.style.paddingLeft = sidePad + "px";
        track.style.paddingRight = sidePad + "px";
        track.style.paddingTop = "20px";
        track.style.paddingBottom = "28px";
      } else {
        slides.forEach(function (slide) {
          slide.style.flex = "";
          slide.style.width = "";
          slide.style.maxWidth = "";
          slide.style.margin = "";
        });
        track.style.gap = "";
        track.style.paddingLeft = "";
        track.style.paddingRight = "";
        track.style.paddingTop = "";
        track.style.paddingBottom = "";
      }

      const half = Math.floor(slides.length / 2);
      setWidth = slides[half].offsetLeft - slides[0].offsetLeft;
    }

    function centerOnSlide(slide) {
      if (!slide || !wrap.clientWidth) return;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const next = wrapX(-(slideCenter - wrap.clientWidth / 2));
      x = next;
      targetX = next;
      snapMode = true;
    }

    function wrapX(value) {
      if (!setWidth) return value;
      while (value <= -setWidth) value += setWidth;
      while (value > 0) value -= setWidth;
      return value;
    }

    // Overlapping coverflow — center card on top, like the mock
    function paintSlides() {
      if (!setWidth) return;
      const viewCenter = -x + wrap.clientWidth / 2;
      const narrow = isMobileSlider();
      let best = null;
      let bestAbs = Infinity;
      let bestIndex = 0;

      slides.forEach(function (slide, i) {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const offset = (slideCenter - viewCenter) / Math.max(wrap.clientWidth * 0.34, 1);
        const t = Math.max(-1.2, Math.min(1.2, offset));
        const abs = Math.min(1, Math.abs(t));

        if (narrow) {
          slide.style.transform = "none";
          slide.style.opacity = abs < 0.5 ? "1" : "0.55";
          slide.style.zIndex = String(Math.round((1 - abs) * 40));
        } else {
          const scale = 1.14 - abs * 0.22;
          const opacity = 1 - abs * 0.2;
          const rotateY = t * -14;
          const lift = (1 - abs) * 12;
          const pull = t * -36;

          slide.style.transform =
            "translateX(" +
            pull +
            "px) translateY(" +
            -lift +
            "px) rotateY(" +
            rotateY +
            "deg) scale(" +
            scale +
            ")";
          slide.style.opacity = String(Math.max(0.7, opacity));
          slide.style.zIndex = String(Math.round((1 - abs) * 40));
        }

        if (abs < bestAbs) {
          bestAbs = abs;
          best = slide;
          bestIndex = i % count;
        }
      });

      slides.forEach(function (slide) {
        slide.classList.toggle("is-active", slide === best);
      });

      const dots = document.querySelectorAll("#featDots .featured-slider__dot");
      if (dots.length) {
        const activeDot = Math.min(
          dots.length - 1,
          Math.floor((bestIndex / Math.max(count, 1)) * dots.length)
        );
        dots.forEach(function (dot, d) {
          dot.classList.toggle("is-active", d === activeDot);
        });
      }
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
      pauseAuto(isMobileSlider() ? 0 : 2800);
      if (isMobileSlider()) paused = true;
      const step = setWidth / count;
      targetX = wrapX(targetX - dir * step);
    }

    measure();
    // Start like the mock: center card highlighted (65" Core)
    const startId = "VTN65CH2EB";
    let startSlide =
      slides.find(function (s) {
        return s.getAttribute("data-model") === startId;
      }) || slides[Math.min(3, count - 1)];

    function bootPosition() {
      measure();
      if (startSlide && startSlide.isConnected) {
        centerOnSlide(startSlide);
      } else {
        x = wrapX(-setWidth * 0.12);
        targetX = x;
      }
      if (isMobileSlider()) {
        snapMode = true;
        paused = true;
      } else {
        snapMode = true;
        pauseAuto(3600);
      }
      paintSlides();
    }

    bootPosition();
    requestAnimationFrame(bootPosition);

    window.addEventListener("resize", function () {
      const current =
        track.querySelector(".feat-slide.is-active") ||
        slides.find(function (s) {
          return s.getAttribute("data-model") === startId;
        }) ||
        slides[0];
      measure();
      if (current) centerOnSlide(current);
      if (isMobileSlider()) paused = true;
      paintSlides();
    });

    const prev = document.getElementById("featPrev");
    const next = document.getElementById("featNext");
    prev && prev.addEventListener("click", function () { stepBy(-1); });
    next && next.addEventListener("click", function () { stepBy(1); });

    const dotsHost = document.getElementById("featDots");
    if (dotsHost) {
      dotsHost.addEventListener("click", function (e) {
        const dot = e.target.closest("[data-feat-dot]");
        if (!dot || !count) return;
        const di = Number(dot.getAttribute("data-feat-dot"));
        const targetIndex = Math.min(
          count - 1,
          Math.round((di / Math.max(dotsHost.children.length - 1, 1)) * (count - 1))
        );
        snapMode = true;
        if (isMobileSlider()) paused = true;
        else pauseAuto(2800);
        const slide = slides[targetIndex];
        if (!slide) return;
        centerOnSlide(slide);
      });
    }

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
      if (isMobileSlider()) paused = true;
      else pauseAuto(2400);
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
      if (isMobileSlider()) return;
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
        // Mobile stays snapped — no free autoplay drift.
        if (!isMobileSlider() && !paused && !snapMode) {
          targetX -= autoSpeed;
        }
        targetX = wrapX(targetX);
        x += (targetX - x) * (snapMode || paused || isMobileSlider() ? ease : 0.2);
        x = wrapX(x);
        if (!isMobileSlider() && !paused && !snapMode) targetX = x;
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

    gsap.utils
      .toArray('[data-reveal="fade"], [data-reveal="card"]')
      .filter(
        (el) =>
          !el.closest(".hero") &&
          !el.closest(".technology") &&
          !el.closest(".lifestyle") &&
          !el.classList.contains("cat-card") &&
          !el.classList.contains("feature-card") &&
          !el.classList.contains("showcase__item")
      )
      .forEach((el) => {
        const isCard = el.getAttribute("data-reveal") === "card";
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: isCard ? 72 : 48,
            scale: isCard ? 0.96 : 1,
            filter: isCard ? "blur(8px)" : "blur(0px)",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: isCard ? 1.2 : 1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              toggleActions: "play none none none",
            },
          }
        );
      });

    gsap.utils.toArray('[data-reveal="clip"]').forEach((el) => {
      if (el.closest(".hero")) return;
      gsap.fromTo(
        el,
        { clipPath: "inset(14% 14% 14% 14% round 28px)", opacity: 0.35 },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          opacity: 1,
          duration: 1.75,
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
          duration: 1.65,
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
          { scale: 1.14, x: -36 },
          {
            scale: 1,
            x: 0,
            duration: 2,
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
          duration: 1.65,
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
          { scale: 1.14, x: 36 },
          {
            scale: 1,
            x: 0,
            duration: 2,
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

    gsap.utils.toArray(".cat-card__img, .lifestyle__media img").forEach((img) => {
      gsap.fromTo(
        img,
        { scale: 1.12, opacity: 0.55 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.45,
          ease: "power3.out",
          scrollTrigger: {
            trigger: img.closest(".cat-card, .lifestyle__card") || img,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    document.querySelectorAll('[data-split="lines"], [data-split="words"]').forEach((el) => {
      if (el.closest(".hero")) return;
      const inners = el.querySelectorAll(".split-word > span, .split-line > span");
      if (!inners.length) return;
      gsap.fromTo(
        inners,
        { y: "120%" },
        {
          y: "0%",
          duration: 1.3,
          stagger: 0.06,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 84%",
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
        const heroBg = document.querySelector(".hero__bg-slide.is-active, .hero__bg-image");
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
      { opacity: 0, y: 80, scale: 0.94, rotateX: 6 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        duration: 1.15,
        stagger: 0.16,
        ease: "expo.out",
        transformOrigin: "center bottom",
        scrollTrigger: {
          trigger: ".categories__grid",
          start: "top 78%",
          toggleActions: "play none none none",
        },
      }
    );

    cards.forEach((card) => {
      const badge = card.querySelector(".cat-card__badge");
      const cta = card.querySelector(".cat-card__cta");
      if (badge) {
        gsap.fromTo(
          badge,
          { opacity: 0, y: -12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }
      if (cta) {
        gsap.fromTo(
          cta,
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            delay: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });
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

    // Section eyebrows — premium letter-spacing settle
    gsap.utils.toArray(".section__eyebrow").forEach((el) => {
      if (el.closest(".hero") || el.closest(".technology")) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 18, letterSpacing: "0.28em" },
        {
          opacity: 1,
          y: 0,
          letterSpacing: "0.14em",
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    /* Featured slider entrance */
    gsap.utils.toArray("#featTrack .feat-slide").slice(0, 6).forEach((slide, i) => {
      gsap.fromTo(
        slide,
        { opacity: 0, y: 48, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          delay: i * 0.06,
          ease: "expo.out",
          scrollTrigger: {
            trigger: "#featured-slider",
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    /* Feature panel settle */
    const featurePanel = document.getElementById("featurePanel");
    if (featurePanel) {
      gsap.fromTo(
        featurePanel,
        { opacity: 0, y: 56, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: featurePanel,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    /* Showcase 3D series rows — never hide content; only enhance */
    gsap.utils.toArray(".showcase__item").forEach((item, i) => {
      const stage = item.querySelector(".showcase__stage");
      const copy = item.querySelector(".showcase__copy");
      const unit = item.querySelector(".tv3d__unit");
      const fromLeft = i % 2 === 0;

      gsap.set([stage, copy].filter(Boolean), { clearProps: "opacity" });
      if (copy) gsap.set(copy.children, { clearProps: "opacity" });

      if (stage) {
        gsap.from(stage, {
          x: fromLeft ? -48 : 48,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: item,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });
      }

      if (unit) {
        const endY = fromLeft ? -18 : 18;
        gsap.fromTo(
          unit,
          { rotateY: fromLeft ? -28 : 28, rotateX: 12 },
          {
            rotateY: endY,
            rotateX: 8,
            duration: 1.25,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (copy) {
        gsap.from(copy.children, {
          y: 22,
          duration: 0.75,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }
    });

    /* Promise cards — fade only so cards stay level */
    const promiseCards = gsap.utils.toArray("#promiseGrid > *");
    if (promiseCards.length) {
      gsap.from(promiseCards, {
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: "#promiseGrid",
          start: "top 82%",
          toggleActions: "play none none none",
        },
      });
    }

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
    const finalCta = document.querySelector(".final-cta");
    if (finalCta) {
      gsap.fromTo(
        finalCta.querySelectorAll(".section__eyebrow, .final-cta__title, .final-cta__desc"),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.15,
          stagger: 0.14,
          ease: "expo.out",
          scrollTrigger: {
            trigger: finalCta,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    const ctaActions = document.querySelector(".final-cta__actions");
    if (ctaActions) {
      gsap.fromTo(
        ctaActions.querySelectorAll(".btn"),
        { opacity: 0, y: 28, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "back.out(1.5)",
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

    // Showcase size pills — keep visible, add soft rise only
    document.querySelectorAll(".showcase__sizes").forEach((list) => {
      const items = list.querySelectorAll("span");
      gsap.from(items, {
        y: 8,
        duration: 0.45,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: list,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Soft scrub on promo title only (desktop)
    if (!isMobile) {
      gsap.utils.toArray(".promo__title").forEach((title) => {
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
    const chip = m.series === "core" || m.series === "vantage" ? "chip--orange" : "chip--teal";
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
    const descEl = el("featureDesc");
    const ctaEl = el("featureCta");
    const dashesEl = el("featureDashes");
    const pillsEl = el("featurePills");
    const prevBtn = el("featurePrev");
    const nextBtn = el("featureNext");
    if (!tabs || !window.VOIR) return;

    const source = window.VOIR.features.slice();
    const voiosIdx = source.findIndex(function (f) {
      return f.id === "voios";
    });
    if (voiosIdx > 0) {
      const [voios] = source.splice(voiosIdx, 1);
      source.unshift(voios);
    }
    // Showcase row matches the mock density — first 10, still all via arrows if needed
    const features = source.length > 10 ? source.slice(0, 10) : source;

    // Unique dark lifestyle visuals per slide
    const images = [
      "images/showcase-tv.jpg",
      "images/tech-card-1.jpg",
      "images/tv-hero.jpg",
      "images/bg-hero.jpg",
      "images/tech-card-2.jpg",
      "images/slide-1.jpg",
      "images/hero-tv.jpg",
      "images/tech-card-3.jpg",
      "images/category-tvs.jpg",
      "images/slide-3.jpg",
    ];

    const frame = function (inner) {
      return (
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<rect x="3" y="7" width="12" height="10" rx="1.6" stroke="currentColor" stroke-width="1.6"/>' +
        '<path d="M8 5.5h10.5A1.5 1.5 0 0 1 20 7v8.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
        '<circle cx="7.2" cy="10.2" r="1.05" fill="currentColor"/>' +
        inner +
        "</svg>"
      );
    };

    const tabIcons = [
      frame('<path d="M4.8 15.2l2.6-2.4 1.7 1.5 2.5-2.8 2.2 3.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'),
      frame('<path d="M5.2 13.2h7.6M5.2 15.4h5.2" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/>'),
      frame('<path d="M10.8 12.4l.85 1.85 1.95.15-1.5 1.35.5 1.9-1.8-1-1.8 1 .5-1.9-1.5-1.35 1.95-.15.85-1.85z" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/>'),
      frame('<path d="M4.8 13c1.35-1.35 2.55-1.35 3.9 0s2.55 1.35 3.9 0M4.8 15.4c1.35-1.35 2.55-1.35 3.9 0s2.55 1.35 3.9 0" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>'),
      frame('<path d="M6 15.5V13.1M8.5 15.5v-4.1M11 15.5v-2.3" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>'),
      frame('<path d="M4.8 15.2l2.6-2.4 1.7 1.5 2.5-2.8 2.2 3.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'),
      frame('<circle cx="9.2" cy="13.8" r="2" stroke="currentColor" stroke-width="1.35"/><path d="M9.2 11.8v4M7.2 13.8h4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>'),
      frame('<circle cx="9.2" cy="13.6" r="1.7" stroke="currentColor" stroke-width="1.35"/><path d="M9.2 10.6v.7M9.2 15.9v.7M6.2 13.6h.7M11.5 13.6h.7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>'),
      frame('<path d="M5 14.2l4.2-2.4 4.2 2.4-4.2 2.4L5 14.2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M5.8 12.4l3.4-1.9 3.4 1.9" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>'),
      frame('<path d="M4.8 15.4l2.8-3.2 1.8 1.6 2.8-3.6 2 5.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'),
    ];

    const pillIcons = [
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.7"/><path d="M5.5 19.2c1.2-3.2 3.4-4.8 6.5-4.8s5.3 1.6 6.5 4.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.2 6.2l1.6 1.6M16.2 16.2l1.6 1.6M17.8 6.2l-1.6 1.6M7.8 16.2l-1.6 1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.7"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.7"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19.5a7.5 7.5 0 1 0-7.2-9.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 12l4.2-4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/></svg>',
    ];

    // Per-slide copy matching the VoiOS card structure
    const slideMeta = {
      voios: {
        group: "Smart OS",
        desc: "Personalised recommendations, effortless navigation, and all your favourite apps in one place — so every night feels made for you.",
        pills: ["Personalised Experience", "Easy Navigation", "All Your Apps In One Place", "Faster Performance"],
      },
      quartz: {
        group: "Display",
        desc: "A zero-dot panel with wide colour gamut — so every scene looks full, smooth, and true, without the screen getting in the way.",
        pills: ["Zero Visible Dots", "Wide Colour Gamut", "True-to-Life Picture", "Cinematic Clarity"],
      },
      swiftmind: {
        group: "CPU",
        desc: "A faster brain for your TV — apps open quicker, menus stay smooth, and everyday use feels light from the first tap.",
        pills: ["Faster Thinking", "Quicker Loading", "Smoother Navigation", "Lag-Free Everyday Use"],
      },
      truehue: {
        group: "GPU",
        desc: "Pixel-by-pixel colour processing that keeps tones natural and rich — so what you watch looks closer to how it was meant to look.",
        pills: ["True Colour Processing", "Pixel-Level Tuning", "Natural Tones", "Rich Detail"],
      },
      optiram: {
        group: "Memory",
        desc: "Smart cache clearing keeps performance feeling fresh — fast on day one, and still fast years into living with it.",
        pills: ["Auto Cache Clearing", "Lasting Speed", "Smooth Multitasking", "Always Ready"],
      },
      palette: {
        group: "Picture AI",
        desc: "A full picture-quality suite that paints every frame with balance — colour, contrast, and clarity working together.",
        pills: ["AI Picture Tuning", "Balanced Colour", "Sharper Scenes", "Cinema-Ready Look"],
      },
      huesense: {
        group: "Colour",
        desc: "Intelligent colour enhancement that keeps hues honest and vivid — so outfits, skies, and skin tones always look right.",
        pills: ["Accurate Colour", "Vivid Yet Natural", "Scene-Aware Tuning", "True Skin Tones"],
      },
      glowsense: {
        group: "Brightness",
        desc: "AI brightness that adapts like a lighting director — bright rooms stay clear, dark scenes stay deep and comfortable.",
        pills: ["Adaptive Brightness", "Day & Night Ready", "Comfort Viewing", "Room-Aware Glow"],
      },
      depthsense: {
        group: "Contrast",
        desc: "Contrast that adds real depth — darker darks, brighter brights, and a picture that feels dimensional, not flat.",
        pills: ["Deeper Blacks", "Brighter Highlights", "Added Dimension", "Cinematic Contrast"],
      },
      detailsense: {
        group: "Sharpness",
        desc: "Fine-detail sharpening that notices what others miss — textures stay crisp without looking forced or noisy.",
        pills: ["Fine Detail", "Clean Sharpness", "Texture Clarity", "Edge Precision"],
      },
    };

    let index = 0;
    let timer = null;

    function accentName(name) {
      // Keep compound names whole so long titles like DepthSense never split/overlap
      if (/OS$/i.test(name) && name.length > 2 && !/\s/.test(name)) {
        return escapeHtml(name.slice(0, -2)) + '<span class="accent">' + escapeHtml(name.slice(-2)) + "</span>";
      }
      if (/\bAI\b/i.test(name)) {
        return escapeHtml(name).replace(/\bAI\b/i, '<span class="accent">AI</span>');
      }
      return escapeHtml(name);
    }

    function metaFor(f) {
      return (
        slideMeta[f.id] || {
          group: f.group,
          desc:
            f.tagline +
            " Built into every VOIR QLED experience — so the feature you pick is the one you actually feel.",
          pills: ["Personalised Experience", "Easy Navigation", "All Your Apps In One Place", "Faster Performance"],
        }
      );
    }

    function keepTabVisible(btn) {
      if (!btn || !tabs) return;
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

    const panel = el("featurePanel");
    const imageElB = el("featureImageNext");
    const copyEl = panel ? panel.querySelector(".feature-panel__copy") : null;
    let switching = false;
    let activeImage = imageEl;

    function paintContent(i) {
      index = (i + features.length) % features.length;
      const f = features[index];
      const meta = metaFor(f);
      let activeBtn = null;
      tabs.querySelectorAll(".feature-tab").forEach(function (btn, idx) {
        const on = idx === index;
        btn.classList.toggle("is-active", on);
        if (on) activeBtn = btn;
      });
      keepTabVisible(activeBtn);
      if (groupEl) groupEl.textContent = meta.group;
      if (nameEl) nameEl.innerHTML = accentName(f.name);
      if (tagEl) tagEl.textContent = f.tagline;
      if (descEl) descEl.textContent = meta.desc;
      if (ctaEl) ctaEl.textContent = "Explore " + f.name + " →";
      if (countEl) {
        countEl.textContent =
          String(index + 1).padStart(2, "0") + " / " + String(features.length).padStart(2, "0");
      }
      if (dashesEl) {
        const dashCount = dashesEl.querySelectorAll(".feature-panel__dash").length || 5;
        const activeDash =
          features.length <= 1
            ? 0
            : Math.round((index / (features.length - 1)) * (dashCount - 1));
        dashesEl.querySelectorAll(".feature-panel__dash").forEach(function (dash, d) {
          dash.classList.toggle("is-active", d === activeDash);
        });
      }
      if (pillsEl) {
        pillsEl.innerHTML = meta.pills
          .map(function (p, pi) {
            return (
              "<li>" +
              (pillIcons[pi % pillIcons.length] || "") +
              escapeHtml(p) +
              "</li>"
            );
          })
          .join("");
      }
    }

    function crossfadeImage(src, alt) {
      if (!imageEl || !imageElB) {
        if (imageEl) {
          imageEl.src = src;
          imageEl.alt = alt;
        }
        return;
      }
      if (
        activeImage &&
        activeImage.classList.contains("is-active") &&
        (activeImage.getAttribute("src") || "").indexOf(src.replace(/^\.\//, "")) !== -1
      ) {
        activeImage.alt = alt || "";
        return;
      }
      const incoming = activeImage === imageEl ? imageElB : imageEl;
      const outgoing = activeImage;
      const apply = function () {
        incoming.alt = alt || "";
        incoming.classList.add("is-active");
        outgoing.classList.remove("is-active");
        activeImage = incoming;
      };
      incoming.src = src;
      if (incoming.complete) {
        apply();
      } else {
        incoming.onload = apply;
        incoming.onerror = apply;
      }
    }

    function paint(i) {
      paintContent(i);
      const f = features[index];
      crossfadeImage(images[index % images.length], f.name);
    }

    function show(i) {
      const next = (i + features.length) % features.length;
      if (next === index && nameEl && nameEl.textContent) {
        paint(next);
        return;
      }
      if (prefersReduced || !panel) {
        paint(next);
        return;
      }
      if (switching) {
        paintContent(next);
        crossfadeImage(images[next % images.length], features[next].name);
        index = next;
        return;
      }

      switching = true;
      const f = features[next];
      const src = images[next % images.length];

      // Image crossfades without going blank; copy eases softly (never fully hides)
      crossfadeImage(src, f.name);

      if (typeof gsap !== "undefined" && copyEl) {
        gsap.killTweensOf(copyEl);
        gsap
          .timeline({
            onComplete: function () {
              switching = false;
            },
          })
          .to(copyEl, { opacity: 0.35, duration: 0.22, ease: "power1.out" })
          .add(function () {
            paintContent(next);
          })
          .to(copyEl, { opacity: 1, duration: 0.4, ease: "power2.out" });
      } else if (copyEl) {
        copyEl.style.transition = "opacity 0.35s ease";
        copyEl.style.opacity = "0.35";
        window.setTimeout(function () {
          paintContent(next);
          copyEl.style.opacity = "1";
          switching = false;
        }, 220);
      } else {
        paintContent(next);
        switching = false;
      }
    }

    tabs.innerHTML = features
      .map(function (f, i) {
        return (
          '<button type="button" class="feature-tab' +
          (i === 0 ? " is-active" : "") +
          '" role="tab" data-index="' +
          i +
          '"><span class="feature-tab__icon">' +
          (tabIcons[i % tabIcons.length] || tabIcons[0]) +
          '</span><span class="feature-tab__label">' +
          escapeHtml(f.name) +
          "</span></button>"
        );
      })
      .join("");

    if (dashesEl) {
      // Match mock: 5 progress marks + count (01 / 10)
      const dashCount = 5;
      dashesEl.innerHTML = Array.from({ length: dashCount }, function (_, i) {
        return (
          '<button type="button" class="feature-panel__dash' +
          (i === 0 ? " is-active" : "") +
          '" data-dash="' +
          i +
          '" aria-label="Feature group ' +
          (i + 1) +
          '"></button>'
        );
      }).join("");
      dashesEl.addEventListener("click", function (e) {
        const dash = e.target.closest("[data-dash]");
        if (!dash) return;
        const group = parseInt(dash.getAttribute("data-dash"), 10);
        const mapped = Math.min(
          features.length - 1,
          Math.round((group / (dashCount - 1)) * (features.length - 1))
        );
        show(mapped);
        restart();
      });
    }

    tabs.addEventListener("click", function (e) {
      const btn = e.target.closest(".feature-tab");
      if (!btn) return;
      show(parseInt(btn.getAttribute("data-index"), 10));
      restart();
    });

    function step(dir) {
      show(index + dir);
      restart();
    }

    prevBtn && prevBtn.addEventListener("click", function () { step(-1); });
    nextBtn && nextBtn.addEventListener("click", function () { step(1); });

    function restart() {
      if (timer) clearInterval(timer);
      if (prefersReduced) return;
      timer = setInterval(function () {
        show(index + 1);
      }, 4800);
    }

    // Preload dark slide images for smoother swaps
    images.forEach(function (src) {
      const img = new Image();
      img.src = src;
    });

    paint(0);
    restart();
  }

  function promiseIcon(name) {
    const icons = {
      eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
      speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="8" width="5" height="8" rx="1"/><path d="M9 10l7-4v12l-7-4"/><path d="M17 9.5c1.2.8 2 2 2 2.5s-.8 1.7-2 2.5"/></svg>',
      home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 11l8-7 8 7"/><path d="M6 10.5V20h12v-9.5"/></svg>',
      palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.2a2.4 2.4 0 0 0 2.3-3.1 2.2 2.2 0 0 1 2-3.1H19a2 2 0 0 0 0-4h-.3A9 9 0 0 0 12 3z"/><circle cx="7.5" cy="10" r="1" fill="currentColor"/><circle cx="10" cy="7.2" r="1" fill="currentColor"/><circle cx="13.8" cy="7.5" r="1" fill="currentColor"/></svg>',
      display: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 19h8"/><path d="M12 17v2"/></svg>',
      panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3.5" y="5" width="17" height="12" rx="1.5"/><path d="M8 19h8M12 17v2"/><path d="M8 9.5h3.2M8 12.5h5"/></svg>',
      chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M9 4v3M12 4v3M15 4v3M9 17v3M12 17v3M15 17v3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3"/></svg>',
      dolby: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 7h4.5a4.5 4.5 0 0 1 0 10H5V7z"/><path d="M19 7h-4.5a4.5 4.5 0 0 0 0 10H19V7z"/></svg>',
      waves: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M3 7c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/></svg>',
      sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="8" cy="7" r="1.8" fill="currentColor"/><circle cx="14" cy="12" r="1.8" fill="currentColor"/><circle cx="10" cy="17" r="1.8" fill="currentColor"/></svg>',
      mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
      phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="8" y="2.5" width="8" height="19" rx="2"/><path d="M11 18h2"/></svg>',
      homesync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8.5 4.5h7l3.5 3.5v7l-3.5 3.5h-7L5 15V8z"/><path d="M9.5 12.5l2-2 2 2 2-2"/></svg>',
      assistant: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="11" r="3.2"/><circle cx="15.2" cy="8.2" r="2.1"/><circle cx="16.2" cy="14.2" r="1.5"/><circle cx="12.4" cy="16.6" r="1.1"/></svg>',
      service: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9.5 12l1.8 1.8L15 10"/></svg>',
    };
    return icons[name] || icons.chip;
  }

  function renderPromise() {
    const grid = el("promiseGrid");
    if (!grid || !window.VOIR) return;
    grid.innerHTML = window.VOIR.catalogue.pillars
      .map(function (col, i) {
        const num = String(i + 1).padStart(2, "0");
        const items = col.items
          .map(function (it) {
            return (
              '<li class="promise-item">' +
              '<span class="promise-item__icon">' +
              promiseIcon(it.icon) +
              "</span>" +
              '<div class="promise-item__body">' +
              '<span class="promise-item__name">' +
              escapeHtml(it.name) +
              "</span>" +
              '<span class="promise-item__text">' +
              escapeHtml(it.text) +
              "</span>" +
              "</div>" +
              "</li>"
            );
          })
          .join("");
        return (
          '<article class="promise-col" data-promise="' +
          (i + 1) +
          '">' +
          '<span class="promise-col__num" aria-hidden="true">' +
          num +
          "</span>" +
          '<div class="promise-col__badge">' +
          promiseIcon(col.icon) +
          "</div>" +
          '<div class="promise-col__top">' +
          '<h3 class="promise-col__title">' +
          escapeHtml(col.title) +
          "</h3>" +
          '<p class="promise-col__tagline">' +
          escapeHtml(col.tagline || "") +
          "</p>" +
          '<p class="promise-col__lead">' +
          escapeHtml(col.text) +
          "</p>" +
          "</div>" +
          '<ul class="promise-col__list">' +
          items +
          "</ul>" +
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
        image: "images/tv-hero.jpg",
        className: "ptr--hero",
      },
      Sound: {
        role: "stack",
        image: "images/showcase-sound.jpg",
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
        image: "images/showcase-tv.jpg",
        className: "ptr--pair ptr--panel",
      },
      Aesthetics: {
        role: "pair",
        image: "images/tv-angle.jpg",
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

        return (
          '<article class="ptr ' +
          m.className +
          '">' +
          '<div class="ptr__main">' +
          '<div class="ptr__copy">' +
          '<p class="ptr__label">' +
          escapeHtml(g.group) +
          "</p>" +
          '<h3 class="ptr__hero-spec">' +
          escapeHtml(lead ? lead.title : g.group) +
          "</h3>" +
          '<p class="ptr__desc">' +
          escapeHtml(lead ? lead.text : "") +
          "</p>" +
          "</div>" +
          '<div class="ptr__media"><img src="' +
          escapeHtml(m.image) +
          '" alt="" loading="lazy" /></div>' +
          "</div>" +
          specs +
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
    const meta = window.VOIR.series[seriesId] || {};
    if (meta.comingSoon) {
      grid.innerHTML =
        '<div class="coming-soon-panel" data-reveal="card">' +
        '<p class="section__eyebrow">Vantage Series</p>' +
        '<h2 class="section__title" style="font-size:clamp(1.6rem,3vw,2.2rem)">Coming soon</h2>' +
        '<p class="section__lead">Models, sizes, and full specifications for Vantage Series will appear here first.</p>' +
        '<a href="tvs.html" class="btn btn--primary" data-magnetic>Browse all TVs</a>' +
        "</div>";
      return;
    }
    const list = window.VOIR.modelsBySeries(seriesId);
    grid.innerHTML = list.map(modelCardHtml).join("");
  }

  function initSeriesTabs() {
    const tabs = el("seriesTabs");
    if (!tabs) return;
    let series = window.VOIR.resolveSeriesId(location.hash || "core");
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
      (m.series === "core" || m.series === "vantage" ? "chip--orange" : "chip--teal") +
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
        .map(function (person, index) {
          const summary = escapeHtml((person.paragraphs && person.paragraphs[0]) || "");
          const num = String(index + 1).padStart(2, "0");
          const title = escapeHtml(person.title || person.role || "");
          const focus = escapeHtml(person.focus || "");
          const initials = escapeHtml(person.initials || person.name.slice(0, 2));
          return (
            '<article class="lead-card" data-leader-index="' +
            index +
            '">' +
            '<span class="lead-card__index" aria-hidden="true">' +
            num +
            "</span>" +
            '<div class="lead-card__photo">' +
            '<span class="lead-card__shape" aria-hidden="true"></span>' +
            '<span class="lead-card__avatar" aria-hidden="true">' +
            initials +
            "</span>" +
            "</div>" +
            '<p class="lead-card__role">' +
            title +
            "</p>" +
            "<h3 class=\"lead-card__name\">" +
            escapeHtml(person.name) +
            "</h3>" +
            (focus ? '<p class="lead-card__tags">' + focus + "</p>" : "") +
            '<p class="lead-card__bio">' +
            summary +
            "</p>" +
            '<button type="button" class="lead-card__cta" data-leader-open="' +
            index +
            '"><span aria-hidden="true">→</span> View Profile</button>' +
            "</article>"
          );
        })
        .join("");
      initLeadershipSlider();
      initLeaderModal();
    }
  }

  function initLeadershipSlider() {
    const track = el("teamGrid");
    const prev = el("leadPrev");
    const next = el("leadNext");
    if (!track || !prev || !next) return;
    if (track.dataset.sliderReady === "true") return;
    track.dataset.sliderReady = "true";

    const stage = track.parentElement;
    const cards = Array.from(track.querySelectorAll(".lead-card"));
    if (!cards.length || !stage) return;
    let index = Math.min(1, cards.length - 1);

    function cardStep() {
      const card = cards[0];
      if (!card) return 320;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 20;
      return card.getBoundingClientRect().width + gap;
    }

    function paint() {
      const maxIndex = Math.max(0, cards.length - 1);
      index = Math.max(0, Math.min(index, maxIndex));
      const step = cardStep();
      const stageW = stage.clientWidth;
      const cardW = cards[0].getBoundingClientRect().width;
      const ideal = index * step - (stageW - cardW) / 2;
      const max = Math.max(0, track.scrollWidth - stageW);
      const offset = Math.max(0, Math.min(ideal, max));
      track.style.transform = "translate3d(" + -offset + "px,0,0)";
      cards.forEach(function (card, i) {
        card.classList.toggle("is-active", i === index);
        card.classList.toggle("is-near", Math.abs(i - index) === 1);
      });
      prev.disabled = index <= 0;
      next.disabled = index >= maxIndex;
    }

    prev.addEventListener("click", function () {
      index -= 1;
      paint();
    });
    next.addEventListener("click", function () {
      index += 1;
      paint();
    });

    let startX = 0;
    let dragging = false;
    track.addEventListener(
      "pointerdown",
      function (e) {
        if (e.target.closest("[data-leader-open]")) return;
        dragging = true;
        startX = e.clientX;
        track.setPointerCapture(e.pointerId);
      },
      { passive: true }
    );
    track.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40) {
        index += dx < 0 ? 1 : -1;
        paint();
      }
    });

    window.addEventListener("resize", paint);
    paint();
  }

  function initLeaderModal() {
    const modal = el("leaderModal");
    if (!modal || modal.dataset.ready === "true") return;
    modal.dataset.ready = "true";

    const roleEl = el("leaderModalRole");
    const titleEl = el("leaderModalTitle");
    const focusEl = el("leaderModalFocus");
    const copyEl = el("leaderModalCopy");

    function openLeader(index) {
      const person = window.VOIR.team[index];
      if (!person) return;
      if (roleEl) roleEl.textContent = person.title || person.role || "";
      if (titleEl) titleEl.textContent = person.name;
      if (focusEl) focusEl.textContent = person.focus || "";
      if (copyEl) {
        copyEl.innerHTML = (person.paragraphs || [])
          .map(function (p) {
            return "<p>" + escapeHtml(p) + "</p>";
          })
          .join("");
      }
      modal.hidden = false;
      document.body.classList.add("leader-modal-open");
    }

    function closeLeader() {
      modal.hidden = true;
      document.body.classList.remove("leader-modal-open");
    }

    document.querySelectorAll("[data-leader-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openLeader(Number(btn.getAttribute("data-leader-open")));
      });
    });
    modal.querySelectorAll("[data-leader-close]").forEach(function (btn) {
      btn.addEventListener("click", closeLeader);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) closeLeader();
    });
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

  function initHeroBgSlider() {
    const slides = Array.from(document.querySelectorAll("#heroBgSlider .hero__bg-slide"));
    const cardsHost = el("heroCards");
    const dotsHost = el("heroDots");
    const prev = el("heroPrev");
    const next = el("heroNext");
    const eyebrow = el("heroEyebrow");
    const title = el("heroTitle");
    const desc = el("heroDesc");
    if (!slides.length || !cardsHost) return;

    const deck = [
      {
        kicker: "QLED TV",
        title: "Bigger Pictures. Brighter Tomorrows.",
        eyebrow: "QLED TV | Core Series",
        headline: 'Bigger Pictures. <span class="hero__title-accent">Brighter</span> Tomorrows.',
        desc: "Experience a smarter, brighter way to watch.",
        image: "images/tv-hero.jpg",
      },
      {
        kicker: "Core Series",
        title: "Colour Tells a Brighter Story.",
        eyebrow: "Core Series | Cloud TV",
        headline: 'Colour Tells a <span class="hero__title-accent">Brighter</span> Story.',
        desc: "Brilliant Cloud TV QLED built for colour, clarity, and everyday viewing.",
        image: "images/core-43.jpg",
      },
      {
        kicker: "Zenith Series",
        title: "More Than a TV. A Smarter Life.",
        eyebrow: "Zenith Series | Google TV",
        headline: 'More Than a TV. A <span class="hero__title-accent">Smarter</span> Life.',
        desc: "Premium Google TV QLED with Dolby Vision.Atmos and AI Quantum Core.",
        image: "images/zenith-55.jpg",
      },
      {
        kicker: "Dolby Atmos",
        title: "Sound That Brings You Closer.",
        eyebrow: "Dolby Atmos | Cinema Sound",
        headline: 'Sound That Brings You <span class="hero__title-accent">Closer</span>.',
        desc: "Immersive audio tuned with the picture, so every scene feels finished.",
        image: "images/showcase-sound.jpg",
      },
    ];

    let index = 0;
    let timer = null;

    cardsHost.innerHTML = deck
      .map(function (item, i) {
        return (
          '<button type="button" class="hero__card' +
          (i === 0 ? " is-active" : "") +
          '" role="tab" aria-selected="' +
          (i === 0 ? "true" : "false") +
          '" data-hero-card="' +
          i +
          '">' +
          '<span class="hero__card-copy">' +
          '<span class="hero__card-kicker">' +
          escapeHtml(item.kicker) +
          "</span>" +
          '<span class="hero__card-title">' +
          escapeHtml(item.title) +
          "</span>" +
          "</span>" +
          '<span class="hero__card-media"><img src="' +
          escapeHtml(item.image) +
          '" alt="" loading="lazy" /></span>' +
          "</button>"
        );
      })
      .join("");

    if (dotsHost) {
      dotsHost.innerHTML = deck
        .map(function (_, i) {
          return (
            '<button type="button" class="hero__dot' +
            (i === 0 ? " is-active" : "") +
            '" data-hero-dot="' +
            i +
            '" aria-label="Go to slide ' +
            (i + 1) +
            '"></button>'
          );
        })
        .join("");
    }

    function show(i) {
      index = (i + deck.length) % deck.length;
      const item = deck[index];

      slides.forEach(function (slide, s) {
        slide.classList.toggle("is-active", s === index);
      });

      cardsHost.querySelectorAll(".hero__card").forEach(function (card, c) {
        const on = c === index;
        card.classList.toggle("is-active", on);
        card.setAttribute("aria-selected", on ? "true" : "false");
      });

      if (dotsHost) {
        dotsHost.querySelectorAll(".hero__dot").forEach(function (dot, d) {
          dot.classList.toggle("is-active", d === index);
        });
      }

      if (eyebrow) eyebrow.textContent = item.eyebrow;
      if (title) title.innerHTML = item.headline;
      if (desc) desc.textContent = item.desc;
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 6000);
    }

    cardsHost.addEventListener("click", function (e) {
      const card = e.target.closest("[data-hero-card]");
      if (!card) return;
      show(Number(card.getAttribute("data-hero-card")));
      restart();
    });

    if (dotsHost) {
      dotsHost.addEventListener("click", function (e) {
        const dot = e.target.closest("[data-hero-dot]");
        if (!dot) return;
        show(Number(dot.getAttribute("data-hero-dot")));
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initCinemaVideo() {
    const video = el("cinemaVideo");
    const toggle = el("cinemaToggle");
    if (!video) return;

    const tryPlay = function () {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    };
    tryPlay();

    if (toggle) {
      toggle.addEventListener("click", function () {
        const muted = !video.muted;
        video.muted = muted;
        toggle.textContent = muted ? "Sound on" : "Sound off";
        toggle.setAttribute("aria-pressed", muted ? "false" : "true");
        tryPlay();
      });
    }

    if (window.ScrollTrigger && window.gsap) {
      ScrollTrigger.create({
        trigger: "#cinema",
        start: "top 70%",
        end: "bottom 20%",
        onEnter: tryPlay,
        onEnterBack: tryPlay,
        onLeave: function () {
          video.pause();
        },
        onLeaveBack: function () {
          video.pause();
        },
      });
    }
  }

  function initTv3dTilt() {
    if (!window.gsap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.querySelectorAll("[data-tv-tilt]").forEach(function (stage) {
      const unit = stage.querySelector(".tv3d__unit");
      if (!unit) return;
      const flip = !!stage.closest(".showcase__item--flip");
      const baseY = flip ? 16 : -16;
      const baseX = 7;

      gsap.set(unit, {
        rotateY: baseY,
        rotateX: baseX,
        transformPerspective: 1000,
        transformOrigin: "50% 55%",
      });

      const toY = gsap.quickTo(unit, "rotateY", { duration: 0.4, ease: "power3.out" });
      const toX = gsap.quickTo(unit, "rotateX", { duration: 0.4, ease: "power3.out" });

      stage.addEventListener("pointermove", function (e) {
        const rect = stage.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        stage.classList.add("is-tilting");
        toY(baseY + px * 24);
        toX(baseX + py * -14);
      });

      stage.addEventListener("pointerleave", function () {
        stage.classList.remove("is-tilting");
        toY(baseY);
        toX(baseX);
      });
    });
  }

  function initShowcaseRail() {
    const links = Array.from(document.querySelectorAll(".showcase__rail-link"));
    const items = Array.from(document.querySelectorAll(".showcase__item[id]"));
    if (!links.length || !items.length || !window.ScrollTrigger) return;

    items.forEach(function (item) {
      ScrollTrigger.create({
        trigger: item,
        start: "top 55%",
        end: "bottom 45%",
        onEnter: function () {
          setActive(item.id);
        },
        onEnterBack: function () {
          setActive(item.id);
        },
      });
    });

    function setActive(id) {
      links.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
      });
    }

    setActive(items[0].id);
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
    initCinemaVideo();
    initHeroBgSlider();
    initTv3dTilt();
    initShowcaseRail();

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
