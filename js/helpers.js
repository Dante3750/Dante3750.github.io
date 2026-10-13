/* Shared 3D helpers and the painters for the screens drawn onto phones and cards.
   Nothing here touches THREE until a scene is built, so the file loads safely even if three.js is blocked. */
(function () {
  'use strict';
  var PF = window.PF = window.PF || {};

  PF.theme = { ink: '#080c13', text: '#e8ecf3', mute: '#8d99ab', blue: '#4d8dff', amber: '#ffb347' };
  PF.col = {};
  PF.state = { px: 0, py: 0, mx: 0, my: 0, hoverIdx: -1, activeIdx: 0 };
  PF.scenes = {};
  PF.repaint = [];   /* callbacks that redraw static canvases once web fonts have loaded */

  PF.setTheme = function (t) {
    var k;
    for (k in t) { if (Object.prototype.hasOwnProperty.call(t, k)) PF.theme[k] = t[k]; }
    if (window.THREE) {
      ['ink', 'text', 'mute', 'blue', 'amber'].forEach(function (n) { PF.col[n] = new THREE.Color(PF.theme[n]).getHex(); });
    }
  };

  PF.pad = function (n, l) { n = String(n); while (n.length < l) n = '0' + n; return n; };

  PF.rgba = function (hex, a) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  };

  PF.rr = function (c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };

  PF.rrShape = function (w, h, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  };

  /* rounded flat plane whose UVs span the full width and height, so a canvas texture fits it exactly */
  PF.rrPlane = function (w, h, r) {
    var g = new THREE.ShapeGeometry(PF.rrShape(w, h, r), 12);
    var p = g.attributes.position, uv = g.attributes.uv;
    for (var i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
    uv.needsUpdate = true;
    return g;
  };

  PF.canvasTex = function (cw, ch) {
    var cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    var tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
    return { cv: cv, ctx: cv.getContext('2d'), tex: tex };
  };

  /* flat card with a canvas texture. draw(ctx, W, H, t) paints it. */
  PF.card = function (w, h, r, cw, draw) {
    var ct = PF.canvasTex(cw, Math.round(cw * h / w));
    var mesh = new THREE.Mesh(PF.rrPlane(w, h, r), new THREE.MeshBasicMaterial({ map: ct.tex, transparent: true, side: THREE.DoubleSide, toneMapped: false }));
    function redraw(t) { draw(ct.ctx, ct.cv.width, ct.cv.height, t || 0); ct.tex.needsUpdate = true; }
    redraw(0);
    PF.repaint.push(function () { redraw(0); });
    return { mesh: mesh, redraw: redraw };
  };

  /* soft round dot, shared by every particle system (square points look cheap) */
  var _dot = null;
  PF.dotTex = function () {
    if (_dot) return _dot;
    var cv = document.createElement('canvas'); cv.width = cv.height = 64;
    var c = cv.getContext('2d'), g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    return (_dot = new THREE.CanvasTexture(cv));
  };
  /* big soft glow, drawn additively behind a scene */
  PF.glow = function (color, size, opacity) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 128;
    var c = cv.getContext('2d'), g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.4, 'rgba(255,255,255,.28)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), color: color, transparent: true, opacity: opacity, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    sp.scale.set(size, size, 1);
    return sp;
  };

  PF.makeLabel = function (text, color, fs) {
    var cv = document.createElement('canvas'); cv.width = 400; cv.height = 72;
    var c = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv);
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    s.scale.set(2, 0.36, 1);
    function paint() {
      c.clearRect(0, 0, 400, 72);
      c.font = '600 ' + fs + 'px "Bricolage Grotesque",system-ui,sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = color; c.fillText(text, 200, 38);
      tex.needsUpdate = true;
    }
    paint(); PF.repaint.push(paint);
    return s;
  };

  PF.makePhone = function (w, h, draw) {
    var d = 0.09, r = 0.17;
    var bodyGeo = new THREE.ExtrudeGeometry(PF.rrShape(w, h, r), { depth: d, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 4, curveSegments: 14 });
    bodyGeo.translate(0, 0, -d / 2);
    var group = new THREE.Group();
    group.add(new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({ color: 0x33425f, metalness: 0.85, roughness: 0.22, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 1.8 })));
    var sw = w - 0.09, sh = h - 0.09;
    var ct = PF.canvasTex(420, Math.round(420 * sh / sw));
    var screen = new THREE.Mesh(PF.rrPlane(sw, sh, r - 0.04), new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false }));
    screen.position.z = d / 2 + 0.025 + 0.002;
    group.add(screen);
    function redraw(t) { draw(ct.ctx, ct.cv.width, ct.cv.height, t); ct.tex.needsUpdate = true; }
    redraw(0);
    PF.repaint.push(function () { redraw(0); });
    return { group: group, redraw: redraw };
  };

  /* ---------- screens ---------- */
  var LOG = [
    ['I', 'BluetoothGatt', 'state: CONNECTED'], ['D', 'WifiP2p', 'group formed'], ['I', 'Provisioner', 'config 3/7 sent'],
    ['W', 'Provisioner', 'retry 1, weak link'], ['I', 'WorkManager', 'sync complete'], ['D', 'Compose', 'recomposed 2.1ms'],
    ['I', 'WebRTC', 'video track attached'], ['D', 'Room', 'migration ok'], ['I', 'Provisioner', 'config 7/7 applied'],
    ['D', 'Scanner', 'device found'], ['I', 'Crashlytics', 'session uploaded'], ['D', 'OkHttp', '200 OK 84ms']
  ];

  PF.drawLog = function (c, W, H, t, title, lines) {
    var log = lines && lines.length ? lines : LOG, T = PF.theme;
    c.fillStyle = '#090e16'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#0f1724'; c.fillRect(0, 0, W, 96);
    c.fillStyle = T.text; c.font = '600 28px "Instrument Sans",system-ui,sans-serif'; c.fillText(title, 28, 64);
    c.fillStyle = T.blue; c.beginPath(); c.arc(W - 44, 56, 8, 0, 6.283); c.fill();
    var lh = 34, sp = 26, off = (t * sp) % lh, start = Math.floor(t * sp / lh);
    c.save(); c.beginPath(); c.rect(0, 100, W, H - 100); c.clip();
    c.font = '500 19px "JetBrains Mono",ui-monospace,monospace';
    var rows = Math.ceil((H - 100) / lh) + 1;
    for (var n = 0; n < rows; n++) {
      var e = log[(start + n) % log.length], y = 130 + n * lh - off, tag = e[0] + '/' + e[1];
      c.fillStyle = e[0] === 'W' ? T.amber : (e[0] === 'I' ? T.blue : T.mute);
      c.fillText(tag, 24, y);
      c.fillStyle = '#cdd6e4'; c.fillText(' ' + e[2], 24 + c.measureText(tag).width, y);
    }
    c.restore();
  };

  PF.drawRadar = function (c, W, H, t) {
    var T = PF.theme;
    c.fillStyle = '#090e16'; c.fillRect(0, 0, W, H);
    c.fillStyle = T.text; c.font = '600 28px "Instrument Sans",system-ui,sans-serif'; c.fillText('Pairing devices', 28, 64);
    var cx = W / 2, cy = H * 0.4, k;
    for (k = 0; k < 4; k++) {
      var p = (t * 0.45 + k / 4) % 1;
      c.strokeStyle = PF.rgba(T.blue, ((1 - p) * 0.85).toFixed(3)); c.lineWidth = 3;
      c.beginPath(); c.arc(cx, cy, p * W * 0.56, 0, 6.283); c.stroke();
    }
    for (k = 0; k < 9; k++) {
      var a = k * 2.4, rr = W * (0.12 + 0.034 * ((k * 5) % 9));
      c.fillStyle = (Math.floor(t * 2) + k) % 5 === 0 ? T.amber : '#3a4a66';
      c.beginPath(); c.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 7, 0, 6.283); c.fill();
    }
    c.fillStyle = T.blue; c.beginPath(); c.arc(cx, cy, 12, 0, 6.283); c.fill();
    c.fillStyle = T.amber; c.font = '700 72px "JetBrains Mono",ui-monospace,monospace'; c.textAlign = 'center';
    c.fillText(PF.pad(Math.floor(t * 5) % 72, 2), cx, H * 0.78);
    c.fillStyle = T.mute; c.font = '500 20px "JetBrains Mono",ui-monospace,monospace';
    c.fillText('devices provisioned', cx, H * 0.78 + 40); c.textAlign = 'left';
  };

  PF.drawStream = function (c, W, H, t, tag) {
    var T = PF.theme;
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#10203a'); g.addColorStop(1, '#07090f');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (var k = 0; k < 5; k++) {
      var x = W * (0.5 + 0.35 * Math.sin(t * 0.4 + k * 1.7)), y = H * (0.4 + 0.2 * Math.cos(t * 0.33 + k * 2.3)), r = W * (0.16 + 0.05 * Math.sin(t + k));
      var rg = c.createRadialGradient(x, y, 0, x, y, r * 2);
      rg.addColorStop(0, PF.rgba(k % 2 ? T.blue : T.amber, k % 2 ? 0.55 : 0.45)); rg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = rg; c.fillRect(0, 0, W, H);
    }
    c.fillStyle = T.text; c.font = '600 26px "Instrument Sans",system-ui,sans-serif'; c.fillText(tag, 28, 60);
    c.fillStyle = T.amber; c.fillRect(W - 120, 38, 92, 32);
    c.fillStyle = T.ink; c.font = '700 18px "JetBrains Mono",ui-monospace,monospace'; c.fillText('LIVE', W - 96, 60);
    var total = 754 + t, mm = Math.floor(total / 60), ss = Math.floor(total % 60), ms = Math.floor((total % 1) * 1000);
    c.fillStyle = T.text; c.font = '500 34px "JetBrains Mono",ui-monospace,monospace';
    c.fillText('00:' + PF.pad(mm % 60, 2) + ':' + PF.pad(ss, 2) + '.' + PF.pad(ms, 3), 28, H - 96);
    c.fillStyle = T.mute; c.font = '500 19px "JetBrains Mono",ui-monospace,monospace'; c.fillText('drift < 150 ms', 28, H - 58);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(28, H - 34, W - 56, 5);
    c.fillStyle = T.blue; c.fillRect(28, H - 34, (W - 56) * ((t % 30) / 30), 5);
  };

  PF.drawForm = function (c, W, H, t) {
    var T = PF.theme;
    c.fillStyle = '#090e16'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#0f1724'; c.fillRect(0, 0, W, 104);
    c.fillStyle = T.text; c.font = '600 28px "Instrument Sans",system-ui,sans-serif'; c.fillText('New policy', 28, 60);
    c.fillStyle = T.mute; c.font = '500 17px "JetBrains Mono",ui-monospace,monospace'; c.fillText('MEDICAL  ·  LIFE', 28, 88);
    c.strokeStyle = T.blue; c.lineWidth = 4; c.beginPath(); c.arc(W - 52, 56, 14, t * 3, t * 3 + 4.2); c.stroke();
    var fields = ['Applicant', 'Plan', 'Sum insured', 'Documents'];
    for (var k = 0; k < fields.length; k++) {
      var y = 160 + k * 118;
      c.fillStyle = T.mute; c.font = '500 17px "JetBrains Mono",ui-monospace,monospace'; c.fillText(fields[k].toUpperCase(), 28, y);
      c.fillStyle = '#111a28'; PF.rr(c, 28, y + 14, W - 56, 50, 10); c.fill();
      var p = Math.max(0, Math.min(1, ((t * 0.35) % 1.6) * 1.8 - k * 0.45)), bw = (W - 76) * p * 0.8;
      if (bw > 16) { c.fillStyle = T.blue; PF.rr(c, 38, y + 32, bw, 14, 7); c.fill(); }
    }
    var pulse = 0.5 + 0.5 * Math.sin(t * 3);
    c.fillStyle = PF.rgba(T.amber, (0.75 + 0.25 * pulse).toFixed(2)); PF.rr(c, 28, H - 120, W - 56, 66, 14); c.fill();
    c.fillStyle = T.ink; c.font = '700 26px "Instrument Sans",system-ui,sans-serif'; c.textAlign = 'center';
    c.fillText('Submit', W / 2, H - 78); c.textAlign = 'left';
  };

  PF.drawHud = function (c, W, H, t, title, rows) {
    var T = PF.theme;
    c.clearRect(0, 0, W, H);
    c.fillStyle = PF.rgba(T.ink, 0.82); PF.rr(c, 0, 0, W, H, 18); c.fill();
    c.strokeStyle = PF.rgba(T.blue, 0.9); c.lineWidth = 3; PF.rr(c, 2, 2, W - 4, H - 4, 18); c.stroke();
    c.fillStyle = T.text; c.font = '600 26px "Instrument Sans",system-ui,sans-serif'; c.fillText(title, 22, 44);
    c.font = '500 17px "JetBrains Mono",ui-monospace,monospace';
    for (var k = 0; k < rows.length; k++) {
      var done = ((t * 0.8) % (rows.length + 1)) > k + 0.6;
      c.fillStyle = done ? T.amber : T.mute; c.fillText((done ? '[x] ' : '[ ] ') + rows[k], 22, 86 + k * 34);
    }
  };

  PF.drawDoc = function (c, W, H) {
    var T = PF.theme;
    c.clearRect(0, 0, W, H);
    c.fillStyle = '#e8ecf3'; PF.rr(c, 0, 0, W, H, 10); c.fill();
    c.fillStyle = T.blue; c.fillRect(14, 16, W * 0.55, 10);
    c.fillStyle = '#b6bfce';
    for (var k = 0; k < 6; k++) c.fillRect(14, 44 + k * 18, W - 28 - (k % 3) * 24, 6);
    c.strokeStyle = T.amber; c.lineWidth = 4; c.beginPath(); c.arc(W - 36, H - 38, 17, 0, 6.283); c.stroke();
  };

  var ICONS = {
    calendar: function (c, cx, cy) {
      c.strokeRect(cx - 48, cy - 42, 96, 86);
      c.beginPath(); c.moveTo(cx - 48, cy - 16); c.lineTo(cx + 48, cy - 16);
      c.moveTo(cx - 24, cy - 56); c.lineTo(cx - 24, cy - 30); c.moveTo(cx + 24, cy - 56); c.lineTo(cx + 24, cy - 30); c.stroke();
      c.beginPath(); c.moveTo(cx - 22, cy + 16); c.lineTo(cx - 6, cy + 32); c.lineTo(cx + 24, cy); c.stroke();
    },
    barcode: function (c, cx, cy) {
      var w = [6, 3, 9, 3, 6, 12, 3, 6, 9, 3], x = cx - 50;
      w.forEach(function (b, k) { if (k % 2 === 0) c.fillRect(x, cy - 40, b, 80); x += b + 3; });
      c.fillRect(cx - 50, cy + 52, 90, 4);
    },
    receipt: function (c, cx, cy) {
      c.beginPath(); c.moveTo(cx - 38, cy - 50); c.lineTo(cx + 38, cy - 50); c.lineTo(cx + 38, cy + 50);
      for (var i = 0; i < 5; i++) { c.lineTo(cx + 38 - (i + 0.5) * 15.2, cy + 40); c.lineTo(cx + 38 - (i + 1) * 15.2, cy + 50); }
      c.lineTo(cx - 38, cy - 50); c.closePath(); c.stroke();
      c.beginPath(); c.moveTo(cx - 22, cy - 28); c.lineTo(cx + 22, cy - 28); c.moveTo(cx - 22, cy - 10); c.lineTo(cx + 22, cy - 10); c.moveTo(cx - 22, cy + 8); c.lineTo(cx + 4, cy + 8); c.stroke();
    },
    gear: function (c, cx, cy) {
      c.beginPath(); c.arc(cx, cy, 34, 0, 6.283); c.stroke();
      c.beginPath(); c.arc(cx, cy, 13, 0, 6.283); c.stroke();
      c.beginPath();
      for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; c.moveTo(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34); c.lineTo(cx + Math.cos(a) * 50, cy + Math.sin(a) * 50); }
      c.stroke();
    }
  };

  PF.drawAppCard = function (c, W, H, label, icon) {
    var T = PF.theme;
    c.clearRect(0, 0, W, H);
    c.fillStyle = '#0f1724'; PF.rr(c, 0, 0, W, H, 36); c.fill();
    c.strokeStyle = PF.rgba(T.blue, 0.7); c.lineWidth = 4; PF.rr(c, 2, 2, W - 4, H - 4, 36); c.stroke();
    c.strokeStyle = T.amber; c.fillStyle = T.amber; c.lineWidth = 8; c.lineCap = 'round'; c.lineJoin = 'round';
    (ICONS[icon] || ICONS.gear)(c, W / 2, H * 0.4);
    c.fillStyle = T.text; c.font = '600 28px "Instrument Sans",system-ui,sans-serif'; c.textAlign = 'center';
    c.fillText(label, W / 2, H - 38); c.textAlign = 'left';
  };

  PF.drawPage = function (c, W, H) {
    var T = PF.theme;
    c.fillStyle = '#e9e4d8'; c.fillRect(0, 0, W, H);
    c.fillStyle = T.blue; c.fillRect(34, 40, W * 0.5, 14);
    c.fillStyle = '#9aa3b2';
    for (var k = 0; k < 14; k++) c.fillRect(34, 90 + k * 26, W - 68 - ((k * 37) % 70), 7);
  };
})();
