/* ==========================================================================
   SRF CORPORATION — site interactions
   Static site: no dependencies, no build step, progressive enhancement.
   ========================================================================== */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: scrolled state ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById('navToggle');
  var siteNav = document.getElementById('siteNav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    siteNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Theme toggle (light / dark) ---------- */
  var themeToggle = document.getElementById('themeToggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var THEME_BG = { dark: '#05070D', light: '#F4F7FC' };
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', THEME_BG[theme]);
    if (themeToggle) {
      var label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('title', label);
    }
  }
  applyTheme(currentTheme());       // sync meta theme-color + label with the pre-paint choice
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('srf-theme', next); } catch (e) { /* private mode */ }
    });
  }

  /* No explicit choice yet → keep following the system preference live
     (e.g. OS switches to dark at sunset → site switches with it). */
  function storedTheme() {
    try {
      var t = localStorage.getItem('srf-theme');
      return (t === 'light' || t === 'dark') ? t : null;
    } catch (e) { return null; }
  }
  var themeMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  if (themeMQ) {
    var onSystemTheme = function (e) {
      if (!storedTheme()) applyTheme(e.matches ? 'light' : 'dark');
    };
    if (themeMQ.addEventListener) themeMQ.addEventListener('change', onSystemTheme);
    else if (themeMQ.addListener) themeMQ.addListener(onSystemTheme);   // old Safari
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.setProperty('--d', d);
  });
  if ('IntersectionObserver' in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters (stat tiles) ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (reducedMotion) { el.textContent = target + suffix; return; }
    var duration = 1600;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4);            // easeOutQuart
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var countEls = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    countEls.forEach(function (el) { countObserver.observe(el); });
  } else {
    countEls.forEach(animateCount);
  }

  /* ---------- Scrollspy: highlight active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var spySections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);
  if (spySections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spySections.forEach(function (sec) { spy.observe(sec); });
  }

  /* ---------- Service cards: cursor-following glow ---------- */
  if (canHover) {
    document.querySelectorAll('.service-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
    });
  }

  /* ---------- Hero particle network ---------- */
  (function initParticles() {
    var canvas = document.getElementById('particles');
    if (!canvas || reducedMotion) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var hero = canvas.closest('.hero');
    var w = 0, h = 0, nodes = [], rafId = null, inView = true;
    var mouse = { x: -9999, y: -9999 };
    var LINK_DIST = 130;
    var PALETTES = {
      dark:  ['56, 189, 248', '33, 150, 243', '125, 211, 252'],
      light: ['21, 101, 216', '3, 105, 161', '2, 132, 199']
    };

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(28, Math.min(95, Math.floor((w * h) / 17000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.5 + 0.7,
          ci: (Math.random() * 3) | 0
        });
      }
    }

    function step() {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var pal = isLight ? PALETTES.light : PALETTES.dark;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        /* gentle repulsion around the cursor */
        var dxm = n.x - mouse.x, dym = n.y - mouse.y;
        var dm = Math.hypot(dxm, dym);
        if (dm < 140 && dm > 0.01) {
          var f = (140 - dm) / 140 * 0.6;
          n.x += (dxm / dm) * f;
          n.y += (dym / dm) * f;
        }

        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }

      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x;
          var dy = nodes[a].y - nodes[b].y;
          var d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            var alpha = (1 - d / LINK_DIST) * (isLight ? 0.22 : 0.16);
            ctx.strokeStyle = 'rgba(' + pal[nodes[a].ci] + ', ' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
          }
        }
      }

      for (var j = 0; j < nodes.length; j++) {
        var p = nodes[j];
        ctx.fillStyle = 'rgba(' + pal[p.ci] + ', ' + (isLight ? 0.6 : 0.8) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(step);
    }

    function play() {
      if (rafId === null && inView && !document.hidden) rafId = requestAnimationFrame(step);
    }
    function pause() {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    }

    hero.addEventListener('pointermove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });
    hero.addEventListener('pointerleave', function () {
      mouse.x = -9999; mouse.y = -9999;
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        inView ? play() : pause();
      }, { threshold: 0.02 }).observe(hero);
    }

    document.addEventListener('visibilitychange', function () {
      document.hidden ? pause() : play();
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    play();
  })();

  /* ---------- Client tabs ---------- */
  (function initTabs() {
    var tablist = document.querySelector('.client-tabs');
    if (!tablist) return;
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('.tab-btn'));
    var panels = tabs.map(function (t) {
      return document.getElementById(t.getAttribute('aria-controls'));
    });

    function activate(idx) {
      tabs.forEach(function (t, i) {
        var on = i === idx;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.setAttribute('tabindex', on ? '0' : '-1');
        if (panels[i]) {
          panels[i].classList.toggle('is-active', on);
          panels[i].hidden = !on;
        }
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(i); });
      tab.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = (i + dir + tabs.length) % tabs.length;
        activate(next);
        tabs[next].focus();
      });
    });
  })();

  /* ---------- Contact form (Web3Forms → email to sales@) ---------- */
  var WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
  var form = document.getElementById('contactForm');
  if (form) {
    var note = form.querySelector('.form-note');
    var submitBtn = form.querySelector('button[type="submit"]');
    var accessKeyEl = form.querySelector('input[name="access_key"]');
    var setNote = function (text, kind) {
      note.textContent = text;
      note.className = 'form-note' + (kind ? ' is-' + kind : '');
    };
    var field = function (id) {
      var el = form.querySelector('#' + id);
      return el ? String(el.value || '').trim() : '';
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var invalid = Array.prototype.filter.call(
        form.querySelectorAll('input, textarea'),
        function (f) { return f.required && !f.value.trim(); }
      );
      if (invalid.length) {
        setNote('Please fill in all the highlighted fields.', 'error');
        invalid[0].focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field('cf-email'))) {
        setNote('That email address does not look right — please check it.', 'error');
        var emailEl = form.querySelector('#cf-email');
        if (emailEl) { emailEl.focus(); }
        return;
      }
      if (field('cf-gotcha')) {
        // Honeypot filled — almost certainly a bot. Pretend success, send nothing.
        setNote('Thank you — your request is in. Our team will get back to you shortly.', 'success');
        form.reset();
        return;
      }
      var payload = {
        access_key: accessKeyEl ? accessKeyEl.value : '',
        from_name: 'SRF Corporation — Website Inquiry',
        name: field('cf-name'),
        company: field('cf-company'),
        phone: field('cf-phone'),
        email: field('cf-email'),
        subject: field('cf-subject'),
        message: field('cf-message'),
        page: window.location.href.split('#')[0],
        referrer: document.referrer || ''
      };
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      setNote('Sending your request…', '');
      fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data || !data.success) { throw new Error('rejected'); }
          setNote('Thank you — your request is in. Our team will get back to you shortly.', 'success');
          form.reset();
        })
        .catch(function () {
          setNote('Something went wrong — please email sales@srfbd.com or use the WhatsApp button below.', 'error');
        })
        .then(function () { // always re-enable the button (ES5-friendly "finally")
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Request'; }
        });
    });
  }
})();
