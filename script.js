(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal, staggered among siblings that share a parent.
  var revealItems = document.querySelectorAll('[data-reveal]');
  revealItems.forEach(function (el) {
    var siblings = el.parentElement.querySelectorAll(':scope > [data-reveal]');
    el.style.setProperty('--i', Math.min(Array.prototype.indexOf.call(siblings, el), 4));
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Highlight the nav link of the section currently in view.
  var navLinks = document.querySelectorAll('.reference-nav a');
  var sections = [];
  navLinks.forEach(function (link) {
    var section = document.querySelector(link.getAttribute('href'));
    if (section) sections.push({ link: link, section: section });
  });

  function updateActiveNav() {
    var offset = window.innerHeight * 0.45;
    var current = null;
    sections.forEach(function (item) {
      if (item.section.getBoundingClientRect().top - offset <= 0) current = item;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', current !== null && link === current.link);
    });
  }

  // Reading progress along the bottom of the masthead.
  var progress = document.querySelector('.reference-progress');

  function updateProgress() {
    var max = root.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.transform = 'scaleX(' + ratio + ')';
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateActiveNav();
      updateProgress();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Theme toggle: an explicit choice is stored, otherwise follow the OS.
  var toggle = document.querySelector('.reference-theme-toggle');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');
  }

  function syncToggle() {
    var dark = currentTheme() === 'dark';
    toggle.textContent = dark ? '☀' : '☾';
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  toggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncToggle();
  });

  if (systemDark.addEventListener) systemDark.addEventListener('change', syncToggle);
  syncToggle();

  // Jump links scroll to their target and briefly highlight it.
  document.querySelectorAll('a[data-jump]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.classList.add('is-visible');
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      history.replaceState(null, '', link.getAttribute('href'));
      target.classList.remove('is-flash');
      void target.offsetWidth;
      target.classList.add('is-flash');
    });
  });

  // Figure lightbox for publication thumbnails.
  var lightbox = document.querySelector('.reference-lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    var lightboxImg = lightbox.querySelector('img');

    document.querySelectorAll('.reference-thumb').forEach(function (thumb) {
      thumb.addEventListener('click', function (event) {
        event.preventDefault();
        var img = thumb.querySelector('img');
        lightboxImg.src = thumb.getAttribute('href');
        lightboxImg.alt = img ? img.alt : '';
        lightbox.showModal();
      });
    });

    lightbox.querySelector('.reference-lightbox-close').addEventListener('click', function () {
      lightbox.close();
    });

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) lightbox.close();
    });
  }
})();
