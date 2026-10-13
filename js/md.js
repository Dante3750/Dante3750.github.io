/* Tiny Markdown-to-HTML for blog posts, plus the post list helper. Used by the blog page, the home page and the prerender step. */
(function (root) {
  'use strict';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function safeUrl(u) { u = String(u).trim(); return /^(https?:|mailto:|#|\/|\.\/|\.\.\/|[\w-]+(\/|\.html|\.pdf|\.xml))/i.test(u) ? u : '#'; }
  function inline(t) {
    t = esc(t);
    var codes = [];
    t = t.replace(/`([^`]+)`/g, function (m, c) { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (m, a, u) { return '<img src="' + safeUrl(u) + '" alt="' + a + '" loading="lazy">'; });
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, a, u) { u = safeUrl(u); return '<a href="' + u + '"' + (/^https?:/i.test(u) ? ' target="_blank" rel="noopener"' : '') + '>' + a + '</a>'; });
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    return t.replace(/\u0000(\d+)\u0000/g, function (m, i) { return '<code>' + codes[+i] + '</code>'; });
  }
  function render(src) {
    var lines = String(src || '').replace(/\r/g, '').split('\n'), out = [], i = 0;
    function para(buf) { if (buf.length) out.push('<p>' + inline(buf.join(' ')) + '</p>'); }
    var buf = [];
    while (i < lines.length) {
      var ln = lines[i], m;
      if ((m = ln.match(/^```(\w*)\s*$/))) {
        para(buf); buf = []; var code = []; i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
        i++; out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); continue;
      }
      if (!ln.trim()) { para(buf); buf = []; i++; continue; }
      if ((m = ln.match(/^(#{2,3})\s+(.*)$/))) { para(buf); buf = []; out.push('<h' + m[1].length + '>' + inline(m[2]) + '</h' + m[1].length + '>'); i++; continue; }
      if (/^---+\s*$/.test(ln)) { para(buf); buf = []; out.push('<hr>'); i++; continue; }
      if (/^>\s?/.test(ln)) { para(buf); buf = []; var q = []; while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, '')); out.push('<blockquote>' + inline(q.join(' ')) + '</blockquote>'); continue; }
      if (/^\s*[-*]\s+/.test(ln) || /^\s*\d+\.\s+/.test(ln)) {
        para(buf); buf = []; var ord = /^\s*\d+\./.test(ln), items = [];
        while (i < lines.length && (ord ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/).test(lines[i])) items.push('<li>' + inline(lines[i++].replace(/^\s*(?:[-*]|\d+\.)\s+/, '')) + '</li>');
        out.push((ord ? '<ol>' : '<ul>') + items.join('') + (ord ? '</ol>' : '</ul>')); continue;
      }
      buf.push(ln.trim()); i++;
    }
    para(buf);
    return out.join('\n');
  }
  function posts() {
    return (root.POSTS || []).filter(function (p) { return p && !p.draft && p.slug; })
      .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  }
  function words(p) { return String(p.body || '').split(/\s+/).filter(Boolean).length; }
  function minutes(p) { return Math.max(1, Math.round(words(p) / 200)); }
  function fmtDate(d) {
    var m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/); if (!m) return d;
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1];
  }
  root.PFMD = { render: render, inline: inline, esc: esc, posts: posts, minutes: minutes, fmtDate: fmtDate };
})(typeof window !== 'undefined' ? window : globalThis);
