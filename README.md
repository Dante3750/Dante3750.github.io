# 3D portfolio

A scroll-driven 3D portfolio built with plain HTML, CSS, JavaScript and [three.js](https://threejs.org). Every section has its own 3D scene drawn from the work it describes: an AR/VR headset for the Meta work, phones for the Android and streaming work, a blockchain ring, a globe for training, app tiles, an open book and more.

There is no framework. All the words, colours and scene choices live in plain files in `content/`, and a free browser dashboard at `/admin` edits them, so you can change the site without touching any 3D code. Every change is a git commit.

## Guides

| Guide | What is in it |
| --- | --- |
| [docs/DASHBOARD.md](docs/DASHBOARD.md) | Set up the free `/admin` dashboard and visitor counter |
| [docs/UPDATING.md](docs/UPDATING.md) | Add jobs, projects, testimonials, sections and new 3D scenes |
| [docs/HOSTING.md](docs/HOSTING.md) | Choose a host and a domain, connect them, set up email, get found |
| [docs/GETTING-WORK.md](docs/GETTING-WORK.md) | Use the site to win freelance, part-time and full-time work |

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

It needs internet access for three.js and the Google Fonts.

## What you can change (in `content/`, or in the dashboard)

| Part | What it does |
| --- | --- |
| `theme` | The five colours used by the page and by every 3D scene |
| `profile` | Name, email, links, resume, booking link, availability pill, contact facts |
| `sections` | One entry per scroll station, in order. Add, remove or reorder them and the camera path follows. |
| `timeline` | The jobs list. It also drives the nodes on the 3D helix. |
| `skills`, `sphere` | The skills list and the words in the 3D sphere |
| `services` | The "Work with me" cards |
| `content/posts/*.md` | Your blog posts (Markdown). Shown on `blog.html`, in Notes and in the RSS feed |
| `projects`, `testimonials` | Empty at first. Each section appears as soon as you add an entry. |

### Scenes

| `scene` | What you see |
| --- | --- |
| `phone` | Android phone with a live logcat screen and orbit rings |
| `headset` | AR/VR headset, controllers, HUD panels, BLE pulses and a backdrop of device models |
| `sync` | Two phones kept in sync by a shared waveform |
| `chain` | Ring of linked blockchain blocks |
| `agentapp` | Insurance app phone, shield and policy documents |
| `globe` | Globe with learner markers |
| `apps` | Four app tiles |
| `book` | Open book with rising letters |
| `helix` | Career helix, one node per `timeline` entry |
| `sphere` | Skills sphere |
| `toolbox` | Rotating cube lattice |
| `knot` | Particle knot |
| `feed` | Floating post cards for the Notes section |

## Before you publish

- The `globe` markers other than the first are placeholders. Set them to where your learners actually joined from, or remove them.
- Fill in `profile.links`, and optionally `resumeUrl` and `bookingUrl`. Empty values are hidden.
- `phone` is empty so your number stays off a public site.
- The availability pill says you are open to work. Change or hide it in `profile.availability`.
- The text on the phone screens (log lines, counters) is decoration, not live data.

## Publish on GitHub Pages

1. Create a repository on GitHub and push this folder to the `main` branch.
2. Open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` now deploys the site. The workflow also writes your text into `index.html` so search engines can read it.

See [docs/HOSTING.md](docs/HOSTING.md) for a custom domain.

## Other features

- **Blog and RSS:** `blog.html` lists and shows posts. The deploy step builds a static page for each post, `feed.xml` and `sitemap.xml`.
- **Blender models:** the phone, headset and controller are real glTF models made by `blender/build_assets.py`, with a code-built fallback.
- **Cinematic 3D:** bloom, a studio reflection map, a light film grade and drifting dust. It switches itself off on slow devices.
- **Lite mode:** the footer link turns the 3D off for slow machines. It also switches on for visitors who ask their browser to save data.
- **No WebGL:** the text stays fully readable.
- **Reduced motion:** the animation stops for visitors who ask for it.
- **Single-file build:** `python3 tools/build-single.py` writes `dist/portfolio.html` for hosts that take one file.

## Files

```
index.html             page shell, meta tags
css/styles.css         layout and typography
content/                your content: profile.json, sections.json, lists.json, posts/*.md (edit these, or use /admin)
js/content.js, posts.js generated from content/ by tools/build-data.js (do not edit)
admin/                 free content dashboard (Sveltia CMS)
blender/build_assets.py  builds models/*.glb and images/*.png with Blender
models/, images/       3D models and rendered images
blog.html              blog list and post pages
js/helpers.js          shared 3D helpers and phone-screen painters
js/scenes.js           the 3D scenes
js/app.js              renders the page and flies the camera
tools/prerender.js     writes your text into index.html for search engines (run by the workflow)
tools/build-single.py  optional single-file bundler
docs/                  guides
```
