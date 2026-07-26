(function () {
  'use strict';

  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = mq.matches;

  var preloader = document.getElementById('preloader');
  var plNum = document.getElementById('pl-num');
  var plBar = document.getElementById('pl-bar');
  var root = document.documentElement;

  // Visita repetida en la misma sesión: preloader corto.
  var seen = false;
  try { seen = sessionStorage.getItem('colombia:seen') === '1'; } catch (e) {}
  var MIN_MS = reduced ? 0 : (seen ? 500 : 1900);

  var started = Date.now();
  var progress = 0;
  var assetsReady = false;

  function paint(v) {
    progress = Math.max(progress, Math.min(100, Math.round(v)));
    if (plNum) plNum.textContent = String(progress);
    if (plBar) plBar.style.width = progress + '%';
  }

  function tick() {
    var elapsed = Date.now() - started;
    var timeShare = Math.min(1, elapsed / MIN_MS) * 88;
    var assetShare = assetsReady ? 12 : 0;
    paint(timeShare + assetShare);
    if (progress < 100) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(dismiss, reduced ? 0 : 380);
    }
  }

  function dismiss() {
    try { sessionStorage.setItem('colombia:seen', '1'); } catch (e) {}
    root.classList.remove('is-loading');
    preloader.classList.add('is-out');
    var wait = reduced ? 0 : 1100;
    setTimeout(function () {
      preloader.classList.add('is-done');
      var hero = document.getElementById('hero');
      if (hero) hero.classList.add('is-ready');
      // Cada pieza se aísla: si el WebGL o el cursor fallan en algún
      // navegador, el evento debe emitirse igual o main.js nunca arranca.
      try { if (window.ColombIAGL) window.ColombIAGL.init(document.getElementById('hero-canvas')); } catch (e) {}
      try { initRotator(); } catch (e) {}
      try { initCursor(); } catch (e) {}
      document.dispatchEvent(new CustomEvent('colombia:hero-ready'));
    }, wait);
  }

  function markAssets() {
    assetsReady = true;
  }

  if (document.readyState === 'complete') {
    markAssets();
  } else {
    window.addEventListener('load', markAssets);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(markAssets)['catch'](function () { markAssets(); });
  }
  // Red de seguridad: nunca dejar el preloader colgado.
  setTimeout(markAssets, 6000);

  // ---------- Rotador de frases ----------
  function initRotator() {
    var rot = document.getElementById('hero-rotator');
    if (!rot) return;
    var items = rot.querySelectorAll('.rotator-item');
    if (items.length < 2 || reduced) return;

    var idx = 0;
    var timer = 0;

    function step() {
      var out = items[idx];
      idx = (idx + 1) % items.length;
      var next = items[idx];
      out.classList.remove('is-active');
      out.classList.add('is-out');
      next.classList.remove('is-out');
      next.classList.add('is-active');
      setTimeout(function () { out.classList.remove('is-out'); }, 1000);
    }

    function play() { if (!timer) timer = setInterval(step, 4200); }
    function pause() { clearInterval(timer); timer = 0; }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause(); else play();
    });
    play();
  }

  // ---------- Cursor personalizado ----------
  function initCursor() {
    if (reduced) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      root.classList.add('has-cursor');
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      var hero = document.getElementById('hero');
      var overHero = hero && my < hero.getBoundingClientRect().bottom;
      ring.classList.toggle('on-light', !overHero);
    }, { passive: true });

    // mouseleave sobre `document` no se dispara de forma fiable; el elemento
    // raíz sí avisa cuando el puntero abandona la ventana.
    root.addEventListener('mouseleave', function () { root.classList.remove('has-cursor'); });

    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest && e.target.closest('a, button, [data-cursor]');
      ring.classList.toggle('is-hover', !!t);
    }, { passive: true });

    (function follow() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(follow);
    })();
  }

  if (!preloader) {
    root.classList.remove('is-loading');
    return;
  }

  requestAnimationFrame(function () {
    preloader.classList.add('is-in');
    tick();
  });
})();
