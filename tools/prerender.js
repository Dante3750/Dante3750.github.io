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
for (const f of ['js/content.js', 'js/helpers.js', 'js/app.js']) {
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
