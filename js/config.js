/**
 * ============================================================================
 * WEDDING INVITATION CONFIGURATION (js/config.js)
 * ============================================================================
 * Edit any values below (or open visual-editor.html in your browser!) to
 * shuffle pages, delete/hide pages, reorder events (e.g. Sangeet before Haldi),
 * or customize names, animations, flowers, and videos.
 */
window.WEDDING_CONFIG = {
  meta: {
    title: "Parvez & Palak — Wedding Invitation · November 2026",
    description: "Join Parvez & Palak for their wedding celebrations from 19th to 21st November 2026.",
    author: "Parvez & Palak",
    favicon: "logo.png"
  },

  /**
   * COMPLETE PAGE CONTROL (SHUFFLE OR DELETE/HIDE ANY MAIN PAGE)
   * - Reorder the items below to change the sequence of pages on the website!
   * - Set `enabled: false` (or delete the line) to remove any page completely.
   */
  pageOrder: [
    { id: "hero", label: "Page 1: Main Invitation Banner", enabled: true },
    { id: "family", label: "Page 2: Introducing the Families", enabled: true },
    { id: "scratch", label: "Page 3: Scratch Card & Countdown", enabled: true },
    { id: "events", label: "Page 4: Events Schedule (Haldi, Sangeet, Reception)", enabled: true },
    { id: "closing", label: "Page 5: Closing Door Video & Thank You", enabled: true }
  ],

  introOverlay: {
    enabled: true,
    videoSrc: "assets/intro.mp4",
    buttonText: "Tap to Open",
    fadeTriggerSeconds: 5.0,
    fadeDurationMs: 600
  },

  audio: {
    enabled: true,
    src: "audio/background.mp3",
    volume: 0.45
  },

  /**
   * FALLING PETALS / FLOWERS / CUSTOM ELEMENTS
   * - style options: "petal", "flower", "rose", "marigold", "jasmine",
   *   "heart", "sparkle", "leaf", "custom-emoji", "custom-image"
   */
  petals: {
    enabled: true,
    style: "petal",
    customEmojis: ["🌸", "🌺", "🌼"],
    customImageSrc: "assets/custom-flower.png",
    count: 32,
    sizeMultiplier: 1.0
  },

  /**
   * PAGE 1: HERO BANNER & "SCROLL DOWN" BUTTON
   */
  hero: {
    imageSrc: "assets/hero-invitation.png",
    imageAlt: "Parvez & Palak Wedding Invitation",
    showScrollDown: true,
    scrollDownText: "Scroll Down",
    scrollDownBottomPercent: 11
  },

  /**
   * PAGE 2: INTRODUCING THE FAMILIES & TEXT ANIMATION CONTROLS
   */
  familyIntro: {
    backgroundSrc: "assets/family.png",
    logoSrc: "assets/logo.png",
    logoAlt: "Parvez & Palak Logo",
    tagline: "Two Families. One Promise.",
    heading: "INTRODUCING",
    subheading: "the families",

    animations: {
      enabled: true,
      durationSeconds: 1.8,
      showReplayButton: false,
      replayButtonText: "Replay Text Animation",
      taglineStyle: "fade-dark",
      headingStyle: "fly-3d",
      dadajiStyle: "slide",
      nanajiStyle: "fly-arc",
      coupleStyle: "crimson-darken",
      parentsStyle: "rise-dark",
      siblingStyle: "float-zoom"
    },

    groomSide: {
      name: "Parvez",
      dadajiDadijiLabel: "Dadaji & Dadiji",
      dadajiDadijiNames: ["Shahbuddin Surani &", "Gulshan Surani"],
      nanajiNanijiLabel: "Nanaji & Naniji",
      nanajiNanijiNames: ["Anwer Bhimani &", "Daulat Bhimani"],
      parentsLabel: "S/O",
      fatherName: "Pankaj Surani",
      motherName: "Shelina Surani",
      siblingLabel: "Brother Of",
      siblingName: "Sahil Surani"
    },

    brideSide: {
      name: "Palak",
      dadajiDadijiLabel: "Dadaji & Dadiji",
      dadajiDadijiNames: ["Late Shri Girdharilal G. Mistry &", "Late Smt. Kisan Devi"],
      nanajiNanijiLabel: "Nanaji & Naniji",
      nanajiNanijiNames: ["Shri Sewaramji Mathur &", "Late Smt. Pushpa Mathur"],
      parentsLabel: "D/O",
      fatherName: "Hemchand Mistry",
      motherName: "Saroj Mistry",
      siblingLabel: "",
      siblingName: ""
    }
  },

  /**
   * PAGE 3: SCRATCH CARD & COUNTDOWN TIMER
   */
  scratchAndCountdown: {
    scratchFoilSrc: "assets/scratch-card.png",
    foilBaseColor: "#e8c872",
    revealThreshold: 0.18,
    brushRadius: 32,
    saveTheDateLabel: "SAVE THE DATE",
    weddingDateDisplay: "21st November 2026",
    countdownTargetISO: "2026-11-21T15:00:00+05:30",
    confettiColors: ["#d4a574", "#f5d199", "#c75a6b", "#7a8a6a", "#ffffff"]
  },

  /**
   * COMPACT "SAVE TO GOOGLE CALENDAR" BUTTON ABOVE EVENTS SCHEDULE
   */
  calendarButton: {
    enabled: true,
    buttonText: "Save to Google Calendar",
    eventTitle: "Parvez & Palak — Wedding Celebration",
    startDateISO: "2026-11-21T15:00:00+05:30",
    endDateISO: "2026-11-21T23:00:00+05:30",
    details: "With the blessings of our families, we cordially invite you to celebrate the wedding of Parvez Surani & Palak Mistry.",
    location: "Blue Sea Banquets, Worli, Mumbai"
  },

  /**
   * PAGE 4: EVENTS SCHEDULE (SHUFFLE, DELETE, OR ADD ANY EVENT PAGE)
   * - To put Sangeet before Haldi: simply move the Sangeet block above Haldi!
   * - To delete/hide Haldi (or any event): set `enabled: false` or delete its block.
   */
  eventsSection: {
    heading: "Events Schedule",
    events: [
      {
        id: "haldi",
        enabled: true,
        title: "Haldi & Mehendi",
        imageSrc: "assets/event-1-haldi.jpg",
        buttonText: "Get Directions",
        directionsUrl: "https://maps.app.goo.gl/iT6CfbSdKVBexy488?g_st=ic"
      },
      {
        id: "sangeet",
        enabled: true,
        title: "Sangeet Night",
        imageSrc: "assets/event-2-sangeet.jpg",
        buttonText: "Get Directions",
        directionsUrl: "https://maps.app.goo.gl/zjN36VzEA4D56NYT6?g_st=ic"
      },
      {
        id: "reception",
        enabled: true,
        title: "Wedding Ceremony & Reception",
        imageSrc: "assets/event-3-reception.jpg",
        buttonText: "Get Directions",
        directionsUrl: "https://maps.app.goo.gl/iAKsV3JELAscuyUE6?g_st=ic"
      }
    ]
  },

  /**
   * PAGE 5: OPTIONAL LAST PAGE — DOOR-CLOSING VIDEO & FADE-IN "THANK YOU"
   * - When the closing video finishes playing, its last frame fades out and
   *   the "Thank You" card fades in!
   * - Set `enabled: false` (or disable "closing" in pageOrder above) to remove this page.
   */
  closingVideoSection: {
    enabled: true,
    videoSrc: "assets/closing.mp4",
    showThankYouCard: true,
    overlayHeading: "Thank You",
    overlaySubheading: "We look forward to celebrating with you!",
    autoPlayOnScroll: true,
    showReplayButton: false
  }
};
