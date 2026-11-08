# Wedding Invitation Website — Ready for Custom Domain & GitHub Pages

This folder contains the complete, self-contained recreation of `https://parvez-palak.theinvitationmedia.in/`, cleaned of third-party tracking scripts (`_flock.js` and `__l5e/`) and structured so you can easily modify any text, names, dates, venues, or media files and deploy directly to **GitHub Pages**, **Netlify**, **Vercel**, or any **custom domain / cPanel hosting**.

---

## Directory Structure

```text
wedding-invitation-site/
├── index.html                  # Main entry page (clean HTML5, OpenGraph & Google Fonts)
├── logo.png                    # Favicon & social preview monogram
├── js/
│   ├── config.js               # EDIT THIS FILE to change names, family tree, dates, links & assets
│   └── app.js                  # Interactive application logic (video intro, audio, petals, scratch card, countdown)
├── css/
│   └── styles.css              # Complete theme variables, typography, animations & layout styles
├── assets/
│   ├── intro.mp4               # Tap-to-open intro video
│   ├── hero-invitation.png     # Section 1: Hero wedding invitation illustration
│   ├── family.png              # Section 2: Watercolor beach & palm backdrop for family tree
│   ├── logo.png                # Center couple monogram logo
│   ├── scratch-card.png        # Section 3: Gold foil "Scratch to Reveal" overlay
│   ├── event-1-haldi.jpg       # Section 4: Event 1 card (Haldi)
│   ├── event-2-sangeet.jpg     # Section 4: Event 2 card (Sangeet)
│   └── event-3-reception.jpg   # Section 4: Event 3 card (Reception)
├── audio/
│   └── background.mp3          # Background music track (loops at 45% volume with floating mute toggle)
└── react-source/               # Reconstructed React + TypeScript components if using a Vite build workflow
```

---

## How to Customize for Your New Domain

### 1. Change Couple Names, Family Members, Wedding Date & Google Maps Links
Open **`js/config.js`** in any text editor (VS Code, Notepad, or directly on GitHub):
- **`meta`**: Change the browser tab title and social sharing description.
- **`familyIntro.groomSide` & `familyIntro.brideSide`**: Edit `name`, `dadajiDadijiNames`, `nanajiNanijiNames`, `fatherName`, `motherName`, and `siblingName`.
- **`scratchAndCountdown`**:
  - `weddingDateDisplay`: Text revealed under the gold scratch card (e.g., `"21st November 2026"`).
  - `countdownTargetISO`: ISO timestamp for the live countdown timer (e.g., `"2026-11-21T15:00:00+05:30"`).
- **`eventsSection.events`**: Add, remove, or reorder event cards and update each `directionsUrl` with your venue's Google Maps share link.

### 2. Replace Images, Video, or Music
Replace the corresponding file in `assets/` or `audio/` using the same filename, or place your new file in `assets/` and update its path in `js/config.js`.

---

## How to Deploy

### Option A: Upload to GitHub Pages
1. Create a new repository on GitHub and upload all files and folders inside `wedding-invitation-site/` to the root of your repository.
2. Go to **Settings → Pages** in your GitHub repository.
3. Under **Build and deployment**, select **Deploy from a branch**, choose `main` (and `/ (root)`), and click **Save**.
4. To connect your custom domain, enter your domain name under **Custom domain** in **Settings → Pages** and point your domain's DNS (`CNAME` or `A` records) to GitHub Pages.
*(Note: Unlike the original compiled bundle which hardcoded `/audio/background.mp3` and broke on GitHub project subfolders, this version uses relative paths so audio and assets work on both `username.github.io/repo-name/` and custom root domains.)*

### Option B: Upload to Any Custom Domain (cPanel / Hostinger / GoDaddy / Netlify / Vercel)
- **Netlify / Vercel**: Drag and drop this entire folder into [Netlify Drop](https://app.netlify.com/drop) or connect your GitHub repository with no build command required (Publish directory: `.`).
- **cPanel / FTP**: Upload the contents of this folder directly into your `public_html/` directory.
