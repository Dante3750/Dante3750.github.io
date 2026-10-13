# Updating your portfolio

Everything you will ever change is in **`js/content.js`**. You never need to touch the 3D code to update words, jobs, projects or links.

## The fastest way to edit

1. Open your repository on GitHub and press the `.` key. This opens a full editor in your browser.
2. Edit `js/content.js` and commit the change.
3. GitHub rebuilds and publishes the site in about a minute.

You can also edit locally, preview with `python3 -m http.server 8000`, then `git push`.

## Common changes

### New job
1. Add an entry at the top of `timeline` (newest first). The 3D helix grows a node automatically.
2. Optional: give it its own 3D section. Copy an entry in `sections`, set `id`, pick a `scene`, and write the copy.

### New project (the Projects section appears by itself)
Uncomment the template above `projects: []` and fill it in:

```js
projects: [
  { title: 'Compose offline notes', role: 'Personal project',
    text: 'One sentence on what it does and what was hard.',
    tags: ['Kotlin', 'Compose', 'Room'],
    links: [{ label: 'Code', href: 'https://github.com/you/repo' },
            { label: 'Demo video', href: 'https://youtu.be/...' }] }
],
```

### New testimonial (the section appears by itself)
Use real quotes, with the person's permission.

```js
testimonials: [
  { quote: 'What they said.', name: 'Their name', role: 'Role, company' }
],
```

### Skills
Edit `skills` for the list and `sphere.words` for the floating words. Put the ones you want in amber into `sphere.hot`.

### Links, resume and booking
In `profile`: `links` (LinkedIn, GitHub, Upwork and more), `resumeUrl`, `bookingUrl`. Empty values stay hidden. To add a resume PDF, put it in an `assets/` folder and set `resumeUrl: 'assets/your-resume.pdf'`. Remember the PDF is public, so leave your phone number off it if you want it private.

### Availability pill
`profile.availability`. Set `show: false` when you are fully booked, or change the text.

### Colours
Edit `theme`. The page and every 3D scene follow it.

## Add, remove or reorder sections

`sections` is an ordered list. The scroll order, the top bar links, the side dots and the camera path all follow it. To hide a section, delete it or comment it out.

| Field | Meaning |
| --- | --- |
| `id` | Unique, used for the link `#id` |
| `nav` | Label in the top bar. Leave it out to keep the section out of the bar. |
| `scene` | Which 3D scene to show (list at the top of `content.js`) |
| `side` | `'l'` or `'r'` for the text column. Defaults to alternating. |
| `eyebrow`, `title`, `lede` | Small label, heading, intro line |
| `body`, `more`, `notes` | Paragraphs before stats, after stats, small print |
| `stats` | `[{ value: '12% → 4%', label: 'crash rate' }]` |
| `tags`, `cta`, `mono` | Tag chips, buttons, small grey line |
| `sceneOptions` | Options for that scene, for example `labels` for the blockchain ring |

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

Paste your new resume or job details and ask: "Update `content.js` with this: add the new job to the timeline and the Android section." Then paste the new file into your repository.


## Post on the blog (monthly updates)

All posts live in `js/posts.js`. To publish one:

1. Open `js/posts.js` (on GitHub press `.` to edit in the browser).
2. Copy the template from the comment at the top, paste it as the first item in `window.POSTS`, and fill in `slug`, `date`, `title`, `summary`, `tags` and `body`.
3. Commit. After about a minute the post is on `blog.html`, in the Notes section of the home page (latest three) and in `feed.xml`.

Write the `body` in simple Markdown: `## Heading`, `**bold**`, `[link](https://...)`, `- bullets`, `> quote`, images with `![caption](url)` and code blocks with three backticks. Put images in an `images/` folder and use `images/photo.png` as the URL.

Set `draft: true` on a post to keep it hidden while you write it. Change `limit` on the `notes` section in `js/content.js` to show more or fewer posts on the home page. Delete the whole `notes` section to hide the block from the home page; the blog page keeps working.

Idea for a monthly routine: on the last day of the month, write five lines (shipped, broke, learned, next, a link) and post it. It takes ten minutes and keeps your profile fresh for search and for recruiters.
