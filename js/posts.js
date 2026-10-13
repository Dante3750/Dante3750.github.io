/* ==========================================================================
   YOUR BLOG. Add a post = copy one block below, paste it at the TOP of the list, edit, commit.
   The site redeploys and the post shows up on blog.html, in the "Notes" section of the home page
   and in feed.xml (RSS). Nothing else to touch.

   Fields
     slug      short web address, lowercase with dashes, unique   (blog.html#/my-slug)
     date      YYYY-MM-DD
     title     headline
     summary   one or two sentences; shown in lists and link previews
     tags      ['Android', 'WebRTC'] (used for the filter on blog.html)
     draft     true hides the post everywhere until you remove the line
     body      the article, written in simple Markdown (see the sample below):
                 ## Heading      ### Smaller heading
                 **bold**  *italic*  `code`  [link text](https://...)
                 - bullet        1. numbered        > quote        ---  (rule)
                 ![caption](https://image-url)       ```kotlin  ...code...  ```

   Template to copy:
   {
     slug: 'october-2026-update',
     date: '2026-10-31',
     title: 'October 2026: what I shipped',
     summary: 'One or two sentences.',
     tags: ['Monthly update'],
     body: `
   ## What I worked on
   - First thing
   - Second thing

   ## What I learned
   A short paragraph.
   `
   },
   ========================================================================== */
window.POSTS = [
  {
    slug: 'welcome',
    date: '2026-10-14',
    title: 'Welcome: a monthly log of what I build',
    summary: 'Why this blog exists, what I will post each month, and how this 3D site is put together.',
    tags: ['Monthly update', 'Meta'],
    body: `
Once a month I will post here: what I shipped, what broke, and what I learned. It is part public notebook and part proof that the work keeps moving.

## What you can expect

- **Monthly update.** Three or four lines on what I worked on.
- **Deep dives.** One topic at a time, such as BLE pairing on Android, WebRTC sync, or moving a screen to Compose.
- **Open demos.** Small apps I can share in full, with code.

## How this site works

The whole portfolio is plain HTML, CSS and JavaScript with three.js for the 3D. Every word on it comes from one file, so adding a job, a project or a post is a copy-and-paste edit. A GitHub workflow publishes it on every change.

> Confidential client work stays confidential. Posts here describe approaches and lessons, never client code or numbers I am not allowed to share.

## Get new posts

Use the RSS link at the top of the blog, or email me and I will say hello back.
`
  }
];
