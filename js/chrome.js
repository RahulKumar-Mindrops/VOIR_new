/**
 * Shared VOIR header / footer
 */
(function () {
  "use strict";

  function pageId() {
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!file || file === "index.html") return "home";
    if (file === "tv.html") return "tvs";
    return file.replace(".html", "");
  }

  function navMarkup(active) {
    const links = (window.VOIR && window.VOIR.nav) || [];
    const items = links
      .map(function (l) {
        const isActive = l.id === active;
        return (
          '<a href="' +
          l.href +
          '" class="nav__link' +
          (isActive ? " is-active" : "") +
          '"><span>' +
          l.label +
          "</span></a>"
        );
      })
      .join("");

    const drawerItems = links
      .map(function (l) {
        const isActive = l.id === active;
        return (
          '<a href="' +
          l.href +
          '" class="nav-drawer__link' +
          (isActive ? " is-active" : "") +
          '">' +
          l.label +
          "</a>"
        );
      })
      .join("");

    const solid = active !== "home" ? " is-scrolled nav--inner" : "";
    return (
      '<header class="nav' +
      solid +
      '" id="nav">' +
      '<div class="nav__inner">' +
      '<a href="index.html" class="nav__logo" data-magnetic aria-label="VOIR home">' +
      '<img src="images/logo-dark.png?v=2" alt="VOIR — SEE IT. LOVE IT. LIVE IT." class="nav__logo-img" />' +
      "</a>" +
      '<nav class="nav__links" id="navLinks" aria-label="Primary">' +
      items +
      "</nav>" +
      '<button type="button" class="nav__toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="navDrawer">' +
      "<span></span><span></span><span></span>" +
      "</button>" +
      "</div></header>" +
      '<div class="nav-drawer" id="navDrawer" hidden>' +
      '<nav class="nav-drawer__list" aria-label="Mobile">' +
      drawerItems +
      "</nav>" +
      "</div>"
    );
  }

  function footerMarkup() {
    const ig = window.VOIR.social.instagram;
    const fb = window.VOIR.social.facebook;
    const yt = window.VOIR.social.youtube || "https://www.youtube.com/";
    const li = window.VOIR.social.linkedin || "https://www.linkedin.com/";
    const iconIg =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>';
    const iconYt =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="3.5" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 9.2l5 2.8-5 2.8V9.2z" fill="currentColor"/></svg>';
    const iconLi =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M8 10.5V16M8 7.8v.2M12 16v-3.2c0-1.3.8-2.3 2-2.3s2 1 2 2.3V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    const iconFb =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="M14 8.5h2.2V5.8H14c-2 0-3.5 1.5-3.5 3.5V11H8.5v2.7H10.5V19h2.8v-5.3H15.5l.5-2.7h-2.7V9.3c0-.5.4-.8.9-.8z" fill="currentColor"/></svg>';

    return (
      '<footer class="footer" id="footer">' +
      '<div class="footer__bg" aria-hidden="true"></div>' +
      '<div class="container footer__inner">' +
      '<div class="footer__top">' +
      '<div class="footer__col footer__col--brand">' +
      '<a href="index.html" class="footer__logo">' +
      '<img src="images/logo-dark.png?v=2" alt="VOIR — SEE IT. LOVE IT. LIVE IT." class="footer__logo-img" />' +
      "</a>" +
      '<p class="footer__tagline">SEE IT. LOVE IT. LIVE IT.</p>' +
      '<p class="footer__about">Thoughtful technology for brighter homes.</p>' +
      "</div>" +
      '<div class="footer__col">' +
      '<h4 class="footer__heading">Products</h4>' +
      '<ul class="footer__links">' +
      '<li><a href="tvs.html">TVs</a></li>' +
      "</ul></div>" +
      '<div class="footer__col">' +
      '<h4 class="footer__heading">Company</h4>' +
      '<ul class="footer__links">' +
      '<li><a href="about.html">About</a></li>' +
      '<li><a href="support.html">Support</a></li>' +
      "</ul></div>" +
      '<div class="footer__col">' +
      '<h4 class="footer__heading">Stay Connected</h4>' +
      '<div class="footer__social">' +
      '<a href="' +
      ig +
      '" class="footer__social-link" target="_blank" rel="noopener" aria-label="Instagram" data-magnetic>' +
      iconIg +
      "</a>" +
      '<a href="' +
      yt +
      '" class="footer__social-link" target="_blank" rel="noopener" aria-label="YouTube" data-magnetic>' +
      iconYt +
      "</a>" +
      '<a href="' +
      li +
      '" class="footer__social-link" target="_blank" rel="noopener" aria-label="LinkedIn" data-magnetic>' +
      iconLi +
      "</a>" +
      '<a href="' +
      fb +
      '" class="footer__social-link" target="_blank" rel="noopener" aria-label="Facebook" data-magnetic>' +
      iconFb +
      "</a>" +
      "</div></div>" +
      '<div class="footer__col footer__col--motto">' +
      '<p class="footer__motto">A brighter way to live</p>' +
      "</div>" +
      "</div>" +
      '<div class="footer__bottom">' +
      "<p>&copy; 2024 VOIR Appliances Private Limited. All rights reserved.</p>" +
      '<div class="footer__legal">' +
      '<a href="privacy.html">Privacy Policy</a>' +
      "<span aria-hidden=\"true\">|</span>" +
      '<a href="faqs.html">Terms of Use</a>' +
      "<span aria-hidden=\"true\">|</span>" +
      '<a href="support.html">Contact Us</a>' +
      "</div></div></div></footer>"
    );
  }

  const active = pageId();
  const navHost = document.getElementById("site-nav");
  const footHost = document.getElementById("site-footer");
  if (navHost) navHost.innerHTML = navMarkup(active);
  if (footHost) footHost.innerHTML = footerMarkup();
})();
