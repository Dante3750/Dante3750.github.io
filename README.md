# 3D portfolio

A scroll-driven 3D portfolio built with plain HTML, CSS, JavaScript and [three.js](https://threejs.org). Every section has its own 3D scene drawn from the work it describes: an AR/VR headset for the Meta work, phones for the Android and streaming work, a blockchain ring, a globe for training, app tiles, an open book and more.

There is no build step and no framework. All the words, colours and scene choices live in one file, so you can change the site without touching any 3D code.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

It needs internet access for three.js and the Google Fonts.

## Edit your content

Open `js/content.js`. That file controls everything on the page.

| Part | What it does |
| --- | --- |
| `theme` | The five colours used by the page and by every 3D scene. |
| `profile` | Name, role, email, phone, LinkedIn and GitHub links. Empty values are hidden. |
| `sections` | One entry per scroll station, in order. Add, remove or reorder them and the camera path updates itself. |
| `timeline` | The jobs list. It also drives the nodes on the 3D helix. |
| `skills` | The grouped skills list. |
| `sphere` | The words floating in the 3D skills sphere, and which ones are highlighted. |

### Add a section

Copy any entry in `sections`, give it a unique `id` and pick a scene:

```js
{
  id: 'new-job',
  nav: 'New job',               // optional label in the top bar
  scene: 'headset',             // which 3D scene to show
  eyebrow: '2026 · Company',
  title: 'What I did there',
  body: ['One paragraph.'],
  stats: [{ value: '10x', label: 'faster builds' }],
  tags: ['Kotlin']
}
```

### Scenes

| `scene` | What you see |
| --- | --- |
| `phone` | Android phone with a live logcat screen and orbit rings |
| `headset` | AR/VR headset, controllers, HUD panels, BLE pulses and a backdrop of device models |
| `sync` | Two phones kept in sync by a shared waveform |
| `chain` | Ring of linked blockchain blocks (set the block names with `sceneOptions.labels`) |
| `agentapp` | Insurance app phone, shield and policy documents |
| `globe` | Globe with learner markers (set `sceneOptions.markers` to `[latitude, longitude]` pairs) |
| `apps` | Four app tiles (set `sceneOptions.apps`) |
| `book` | Open book with rising letters |
| `helix` | Career helix, one node per `timeline` entry |
| `sphere` | Skills sphere |
| `knot` | Particle knot |

To make a new scene, add a function to `js/scenes.js` named `PF.scenes.<name>` and use it in `content.js`. The comment at the top of that file explains the contract.

### Before you publish

- The `globe` markers other than the first are placeholders. Set them to where your learners actually joined from, or remove them.
- Your email is on the page. `phone` is empty by default so your number stays off a public site.
- Paste your LinkedIn and GitHub URLs into `profile.links`.
- The text in the phone screens (log lines, counters) is decoration, not live data.

## Publish on GitHub Pages

1. Create a new repository on GitHub and push this folder to the `main` branch.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` now deploys the site through `.github/workflows/pages.yml`. The address appears in the Actions run and under Settings → Pages.

When you have a domain, add it under Settings → Pages → Custom domain.

## Single-file build

`tools/build-single.py` bundles everything into one HTML file, which is handy for hosts that only take a single upload:

```bash
python3 tools/build-single.py        # writes dist/portfolio.html
```

## Files

```
index.html            page shell, meta tags
css/styles.css        layout and typography
js/content.js         all your content (edit this)
js/helpers.js         shared 3D helpers and phone-screen painters
js/scenes.js          the 3D scenes
js/app.js             renders the page and flies the camera
tools/build-single.py optional single-file bundler
```

The page also works without WebGL (the text stays readable) and respects the reduced-motion setting.
