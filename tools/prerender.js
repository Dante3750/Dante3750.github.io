#!/usr/bin/env node
/* Writes your content into index.html as real HTML, so search engines and link previews see it
   without running JavaScript. In the browser, js/app.js replaces it with the live page.

   The GitHub Pages workflow runs this on every deploy. To run it yourself:
       npm install jsdom
       node tools/prerender.js
*/
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

/* load the page in a throwaway DOM, without three.js, so only the HTML gets built */
const page = html.replace(/<script src="[^"]+"><\/script>/g, '').replace(/<link[^>]+>/g, '');
const dom = new JSDOM(page, { runScripts: 'outside-only', url: 'http://localhost/' });
const w = dom.window;
w.console.warn = function () {};   /* app.js warns that three.js is absent, which is expected here */
for (const f of ['js/content.js', 'js/posts.js', 'js/md.js', 'js/helpers.js', 'js/app.js']) {
  w.eval(fs.readFileSync(path.join(root, f), 'utf8'));
}
const d = w.document;
const P = w.PORTFOLIO.profile;

function fill(source, name, inner) {
  const re = new RegExp('<!--pf:' + name + '-->[\\s\\S]*?<!--/pf:' + name + '-->');
  if (!re.test(source)) throw new Error('marker pf:' + name + ' not found in index.html');
  return source.replace(re, () => '<!--pf:' + name + '-->' + inner + '<!--/pf:' + name + '-->');
}

let out = html;
out = fill(out, 'nav', d.getElementById('nav').innerHTML);
out = fill(out, 'dots', d.getElementById('dots').innerHTML);
out = fill(out, 'main', d.getElementById('main').innerHTML);
out = fill(out, 'foot', d.getElementById('foot').innerHTML);
const ld = d.querySelector('script[type="application/ld+json"]');
out = fill(out, 'ld', ld ? '<script type="application/ld+json">' + ld.textContent + '</script>' : '');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
out = out.replace(/<title>.*?<\/title>/, '<title>' + esc(P.name + ' | ' + P.role) + '</title>');
if (P.description) {
  out = out.replace(/(<meta name="description" content=")[^"]*(">)/, (m, a, b) => a + esc(P.description) + b);
  out = out.replace(/(<meta property="og:description" content=")[^"]*(">)/, (m, a, b) => a + esc(P.description) + b);
}
out = out.replace(/(<meta property="og:title" content=")[^"]*(">)/, (m, a, b) => a + esc(P.name + ' | ' + P.role) + b);

fs.writeFileSync(indexPath, out);
console.log('prerendered', d.querySelectorAll('section.st').length, 'sections into index.html');

/* ---------- blog: list page, one static page per post, RSS feed and sitemap ---------- */
const SITE = (process.env.SITE_URL || P.siteUrl || '').replace(/\/$/, '');
const posts = w.PFMD.posts();
const blogPath = path.join(root, 'blog.html');
const blogHtml = fs.readFileSync(blogPath, 'utf8');

function renderBlog(slug) {
  const pg = blogHtml.replace(/<script src="[^"]+"><\/script>/g, '').replace(/<link[^>]+>/g, '');
  const dm = new JSDOM(pg, { runScripts: 'outside-only', url: 'http://localhost/' });
  if (slug) dm.window.document.body.setAttribute('data-slug', slug);
  for (const f of ['js/content.js', 'js/posts.js', 'js/md.js', 'js/blog.js']) dm.window.eval(fs.readFileSync(path.join(root, f), 'utf8'));
  return { html: dm.window.document.getElementById('blog').innerHTML, title: dm.window.document.title };
}
function setMeta(src, title, desc) {
  let r = src.replace(/<title>.*?<\/title>/, '<title>' + esc(title) + '</title>');
  r = r.replace(/(<meta name="description" content=")[^"]*(">)/, (m, a, b) => a + esc(desc) + b);
  return r;
}

const list = renderBlog();
fs.writeFileSync(blogPath, setMeta(fill(blogHtml, 'blog', list.html), list.title, 'Monthly updates and notes from ' + P.name + '.'));

fs.mkdirSync(path.join(root, 'blog'), { recursive: true });
for (const p of posts) {
  const r = renderBlog(p.slug);
  let page = blogHtml.replace(/(href|src)="(?!https?:|#|mailto:|\.\.\/)([^"]+)"/g, '$1="../$2"');
  page = fill(page, 'blog', r.html);
  page = setMeta(page, r.title, p.summary || '');
  page = page.replace('<body class="blogpage">', '<body class="blogpage" data-slug="' + esc(p.slug) + '" data-home="../index.html" data-self="../blog.html">');
  const og = '<meta property="og:title" content="' + esc(p.title) + '">\n<meta property="og:description" content="' + esc(p.summary || '') + '">\n<meta property="og:type" content="article">' +
    (SITE ? '\n<link rel="canonical" href="' + SITE + '/blog/' + p.slug + '.html">' : '');
  page = page.replace('</head>', og + '\n</head>');
  fs.writeFileSync(path.join(root, 'blog', p.slug + '.html'), page);
}

if (SITE) {
  const x = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const items = posts.map((p) => '<item><title>' + x(p.title) + '</title><link>' + SITE + '/blog/' + p.slug + '.html</link><guid>' + SITE + '/blog/' + p.slug +
    '.html</guid><pubDate>' + new Date(p.date + 'T09:00:00Z').toUTCString() + '</pubDate><description>' + x(p.summary || '') + '</description></item>').join('\n');
  fs.writeFileSync(path.join(root, 'feed.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>' + x(P.name) + '</title><link>' + SITE +
    '/blog.html</link><description>' + x('Monthly updates from ' + P.name) + '</description>\n' + items + '\n</channel></rss>\n');
  const urls = [SITE + '/', SITE + '/blog.html'].concat(posts.map((p) => SITE + '/blog/' + p.slug + '.html'));
  fs.writeFileSync(path.join(root, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => '<url><loc>' + u + '</loc></url>').join('\n') + '\n</urlset>\n');
  fs.appendFileSync(path.join(root, 'robots.txt'), fs.readFileSync(path.join(root, 'robots.txt'), 'utf8').includes('Sitemap:') ? '' : 'Sitemap: ' + SITE + '/sitemap.xml\n');
} else {
  console.log('SITE_URL not set: skipped feed.xml and sitemap.xml');
}
console.log('prerendered blog list and', posts.length, 'post page(s)');
