/* Ctrl+K / Cmd+K / "/" opens a quick-jump list of sections and pages. */
(function () {
  'use strict';
  var D = window.PORTFOLIO; if (!D) return;
  var items = [];
  D.sections.forEach(function (s) { items.push({ t: s.nav || s.title || s.id, h: '#' + s.id, k: 'Section' }); });
  [['Blog', 'blog.html'], ['Daily reading', 'daily.html'], ['Resume', 'resume.html'], ['Email me', 'mailto:' + D.profile.email]].forEach(function (x) { items.push({ t: x[0], h: x[1], k: 'Go' }); });
  var box, input, ul, sel = 0, shown = [];
  function build() {
    box = document.createElement('div'); box.className = 'pal'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Quick jump');
    var card = document.createElement('div'); card.className = 'pal-card';
    input = document.createElement('input'); input.placeholder = 'Jump to…'; input.setAttribute('aria-label', 'Jump to');
    ul = document.createElement('ul');
    card.appendChild(input); card.appendChild(ul); box.appendChild(card); document.body.appendChild(box);
    box.addEventListener('mousedown', function (e) { if (e.target === box) close(); });
    input.addEventListener('input', draw);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, shown.length - 1); mark(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); mark(); e.preventDefault(); }
      else if (e.key === 'Enter' && shown[sel]) go(shown[sel]);
    });
  }
  function mark() { Array.prototype.forEach.call(ul.children, function (li, i) { li.className = i === sel ? 'on' : ''; }); }
  function draw() {
    var q = input.value.toLowerCase(); sel = 0; ul.textContent = '';
    shown = items.filter(function (i) { return i.t.toLowerCase().indexOf(q) >= 0; });
    shown.forEach(function (i) { var li = document.createElement('li'); li.textContent = i.t; var s = document.createElement('span'); s.textContent = i.k; li.appendChild(s); li.onclick = function () { go(i); }; ul.appendChild(li); });
    mark();
  }
  function go(i) { close(); if (i.h.charAt(0) === '#') { var t = document.getElementById(i.h.slice(1)); if (t) t.scrollIntoView({ behavior: 'smooth' }); else location.hash = i.h; } else location.href = i.h; }
  function open() { if (!box) build(); box.hidden = false; input.value = ''; draw(); input.focus(); }
  function close() { box.hidden = true; }
  document.addEventListener('keydown', function (e) {
    var typing = /input|textarea/i.test((e.target.tagName || ''));
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); open(); }
    else if (e.key === 'Escape' && box && !box.hidden) close();
  });
})();
