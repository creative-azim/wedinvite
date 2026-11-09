/**
 * ============================================================================
 * WEDDING INVITATION APPLICATION LOGIC (js/app.js)
 * ============================================================================
 * Renders the complete interactive wedding invitation from window.WEDDING_CONFIG.
 * Supports full page reordering, page deletion/toggling, event card shuffling,
 * and closing video fade-out to Thank You fade-in.
 */
(function () {
  "use strict";

  const ICONS = {
    sparkles: '<svg class="w-4 h-4 text-[#e5c158] animate-pulse" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>',
    navigation: '<svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
    calendar: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    replay: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    volume2: '<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>',
    volumeX: '<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>'
  };

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function floralDividerHtml() {
    return (
      '<div class="my-3 flex items-center justify-center gap-3">' +
        '<span class="h-px w-16 bg-gold-soft"></span>' +
        '<span class="text-gold text-lg">❀</span>' +
        '<span class="h-px w-16 bg-gold-soft"></span>' +
      '</div>'
    );
  }

  function botanicalAccentsHtml() {
    return (
      '<span class="pointer-events-none absolute top-6 left-4 text-4xl opacity-20">🌿</span>' +
      '<span class="pointer-events-none absolute top-12 right-6 text-3xl opacity-20">🌸</span>' +
      '<span class="pointer-events-none absolute bottom-10 left-10 text-3xl opacity-20">🌼</span>' +
      '<span class="pointer-events-none absolute bottom-6 right-4 text-4xl opacity-20">🌿</span>'
    );
  }

  function buildGoogleCalendarUrl(calCfg, fallbackDateISO) {
    if (!calCfg) return "#";
    function toCalTimestamp(isoStr) {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "20261121T093000Z";
      return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    }
    const startStr = toCalTimestamp(calCfg.startDateISO || fallbackDateISO);
    const endStr = toCalTimestamp(calCfg.endDateISO || calCfg.startDateISO || fallbackDateISO);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: calCfg.eventTitle || "Wedding Celebration",
      dates: startStr + "/" + endStr,
      details: calCfg.details || "",
      location: calCfg.location || ""
    });
    return "https://calendar.google.com/calendar/render?" + params.toString();
  }

  function resolveAnimClass(styleName, side) {
    const s = (styleName || "").toLowerCase();
    if (s === "none") return "";
    if (s === "fade-dark") return "anim-fade-dark";
    if (s === "fly-3d") return "anim-fly-3d";
    if (s === "slide") return side === "right" ? "anim-slide-right" : "anim-slide-left";
    if (s === "fly-arc") return side === "right" ? "anim-fly-arc-right" : "anim-fly-arc-left";
    if (s === "crimson-darken") return side === "right" ? "anim-crimson-darken-right" : "anim-crimson-darken-left";
    if (s === "rise-dark") return side === "right" ? "anim-rise-dark-right" : "anim-rise-dark-left";
    if (s === "float-zoom") return "anim-float-zoom";
    return "";
  }

  function buildShowerItemsHtml(petalsCfg) {
    if (!petalsCfg || !petalsCfg.enabled) return "";
    const count = petalsCfg.count || 32;
    const style = (petalsCfg.style || "petal").toLowerCase();
    const mult = petalsCfg.sizeMultiplier || 1.0;

    const presetEmojis = {
      flower: ["🌸", "🌺", "🌷", "🌸"],
      rose: ["🌹", "🌸", "🥀", "🌹"],
      marigold: ["🌼", "🏵️", "🌻", "🌼"],
      jasmine: ["🤍", "🌼", "✨", "🤍"],
      heart: ["💕", "💖", "🤍", "💗"],
      sparkle: ["✨", "⭐", "🌟", "✨"],
      leaf: ["🌿", "🍃", "🌱", "🍃"]
    };

    const gradients = [
      "linear-gradient(135deg, #fce7f3, #f472b6)",
      "linear-gradient(135deg, #fbcfe8, #fb7185)",
      "linear-gradient(135deg, #ffe4e6, #f472b6)",
      "linear-gradient(135deg, #fdf2f8, #f9a8d4)",
      "linear-gradient(135deg, #fecdd3, #fda4af)",
      "linear-gradient(135deg, #fff1f2, #f472b6)"
    ];

    let spans = "";
    for (let i = 0; i < count; i++) {
      const left = (Math.random() * 100).toFixed(2);
      const dur = (12 + Math.random() * 15).toFixed(2);
      const delay = (Math.random() * 10).toFixed(2);
      const op = (0.6 + Math.random() * 0.35).toFixed(2);

      if (style === "custom-image" && petalsCfg.customImageSrc) {
        const imgSize = ((14 + Math.random() * 10) * mult).toFixed(1);
        spans +=
          '<img src="' + escapeHtml(petalsCfg.customImageSrc) + '" alt="" class="absolute animate-float-petal pointer-events-none select-none" style="' +
          "left:" + left + "%;top:-10vh;width:" + imgSize + "px;height:auto;" +
          "opacity:" + op + ";animation-duration:" + dur + "s;animation-delay:" + delay + 's;" />';
      } else if (style !== "petal") {
        const list =
          style === "custom-emoji" && Array.isArray(petalsCfg.customEmojis) && petalsCfg.customEmojis.length > 0
            ? petalsCfg.customEmojis
            : presetEmojis[style] || presetEmojis.flower;
        const emoji = list[i % list.length];
        const fontSize = ((13 + Math.random() * 9) * mult).toFixed(1);
        spans +=
          '<span class="absolute animate-float-petal select-none" style="' +
          "left:" + left + "%;top:-10vh;font-size:" + fontSize + "px;line-height:1;" +
          "opacity:" + op + ";animation-duration:" + dur + "s;animation-delay:" + delay + "s;" +
          'filter:drop-shadow(0 2px 3px rgba(0,0,0,0.12))">' + escapeHtml(emoji) + "</span>";
      } else {
        const w = ((4.5 + Math.random() * 4.5) * mult).toFixed(2);
        const h = (parseFloat(w) * (1.18 + Math.random() * 0.35)).toFixed(2);
        const bg = gradients[i % gradients.length];
        const radius = i % 2 === 0 ? "150% 0 150% 50%" : "50% 150% 50% 150%";
        spans +=
          '<span class="absolute animate-float-petal" style="' +
          "left:" + left + "%;top:-10vh;width:" + w + "px;height:" + h + "px;" +
          "background:" + bg + ";opacity:" + op + ";border-radius:" + radius + ";" +
          "animation-duration:" + dur + "s;animation-delay:" + delay + "s;" +
          'box-shadow:0 1px 2px rgba(244, 114, 182, 0.25)"></span>';
      }
    }
    return '<div class="pointer-events-none fixed inset-0 z-10 overflow-hidden">' + spans + "</div>";
  }

  function fireConfetti(colors) {
    const palette = colors || ["#d4a574", "#f5d199", "#c75a6b", "#7a8a6a", "#ffffff"];
    if (typeof window.confetti === "function") {
      const shoot = function (origin) {
        window.confetti({
          particleCount: 120,
          spread: 90,
          startVelocity: 45,
          origin: origin,
          colors: palette,
          scalar: 1.1
        });
      };
      shoot({ x: 0.2, y: 0.4 });
      shoot({ x: 0.5, y: 0.3 });
      shoot({ x: 0.8, y: 0.4 });
      setTimeout(function () {
        shoot({ x: 0.5, y: 0.5 });
      }, 250);
      return;
    }
    // 100% Offline built-in confetti fallback when no internet connection is available
    const c = document.createElement("canvas");
    c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
    document.body.appendChild(c);
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const ctx = c.getContext("2d");
    const pieces = [];
    for (let i = 0; i < 140; i++) {
      pieces.push({
        x: c.width * (0.2 + Math.random() * 0.6),
        y: c.height * 0.35,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 14 - 4,
        size: 6 + Math.random() * 6,
        color: palette[i % palette.length],
        rot: Math.random() * 6.28,
        vrot: (Math.random() - 0.5) * 0.25
      });
    }
    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      pieces.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38;
        p.rot += p.vrot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      frame++;
      if (frame < 130) {
        requestAnimationFrame(tick);
      } else if (c.parentNode) {
        c.parentNode.removeChild(c);
      }
    }
    requestAnimationFrame(tick);
  }

  function renderApp() {
    const cfg = window.WEDDING_CONFIG;
    if (!cfg) return;

    if (cfg.meta && cfg.meta.title) {
      document.title = cfg.meta.title;
    }

    const root = document.getElementById("root");
    if (!root) return;

    const petalsHtml = buildShowerItemsHtml(cfg.petals);
    const fam = cfg.familyIntro;
    const animCfg = fam.animations || { enabled: true, durationSeconds: 1.8, showReplayButton: true };
    const animOn = animCfg.enabled !== false;

    document.documentElement.style.setProperty("--family-anim-duration", (animCfg.durationSeconds || 1.8) + "s");

    const g = fam.groomSide;
    const b = fam.brideSide;

    // 1. Hero Section HTML
    const bottomPct = (cfg.hero && typeof cfg.hero.scrollDownBottomPercent === "number") ? cfg.hero.scrollDownBottomPercent : 11;
    const heroScrollHtml =
      cfg.hero && cfg.hero.showScrollDown !== false
        ? '<button id="hero-scroll-btn" type="button" aria-label="Scroll down to next section" class="hero-scroll-pill" style="bottom:' + bottomPct + '%">' +
            '<span class="hero-scroll-pill-text">' +
              escapeHtml(cfg.hero.scrollDownText || "Scroll Down") +
            "</span>" +
            '<div class="hero-scroll-pill-arrows">' +
              '<svg width="18" height="10" viewBox="0 0 16 10"><path d="M1 1L8 8L15 1" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>' +
              '<svg width="18" height="10" viewBox="0 0 16 10"><path d="M1 1L8 8L15 1" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>' +
            "</div>" +
          "</button>"
        : "";

    const sectionHeroHtml =
      '<section id="page-hero" data-page-section="hero" class="hero-first-page">' +
        '<img src="' + escapeHtml(cfg.hero.imageSrc) + '" alt="' + escapeHtml(cfg.hero.imageAlt) + '" class="hero-main-img" loading="eager" />' +
        heroScrollHtml +
      "</section>";

    // 2. Family Section HTML
    const cTagline = animOn ? resolveAnimClass(animCfg.taglineStyle || "fade-dark", "left") : "";
    const cHeading = animOn ? resolveAnimClass(animCfg.headingStyle || "fly-3d", "left") : "";
    const cDadaL = animOn ? resolveAnimClass(animCfg.dadajiStyle || "slide", "left") : "";
    const cDadaR = animOn ? resolveAnimClass(animCfg.dadajiStyle || "slide", "right") : "";
    const cNanaL = animOn ? resolveAnimClass(animCfg.nanajiStyle || "fly-arc", "left") : "";
    const cNanaR = animOn ? resolveAnimClass(animCfg.nanajiStyle || "fly-arc", "right") : "";
    const cCoupleL = animOn ? resolveAnimClass(animCfg.coupleStyle || "crimson-darken", "left") : "";
    const cCoupleR = animOn ? resolveAnimClass(animCfg.coupleStyle || "crimson-darken", "right") : "";
    const cLogo = animOn ? "anim-logo-spin" : "";
    const cParL = animOn ? resolveAnimClass(animCfg.parentsStyle || "rise-dark", "left") : "";
    const cParR = animOn ? resolveAnimClass(animCfg.parentsStyle || "rise-dark", "right") : "";
    const cSib = animOn ? resolveAnimClass(animCfg.siblingStyle || "float-zoom", "left") : "";

    const familyReplayBtnHtml =
      animOn && animCfg.showReplayButton !== false
        ? '<div class="mt-3 flex justify-center">' +
            '<button id="replay-family-anim-btn" type="button" class="family-replay-btn">' +
              ICONS.replay +
              '<span>' + escapeHtml(animCfg.replayButtonText || "Replay Text Animation") + '</span>' +
            '</button>' +
          '</div>'
        : "";

    const siblingRowHtml =
      g.siblingName || b.siblingName
        ? '<div class="grid grid-cols-2 gap-3 sm:gap-8 mt-1.5 sm:mt-2 mb-5 sm:mb-6">' +
            '<div class="text-center ' + cSib + '">' +
              (g.siblingName
                ? '<p class="font-cinzel text-[8px] sm:text-[10px] tracking-[0.2em] text-[#800020] font-bold uppercase mb-0.5" style="text-shadow:0 1px 3px rgba(255,255,255,0.9);font-weight:700">' + escapeHtml(g.siblingLabel) + "</p>" +
                  '<p class="font-serif-display text-[10.5px] sm:text-sm text-[#1a080c] font-bold uppercase tracking-normal" style="text-shadow:0 1px 3px rgba(255,255,255,0.8);font-weight:700">' + escapeHtml(g.siblingName) + "</p>"
                : "") +
            "</div>" +
            '<div class="text-center ' + cSib + '">' +
              (b.siblingName
                ? '<p class="font-cinzel text-[8px] sm:text-[10px] tracking-[0.2em] text-[#800020] font-bold uppercase mb-0.5" style="text-shadow:0 1px 3px rgba(255,255,255,0.9);font-weight:700">' + escapeHtml(b.siblingLabel) + "</p>" +
                  '<p class="font-serif-display text-[10.5px] sm:text-sm text-[#1a080c] font-bold uppercase tracking-normal" style="text-shadow:0 1px 3px rgba(255,255,255,0.8);font-weight:700">' + escapeHtml(b.siblingName) + "</p>"
                : "") +
            "</div>" +
          "</div>"
        : "";

    const sectionFamilyHtml =
      '<section id="family-section" data-page-section="family" class="family-intro-section ' + (animOn ? "" : "family-in-view") + ' relative py-12 sm:py-16 px-3 sm:px-6 overflow-hidden select-none">' +
        '<img src="' + escapeHtml(fam.backgroundSrc) + '" alt="" aria-hidden="true" class="absolute inset-0 w-full h-full object-cover z-0" />' +
        '<div class="absolute inset-0 z-[1] pointer-events-none" style="background:linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0.7) 100%)"></div>' +
        '<div class="relative z-10 max-w-md mx-auto">' +
          '<div class="text-center mb-5 sm:mb-7">' +
            '<p class="font-cinzel text-[8.5px] sm:text-[11px] tracking-[0.3em] text-[#5a2233] font-semibold uppercase ' + cTagline + '" style="text-shadow:0 1px 3px rgba(255,255,255,0.7)">' + escapeHtml(fam.tagline) + "</p>" +
            '<div class="' + cHeading + '">' +
              '<h2 class="font-cinzel text-2xl sm:text-4xl text-[#3a1520] tracking-[0.12em] font-bold mt-1.5 sm:mt-2" style="text-shadow:0 1px 5px rgba(255,255,255,0.6)">' + escapeHtml(fam.heading) + "</h2>" +
              '<p class="font-script text-4xl sm:text-6xl text-[#800020] -mt-1" style="text-shadow:0 1px 5px rgba(255,255,255,0.6)">' + escapeHtml(fam.subheading) + "</p>" +
            "</div>" +
          "</div>" +
          '<div class="grid grid-cols-2 gap-3 sm:gap-8 mb-3.5 sm:mb-5">' +
            '<div class="text-center ' + cDadaL + '">' +
              '<p class="font-cinzel text-[8px] sm:text-[10px] tracking-[0.2em] text-[#800020] font-medium uppercase mb-0.5" style="text-shadow:0 1px 3px rgba(255,255,255,0.9)">' + escapeHtml(g.dadajiDadijiLabel) + "</p>" +
              '<p class="font-serif-display text-[10.5px] sm:text-sm text-[#1a080c] font-normal uppercase tracking-normal leading-snug" style="text-shadow:0 1px 3px rgba(255,255,255,0.8)">' + g.dadajiDadijiNames.map(escapeHtml).join("<br/>") + "</p>" +
            "</div>" +
            '<div class="text-center ' + cDadaR + '">' +
              '<p class="font-cinzel text-[8px] sm:text-[10px] tracking-[0.2em] text-[#800020] font-medium uppercase mb-0.5" style="text-shadow:0 1px 3px rgba(255,255,255,0.9)">' + escapeHtml(b.dadajiDadijiLabel) + "</p>" +
              '<p class="font-serif-display text-[10.5px] sm:text-sm text-[#1a080c] font-normal uppercase tracking-normal leading-snug" style="text-shadow:0 1px 3px rgba(255,255,255,0.8)">' + b.dadajiDadijiNames.map(escapeHtml).join("<br/>") + "</p>" +
            "</div>" +
          "</div>" +
          '<div class="grid grid-cols-2 gap-3 sm:gap-8 mb-4 sm:mb-6">' +
            '<div class="text-center ' + cNanaL + '">' +
              '<p class="font-cinzel text-[8px] sm:text-[10px] tracking-[0.2em] text-[#800020] font-medium uppercase mb-0.5" style="text-shadow:0 1px 3px rgba(255,255,255,0.9)">' + escapeHtml(g.nanajiNanijiLabel) + "</p>" +
              '<p class="font-serif-display text-[10.5px] sm:text-sm text-[#1a080c] font-normal uppercase tracking-normal leading-snug" style="text-shadow:0 1px 3px rgba(255,255,255,0.8)">' + g.nanajiNanijiNames.map(escapeHtml).join("<br/>") + "</p>" +
            "</div>" +
            '<div class="text-center ' + cNanaR + '">' +
              '<p class="font-cinzel text-[8px] sm:text-[10px] tracking-[0.2em] text-[#800020] font-medium uppercase mb-0.5" style="text-shadow:0 1px 3px rgba(255,255,255,0.9)">' + escapeHtml(b.nanajiNanijiLabel) + "</p>" +
              '<p class="font-serif-display text-[10.5px] sm:text-sm text-[#1a080c] font-normal uppercase tracking-normal leading-snug" style="text-shadow:0 1px 3px rgba(255,255,255,0.8)">' + b.nanajiNanijiNames.map(escapeHtml).join("<br/>") + "</p>" +
            "</div>" +
          "</div>" +
          '<div class="relative grid grid-cols-2 gap-3 sm:gap-8 items-center mb-3.5 sm:mb-5">' +
            '<div class="text-center ' + cCoupleL + '">' +
              '<h3 class="font-script text-3xl sm:text-5xl text-[#800020] leading-none" style="text-shadow:0 1px 8px rgba(255,255,255,0.7)">' + escapeHtml(g.name) + "</h3>" +
            "</div>" +
            '<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">' +
              '<div class="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center ' + cLogo + '">' +
                '<img src="' + escapeHtml(fam.logoSrc) + '" alt="' + escapeHtml(fam.logoAlt) + '" class="w-full h-full object-contain filter drop-shadow-md" />' +
              "</div>" +
            "</div>" +
            '<div class="text-center ' + cCoupleR + '">' +
              '<h3 class="font-script text-3xl sm:text-5xl text-[#800020] leading-none" style="text-shadow:0 1px 8px rgba(255,255,255,0.7)">' + escapeHtml(b.name) + "</h3>" +
            "</div>" +
          "</div>" +
          '<div class="grid grid-cols-2 gap-3 sm:gap-8 mb-3.5 sm:mb-5">' +
            '<div class="text-center ' + cParL + '">' +
              '<p class="font-cinzel text-[8px] sm:text-[10px] tracking-[0.2em] text-[#800020] font-bold uppercase mb-0.5" style="text-shadow:0 1px 3px rgba(255,255,255,0.9);font-weight:700">' + escapeHtml(g.parentsLabel) + "</p>" +
              '<p class="font-serif-display text-[10.5px] sm:text-sm text-[#1a080c] font-bold uppercase tracking-normal leading-snug" style="text-shadow:0 1px 3px rgba(255,255,255,0.8);font-weight:700">' + escapeHtml(g.fatherName) + "</p>" +
              '<p class="font-serif-display text-[9px] sm:text-[10px] text-[#800020] font-bold italic my-0.5" style="font-weight:700">&amp;</p>' +
              '<p class="font-serif-display text-[10.5px] sm:text-sm text-[#1a080c] font-bold uppercase tracking-normal leading-snug" style="text-shadow:0 1px 3px rgba(255,255,255,0.8);font-weight:700">' + escapeHtml(g.motherName) + "</p>" +
            "</div>" +
            '<div class="text-center ' + cParR + '">' +
              '<p class="font-cinzel text-[8px] sm:text-[10px] tracking-[0.2em] text-[#800020] font-bold uppercase mb-0.5" style="text-shadow:0 1px 3px rgba(255,255,255,0.9);font-weight:700">' + escapeHtml(b.parentsLabel) + "</p>" +
              '<p class="font-serif-display text-[10.5px] sm:text-sm text-[#1a080c] font-bold uppercase tracking-normal leading-snug" style="text-shadow:0 1px 3px rgba(255,255,255,0.8);font-weight:700">' + escapeHtml(b.fatherName) + "</p>" +
              '<p class="font-serif-display text-[9px] sm:text-[10px] text-[#800020] font-bold italic my-0.5" style="font-weight:700">&amp;</p>' +
              '<p class="font-serif-display text-[10.5px] sm:text-sm text-[#1a080c] font-bold uppercase tracking-normal leading-snug" style="text-shadow:0 1px 3px rgba(255,255,255,0.8);font-weight:700">' + escapeHtml(b.motherName) + "</p>" +
            "</div>" +
          "</div>" +
          siblingRowHtml +
          familyReplayBtnHtml +
        "</div>" +
      "</section>";

    // 3. Scratch Card & Countdown Section HTML
    const sectionScratchHtml =
      '<section id="page-scratch" data-page-section="scratch" class="relative pt-8 pb-10 px-6 bg-cream border-t border-gold-soft/30">' +
        botanicalAccentsHtml() +
        '<div class="relative max-w-3xl mx-auto text-center">' +
          floralDividerHtml() +
          '<div class="mb-6">' +
            '<div id="scratch-container" class="relative mx-auto w-full max-w-[340px] sm:max-w-md aspect-[1.875/1] rounded-2xl overflow-hidden border border-[#c5a880]/60 shadow-xl select-none">' +
              '<div class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#fffdfa] to-[#fbf2df] p-4 text-center border-2 border-[#c5a880]/40 rounded-2xl shadow-inner">' +
                '<p class="font-cinzel tracking-[0.35em] text-[#800020] text-xs sm:text-sm font-bold uppercase">' + escapeHtml(cfg.scratchAndCountdown.saveTheDateLabel) + "</p>" +
                '<p class="font-dm-serif text-2xl sm:text-4xl text-[#800020] mt-1.5 tracking-wide drop-shadow-xs">' + escapeHtml(cfg.scratchAndCountdown.weddingDateDisplay) + "</p>" +
              "</div>" +
              '<canvas id="scratch-canvas" class="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-10 rounded-2xl transition-opacity duration-500"></canvas>' +
            "</div>" +
          "</div>" +
          '<div id="countdown-wrapper" class="transition-all duration-700 opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden" aria-hidden="true">' +
            '<div class="flex justify-center gap-3 sm:gap-6">' +
              ["Days", "Hours", "Minutes", "Seconds"]
                .map(function (label) {
                  return (
                    '<div class="flex flex-col items-center min-w-[68px] sm:min-w-[90px]">' +
                      '<div class="w-full aspect-square rounded-2xl bg-cream border border-gold-soft shadow-soft flex items-center justify-center backdrop-blur-sm">' +
                        '<span id="cd-' + label.toLowerCase() + '" class="font-cinzel text-2xl sm:text-4xl text-rose-deep tabular-nums">00</span>' +
                      "</div>" +
                      '<span class="mt-2 text-xs sm:text-sm tracking-widest uppercase text-sage-deep">' + label + "</span>" +
                    "</div>"
                  );
                })
                .join("") +
            "</div>" +
          "</div>" +
        "</div>" +
      "</section>";

    // 4. Events Schedule Section HTML (filters out disabled/deleted events & preserves custom order!)
    const calCfg = cfg.calendarButton || { enabled: true };
    const calUrl = buildGoogleCalendarUrl(calCfg, cfg.scratchAndCountdown.countdownTargetISO);
    const calendarBtnHtml =
      calCfg.enabled !== false
        ? '<div class="mb-6 flex justify-center">' +
            '<a href="' + escapeHtml(calUrl) + '" target="_blank" rel="noreferrer" class="calendar-save-btn">' +
              ICONS.calendar +
              '<span>' + escapeHtml(calCfg.buttonText || "Save to Google Calendar") + '</span>' +
            "</a>" +
          "</div>"
        : "";

    const activeEvents = (cfg.eventsSection.events || []).filter(function (ev) {
      return ev && ev.enabled !== false;
    });

    const eventsCardsHtml = activeEvents
      .map(function (ev) {
        return (
          '<article class="relative rounded-3xl overflow-hidden shadow-elegant border border-gold-soft/40 bg-white transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] w-full flex flex-col items-center max-w-md mx-auto">' +
            '<img src="' + escapeHtml(ev.imageSrc) + '" alt="' + escapeHtml(ev.title) + '" class="w-full h-auto object-cover select-none" loading="lazy" />' +
            (ev.directionsUrl
              ? '<div class="w-full py-4 px-6 flex justify-center bg-cream/20 backdrop-blur-sm border-t border-gold-soft/20">' +
                  '<a href="' + escapeHtml(ev.directionsUrl) + '" target="_blank" rel="noreferrer" class="w-full">' +
                    '<button type="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-[#a84c32] hover:bg-[#8e3c25] text-white border-0 rounded-full px-8 py-5 h-11 font-cinzel text-xs font-medium tracking-wider transition-all duration-300 w-full shadow-md">' +
                      ICONS.navigation + " " + escapeHtml(ev.buttonText || "Get Directions") +
                    "</button>" +
                  "</a>" +
                "</div>"
              : "") +
          "</article>"
        );
      })
      .join("");

    const sectionEventsHtml =
      '<section id="page-events" data-page-section="events" class="relative pt-8 pb-16 px-4 sm:px-6 bg-sage-soft/20">' +
        botanicalAccentsHtml() +
        '<div class="relative max-w-6xl mx-auto">' +
          calendarBtnHtml +
          '<div class="text-center mb-10">' +
            '<h2 class="font-script text-5xl sm:text-6xl text-rose-deep mt-1">' + escapeHtml(cfg.eventsSection.heading) + "</h2>" +
            floralDividerHtml() +
          "</div>" +
          '<div class="grid grid-cols-1 gap-10 max-w-md mx-auto">' +
            eventsCardsHtml +
          "</div>" +
        "</div>" +
      "</section>";

    // 5. Closing Video Section HTML (Video plays -> Last frame fades out -> Thank You fades in)
    const closingCfg = cfg.closingVideoSection || { enabled: false };
    const closingThankYouHtml =
      closingCfg.showThankYouCard !== false && (closingCfg.overlayHeading || closingCfg.overlaySubheading)
        ? '<div class="closing-thankyou-card">' +
            '<div class="closing-thankyou-ornament">✦ ❀ ✦</div>' +
            (closingCfg.overlayHeading
              ? '<p class="closing-thankyou-heading">' + escapeHtml(closingCfg.overlayHeading) + '</p>'
              : '') +
            (closingCfg.overlaySubheading
              ? '<p class="closing-thankyou-subheading">' + escapeHtml(closingCfg.overlaySubheading) + '</p>'
              : '') +
          '</div>'
        : '';

    const sectionClosingHtml =
      closingCfg.enabled !== false
        ? '<section id="closing-video-section" data-page-section="closing" class="closing-video-section">' +
            '<video id="closing-video" src="' + escapeHtml(closingCfg.videoSrc || "assets/closing.mp4") + '" class="closing-video-el" playsinline muted preload="metadata"></video>' +
            '<div class="closing-overlay-wrapper">' +
              closingThankYouHtml +
              (closingCfg.showReplayButton !== false
                ? '<button id="replay-closing-btn" type="button" class="closing-replay-btn">' +
                    ICONS.replay + '<span>Replay Door Closing</span>' +
                  '</button>'
                : '') +
            '</div>' +
          '</section>'
        : "";

    // Assemble pages in user-configured order (cfg.pageOrder)
    const sectionMap = {
      hero: sectionHeroHtml,
      family: sectionFamilyHtml,
      scratch: sectionScratchHtml,
      events: sectionEventsHtml,
      closing: sectionClosingHtml
    };

    const pageOrder = Array.isArray(cfg.pageOrder) && cfg.pageOrder.length > 0
      ? cfg.pageOrder
      : [
          { id: "hero", enabled: true },
          { id: "family", enabled: true },
          { id: "scratch", enabled: true },
          { id: "events", enabled: true },
          { id: "closing", enabled: true }
        ];

    const orderedMainSectionsHtml = pageOrder
      .filter(function (p) {
        return p && p.enabled !== false && sectionMap[p.id];
      })
      .map(function (p) {
        return sectionMap[p.id];
      })
      .join("");

    const introOverlayHtml =
      cfg.introOverlay && cfg.introOverlay.enabled && !window.__SKIP_INTRO_OVERLAY__ && !window.__SKIP_INTRO_OVERLAY__ && !window.__SKIP_INTRO_OVERLAY__ && !window.__SKIP_INTRO_OVERLAY__
        ? '<div id="intro-overlay" class="fixed inset-0 w-full h-full bg-black flex items-center justify-center cursor-pointer overflow-hidden z-50 select-none" style="opacity:1;transition:opacity ' + (cfg.introOverlay.fadeDurationMs || 600) + 'ms cubic-bezier(0.4, 0, 0.2, 1)">' +
            '<video id="intro-video" src="' + escapeHtml(cfg.introOverlay.videoSrc) + '#t=0.1" class="w-full h-full object-cover" playsinline muted preload="auto"></video>' +
            '<div id="intro-cta" class="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 sm:pb-24 pointer-events-none animate-fade-in">' +
              '<div class="flex flex-col items-center gap-3">' +
                '<div class="relative group">' +
                  '<div class="absolute -inset-2 rounded-full bg-gradient-to-r from-[#d4af37] via-[#fcf6ba] to-[#aa771c] opacity-80 blur-md animate-pulse"></div>' +
                  '<div class="relative px-7 py-3.5 rounded-full bg-[#1a0c10]/90 border-2 border-[#e5c158] text-[#fbf5b7] shadow-2xl backdrop-blur-md flex items-center gap-3 transition-transform duration-300">' +
                    ICONS.sparkles +
                    '<span class="font-cinzel text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-white drop-shadow-md">' + escapeHtml(cfg.introOverlay.buttonText || "Tap to Open") + "</span>" +
                    ICONS.sparkles +
                  "</div>" +
                "</div>" +
              "</div>" +
            "</div>" +
          "</div>"
        : "";

    root.innerHTML =
      '<div class="md:fixed md:inset-0 md:w-screen md:h-screen md:overflow-hidden md:flex md:items-center md:justify-center md:bg-[#f2ece3]">' +
        '<div class="hidden md:block absolute inset-0 overflow-hidden pointer-events-none select-none z-0">' +
          '<img src="' + escapeHtml(fam.backgroundSrc) + '" alt="" aria-hidden="true" class="w-full h-full object-cover scale-105 blur-[8px] opacity-95 brightness-98 saturate-105" />' +
          '<div class="absolute inset-0 bg-white/5"></div>' +
        "</div>" +
        '<div class="relative z-10 w-full md:max-w-[440px] md:h-screen md:shadow-[0_0_50px_rgba(0,0,0,0.35)] md:border-x md:border-[#c5a880]/40 overflow-hidden bg-[#faf6f0]">' +
          '<div id="phone-viewport" class="phone-viewport w-full min-h-screen md:min-h-0 md:h-screen md:overflow-y-auto md:overflow-x-hidden relative scroll-smooth">' +
            '<div class="relative min-h-screen">' +
              petalsHtml +
              '<audio id="bg-audio" src="' + escapeHtml(cfg.audio.src) + '" preload="auto" loop></audio>' +
              '<button id="audio-toggle-btn" type="button" aria-label="Mute background music" class="hidden fixed bottom-5 right-5 z-50 h-11 w-11 rounded-full bg-foreground/80 text-cream backdrop-blur shadow-elegant items-center justify-center hover:scale-105 transition">' +
                ICONS.volume2 +
              "</button>" +
              '<main id="main-sections-container" class="relative bg-cream overflow-x-hidden">' +
                orderedMainSectionsHtml +
              "</main>" +
              introOverlayHtml +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";

    initInteractions(cfg);
  }

  function initInteractions(cfg) {
    const famSection = document.getElementById("family-section");
    const heroScrollBtn = document.getElementById("hero-scroll-btn");
    const replayFamilyBtn = document.getElementById("replay-family-anim-btn");
    const animCfg = (cfg.familyIntro && cfg.familyIntro.animations) || { enabled: true };

    // Scroll Down button scrolls to whichever section comes immediately after Hero!
    if (heroScrollBtn) {
      heroScrollBtn.addEventListener("click", function () {
        const heroEl = document.getElementById("page-hero");
        const nextSection = heroEl && heroEl.nextElementSibling ? heroEl.nextElementSibling : famSection;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    if (replayFamilyBtn && famSection) {
      replayFamilyBtn.addEventListener("click", function () {
        famSection.classList.remove("family-in-view");
        void famSection.offsetWidth;
        setTimeout(function () {
          famSection.classList.add("family-in-view");
        }, 90);
      });
    }

    // Audio + Intro Overlay
    const audioEl = document.getElementById("bg-audio");
    const audioBtn = document.getElementById("audio-toggle-btn");
    const introOverlay = document.getElementById("intro-overlay");
    const introVideo = document.getElementById("intro-video");
    const introCta = document.getElementById("intro-cta");

    let isMuted = false;
    let audioStarted = false;

    function startAudio() {
      if (!cfg.audio || !cfg.audio.enabled || !audioEl) return;
      audioEl.volume = cfg.audio.volume || 0.45;
      audioStarted = true;
      if (audioBtn) {
        audioBtn.classList.remove("hidden");
        audioBtn.classList.add("flex");
      }
      if (!isMuted) {
        audioEl.play().catch(function () {});
      }
    }

    if (audioBtn && audioEl) {
      audioBtn.addEventListener("click", function () {
        isMuted = !isMuted;
        audioBtn.setAttribute("aria-label", isMuted ? "Unmute background music" : "Mute background music");
        audioBtn.innerHTML = isMuted ? ICONS.volumeX : ICONS.volume2;
        if (isMuted) {
          audioEl.pause();
        } else if (audioStarted) {
          audioEl.play().catch(function () {});
        }
      });
    }

    if (introOverlay && introVideo) {
      let videoPlaying = false;
      let dismissing = false;
      const triggerSec = (cfg.introOverlay && cfg.introOverlay.fadeTriggerSeconds) || 5.0;
      const fadeMs = (cfg.introOverlay && cfg.introOverlay.fadeDurationMs) || 600;

      function dismissOverlay() {
        if (dismissing) return;
        dismissing = true;
        introOverlay.style.opacity = "0";
        introOverlay.style.pointerEvents = "none";
        setTimeout(function () {
          if (introOverlay && introOverlay.parentNode) {
            introOverlay.parentNode.removeChild(introOverlay);
          }
          startAudio();
        }, fadeMs);
      }

      introOverlay.addEventListener("click", function () {
        if (!videoPlaying) {
          introVideo.currentTime = 0;
          introVideo
            .play()
            .then(function () {
              videoPlaying = true;
              if (introCta) introCta.style.display = "none";
              startAudio();
            })
            .catch(function () {
              dismissOverlay();
            });
        }
      });

      introVideo.addEventListener("timeupdate", function () {
        if (introVideo.currentTime >= triggerSec) {
          dismissOverlay();
        }
      });

      introVideo.addEventListener("ended", function () {
        dismissOverlay();
      });
    }

    // Family Section Multi-Style Text Animations on Scroll
    if (famSection && animCfg.enabled !== false) {
      if ("IntersectionObserver" in window) {
        const obs = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                famSection.classList.add("family-in-view");
              } else if (entry.boundingClientRect.top > 120) {
                famSection.classList.remove("family-in-view");
              }
            });
          },
          { threshold: 0.12 }
        );
        obs.observe(famSection);
      } else {
        famSection.classList.add("family-in-view");
      }
    }

    // Scratch Card & Countdown
    const scratchCanvas = document.getElementById("scratch-canvas");
    const scratchContainer = document.getElementById("scratch-container");
    const countdownWrapper = document.getElementById("countdown-wrapper");
    let scratchRevealed = false;

    if (scratchCanvas && scratchContainer) {
      const foilImg = new Image();
      foilImg.src = cfg.scratchAndCountdown.scratchFoilSrc;

      function setupScratchCanvas() {
        if (scratchRevealed) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = scratchContainer.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        scratchCanvas.width = rect.width * dpr;
        scratchCanvas.height = rect.height * dpr;
        scratchCanvas.style.width = rect.width + "px";
        scratchCanvas.style.height = rect.height + "px";
        const ctx = scratchCanvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(dpr, dpr);
        ctx.fillStyle = cfg.scratchAndCountdown.foilBaseColor || "#e8c872";
        ctx.fillRect(0, 0, rect.width, rect.height);
        if (foilImg.complete && foilImg.naturalWidth > 0) {
          ctx.drawImage(foilImg, 0, 0, rect.width, rect.height);
        } else {
          foilImg.onload = function () {
            if (scratchRevealed) return;
            const c = scratchCanvas.getContext("2d");
            if (c) c.drawImage(foilImg, 0, 0, rect.width, rect.height);
          };
        }
      }

      setupScratchCanvas();
      window.addEventListener("resize", setupScratchCanvas);

      let isScratching = false;
      let lastPoint = null;
      let moveStrokeCount = 0;
      const radius = cfg.scratchAndCountdown.brushRadius || 32;

      function triggerCompleteReveal() {
        if (scratchRevealed) return;
        scratchRevealed = true;
        scratchCanvas.style.opacity = "0";
        scratchCanvas.style.pointerEvents = "none";
        setTimeout(function () {
          scratchCanvas.style.display = "none";
        }, 450);
        fireConfetti(cfg.scratchAndCountdown.confettiColors);
        if (countdownWrapper) {
          countdownWrapper.classList.remove("opacity-0", "translate-y-4", "pointer-events-none", "h-0", "overflow-hidden");
          countdownWrapper.classList.add("opacity-100", "translate-y-0");
          countdownWrapper.setAttribute("aria-hidden", "false");
        }
      }

      function scratchAt(clientX, clientY) {
        if (scratchRevealed) return;
        const ctx = scratchCanvas.getContext("2d");
        if (!ctx) return;
        const rect = scratchCanvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = radius * 2;
        ctx.beginPath();
        if (lastPoint) {
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        lastPoint = { x: x, y: y };
      }

      function checkRevealProgress() {
        if (scratchRevealed) return;
        const ctx = scratchCanvas.getContext("2d");
        if (!ctx) return;
        const w = scratchCanvas.width;
        const h = scratchCanvas.height;
        const data = ctx.getImageData(0, 0, w, h).data;
        let cleared = 0;
        for (let i = 3; i < data.length; i += 160) {
          if (data[i] < 60) cleared++;
        }
        const totalSamples = data.length / 160;
        const threshold = cfg.scratchAndCountdown.revealThreshold || 0.18;
        if (cleared / totalSamples >= threshold) {
          triggerCompleteReveal();
        }
      }

      scratchCanvas.addEventListener("pointerdown", function (e) {
        if (scratchCanvas.setPointerCapture) {
          try { scratchCanvas.setPointerCapture(e.pointerId); } catch (_) {}
        }
        isScratching = true;
        moveStrokeCount = 0;
        lastPoint = null;
        scratchAt(e.clientX, e.clientY);
      });

      scratchCanvas.addEventListener("pointermove", function (e) {
        if (!isScratching) return;
        e.preventDefault();
        scratchAt(e.clientX, e.clientY);
        moveStrokeCount++;
        if (moveStrokeCount >= 10 && moveStrokeCount % 5 === 0) {
          checkRevealProgress();
        }
      });

      function stopScratching() {
        if (!isScratching) return;
        isScratching = false;
        lastPoint = null;
        checkRevealProgress();
      }

      scratchCanvas.addEventListener("pointerup", stopScratching);
      scratchCanvas.addEventListener("pointerleave", stopScratching);
    }

    // Countdown Timer Tick
    const targetMs = new Date(cfg.scratchAndCountdown.countdownTargetISO).getTime();
    function updateCountdown() {
      const diff = Math.max(0, targetMs - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff / 3600000) % 24);
      const minutes = Math.floor((diff / 60000) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const dEl = document.getElementById("cd-days");
      const hEl = document.getElementById("cd-hours");
      const mEl = document.getElementById("cd-minutes");
      const sEl = document.getElementById("cd-seconds");
      if (dEl) dEl.textContent = String(days).padStart(2, "0");
      if (hEl) hEl.textContent = String(hours).padStart(2, "0");
      if (mEl) mEl.textContent = String(minutes).padStart(2, "0");
      if (sEl) sEl.textContent = String(seconds).padStart(2, "0");
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Closing Video Page: Play MP4 -> Last frame fades out -> "Thank You" fades in!
    const closingSection = document.getElementById("closing-video-section");
    const closingVideo = document.getElementById("closing-video");
    const replayClosingBtn = document.getElementById("replay-closing-btn");

    if (closingSection && closingVideo) {
      function startClosingSequence() {
        closingSection.classList.remove("closing-finished");
        closingVideo.currentTime = 0;
        closingVideo.play().catch(function () {
          // If video fails to load/play, fade in Thank You card gracefully
          closingSection.classList.add("closing-finished");
        });
      }

      closingVideo.addEventListener("timeupdate", function () {
        if (closingVideo.duration && closingVideo.currentTime >= closingVideo.duration - 0.25) {
          closingSection.classList.add("closing-finished");
        }
      });

      closingVideo.addEventListener("ended", function () {
        closingSection.classList.add("closing-finished");
      });

      closingVideo.addEventListener("error", function () {
        closingSection.classList.add("closing-finished");
      });

      if ("IntersectionObserver" in window && (!cfg.closingVideoSection || cfg.closingVideoSection.autoPlayOnScroll !== false)) {
        const closeObs = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                startClosingSequence();
              } else {
                closingVideo.pause();
                closingSection.classList.remove("closing-finished");
              }
            });
          },
          { threshold: 0.35 }
        );
        closeObs.observe(closingSection);
      }

      if (replayClosingBtn) {
        replayClosingBtn.addEventListener("click", function () {
          startClosingSequence();
        });
      }
    }
  }

  window.renderWeddingApp = renderApp;
  window.renderWeddingApp = renderApp;
  window.renderWeddingApp = renderApp;
  window.renderWeddingApp = renderApp;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderApp);
  } else {
    renderApp();
  }
})();
