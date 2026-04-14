/* ──────────────────────────────────────────────────────────────────────────
   auth-nav.js — shared login/dashboard nav swap

   Demo behaviour (no real auth yet):
   - Landing on dashboard.html or host-dashboard.html marks the user as
     "logged in" by setting a flag in localStorage.
   - On every other page, if the flag is set, the "Log In" links in the
     desktop nav, mobile menu, and footer become a "Dashboard" link
     pointing at the appropriate dashboard.
   - The student dashboard's Logout button clears the flag.

   Student and host sites use SEPARATE flags so being logged in to one
   does not affect the other (they share an origin on GitHub Pages).
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  function currentFile() {
    var path = window.location.pathname;
    var file = path.substring(path.lastIndexOf('/') + 1);
    return file || 'index.html';
  }

  function isHostPage(file) {
    return file === 'become-a-host.html' || /^host-/.test(file);
  }

  var file = currentFile();
  var host = isHostPage(file);
  var KEY  = host ? 'ush_host_loggedin'   : 'ush_student_loggedin';
  var DASH = host ? 'host-dashboard.html' : 'dashboard.html';

  // 1) On a dashboard page, mark the user as logged in for this site.
  if (file === 'dashboard.html' || file === 'host-dashboard.html') {
    try { localStorage.setItem(KEY, '1'); } catch (_) {}
  }

  function isLoggedIn() {
    try { return localStorage.getItem(KEY) === '1'; } catch (_) { return false; }
  }

  function swapToDashboard(el) {
    if (!el) return;
    el.textContent = 'Dashboard';
    el.setAttribute('href', DASH);
    el.removeAttribute('onclick');
    el.onclick = null;
    // Capture-phase listener fires BEFORE any existing click handlers
    // (e.g. the per-page openLoginModal binding) so we win the race.
    el.addEventListener('click', function (e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      window.location.href = DASH;
    }, true);
  }

  function applyLoggedInUi() {
    if (!isLoggedIn()) return;

    // Anchors with known IDs (used across student + host pages)
    ['navLogin', 'mobileLogin', 'navLoginLink', 'mobileLoginLink', 'footerLoginLink']
      .forEach(function (id) { swapToDashboard(document.getElementById(id)); });

    // Anchors that wire up the modal via inline onclick (apply, contact, etc.)
    document.querySelectorAll('a[onclick*="openLoginModal"]').forEach(swapToDashboard);
  }

  function bindLogout() {
    var btn = document.getElementById('logoutBtn');
    if (!btn) return;
    // Capture phase so we clear the flag before the existing redirect runs.
    btn.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (_) {}
    }, true);
  }

  function init() {
    applyLoggedInUi();
    bindLogout();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
