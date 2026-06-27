/* =================================================================
   CENTRO DE GOVERNANÇA AMBIENTAL RODOVIÁRIA — CONSÓRCIO MATUPIRI
   Interaction & motion layer (vanilla JS, sem dependências — funciona offline)
   ================================================================= */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loader ---------- */
  window.addEventListener('load', function () {
    var loader = document.getElementById('loader');
    if (loader) setTimeout(function () { loader.classList.add('done'); }, 350);
  });
  // fallback caso 'load' demore
  setTimeout(function () {
    var loader = document.getElementById('loader');
    if (loader) loader.classList.add('done');
  }, 2600);

  /* ---------- NAV: scroll + progresso ---------- */
  var nav = document.getElementById('nav');
  var progress = document.querySelector('.scroll-progress span');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Hero: linhas do título ---------- */
  document.querySelectorAll('.hero__title .line').forEach(function (line, i) {
    setTimeout(function () { line.classList.add('is-visible'); }, reduceMotion ? 0 : 500 + i * 150);
  });

  /* ---------- Parallax suave no hero ---------- */
  if (!reduceMotion) {
    var heroImg = document.querySelector('.hero__media img');
    var heroGrid = document.querySelector('.hero__grid');
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > window.innerHeight * 1.2) return;
      if (heroImg) heroImg.style.transform = 'scale(1.06) translateY(' + y * 0.06 + 'px)';
      if (heroGrid) heroGrid.style.transform = 'translateY(' + y * 0.12 + 'px)';
    }, { passive: true });
  }

  /* ---------- Contadores animados ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1700, start = null;
    function format(n) { return Math.round(n).toLocaleString('pt-BR'); }
    if (reduceMotion) { el.textContent = format(target) + suffix; return; }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- IntersectionObserver: reveal genérico ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('is-visible');
      el.querySelectorAll('[data-count]').forEach(animateCount);
      if (el.hasAttribute('data-count')) animateCount(el);
      io.unobserve(el);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('[data-reveal], .flow').forEach(function (el) { io.observe(el); });

  /* ---------- Stagger nos grupos ---------- */
  function stagger(selector, child) {
    document.querySelectorAll(selector).forEach(function (group) {
      group.querySelectorAll(child).forEach(function (c, i) {
        c.style.transitionDelay = (i * 70) + 'ms';
      });
    });
  }
  stagger('.stats-primary', '.stat');
  stagger('.stats-grid', '.stat');
  stagger('.mosaic', '.tile');
  stagger('.library', '.book');
  stagger('.flow__steps', '.flow__step');

  /* ---------- Painel: troca automática das telas do dashboard ---------- */
  var views = document.querySelectorAll('.dash__view');
  var navDots = document.querySelectorAll('.dash__nav span');
  if (views.length > 1 && !reduceMotion) {
    var cur = 0;
    setInterval(function () {
      views[cur].classList.remove('on');
      cur = (cur + 1) % views.length;
      views[cur].classList.add('on');
      navDots.forEach(function (d, i) { d.classList.toggle('on', i === cur); });
    }, 3600);
  }

  /* ---------- Mapa GIS: toggles de camada ---------- */
  document.querySelectorAll('.gis__layer').forEach(function (layer) {
    layer.addEventListener('click', function () {
      var off = layer.classList.toggle('off');
      var key = layer.getAttribute('data-layer');
      document.querySelectorAll('.gis__pt[data-k="' + key + '"]').forEach(function (pt) {
        pt.style.display = off ? 'none' : '';
      });
    });
  });

  /* ---------- Active link no nav conforme a seção ---------- */
  var navLinks = document.querySelectorAll('.nav__links a');
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var id = e.target.getAttribute('id');
      navLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('section[id]').forEach(function (s) { spy.observe(s); });

  /* =================================================================
     QR CODE — gerador real (qrcode-generator embutido)
     ================================================================= */
  var CONFIG = { url: 'https://consorciomatupiri.com.br/#biblioteca' };
  if (/^https?:/.test(window.location.href)) {
    CONFIG.url = window.location.href.split('#')[0] + '#biblioteca';
  }
  renderQR(CONFIG.url);

  function renderQR(text) {
    var host = document.getElementById('qr');
    if (!host) return;
    try {
      var m = QR8bitByte(text), n = m.length;
      var svg = '<svg viewBox="0 0 ' + n + ' ' + n + '" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">';
      svg += '<rect width="' + n + '" height="' + n + '" fill="#fff"/>';
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
        if (m[r][c]) svg += '<rect x="' + c + '" y="' + r + '" width="1" height="1" fill="#3a0046"/>';
      }
      svg += '</svg>';
      host.innerHTML = svg;
    } catch (err) {
      host.innerHTML = '<svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><rect width="21" height="21" fill="#fff"/></svg>';
    }
  }
})();

/* QR encoder mínimo (byte, EC level M) — qrcode-generator (Kazuhiko Arase, MIT). */
function QR8bitByte(text) {
  var qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  var n = qr.getModuleCount(), m = [];
  for (var r = 0; r < n; r++) { m[r] = []; for (var c = 0; c < n; c++) m[r][c] = qr.isDark(r, c); }
  return m;
}
