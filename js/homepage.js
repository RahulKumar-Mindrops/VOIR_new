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
    const title = document.querySelector(".hero-cinematic__title");
    const screen = document.querySelector(".hero-cinematic__screen");

    /* Ensure video plays */
    if (video) {
      video.play().catch(function () {});
    }

    if (prefersReduced) {
      [title, screen].forEach(function (el) {
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
      delay: 0.25,
    });

    if (title)
      tl.to(title, { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, 0);
    if (screen)
      tl.to(screen, { opacity: 1, y: 0, duration: 1.05, ease: "power3.out" }, 0.2);

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

    /* Parallax on scroll — screen rises gently */
    if (screen) {
      gsap.to(screen, {
        y: -40,
        scrollTrigger: {
          trigger: ".hero-cinematic",
          start: "top top",
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
    var blocks = document.querySelectorAll(".story__block");
    var processor = document.getElementById("storyProcessorVideo");
    var aiVideo = document.getElementById("storyAiVideo");

    if (processor) {
      processor.play().catch(function () {});
    }
    if (aiVideo) {
      aiVideo.play().catch(function () {});
    }

    if (!blocks.length) return;

    if (prefersReduced) {
      blocks.forEach(function (b) {
        b.style.opacity = "1";
        b.style.transform = "none";
      });
      return;
    }

    blocks.forEach(function (block) {
      gsap.fromTo(
        block,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: block,
            start: "top 85%",
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

    function animateCount(el) {
      if (!el || el.dataset.counted === "1") return;
      if (el.hasAttribute("data-count-text")) {
        el.textContent = el.getAttribute("data-count-text");
        el.dataset.counted = "1";
        return;
      }
      var target = parseFloat(el.getAttribute("data-count") || "0");
      var suffix = el.getAttribute("data-suffix") || "";
      if (!target) return;
      el.dataset.counted = "1";
      var start = 0;
      var duration = 1100;
      var t0 = null;
      function frame(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(start + (target - start) * eased);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function bindGlow(stat) {
      stat.addEventListener("pointermove", function (e) {
        var r = stat.getBoundingClientRect();
        stat.style.setProperty("--mx", e.clientX - r.left + "px");
        stat.style.setProperty("--my", e.clientY - r.top + "px");
      });
    }

    if (prefersReduced) {
      stats.forEach(function (s) {
        s.classList.add("is-visible");
        var v = s.querySelector(".tech-stat__value");
        if (v) {
          if (v.hasAttribute("data-count-text")) {
            v.textContent = v.getAttribute("data-count-text");
          } else if (v.hasAttribute("data-count")) {
            v.textContent = v.getAttribute("data-count") + (v.getAttribute("data-suffix") || "");
          }
        }
      });
      return;
    }

    stats.forEach(bindGlow);

    var statsObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            animateCount(entry.target.querySelector(".tech-stat__value"));
          }
        });
      },
      { threshold: 0.25 }
    );

    stats.forEach(function (stat) {
      statsObs.observe(stat);
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

    function getPanelVideo(panel) {
      return panel ? panel.querySelector(".tv-series__video") : null;
    }

    function pauseSeriesVideos() {
      panels.forEach(function (panel) {
        var video = getPanelVideo(panel);
        if (!video) return;
        video.pause();
        video.classList.remove("is-playing");
      });
    }

    function playSeriesVideo(panel) {
      var video = getPanelVideo(panel);
      if (!video) return;

      var tryPlay = function () {
        video.muted = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise
            .then(function () {
              video.classList.add("is-ready", "is-playing");
            })
            .catch(function () {
              /* Autoplay may be blocked until interaction */
            });
        } else {
          video.classList.add("is-ready", "is-playing");
        }
      };

      if (video.readyState >= 2) {
        tryPlay();
      } else {
        video.addEventListener(
          "loadeddata",
          function onReady() {
            video.classList.add("is-ready");
            tryPlay();
          },
          { once: true }
        );
        video.load();
      }
    }

    function activateTab(id) {
      tabs.forEach(function (tab) {
        tab.classList.toggle("is-active", tab.dataset.series === id);
      });

      pauseSeriesVideos();

      panels.forEach(function (panel) {
        var isActive = panel.dataset.series === id;
        panel.classList.toggle("is-active", isActive);
        if (isActive) {
          /* Slight delay lets the fade transition start cleanly */
          window.setTimeout(function () {
            playSeriesVideo(panel);
          }, 80);
        }
      });

      /* Move underline */
      if (line) {
        var activeTab = document.querySelector('.tv-series__tab[data-series="' + id + '"]');
        if (activeTab) {
          var nav = document.querySelector(".tv-series__nav");
          var navRect = nav.getBoundingClientRect();
          var tabRect = activeTab.getBoundingClientRect();
          line.style.top = "auto";
          line.style.bottom = "0px";
          line.style.left = tabRect.left - navRect.left + "px";
          line.style.width = tabRect.width + "px";
        }
      }
    }

    /* Fade-in when each series video can play */
    panels.forEach(function (panel) {
      var video = getPanelVideo(panel);
      if (!video) return;
      video.addEventListener("canplay", function () {
        video.classList.add("is-ready");
      });
    });

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateTab(tab.dataset.series);
      });
    });

    /* Initialize underline + active video */
    var firstActive = document.querySelector(".tv-series__tab.is-active");
    if (firstActive) {
      setTimeout(function () {
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
          section.querySelector(".tv-series__toolbar") ||
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
     BOOT
  ---------------------------------------- */

  function boot() {
    initHero();
    initStory();
    initTechShowcase();
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
