(function () {
  'use strict';

  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var sideNav = document.getElementById('side-nav');
  var navLinks = document.querySelectorAll('.sn-item[data-page-link]');
  var pages = document.querySelectorAll('[data-page]');

  var PAGES = ['inicio', 'incidencia', 'investigaciones', 'cursos', 'soluciones'];
  var state = { page: 'inicio', scrolled: false, booted: false };

  function isPage(id) { return PAGES.indexOf(id) !== -1; }

  // '#pagina-cursos' -> 'cursos'; '#contenido' -> 'inicio'; otro -> null
  function pageFromHash(hash) {
    if (!hash) return null;
    var h = hash.replace(/^#/, '');
    if (h === 'contenido') return 'inicio';
    if (h.indexOf('pagina-') === 0 && isPage(h.slice(7))) return h.slice(7);
    return null;
  }

  function hashForPage(id) { return id === 'inicio' ? '#contenido' : '#pagina-' + id; }

  function render() {
    var onDark = state.page === 'inicio' && !state.scrolled;
    sideNav.classList.toggle('on-dark', onDark);

    navLinks.forEach(function (a) {
      var current = a.getAttribute('data-page-link') === state.page;
      a.classList.toggle('is-current', current);
      // aria-current: la clase sola no le dice nada a un lector de pantalla
      if (current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    pages.forEach(function (p) {
      var active = p.getAttribute('data-page') === state.page;
      p.classList.toggle('is-active', active);
      // Sin esto el documento declara cinco <main> visibles (HTML inválido)
      p.hidden = !active;
    });
  }

  // ── Barra de navegación ───────────────────────────────────────────────
  var PROXIMITY = 170;
  var navOpen = false;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function setNavOpen(open) {
    if (open === navOpen) return;
    navOpen = open;
    sideNav.classList.toggle('is-open', open);
  }

  if (fine) {
    window.addEventListener('mousemove', function (e) {
      var r = sideNav.getBoundingClientRect();
      var dx = e.clientX < r.left ? r.left - e.clientX : (e.clientX > r.right ? e.clientX - r.right : 0);
      var dy = e.clientY < r.top ? r.top - e.clientY : (e.clientY > r.bottom ? e.clientY - r.bottom : 0);
      setNavOpen(Math.sqrt(dx * dx + dy * dy) < PROXIMITY);
    }, { passive: true });
  } else {
    // Táctil: el primer toque despliega, el segundo navega.
    // Se intercepta en touchstart y no en click: al abrirse, la barra cambia
    // de tamaño (y en móvil pasa a columna), así que el ítem se movía de sitio
    // entre el pointerdown y el click y el primer toque se perdía entero.
    sideNav.addEventListener('touchstart', function (e) {
      if (!navOpen) {
        e.preventDefault();   // cancela también el click sintetizado
        setNavOpen(true);
      }
    }, { passive: false });

    // Respaldo para navegadores táctiles sin eventos touch
    sideNav.addEventListener('click', function (e) {
      if (!navOpen) {
        e.preventDefault();
        e.stopPropagation();
        setNavOpen(true);
      }
    }, true);

    document.addEventListener('click', function (e) {
      if (navOpen && !sideNav.contains(e.target)) setNavOpen(false);
    });
    document.addEventListener('touchstart', function (e) {
      if (navOpen && !sideNav.contains(e.target)) setNavOpen(false);
    }, { passive: true });
  }

  // ── Páginas y anclas ──────────────────────────────────────────────────
  function setPage(id, opts) {
    opts = opts || {};
    if (!isPage(id)) id = 'inicio';
    state.page = id;
    state.scrolled = false;
    window.scrollTo(0, 0);
    render();
    // Las páginas ocultas no tienen medidas: sus reveals no se pudieron
    // preparar al arrancar. Se preparan ahora que la página es visible.
    setupReveal();
    setupNetworks();
    if (!fine) setNavOpen(false);   // en táctil la barra tapaba el contenido
    if (opts.focus) {
      var main = document.querySelector('[data-page].is-active');
      if (main) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
    }
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    // scrollIntoView respeta el scroll-margin-top del CSS, así el destino no
    // queda debajo de la barra fija (window.scrollTo con un -40 fijo, sí).
    el.scrollIntoView({ behavior: mq.matches ? 'auto' : 'smooth', block: 'start' });
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
      var id = a.getAttribute('data-page-link');
      e.preventDefault();
      if (id === state.page) return;
      setPage(id, { focus: true });
      // Sin esto la URL nunca cambia: no se puede compartir ni marcar una
      // página, y el botón «atrás» del navegador sale del sitio.
      try { history.pushState({ page: id }, '', hashForPage(id)); } catch (err) {}
    });
  });

  document.querySelectorAll('[data-section-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var id = a.getAttribute('data-section-link');
      goSection(id);
      try { history.replaceState(history.state, '', '#' + id); } catch (err) {}
    });
  });

  // Anclas internas sueltas (#ruta-decidir, #ruta-formular…): el salto nativo
  // combinado con scroll-behavior:smooth ignoraba el scroll-margin-top y
  // dejaba el destino justo debajo de la barra fija. scrollIntoView sí lo
  // respeta, así que se encaminan todas por el mismo sitio.
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (a.hasAttribute('data-page-link') || a.hasAttribute('data-section-link')) return;
    if (a.classList.contains('skip-link')) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    a.addEventListener('click', function (e) {
      if (!document.getElementById(id)) return;   // sin destino: comportamiento normal
      e.preventDefault();
      scrollToId(id);
      try { history.replaceState(history.state, '', '#' + id); } catch (err) {}
    });
  });

  window.addEventListener('popstate', function () {
    var id = pageFromHash(location.hash);
    if (id) { setPage(id); return; }
    var frag = location.hash.replace(/^#/, '');
    if (frag && document.getElementById(frag)) goSection(frag);
    else setPage('inicio');
  });

  // Saltar al contenido: debe llevar al <main> activo, no siempre al de inicio
  var skip = document.querySelector('.skip-link');
  if (skip) {
    skip.addEventListener('click', function (e) {
      e.preventDefault();
      var main = document.querySelector('[data-page].is-active');
      if (!main) return;
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.scrollIntoView({ block: 'start' });
    });
  }

  window.addEventListener('scroll', function () {
    var s = window.scrollY > 40;
    if (s !== state.scrolled) {
      state.scrolled = s;
      render();
    }
  }, { passive: true });

  // ── Reveal al hacer scroll ────────────────────────────────────────────
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

  function isHidden(el) {
    return !el.offsetParent && getComputedStyle(el).position !== 'fixed';
  }

  function setupReveal() {
    document.querySelectorAll('[data-reveal]:not([data-rv])').forEach(function (el) {
      // En una página oculta getBoundingClientRect() devuelve ceros: si se
      // marcaran aquí, quedarían descartadas para siempre y las páginas
      // internas nunca animarían nada.
      if (isHidden(el)) return;
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
      if (isHidden(svg)) return;
      svg.setAttribute('data-nw', '1');
      if (mq.matches) return; // estático con movimiento reducido
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

    // Entrada directa por URL: #pagina-cursos abre esa página; #conversemos
    // (o cualquier otro id) se resuelve como ancla dentro de inicio.
    var fromHash = pageFromHash(location.hash);
    if (fromHash && fromHash !== state.page) {
      setPage(fromHash);
    } else {
      render();
      setupReveal();
      setupNetworks();
      var frag = location.hash.replace(/^#/, '');
      if (frag && document.getElementById(frag)) {
        setTimeout(function () { scrollToId(frag); }, 60);
      }
    }
  }

  // El hero controla el preloader: arrancamos cuando termina.
  var pre = document.getElementById('preloader');
  if (pre && !pre.classList.contains('is-done')) {
    document.addEventListener('colombia:hero-ready', boot, { once: true });
    // Red de seguridad si hero.js fallara: además de arrancar, hay que soltar
    // el bloqueo de scroll y retirar el preloader, o la página queda muerta.
    setTimeout(function () {
      if (state.booted) return;
      document.documentElement.classList.remove('is-loading');
      pre.classList.add('is-done');
      var hero = document.getElementById('hero');
      if (hero) hero.classList.add('is-ready');
      boot();
    }, 8000);
  } else {
    boot();
  }
})();
