/**
 * VOIR Homepage — Cinematic Redesign Animation Engine
 * Uses GSAP + ScrollTrigger (loaded globally) + IntersectionObserver
 */
(function () {
  "use strict";

  /* Exit if not the homepage */
  const isHome =
    !location.pathname.split("/").pop() ||
    location.pathname.split("/").pop().toLowerCase() === "index.html";
  if (!isHome) return;

  /* Add page-home class for CSS overrides */
  document.body.classList.add("page-home");

  const prefersReduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------
     HERO — Cinematic living-room entrance
  ---------------------------------------- */

  function initVoirHero() {
    var section = document.querySelector(".voir-hero");
    if (!section) return;

    var media = section.querySelector(".voir-hero__media");
    var bg = section.querySelector(".voir-hero__bg");
    var copy = section.querySelector(".voir-hero__copy");
    var rail = section.querySelector(".voir-hero__rail");
    var progress = section.querySelector(".voir-hero__progress");
    var scroll = section.querySelector(".voir-hero__scroll");
    var nav = document.querySelector(".nav.nav--hero");
    var fill = section.querySelector(".voir-hero__progress-fill");
    var knob = section.querySelector(".voir-hero__progress-knob");

    if (prefersReduced) {
      [copy, rail, progress, scroll].forEach(function (el) {
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
      if (nav) nav.style.opacity = "1";
      return;
    }

    if (nav) {
      gsap.set(nav, { opacity: 0, y: -12 });
    }

    var tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      delay: 0.15,
    });

    if (nav) {
      tl.to(nav, { opacity: 1, y: 0, duration: 0.9, ease: "power4.out" }, 0);
    }
    if (copy) {
      tl.to(copy, { opacity: 1, y: 0, duration: 1.1, ease: "power4.out" }, 0.18);
    }
    if (rail) {
      tl.to(rail, { opacity: 1, x: 0, duration: 0.95, ease: "power3.out" }, 0.45);
    }
    if (progress) {
      tl.to(progress, { opacity: 1, y: 0, duration: 0.75 }, 0.7);
    }
    if (scroll) {
      tl.to(scroll, { opacity: 1, y: 0, duration: 0.75 }, 0.8);
    }

    if (bg) {
      gsap.fromTo(
        bg,
        { scale: 1.04 },
        {
          scale: 1.12,
          duration: 28,
          ease: "none",
          repeat: -1,
          yoyo: true,
        }
      );
    }

    if (media) {
      gsap.to(media, {
        y: 40,
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1.4,
        },
      });
    }

    if (fill && knob) {
      gsap.fromTo(
        fill,
        { width: "8%" },
        {
          width: "72%",
          duration: 12,
          ease: "none",
          repeat: -1,
          yoyo: true,
        }
      );
      gsap.fromTo(
        knob,
        { left: "8%" },
        {
          left: "72%",
          duration: 12,
          ease: "none",
          repeat: -1,
          yoyo: true,
        }
      );
    }
  }

  /* ----------------------------------------
     BELIEF — Cinematic editorial entrance
  ---------------------------------------- */

  function initBelief() {
    var section = document.querySelector(".belief");
    if (!section) return;

    var media = section.querySelector(".belief__media");
    var bg = section.querySelector(".belief__bg");
    var copy = section.querySelector(".belief__copy");
    var quote = section.querySelector(".belief__quote");

    if (prefersReduced) {
      [copy, quote].forEach(function (el) {
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
      return;
    }

    if (copy) {
      gsap.fromTo(
        copy,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 1.05,
          ease: "power4.out",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true,
          },
        }
      );
    }

    if (quote) {
      gsap.fromTo(
        quote,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: "power3.out",
          delay: 0.15,
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
        }
      );
    }

    if (bg) {
      gsap.fromTo(
        bg,
        { scale: 1.04 },
        {
          scale: 1.12,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.35,
          },
        }
      );
    }

    if (media) {
      gsap.to(media, {
        y: 28,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }
  }

  /* ----------------------------------------
     STORY — Scroll-triggered reveals
  ---------------------------------------- */

  function initStory() {
    var section = document.querySelector(".story");
    if (!section) return;

    var processor = document.getElementById("storyProcessorVideo");
    var aiVideo = document.getElementById("storyAiVideo");
    var whyCopy = section.querySelector(".story__why-copy");
    var pillars = section.querySelectorAll(".story__pillar");
    var techCopy = section.querySelector(".story__tech-copy");
    var visual = section.querySelector(".story__visual");

    function playVideos() {
      [processor, aiVideo].forEach(function (vid) {
        if (!vid) return;
        vid.muted = true;
        var p = vid.play();
        if (p && typeof p.catch === "function") p.catch(function () {});
      });
    }

    playVideos();

    if (prefersReduced) {
      return;
    }

    if (whyCopy) {
      gsap.fromTo(
        whyCopy.children,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: whyCopy,
            start: "top 80%",
            once: true,
          },
        }
      );
    }

    if (pillars.length) {
      gsap.fromTo(
        pillars,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section.querySelector(".story__pillars") || section,
            start: "top 82%",
            once: true,
          },
        }
      );
    }

    if (techCopy) {
      gsap.fromTo(
        techCopy.children,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: techCopy,
            start: "top 82%",
            once: true,
          },
        }
      );
    }

    if (visual) {
      gsap.fromTo(
        visual,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: visual,
            start: "top 85%",
            once: true,
            onEnter: playVideos,
          },
        }
      );

      gsap.fromTo(
        section.querySelectorAll(".story__media-video"),
        { scale: 1.08 },
        {
          scale: 1.02,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: visual,
            start: "top 85%",
            once: true,
          },
        }
      );
    }
  }

  /* ----------------------------------------
     TECH SHOWCASE — Staggered reveals
  ---------------------------------------- */

  function initTechShowcase() {
    var section = document.querySelector(".tech-showcase");
    if (!section) return;

    var header = section.querySelector(".tech-showcase__header");
    var aside = section.querySelector(".tech-showcase__aside");
    var cards = section.querySelectorAll(".tech-showcase__card");

    if (prefersReduced) {
      if (header) {
        header.style.opacity = "1";
        header.style.transform = "none";
      }
      cards.forEach(function (card) {
        card.style.opacity = "1";
        card.style.transform = "none";
      });
      return;
    }

    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true,
          },
        }
      );
    }

    if (aside) {
      gsap.fromTo(
        aside,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true,
          },
        }
      );
    }

    if (cards.length) {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section.querySelector(".tech-showcase__track") || section,
          start: "top 80%",
          once: true,
        },
      });
    }
  }

  /* ----------------------------------------
     TV SERIES — Tab switching
  ---------------------------------------- */

  function initTvSeries() {
    var section = document.querySelector(".tv-series");
    if (!section) return;

    var track = document.getElementById("tvSeriesTrack");
    var prev = document.getElementById("tvSeriesPrev");
    var next = document.getElementById("tvSeriesNext");
    var videos = section.querySelectorAll(".tv-series__video");

    function tryPlay(video) {
      if (!video) return;
      video.muted = true;
      var p = video.play();
      if (p && typeof p.then === "function") {
        p.catch(function () {});
      }
    }

    videos.forEach(function (video) {
      tryPlay(video);
    });

    if ("IntersectionObserver" in window) {
      var vis = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var video = entry.target.querySelector
              ? entry.target.querySelector(".tv-series__video")
              : null;
            if (!video && entry.target.classList.contains("tv-series__video")) {
              video = entry.target;
            }
            if (!video) return;
            if (entry.isIntersecting) tryPlay(video);
            else video.pause();
          });
        },
        { threshold: 0.35 }
      );

      section.querySelectorAll(".tv-series__card").forEach(function (card) {
        vis.observe(card);
      });
    }

    function scrollByCard(dir) {
      if (!track) return;
      var card = track.querySelector(".tv-series__card");
      var amount = card ? card.getBoundingClientRect().width + 12 : track.clientWidth * 0.8;
      track.scrollBy({ left: dir * amount, behavior: "smooth" });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        scrollByCard(-1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        scrollByCard(1);
      });
    }

    if (!prefersReduced) {
      gsap.fromTo(
        section.querySelector(".tv-series__header"),
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
          },
        }
      );

      gsap.fromTo(
        section.querySelectorAll(".tv-series__card"),
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
          },
        }
      );
    }
  }

  /* ----------------------------------------
     PROMISE — Progressive column reveal
  ---------------------------------------- */

  function initPromise() {
    var items = document.querySelectorAll(".promise-acc");
    var shots = document.querySelectorAll(".promise-v2__shot");
    if (!items.length) return;

    var activeKey = null;
    var hoverTimer = null;
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    function setShot(key) {
      shots.forEach(function (shot) {
        shot.classList.toggle(
          "is-active",
          shot.getAttribute("data-promise-shot") === key
        );
      });
    }

    function openItem(target) {
      var key = target.getAttribute("data-promise");
      if (!key || key === activeKey) return;
      activeKey = key;

      items.forEach(function (item) {
        var open = item === target;
        item.classList.toggle("is-open", open);
        var btn = item.querySelector(".promise-acc__trigger");
        if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
      });

      setShot(key);
    }

    var openNow = document.querySelector(".promise-acc.is-open");
    activeKey = openNow ? openNow.getAttribute("data-promise") : null;
    if (activeKey) setShot(activeKey);

    items.forEach(function (item) {
      var btn = item.querySelector(".promise-acc__trigger");
      if (!btn) return;

      if (canHover) {
        item.addEventListener("mouseenter", function () {
          window.clearTimeout(hoverTimer);
          hoverTimer = window.setTimeout(function () {
            openItem(item);
          }, 40);
        });
      }

      btn.addEventListener("click", function () {
        if (item.classList.contains("is-open")) return;
        openItem(item);
      });

      btn.addEventListener("focus", function () {
        openItem(item);
      });
    });
  }

  /* ----------------------------------------
     GENERIC REVEAL — data-hp-reveal
  ---------------------------------------- */

  function initReveals() {
    var els = document.querySelectorAll("[data-hp-reveal]");
    if (prefersReduced) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    els.forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ----------------------------------------
     FEATURE LAB — Technology showcase
  ---------------------------------------- */

  function initFeatureLab() {
    var section = document.querySelector(".feature-lab");
    if (!section) return;

    var copy = section.querySelector(".feature-lab__copy");
    var visual = section.querySelector(".feature-lab__visual");
    var cards = section.querySelectorAll(".feature-lab__card");

    if (prefersReduced) {
      [copy, visual].forEach(function (el) {
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
      cards.forEach(function (card) {
        card.style.opacity = "1";
        card.style.transform = "none";
      });
      return;
    }

    if (copy) {
      gsap.to(copy, {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      });
    }

    if (visual) {
      gsap.to(visual, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.05,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          once: true,
        },
      });
    }

    if (cards.length) {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section.querySelector(".feature-lab__cards") || section,
          start: "top 85%",
          once: true,
        },
      });
    }
  }

  /* ----------------------------------------
     BOOT
  ---------------------------------------- */

  function boot() {
    initVoirHero();
    initBelief();
    initStory();
    initTechShowcase();
    initFeatureLab();
    initTvSeries();
    initPromise();
    initReveals();
  }

  /* Wait for preloader to finish, then init */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      /* Give preloader time to settle */
      setTimeout(boot, 200);
    });
  } else {
    setTimeout(boot, 200);
  }
})();
