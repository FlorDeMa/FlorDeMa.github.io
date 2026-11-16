(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  /* ---- Pantalla de carga ---- */
  var loader = document.getElementById('loader');
  var glitchStart = null;
  function finishLoading() {
    if (!loader || loader.classList.contains('done')) return;
    loader.classList.add('done');
    body.classList.remove('is-loading');
    body.classList.add('loaded');
    if (glitchStart) setTimeout(glitchStart, 600);
    setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 900);
  }
  (function runLoader() {
    if (!loader) { body.classList.remove('is-loading'); body.classList.add('loaded'); return; }
    var fill = document.getElementById('ldFill');
    var pct = document.getElementById('ldPct');
    var stepEl = document.getElementById('ldStep');
    var steps = ['Conectando con el servidor', 'Cargando proyectos', 'Compilando evidencias', 'Desbloqueando logros', 'Listo para jugar'];
    var pageReady = document.readyState === 'complete';
    window.addEventListener('load', function () { pageReady = true; });
    var p = 0, minTime = 1700, t0 = performance.now();
    (function tick() {
      var elapsed = performance.now() - t0;
      var cap = pageReady ? 100 : 88;
      var lin = Math.min(1, elapsed / minTime);
      p = Math.max(p, Math.min(cap, (1 - Math.pow(1 - lin, 2)) * 100));
      var v = Math.round(p);
      fill.style.width = v + '%';
      pct.textContent = v + '%';
      stepEl.textContent = steps[Math.min(steps.length - 1, Math.floor(v / 21))];
      if (v >= 100) { setTimeout(finishLoading, 250); return; }
      if (elapsed > 4500) { finishLoading(); return; }
      setTimeout(tick, 30);
    })();
  })();

  /* ---- Índices para animaciones escalonadas ---- */
  document.querySelectorAll('.stagger').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', i); });
  });
  document.querySelectorAll('.loot').forEach(function (l) {
    Array.prototype.forEach.call(l.children, function (c, i) { c.style.setProperty('--i', i); });
  });

  /* ---- Barra de progreso y parallax del lobby ---- */
  var bar = document.getElementById('scrollProgress');
  var lobbyBg = document.querySelector('.lobby-bg');
  var ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.scrollY;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (lobbyBg && !reduceMotion && y < window.innerHeight * 1.2) lobbyBg.style.transform = 'translateY(' + (y * 0.35) + 'px) scale(1.08)';
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---- Menú móvil ---- */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---- Revelado al hacer scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Contadores ---- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion || !target) { el.textContent = target; return; }
    var start = null;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function startCounters() { document.querySelectorAll('[data-count]').forEach(countUp); }
  if (body.classList.contains('loaded')) startCounters();
  else { var prev = glitchStart; glitchStart = function () { startCounters(); if (prev) prev(); }; }

  /* ---- Glitch del título ---- */
  var glitch = document.querySelector('.glitch');
  if (glitch && !reduceMotion) {
    var fire = function () { glitch.classList.remove('run'); void glitch.offsetWidth; glitch.classList.add('run'); };
    if (body.classList.contains('loaded')) setTimeout(fire, 500);
    else { var prevStart = glitchStart; glitchStart = function () { if (prevStart) prevStart(); fire(); }; }
    glitch.addEventListener('mouseenter', fire);
  }

  /* ---- Lightbox ---- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbClose = document.getElementById('lbClose');
  function openLb(src, cap, alt) {
    lbImg.src = src; lbImg.alt = alt || cap || ''; lbCap.textContent = cap || '';
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
  }
  function closeLb() { if (lb.close) lb.close(); else lb.removeAttribute('open'); }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-full]');
    if (!btn) return;
    var img = btn.querySelector('img');
    openLb(btn.getAttribute('data-full'), btn.getAttribute('data-caption'), img && img.alt);
  });
  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

  /* ---- YouTube ligero: carga el reproductor solo al hacer clic ---- */
  document.querySelectorAll('.yt').forEach(function (box) {
    var btn = box.querySelector('.yt-play');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var id = box.getAttribute('data-id');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      iframe.title = box.getAttribute('data-title') || 'Video';
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(iframe);
    });
  });

  /* ---- Texto que se escribe solo ---- */
  var typed = document.querySelector('.typed');
  if (typed && !reduceMotion) {
    var full = typed.getAttribute('data-text');
    typed.textContent = '';
    var startTyping = function () {
      var k = 0;
      (function type() {
        typed.textContent = full.slice(0, ++k);
        if (k < full.length) setTimeout(type, 28);
      })();
    };
    var prevT = glitchStart;
    if (body.classList.contains('loaded')) setTimeout(startTyping, 700);
    else glitchStart = function () { if (prevT) prevT(); setTimeout(startTyping, 700); };
  }

  /* ---- Tarjetas que se inclinan en 3D ---- */
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.hero-card, .feat-card, .ach').forEach(function (card) {
      card.classList.add('tilt');
      var glare = document.createElement('span');
      glare.className = 'glare';
      card.appendChild(glare);
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 10) + 'deg) rotateY(' + ((x - 0.5) * 12) + 'deg) translateY(-6px)';
        card.style.setProperty('--gx', (x * 100) + '%');
        card.style.setProperty('--gy', (y * 100) + '%');
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });

    /* Luz que sigue al cursor */
    var glow = document.getElementById('cursorGlow');
    if (glow) {
      var gx = 0, gy = 0, cx = 0, cy = 0, moving = false;
      window.addEventListener('mousemove', function (e) {
        gx = e.clientX; gy = e.clientY; glow.classList.add('on');
        if (!moving) { moving = true; requestAnimationFrame(follow); }
      });
      document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });
      var follow = function () {
        cx += (gx - cx) * 0.15; cy += (gy - cy) * 0.15;
        glow.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
        if (Math.abs(gx - cx) > 0.5 || Math.abs(gy - cy) > 0.5) requestAnimationFrame(follow); else moving = false;
      };
    }

    /* Profundidad del lobby al mover el mouse */
    var lobbyEl = document.querySelector('.lobby');
    var layers = [document.querySelector('.player'), document.querySelector('.last-match'), document.querySelector('.featured')];
    if (lobbyEl) {
      lobbyEl.addEventListener('mousemove', function (e) {
        var r = lobbyEl.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(function (l, i) {
          if (l) l.style.translate = (dx * (i + 1) * -10) + 'px ' + (dy * (i + 1) * -8) + 'px';
        });
      });
    }
  }

  /* ---- Menú: marca la sección visible ---- */
  var navLinks = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          navLinks.forEach(function (a) { a.classList.remove('active'); });
          map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) navIo.observe(s); });
  }

  /* ---- Brasas de neón en el lobby ---- */
  var canvas = document.getElementById('embers');
  if (canvas && !reduceMotion && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var parts = [];
    var colors = ['255,46,136', '0,240,255', '245,255,61'];
    var w, h, running = true;
    function resize() {
      var r = canvas.getBoundingClientRect();
      w = canvas.width = r.width; h = canvas.height = r.height;
    }
    function spawn(initial) {
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 10,
        r: Math.random() * 2 + 0.6,
        vy: Math.random() * 0.6 + 0.25,
        vx: (Math.random() - 0.5) * 0.4,
        a: Math.random() * 0.6 + 0.3,
        c: colors[Math.floor(Math.random() * colors.length)]
      };
    }
    resize();
    var n = Math.min(70, Math.round(w / 18));
    for (var i = 0; i < n; i++) parts.push(spawn(true));
    window.addEventListener('resize', resize);
    var lobby = document.querySelector('.lobby');
    if ('IntersectionObserver' in window && lobby) {
      new IntersectionObserver(function (en) { running = en[0].isIntersecting; if (running) requestAnimationFrame(tick); }).observe(lobby);
    }
    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        p.y -= p.vy; p.x += p.vx;
        if (p.y < -10) parts[j] = spawn(false);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')';
        ctx.shadowColor = 'rgba(' + p.c + ',1)';
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
})();
