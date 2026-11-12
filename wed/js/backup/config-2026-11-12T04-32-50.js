/* =========================================================================
   YOUR INVITATION CONTENT
   ---------------------------------------------------------------------
   EASIEST WAY TO EDIT:  open  visual-editor.html  (double-click it).
   You can also edit this file by hand in any text editor.
   Anything you leave out falls back to js/defaults.js.

   Tips for hand-editing
   - Keep the quotes " " and commas , exactly as they are.
   - Use \n inside a text to start a new line.
   - enabled: false  hides a page / feature.
   ========================================================================= */

window.INVITATION = {

  meta: { title: "Parvez & Palak — Wedding Invitation · November 2026" },

  /* ---------- Guest personalisation ----------
     Send each guest their own link:  https://your-site.com/?to=Rahul%20Sharma
     and the first page greets them ("Dear Rahul Sharma"). Make links in the editor (tab 6). */
  guest: { enabled: true, param: "to", prefix: "Dear", suffix: "", fallback: "" },

  /* ---------- Theme colours (leave {} for the original colours) ----------
     burgundy, rose, plum, rust (button colour), olive (green text), gold, paper (page background) */
  theme: {},

  /* ---------- Your own font files (see editor tab 6) ---------- */
  fonts: { custom: [] },

  /* ---------- Per-text style overrides (made with the editor's "5. Text" tab) ----------
     key = text id.  Possible values: text, hidden, font, size, weight, italic, uppercase, color,
     align, letterSpacing, lineHeight, shadow, boxWidth, x, y, rotate, anim:{type,speed,delay} */
  textStyles: {},

  /* ---------- Extra texts and buttons you added on a page ---------- */
  blocks: [],

  /* ---------- Per-button style overrides (editor tab 6) ---------- */
  buttons: {},
  // NOTE: the WhatsApp/Facebook link-preview text comes from the <meta property="og:…">
  // tags in index.html (they cannot be set here). See README.md.

  /* ---------- Intro screen (door-opening video) ---------- */
  intro: {
    enabled: true,                         // false = skip the intro, open the invitation directly
    video: "assets/video/intro.mp4",
    poster: "assets/video/intro-poster.jpg",
    tapText: "Tap to Open",
    openAtSeconds: 5
  },

  music: { enabled: true, file: "assets/audio/background.mp3", volume: 0.45 },

  /* ---------- "Scroll Down" button shown on the first screen ---------- */
  scrollCue: { enabled: true, text: "Scroll Down" },

  /* ---------- Falling petals ----------
     type: "petal" | "flower" | "rose" | "sparkle" | "leaf" | "custom-emoji" | "custom-image"
     custom-emoji: put any emoji in  emoji  (several separated by spaces = mixed, e.g. "🌸 💖")
     custom-image: put a picture path in  image  (small transparent PNG), e.g. "assets/images/petal.png" */
  petals: { enabled: true, count: 32, type: "petal", emoji: "🌺", image: "", size: 1, speed: 1 },

  /* ---------- Text animations ----------
     Types: none, fade, fade-up, fade-down, slide-left, slide-right, side-in (left items from
     the left, right items from the right), zoom-in, zoom-out, flip-x, flip-y, fly-3d,
     blur-in, rotate-in, letters (letter by letter), words (word by word)
     speed: 1 = normal, 2 = twice as fast, 0.5 = half speed. delay in seconds. */
  animation: {
    enabled: true,
    speed: 1,
    stagger: 0.16,
    replay: false,
    roles: {
      heroInvocation:  { type: "fade",       speed: 1, delay: 0.2 },
      heroBlessing:    { type: "fade-up",    speed: 1, delay: 0.1 },
      heroName:        { type: "fly-3d",     speed: 1, delay: 0.2 },
      heroLine:        { type: "fade-up",    speed: 1, delay: 0 },
      heroAmp:         { type: "zoom-in",    speed: 1, delay: 0 },
      familyHead:      { type: "fade-down",  speed: 1, delay: 0 },
      familyGrand:     { type: "side-in",    speed: 1, delay: 0 },
      familyName:      { type: "side-in",    speed: 1, delay: 0.1 },
      familyMonogram:  { type: "rotate-in",  speed: 1, delay: 0.1 },
      familyParents:   { type: "side-in",    speed: 1, delay: 0 },
      familySiblings:  { type: "side-in",    speed: 1, delay: 0 },
      saveCard:        { type: "zoom-in",    speed: 1, delay: 0 },
      eventsButton:    { type: "fade-up",    speed: 1, delay: 0 },
      eventsHeading:   { type: "flip-x",     speed: 1, delay: 0 },
      eventCard:       { type: "fade-up",    speed: 1, delay: 0 },
      eventEyebrow:    { type: "fade",       speed: 1, delay: 0.1 },
      eventTitle:      { type: "zoom-in",    speed: 1, delay: 0 },
      eventTagline:    { type: "fade-up",    speed: 1, delay: 0 },
      eventDate:       { type: "flip-x",     speed: 1, delay: 0 },
      eventTime:       { type: "fade-up",    speed: 1, delay: 0 },
      eventSchedule:   { type: "fade-up",    speed: 1, delay: 0 },
      eventVenue:      { type: "fade-up",    speed: 1, delay: 0 },
      eventAttire:     { type: "zoom-in",    speed: 1, delay: 0 },
      rsvp:            { type: "fade-up",    speed: 1, delay: 0 },
      customPage:      { type: "fade",       speed: 1, delay: 0 },
      customText:      { type: "fade-up",    speed: 1, delay: 0 },
      gallery:         { type: "fade-up",    speed: 1, delay: 0 },
      closingThanks:   { type: "fly-3d",     speed: 1, delay: 0 },
      closingLine:     { type: "fade-up",    speed: 1, delay: 0 },
      closingSign:     { type: "letters",    speed: 1, delay: 0 }
    }
  },

  /* ---------- Scratch card sensitivity ---------- */
  scratch: {
    revealPercent: 5,      // lower = easier (5 means only 5% of the foil needs to be rubbed)
    swipesToReveal: 3,     // …or reveal after this many touches/swipes
    brushSize: 34,
    fadeMs: 500
  },

  /* ---------- Confetti (fires when the scratch card is revealed) ---------- */
  confetti: {
    enabled: true,
    particleCount: 120,
    colors: ["#d4a574", "#f5d199", "#c75a6b", "#7a8a6a", "#ffffff"],
    shapes: ["square", "circle"],          // square | circle | star | heart | emoji
    emoji: ["🎉", "💖", "✨"],
    size: 1,
    spread: 90,
    startVelocity: 45,
    gravity: 3,
    duration: 200,
    bursts: [
      { x: 0.2, y: 0.4, delay: 0 },
      { x: 0.5, y: 0.3, delay: 0 },
      { x: 0.8, y: 0.4, delay: 0 },
      { x: 0.5, y: 0.5, delay: 250 }
    ]
  },

  assets: {
    heroBackground:   "assets/images/hero-bg.jpg",
    familyBackground: "assets/images/family-bg.jpg",
    monogram:         "assets/images/monogram.png",
    scratchCard:      "assets/images/scratch-card.png"
  },

  /* ---------- PAGE ORDER ----------
     Re-order the lines to re-order the website. enabled:false hides a page.
     Built-in types: hero, family, saveTheDate, events, rsvp, closing
     Photo slider: { id: "gal", type: "gallery", enabled: true, label: "Photos", heading: "Our Moments",
                     autoplay: 4, aspect: "4 / 5", images: [ { src: "assets/images/p1.jpg", caption: "" } ] }
     Your own pages (add as many as you like):
       { id: "gallery1", type: "image", enabled: true, label: "Photo", src: "assets/images/photo1.jpg", fit: "natural" }
       { id: "film",     type: "video", enabled: true, label: "Teaser", src: "assets/video/teaser.mp4",
         poster: "", muted: true, loop: true, controls: false, fit: "natural" }
     fit: "natural" = full width, own height   |   "screen" = fills the whole phone screen */
  pages: [
    { id: "hero",    type: "hero",        enabled: true, label: "Main Invitation Banner" },
    { id: "family",  type: "family",      enabled: true, label: "Introducing the Families" },
    { id: "save",    type: "saveTheDate", enabled: true, label: "Scratch Card & Countdown" },
    { id: "events",  type: "events",      enabled: true, label: "Events Schedule (Haldi, Sangeet, Reception)" },
    { id: "rsvp",    type: "rsvp",        enabled: true, label: "RSVP Button (shows only if a WhatsApp number is set)" },
    { id: "closing", type: "closing",     enabled: true, label: "Closing Door Video & Thank You" }
  ],

  /* ---------- 1. HERO ---------- */
  hero: {
    invocationArabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    invocationText:   "“In the name of Allah, the most gracious. The most merciful”",
    blessing: [
      "With the grace of god",
      "As two families come together and two hearts become one, we cordially invite you to the wedding of"
    ],
    groom: { name: "Parvez", line: "S/o Mrs. Shelina Surani &\nMr. Pankaj Surani" },
    bride: { name: "Palak",  line: "D/o Mrs. Saroj Mistry &\nMr. Hemchand Mistry" }
  },

  /* ---------- 2. FAMILIES ---------- */
  family: {
    kicker: "Two Families. One Promise.",
    title:  "INTRODUCING",
    script: "the families",
    // Each row = [ groom's side , bride's side ]
    grandparents: [
      [
        { label: "Dadaji & Dadiji", names: ["Shahbuddin Surani", "Gulshan Surani"] },
        { label: "Dadaji & Dadiji", names: ["Late Shri Girdharilal G. Mistry", "Late Smt. Kisan Devi"] }
      ],
      [
        { label: "Nanaji & Naniji", names: ["Anwer Bhimani", "Daulat Bhimani"] },
        { label: "Nanaji & Naniji", names: ["Shri Sewaramji Mathur", "Late Smt. Pushpa Mathur"] }
      ]
    ],
    groom: { name: "Parvez", relation: "S/O", parents: ["Pankaj Surani", "Shelina Surani"] },
    bride: { name: "Palak",  relation: "D/O", parents: ["Hemchand Mistry", "Saroj Mistry"] },
    siblings: [ { side: "groom", label: "Brother Of", name: "Sahil Surani" } ],
    scrollHint: "Scroll down"
  },

  /* ---------- 3. SCRATCH CARD + COUNTDOWN ---------- */
  saveTheDate: {
    label: "SAVE THE DATE",
    text:  "21st November 2026",
    countdownTo: "2026-11-21T15:00:00+05:30",     // YYYY-MM-DDTHH:MM:SS+05:30 (+05:30 = India)
    doneMessage: "The celebrations have begun!"
  },

  /* ---------- GOOGLE CALENDAR BUTTON (shown above the Events Schedule) ----------
     Opens Google Calendar with everything pre-filled. enabled:false hides it.
     Leave note "" to auto-write a note listing every event. */
  calendar: {
    enabled: true,
    buttonLabel: "Save the Date in Google Calendar",
    title: "Parvez & Palak — Wedding",
    start: "2026-11-21T15:00",
    end:   "2026-11-21T23:00",
    timezone: "Asia/Kolkata",
    venue: "Eskay Club & Resort, Borivali, Mumbai",
    note: "With the blessings of both families, we warmly invite you to celebrate the wedding of Parvez & Palak.",
    includeSchedule: true
  },

  /* ---------- 4. EVENTS ----------
     Each event can be re-ordered, hidden (enabled:false) or deleted.
     overlay:false = show only the picture (use this for a finished invitation card image that
     already has its own text) — the Get Directions button still appears under it. */
  events: {
    heading: "Events Schedule",
    timezoneOffset: "+05:30",
    directionsLabel: "Get Directions",
    calendarLabel: "Add to Calendar",
    perEventCalendar: true,
    list: [
      {
        id: "haldi", enabled: true, overlay: true,
        image: "assets/images/event-haldi.jpg",
        eyebrow: "Rang & Rasam",
        title: "Haldi",
        tagline: "A beautiful blend of colour, joy and traditions.",
        date: "2026-11-19",
        timeLines: ["10:30 AM onwards"],
        start: "10:30", end: "14:00",
        venue: "Century Hall\nMCA Kandivali",
        attire: "Hues of yellow",
        directionsUrl: "https://maps.app.goo.gl/iT6CfbSdKVBexy488?g_st=ic",
        theme: { text: "#58774a", accent: "#d9701f", title: "#d9701f", top: "8%" }
      },
      {
        id: "sangeet", enabled: true, overlay: true,
        image: "assets/images/event-sangeet.jpg",
        eyebrow: "Twirl, Love & Lights",
        title: "Sangeet",
        tagline: "An evening of music, dance &\nunforgettable memories.",
        date: "2026-11-20",
        schedule: [
          ["Orchestra", "6:00 PM"],
          ["Couple entry", "7:30 PM"],
          ["Dance performances", "8:00 PM"],
          ["Dinner", "9:00 PM"]
        ],
        timeLines: ["Followed by DJ night"],
        start: "18:00", end: "23:59",
        venue: "Arcadia Hall, Borivali",
        attire: "Indo Western",
        directionsUrl: "https://maps.app.goo.gl/zjN36VzEA4D56NYT6?g_st=ic",
        theme: { text: "#2f3a30", accent: "#b3123a", title: "#c0133a", badge: "#7a0f1e", top: "19.5%", side: "17%", scale: 0.93 }
      },
      {
        id: "reception", enabled: true, overlay: true,
        image: "assets/images/event-reception.jpg",
        eyebrow: "Vows & Eternity",
        title: "Reception",
        tagline: "A celebration of love, sacred\nvows & a beautiful forever.",
        date: "2026-11-21",
        timeLines: ["7:00 PM Onwards", "(Followed by Dinner)"],
        start: "19:00", end: "23:00",
        venue: "Eskay Club & Resort\nBorivali",
        attire: "",
        directionsUrl: "https://maps.app.goo.gl/iAKsV3JELAscuyUE6?g_st=ic",
        theme: { text: "#4f5f2c", accent: "#a8225f", title: "#a8225f", top: "10.5%" }
      }
    ]
  },

  /* ---------- RSVP (optional; hidden until a WhatsApp number is entered) ---------- */
  rsvp: {
    whatsapp: "",                       // country code + number, digits only, e.g. "919876543210"
    heading: "Kindly Join Us",
    text: "Your presence will make our celebrations complete.",
    buttonLabel: "RSVP on WhatsApp",
    message: "Hello! Thank you for the invitation to Parvez & Palak's wedding. I will be attending.",
    declineEnabled: false,                // true = also show a "Regretfully Decline" button
    declineLabel: "Regretfully Decline",
    declineMessage: "Hello! Thank you for the invitation to Parvez & Palak's wedding. Unfortunately I will not be able to attend."
  },

  /* ---------- LAST PAGE: closing-door video, then Thank You ---------- */
  closing: {
    video: "assets/video/closing-door.mp4",     // "" = no video; the Thank You shows directly
    poster: "assets/video/closing-poster.jpg",
    background: "assets/images/family-bg.jpg",  // picture behind the Thank You text
    replayEachTime: false,                      // true = play the door again every time it scrolls into view
    thankYou: "Thank You",
    line: "With love & blessings",
    signoff: "The Surani & Mistry Families"
  }
};
