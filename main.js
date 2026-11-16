(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  document.querySelectorAll('[data-count]').forEach(countUp);

  /* ---- Glitch del título ---- */
  var glitch = document.querySelector('.glitch');
  if (glitch && !reduceMotion) {
    var fire = function () { glitch.classList.remove('run'); void glitch.offsetWidth; glitch.classList.add('run'); };
    setTimeout(fire, 500);
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
