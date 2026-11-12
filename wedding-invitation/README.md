# Wedding Invitation Website

Mobile-first animated wedding invitation: opening-door video → hero → families →
scratch-to-reveal date + countdown → event cards → closing-door video → Thank You.
Plain HTML / CSS / JavaScript — **no build step, no installs, no database.**

```
wedding-invitation/
├── index.html            the website (+ WhatsApp link-preview tags)
├── visual-editor.html    ★ OFFLINE EDITOR — double-click to edit everything visually
├── 404.html, .nojekyll, .htaccess
├── css/style.css
├── js/
│   ├── config.js         ★ all your content (the editor writes this file)
│   ├── defaults.js       fallback settings (do not edit)
│   ├── fonts.js          font catalogue (do not edit)
│   ├── app.js            behaviour
│   └── backup/           automatic copies of older config.js (created by the editor)
└── assets/
    ├── images/           backgrounds, event art, monogram, icons, og-image.jpg
    ├── video/            intro.mp4, closing-door.mp4 (+ cover pictures)
    ├── audio/            background.mp3
    └── fonts/            your own font files (only if you add any)
```

---

## 1. Editing with the Visual Editor (no coding)

1. **Open `visual-editor.html`** by double-clicking it (use **Chrome or Edge**).
2. Click **“Connect site folder”** and choose the folder that contains `index.html`.
   (Needed once each time you open the editor. It lets the editor save the file and copy
   pictures/videos into `assets/` for you.)
3. Edit on the six tabs — the phone on the right updates live:

| Tab | What you can do |
|---|---|
| **1. Pages & Events** | Re-order pages (↑ ↓), hide/show pages, **add your own picture, video or photo-gallery pages**, delete them. Re-order, hide, delete or **add event cards** (Haldi, Sangeet…) and edit every detail. |
| **2. Couple & Family** | Names, parents, grandparents, siblings, blessing text, Thank-You text, RSVP (accept + optional decline button). |
| **3. Date & Calendar** | Countdown date, scratch-card sensitivity, the **Google Calendar button**, per-event calendar buttons. |
| **4. Effects & Media** | Falling petals (7 kinds), **text animations** (16 styles, speed & delay), confetti designer, music, door videos, “Scroll Down” button. |
| **5. Text Editor** | **Click any text in the preview** → change its words, **font, size, colour, weight, italic, capitals, spacing, shadow, rotation, position** and its own animation. **Drag texts** to move them. Hide (delete) any text and bring it back. **Add new texts / buttons** on any page or event card. |
| **6. Buttons & Extras** | **Every button** (Get Directions, Add to Calendar, Google Calendar, RSVP, Scroll Down, Tap to Open, music): text, width, size, font, colours, hover colours, border, roundness, padding, shadow, icon, hide. Plus **personal guest links**, theme colours, your own font files. |

4. Click **“Save to js/config.js”**. Done — upload the folder (see section 3).

If you are not on Chrome/Edge (or don’t connect the folder): click **Download config.js**
and put the downloaded file into the `js` folder, replacing the old one. For pictures/videos,
copy the files into `assets/images` / `assets/video` yourself, then type or “Browse…” the name.

> **Keep `visual-editor.html` on your own computer** — don’t upload it to the public website
> (it is only an editing tool). Upload everything else.

Other editor buttons: **Reload with intro** (see the door video), **Replay animations**,
**Test confetti**, **Play closing door**, **Open a config.js…** (load a saved file),
**Hide ✕** (give the preview more room).

### Quick tour of the new tools
* **Click-to-edit** (pink button above the preview): ON = click a text or button in the preview to edit it
  and drag texts to move them; OFF = use the preview like a guest (scratch the card, open links).
* **Undo / Redo** buttons above the preview (or Ctrl+Z / Ctrl+Y). Every save with the folder connected
  keeps the previous `config.js` in `js/backup/`.
* **Fonts** — the font menu lists ~50 wedding-friendly fonts (script, serif, sans, Hindi/Gujarati/Urdu…) and
  accepts **any Google Font by name** (“Other Google font…”) or your own font file (tab 6). Fonts load only
  when a text uses them.
* **Your own buttons** — tab 5 → “+ Add button”. The link can be a web address, `tel:+91…` (call),
  `https://wa.me/91…` (WhatsApp), `mailto:…`, or the word `share` (opens the phone’s share sheet).
* **Personal invitations** — tab 6 → “Personal invitation for each guest”: paste names, click “Make links”, then
  copy each link or open WhatsApp with the message ready. The first page greets “Dear <name>”, and the RSVP
  message can use `{guest}`.
* **Photo gallery** — tab 1 → “+ Add photo gallery”: a swipeable slider with optional captions and auto-slide.
* **Theme colours** — tab 6 → change burgundy / rose / button / green / gold / page colour for the whole site.

## 2. What the pages do

* **Scroll Down cue** — a button on the first screen tells guests to scroll (disappears once they do).
* **Scratch card** — a light swipe (about 5% of the foil, or 3 touches) reveals the date, fires
  confetti and starts the countdown. Adjust in tab 3.
* **Google Calendar button** — sits above the Events Schedule; opens Google Calendar with title,
  date/time, venue and a note (with all events listed) pre-filled. Untick “Show this button” to hide.
* **Closing page** — plays a door-closing video when scrolled into view; its last frame fades
  out and “Thank You / With love & blessings / family names” fade in. Untick the page in tab 1 to
  remove it, or empty the video box to keep only the Thank You.
* **Own pages** — add JPG/PNG pages or MP4 pages anywhere in the order. Videos play when scrolled
  into view and pause when scrolled away.
* **Event cards** — text is live on top of artwork. If your artwork already contains its own text,
  untick “Show the text on the card”.

## 3. Put it online

All paths are relative: it works at a domain root **and** inside a folder
(`https://username.github.io/my-repo/`).

**A. Normal hosting / cPanel** — upload the folder contents (without `visual-editor.html`) to
`public_html`.

**B. GitHub Pages** — upload the files to a repository (keep `.nojekyll`), then
*Settings → Pages → Deploy from a branch → main / (root)*. For a custom domain follow GitHub’s
“Managing a custom domain for GitHub Pages” guide; tick *Enforce HTTPS*.

**C. Netlify / Cloudflare Pages / Vercel** — drag-and-drop the folder; no build command.

### Link preview (WhatsApp / Facebook)
These read `index.html` directly (they don’t run JavaScript). Replace
**`https://YOUR-DOMAIN.com`** in the `canonical`, `og:url`, `og:image`, `twitter:image` lines:

```bash
sed -i 's#https://YOUR-DOMAIN.com#https://invite.example.com#g' index.html
```
Edit the `<title>` / `description` / `og:` text if names or dates change. To change the preview
picture, replace `assets/images/og-image.jpg` (1200 × 630). WhatsApp caches previews — test a
changed link with `?v=2` on the end.

## 4. Editing `config.js` by hand (optional)
The file is plain text. Every option is explained in `js/config.js`. Anything left out falls back
to `js/defaults.js`. Note: saving from the editor rewrites the file in a tidier machine-written
style (comments are replaced by a short header) — all settings are kept.

## 5. Before you publish
* **Rights to the media** — illustrations, intro video, monogram and the music track come from
  the original invitation: make sure you may reuse them, or replace them.
  `closing-door.mp4` was made by reversing the opening-door video, so it also shows the original monogram.
* **Monogram** appears inside both door videos and in `monogram.png` — replace if initials change.
* **Fonts** load from Google Fonts (guests need internet; otherwise system fonts are used).
* **Sound** only starts after a tap (browser rule) — hence “Tap to Open”.
* Test on a real phone (WhatsApp in-app browser, Safari, Chrome) before sharing.

## 6. Replacing images
| File | Size | Used for |
|---|---|---|
| `hero-bg.jpg` | 1080 × 1920 | first screen (keep the top ~70% calm — text sits there) |
| `family-bg.jpg` | 1080 × 1920 | families, Thank-You background, desktop backdrop |
| `event-*.jpg` | 1080 × 1920 | event cards |
| `monogram.png` | 512 × 512, transparent | between the two names |
| `scratch-card.png` | ~820 × 437, transparent corners | scratch foil |
| `og-image.jpg` | 1200 × 630 | link preview |
| `intro.mp4` / `closing-door.mp4` | 720 × 1280 (9:16) | door videos |
