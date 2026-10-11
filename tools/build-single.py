#!/usr/bin/env python3
"""Bundle the site into one HTML file.

    python3 tools/build-single.py              writes dist/portfolio.html (a full page)
    python3 tools/build-single.py --fragment   writes dist/portfolio-fragment.html (no <html>/<head> wrapper)

Local css/ and js/ files are inlined. three.js and the Google Fonts stay as links.
"""
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")

html = re.sub(
    r'<link rel="stylesheet" href="((?!http)[^"]+)">',
    lambda m: "<style>\n" + (root / m.group(1)).read_text(encoding="utf-8") + "\n</style>",
    html,
)
html = re.sub(
    r'<script src="((?!http)[^"]+)"></script>',
    lambda m: "<script>\n" + (root / m.group(1)).read_text(encoding="utf-8") + "\n</script>",
    html,
)

out_dir = root / "dist"
out_dir.mkdir(exist_ok=True)

if "--fragment" in sys.argv:
    title = re.search(r"<title>.*?</title>", html, re.S).group(0)
    fonts = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2[^"]*">', html).group(0)
    styles = "\n".join(re.findall(r"<style>.*?</style>", html, re.S))
    body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
    target = out_dir / "portfolio-fragment.html"
    target.write_text("\n".join([title, fonts, styles, body]), encoding="utf-8")
else:
    target = out_dir / "portfolio.html"
    target.write_text(html, encoding="utf-8")

print("wrote", target, target.stat().st_size, "bytes")
