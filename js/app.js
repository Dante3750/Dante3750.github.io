/* Reads window.PORTFOLIO (js/content.js), renders the page, then builds one 3D scene per section and
   flies the camera through them as you scroll. Nothing here needs editing to change content. */
(function () {
  'use strict';
  var PF = window.PF, D = window.PORTFOLIO;
  if (!D) { document.body.textContent = 'content.js did not load.'; return; }

  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var MOTION = RM ? 0 : 1;
  var S = PF.state;

  /* sections of these types disappear until their list in content.js has entries */
  D.posts = window.PFMD ? window.PFMD.posts() : [];
  var NEEDS = { services: 'services', projects: 'projects', testimonials: 'testimonials', posts: 'posts' };
  D.sections = D.sections.filter(function (s) { var k = NEEDS[s.type]; return !(k && !(D[k] && D[k].length)); });

  var LINK_LABELS = { linkedin: 'LinkedIn', github: 'GitHub', x: 'X', medium: 'Medium', youtube: 'YouTube', stackoverflow: 'Stack Overflow', devto: 'DEV', gitlab: 'GitLab', upwork: 'Upwork', toptal: 'Toptal', fiverr: 'Fiverr', behance: 'Behance' };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function btnLink(label, href, primary, external) {
    var a = el('a', 'btn' + (primary ? ' primary' : ''), label);
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }

  function liteOn() {
    try { if (localStorage.getItem('pf-lite') === '1') return true; } catch (e) { /* storage blocked */ }
    return !!(window.matchMedia && matchMedia('(prefers-reduced-data: reduce)').matches);
  }

  /* ---------- theme ---------- */
  function applyTheme() {
    PF.setTheme(D.theme || {});
    var root = document.documentElement.style;
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

  function cardList(items) {
    var ul = el('ul', 'cards');
    items.forEach(function (it) {
      var li = el('li');
      li.appendChild(el('h3', null, it.title));
      if (it.role) li.appendChild(el('p', 'small', it.role));
      if (it.text) li.appendChild(el('p', null, it.text));
      if (it.tags && it.tags.length) li.appendChild(el('p', 'mono', it.tags.join(' · ')));
      if (it.links && it.links.length) {
        var row = el('div', 'cta');
        it.links.forEach(function (l) { row.appendChild(btnLink(l.label, l.href, false, true)); });
        li.appendChild(row);
      }
      ul.appendChild(li);
    });
    return ul;
  }

  function buildCopy(s) {
    var P = D.profile || {};
    var wide = s.type === 'timeline' || s.type === 'posts' || s.type === 'services' || s.type === 'projects' || s.type === 'testimonials';
    var c = el('div', 'copy' + (wide ? ' wide' : ''));

    if (s.type === 'hero' && P.availability && P.availability.show) {
      var pill = el('p', 'pill'); pill.appendChild(el('span', 'dot')); pill.appendChild(document.createTextNode(P.availability.text || 'Available for work'));
      c.appendChild(pill);
    }
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
    if (s.type === 'posts') {
      var pl = el('ul', 'cards feedlist');
      D.posts.slice(0, s.limit || 3).forEach(function (p) {
        var li = el('li');
        li.appendChild(el('p', 'mono', window.PFMD.fmtDate(p.date) + ' · ' + window.PFMD.minutes(p) + ' min read'));
        var h = el('h3'), a = el('a', null, p.title); a.href = 'blog.html#/' + p.slug; h.appendChild(a); li.appendChild(h);
        if (p.summary) li.appendChild(el('p', null, p.summary));
        pl.appendChild(li);
      });
      c.appendChild(pl);
    }
    if (s.type === 'services') c.appendChild(cardList(D.services));
    if (s.type === 'projects') c.appendChild(cardList(D.projects));
    if (s.type === 'testimonials') {
      D.testimonials.forEach(function (t) {
        var bq = el('blockquote', 'quote', t.quote);
        c.appendChild(bq);
        c.appendChild(el('p', 'mono', '— ' + t.name + (t.role ? ', ' + t.role : '')));
      });
    }
    if (s.type === 'contact') {
      var mail = el('div', 'mail'), em = el('span', 'email', P.email || ''); em.id = 'email';
      var btn = el('button', 'btn', 'Copy'); btn.type = 'button'; btn.id = 'copyEmail';
      mail.appendChild(em); if (P.email) mail.appendChild(btn); c.appendChild(mail);
      if (P.phone) c.appendChild(el('p', 'mono', P.phone));
      if (P.facts && P.facts.length) {
        var fd = el('dl', 'skills');
        P.facts.forEach(function (f) { fd.appendChild(el('dt', null, f[0])); fd.appendChild(el('dd', null, f[1])); });
        c.appendChild(fd);
      }
      var links = el('div', 'cta');
      if (P.bookingUrl) links.appendChild(btnLink('Book a call', P.bookingUrl, true, true));
      if (P.email) links.appendChild(btnLink('Email me', 'mailto:' + P.email + (P.emailSubject ? '?subject=' + encodeURIComponent(P.emailSubject) : ''), !P.bookingUrl, false));
      if (P.resumeUrl) links.appendChild(btnLink('Resume', P.resumeUrl, false, true));
      var L = P.links || {};
      Object.keys(L).forEach(function (k) {
        if (!L[k]) return;
        links.appendChild(btnLink(LINK_LABELS[k] || (k.charAt(0).toUpperCase() + k.slice(1)), L[k], false, true));
      });
      c.appendChild(links);
    }

    paragraphs(c, s.notes, 'small');
    if (s.tags && s.tags.length) {
      var ul = el('ul', 'tags'); s.tags.forEach(function (t) { ul.appendChild(el('li', null, t)); }); c.appendChild(ul);
    }
    var ctaList = (s.cta || []).slice();
    if (s.type === 'hero' && P.resumeUrl) ctaList.push({ label: 'Resume', href: P.resumeUrl, external: true });
    if (ctaList.length) {
      var cta = el('div', 'cta');
      ctaList.forEach(function (b) { cta.appendChild(btnLink(b.label, b.href, b.primary, b.external)); });
      c.appendChild(cta);
    }
    if (s.mono) c.appendChild(el('p', 'mono', s.mono));
    return c;
  }

  function render() {
    var P = D.profile || {};
    document.title = (P.name || '') + (P.role ? ' | ' + P.role : '');
    var desc = document.querySelector('meta[name="description"]');
    if (desc && P.description) desc.setAttribute('content', P.description);
    document.getElementById('mark').textContent = P.name || '';
    var main = document.getElementById('main'), nav = document.getElementById('nav'), dots = document.getElementById('dots'), foot = document.getElementById('foot');
    [main, nav, dots, foot].forEach(function (n) { n.textContent = ''; });

    D.sections.forEach(function (s, i) {
      var sec = el('section', 'st ' + sideOf(s, i) + (s.type === 'hero' ? ' hero' : ''));
      sec.id = s.id; sec.appendChild(buildCopy(s)); main.appendChild(sec);
      if (s.nav) {
        var a = el('a', i === D.sections.length - 1 ? 'keep' : null, s.nav); a.href = '#' + s.id; nav.appendChild(a);
      }
      var d = el('a'); d.href = '#' + s.id; d.title = s.title || s.nav || s.id; d.setAttribute('aria-label', d.title); dots.appendChild(d);
    });

    foot.appendChild(el('span', null, (P.name || '') + (P.location ? ' · ' + P.location : '')));
    var right = el('span');
    var lite = el('button', 'linklike', 'Lite mode: ' + (liteOn() ? 'on' : 'off')); lite.type = 'button'; lite.id = 'lite';
    right.appendChild(lite);
    if (P.credit) right.appendChild(document.createTextNode(' · ' + P.credit));
    foot.appendChild(right);

    var ld = { '@context': 'https://schema.org', '@type': 'Person', name: P.name, jobTitle: P.role };
    if (P.description) ld.description = P.description;
    if (P.location) ld.address = { '@type': 'PostalAddress', addressLocality: P.location };
    var same = Object.keys(P.links || {}).map(function (k) { return P.links[k]; }).filter(Boolean);
    if (same.length) ld.sameAs = same;
    Array.prototype.slice.call(document.querySelectorAll('script[type="application/ld+json"]')).forEach(function (n) { n.parentNode.removeChild(n); });
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
    var lite = document.getElementById('lite');
    if (lite) lite.addEventListener('click', function () {
      try { localStorage.setItem('pf-lite', liteOn() && localStorage.getItem('pf-lite') === '1' ? '0' : '1'); } catch (e) { /* storage blocked */ }
      window.location.reload();
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
    scene.fog = new THREE.FogExp2(INK, 0.04);   /* thick enough that the next station stays hidden until you arrive */
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 400);
    var X = { camera: camera, content: D };
    var narrow0 = window.innerWidth < 820;

    /* studio environment: a few soft light panels, baked once, so metal and glass have something to reflect */
    try {
      var envScene = new THREE.Scene();
      envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 24, 16), new THREE.MeshBasicMaterial({ color: 0x06080d, side: THREE.BackSide })));
      [[0x6f9bff, 14, 3, 0, 18, 8, 0], [0xffb86a, 4, 10, 22, 2, -4, 0.9], [0xdfe8ff, 18, 2, -6, 24, 4, 0], [0x4d8dff, 3, 12, -24, 0, 6, -0.7]].forEach(function (L) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(L[1], L[2]), new THREE.MeshBasicMaterial({ color: new THREE.Color(L[0]).multiplyScalar(3.2), side: THREE.DoubleSide }));
        m.position.set(L[3], L[4], L[5]); m.lookAt(0, 0, 0); m.rotation.z += L[6]; envScene.add(m);
      });
      var pm = new THREE.PMREMGenerator(renderer);
      scene.environment = pm.fromScene(envScene, 0.04).texture;
      pm.dispose();
    } catch (err) { /* no environment: materials fall back to the lights alone */ }

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
      var base = typeof u === 'function' ? u : function () {};
      /* every station gets a colour aura behind it, a ring of drifting dust and a glowing floor ring */
      var tint = i % 2 ? PF.col.amber : PF.col.blue;
      var aura = PF.glow(tint, 11, 0.3); aura.position.set(0, 0, -3); o.add(aura);
      var aura2 = PF.glow(i % 2 ? PF.col.blue : PF.col.amber, 6, 0.12); aura2.position.set(1.5, -1, -2); o.add(aura2);
      var DN = narrow0 ? 70 : 160, dp = new Float32Array(DN * 3), dph = [];
      for (var d = 0; d < DN; d++) { var rr = 2.6 + Math.random() * 3.6, th = Math.random() * 6.283; dp[d * 3] = Math.cos(th) * rr; dp[d * 3 + 1] = (Math.random() - 0.5) * 6; dp[d * 3 + 2] = Math.sin(th) * rr - 1.5; dph.push(Math.random() * 6.283); }
      var dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
      var dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: tint, size: 0.07, transparent: true, opacity: 0.7, map: PF.dotTex(), blending: THREE.AdditiveBlending, depthWrite: false }));
      dust.frustumCulled = false; o.add(dust);
      var floor = new THREE.Group(); floor.position.y = -2.3; floor.rotation.x = -Math.PI / 2; o.add(floor);
      [1.6, 2.6, 3.8].forEach(function (r, k) { floor.add(new THREE.Mesh(new THREE.RingGeometry(r, r + 0.012, 96), new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.32 - k * 0.08, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }))); });
      upd.push(function (t, dt, redraw) {
        dust.rotation.y = t * 0.05; dust.position.y = Math.sin(t * 0.3) * 0.15;
        floor.rotation.z = t * 0.08;
        base(t, dt, redraw);
      });
    });

    /* star field */
    var count = window.innerWidth < 820 ? 1200 : 2800, sp = new Float32Array(count * 3);
    for (var q = 0; q < count; q++) {
      sp[q * 3] = (Math.random() - 0.5) * 80; sp[q * 3 + 1] = (Math.random() - 0.5) * 44; sp[q * 3 + 2] = 14 - Math.random() * (N * STEP + 40);
    }
    var sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x7f95c4, size: 0.16, transparent: true, opacity: 0.8, fog: false, map: PF.dotTex(), alphaTest: 0.02, depthWrite: false })));

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
        obj[k].position.set(narrow ? 0 : (textLeft ? 2.7 : -2.7), narrow ? 2.7 : 0, 0);   /* phones: up in the reserved top third */
        obj[k].scale.setScalar(narrow ? 0.62 : 1);
      }
    }
    var camDist = 6.9;   /* how far the camera sits from each scene; the curve is built for 8.4 */
    function resize() {
      var w = window.innerWidth, h = window.innerHeight, narrow = w < 820;
      camDist = narrow ? 8.4 : 6.9;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 1.75));
      renderer.setSize(w, h, false);
      if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); bloom.setSize(w / 2, h / 2); }
      camera.aspect = w / h; camera.fov = w / h < 1 ? 58 : 45; camera.updateProjectionMatrix();
      layout(narrow); computeKnots();
    }
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(computeKnots).observe(document.body);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { computeKnots(); PF.repaint.forEach(function (p) { p(); }); });
    window.addEventListener('pointermove', function (e) { S.px = e.clientX / window.innerWidth * 2 - 1; S.py = e.clientY / window.innerHeight * 2 - 1; }, { passive: true });
    resize();

    /* post-processing: bloom on bright things, then a cinematic grade (vignette, light chromatic edge, film grain) */
    var composer = null, bloom = null, grade = null, useFX = !!(THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass && THREE.ShaderPass && !RM);
    if (useFX) {
      try {
        var w0 = window.innerWidth, h0 = window.innerHeight, rt = null;
        if (!narrow0 && renderer.capabilities.isWebGL2 && THREE.WebGLMultisampleRenderTarget) {
          rt = new THREE.WebGLMultisampleRenderTarget(w0, h0, { format: THREE.RGBAFormat }); rt.samples = 4;
        }
        composer = new THREE.EffectComposer(renderer, rt || undefined);
        composer.addPass(new THREE.RenderPass(scene, camera));
        bloom = new THREE.UnrealBloomPass(new THREE.Vector2(w0 / 2, h0 / 2), narrow0 ? 0.45 : 0.62, 0.7, 0.66);
        composer.addPass(bloom);
        grade = new THREE.ShaderPass({
          uniforms: { tDiffuse: { value: null }, time: { value: 0 }, amt: { value: 1 } },
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader: 'uniform sampler2D tDiffuse; uniform float time; uniform float amt; varying vec2 vUv;' +
            'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }' +
            'void main(){ vec2 c = vUv - 0.5; float r2 = dot(c,c);' +
            'vec2 off = c * r2 * 0.012 * amt;' +
            'vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);' +
            'col *= 1.0 - smoothstep(0.18, 0.62, r2) * 0.55 * amt;' +
            'col += (hash(vUv * 900.0 + time) - 0.5) * 0.028 * amt;' +
            'gl_FragColor = vec4(col, 1.0); }'
        });
        composer.addPass(grade);
      } catch (err) { composer = null; useFX = false; if (window.console) console.warn('post-processing off', err); }
    }

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
      camera.position.x += S.mx * 0.45; camera.position.y -= S.my * 0.25; camera.position.z += camDist - 8.4;
      camera.rotateZ(Math.sin(clock * 0.25) * 0.012 - S.mx * 0.02);
      var near = Math.max(0, Math.min(N - 1, Math.round(tCur)));
      keyLight.position.set(-2, 3, -near * STEP + 5); warmLight.position.set(4, -2, -near * STEP + 4);
      acc += dt; var redraw = false; if (acc > 1 / 30) { acc = 0; redraw = true; }
      for (var i2 = 0; i2 < N; i2++) {
        var vis = Math.abs(tCur - i2) < 1.0;
        st[i2].visible = vis;
        if (vis) upd[i2](clock, dt, redraw);
      }
      if (composer && useFX) {
        grade.uniforms.time.value = clock % 100;
        composer.render(dt);
        /* slow device: drop the effects instead of dropping frames */
        slow = dt > 0.034 ? slow + 1 : Math.max(0, slow - 2);
        if (slow > 100) { useFX = false; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25)); renderer.setSize(window.innerWidth, window.innerHeight, false); }
      } else {
        renderer.render(scene, camera);
      }
    }
    var slow = 0;
    requestAnimationFrame(frame);
  }

  applyTheme();
  render();
  initUI();
  if (liteOn()) {
    document.documentElement.classList.add('nogl');
  } else {
    try {
      if (!window.THREE) throw new Error('three.js did not load');
      initGL();
    } catch (err) {
      document.documentElement.classList.add('nogl');
      if (window.console) console.warn(err);
    }
  }
})();
