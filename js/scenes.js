/* The 3D scenes. Each one is  PF.scenes.<name> = function (group, options, extra) { ...; return update; }
   group    an empty THREE.Group to fill, already positioned beside its text
   options  the section's sceneOptions from content.js
   extra    { camera, content }
   update   called every frame while the scene is on screen: update(time, dt, redrawScreens)
   To add a scene: add a function here, then use  scene: '<name>'  in a section of content.js. */
(function () {
  'use strict';
  var PF = window.PF, S = PF.scenes, TAU = Math.PI * 2;

  function mat(color, m, r, extra) {
    var o = { color: color, metalness: m == null ? 0.5 : m, roughness: r == null ? 0.4 : r };
    if (extra) for (var k in extra) o[k] = extra[k];
    return new THREE.MeshStandardMaterial(o);
  }
  function basic(color, opacity, extra) {
    var o = { color: color };
    if (opacity != null) { o.transparent = true; o.opacity = opacity; }
    if (extra) for (var k in extra) o[k] = extra[k];
    return new THREE.MeshBasicMaterial(o);
  }
  function ease(u) { return u * u * (3 - 2 * u); }
  function randUnit() {
    var u = Math.random() * 2 - 1, a = Math.random() * TAU, r = Math.sqrt(1 - u * u);
    return new THREE.Vector3(r * Math.cos(a), u, r * Math.sin(a));
  }
  function latLon(lat, lon, R) {
    var phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-R * Math.sin(phi) * Math.cos(th), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(th));
  }
  function pointsOf(arr, color, size, opacity, additive) {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    var p = new THREE.Points(g, new THREE.PointsMaterial({
      color: color, size: size, transparent: true, opacity: opacity == null ? 1 : opacity,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !additive
    }));
    p.frustumCulled = false;
    return p;
  }

  /* ---------- hero: Android phone ---------- */
  S.phone = function (o, opt) {
    var C = PF.col;
    var ph = PF.makePhone(1.2, 2.5, function (c, W, H, t) { PF.drawLog(c, W, H, t, opt.title || 'Provisioning', opt.log); });
    o.add(ph.group);
    var radii = [2.1, 2.8, 3.5];
    var rings = radii.map(function (r, k) {
      var m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 200), basic(k === 1 ? C.amber : C.blue, 0.55));
      m.rotation.x = 1.1 + k * 0.35; m.rotation.y = k * 0.6; o.add(m); return m;
    });
    var orb = [];
    for (var k = 0; k < 9; k++) {
      var big = k % 3 === 0;
      var s = new THREE.Mesh(new THREE.SphereGeometry(big ? 0.09 : 0.055, 12, 12), basic(big ? C.amber : C.text));
      rings[k % 3].add(s); orb.push({ m: s, r: radii[k % 3], ph: k * 0.7, sp: 0.5 + (k % 4) * 0.12 });
    }
    return function (t, dt, redraw) {
      var st = PF.state;
      ph.group.rotation.y = Math.sin(t * 0.5) * 0.45 + st.mx * 0.3;
      ph.group.rotation.x = -st.my * 0.12;
      ph.group.position.y = Math.sin(t * 0.9) * 0.08;
      rings.forEach(function (m, k) { m.rotation.y = k * 0.6 + t * 0.12 * (k % 2 ? -1 : 1); });
      orb.forEach(function (b) { var a = t * b.sp + b.ph; b.m.position.set(Math.cos(a) * b.r, Math.sin(a) * b.r, 0); });
      if (redraw) ph.redraw(t);
    };
  };

  /* ---------- AR/VR headset ---------- */
  function makeHeadset() {
    var C = PF.col, g = new THREE.Group();
    var shell = mat(0x1a2130, 0.35, 0.5), dark = mat(0x0b0f16, 0.2, 0.7);
    var visor = new THREE.ExtrudeGeometry(PF.rrShape(2.0, 1.0, 0.36), { depth: 0.55, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 5, curveSegments: 16 });
    visor.translate(0, 0, -0.275);
    g.add(new THREE.Mesh(visor, shell));
    /* glossy front plate and tracking cameras */
    var plate = new THREE.Mesh(new THREE.ShapeGeometry(PF.rrShape(1.86, 0.86, 0.3), 14), mat(0x05070b, 0.9, 0.15));
    plate.position.z = 0.347; g.add(plate);
    [[-0.78, 0.3], [0.78, 0.3], [-0.78, -0.3], [0.78, -0.3], [-0.22, 0.05], [0.22, 0.05]].forEach(function (p, k) {
      var cam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), basic(k < 4 ? C.blue : C.text, 0.9));
      cam.rotation.x = Math.PI / 2; cam.position.set(p[0], p[1], 0.36); g.add(cam);
    });
    /* face cushion and the two lenses on the inside */
    var cushion = new THREE.ExtrudeGeometry(PF.rrShape(1.8, 0.82, 0.3), { depth: 0.12, bevelEnabled: false, curveSegments: 14 });
    cushion.translate(0, 0, -0.52);
    g.add(new THREE.Mesh(cushion, dark));
    var lensMats = [];
    [-0.42, 0.42].forEach(function (x) {
      var lm = basic(C.blue, 0.95); lensMats.push(lm);
      var lens = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), lm);
      lens.position.set(x, 0, -0.525); lens.rotation.y = Math.PI; g.add(lens);
      var rim = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.025, 8, 36), shell);
      rim.position.set(x, 0, -0.52); g.add(rim);
    });
    /* head strap: a flat band arcing behind the visor */
    var strap = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.08, 10, 48, Math.PI), mat(0x222c40, 0.2, 0.7));
    strap.rotation.x = -Math.PI / 2; strap.scale.z = 3.2; strap.position.z = -0.25; g.add(strap);
    g.userData.lensMats = lensMats;
    return g;
  }

  function makeController(flip) {
    var C = PF.col, g = new THREE.Group(), m = mat(0x1a2130, 0.4, 0.5);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.045, 12, 40), m);
    ring.position.set(0, 0.42, 0); ring.rotation.x = 0.5; g.add(ring);
    var grip = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.62, 16), m);
    grip.rotation.z = flip * 0.12; g.add(grip);
    var stick = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), basic(C.blue));
    stick.position.set(0, 0.2, 0.09); g.add(stick);
    for (var k = 0; k < 6; k++) {
      var a = k / 6 * TAU, led = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), basic(C.text));
      led.position.set(Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26); ring.add(led);
    }
    return g;
  }

  S.headset = function (o, opt, X) {
    var C = PF.col, grp = new THREE.Group(); o.add(grp);
    var hs = makeHeadset(), hsg = new THREE.Group();
    hsg.add(hs); hsg.scale.setScalar(0.8); hsg.position.set(0, 0.3, 0); grp.add(hsg);

    var c1 = makeController(1), c2 = makeController(-1);
    c1.position.set(1.75, -0.8, 0.3); c1.rotation.z = -0.5; c2.position.set(2.35, -0.3, -0.2); c2.rotation.z = -0.2;
    grp.add(c1); grp.add(c2);

    /* phone that provisions the headset */
    var ph = PF.makePhone(0.55, 1.15, PF.drawRadar);
    ph.group.position.set(-1.7, -0.75, 0.5); ph.group.rotation.y = 0.4; grp.add(ph.group);
    var ripples = [0, 1, 2].map(function () {
      var m = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.008, 6, 48), basic(C.blue, 0.5));
      m.position.set(-1.7, -0.75, 0.5); grp.add(m); return m;
    });
    var curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-1.5, -0.35, 0.5), new THREE.Vector3(-1.1, 1.0, 1.0), new THREE.Vector3(-0.35, 0.35, 0.5));
    var NP = 14, pp = new Float32Array(NP * 3), pulses = pointsOf(pp, C.amber, 0.12, 1, true);
    pulses.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    grp.add(pulses);
    var path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)), new THREE.LineBasicMaterial({ color: C.blue, transparent: true, opacity: 0.25 }));
    grp.add(path);

    /* floating AR HUD panels */
    var panelsDef = opt.panels || [['BLE pairing', ['scan', 'connect', 'configure']], ['Wi-Fi Direct', ['group', 'handoff', 'verify']]];
    var spots = [[1.35, 1.55, -0.6], [-1.75, 1.5, -0.4]];
    var panels = panelsDef.slice(0, 2).map(function (d, k) {
      var cd = PF.card(1.5, 0.95, 0.06, 320, function (c, W, H, t) { PF.drawHud(c, W, H, t, d[0], d[1]); });
      cd.mesh.position.set(spots[k][0], spots[k][1], spots[k][2]); grp.add(cd.mesh);
      return { card: cd, base: spots[k][1], ph: k * 1.7 };
    });
    var holo = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), basic(C.amber, 0.7, { wireframe: true }));
    holo.position.set(0.2, 1.65, 0.3); grp.add(holo);

    /* backdrop: the many device models */
    var NDEV = opt.devices || 64;
    var devs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.26, 0.2), mat(0x1f2a3d, 0.6, 0.4, { emissive: 0x0a1a3a }), NDEV);
    devs.frustumCulled = false;
    var d = new THREE.Object3D();
    for (var k = 0; k < NDEV; k++) {
      var a = k / NDEV * TAU * 2, rad = 4.3 + (k % 3) * 0.55;
      d.position.set(Math.cos(a) * rad, Math.sin(a) * rad * 0.75, -3 - (k % 4) * 0.5);
      d.rotation.set(0, 0, a + Math.PI / 2); d.updateMatrix(); devs.setMatrixAt(k, d.matrix);
    }
    devs.instanceMatrix.needsUpdate = true;
    var ringG = new THREE.Group(); ringG.add(devs); grp.add(ringG);

    return function (t, dt, redraw) {
      var st = PF.state;
      hsg.rotation.y = t * 0.45 + st.mx * 0.3;
      hsg.rotation.x = -st.my * 0.12;
      hsg.position.y = 0.3 + Math.sin(t * 0.9) * 0.07;
      hs.userData.lensMats.forEach(function (m) { m.opacity = 0.7 + 0.3 * Math.sin(t * 2); });
      c1.position.y = -0.8 + Math.sin(t * 1.1) * 0.06; c2.position.y = -0.3 + Math.sin(t * 1.1 + 1.5) * 0.06;
      c1.rotation.y = t * 0.4; c2.rotation.y = -t * 0.4;
      ringG.rotation.z = t * 0.04;
      holo.rotation.x = t * 0.6; holo.rotation.y = t * 0.8;
      ripples.forEach(function (m, k) { var p = (t * 0.4 + k / 3) % 1; m.scale.setScalar(0.6 + p * 2.2); m.material.opacity = (1 - p) * 0.5; });
      for (var i = 0; i < NP; i++) {
        var p = curve.getPoint((t * 0.3 + i / NP) % 1);
        pp[i * 3] = p.x; pp[i * 3 + 1] = p.y; pp[i * 3 + 2] = p.z;
      }
      pulses.geometry.attributes.position.needsUpdate = true;
      panels.forEach(function (p) {
        p.card.mesh.quaternion.copy(X.camera.quaternion);
        p.card.mesh.position.y = p.base + Math.sin(t * 0.8 + p.ph) * 0.06;
        if (redraw) p.card.redraw(t);
      });
      if (redraw) ph.redraw(t);
    };
  };

  /* ---------- two phones in sync ---------- */
  S.sync = function (o) {
    var C = PF.col, grp = new THREE.Group(); o.add(grp);
    var a = PF.makePhone(1.05, 2.2, function (c, W, H, t) { PF.drawStream(c, W, H, t, 'ROOM A'); });
    var b = PF.makePhone(1.05, 2.2, function (c, W, H, t) { PF.drawStream(c, W, H, t, 'ROOM B'); });
    a.group.position.x = -1.4; a.group.rotation.y = 0.35; b.group.position.x = 1.4; b.group.rotation.y = -0.35;
    grp.add(a.group); grp.add(b.group);
    var WN = 96;
    function makeWave(color) {
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(WN * 3), 3));
      var l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.95 }));
      l.frustumCulled = false; grp.add(l); return l;
    }
    var wA = makeWave(C.blue), wB = makeWave(C.amber);
    var ripples = [0, 1, 2].map(function () {
      var m = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.01, 6, 64), basic(C.text, 0.4));
      m.position.z = 0.05; grp.add(m); return m;
    });
    function setWave(l, t, ph) {
      var arr = l.geometry.attributes.position.array;
      for (var k = 0; k < WN; k++) {
        var u = k / (WN - 1), x = -0.85 + 1.7 * u, env = Math.sin(Math.PI * u);
        arr[k * 3] = x; arr[k * 3 + 1] = env * (0.28 * Math.sin(x * 9 + t * 4 + ph) + 0.12 * Math.sin(x * 17 - t * 3)); arr[k * 3 + 2] = 0.12;
      }
      l.geometry.attributes.position.needsUpdate = true;
    }
    return function (t, dt, redraw) {
      grp.rotation.y = Math.sin(t * 0.6) * 0.22 + PF.state.mx * 0.15;
      setWave(wA, t, 0); setWave(wB, t, 0.07);
      ripples.forEach(function (m, k) { var p = (t * 0.35 + k / 3) % 1; m.scale.setScalar(1 + p * 3.2); m.material.opacity = (1 - p) * 0.45; });
      if (redraw) { a.redraw(t); b.redraw(t); }
    };
  };

  /* ---------- blockchain ---------- */
  S.chain = function (o, opt) {
    var C = PF.col, labels = opt.labels || ['Ethereum', 'Hyperledger', 'NFT', 'Identity', 'Web3'];
    var n = labels.length, R = 1.9, g = new THREE.Group(); o.add(g);
    g.rotation.x = 0.45;
    var pos = [], blocks = [], boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8), edgeGeo = new THREE.EdgesGeometry(boxGeo);
    for (var k = 0; k < n; k++) {
      var a = k / n * TAU, p = new THREE.Vector3(Math.cos(a) * R, Math.sin(k * 1.3) * 0.3, Math.sin(a) * R);
      pos.push(p);
      var m = new THREE.Mesh(boxGeo, mat(0x151c2b, 0.6, 0.35, { emissive: C.blue, emissiveIntensity: 0 }));
      m.position.copy(p); m.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: C.blue })));
      g.add(m); blocks.push({ m: m, s: 1 });
      var lb = PF.makeLabel(labels[k], '#e8ecf3', 30); lb.position.set(p.x, p.y + 0.78, p.z); g.add(lb);
    }
    var up = new THREE.Vector3(0, 1, 0);
    for (var j = 0; j < n; j++) {
      var A = pos[j], B = pos[(j + 1) % n], dir = B.clone().sub(A), len = dir.length() - 0.8;
      var link = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 8), basic(C.amber, 0.85));
      link.position.copy(A).add(B).multiplyScalar(0.5);
      link.quaternion.setFromUnitVectors(up, dir.normalize()); g.add(link);
    }
    return function (t, dt) {
      g.rotation.y = t * 0.3 + PF.state.mx * 0.2;
      var act = Math.floor(t * 1.4) % n;
      blocks.forEach(function (b, i) {
        var on = i === act, want = on ? 1.25 : 1;
        b.s += (want - b.s) * Math.min(1, dt * 8);
        b.m.scale.setScalar(b.s); b.m.rotation.y = t * 0.5;
        b.m.material.emissiveIntensity += ((on ? 0.9 : 0) - b.m.material.emissiveIntensity) * Math.min(1, dt * 8);
      });
    };
  };

  /* ---------- insurance agent app ---------- */
  S.agentapp = function (o, opt, X) {
    var C = PF.col, g = new THREE.Group(); o.add(g);
    var ph = PF.makePhone(1.1, 2.3, PF.drawForm); ph.group.position.x = -0.2; g.add(ph.group);

    var sh = new THREE.Shape();
    sh.moveTo(0, 0.7); sh.lineTo(0.55, 0.5); sh.lineTo(0.55, 0);
    sh.quadraticCurveTo(0.55, -0.45, 0, -0.75); sh.quadraticCurveTo(-0.55, -0.45, -0.55, 0);
    sh.lineTo(-0.55, 0.5); sh.closePath();
    var shield = new THREE.Group();
    var sGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 12 });
    sGeo.translate(0, 0, -0.07);
    shield.add(new THREE.Mesh(sGeo, mat(C.amber, 0.7, 0.3)));
    var cm = basic(C.ink);
    var cv = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.5, 0.04), cm), ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.13, 0.04), cm);
    cv.position.set(0, 0.04, 0.12); ch.position.set(0, 0.04, 0.12); shield.add(cv); shield.add(ch);
    shield.position.set(1.4, 0.2, 0.45); shield.scale.setScalar(0.9); g.add(shield);

    var docs = [], ringG = new THREE.Group(); g.add(ringG);
    for (var k = 0; k < 6; k++) {
      var a = k / 6 * TAU, cd = PF.card(0.62, 0.82, 0.05, 160, PF.drawDoc);
      cd.mesh.position.set(Math.sin(a) * 2.1, Math.sin(k * 2.1) * 0.7, Math.cos(a) * 2.1);
      cd.mesh.rotation.y = a; ringG.add(cd.mesh); docs.push(cd.mesh);
    }
    var NA = opt.agents || 500, ap = new Float32Array(NA * 3);
    for (var i = 0; i < NA; i++) { var v = randUnit().multiplyScalar(3.2 + Math.random() * 0.5); ap[i * 3] = v.x; ap[i * 3 + 1] = v.y * 0.7; ap[i * 3 + 2] = v.z; }
    var agents = pointsOf(ap, C.amber, 0.05, 0.75, false); g.add(agents);

    return function (t, dt, redraw) {
      ph.group.rotation.y = Math.sin(t * 0.5) * 0.4 + PF.state.mx * 0.25;
      shield.rotation.y = t * 0.7; shield.position.y = 0.2 + Math.sin(t * 1.2) * 0.08;
      ringG.rotation.y = t * 0.25;
      docs.forEach(function (d, k) { d.position.y = Math.sin(t * 0.8 + k * 2.1) * 0.7; });
      agents.rotation.y = -t * 0.05;
      if (redraw) ph.redraw(t);
    };
  };

  /* ---------- globe of learners ---------- */
  S.globe = function (o, opt) {
    var C = PF.col, R = 1.7, g = new THREE.Group(); o.add(g);
    g.add(new THREE.Mesh(new THREE.SphereGeometry(R - 0.02, 48, 32), mat(0x0c1424, 0.2, 0.8)));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(R + 0.02, 24, 16), basic(C.blue, 0.12, { wireframe: true })));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 32, 24), basic(C.blue, 0.07, { side: THREE.BackSide })));
    var N = 900, dp = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) { var v = randUnit().multiplyScalar(R + 0.01); dp[i * 3] = v.x; dp[i * 3 + 1] = v.y; dp[i * 3 + 2] = v.z; }
    g.add(pointsOf(dp, C.blue, 0.035, 0.85, false));

    var markers = opt.markers || [[12.97, 77.59], [51.5, -0.12], [25.2, 55.27], [40.7, -74.0]];
    var hub = latLon(markers[0][0], markers[0][1], R), arcs = [];
    markers.forEach(function (m, k) {
      var p = latLon(m[0], m[1], R + 0.02);
      var dot = new THREE.Mesh(new THREE.SphereGeometry(k === 0 ? 0.075 : 0.055, 12, 12), basic(k === 0 ? C.amber : C.text));
      dot.position.copy(p); g.add(dot);
      if (k > 0) {
        var mid = hub.clone().add(p).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.55);
        var curve = new THREE.QuadraticBezierCurve3(hub.clone(), mid, p.clone());
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), new THREE.LineBasicMaterial({ color: C.amber, transparent: true, opacity: 0.55 })));
        var pulse = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), basic(C.amber));
        g.add(pulse); arcs.push({ curve: curve, pulse: pulse, off: k * 0.23 });
      }
    });
    g.rotation.z = 0.25;
    return function (t) {
      g.rotation.y = t * 0.15 + PF.state.mx * 0.3;
      arcs.forEach(function (a) { a.pulse.position.copy(a.curve.getPoint((t * 0.28 + a.off) % 1)); });
    };
  };

  /* ---------- in-house app tiles ---------- */
  S.apps = function (o, opt) {
    var C = PF.col, apps = opt.apps || [['Attendance', 'calendar'], ['Asset tracking', 'barcode'], ['Billing', 'receipt'], ['Operations', 'gear']];
    var g = new THREE.Group(); o.add(g);
    var spots = [[-0.8, 0.8, 0.2], [0.8, 0.8, -0.2], [-0.8, -0.8, -0.2], [0.8, -0.8, 0.2]], cards = [];
    apps.slice(0, 4).forEach(function (a, k) {
      var cd = PF.card(1.4, 1.4, 0.22, 256, function (c, W, H) { PF.drawAppCard(c, W, H, a[0], a[1]); });
      cd.mesh.position.set(spots[k][0], spots[k][1], spots[k][2]); g.add(cd.mesh);
      cards.push({ m: cd.mesh, base: spots[k][1], ph: k * 1.6 });
    });
    var NE = 90, ep = new Float32Array(NE * 3), orbit = new THREE.Group(); g.add(orbit);
    for (var i = 0; i < NE; i++) {
      var a2 = i / NE * TAU, rad = 2.5 + (i % 3) * 0.12;
      ep[i * 3] = Math.cos(a2) * rad; ep[i * 3 + 1] = Math.sin(a2) * rad; ep[i * 3 + 2] = Math.sin(i * 3.1) * 0.3;
    }
    orbit.add(pointsOf(ep, C.amber, 0.06, 0.9, false));
    var ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.006, 6, 120), basic(C.blue, 0.35)); orbit.add(ring);
    return function (t) {
      var st = PF.state;
      cards.forEach(function (c) { c.m.position.y = c.base + Math.sin(t * 0.9 + c.ph) * 0.07; c.m.rotation.y = st.mx * 0.25 + Math.sin(t * 0.5 + c.ph) * 0.15; c.m.rotation.x = -st.my * 0.1; });
      orbit.rotation.z = t * 0.12; orbit.rotation.x = 0.35;
    };
  };

  /* ---------- Inkpot: book and rising letters ---------- */
  S.book = function (o, opt) {
    var C = PF.col, g = new THREE.Group(); o.add(g);
    g.rotation.x = -0.55; g.position.y = -0.3;
    var cover = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.95, 0.1), mat(0x1b2640, 0.3, 0.6)); cover.position.z = -0.08; g.add(cover);
    var pageL = PF.card(1.3, 1.75, 0.03, 256, PF.drawPage), pageR = PF.card(1.3, 1.75, 0.03, 256, PF.drawPage);
    var pl = new THREE.Group(), pr = new THREE.Group();
    pageL.mesh.position.x = -0.65; pl.add(pageL.mesh); pl.rotation.y = 0.1;
    pageR.mesh.position.x = 0.65; pr.add(pageR.mesh); pr.rotation.y = -0.1;
    g.add(pl); g.add(pr);
    var turn = PF.card(1.3, 1.75, 0.03, 256, PF.drawPage), tp = new THREE.Group();
    turn.mesh.position.x = 0.65; tp.add(turn.mesh); tp.position.z = 0.02; g.add(tp);

    var pot = new THREE.Group();
    pot.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.42, 20), mat(0x151c2b, 0.6, 0.3)));
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.14, 16), mat(0x1f2a3d, 0.6, 0.3)); neck.position.y = 0.26; pot.add(neck);
    var ink = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), basic(C.blue)); ink.rotation.x = -Math.PI / 2; ink.position.y = 0.335; pot.add(ink);
    pot.position.set(1.9, -0.2, 0.55); g.add(pot);

    var glyphs = (opt.glyphs || ['A', 'Aa', '</>', '1+1', '?', '!', '{ }', 'abc', 'Kt', '2x', 'a2', 'fn']).map(function (txt, k) {
      var s = PF.makeLabel(txt, k % 3 === 0 ? PF.theme.amber : PF.theme.text, 40); s.scale.set(1.1, 0.2, 1);
      g.add(s); return { s: s, ph: k / 12, x: (k % 5 - 2) * 0.55 + Math.sin(k) * 0.2 };
    });
    return function (t) {
      g.rotation.z = Math.sin(t * 0.4) * 0.12 + PF.state.mx * 0.2;
      var u = (t * 0.32) % 1, ang = -0.1 - (Math.PI - 0.2) * ease(u);
      tp.rotation.y = ang;
      glyphs.forEach(function (gl) {
        var p = (t * 0.2 + gl.ph) % 1;
        gl.s.position.set(gl.x, 0.2 + p * 3.2, 0.3 + Math.sin(p * 6 + gl.ph * 9) * 0.3);
        gl.s.material.opacity = Math.sin(p * Math.PI);
      });
    };
  };

  /* ---------- career helix, one node per timeline entry ---------- */
  S.helix = function (o, opt, X) {
    var C = PF.col, tl = X.content.timeline || [], n = Math.max(1, tl.length);
    var H = 6, R = 1.1, TURNS = 3, g = new THREE.Group(); o.add(g);
    class Helix extends THREE.Curve {
      constructor(ph) { super(); this.ph = ph; }
      getPoint(t, target) {
        var p = target || new THREE.Vector3(), a = t * TURNS * TAU + this.ph;
        return p.set(Math.cos(a) * R, (t - 0.5) * H, Math.sin(a) * R);
      }
    }
    var cA = new Helix(0), cB = new Helix(Math.PI);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(cA, 240, 0.035, 8, false), mat(C.blue, 0.2, 0.4, { emissive: 0x1a3d80, emissiveIntensity: 0.9 })));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(cB, 240, 0.025, 8, false), mat(C.amber, 0.2, 0.4, { emissive: 0x6a3d00, emissiveIntensity: 0.7 })));
    var rp = [];
    for (var k = 0; k <= 30; k++) { var p0 = cA.getPoint(k / 30), q0 = cB.getPoint(k / 30); rp.push(p0.x, p0.y, p0.z, q0.x, q0.y, q0.z); }
    var rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
    g.add(new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0x6f86b3, transparent: true, opacity: 0.3 })));
    var nodes = [];
    for (var i = 0; i < n; i++) {
      var t = 1 - (i + 0.5) / n, p = cA.getPoint(t);
      var m = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), mat(C.text, 0.1, 0.3, { emissive: C.amber, emissiveIntensity: 0.5 }));
      m.position.copy(p); g.add(m);
      if (tl[i] && tl[i].short) {
        var lb = PF.makeLabel(tl[i].short, PF.theme.text, 34);
        lb.position.set(p.x + (p.x >= 0 ? 0.95 : -0.95), p.y, p.z); g.add(lb);
      }
      nodes.push({ m: m, s: 1 });
    }
    return function (t, dt) {
      var st = PF.state, cur = st.hoverIdx >= 0 ? st.hoverIdx : st.activeIdx;
      g.rotation.y = t * 0.25 + st.mx * 0.2;
      nodes.forEach(function (nd, i) {
        var want = i === cur ? 2 : 1;
        nd.s += (want - nd.s) * Math.min(1, dt * 8);
        nd.m.scale.setScalar(nd.s); nd.m.material.emissiveIntensity = i === cur ? 1.6 : 0.5;
      });
    };
  };

  /* ---------- skills sphere ---------- */
  S.sphere = function (o, opt, X) {
    var C = PF.col, cfg = X.content.sphere || { words: [], hot: [] }, words = cfg.words || [], hot = {};
    (cfg.hot || []).forEach(function (w) { hot[w] = 1; });
    var g = new THREE.Group(); o.add(g);
    var sprites = [], n = words.length;
    words.forEach(function (w, k) {
      var y = n > 1 ? 1 - (k / (n - 1)) * 2 : 0, rad = Math.sqrt(Math.max(0, 1 - y * y)), th = k * 2.399963, R = 2.5;
      var s = PF.makeLabel(w, hot[w] ? PF.theme.amber : '#cfd8e6', 32);
      s.position.set(Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R); g.add(s); sprites.push(s);
    });
    g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.25, 2), basic(C.blue, 0.14, { wireframe: true })));
    var v = new THREE.Vector3();
    return function (t) {
      var st = PF.state;
      g.rotation.y = t * 0.18 + st.mx * 0.25; g.rotation.x = 0.2 + st.my * 0.1;
      sprites.forEach(function (s) {
        s.getWorldPosition(v);
        s.material.opacity = Math.max(0.2, Math.min(1, 1.3 - (v.distanceTo(X.camera.position) - 5.5) / 5.5));
      });
    };
  };

  /* ---------- contact: particle knot ---------- */
  S.knot = function (o) {
    var C = PF.col, g = new THREE.Group(); o.add(g);
    g.add(new THREE.Points(new THREE.TorusKnotGeometry(1.6, 0.34, 260, 22, 2, 3), new THREE.PointsMaterial({ color: C.blue, size: 0.04, transparent: true, opacity: 0.9 })));
    g.add(new THREE.Mesh(new THREE.TorusKnotGeometry(1.6, 0.12, 200, 10, 2, 3), basic(C.amber, 0.35, { wireframe: true })));
    return function (t) { g.rotation.y = t * 0.25 + PF.state.mx * 0.3; g.rotation.x = t * 0.12 - PF.state.my * 0.2; };
  };
})();
