/* Reads window.PORTFOLIO (js/content.js), renders the page, then builds one 3D scene per section and
   flies the camera through them as you scroll. Nothing here needs editing to change content. */
(function () {
  'use strict';
  var PF = window.PF, D = window.PORTFOLIO;
  if (!D) { document.body.textContent = 'content.js did not load.'; return; }

  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var MOTION = RM ? 0 : 1;
  var S = PF.state;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- theme ---------- */
  function applyTheme() {
    var T = D.theme || {}, root = document.documentElement.style;
    PF.setTheme(T);
    root.setProperty('--ink', PF.theme.ink);
    root.setProperty('--text', PF.theme.text);
    root.setProperty('--mute', PF.theme.mute);
    root.setProperty('--blue', PF.theme.blue);
    root.setProperty('--amber', PF.theme.amber);
    root.setProperty('--scrim', PF.rgba(PF.theme.ink, 0.68));
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', PF.theme.ink);
  }

  /* ---------- DOM from data ---------- */
  function sideOf(s, i) { return s.side || (i % 2 === 0 ? 'l' : 'r'); }

  function paragraphs(c, list, cls) {
    (list || []).forEach(function (t) { c.appendChild(el('p', cls || null, t)); });
  }

  function buildCopy(s) {
    var P = D.profile || {};
    var c = el('div', 'copy' + (s.type === 'timeline' ? ' wide' : ''));
    if (s.eyebrow) c.appendChild(el('p', 'eyebrow', s.eyebrow));
    if (s.type === 'hero') {
      var h1 = el('h1');
      (P.nameLines || [P.name || '']).forEach(function (ln, k) {
        if (k) h1.appendChild(document.createElement('br'));
        h1.appendChild(document.createTextNode(ln));
      });
      c.appendChild(h1);
    } else if (s.title) {
      c.appendChild(el('h2', null, s.title));
    }
    if (s.lede) c.appendChild(el('p', 'lede', s.lede));
    paragraphs(c, s.body);

    if (s.stats && s.stats.length) {
      var dl = el('dl', 'stats');
      dl.style.setProperty('--n', Math.min(s.stats.length, 3));
      s.stats.forEach(function (st) {
        var d = el('div'); d.appendChild(el('dt', null, st.label)); d.appendChild(el('dd', null, st.value)); dl.appendChild(d);
      });
      c.appendChild(dl);
    }
    paragraphs(c, s.more);

    if (s.type === 'timeline') {
      var ol = el('ol', 'tl'); ol.id = 'timeline';
      (D.timeline || []).forEach(function (j) {
        var li = el('li'); li.tabIndex = 0;
        li.appendChild(el('span', 'when', j.when));
        li.appendChild(el('span', 'role', j.role));
        li.appendChild(el('span', 'org', j.org));
        li.appendChild(el('p', null, j.text));
        ol.appendChild(li);
      });
      c.appendChild(ol);
    }
    if (s.type === 'skills') {
      var sk = el('dl', 'skills');
      (D.skills || []).forEach(function (g) { sk.appendChild(el('dt', null, g.group)); sk.appendChild(el('dd', null, g.items)); });
      c.appendChild(sk);
    }
    if (s.type === 'contact') {
      var mail = el('div', 'mail'), em = el('span', 'email', P.email || ''); em.id = 'email';
      var btn = el('button', 'btn', 'Copy'); btn.type = 'button'; btn.id = 'copyEmail';
      mail.appendChild(em); if (P.email) mail.appendChild(btn); c.appendChild(mail);
      if (P.phone) c.appendChild(el('p', 'mono', P.phone));
      var links = el('div', 'cta'), L = P.links || {};
      [['LinkedIn', L.linkedin], ['GitHub', L.github]].forEach(function (p) {
        if (!p[1]) return;
        var a = el('a', 'btn', p[0]); a.href = p[1]; a.target = '_blank'; a.rel = 'noopener'; links.appendChild(a);
      });
      c.appendChild(links);
    }

    paragraphs(c, s.notes, 'small');
    if (s.tags && s.tags.length) {
      var ul = el('ul', 'tags'); s.tags.forEach(function (t) { ul.appendChild(el('li', null, t)); }); c.appendChild(ul);
    }
    if (s.cta && s.cta.length) {
      var cta = el('div', 'cta');
      s.cta.forEach(function (b) { var a = el('a', 'btn' + (b.primary ? ' primary' : ''), b.label); a.href = b.href; cta.appendChild(a); });
      c.appendChild(cta);
    }
    if (s.mono) c.appendChild(el('p', 'mono', s.mono));
    return c;
  }

  function render() {
    var P = D.profile || {};
    document.title = (P.name || '') + (P.role ? ' | ' + P.role : '');
    document.getElementById('mark').textContent = P.name || '';
    var main = document.getElementById('main'), nav = document.getElementById('nav'), dots = document.getElementById('dots');
    D.sections.forEach(function (s, i) {
      var sec = el('section', 'st ' + sideOf(s, i) + (s.type === 'hero' ? ' hero' : ''));
      sec.id = s.id; sec.appendChild(buildCopy(s)); main.appendChild(sec);
      if (s.nav) {
        var a = el('a', i === D.sections.length - 1 ? 'keep' : null, s.nav); a.href = '#' + s.id; nav.appendChild(a);
      }
      var d = el('a'); d.href = '#' + s.id; d.title = s.title || s.nav || s.id; d.setAttribute('aria-label', d.title); dots.appendChild(d);
    });
    var foot = document.getElementById('foot');
    foot.appendChild(el('span', null, (P.name || '') + (P.location ? ' · ' + P.location : '')));
    if (P.credit) foot.appendChild(el('span', null, P.credit));

    var ld = { '@context': 'https://schema.org', '@type': 'Person', name: P.name, jobTitle: P.role };
    var same = [P.links && P.links.linkedin, P.links && P.links.github].filter(Boolean);
    if (same.length) ld.sameAs = same;
    var script = document.createElement('script'); script.type = 'application/ld+json'; script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);
  }

  /* ---------- page behaviour that works with or without WebGL ---------- */
  function initUI() {
    var P = D.profile || {};
    var btn = document.getElementById('copyEmail'), em = document.getElementById('email');
    if (btn) btn.addEventListener('click', function () {
      function done(ok) { btn.textContent = ok ? 'Copied' : 'Selected, press Ctrl+C'; setTimeout(function () { btn.textContent = 'Copy'; }, 1800); }
      function fallback() {
        try { var r = document.createRange(); r.selectNodeContents(em); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) { /* ignore */ }
        done(false);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(P.email).then(function () { done(true); }, fallback);
      else fallback();
    });

    var lis = Array.prototype.slice.call(document.querySelectorAll('#timeline li'));
    var secs = Array.prototype.slice.call(document.querySelectorAll('.st'));
    var dotEls = Array.prototype.slice.call(document.querySelectorAll('#dots a'));
    function paint() {
      var cur = S.hoverIdx >= 0 ? S.hoverIdx : S.activeIdx;
      lis.forEach(function (li, k) { li.classList.toggle('on', k === cur); });
    }
    lis.forEach(function (li, i) {
      li.addEventListener('pointerenter', function () { S.hoverIdx = i; paint(); });
      li.addEventListener('pointerleave', function () { S.hoverIdx = -1; paint(); });
      li.addEventListener('focus', function () { S.hoverIdx = i; paint(); });
      li.addEventListener('blur', function () { S.hoverIdx = -1; paint(); });
    });
    function onScroll() {
      var mid = window.innerHeight / 2, best = 0, bd = 1e9, cur = 0;
      lis.forEach(function (li, k) {
        var r = li.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bd) { bd = d; best = k; }
      });
      if (best !== S.activeIdx) { S.activeIdx = best; paint(); }
      secs.forEach(function (s, k) { var r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) cur = k; });
      dotEls.forEach(function (d, k) { d.classList.toggle('on', k === cur); });
      var max = document.documentElement.scrollHeight - window.innerHeight;
      document.getElementById('progress').style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll(); paint();
  }

  /* ---------- 3D stage ---------- */
  function initGL() {
    var sections = D.sections, N = sections.length, STEP = 26;
    var canvas = document.getElementById('stage');
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
    var INK = PF.col.ink;
    renderer.setClearColor(INK, 1);
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(INK, 0.02);
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 400);
    var X = { camera: camera, content: D };

    /* a fixed set of lights (changing the light count would recompile shaders mid-scroll);
       the two point lights follow the camera from station to station */
    scene.add(new THREE.HemisphereLight(0x8aa4d6, 0x10151f, 0.75));
    var sun = new THREE.DirectionalLight(0xffdca8, 0.7); sun.position.set(4, 6, 8); scene.add(sun);
    var keyLight = new THREE.PointLight(PF.col.blue, 1.6, 22); scene.add(keyLight);
    var warmLight = new THREE.PointLight(PF.col.amber, 0.7, 18); scene.add(warmLight);

    var st = [], obj = [], upd = [];
    sections.forEach(function (s, i) {
      var g = new THREE.Group(); g.position.z = -i * STEP; scene.add(g);
      var o = new THREE.Group(); g.add(o);
      st.push(g); obj.push(o);
      var fn = PF.scenes[s.scene] || PF.scenes.knot, u;
      try { u = fn(o, s.sceneOptions || {}, X); } catch (err) { if (window.console) console.warn('Scene "' + s.scene + '" failed for section "' + s.id + '"', err); }
      upd.push(typeof u === 'function' ? u : function () {});
    });

    /* star field */
    var count = window.innerWidth < 820 ? 1200 : 2800, sp = new Float32Array(count * 3);
    for (var q = 0; q < count; q++) {
      sp[q * 3] = (Math.random() - 0.5) * 80; sp[q * 3 + 1] = (Math.random() - 0.5) * 44; sp[q * 3 + 2] = 14 - Math.random() * (N * STEP + 40);
    }
    var sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x9db4e0, size: 0.07, transparent: true, opacity: 0.7 })));

    /* camera path through every station */
    var camPts = [], tgtPts = [];
    for (var i = 0; i < N; i++) {
      camPts.push(new THREE.Vector3(Math.sin(i * 1.7) * 0.9, Math.cos(i * 2.1) * 0.5, -i * STEP + 8.4));
      tgtPts.push(new THREE.Vector3(0, 0, -i * STEP));
    }
    var camCurve = N > 1 ? new THREE.CatmullRomCurve3(camPts, false, 'catmullrom', 0.4) : null;
    var tgtCurve = N > 1 ? new THREE.CatmullRomCurve3(tgtPts, false, 'catmullrom', 0.4) : null;

    /* scroll position to camera position: each section holds the camera on its station, then eases to the next */
    var knots = [];
    function computeKnots() {
      knots.length = 0;
      var sy = window.scrollY;
      Array.prototype.slice.call(document.querySelectorAll('.st')).forEach(function (s, k) {
        var r = s.getBoundingClientRect(), top = r.top + sy, h = r.height;
        knots.push({ s: top + h * 0.3, t: k }); knots.push({ s: top + h * 0.7, t: k });
      });
    }
    function targetT(sc) {
      if (!knots.length) return 0;
      if (sc <= knots[0].s) return knots[0].t;
      for (var j = 0; j < knots.length - 1; j++) {
        var a = knots[j], b = knots[j + 1];
        if (b.s <= a.s) continue;
        if (sc < b.s) { var f = (sc - a.s) / (b.s - a.s), e = f * f * (3 - 2 * f); return a.t + (b.t - a.t) * e; }
      }
      return knots[knots.length - 1].t;
    }

    function layout(narrow) {
      for (var k = 0; k < N; k++) {
        var textLeft = sideOf(sections[k], k) === 'l';
        obj[k].position.set(narrow ? 0 : (textLeft ? 2.7 : -2.7), narrow ? 1.7 : 0, 0);
        obj[k].scale.setScalar(narrow ? 0.62 : 1);
      }
    }
    function resize() {
      var w = window.innerWidth, h = window.innerHeight, narrow = w < 820;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 1.75));
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.fov = w / h < 1 ? 58 : 45; camera.updateProjectionMatrix();
      layout(narrow); computeKnots();
    }
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(computeKnots).observe(document.body);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { computeKnots(); PF.repaint.forEach(function (p) { p(); }); });
    window.addEventListener('pointermove', function (e) { S.px = e.clientX / window.innerWidth * 2 - 1; S.py = e.clientY / window.innerHeight * 2 - 1; }, { passive: true });
    resize();

    /* compile every material once so scenes do not stutter the first time they appear */
    try { renderer.compile(scene, camera); } catch (err) { /* ignore */ }

    var last = performance.now(), clock = 0, tCur = targetT(window.scrollY + window.innerHeight / 2), acc = 1;
    function frame(now) {
      requestAnimationFrame(frame);
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      clock += dt * MOTION;
      var tT = targetT(window.scrollY + window.innerHeight / 2);
      tCur = RM ? tT : tCur + (tT - tCur) * (1 - Math.exp(-dt * 5));
      var k = 1 - Math.exp(-dt * 4);
      S.mx += (S.px - S.mx) * k; S.my += (S.py - S.my) * k;
      if (camCurve) {
        var u = Math.max(0, Math.min(1, tCur / (N - 1)));
        camera.position.copy(camCurve.getPoint(u));
        camera.lookAt(tgtCurve.getPoint(u));
      } else { camera.position.set(0, 0, 8.4); camera.lookAt(0, 0, 0); }
      camera.position.x += S.mx * 0.45; camera.position.y -= S.my * 0.25;
      var near = Math.max(0, Math.min(N - 1, Math.round(tCur)));
      keyLight.position.set(-2, 3, -near * STEP + 5); warmLight.position.set(4, -2, -near * STEP + 4);
      acc += dt; var redraw = false; if (acc > 1 / 30) { acc = 0; redraw = true; }
      for (var i2 = 0; i2 < N; i2++) {
        var vis = Math.abs(tCur - i2) < 1.15;
        st[i2].visible = vis;
        if (vis) upd[i2](clock, dt, redraw);
      }
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }

  applyTheme();
  render();
  initUI();
  try {
    if (!window.THREE) throw new Error('three.js did not load');
    initGL();
  } catch (err) {
    document.documentElement.classList.add('nogl');
    if (window.console) console.warn(err);
  }
})();
