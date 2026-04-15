/* ============================================================
   Glimt – Mobile Navigation (hamburger menu)
   Injiserer hamburgerknapp + mobilmeny automatisk.
   Inkluder dette scriptet i alle sider etter </header>.
   ============================================================ */
(function () {
  'use strict';

  // Vent til DOM er klar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // 1. Opprett hamburgerknapp
    var btn = document.createElement('button');
    btn.className = 'nav-hamburger';
    btn.setAttribute('aria-label', 'Åpne meny');
    btn.innerHTML = '<span></span>';
    navbar.appendChild(btn);

    // 2. Opprett mobilmeny-overlay
    var overlay = document.createElement('div');
    overlay.className = 'nav-mobile-overlay';

    // Samle alle lenker fra nav dropdown-grupper + direkte lenker
    var links = [];
    var dropdownGroups = navbar.querySelectorAll('.nav-dropdown-group');
    var directLinks = navbar.querySelectorAll('nav > a:not(.nav-login-btn)');
    var loginBtn = navbar.querySelector('.nav-login-btn');

    if (dropdownGroups.length > 0) {
      dropdownGroups.forEach(function (group) {
        var trigger = group.querySelector('.nav-dropdown-trigger');
        var menu = group.querySelector('.nav-dropdown-menu');
        if (trigger && menu) {
          // Seksjonstittel
          var section = document.createElement('div');
          section.className = 'nav-mobile-section';
          section.textContent = trigger.textContent.trim();
          overlay.appendChild(section);

          // Lenker i gruppen
          var groupLinks = menu.querySelectorAll('a');
          groupLinks.forEach(function (a) {
            var link = document.createElement('a');
            link.href = a.href;
            link.textContent = a.textContent.trim();
            overlay.appendChild(link);
          });
        }
      });
    }

    // Direkte lenker (f.eks. "← Tilbake")
    directLinks.forEach(function (a) {
      var link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent.trim();
      overlay.appendChild(link);
    });

    // Divider + Login
    if (loginBtn && loginBtn.style.display !== 'none') {
      var divider = document.createElement('div');
      divider.className = 'nav-mobile-divider';
      overlay.appendChild(divider);

      var loginLink = document.createElement('a');
      loginLink.href = loginBtn.href;
      loginLink.textContent = loginBtn.textContent.trim();
      loginLink.style.color = '#fff';
      loginLink.style.fontWeight = '500';
      overlay.appendChild(loginLink);
    }

    document.body.appendChild(overlay);

    // 3. Toggle-logikk
    btn.addEventListener('click', function () {
      var isOpen = btn.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      btn.setAttribute('aria-label', isOpen ? 'Lukk meny' : 'Åpne meny');
    });

    // Lukk ved klikk på lenke i mobilmeny
    overlay.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        btn.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Lukk ved Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        btn.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
})();
