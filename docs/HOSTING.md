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

- Your own name is the strongest choice, because people search it. Try `himanshuupadhyay.dev`, `himanshuupadhyay.in`, `hupadhyay.dev`, or a role name such as `himanshu-android.dev`.
- `.dev` and `.in` suit an engineer in India. `.com` is the most recognised. Avoid long, hyphenated names.
- Buy it from a registrar that sells at cost and does not push extras, such as Cloudflare Registrar, Porkbun or Namecheap. Turn on auto-renew, because losing a portfolio domain is painful.
- Keep the same name on GitHub, LinkedIn and your email so everything connects.

## 3. Connect the domain to GitHub Pages

1. In the repository open **Settings → Pages** and enter your domain under **Custom domain**.
2. At your registrar's DNS settings, add the records that page tells you to add. GitHub's current list is in its docs under "Managing a custom domain for your GitHub Pages site". Usually that means a few `A` records for the bare domain and a `CNAME` for `www` that points to `<your-username>.github.io`.
3. Wait for DNS to update (minutes to a few hours), then tick **Enforce HTTPS**.

## 4. Get a professional email address

Forwarding `hello@yourdomain` to your Gmail looks far better to clients than a generic address. Cloudflare Email Routing does this free if your DNS is on Cloudflare. Then set `profile.email` in `content.js` to the new address.

## 5. Make it findable

1. Add the live address to your LinkedIn profile, GitHub profile, resume header and email signature.
2. Fill `profile.links` in `content.js` so the structured data lists your other profiles.
3. Add the site to **Google Search Console** and request indexing of the home page.
4. The deploy workflow already writes your text into the HTML, so search engines can read it without running the 3D.
5. Optional: add a 1200 by 630 image and an `og:image` meta tag in `index.html` so links look good when shared on LinkedIn and WhatsApp.

## 6. Know who visits

Free, privacy-friendly options: Cloudflare Web Analytics, GoatCounter. Paid: Plausible. Each is one small script tag in `index.html`.

## 7. Optional: a contact form

The page uses an email button, which is fine. If you want a form, services such as Formspree or Web3Forms give you a form endpoint on a free tier. Watch for spam and add their anti-spam option.


## After you buy a domain

Set `profile.siteUrl` in `js/content.js` to your address (for example `https://himanshuupadhyay.dev`). The deploy step then writes the correct links into `feed.xml` and `sitemap.xml`. Submit `sitemap.xml` in Google Search Console.
