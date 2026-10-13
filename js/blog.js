/* Renders blog.html (list + single post). The same code runs in the prerender step to build static post pages. */
(function () {
  'use strict';
  var D = window.PORTFOLIO || {}, M = window.PFMD, P = D.profile || {}, T = D.theme || {};
  var root = document.documentElement.style;
  ['ink', 'text', 'mute', 'blue', 'amber'].forEach(function (k) { if (T[k]) root.setProperty('--' + k, T[k]); });

  var list = M.posts(), app = document.getElementById('blog'), active = null;
  var home = document.body.getAttribute('data-home') || 'index.html';
  var self = document.body.getAttribute('data-self') || 'blog.html';

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function meta(p) { return M.fmtDate(p.date) + ' · ' + M.minutes(p) + ' min read'; }
  function setHead(title, desc) {
    document.title = title;
    var d = document.querySelector('meta[name="description"]'); if (d && desc) d.setAttribute('content', desc);
  }

  function postHref(p) { return self + '#/' + p.slug; }

  function renderList() {
    app.textContent = '';
    setHead('Blog | ' + (P.name || ''), 'Monthly updates and notes from ' + (P.name || '') + '.');
    var head = el('header', 'bl-head');
    head.appendChild(el('p', 'eyebrow', 'Notes'));
    head.appendChild(el('h1', null, 'What I am building, month by month'));
    var sub = el('p', 'bl-sub'); sub.appendChild(document.createTextNode('Monthly updates, deep dives and demos. '));
    var rss = el('a', null, 'RSS feed'); rss.href = 'feed.xml'; sub.appendChild(rss); head.appendChild(sub);
    app.appendChild(head);

    var tags = {}; list.forEach(function (p) { (p.tags || []).forEach(function (t) { tags[t] = 1; }); });
    var names = Object.keys(tags);
    var bar = el('div', 'bl-tags');
    if (names.length > 1) {
      ['All'].concat(names).forEach(function (t) {
        var b = el('button', 'chip' + (t === 'All' ? ' on' : ''), t); b.type = 'button';
        b.addEventListener('click', function () {
          active = t === 'All' ? null : t;
          Array.prototype.forEach.call(bar.children, function (c) { c.classList.toggle('on', c === b); });
          Array.prototype.forEach.call(ul.children, function (li) { li.hidden = !!active && (li.getAttribute('data-tags') || '').split('|').indexOf(active) < 0; });
        });
        bar.appendChild(b);
      });
      app.appendChild(bar);
    }
    var ul = el('ul', 'bl-list');
    if (!list.length) ul.appendChild(el('li', 'bl-empty', 'No posts yet. The first one is coming soon.'));
    list.forEach(function (p) {
      var li = el('li'); li.setAttribute('data-tags', (p.tags || []).join('|'));
      li.appendChild(el('p', 'mono', meta(p)));
      var h = el('h2'), a = el('a', null, p.title); a.href = postHref(p); h.appendChild(a); li.appendChild(h);
      if (p.summary) li.appendChild(el('p', 'bl-sum', p.summary));
      if (p.tags && p.tags.length) { var tg = el('ul', 'tags'); p.tags.forEach(function (t) { tg.appendChild(el('li', null, t)); }); li.appendChild(tg); }
      ul.appendChild(li);
    });
    app.appendChild(ul);
  }

  function renderPost(p) {
    app.textContent = '';
    setHead(p.title + ' | ' + (P.name || ''), p.summary);
    var art = el('article', 'bl-post');
    var back = el('a', 'bl-back', '← All posts'); back.href = self; art.appendChild(back);
    art.appendChild(el('p', 'mono', meta(p)));
    art.appendChild(el('h1', null, p.title));
    if (p.summary) art.appendChild(el('p', 'lede', p.summary));
    var body = el('div', 'bl-body'); body.innerHTML = M.render(p.body); art.appendChild(body);
    if (p.tags && p.tags.length) { var tg = el('ul', 'tags'); p.tags.forEach(function (t) { tg.appendChild(el('li', null, t)); }); art.appendChild(tg); }

    var i = list.indexOf(p), nx = el('nav', 'bl-next');
    [[list[i + 1], 'Older'], [list[i - 1], 'Newer']].forEach(function (pr) {
      if (!pr[0]) return;
      var a = el('a'); a.href = postHref(pr[0]);
      a.appendChild(el('span', 'mono', pr[1])); a.appendChild(el('strong', null, pr[0].title)); nx.appendChild(a);
    });
    art.appendChild(nx);

    var cta = el('div', 'bl-cta');
    cta.appendChild(el('p', null, 'Working on something that needs an Android engineer?'));
    var b = el('a', 'btn primary', 'Get in touch'); b.href = P.bookingUrl || ('mailto:' + (P.email || '') + '?subject=' + encodeURIComponent(P.emailSubject || 'Hello')); cta.appendChild(b);
    art.appendChild(cta);
    app.appendChild(art);
  }

  function route() {
    var slug = document.body.getAttribute('data-slug') || (location.hash.match(/^#\/([\w-]+)/) || [])[1];
    var p = slug && list.filter(function (x) { return x.slug === slug; })[0];
    if (p) renderPost(p); else renderList();
    if (!document.body.getAttribute('data-slug')) window.scrollTo(0, 0);
  }
  var mark = document.getElementById('mark'); if (mark) { mark.textContent = P.name || ''; mark.href = home; }
  var foot = document.getElementById('foot');
  if (foot) { foot.textContent = ''; var c = el('span', null, '© ' + new Date().getFullYear() + ' ' + (P.name || '')); foot.appendChild(c); }
  window.addEventListener('hashchange', route);
  route();
})();
