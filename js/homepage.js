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
     HERO — Ken Burns + Entrance
  ---------------------------------------- */

  function initHero() {
    const video = document.getElementById("heroVideo");
    const mask = document.querySelector(".hero-cinematic__video-mask");
    const eyebrow = document.querySelector(".hero-cinematic__eyebrow");
    const title = document.querySelector(".hero-cinematic__title");
    const sub = document.querySelector(".hero-cinematic__sub");
    const scroll = document.querySelector(".hero-cinematic__scroll");

    /* Ensure video plays */
    if (video) {
      video.play().catch(function () {});
    }

    if (prefersReduced) {
      [eyebrow, title, sub, scroll].forEach(function (el) {
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
      return;
    }

    /* Entrance timeline */
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      delay: 0.3,
    });

    if (eyebrow)
      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.8 }, 0);
    if (title)
      tl.to(title, { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, 0.15);
    if (sub)
      tl.to(sub, { opacity: 1, y: 0, duration: 0.8 }, 0.4);
    if (scroll)
      tl.to(scroll, { opacity: 1, duration: 0.6 }, 0.7);

    /* Ken Burns — slow scale on the video */
    if (video) {
      gsap.fromTo(
        video,
        { scale: 1.02 },
        {
          scale: 1.08,
          duration: 25,
          ease: "none",
          repeat: -1,
          yoyo: true,
        }
      );
    }

    /* Parallax on scroll — video scales up, content fades */
    if (mask) {
      gsap.to(mask, {
        scale: 1.05,
        scrollTrigger: {
          trigger: ".hero-cinematic",
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }

    var heroContent = document.querySelector(".hero-cinematic__content");
    if (heroContent) {
      gsap.to(heroContent, {
        y: -80,
        opacity: 0,
        scrollTrigger: {
          trigger: ".hero-cinematic",
          start: "60% top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }
  }

  /* ----------------------------------------
     STORY — Scroll-triggered reveals
  ---------------------------------------- */

  function initStory() {
    var blocks = document.querySelectorAll(".story__block");
    if (!blocks.length) return;

    if (prefersReduced) {
      blocks.forEach(function (b) {
        b.classList.add("is-visible");
      });
      return;
    }

    blocks.forEach(function (block, i) {
      gsap.fromTo(
        block,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: block,
            start: "top 80%",
            end: "top 40%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }

  /* ----------------------------------------
     TECH SHOWCASE — Staggered reveals
  ---------------------------------------- */

  function initTechShowcase() {
    var stats = document.querySelectorAll(".tech-stat");
    var cards = document.querySelectorAll(".tech-card");

    if (prefersReduced) {
      stats.forEach(function (s) { s.classList.add("is-visible"); });
      cards.forEach(function (c) { c.classList.add("is-visible"); });
      return;
    }

    /* Intersection Observer for stats */
    var statsObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    stats.forEach(function (stat) {
      statsObs.observe(stat);
    });

    /* Intersection Observer for cards */
    var cardsObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach(function (card) {
      cardsObs.observe(card);
    });
  }

  /* ----------------------------------------
     TV SERIES — Tab switching
  ---------------------------------------- */

  function initTvSeries() {
    var tabs = document.querySelectorAll(".tv-series__tab");
    var panels = document.querySelectorAll(".tv-series__panel");
    var line = document.querySelector(".tv-series__tab-line");
    if (!tabs.length || !panels.length) return;

    function activateTab(id) {
      tabs.forEach(function (tab) {
        tab.classList.toggle("is-active", tab.dataset.series === id);
      });

      panels.forEach(function (panel) {
        var isActive = panel.dataset.series === id;
        panel.classList.toggle("is-active", isActive);
      });

      /* Move underline */
      if (line) {
        var activeTab = document.querySelector('.tv-series__tab[data-series="' + id + '"]');
        if (activeTab) {
          var nav = document.querySelector(".tv-series__nav");
          var navRect = nav.getBoundingClientRect();
          var tabRect = activeTab.getBoundingClientRect();
          line.style.left = (tabRect.left - navRect.left) + "px";
          line.style.width = tabRect.width + "px";
        }
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateTab(tab.dataset.series);
      });
    });

    /* Initialize underline position */
    var firstActive = document.querySelector(".tv-series__tab.is-active");
    if (firstActive && line) {
      setTimeout(function() {
        activateTab(firstActive.dataset.series);
      }, 100);
    }

    /* Scroll-triggered entrance */
    if (!prefersReduced) {
      var section = document.querySelector(".tv-series");
      if (section) {
        gsap.fromTo(
          section.querySelector(".tv-series__header"),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
            },
          }
        );

        gsap.fromTo(
          section.querySelector(".tv-series__nav"),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.2,
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
            },
          }
        );
      }
    }
  }

  /* ----------------------------------------
     PROMISE — Progressive column reveal
  ---------------------------------------- */

  function initPromise() {
    var cards = document.querySelectorAll(".promise-v2__card");
    if (!cards.length) return;

    if (prefersReduced) {
      cards.forEach(function (c) {
        c.classList.add("is-visible");
        c.querySelectorAll(".promise-v2__tech").forEach(function (t) {
          t.style.opacity = "1";
          t.style.transform = "none";
        });
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
      { threshold: 0.2 }
    );

    cards.forEach(function (card) {
      obs.observe(card);
    });

    /* Header entrance */
    var header = document.querySelector(".promise-v2__header");
    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".promise-v2",
            start: "top 75%",
          },
        }
      );
    }
  }

  /* ----------------------------------------
     CINEMA — Video play/pause on visibility
  ---------------------------------------- */

  function initCinema() {
    var vids = [
      document.getElementById("cinemaVideoV2"),
      document.getElementById("techBgVideo")
    ];

    vids.forEach(function (video) {
      if (!video) return;
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              video.play().catch(function () {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.2 }
      );

      obs.observe(video);
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
     BOOT
  ---------------------------------------- */

  function boot() {
    initHero();
    initStory();
    initTechShowcase();
    initTvSeries();
    initPromise();
    initCinema();
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
