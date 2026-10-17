# Hosting and domain

This site is static files, so hosting is free or close to it. Prices and free-tier limits change, so check each provider's page before you commit.

## 1. Pick the host

| Host | Why pick it | Watch out for |
| --- | --- | --- |
| **GitHub Pages** | Already set up in this repo. Free, custom domain and HTTPS. | Public repo on a free account. |
| **Cloudflare Pages** | Fast worldwide CDN, free, a preview link for every branch, free web analytics. Pairs well with Cloudflare for the domain. | Needs a Cloudflare account. |
| **Netlify** | Simple drag-and-drop or Git deploys, built-in form handling. | Free-tier build limits. |
| **Vercel** | Easy Git deploys. | The free Hobby plan is for non-commercial use, so check the terms before using it for a freelance business site. |

A good default: **GitHub Pages now, move to Cloudflare Pages if you want previews and analytics.** Moving later is easy because the site is plain files.

## 2. Pick the domain

**`himanshu.dev` is already taken** (it serves another person's portfolio), so it is not an option. Check these in the registrar's search box; I could not confirm which are free:

| Idea | Why |
| --- | --- |
| `himanshuupadhyay.dev` | Full name, `.dev` signals engineer. First choice. |
| `himanshuu.dev` | Short, matches your email handle. |
| `hupadhyay.dev` | Short and professional. |
| `himanshu-upadhyay.dev` | Fallback if the one without a hyphen is taken. |
| `himanshuupadhyay.in` | Cheap, and suits an India-based freelancer. |
| `himanshu.codes`, `himanshu.me` | Short alternatives. |

**Cheapest ways to get it** (Porkbun's price comparison, 15 Oct 2026, `.dev`, with WHOIS privacy):

| Registrar | First year | Renewal |
| --- | --- | --- |
| Cloudflare Registrar | about $8.20 | about $12.20 |
| Porkbun | about $8.75 | about $12.87 |
| Namecheap | about $11.18 | about $21.18 |

Cloudflare sells at cost and is cheapest over time, and it also gives free DNS, free email forwarding and free analytics. Avoid registrars with a cheap first year and a high renewal. Turn on auto-renew, because losing a portfolio domain is painful. `.dev` domains require HTTPS, which GitHub Pages and Cloudflare Pages provide.

**Free option:** a subdomain such as `himanshuupadhyay.is-a.dev` from the is-a.dev project. You request it with a pull request on their GitHub repository and point it at your site. It looked unregistered when I checked, but confirm on their site. The free fallback with no setup is `your-username.github.io`.

Keep the same name on GitHub, LinkedIn and your email so everything connects.

## 3. Connect the domain to GitHub Pages

1. In the repository open **Settings → Pages** and enter your domain under **Custom domain**.
2. At your registrar's DNS settings, add the records that page tells you to add. GitHub's current list is in its docs under "Managing a custom domain for your GitHub Pages site". Usually that means a few `A` records for the bare domain and a `CNAME` for `www` that points to `<your-username>.github.io`.
3. Wait for DNS to update (minutes to a few hours), then tick **Enforce HTTPS**.

## 4. Get a professional email address

Forwarding `hello@yourdomain` to your Gmail looks far better to clients than a generic address. Cloudflare Email Routing does this free if your DNS is on Cloudflare. Then set `profile.email` (dashboard → Profile) to the new address.

## 5. Make it findable

1. Add the live address to your LinkedIn profile, GitHub profile, resume header and email signature.
2. Fill `profile.links` (dashboard → Profile) so the structured data lists your other profiles.
3. Add the site to **Google Search Console** and request indexing of the home page.
4. The deploy workflow already writes your text into the HTML, so search engines can read it without running the 3D.
5. The link-preview image (`images/og.png`, rendered in Blender) is already wired in. It shows once `siteUrl` is set.

## 6. Know who visits

Free, privacy-friendly: GoatCounter (built in: put your code in dashboard → Profile → Visitor counter code, see DASHBOARD.md) or Cloudflare Web Analytics. Paid: Plausible.

## 7. Optional: a contact form

The page uses an email button, which is fine. If you want a form, services such as Formspree or Web3Forms give you a form endpoint on a free tier. Watch for spam and add their anti-spam option.


## After you buy a domain

Set `siteUrl` in the dashboard (Profile) or in `content/profile.json` to your address (for example `https://himanshuupadhyay.dev`). The deploy step then writes the correct links into `feed.xml` and `sitemap.xml`. Submit `sitemap.xml` in Google Search Console. Also create a file named `CNAME` in the repository root containing just your domain (for example `himanshuupadhyay.dev`) so GitHub Pages keeps the custom domain on every deploy.
