/* =========================================================================
   DEFAULT SETTINGS  (you normally never edit this file)
   Anything missing from js/config.js is filled in from here, so the site
   keeps working even if a setting is deleted. Change your content in
   js/config.js — or, easier, with visual-editor.html.
   ========================================================================= */
window.INVITATION_DEFAULTS = {

  meta: { title: "Wedding Invitation" },

  fonts:  { custom: [] },     // your own font files: [{ name: "My Font", file: "assets/fonts/MyFont.woff2" }]
  theme:  {},                 // colour overrides: burgundy, rose, plum, rust, olive, gold, paper  (e.g. "#800020")
  textStyles: {},             // per-text overrides made in the editor (font, size, colour, position…)
  blocks: [],                 // extra texts / buttons you add on any page
  buttons: {},                // per-button style overrides made in the editor
  guest: { enabled: true, param: "to", prefix: "Dear", suffix: "", fallback: "" },

  intro: {
    enabled: true,
    video: "assets/video/intro.mp4",
    poster: "assets/video/intro-poster.jpg",
    tapText: "Tap to Open",
    openAtSeconds: 5
  },

  music: { enabled: true, file: "assets/audio/background.mp3", volume: 0.45 },

  scrollCue: { enabled: true, text: "Scroll Down" },

  petals: {
    enabled: true,
    count: 32,
    type: "petal",          // petal | flower | rose | sparkle | leaf | custom-emoji | custom-image
    emoji: "🌺",             // used by "custom-emoji" (several emoji separated by spaces = mixed)
    image: "",              // used by "custom-image", e.g. "assets/images/my-petal.png"
    size: 1,                // 0.5 = half size … 2 = double
    speed: 1                // 0.5 = slower … 2 = faster
  },

  animation: {
    enabled: true,
    speed: 1,               // 1 = normal, 2 = twice as fast, 0.5 = half speed
    stagger: 0.16,          // seconds between lines that appear one after another
    replay: false,          // true = animate again every time it scrolls into view
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

  scratch: {
    revealPercent: 5,       // % of the gold foil that must be rubbed off (lower = easier)
    swipesToReveal: 3,      // …or reveal after this many touches/swipes (whichever comes first)
    brushSize: 34,          // size of your finger "eraser" in pixels
    fadeMs: 500             // how fast the leftover foil fades away
  },

  confetti: {
    enabled: true,
    particleCount: 120,     // per burst
    colors: ["#d4a574", "#f5d199", "#c75a6b", "#7a8a6a", "#ffffff"],
    shapes: ["square", "circle"],   // square | circle | star | heart | emoji
    emoji: ["🎉", "💖", "✨"],       // used when "emoji" is one of the shapes
    size: 1,                // 0.5 … 3
    spread: 90,             // degrees
    startVelocity: 45,
    gravity: 3,
    duration: 200,          // frames the confetti lives (≈ 3.3 s at 60fps)
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

  /* ---- The order of the website's pages. ----
     enabled:false hides a page. Custom pages: type "image" or "video". */
  pages: [
    { id: "hero",    type: "hero",        enabled: true, label: "Main Invitation Banner" },
    { id: "family",  type: "family",      enabled: true, label: "Introducing the Families" },
    { id: "save",    type: "saveTheDate", enabled: true, label: "Scratch Card & Countdown" },
    { id: "events",  type: "events",      enabled: true, label: "Events Schedule" },
    { id: "rsvp",    type: "rsvp",        enabled: true, label: "RSVP Button" },
    { id: "closing", type: "closing",     enabled: true, label: "Closing Door Video & Thank You" }
  ],

  hero: {
    invocationArabic: "",
    invocationText: "",
    blessing: ["With the grace of god", "We cordially invite you to the wedding of"],
    groom: { name: "Groom", line: "" },
    bride: { name: "Bride", line: "" }
  },

  family: {
    kicker: "Two Families. One Promise.", title: "INTRODUCING", script: "the families",
    grandparents: [],
    groom: { name: "Groom", relation: "S/O", parents: ["", ""] },
    bride: { name: "Bride", relation: "D/O", parents: ["", ""] },
    siblings: [],
    scrollHint: "Scroll down"
  },

  saveTheDate: {
    label: "SAVE THE DATE", text: "",
    countdownTo: "", doneMessage: "The celebrations have begun!"
  },

  calendar: {
    enabled: true,
    buttonLabel: "Save the Date in Google Calendar",
    title: "Wedding Celebration",
    start: "", end: "",                 // e.g. "2026-11-21T15:00"
    timezone: "Asia/Kolkata",
    venue: "",
    note: "",
    includeSchedule: true               // add the list of events to the calendar note
  },

  events: {
    heading: "Events Schedule",
    timezoneOffset: "+05:30",
    directionsLabel: "Get Directions",
    calendarLabel: "Add to Calendar",
    perEventCalendar: true,             // small "Add to Calendar" button under every event card
    list: []
  },

  rsvp: {
    whatsapp: "", heading: "Kindly Join Us",
    text: "Your presence will make our celebrations complete.",
    buttonLabel: "RSVP on WhatsApp", message: "",
    declineEnabled: false, declineLabel: "Regretfully Decline", declineMessage: ""
  },

  closing: {
    video: "assets/video/closing-door.mp4",   // "" = no video, show the thank-you straight away
    poster: "assets/video/closing-poster.jpg",
    background: "assets/images/family-bg.jpg",
    replayEachTime: false,
    thankYou: "Thank You",
    line: "With love & blessings",
    signoff: ""
  }
};
