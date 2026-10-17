# Updating your portfolio

All your words, jobs, links and blog posts live in plain files in the `content/` folder. You never need to touch the 3D code to update them.

**Easiest:** use the free dashboard at `/admin/` on your site (setup in [DASHBOARD.md](DASHBOARD.md)). It edits these files for you and saves each change to git.

**By hand:** open your repository on GitHub and press the `.` key for an in-browser editor. Edit a file, commit, and the site redeploys in about a minute.

| File | Holds |
| --- | --- |
| `content/profile.json` | `theme` (colours) and `profile` (name, email, links, resume, booking, availability, siteUrl, goatcounter) |
| `content/sections.json` | `sections`: the scroll stations, each with a 3D scene |
| `content/lists.json` | `services`, `projects`, `testimonials`, `timeline`, `skills`, `sphere` |
| `content/posts/*.md` | One Markdown file per blog post |

`js/content.js` and `js/posts.js` are generated from these files by `tools/build-data.js`. Do not edit those two by hand.

## Common changes

### New job
1. Add an entry at the top of `timeline` (newest first). The 3D helix grows a node automatically.
2. Optional: give it its own 3D section. Copy an entry in `sections`, set `id`, pick a `scene`, and write the copy.

### New project (the Projects section appears by itself)
Add an object to `projects` in `content/lists.json`:

```json
"projects": [
  { "title": "Compose offline notes", "role": "Personal project",
    "text": "One sentence on what it does and what was hard.",
    "tags": ["Kotlin", "Compose", "Room"],
    "links": [{ "label": "Code", "href": "https://github.com/you/repo" },
              { "label": "Demo video", "href": "https://youtu.be/..." }] }
]
```

### New testimonial (the section appears by itself)
Use real quotes, with the person's permission.

```json
"testimonials": [
  { "quote": "What they said.", "name": "Their name", "role": "Role, company" }
]
```

### Skills
Edit `skills` for the list and `sphere.words` (all in `content/lists.json`) for the floating words. Put the ones you want in amber into `sphere.hot`.

### Links, resume and booking
In `profile` (`content/profile.json`): `links` (LinkedIn, GitHub, Upwork and more), `resumeUrl`, `bookingUrl`. Empty values stay hidden. To add a resume PDF, put it in an `assets/` folder and set `resumeUrl: 'assets/your-resume.pdf'`. Remember the PDF is public, so leave your phone number off it if you want it private.

### Availability pill
`profile.availability` in `content/profile.json`. Set `show: false` when you are fully booked, or change the text.

### Colours
Edit `theme` in `content/profile.json`. The page and every 3D scene follow it.

## Add, remove or reorder sections

`sections` is an ordered list. The scroll order, the top bar links, the side dots and the camera path all follow it. To hide a section, delete it. Sections of type projects, testimonials and posts hide themselves while their list is empty.

| Field | Meaning |
| --- | --- |
| `id` | Unique, used for the link `#id` |
| `nav` | Label in the top bar. Leave it out to keep the section out of the bar. |
| `scene` | Which 3D scene: phone, headset, sync, chain, agentapp, globe, apps, book, helix, sphere, toolbox, knot, feed |
| `side` | `'l'` or `'r'` for the text column. Defaults to alternating. |
| `eyebrow`, `title`, `lede` | Small label, heading, intro line |
| `body`, `more`, `notes` | Paragraphs before stats, after stats, small print |
| `stats` | `[{ value: '12% → 4%', label: 'crash rate' }]` |
| `tags`, `cta`, `mono` | Tag chips, buttons, small grey line |
| `sceneOptions` | Options for that scene as JSON text, for example `{"labels": ["Ethereum", "NFT"]}` for the blockchain ring |

## Make a new 3D scene

Add a function to `js/scenes.js`. It receives an empty group to fill and returns an update function:

```js
PF.scenes.rocket = function (group, options, extra) {
  var body = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.6, 24),
    new THREE.MeshStandardMaterial({ color: PF.col.amber })
  );
  group.add(body);
  return function update(time, dt, redrawScreens) {
    body.rotation.y = time * 0.6;
    body.position.y = Math.sin(time) * 0.1;
  };
};
```

Then use `scene: 'rocket'` in a section. Colours are in `PF.col` (numbers for 3D) and `PF.theme` (strings for canvas drawing). If a scene throws, the rest of the site still works and the error appears in the browser console.

## Check your change

- Open the site and look at the section. Press F12 and check the Console for red errors.
- On a phone-sized window the 3D shrinks to the top and the text sits below. Check it there too.
- Footer link **Lite mode** turns the 3D off for people on slow machines. Make sure the text still reads well with it on.

## Ask Claude to do it

Paste your new resume or job details and ask: "Update the content files with this: add the new job to the timeline and the Android section." Claude edits `content/*.json`, and you commit the result.

## Post on the blog (monthly updates)

Easiest: dashboard → Blog posts → New. Or add a file `content/posts/2026-10-monthly-update.md`:

```markdown
---
title: "October 2026: what I shipped"
date: 2026-10-31
summary: "One or two sentences."
tags:
  - Monthly update
draft: false
---
## What I worked on
- First thing
- Second thing
```

After a minute the post is on `blog.html`, in the Notes section of the home page (latest three) and in `feed.xml`. Write in simple Markdown: `## Heading`, `**bold**`, `[link](https://...)`, `- bullets`, `> quote`, images with `![caption](images/uploads/photo.png)` and code blocks with three backticks.

`draft: true` hides a post until you are ready. Change `limit` on the `notes` section in `content/sections.json` to show more or fewer posts on the home page.

Idea for a monthly routine: on the last day of the month, write five lines (shipped, broke, learned, next, a link) and post it. It takes ten minutes and keeps your profile fresh for search and for recruiters.

## Rebuild the Blender models and images

`blender/build_assets.py` creates `models/*.glb` (phone, headset, controller) and `images/og.png` (link preview) and `images/hero-lite.png` (shown when 3D is off). Run `pip install bpy` then `python3 blender/build_assets.py`, edit the colours or shapes at the top of the script, and commit the new files. The site falls back to code-built shapes if a model cannot load.

## Daily reading list and resume page

- **Daily reading** (`daily.html` and the "Daily" section on the home page): a GitHub Actions job runs every morning (about 06:00 IST), reads the feeds in `content/feed-sources.json` and rebuilds the site. Only headlines and links are kept; each link opens the original article. To change what shows up, edit the `sources` list there (any RSS or Atom address works). To follow your own Medium posts, set `links.medium` in `content/profile.json` to `https://medium.com/@yourname`. Run it now from the repo's **Actions** tab, **Deploy to GitHub Pages**, **Run workflow**. If every feed fails, the last saved list stays.
- **Resume** (`resume.html`): built from your profile, jobs and skills. Open it and press **Print or save as PDF**. It is plain text, so applicant-tracking systems can read it. The **Resume** button on the home page opens it unless you set `resumeUrl`.
- **Quick jump**: press Ctrl+K (or `/`) on the home page.
