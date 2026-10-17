# The free content dashboard

Open `https://your-site/admin/` to edit your site in a form, with no code. It is [Sveltia CMS](https://github.com/sveltia/sveltia-cms), free and open source. It has no server: it reads and writes the files in `content/` in your GitHub repository, so every save is a git commit. You can undo any change from the repository history, and the site redeploys by itself about a minute after you save.

## What you can edit there

| Menu | What it changes |
| --- | --- |
| Blog posts | Add, edit, schedule (set the date) or hide (tick Draft) a post. Write in a Markdown editor with a preview. |
| Site content → Profile, links and colours | Name, email, links, resume, booking link, availability badge, colours, visitor counter code |
| Site content → Sections | The scroll stations: titles, text, numbers, buttons, 3D scene, order |
| Site content → Services, projects, testimonials, timeline, skills | The lists. The Projects and Testimonials sections appear as soon as there is one entry. |

Images you upload go to `images/uploads/`.

## One-time setup (about 5 minutes)

1. Put the project in a GitHub repository (see the README).
2. Open `admin/config.yml` and change `repo:` to `your-username/your-repo`. Change both `site_url` lines to your real address once you have a domain. Commit.
3. Create a GitHub token: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token. Choose only your portfolio repository and give it **Contents: Read and write**. Copy it.
4. Go to `/admin/`, choose **Sign in with token**, paste it once. The browser remembers it. Treat the token like a password, and never put it in the repository.

If you later prefer a normal sign-in button, Sveltia also supports GitHub OAuth through a small free proxy. See the Sveltia CMS docs.

## Editing without the dashboard

The dashboard only writes the files below, so you can edit them by hand too (press `.` on the GitHub repository page):

```
content/profile.json     theme and profile
content/sections.json    the scroll stations
content/lists.json       services, projects, testimonials, timeline, skills, sphere
content/posts/*.md       one file per blog post
```

The deploy step turns them into `js/content.js` and `js/posts.js` (run `node tools/build-data.js` yourself if you open the site locally after editing; it needs `npm install js-yaml`). The two generated files are committed so the site also works without a build.

## Know who visits (free)

[GoatCounter](https://www.goatcounter.com) is a free, cookie-free visitor counter for personal sites, with its own dashboard (page views, countries, referrers, devices).

1. Sign up and pick a code, for example `himanshu`. Your stats live at `himanshu.goatcounter.com`.
2. In the dashboard open Profile and paste `himanshu` into **Visitor counter code**. Save.

Their free plan is for non-commercial use. If your site mostly advertises paid freelance work, read their terms or use Cloudflare Web Analytics (free, needs the site on Cloudflare) instead.

## Limits to know

- Only people with write access to your repository, plus the token, can change the site.
- The dashboard cannot edit the 3D scene code. For that, see `docs/UPDATING.md`.
- I could not log in to a live GitHub repository from my workspace, so the dashboard form layout is checked against the Sveltia docs but not clicked through. If a field misbehaves, edit the JSON file directly and tell me what you saw.
