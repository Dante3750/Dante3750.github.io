/* Renders daily.html from window.RADAR (written by tools/fetch-feed.js). */
(function () {
  'use strict';
  var D = window.PORTFOLIO || {}, T = D.theme || {}, R = window.RADAR || { items: [] }, app = document.getElementById('daily');
  var root = document.documentElement.style;
  ['ink', 'text', 'mute', 'blue', 'amber'].forEach(function (k) { if (T[k]) root.setProperty('--' + k, T[k]); });
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var items = R.items || [], topic = 'All', q = '';

  var head = el('header', 'bl-head');
  head.appendChild(el('p', 'eyebrow', 'Daily reading'));
  head.appendChild(el('h1', null, "What's new today"));
  var upd = R.updated ? new Date(R.updated).toLocaleString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  head.appendChild(el('p', 'bl-sub', 'New posts on AI, Android and Kotlin, collected every morning from sources I follow. Links open the original article.' + (upd ? ' Last updated ' + upd + '.' : '')));
  app.appendChild(head);

  if (!items.length) { app.appendChild(el('p', 'bl-empty', 'Nothing here yet. The list fills in after the next daily update.')); return; }

  var bar = el('div', 'bl-tags'), list = el('div', 'rd-list');
  var search = el('input', 'rd-search'); search.type = 'search'; search.placeholder = 'Search headlines'; search.setAttribute('aria-label', 'Search headlines');
  var topics = ['All'];
  items.forEach(function (i) { if (topics.indexOf(i.k) < 0) topics.push(i.k); });
  topics.forEach(function (t) {
    var b = el('button', 'chip' + (t === 'All' ? ' on' : ''), t); b.type = 'button';
    b.addEventListener('click', function () { topic = t; Array.prototype.forEach.call(bar.children, function (c) { c.classList.toggle('on', c === b); }); draw(); });
    bar.appendChild(b);
  });
  search.addEventListener('input', function () { q = search.value.toLowerCase(); draw(); });
  app.appendChild(search); app.appendChild(bar); app.appendChild(list);

  function dayLabel(iso) {
    var d = new Date(iso), n = new Date(), y = new Date(Date.now() - 864e5);
    if (d.toDateString() === n.toDateString()) return 'Today';
    if (d.toDateString() === y.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'short' });
  }
  function draw() {
    list.textContent = '';
    var last = '', n = 0;
    items.forEach(function (i) {
      if (topic !== 'All' && i.k !== topic) return;
      if (q && (i.t + ' ' + i.s).toLowerCase().indexOf(q) < 0) return;
      var lab = dayLabel(i.d);
      if (lab !== last) { list.appendChild(el('h2', 'rd-day', lab)); last = lab; }
      var row = el('a', 'rd-item'); row.href = i.u; row.target = '_blank'; row.rel = 'noopener noreferrer';
      row.appendChild(el('span', 'rd-title', i.t));
      row.appendChild(el('span', 'mono', i.k + ' · ' + i.s));
      list.appendChild(row); n++;
    });
    if (!n) list.appendChild(el('p', 'bl-empty', 'No matches.'));
  }
  draw();
})();
