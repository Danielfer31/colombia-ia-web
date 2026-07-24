(function () {
  'use strict';

  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var sideNav = document.getElementById('side-nav');
  var navLinks = document.querySelectorAll('.sn-item[data-page-link]');
  var pages = document.querySelectorAll('[data-page]');
  var heroVideo = document.getElementById('hero-video');
  var heroLogoStatic = document.getElementById('hero-logo-static');

  var state = { page: 'inicio', scrolled: false, booted: false };

  function render() {
    var onDark = state.page === 'inicio' && !state.scrolled;
    sideNav.classList.toggle('on-dark', onDark);

    navLinks.forEach(function (a) {
      a.classList.toggle('is-current', a.getAttribute('data-page-link') === state.page);
    });

    pages.forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-page') === state.page);
    });
  }

  // Barra lateral: se despliega al acercar el mouse
  var PROXIMITY = 170;
  var navOpen = false;

  function setNavOpen(open) {
    if (open === navOpen) return;
    navOpen = open;
    sideNav.classList.toggle('is-open', open);
  }

  if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', function (e) {
      var r = sideNav.getBoundingClientRect();
      var dx = e.clientX < r.left ? r.left - e.clientX : (e.clientX > r.right ? e.clientX - r.right : 0);
      var dy = e.clientY < r.top ? r.top - e.clientY : (e.clientY > r.bottom ? e.clientY - r.bottom : 0);
      setNavOpen(Math.sqrt(dx * dx + dy * dy) < PROXIMITY);
    }, { passive: true });
  } else {
    // Táctil: primer toque despliega, el segundo navega
    sideNav.addEventListener('click', function (e) {
      if (!navOpen) {
        e.preventDefault();
        setNavOpen(true);
      }
    }, true);
    document.addEventListener('click', function (e) {
      if (navOpen && !sideNav.contains(e.target)) setNavOpen(false);
    });
  }

  function setPage(id) {
    state.page = id;
    state.scrolled = false;
    window.scrollTo(0, 0);
    render();
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - 40;
    window.scrollTo({ top: y, behavior: mq.matches ? 'auto' : 'smooth' });
  }

  function goSection(id) {
    if (state.page !== 'inicio') {
      setPage('inicio');
      setTimeout(function () { scrollToId(id); }, 80);
    } else {
      scrollToId(id);
    }
  }

  document.querySelectorAll('[data-page-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      setPage(a.getAttribute('data-page-link'));
    });
  });

  document.querySelectorAll('[data-section-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      goSection(a.getAttribute('data-section-link'));
    });
  });

  window.addEventListener('scroll', function () {
    var s = window.scrollY > 40;
    if (s !== state.scrolled) {
      state.scrolled = s;
      render();
    }
  }, { passive: true });

  // Hero video vs static poster (respects reduced motion)
  function setupHeroMedia() {
    if (!heroVideo || !heroLogoStatic) return;
    if (mq.matches) {
      heroVideo.style.display = 'none';
      heroLogoStatic.style.display = 'block';
      return;
    }
    heroVideo.muted = true;
    heroVideo.playsInline = true;
    var p = heroVideo.play();
    if (p && p['catch']) p['catch'](function () {});
  }

  // Scroll-reveal
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      if (entry.target.hasAttribute('data-network')) {
        animateNetwork(entry.target);
      } else {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  function setupReveal() {
    document.querySelectorAll('[data-reveal]:not([data-rv])').forEach(function (el) {
      el.setAttribute('data-rv', '1');
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.85) return;
      el.style.opacity = '0';
      if (mq.matches) {
        el.style.transition = 'opacity 200ms ease';
      } else {
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 700ms cubic-bezier(.16,1,.3,1), transform 700ms cubic-bezier(.16,1,.3,1)';
        var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) {
          return c.hasAttribute && c.hasAttribute('data-reveal');
        });
        var idx = sibs.indexOf(el);
        if (idx > 0) el.style.transitionDelay = Math.min(idx * 90, 720) + 'ms';
      }
      io.observe(el);
    });
  }

  function setupNetworks() {
    document.querySelectorAll('[data-network]:not([data-nw])').forEach(function (svg) {
      svg.setAttribute('data-nw', '1');
      if (mq.matches) return; // static under reduced-motion
      svg.querySelectorAll('circle').forEach(function (n) {
        n.style.opacity = '0';
        n.style.transformOrigin = 'center';
        n.style.transformBox = 'fill-box';
      });
      svg.querySelectorAll('[data-edge]').forEach(function (p) {
        p.setAttribute('pathLength', '1');
        p.style.strokeDasharray = '1';
        p.style.strokeDashoffset = '1';
        p.style.opacity = '0';
      });
      io.observe(svg);
    });
  }

  // Tras la entrada, cada nodo queda pulsando con ritmo y desfase propios
  function startNodePulse(node, index) {
    if (mq.matches) return;
    var duration = 2600 + Math.random() * 1800;
    var delay = Math.random() * 2600 + index * 90;
    node.style.opacity = '';
    node.style.filter = '';
    node.style.animation = 'node-pulse ' + Math.round(duration) + 'ms ease-in-out ' +
      Math.round(delay) + 'ms infinite';
  }

  function animateNetwork(svg) {
    var nodes = svg.querySelectorAll('circle');
    nodes.forEach(function (n, i) {
      var fill = n.getAttribute('fill') || '#006FC9';
      n.style.filter = 'drop-shadow(0 0 6px ' + fill + ')';
      n.style.animation = 'node-in 500ms cubic-bezier(.16,1,.3,1) ' + (i * 120) + 'ms forwards';
      n.addEventListener('animationend', function () {
        startNodePulse(n, i);
      }, { once: true });
    });
    var edgeDelay = nodes.length * 120 + 100;
    svg.querySelectorAll('[data-edge]').forEach(function (p) {
      p.style.animation = 'edge-draw 1200ms ease-out ' + edgeDelay + 'ms forwards';
    });
  }

  function boot() {
    if (state.booted) return;
    state.booted = true;
    setupHeroMedia();
    setupReveal();
    setupNetworks();
    render();
  }

  // El hero controla el preloader: arrancamos cuando termina.
  var pre = document.getElementById('preloader');
  if (pre && !pre.classList.contains('is-done')) {
    document.addEventListener('colombia:hero-ready', boot, { once: true });
    // Red de seguridad si hero.js no cargara.
    setTimeout(function () { if (!state.booted) boot(); }, 8000);
  } else {
    boot();
  }
})();
