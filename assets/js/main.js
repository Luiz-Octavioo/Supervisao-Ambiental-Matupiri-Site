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
     CONSTELAÇÃO DA SUPERVISÃO AMBIENTAL (seção Desafio)
     Órbita viva: auto-ciclo + hover/foco/toque + linha ao núcleo + painel
     ================================================================= */
  (function () {
    var nodesG = document.getElementById('constelNodes');
    if (!nodesG) return;
    var constel = document.getElementById('constel');
    var link = document.getElementById('constelLink');
    var panel = document.getElementById('constelPanel');
    var pMk = panel.querySelector('.constel__panel-mk');
    var pTitle = document.getElementById('constelTitle');
    var pDesc = document.getElementById('constelDesc');
    var NS = 'http://www.w3.org/2000/svg';
    var CX = 240, CY = 240, R = 140;
    var THEMES = [
      ['Comunidades', 'Relacionamento territorial, comunicação social e acompanhamento de impactos sobre populações lindeiras.'],
      ['Condicionantes', 'Monitoramento de obrigações ambientais, prazos, evidências e conformidade.'],
      ['Licenças', 'Acompanhamento de licenças, autorizações, renovações e documentos ambientais.'],
      ['Fauna', 'Registros, ocorrências, monitoramentos e medidas de proteção à fauna.'],
      ['Flora', 'Acompanhamento de áreas vegetadas, supressão, recuperação e medidas de controle.'],
      ['Resíduos', 'Gestão, segregação, armazenamento, destinação e evidências de conformidade.'],
      ['Recursos Hídricos', 'Controle de interferências, drenagem, corpos hídricos, outorgas e medidas preventivas.']
    ];
    var nodes = [], coords = [], active = -1, paused = false, resumeT = null;

    THEMES.forEach(function (t, i) {
      var ang = (-90 + i * (360 / THEMES.length)) * Math.PI / 180;
      var x = CX + R * Math.cos(ang), y = CY + R * Math.sin(ang);
      coords.push([x, y]);
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'cnode');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', t[0] + ': ' + t[1]);
      var hit = document.createElementNS(NS, 'circle');
      hit.setAttribute('class', 'cnode__hit'); hit.setAttribute('cx', x); hit.setAttribute('cy', y); hit.setAttribute('r', 26);
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('class', 'cnode__dot'); dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 6);
      var lx = CX + (R + 22) * Math.cos(ang), ly = CY + (R + 22) * Math.sin(ang) + 3;
      var lbl = document.createElementNS(NS, 'text');
      lbl.setAttribute('class', 'cnode__lbl'); lbl.setAttribute('x', lx); lbl.setAttribute('y', ly);
      lbl.setAttribute('text-anchor', lx < CX - 12 ? 'end' : (lx > CX + 12 ? 'start' : 'middle'));
      lbl.textContent = t[0];
      g.appendChild(hit); g.appendChild(dot); g.appendChild(lbl);
      nodesG.appendChild(g);
      nodes.push(g);
      g.addEventListener('mouseenter', function () { setActive(i, true); });
      g.addEventListener('focus', function () { setActive(i, true); });
      g.addEventListener('click', function () { setActive(i, true); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(i, true); }
      });
    });

    constel.addEventListener('mouseleave', function () { paused = false; clearTimeout(resumeT); });

    function setActive(i, userInitiated) {
      active = i;
      constel.classList.add('has-active');
      nodes.forEach(function (n, j) { n.classList.toggle('is-active', j === i); });
      var c = coords[i];
      link.setAttribute('x2', c[0]); link.setAttribute('y2', c[1]); link.classList.add('on');
      pTitle.textContent = THEMES[i][0];
      pDesc.textContent = THEMES[i][1];
      panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
      if (userInitiated) {
        paused = true; clearTimeout(resumeT);
        resumeT = setTimeout(function () { paused = false; }, 6000);
      }
    }

    if (!reduceMotion) {
      var ai = 0;
      setTimeout(function () { if (!paused) setActive(0, false); }, 800);
      setInterval(function () {
        if (paused) return;
        ai = (ai + 1) % THEMES.length;
        setActive(ai, false);
      }, 2800);
    }
  })();

  /* =================================================================
     PROGRAMAS AMBIENTAIS — seletor interativo (carrossel + painel)
     Cards flutuantes, auto-rotação lenta com pausa ao interagir
     ================================================================= */
  (function () {
    var track = document.getElementById('progsTrack');
    if (!track) return;
    var panel = document.getElementById('progsPanel');
    var prevB = document.getElementById('progPrev');
    var nextB = document.getElementById('progNext');
    var PROGRAMS = [
      { sig: 'PAC', name: 'Programa Ambiental da Construção', cat: 'Execução',
        sum: 'Diretrizes ambientais para as frentes de obra.',
        desc: 'Estabelece diretrizes ambientais para a execução das obras, orientando frentes de serviço, canteiros, equipes, controle de impactos, boas práticas e conformidade ambiental durante a construção.',
        obj: 'Padronizar procedimentos ambientais nas frentes de serviço e reduzir impactos durante a execução das obras.',
        rel: 'Base operacional da supervisão no dia a dia da obra.',
        ev: ['Frentes de obra', 'Canteiros', 'Controle de impactos', 'Registros fotográficos', 'Checklists ambientais', 'Orientação às equipes'],
        ico: '<path d="M3 21h18M5 21V8l5-3 5 3v13M9 21v-5h2v5"/>' },
      { sig: 'PRAD', name: 'Plano de Recuperação de Áreas Degradadas', cat: 'Recuperação', eco: true,
        sum: 'Recuperação e recomposição de áreas impactadas.',
        desc: 'Define medidas de recuperação, recomposição e estabilização de áreas impactadas, incluindo jazidas, áreas de apoio, taludes, solos expostos e demais áreas sujeitas à degradação ambiental.',
        obj: 'Orientar a recuperação ambiental de áreas degradadas e acompanhar a evolução das medidas de recomposição.',
        rel: 'Acompanha a regeneração das áreas afetadas pela obra.',
        ev: ['Jazidas', 'Áreas de apoio', 'Taludes', 'Solo exposto', 'Drenagem', 'Revegetação', 'Registros de evolução'],
        ico: '<path d="M12 22V12M12 12c0-3 2-5 5-5 0 3-2 5-5 5zM12 12c0-3-2-5-5-5 0 3 2 5 5 5z"/>' },
      { sig: 'PGRS', name: 'Gerenciamento de Resíduos Sólidos', cat: 'Resíduos',
        sum: 'Segregação, destinação e rastreabilidade de resíduos.',
        desc: 'Organiza procedimentos de segregação, armazenamento, transporte, destinação e registro de resíduos gerados nas atividades de obra e apoio.',
        obj: 'Garantir gestão adequada dos resíduos e rastreabilidade das evidências de destinação.',
        rel: 'Garante destinação correta e rastreável dos resíduos.',
        ev: ['Segregação', 'Armazenamento temporário', 'Transporte', 'Destinação final', 'Manifestos', 'Registros fotográficos', 'Conformidade dos pontos'],
        ico: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h12l1-14M10 10v6M14 10v6"/>' },
      { sig: 'EA', name: 'Educação Ambiental', cat: 'Pessoas',
        sum: 'Sensibilização e formação ambiental de equipes.',
        desc: 'Promove ações de sensibilização, orientação e formação ambiental junto a equipes, comunidades, trabalhadores e demais atores envolvidos.',
        obj: 'Fortalecer a consciência ambiental e promover boas práticas durante a execução das atividades rodoviárias.',
        rel: 'Engaja pessoas e equipes na pauta ambiental.',
        ev: ['Campanhas', 'Palestras', 'DDS ambiental', 'Listas de presença', 'Registros fotográficos', 'Materiais educativos', 'Ações com comunidades'],
        ico: '<path d="M12 3 2 8l10 5 10-5z"/><path d="M6 10v5c0 1 3 3 6 3s6-2 6-3v-5"/>' },
      { sig: 'CS', name: 'Comunicação Social', cat: 'Comunidades',
        sum: 'Diálogo com comunidades e partes interessadas.',
        desc: 'Estrutura a comunicação com comunidades, usuários, instituições e partes interessadas, fortalecendo transparência, orientação e diálogo durante a execução das obras.',
        obj: 'Apoiar a comunicação institucional, orientar comunidades e reduzir conflitos socioambientais.',
        rel: 'Mantém o diálogo com comunidades e partes interessadas.',
        ev: ['Reuniões', 'Comunicados', 'Registros de atendimento', 'Ações informativas', 'Materiais de divulgação', 'Demandas comunitárias', 'Registros de interação'],
        ico: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
      { sig: 'MFF', name: 'Monitoramento de Fauna e Flora', cat: 'Biodiversidade', eco: true,
        sum: 'Ocorrências, registros e proteção da biodiversidade.',
        desc: 'Acompanha ocorrências, registros, medidas preventivas e ações associadas à proteção da biodiversidade nas áreas de influência das obras.',
        obj: 'Registrar e apoiar ações relacionadas à fauna, flora e biodiversidade durante as atividades rodoviárias.',
        rel: 'Protege a biodiversidade nas áreas de influência.',
        ev: ['Avistamentos', 'Ocorrências', 'Áreas vegetadas', 'Medidas preventivas', 'Registros de fauna', 'Registros de flora', 'Recomendações técnicas'],
        ico: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>' },
      { sig: 'CPE', name: 'Controle de Processos Erosivos', cat: 'Geotecnia',
        sum: 'Prevenção e correção de erosão e drenagem.',
        desc: 'Monitora e orienta medidas de prevenção, controle e correção de processos erosivos, drenagem inadequada, carreamento de sedimentos e instabilidade de solos.',
        obj: 'Reduzir riscos de erosão, assoreamento, instabilidade e impactos associados à drenagem inadequada.',
        rel: 'Previne erosão e instabilidade do terreno.',
        ev: ['Erosões', 'Ravinas', 'Taludes', 'Drenagem', 'Sedimentos', 'Dispositivos de controle', 'Evolução das medidas'],
        ico: '<path d="M3 20h18L14 7l-3 5-2-3z"/>' },
      { sig: 'MRH', name: 'Monitoramento de Recursos Hídricos', cat: 'Águas', eco: true,
        sum: 'Interferências em corpos hídricos e prevenção.',
        desc: 'Acompanha interferências em corpos hídricos, drenagens, pontos de captação, lançamento, proteção de margens e medidas preventivas relacionadas à água.',
        obj: 'Apoiar o controle ambiental de interferências em corpos hídricos e recursos associados.',
        rel: 'Protege corpos hídricos e recursos associados.',
        ev: ['Drenagens', 'Corpos hídricos', 'Pontos de captação', 'Outorgas', 'Margens', 'Assoreamento', 'Medidas preventivas'],
        ico: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>' }
    ];
    var active = 0, paused = false, resumeT = null, inView = false;

    PROGRAMS.forEach(function (p, i) {
      var b = document.createElement('button');
      b.className = 'progcard' + (p.eco ? ' progcard--eco' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('data-i', i);
      b.setAttribute('aria-label', p.sig + ' — ' + p.name);
      b.style.setProperty('--d', (i * 0.45) + 's');
      b.innerHTML =
        '<span class="progcard__ico"><svg viewBox="0 0 24 24">' + p.ico + '</svg></span>' +
        '<span class="progcard__cat">' + p.cat + '</span>' +
        '<span class="progcard__sigla">' + p.sig + '</span>' +
        '<span class="progcard__name">' + p.name + '</span>' +
        '<span class="progcard__sum">' + p.sum + '</span>' +
        '<span class="progcard__sel">Selecionado</span>';
      b.addEventListener('click', function () { setActive(i, true); });
      b.addEventListener('focus', function () { setActive(i, true); });
      track.appendChild(b);
    });
    var cards = track.querySelectorAll('.progcard');

    function centerCard(i) {
      var card = cards[i];
      var left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    function setActive(i, user) {
      i = (i + PROGRAMS.length) % PROGRAMS.length;
      active = i;
      cards.forEach(function (c, j) {
        c.classList.toggle('is-active', j === i);
        c.setAttribute('aria-selected', j === i ? 'true' : 'false');
      });
      centerCard(i);
      var p = PROGRAMS[i];
      panel.innerHTML =
        '<div class="progpanel__head"><span class="progpanel__sigla">' + p.sig + '</span>' +
        '<div><span class="progpanel__cat">' + p.cat + '</span>' +
        '<h4 class="progpanel__name">' + p.name + '</h4></div></div>' +
        '<p class="progpanel__desc">' + p.desc + '</p>' +
        '<div class="progpanel__cols">' +
        '<div class="progpanel__block"><span class="progpanel__lbl">Objetivo</span><p>' + p.obj + '</p>' +
        '<span class="progpanel__lbl">Relação com a supervisão</span><p>' + p.rel + '</p></div>' +
        '<div class="progpanel__block"><span class="progpanel__lbl">Evidências acompanhadas</span>' +
        '<ul class="progpanel__ev">' + p.ev.map(function (e) { return '<li>' + e + '</li>'; }).join('') + '</ul></div>' +
        '</div>';
      panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
      if (user) { paused = true; clearTimeout(resumeT); resumeT = setTimeout(function () { paused = false; }, 7000); }
    }

    prevB.addEventListener('click', function () { setActive(active - 1, true); });
    nextB.addEventListener('click', function () { setActive(active + 1, true); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); setActive(active + 1, true); cards[active].focus(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(active - 1, true); cards[active].focus(); }
    });
    track.addEventListener('mouseenter', function () { paused = true; });
    track.addEventListener('mouseleave', function () { paused = false; });
    track.addEventListener('touchstart', function () {
      paused = true; clearTimeout(resumeT); resumeT = setTimeout(function () { paused = false; }, 7000);
    }, { passive: true });

    var sec = document.getElementById('rara');
    if (sec && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { inView = e.isIntersecting; });
      }, { threshold: 0.15 }).observe(sec);
    } else { inView = true; }

    setActive(0, false);
    if (!reduceMotion) {
      setInterval(function () { if (!paused && inView) setActive(active + 1, false); }, 4500);
    }
  })();

  /* =================================================================
     NAVEGAÇÃO POR SEÇÕES (deck): trilha + controle + teclado
     ================================================================= */
  (function () {
    var CH = [
      ['hero', 'Hero'], ['indicadores', 'Indicadores'], ['desafio', 'Desafio'],
      ['ecossistema', 'Supervisão'], ['rara', 'RARA'], ['painel', 'Painel Ambiental'],
      ['campo', 'Ações em Campo'], ['mapa', 'Mapa'], ['biblioteca', 'Biblioteca'], ['encerramento', 'Encerramento']
    ];
    var els = CH.map(function (c) { return document.getElementById(c[0]); });
    var rail = document.getElementById('secrail');
    var prevBtn = document.getElementById('secPrev');
    var nextBtn = document.getElementById('secNext');
    var curEl = document.getElementById('secCur');
    var totEl = document.getElementById('secTot');
    if (!els[0] || !prevBtn) return;
    var OFFSET = 90, N = CH.length, cur = -1;
    var ICON_DOWN = '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
    var ICON_HOME = '<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/></svg>';
    totEl.textContent = ('0' + N).slice(-2);

    CH.forEach(function (c, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.className = 'secrail__item';
      b.setAttribute('aria-label', 'Ir para ' + c[1]);
      b.innerHTML = '<span class="secrail__lbl">' + c[1] + '</span><span class="secrail__dot"></span>';
      b.addEventListener('click', function () { go(i); });
      li.appendChild(b); rail.appendChild(li);
    });
    var railBtns = rail.querySelectorAll('.secrail__item');

    function go(i) {
      i = Math.max(0, Math.min(N - 1, i));
      var el = els[i]; if (!el) return;
      var top = i === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    function render() {
      curEl.textContent = ('0' + (cur + 1)).slice(-2);
      prevBtn.disabled = cur === 0;
      railBtns.forEach(function (b, i) { b.classList.toggle('active', i === cur); });
      if (cur === N - 1) {
        nextBtn.classList.add('is-home'); nextBtn.innerHTML = ICON_HOME;
        nextBtn.setAttribute('aria-label', 'Voltar ao início');
      } else {
        nextBtn.classList.remove('is-home'); nextBtn.innerHTML = ICON_DOWN;
        nextBtn.setAttribute('aria-label', 'Próxima seção');
      }
    }
    function compute() {
      var sy = window.scrollY, vh = window.innerHeight, idx = 0;
      if (sy + vh >= document.documentElement.scrollHeight - 4) { idx = N - 1; }
      else {
        for (var i = 0; i < N; i++) {
          var el = els[i]; if (!el) continue;
          if (el.getBoundingClientRect().top + sy <= sy + OFFSET + 8) idx = i;
        }
      }
      if (idx !== cur) { cur = idx; render(); }
    }
    prevBtn.addEventListener('click', function () { go(cur - 1); });
    nextBtn.addEventListener('click', function () { cur === N - 1 ? go(0) : go(cur + 1); });
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    compute();

    document.addEventListener('keydown', function (e) {
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
      var k = e.key;
      if (k === 'PageDown') { e.preventDefault(); go(cur + 1); }
      else if (k === 'PageUp') { e.preventDefault(); go(cur - 1); }
      else if (k === 'Home') { e.preventDefault(); go(0); }
      else if (k === 'End') { e.preventDefault(); go(N - 1); }
      else if (k === 'ArrowDown' || k === 'ArrowUp') {
        if (tag === 'BUTTON' || tag === 'A' || (t && t.getAttribute && t.getAttribute('tabindex') !== null)) return;
        e.preventDefault(); go(k === 'ArrowDown' ? cur + 1 : cur - 1);
      }
    });
  })();

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
