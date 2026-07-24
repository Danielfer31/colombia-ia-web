(function () {
  'use strict';

  var VERT = [
    '#version 300 es',
    'in vec2 a_pos;',
    'void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    '#version 300 es',
    'precision highp float;',
    'out vec4 fragColor;',
    'uniform vec2 u_res;',
    'uniform float u_time;',
    'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float noise(vec2 p) {',
    '  vec2 i = floor(p); vec2 f = fract(p);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  float a = hash(i), b = hash(i + vec2(1.0, 0.0));',
    '  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));',
    '  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
    '}',
    'float fbm(vec2 p) {',
    '  float v = 0.0; float a = 0.5;',
    '  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }',
    '  return v;',
    '}',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / u_res.xy;',
    '  vec2 p = uv; p.x *= u_res.x / u_res.y;',
    '  float t = u_time * 0.045;',
    '  float f = fbm(p * 1.6 + vec2(t, t * 0.6));',
    '  f = fbm(p * 1.9 + vec2(f * 1.4, -t * 0.8));',
    '  vec3 navy = vec3(0.000, 0.102, 0.310);',
    '  vec3 blue = vec3(0.000, 0.435, 0.788);',
    '  vec3 gold = vec3(1.000, 0.725, 0.000);',
    '  vec3 col = mix(navy, blue, smoothstep(0.34, 0.95, f));',
    '  float g = smoothstep(0.70, 1.0, f) * smoothstep(1.0, 0.30, length(uv - vec2(0.78, 0.62)) * 1.6);',
    '  col = mix(col, gold, g * 0.26);',
    '  col *= 0.92 + 0.08 * fbm(p * 6.0 - t);',
    '  col += (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.018;',
    '  fragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('[hero-gl] shader error:', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  function init(canvas) {
    if (!canvas) return null;
    var gl = null;
    try { gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch (e) {}
    if (!gl) {
      canvas.parentElement.classList.add('no-gl');
      return null;
    }

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { canvas.parentElement.classList.add('no-gl'); return null; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[hero-gl] link error:', gl.getProgramInfoLog(prog));
      canvas.parentElement.classList.add('no-gl');
      return null;
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'u_res');
    var uTime = gl.getUniformLocation(prog, 'u_time');

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var running = false;
    var start = performance.now();
    var rafId = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }

    function draw(now) {
      resize();
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now) {
      draw(now);
      if (running) rafId = requestAnimationFrame(loop);
    }

    function play() {
      if (running || reduced) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    }

    function pause() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }

    window.addEventListener('resize', function () { if (!running) draw(performance.now()); }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause(); else play();
    });

    // Pausa cuando el hero sale de pantalla.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) play(); else pause(); });
      }, { threshold: 0 }).observe(canvas);
    }

    draw(performance.now());
    if (!reduced) play();
    return { play: play, pause: pause, gl: gl };
  }

  window.ColombIAGL = { init: init };
})();
