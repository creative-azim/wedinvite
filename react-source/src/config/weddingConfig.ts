/**
 * ============================================================================
 * WEDDING INVITATION CONFIGURATION (js/config.js)
 * ============================================================================
 * Edit any values below to customize the website for a new couple, date,
 * family tree, venue links, or media assets. No build step required!
 */
export const WEDDING_CONFIG = {
  meta: {
    title: "Parvez & Palak — Wedding Invitation · November 2026",
    description: "Join Parvez & Palak for their wedding celebrations from 19th to 21st November 2026.",
    author: "Parvez & Palak",
    favicon: "logo.png"
  },

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

  petals: {
    enabled: true,
    count: 32
  },

  hero: {
    imageSrc: "assets/hero-invitation.png",
    imageAlt: "Parvez & Palak Wedding Invitation"
  },

  familyIntro: {
    backgroundSrc: "assets/family.png",
    logoSrc: "assets/logo.png",
    logoAlt: "Parvez & Palak Logo",
    tagline: "Two Families. One Promise.",
    heading: "INTRODUCING",
    subheading: "the families",
    scrollHint: "Scroll down",

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

  scratchAndCountdown: {
    scratchFoilSrc: "assets/scratch-card.png",
    foilBaseColor: "#e8c872",
    revealThreshold: 0.42,
    saveTheDateLabel: "SAVE THE DATE",
    weddingDateDisplay: "21st November 2026",
    countdownTargetISO: "2026-11-21T15:00:00+05:30",
    confettiColors: ["#d4a574", "#f5d199", "#c75a6b", "#7a8a6a", "#ffffff"]
  },

  eventsSection: {
    heading: "Events Schedule",
    events: [
      {
        title: "Haldi & Mehendi",
        imageSrc: "assets/event-1-haldi.jpg",
        buttonText: "Get Directions",
        directionsUrl: "https://maps.app.goo.gl/iT6CfbSdKVBexy488?g_st=ic"
      },
      {
        title: "Sangeet Night",
        imageSrc: "assets/event-2-sangeet.jpg",
        buttonText: "Get Directions",
        directionsUrl: "https://maps.app.goo.gl/zjN36VzEA4D56NYT6?g_st=ic"
      },
      {
        title: "Wedding Ceremony & Reception",
        imageSrc: "assets/event-3-reception.jpg",
        buttonText: "Get Directions",
        directionsUrl: "https://maps.app.goo.gl/iAKsV3JELAscuyUE6?g_st=ic"
      }
    ]
  }
};
