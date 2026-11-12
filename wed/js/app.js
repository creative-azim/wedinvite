/* =========================================================================
   Wedding invitation — behaviour
   Builds the whole page from js/config.js (merged over js/defaults.js).
   No libraries, no build step.

   Also supports a "preview" mode (index.html?preview=1) that visual-editor.html
   uses to show your changes live, select text by clicking it and drag it around.
   Normal visitors never see this mode.
   ========================================================================= */
(function () {
  'use strict';

  /* ======================================================================
     0. SETUP & HELPERS
     ====================================================================== */
  var params = new URLSearchParams(location.search);
  var PREVIEW = params.has('preview');
  var SHOW_INTRO = !PREVIEW || params.has('intro');
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) && !PREVIEW;

  var root = document.getElementById('invite');
  var cfg = null;
  var cleanups = [];
  var animReady = false;
  var pendingAnim = [];
  var animIO = null;
  var guestFromEditor = null;      // editor "preview as guest"
  var editMode = true;             // preview only: click to select / drag to move
  var selTid = '';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
  function clone(x) { return x === undefined ? x : JSON.parse(JSON.stringify(x)); }
  function merge(a, b) {
    if (!isObj(a) || !isObj(b)) return b === undefined ? clone(a) : clone(b);
    var out = {};
    Object.keys(a).forEach(function (k) { out[k] = clone(a[k]); });
    Object.keys(b).forEach(function (k) { out[k] = (isObj(a[k]) && isObj(b[k])) ? merge(a[k], b[k]) : clone(b[k]); });
    return out;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function num(v, d) { v = parseFloat(v); return isNaN(v) ? d : v; }
  function has(v) { return v !== undefined && v !== null && v !== ''; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function cssId(s) { return String(s).replace(/["\\]/g, ''); }

  /* attribute strings: A = animation role/group,  T = text id (editable in the editor) */
  function A(role, group, side) {
    return ' data-role="' + role + '" data-group="' + esc(group) + '"' + (side ? ' data-side="' + side + '"' : '');
  }
  function T(tid, label) { return ' data-tid="' + esc(tid) + '" data-tl="' + esc(label) + '"'; }

  /* ======================================================================
     1. FONTS, THEME, GUEST
     ====================================================================== */
  var loadedFonts = {};
  function findFont(name) {
    var L = window.INVITATION_FONTS || [];
    for (var i = 0; i < L.length; i++) if (L[i].name === name) return L[i];
    return null;
  }
  function isCustomFont(name) {
    return ((cfg.fonts || {}).custom || []).some(function (f) { return f && f.name === name; });
  }
  function fontStack(name) {
    if (!name) return '';
    name = String(name).replace(/["\\]/g, '');
    var f = findFont(name), fb = 'serif';
    if (f && /Script/.test(f.cat)) fb = 'cursive';
    else if (f && /Sans/.test(f.cat)) fb = 'sans-serif';
    return '"' + name + '", ' + fb;
  }
  function ensureFont(name) {
    if (!name || loadedFonts[name]) return;
    loadedFonts[name] = 1;
    var f = findFont(name);
    if ((f && f.loaded) || isCustomFont(name)) return;
    var spec = f ? (f.w || '') : '';
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name).replace(/%20/g, '+') + (spec ? ':' + spec : '') + '&display=swap';
    document.head.appendChild(l);
  }
  function setupCustomFonts() {
    var st = $('#custom-fonts');
    if (!st) { st = document.createElement('style'); st.id = 'custom-fonts'; document.head.appendChild(st); }
    st.textContent = ((cfg.fonts || {}).custom || []).filter(function (f) { return f && f.name && f.file; }).map(function (f) {
      return '@font-face{font-family:"' + String(f.name).replace(/["\\]/g, '') + '";src:url("' + String(f.file).replace(/["\\]/g, '') + '");font-weight:100 900;font-display:swap}';
    }).join('\n');
  }
  var THEME_VARS = { burgundy: '--burgundy', rose: '--rose-deep', plum: '--plum', rust: '--rust', olive: '--olive', gold: '--gold', paper: '--paper' };
  function applyTheme() {
    var rs = document.documentElement.style;
    Object.keys(THEME_VARS).forEach(function (k) { rs.removeProperty(THEME_VARS[k]); });
    var t = cfg.theme || {};
    Object.keys(THEME_VARS).forEach(function (k) { if (has(t[k])) rs.setProperty(THEME_VARS[k], t[k]); });
    if (has(t.paper)) { var fr = document.getElementById('frame'); if (fr) fr.style.background = t.paper; }
    else { var fr2 = document.getElementById('frame'); if (fr2) fr2.style.background = ''; }
  }
  function guestName() {
    var g = cfg.guest || {};
    if (g.enabled === false) return '';
    var n = guestFromEditor != null ? guestFromEditor : (params.get(g.param || 'to') || '');
    n = String(n).replace(/[<>]/g, '').trim().slice(0, 60);
    return n || g.fallback || '';
  }

  /* ======================================================================
     2. BUTTON HELPERS
     ====================================================================== */
  function btnCfg(id, ev) {
    var g = (cfg.buttons || {})[id] || {};
    var o = (ev && ev.buttons && ev.buttons[id]) || {};
    return Object.assign({}, g, o);
  }
  function btnLabel(id, fallback, ev) { var c = btnCfg(id, ev); return has(c.text) ? c.text : fallback; }
  function Bt(id, ev) { return ' data-btn="' + id + '"' + (ev ? ' data-ev="' + esc(ev.id) + '"' : ''); }

  var SHADOW_BOX = {
    none: 'none', soft: '0 4px 10px -2px rgba(0,0,0,.18)', medium: '0 8px 20px -6px rgba(0,0,0,.35)',
    strong: '0 12px 28px -6px rgba(0,0,0,.55)', glow: '0 0 18px rgba(229,193,88,.85)'
  };
  var SHADOW_TEXT = {
    none: 'none', soft: '0 1px 4px rgba(0,0,0,.28)', strong: '0 2px 8px rgba(0,0,0,.6)',
    white: '0 1px 6px rgba(255,255,255,.9)', glow: '0 0 10px rgba(255,255,255,.95), 0 0 22px rgba(255,255,255,.7)', gold: '0 0 10px rgba(255,205,90,.95)'
  };

  function applyBtnStyle(el, c, noLayout) {
    if (!c) return;
    var st = el.style;
    if (c.hidden === true || c.hidden === 'on') el.classList.add(PREVIEW ? 'tx-ghost' : 'tx-hidden');
    if (c.font) { st.fontFamily = fontStack(c.font); ensureFont(c.font); }
    if (has(c.fontSize)) st.fontSize = num(c.fontSize, 12) + 'px';
    if (c.weight) st.fontWeight = c.weight;
    if (has(c.letterSpacing)) st.letterSpacing = num(c.letterSpacing, 0) + 'em';
    if (c.uppercase === 'on') st.textTransform = 'uppercase'; else if (c.uppercase === 'off') st.textTransform = 'none';
    if (c.italic === 'on') st.fontStyle = 'italic';
    if (c.color) st.color = c.color;
    if (c.bg) st.background = c.bg;
    if (c.borderColor || has(c.borderWidth)) {
      st.borderStyle = 'solid';
      st.borderColor = c.borderColor || 'currentColor';
      st.borderWidth = (has(c.borderWidth) ? num(c.borderWidth, 1.5) : 1.5) + 'px';
    }
    if (has(c.radius)) st.borderRadius = num(c.radius, 999) + 'px';
    if (has(c.padY)) { st.paddingTop = st.paddingBottom = num(c.padY, 15) + 'px'; }
    if (has(c.padX)) { st.paddingLeft = st.paddingRight = num(c.padX, 24) + 'px'; }
    if (c.shadow && SHADOW_BOX[c.shadow]) st.boxShadow = SHADOW_BOX[c.shadow];
    if (c.hoverBg) st.setProperty('--hbg', c.hoverBg);
    if (c.hoverColor) st.setProperty('--hfg', c.hoverColor);
    if (c.icon === false || c.icon === 'off') $$('svg', el).forEach(function (s) { s.remove(); });
    if (noLayout) return;
    var target = el.tagName === 'SUMMARY' ? el.parentNode : el;
    var jf = c.align === 'left' ? 'start' : c.align === 'right' ? 'end' : 'center';
    if (c.widthMode === 'auto' || c.widthMode === 'fixed') {
      target.style.width = c.widthMode === 'fixed' && has(c.width) ? num(c.width, 200) + 'px' : 'auto';
      target.style.maxWidth = '100%';
      var pd = target.parentNode ? getComputedStyle(target.parentNode).display : '';
      if (pd.indexOf('grid') > -1) target.style.justifySelf = jf;
      else if (pd.indexOf('flex') > -1) target.parentNode.style.justifyContent = jf === 'start' ? 'flex-start' : jf === 'end' ? 'flex-end' : 'center';
      else { target.style.marginLeft = jf === 'start' ? '0' : 'auto'; target.style.marginRight = jf === 'end' ? '0' : 'auto'; }
      if (el.tagName === 'SUMMARY') el.style.width = c.widthMode === 'fixed' || c.widthMode === 'auto' ? '100%' : '';
    }
  }

  /* ======================================================================
     3. RENDER — one function per page type
     ====================================================================== */
  function pid(p) { return 'page-' + esc(p.id || p.type); }

  function renderHero(p) {
    var h = cfg.hero, g = h.groom || {}, b = h.bride || {}, G = cfg.guest || {};
    var gn = guestName();
    return '' +
      '<section class="hero" id="' + pid(p) + '" aria-label="Wedding invitation">' +
        '<h1 class="sr-only">' + esc(g.name) + ' &amp; ' + esc(b.name) + ' — Wedding Invitation</h1>' +
        '<img class="hero-bg" src="' + esc(cfg.assets.heroBackground) + '" alt="" decoding="async">' +
        '<div class="hero-text">' +
          (gn ? '<p class="hero-guest"' + A('heroInvocation', 'hero') + T('hero:guest', 'Guest greeting') + '>' + (G.prefix ? esc(G.prefix) + ' ' : '') + '<b>' + esc(gn) + '</b>' + esc(G.suffix || '') + '</p>' : '') +
          (h.invocationArabic ? '<p class="invoc-ar" lang="ar" dir="rtl"' + A('heroInvocation', 'hero') + T('hero:invocationArabic', 'Arabic / religious line') + '>' + esc(h.invocationArabic) + '</p>' : '') +
          (h.invocationText ? '<p class="invoc-en"' + A('heroInvocation', 'hero') + T('hero:invocationText', 'English line under it') + '>' + esc(h.invocationText) + '</p>' : '') +
          '<p class="blessing"' + A('heroBlessing', 'hero') + T('hero:blessing', 'Blessing paragraph') + '>' + (h.blessing || []).map(nl).join('<br>') + '</p>' +
          '<p class="hero-name"' + A('heroName', 'hero') + T('hero:groomName', 'Groom name (big)') + '>' + esc(g.name) + '</p>' +
          (g.line ? '<p class="hero-line"' + A('heroLine', 'hero') + T('hero:groomLine', 'Groom’s parents line') + '>' + nl(g.line) + '</p>' : '') +
          '<p class="hero-amp"' + A('heroAmp', 'hero') + T('hero:amp', '“&” symbol') + '>&amp;</p>' +
          '<p class="hero-name"' + A('heroName', 'hero') + T('hero:brideName', 'Bride name (big)') + '>' + esc(b.name) + '</p>' +
          (b.line ? '<p class="hero-line"' + A('heroLine', 'hero') + T('hero:brideLine', 'Bride’s parents line') + '>' + nl(b.line) + '</p>' : '') +
        '</div>' +
      '</section>';
  }

  function renderFamily(p) {
    var f = cfg.family;
    function names(arr) { return (arr || []).map(esc).join(' &amp;<br>'); }
    function cell(g, side, i) {
      if (!g) return '<div></div>';
      var sd = side === 'left' ? 'groom side' : 'bride side';
      return '<div' + A('familyGrand', 'fg' + i + side, side) + '>' +
               '<p class="fam-label"' + T('family:gp:' + i + ':' + side + ':label', 'Grandparents row ' + (i + 1) + ' · title (' + sd + ')') + '>' + esc(g.label) + '</p>' +
               '<p class="fam-names"' + T('family:gp:' + i + ':' + side + ':names', 'Grandparents row ' + (i + 1) + ' · names (' + sd + ')') + '>' + names(g.names) + '</p>' +
             '</div>';
    }
    var rows = (f.grandparents || []).map(function (row, i) {
      return '<div class="fam-row">' + cell(row[0], 'left', i) + cell(row[1], 'right', i) + '</div>';
    }).join('');

    function person(x, side) { return '<div' + A('familyName', 'fn' + side, side) + '><p class="fam-person"' + T('family:' + side + 'Name', (side === 'left' ? 'Groom' : 'Bride') + ' name (script)') + '>' + esc(x.name) + '</p></div>'; }
    function parents(x, side) {
      var w = side === 'left' ? 'groom' : 'bride', W = side === 'left' ? 'Groom' : 'Bride';
      return '<div' + A('familyParents', 'fp' + side, side) + '>' +
               '<p class="fam-label"' + T('family:' + w + 'Rel', W + ' · S/O – D/O label') + '>' + esc(x.relation) + '</p>' +
               '<p class="fam-names"' + T('family:' + w + 'Father', W + '’s father') + '>' + esc((x.parents || [])[0]) + '</p>' +
               '<p class="fam-amp"' + T('family:' + w + 'Amp', W + ' · “&” between parents') + '>&amp;</p>' +
               '<p class="fam-names"' + T('family:' + w + 'Mother', W + '’s mother') + '>' + esc((x.parents || [])[1]) + '</p>' +
             '</div>';
    }
    var groom = f.groom || {}, bride = f.bride || {};
    var sibs = f.siblings || [];
    var left = sibs.filter(function (s) { return s.side !== 'bride'; });
    var right = sibs.filter(function (s) { return s.side === 'bride'; });
    function sib(s, side, i) {
      if (!s) return '<div></div>';
      return '<div' + A('familySiblings', 'fs' + i + side, side) + '>' +
        '<p class="fam-label"' + T('family:sib:' + i + ':' + side + ':label', 'Sibling ' + side + ' ' + (i + 1) + ' · label') + '>' + esc(s.label) + '</p>' +
        '<p class="fam-names"' + T('family:sib:' + i + ':' + side + ':name', 'Sibling ' + side + ' ' + (i + 1) + ' · name') + '>' + esc(s.name) + '</p></div>';
    }
    var sibRows = '';
    for (var i = 0; i < Math.max(left.length, right.length); i++) {
      sibRows += '<div class="fam-row fam-strong" style="margin-top:6px">' + sib(left[i], 'left', i) + sib(right[i], 'right', i) + '</div>';
    }

    return '' +
      '<section class="family" id="' + pid(p) + '">' +
        '<img class="family-bg" src="' + esc(cfg.assets.familyBackground) + '" alt="" aria-hidden="true" loading="lazy" decoding="async">' +
        '<div class="family-veil"></div>' +
        '<div class="family-inner">' +
          '<div class="fam-head">' +
            '<p class="fam-kicker"' + A('familyHead', 'fhead') + T('family:kicker', 'Small heading') + '>' + esc(f.kicker) + '</p>' +
            '<h2 class="fam-title"' + A('familyHead', 'fhead') + T('family:title', 'Big heading') + '>' + esc(f.title) + '</h2>' +
            '<p class="fam-script"' + A('familyHead', 'fhead') + T('family:script', 'Script heading') + '>' + esc(f.script) + '</p>' +
          '</div>' +
          rows +
          '<div class="fam-row fam-couple">' +
            person(groom, 'left') +
            '<div class="fam-logo"><div class="fam-logo-in"' + A('familyMonogram', 'fmono') + '><img src="' + esc(cfg.assets.monogram) + '" alt="Monogram" loading="lazy"></div></div>' +
            person(bride, 'right') +
          '</div>' +
          '<div class="fam-row fam-strong">' + parents(groom, 'left') + parents(bride, 'right') + '</div>' +
          sibRows +
          '<div class="scroll-hint" aria-hidden="true">' +
            '<svg width="16" height="10" viewBox="0 0 16 10" style="transform:rotate(180deg)"><path d="M1 9L8 2L15 9" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' +
            '<p' + T('family:scrollHint', '“Scroll down” hint') + '>' + esc(f.scrollHint) + '</p>' +
            '<svg width="16" height="10" viewBox="0 0 16 10"><path d="M1 1L8 8L15 1" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function renderSave(p) {
    var s = cfg.saveTheDate;
    var cells = ['Days', 'Hours', 'Minutes', 'Seconds'].map(function (l) {
      return '<div class="cd-cell"><div class="cd-box"><span class="cd-num"' + T('save:cdNum', 'Countdown numbers') + ' data-cd="' + l.toLowerCase() + '">00</span></div>' +
             '<span class="cd-label"' + T('save:cd:' + l.toLowerCase(), 'Countdown label · ' + l) + '>' + l + '</span></div>';
    }).join('');
    return '' +
      '<section class="section-deco" id="' + pid(p) + '">' +
        '<span class="deco d1" aria-hidden="true">🌿</span><span class="deco d2" aria-hidden="true">🌸</span>' +
        '<span class="deco d3" aria-hidden="true">🌼</span><span class="deco d4" aria-hidden="true">🌿</span>' +
        '<div class="section-inner">' +
          '<div class="orn" aria-hidden="true">❀</div>' +
          '<div class="scratch" id="scratch"' + A('saveCard', 'save') + '>' +
            '<div class="scratch-under"><p class="scratch-label"' + T('save:label', 'Scratch card · small label') + '>' + esc(s.label) + '</p><p class="scratch-date"' + T('save:date', 'Scratch card · date') + '>' + esc(s.text) + '</p></div>' +
            '<canvas id="scratch-canvas" role="img" aria-label="Scratch card: scratch to reveal the date"></canvas>' +
          '</div>' +
          '<div class="countdown-wrap hidden" id="countdown-wrap" aria-hidden="true">' +
            '<div class="countdown" id="countdown">' + cells + '</div>' +
            '<p class="cd-done" id="cd-done"' + T('save:done', 'Countdown finished message') + ' hidden>' + esc(s.doneMessage) + '</p>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  /* ----- events: date + calendar helpers ----- */
  function dateParts(iso) {
    var p = String(iso).split('-').map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    if (isNaN(d)) return { weekday: '', day: '', month: '' };
    var fmt = function (o) { return new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: 'UTC' }, o)).format(d); };
    return { weekday: fmt({ weekday: 'long' }), day: p[2], month: fmt({ month: 'long' }) };
  }
  function fmt12(hhmm) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || ''));
    if (!m) return '';
    var h = +m[1], ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + m[2] + ' ' + ap;
  }
  function utcStamp(dt) { return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function evTimes(ev) {
    var off = cfg.events.timezoneOffset || '+05:30';
    var s = new Date(ev.date + 'T' + (ev.start || '10:00') + ':00' + off);
    var e = ev.end ? new Date(ev.date + 'T' + ev.end + ':00' + off) : new Date(s.getTime() + 3 * 3600 * 1000);
    if (isNaN(s) || isNaN(e)) return null;
    return { s: s, e: e };
  }
  function icsEscape(t) { return String(t).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
  function coupleLabel() { return ((cfg.hero.groom || {}).name || '') + ' & ' + ((cfg.hero.bride || {}).name || ''); }
  function eventTitle(ev) { return String(ev.title).replace(/\n/g, ' ') + ' — ' + coupleLabel(); }
  function eventVenue(ev) { return String(ev.venue || '').replace(/\n/g, ', '); }
  function icsHref(ev, t) {
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invitation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + ev.id + '-' + ev.date + '@' + (location.hostname || 'invitation'),
      'DTSTAMP:' + utcStamp(new Date()),
      'DTSTART:' + utcStamp(t.s), 'DTEND:' + utcStamp(t.e),
      'SUMMARY:' + icsEscape(eventTitle(ev)),
      'LOCATION:' + icsEscape(eventVenue(ev)),
      'DESCRIPTION:' + icsEscape(ev.directionsUrl ? 'Directions: ' + ev.directionsUrl : ''),
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    try { return URL.createObjectURL(new Blob([lines], { type: 'text/calendar;charset=utf-8' })); }
    catch (e) { return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines); }
  }
  function googleHref(ev, t) {
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(eventTitle(ev)) +
      '&dates=' + utcStamp(t.s) + '/' + utcStamp(t.e) +
      '&location=' + encodeURIComponent(eventVenue(ev)) +
      '&details=' + encodeURIComponent(ev.directionsUrl ? 'Directions: ' + ev.directionsUrl : '');
  }
  function activeEvents() { return (cfg.events.list || []).filter(function (e) { return e && e.enabled !== false; }); }

  /* ----- main "Save the Date in Google Calendar" button ----- */
  function stamp(local) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(String(local || ''));
    if (!m) return null;
    return m[1] + m[2] + m[3] + 'T' + (m[4] || '00') + (m[5] || '00') + '00';
  }
  function plusHours(local, h) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(String(local || ''));
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0) + h, +(m[5] || 0)));
    return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2) +
           'T' + ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2);
  }
  function calendarNote() {
    var c = cfg.calendar, parts = [];
    if (c.note) parts.push(c.note);
    if (c.includeSchedule !== false) {
      var lines = activeEvents().map(function (ev) {
        var dp = dateParts(ev.date);
        var when = dp.weekday + ', ' + dp.day + ' ' + dp.month + (ev.start ? ' · ' + fmt12(ev.start) : '');
        return '• ' + String(ev.title).replace(/\n/g, ' ') + ' — ' + when + (ev.venue ? ' · ' + eventVenue(ev) : '');
      });
      if (lines.length) parts.push('Events:\n' + lines.join('\n'));
    }
    return parts.join('\n\n');
  }
  function mainCalendarHref() {
    var c = cfg.calendar;
    var s = stamp(c.start);
    if (!c.enabled || !s) return '';
    var e = stamp(c.end) || stamp(plusHours(c.start, 4));
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(c.title || (coupleLabel() + ' — Wedding')) +
      '&dates=' + s + '/' + e +
      (c.timezone ? '&ctz=' + encodeURIComponent(c.timezone) : '') +
      '&details=' + encodeURIComponent(calendarNote()) +
      '&location=' + encodeURIComponent(c.venue || '');
  }

  var PIN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  var CAL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';

  function renderEvent(ev) {
    var th = ev.theme || {};
    var g = 'ev-' + (ev.id || Math.random().toString(36).slice(2));
    var X = 'ev:' + ev.id + ':';
    var nm = String(ev.title || '').replace(/\n/g, ' ');
    var dp = dateParts(ev.date);
    var t = evTimes(ev);
    var style = '--ev-text:' + esc(th.text || '#4f5f2c') + ';--ev-accent:' + esc(th.accent || '#a8225f') +
                ';--ev-title:' + esc(th.title || th.accent || '#a8225f') + ';--ev-badge:' + esc(th.badge || th.accent || '#a8225f') +
                ';--top:' + esc(th.top || '10%') + ';--side:' + esc(th.side || '6%') + ';--scale:' + esc(th.scale || 1);

    var timeBlock;
    if (ev.schedule && ev.schedule.length) {
      timeBlock = '<div class="ev-sched"' + A('eventSchedule', g) + T(X + 'schedule', nm + ' · programme list') + '>' + ev.schedule.map(function (r) {
        return '<div><span>' + esc(r[0]) + '</span><span>- ' + esc(r[1]) + '</span></div>';
      }).join('') + '</div>' +
        (ev.timeLines || []).map(function (l, i) { return '<p class="ev-after"' + A('eventTime', g) + T(X + 'after' + i, nm + ' · note under programme') + '>' + esc(l) + '</p>'; }).join('');
    } else if ((ev.timeLines || []).length) {
      timeBlock = '<p class="ev-time"' + A('eventTime', g) + T(X + 'time', nm + ' · time') + '>' + (ev.timeLines || []).map(esc).join('<br>') + '</p>';
    } else { timeBlock = ''; }

    var actions = '';
    if (ev.directionsUrl) {
      actions += '<a class="btn btn-primary"' + Bt('directions', ev) + ' href="' + esc(ev.directionsUrl) + '" target="_blank" rel="noopener noreferrer">' + PIN + ' ' + esc(btnLabel('directions', cfg.events.directionsLabel, ev)) + '</a>';
    }
    if (t && cfg.events.perEventCalendar !== false) {
      actions += '<details class="cal"><summary class="btn btn-ghost"' + Bt('eventCalendar', ev) + '>' + CAL + ' ' + esc(btnLabel('eventCalendar', cfg.events.calendarLabel, ev)) + '</summary>' +
        '<div class="cal-menu"><a href="' + esc(googleHref(ev, t)) + '" target="_blank" rel="noopener noreferrer">Google Calendar</a>' +
        '<a href="' + esc(icsHref(ev, t)) + '" download="' + esc(ev.id || 'event') + '.ics">Apple / Outlook</a></div></details>';
    }

    var overlay = ev.overlay !== false;
    return '' +
      '<article class="event' + (overlay ? '' : ' no-overlay') + '" style="' + style + '" data-eid="' + esc(ev.id) + '"' + A('eventCard', g) + '>' +
        '<div class="event-art">' +
          (ev.image ? '<img src="' + esc(ev.image) + '" alt="' + esc(overlay ? '' : ev.title) + '" loading="lazy" decoding="async">' : '') +
          (overlay ?
          '<div class="event-body">' +
            (ev.eyebrow ? '<p class="ev-eyebrow"' + A('eventEyebrow', g) + T(X + 'eyebrow', nm + ' · small line') + '>' + esc(ev.eyebrow) + '</p>' : '') +
            '<h3 class="ev-title"' + A('eventTitle', g) + T(X + 'title', nm + ' · title') + '>' + nl(ev.title) + '</h3>' +
            (ev.tagline ? '<p class="ev-tagline"' + A('eventTagline', g) + T(X + 'tagline', nm + ' · description') + '>' + nl(ev.tagline) + '</p>' : '') +
            (ev.date ? '<p class="ev-date"' + A('eventDate', g) + T(X + 'date', nm + ' · date row') + '><span>' + esc(dp.weekday) + '</span><b>' + dp.day + '</b><span>' + esc(dp.month) + '</span></p>' : '') +
            timeBlock +
            (ev.venue ? '<div class="ev-rule" aria-hidden="true"></div>' +
            '<p class="ev-venue"' + A('eventVenue', g) + T(X + 'venue', nm + ' · venue') + '>Venue: ' + nl(ev.venue) + '</p>' : '') +
            (ev.attire ? '<p class="ev-attire"' + A('eventAttire', g) + T(X + 'attire', nm + ' · dress code') + '>Attire: ' + esc(ev.attire) + '</p>' : '') +
          '</div>' : '') +
        '</div>' +
        (actions ? '<div class="event-actions">' + actions + '</div>' : '') +
      '</article>';
  }

  function renderEvents(p) {
    var e = cfg.events;
    var href = mainCalendarHref();
    var calBtn = href ? '<div class="gcal-wrap"' + A('eventsButton', 'evhead') + '><a class="btn btn-gcal"' + Bt('gcal') + ' href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + CAL + ' ' + esc(btnLabel('gcal', cfg.calendar.buttonLabel)) + '</a></div>' : '';
    return '' +
      '<section class="events" id="' + pid(p) + '">' +
        '<span class="deco d1" aria-hidden="true">🌿</span><span class="deco d2" aria-hidden="true">🌸</span>' +
        '<span class="deco d3" aria-hidden="true">🌼</span><span class="deco d4" aria-hidden="true">🌿</span>' +
        '<div style="position:relative">' +
          calBtn +
          '<h2 class="events-title"' + A('eventsHeading', 'evhead') + T('events:heading', 'Events section heading') + '>' + esc(e.heading) + '</h2>' +
          '<div class="orn" aria-hidden="true">❀</div>' +
          '<div class="event-list">' + activeEvents().map(renderEvent).join('') + '</div>' +
        '</div>' +
      '</section>';
  }

  function renderRsvp(p) {
    var r = cfg.rsvp;
    var n = String(r.whatsapp || '').replace(/\D/g, '');
    if (!n) return '';
    var gn = guestName();
    function link(msg) { return 'https://wa.me/' + n + '?text=' + encodeURIComponent(String(msg || '').replace(/\{guest\}/g, gn).replace(/\s+([,.!])/g, '$1').replace(/\s{2,}/g, ' ')); }
    return '<section class="rsvp" id="' + pid(p) + '"><h2' + A('rsvp', 'rsvp') + T('rsvp:heading', 'RSVP heading') + '>' + esc(r.heading) + '</h2><p' + A('rsvp', 'rsvp') + T('rsvp:text', 'RSVP text') + '>' + esc(r.text) + '</p>' +
           '<a class="btn btn-primary"' + A('rsvp', 'rsvp') + Bt('rsvp') + ' href="' + esc(link(r.message)) + '" target="_blank" rel="noopener noreferrer">' + esc(btnLabel('rsvp', r.buttonLabel)) + '</a>' +
           (r.declineEnabled ? '<a class="btn btn-ghost" style="margin-top:10px"' + A('rsvp', 'rsvp') + Bt('rsvpDecline') + ' href="' + esc(link(r.declineMessage)) + '" target="_blank" rel="noopener noreferrer">' + esc(btnLabel('rsvpDecline', r.declineLabel)) + '</a>' : '') +
           '</section>';
  }

  function renderClosing(p) {
    var c = cfg.closing;
    var hasVideo = !!c.video;
    var man = hasVideo ? ' data-manual="1"' : '';
    return '' +
      '<section class="closing ' + (hasVideo ? 'has-video' : 'no-video') + '" id="' + pid(p) + '" data-closing="1">' +
        (hasVideo ? '<video class="closing-video" src="' + esc(c.video) + '"' + (c.poster ? ' poster="' + esc(c.poster) + '"' : '') + ' muted playsinline webkit-playsinline preload="metadata"></video>' : '') +
        '<div class="closing-thanks">' +
          (c.background ? '<img class="closing-bg" src="' + esc(c.background) + '" alt="" aria-hidden="true" loading="lazy">' : '') +
          '<div class="closing-veil"></div>' +
          '<div class="closing-inner">' +
            (c.thankYou ? '<p class="ct-thanks"' + A('closingThanks', 'close') + man + T('closing:thankYou', 'Thank You (big word)') + '>' + esc(c.thankYou) + '</p>' : '') +
            (c.line ? '<p class="ct-line"' + A('closingLine', 'close') + man + T('closing:line', 'Line under Thank You') + '>' + esc(c.line) + '</p>' : '') +
            (c.signoff ? '<p class="ct-sign"' + A('closingSign', 'close') + man + T('closing:signoff', 'Family names (sign-off)') + '>' + esc(c.signoff) + '</p>' : '') +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function renderImagePage(p) {
    if (!p.src) return '';
    return '<section class="page-media' + (p.fit === 'screen' ? ' fit-screen' : '') + '" id="' + pid(p) + '">' +
           '<img' + A('customPage', 'pg-' + (p.id || 'x')) + ' src="' + esc(p.src) + '" alt="' + esc(p.alt || p.label || '') + '" loading="lazy" decoding="async"></section>';
  }

  function renderVideoPage(p) {
    if (!p.src) return '';
    return '<section class="page-media page-video' + (p.fit === 'screen' ? ' fit-screen' : '') + '" id="' + pid(p) + '">' +
           '<video class="pv"' + A('customPage', 'pg-' + (p.id || 'x')) + ' src="' + esc(p.src) + '"' + (p.poster ? ' poster="' + esc(p.poster) + '"' : '') +
           ' playsinline webkit-playsinline preload="metadata"' + (p.muted !== false ? ' muted' : '') + (p.loop ? ' loop' : '') + (p.controls ? ' controls' : '') +
           ' data-muted="' + (p.muted !== false ? 1 : 0) + '"></video></section>';
  }

  function renderGallery(p) {
    var imgs = (p.images || []).filter(function (i) { return i && i.src; });
    if (!imgs.length) return '';
    var gid = p.id || 'gal', g = 'gal-' + gid;
    return '<section class="gallery" id="' + pid(p) + '" style="--gal-ar:' + esc(p.aspect || '4 / 5') + '" data-autoplay="' + num(p.autoplay, 0) + '">' +
      (p.heading ? '<h2 class="gal-heading"' + A('gallery', g) + T('gal:' + gid + ':heading', (p.label || 'Gallery') + ' · heading') + '>' + esc(p.heading) + '</h2>' : '') +
      '<div class="gal-track"' + A('gallery', g) + '>' + imgs.map(function (im, i) {
        return '<figure class="gal-item"><img src="' + esc(im.src) + '" alt="' + esc(im.caption || '') + '" loading="lazy" decoding="async">' +
          (im.caption ? '<figcaption' + T('gal:' + gid + ':cap' + i, (p.label || 'Gallery') + ' · caption ' + (i + 1)) + '>' + esc(im.caption) + '</figcaption>' : '') + '</figure>';
      }).join('') + '</div>' +
      '<div class="gal-dots" aria-hidden="true">' + imgs.map(function (_, i) { return '<i' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join('') + '</div></section>';
  }

  var RENDER = { hero: renderHero, family: renderFamily, saveTheDate: renderSave, events: renderEvents, rsvp: renderRsvp, closing: renderClosing, image: renderImagePage, video: renderVideoPage, gallery: renderGallery };

  function renderAll() {
    var seen = {};
    return (cfg.pages || []).filter(function (p) {
      if (!p || p.enabled === false || !RENDER[p.type]) return false;
      if (['image', 'video', 'gallery'].indexOf(p.type) < 0) { if (seen[p.type]) return false; seen[p.type] = 1; }
      return true;
    }).map(function (p) { return RENDER[p.type](p); }).join('');
  }

  /* ======================================================================
     4. TEXT EDITOR LAYER — your own texts/buttons + per-text styling
     ====================================================================== */
  function blockById(id) { var L = cfg.blocks || []; for (var i = 0; i < L.length; i++) if (L[i] && L[i].id === id) return L[i]; return null; }
  function styleOfTid(tid) {
    if (!tid) return null;
    if (tid.indexOf('blk:') === 0) return blockById(tid.slice(4));
    return (cfg.textStyles || {})[tid] || null;
  }

  function applyTextStyle(el, s, isBlock) {
    if (!s) return;
    var st = el.style;
    if (s.font) { st.fontFamily = fontStack(s.font); ensureFont(s.font); }
    if (isBlock) { st.fontSize = 'calc(var(--k) * ' + (num(s.sizePx, 22) / 4.4).toFixed(3) + ')'; }
    else if (has(s.size)) { st.setProperty('--fs', String(num(s.size, 1))); }
    if (s.color) st.color = s.color;
    if (s.weight) st.fontWeight = s.weight;
    if (s.italic === 'on') st.fontStyle = 'italic'; else if (s.italic === 'off') st.fontStyle = 'normal';
    if (s.uppercase === 'on') st.textTransform = 'uppercase'; else if (s.uppercase === 'off') st.textTransform = 'none';
    if (s.underline === 'on') st.textDecoration = 'underline';
    if (s.align) st.textAlign = s.align;
    if (has(s.letterSpacing)) st.letterSpacing = num(s.letterSpacing, 0) + 'em';
    if (has(s.lineHeight)) st.lineHeight = String(num(s.lineHeight, 1.2));
    if (s.shadow && SHADOW_TEXT[s.shadow] && !(isBlock && el.classList.contains('btn'))) st.textShadow = SHADOW_TEXT[s.shadow];
    if (has(s.boxWidth)) { st.width = num(s.boxWidth, 80) + '%'; st.maxWidth = 'none'; }
    if (has(s.rotate) && num(s.rotate, 0) !== 0) st.rotate = num(s.rotate, 0) + 'deg';
    if (!isBlock && (num(s.x, 0) !== 0 || num(s.y, 0) !== 0)) {
      st.translate = 'calc(var(--k) * ' + num(s.x, 0) + ') calc(var(--k) * ' + num(s.y, 0) + ')';
    }
    if (s.hidden === true || s.hidden === 'on') el.classList.add(PREVIEW ? 'tx-ghost' : 'tx-hidden');
  }

  function setupBlocks() {
    (cfg.blocks || []).forEach(function (b) {
      if (!b || !b.id || b.enabled === false) return;
      var host = null, pg = String(b.page || '');
      if (pg.indexOf('event:') === 0) host = $('.event[data-eid="' + cssId(pg.slice(6)) + '"] .event-art', root);
      else if (pg === 'closing') host = $('.closing-thanks', root);
      else host = document.getElementById('page-' + pg);
      if (!host) return;
      var layer = null;
      for (var i = 0; i < host.children.length; i++) if (host.children[i].classList.contains('txt-layer')) layer = host.children[i];
      if (!layer) { layer = document.createElement('div'); layer.className = 'txt-layer'; host.appendChild(layer); }

      var isBtn = b.kind === 'button';
      var el = document.createElement(isBtn ? 'a' : 'div');
      el.className = 'blk' + (isBtn ? ' btn btn-primary is-btn' : '');
      el.setAttribute('data-bid', b.id);
      el.setAttribute('data-tid', 'blk:' + b.id);
      el.setAttribute('data-tl', (isBtn ? 'Button: ' : 'Text: ') + String(b.text || '').replace(/\s+/g, ' ').slice(0, 24));
      el.setAttribute('data-role', 'customText');
      el.setAttribute('data-group', 'blk-' + b.id);
      el.style.left = num(b.x, 50) + '%';
      el.style.top = num(b.y, 50) + '%';
      el.innerHTML = nl(b.text || '');
      if (isBtn) {
        var url = String(b.url || '').trim();
        if (url === 'share') { el.setAttribute('href', '#'); el.setAttribute('data-action', 'share'); }
        else {
          el.setAttribute('href', url || '#');
          if (/^https?:/i.test(url)) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
        }
      }
      layer.appendChild(el);
    });
  }

  function applyTexts() {
    var S = cfg.textStyles || {};
    $$('[data-tid]', root).forEach(function (el) {
      var tid = el.getAttribute('data-tid');
      var isBlock = el.hasAttribute('data-bid');
      var s = isBlock ? blockById(el.getAttribute('data-bid')) : S[tid];
      if (!s) return;
      if (!isBlock && typeof s.text === 'string' && s.text !== '' && tid !== 'save:cdNum') {
        el.innerHTML = nl(s.text);
      }
      var isBtnBlock = isBlock && el.classList.contains('btn');
      if (isBtnBlock) applyBtnStyle(el, s, true);
      applyTextStyle(el, s, isBlock);
      if (isBtnBlock) {                       // button blocks size their text in px ("fontSize"), not "sizePx"
        el.style.fontSize = has(s.fontSize) ? num(s.fontSize, 14) + 'px' : '';
        if (has(s.width)) { el.style.width = num(s.width, 200) + 'px'; el.style.maxWidth = '92%'; }
      }
    });
  }

  function applyButtons() {
    $$('[data-btn]', root).forEach(function (el) {
      var id = el.getAttribute('data-btn'), evId = el.getAttribute('data-ev'), ev = null;
      if (evId) (cfg.events.list || []).forEach(function (e) { if (e && e.id === evId) ev = e; });
      applyBtnStyle(el, btnCfg(id, ev));
    });
    // fixed buttons (scroll cue, tap to open, music)
    var cue = $('#scroll-cue'), pill = $('.cta-pill'), mb = $('#music-btn'), fxui = $('.fx-ui');
    [cue, pill, mb].forEach(function (b) { if (b) b.removeAttribute('style'); });
    if (fxui) { fxui.style.alignItems = ''; fxui.style.justifyContent = ''; }
    if (cue) {
      var cc = btnCfg('scrollCue');
      var tx = $('#scroll-cue-text'); if (tx) tx.textContent = has(cc.text) ? cc.text : ((cfg.scrollCue && cfg.scrollCue.text) || 'Scroll Down');
      applyBtnStyle(cue, cc, true);
      if (cc.hidden === true || cc.hidden === 'on') cue.style.display = 'none';
    }
    if (pill) {
      var pc = btnCfg('tapOpen');
      var it = $('#intro-text'); if (it) it.textContent = has(pc.text) ? pc.text : ((cfg.intro && cfg.intro.tapText) || 'Tap to Open');
      applyBtnStyle(pill, pc, true);
    }
    if (mb) {
      var mc = btnCfg('music');
      if (has(mc.size)) { mb.style.width = mb.style.height = num(mc.size, 44) + 'px'; }
      if (mc.bg) mb.style.background = mc.bg;
      if (mc.color) mb.style.color = mc.color;
      if (mc.hidden === true || mc.hidden === 'on') mb.style.display = 'none';
      if (fxui) {
        var corner = mc.corner || 'bottom-right';
        fxui.style.alignItems = /top/.test(corner) ? 'flex-start' : 'flex-end';
        fxui.style.justifyContent = /left/.test(corner) ? 'flex-start' : 'flex-end';
        if (/top/.test(corner)) fxui.style.paddingTop = '20px'; else fxui.style.paddingTop = '';
      }
    }
  }

  /* share / copy-link action buttons */
  var toastTimer;
  function smallToast(msg) {
    var t = $('#mini-toast');
    if (!t) { t = document.createElement('div'); t.id = 'mini-toast'; t.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:rgba(30,15,20,.92);color:#fff;padding:10px 16px;border-radius:12px;font:600 13px system-ui;z-index:120;transition:opacity .3s;opacity:0;pointer-events:none;max-width:80%;text-align:center'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1'; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.style.opacity = '0'; }, 2200);
  }
  root.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-action="share"]');
    if (!a || (PREVIEW && editMode)) return;
    e.preventDefault();
    var url = location.href.split('?')[0], title = document.title;
    if (navigator.share) navigator.share({ title: title, text: title, url: url }).catch(function () {});
    else if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(function () { smallToast('Link copied!'); });
    else smallToast(url);
  });

  /* ======================================================================
     5. TEXT ANIMATIONS
     ====================================================================== */
  function splitText(el, type, speed) {
    var frag = document.createDocumentFragment(), n = 0;
    var label = el.textContent;
    function addWord(w, parent) {
      var wrap = document.createElement('span'); wrap.className = 'w'; wrap.setAttribute('aria-hidden', 'true');
      if (type === 'words') {
        var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', n++); s.textContent = w; wrap.appendChild(s);
      } else {
        for (var i = 0; i < w.length; i++) {
          var c = document.createElement('span'); c.className = 'ch'; c.style.setProperty('--i', n++); c.textContent = w.charAt(i); wrap.appendChild(c);
        }
      }
      parent.appendChild(wrap);
    }
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
          else addWord(part, frag);
        });
      } else { frag.appendChild(node.cloneNode(true)); }
    });
    el.textContent = '';
    el.setAttribute('aria-label', label);
    el.appendChild(frag);
    el.style.setProperty('--step', ((type === 'letters' ? 0.04 : 0.14) / speed).toFixed(3) + 's');
  }

  function setupAnimations(instant) {
    if (animIO) { animIO.disconnect(); animIO = null; }
    pendingAnim = [];
    var AN = cfg.animation || {};
    var gsp = Math.max(0.1, num(AN.speed, 1));
    var counters = {};

    $$('[data-role]', root).forEach(function (el) {
      var role = el.getAttribute('data-role'), group = el.getAttribute('data-group') || '';
      var rc = Object.assign({}, (AN.roles && AN.roles[role]) || {});
      var ts = styleOfTid(el.getAttribute('data-tid'));
      if (ts && ts.anim) ['type', 'speed', 'delay'].forEach(function (k) { if (has(ts.anim[k])) rc[k] = ts.anim[k]; });
      var type = rc.type || 'fade-up';
      if (AN.enabled === false || reduceMotion || type === 'none' || instant || el.classList.contains('tx-hidden')) { el.classList.add('anim-off'); return; }
      if (type === 'side-in') type = el.getAttribute('data-side') === 'right' ? 'slide-right' : 'slide-left';
      var sp = gsp * (num(rc.speed, 1) > 0 ? num(rc.speed, 1) : 1);
      var idx = counters[group] || 0; counters[group] = idx + 1;
      var delay = num(rc.delay, 0) + idx * num(AN.stagger, 0.16) / gsp;
      el.classList.add('anim');
      el.setAttribute('data-anim', type);
      el.style.setProperty('--dur', (0.9 / sp).toFixed(3) + 's');
      el.style.setProperty('--delay', delay.toFixed(3) + 's');
      if (type === 'letters' || type === 'words') splitText(el, type, sp);
      if (!el.hasAttribute('data-manual')) pendingAnim.push(el);
    });

    if (!pendingAnim.length) return;
    if (!('IntersectionObserver' in window)) { pendingAnim.forEach(function (el) { el.classList.add('is-in'); }); pendingAnim = []; return; }
    animIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target;
        if (en.isIntersecting) {
          el.classList.add('is-in');
          if (!AN.replay) animIO.unobserve(el);
        } else if (AN.replay) { el.classList.remove('is-in'); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    kickAnimations();
  }
  function kickAnimations() {
    if (!animReady || !animIO) return;
    pendingAnim.forEach(function (el) { animIO.observe(el); });
    pendingAnim = [];
  }

  /* ======================================================================
     6. PETALS (7 types)
     ====================================================================== */
  var PETAL_EMOJI = { flower: ['🌸'], rose: ['🌹'], sparkle: ['✨'], leaf: ['🌿', '🍃'] };
  var PETAL_GRADIENTS = [
    'linear-gradient(135deg,#fce7f3,#f472b6)', 'linear-gradient(135deg,#fbcfe8,#fb7185)', 'linear-gradient(135deg,#ffe4e6,#f472b6)',
    'linear-gradient(135deg,#fdf2f8,#f9a8d4)', 'linear-gradient(135deg,#fecdd3,#fda4af)', 'linear-gradient(135deg,#fff1f2,#f472b6)'
  ];
  function setupPetals() {
    var box = $('#petals');
    if (!box) return;
    box.innerHTML = '';
    var P = cfg.petals || {};
    if (!P.enabled || reduceMotion) return;
    var size = num(P.size, 1) > 0 ? num(P.size, 1) : 1, speed = num(P.speed, 1) > 0 ? num(P.speed, 1) : 1;
    var type = P.type || 'petal';
    var emojis = PETAL_EMOJI[type] || (type === 'custom-emoji' ? String(P.emoji || '🌺').split(/\s+/).filter(Boolean) : null);
    var useImage = type === 'custom-image' && P.image;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < (P.count || 32); i++) {
      var s;
      if (useImage) {
        s = document.createElement('img'); s.src = P.image; s.alt = '';
        var iw = rnd(14, 26) * size; s.style.width = iw + 'px'; s.style.height = 'auto';
      } else if (emojis && emojis.length) {
        s = document.createElement('span'); s.textContent = emojis[i % emojis.length];
        s.style.fontSize = (rnd(13, 24) * size) + 'px'; s.style.lineHeight = '1';
      } else {
        s = document.createElement('span');
        var w = rnd(3, 6.5) * size;
        s.style.width = w + 'px'; s.style.height = (w * rnd(1.15, 1.5)) + 'px';
        s.style.background = PETAL_GRADIENTS[i % PETAL_GRADIENTS.length];
        s.style.borderRadius = i % 2 === 0 ? '150% 0 150% 50%' : '50% 150% 50% 150%';
      }
      s.className = 'petal' + (emojis || useImage ? ' petal-icon' : '');
      s.style.left = rnd(0, 100) + '%';
      s.style.animationDuration = (rnd(13, 28) / speed) + 's';
      s.style.animationDelay = rnd(0, 10) + 's';
      frag.appendChild(s);
    }
    box.appendChild(frag);
  }

  /* ======================================================================
     7. CONFETTI (fully configurable)
     ====================================================================== */
  function confetti() {
    var C = cfg.confetti || {};
    if (C.enabled === false || reduceMotion) return;
    var cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100';
    document.body.appendChild(cv);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = window.innerWidth * dpr; cv.height = window.innerHeight * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    var colors = (C.colors && C.colors.length) ? C.colors : ['#d4a574', '#f5d199', '#c75a6b', '#7a8a6a', '#ffffff'];
    var shapes = (C.shapes && C.shapes.length) ? C.shapes : ['square', 'circle'];
    var emoji = (C.emoji && C.emoji.length) ? C.emoji : ['🎉'];
    var count = Math.max(1, Math.round(num(C.particleCount, 120)));
    var spread = num(C.spread, 90) * Math.PI / 180, vel = num(C.startVelocity, 45), grav = num(C.gravity, 3);
    var ticks = Math.max(30, Math.round(num(C.duration, 200))), scale = num(C.size, 1);
    var parts = [], alive = true;

    function burst(b) {
      for (var i = 0; i < count; i++) {
        var shape = shapes[Math.floor(Math.random() * shapes.length)];
        parts.push({
          x: window.innerWidth * num(b.x, 0.5), y: window.innerHeight * num(b.y, 0.4),
          a: -Math.PI / 2 + (0.5 * spread - Math.random() * spread),
          v: vel * 0.5 + Math.random() * vel,
          size: rnd(5, 9) * scale, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
          col: colors[i % colors.length], shape: shape,
          em: shape === 'emoji' ? emoji[Math.floor(Math.random() * emoji.length)] : '', t: 0
        });
      }
    }
    (C.bursts && C.bursts.length ? C.bursts : [{ x: 0.5, y: 0.4, delay: 0 }]).forEach(function (b) {
      if (num(b.delay, 0) > 0) setTimeout(function () { if (alive) burst(b); }, b.delay); else burst(b);
    });

    function heart(s) {
      ctx.beginPath(); ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(-s * 0.7, -s * 0.1, -s * 0.45, -s * 0.7, 0, -s * 0.28);
      ctx.bezierCurveTo(s * 0.45, -s * 0.7, s * 0.7, -s * 0.1, 0, s * 0.35); ctx.fill();
    }
    function star(s) {
      ctx.beginPath();
      for (var i = 0; i < 10; i++) {
        var r = i % 2 === 0 ? s * 0.55 : s * 0.22, ang = Math.PI / 5 * i - Math.PI / 2;
        ctx[i ? 'lineTo' : 'moveTo'](Math.cos(ang) * r, Math.sin(ang) * r);
      }
      ctx.closePath(); ctx.fill();
    }

    var started = Date.now();
    (function frame() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      parts = parts.filter(function (p) {
        p.x += Math.cos(p.a) * p.v; p.y += Math.sin(p.a) * p.v + grav; p.v *= 0.9; p.rot += p.vr; p.t++;
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - p.t / ticks); ctx.fillStyle = p.col;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, 6.283); ctx.fill(); }
        else if (p.shape === 'star') star(p.size * 1.6);
        else if (p.shape === 'heart') heart(p.size * 1.6);
        else if (p.shape === 'emoji') { ctx.font = (p.size * 2) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.em, 0, 0); }
        else ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        ctx.restore();
        return p.t < ticks;
      });
      if (parts.length || Date.now() - started < 1500) requestAnimationFrame(frame); else { alive = false; cv.remove(); }
    })();
  }

  /* ======================================================================
     8. SCRATCH CARD — reveals with only a light scratch
     ====================================================================== */
  function setupScratch() {
    var cv = $('#scratch-canvas'), wrap = $('#scratch');
    if (!cv || !wrap) return;
    var S = cfg.scratch || {};
    var needPct = Math.max(0.5, num(S.revealPercent, 5)) / 100;
    var needSwipes = Math.max(1, Math.round(num(S.swipesToReveal, 3)));
    var brush = Math.max(8, num(S.brushSize, 34));
    var fadeMs = Math.max(0, num(S.fadeMs, 500));
    var img = new Image(), ctx = null, drawing = false, touched = false, done = false, last = null, swipes = 0, moved = 0, baseline = 0, lastCheck = 0;
    img.src = cfg.assets.scratchCard;

    function cleared() {
      var d = ctx.getImageData(0, 0, cv.width, cv.height).data, c = 0, n = 0;
      for (var i = 3; i < d.length; i += 160) { n++; if (d[i] < 60) c++; }
      return c / n;
    }
    function paint() {
      var r = wrap.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#e8c872'; ctx.fillRect(0, 0, r.width, r.height);
      if (img.complete && img.naturalWidth) ctx.drawImage(img, 0, 0, r.width, r.height);
      try { baseline = cleared(); } catch (e) { baseline = 0; }
    }
    img.onload = function () { if (!touched) paint(); };
    paint();
    var onResize = function () { if (!touched && !done) paint(); };
    window.addEventListener('resize', onResize);
    cleanups.push(function () { window.removeEventListener('resize', onResize); });

    function scratchAt(e) {
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = brush * 2;
      ctx.beginPath();
      if (last) { ctx.moveTo(last.x, last.y); ctx.lineTo(x, y); ctx.stroke(); moved += Math.abs(x - last.x) + Math.abs(y - last.y); }
      else { ctx.arc(x, y, brush, 0, Math.PI * 2); ctx.fill(); }
      last = { x: x, y: y };
    }
    function coverageOk() {
      try { return (cleared() - baseline) / Math.max(0.01, 1 - baseline) >= needPct; }
      catch (err) { return moved > 120; }
    }
    function reveal() {
      if (done) return;
      done = true;
      cv.style.transition = 'opacity ' + fadeMs + 'ms ease';
      cv.style.opacity = '0';
      cv.style.pointerEvents = 'none';
      setTimeout(function () { cv.style.display = 'none'; }, fadeMs + 50);
      confetti();
      var cw = $('#countdown-wrap');
      if (cw) { cw.classList.remove('hidden'); cw.setAttribute('aria-hidden', 'false'); }
    }
    cv.addEventListener('pointerdown', function (e) {
      if (done || !ctx || (PREVIEW && editMode)) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
      drawing = true; touched = true; last = null; scratchAt(e);
    });
    cv.addEventListener('pointermove', function (e) {
      if (!drawing || done) return;
      e.preventDefault(); scratchAt(e);
      var now = Date.now();
      if (now - lastCheck > 90) { lastCheck = now; if (coverageOk()) reveal(); }
    });
    function end() {
      if (!drawing) return;
      drawing = false; last = null; swipes++;
      if (done) return;
      if (coverageOk() || swipes >= needSwipes) reveal();
    }
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    cv.addEventListener('pointerleave', end);
    wrap.__reveal = reveal;
  }

  /* ======================================================================
     9. COUNTDOWN
     ====================================================================== */
  function setupCountdown() {
    var box = $('#countdown');
    if (!box) return;
    var target = Date.parse(cfg.saveTheDate.countdownTo);
    if (isNaN(target)) { box.style.display = 'none'; return; }
    var els = {};
    ['days', 'hours', 'minutes', 'seconds'].forEach(function (k) { els[k] = $('[data-cd="' + k + '"]'); });
    function pad(n) { return String(n).padStart(2, '0'); }
    var timer;
    function tick() {
      var ms = Math.max(0, target - Date.now());
      els.days.textContent    = pad(Math.floor(ms / 864e5));
      els.hours.textContent   = pad(Math.floor(ms / 36e5 % 24));
      els.minutes.textContent = pad(Math.floor(ms / 6e4 % 60));
      els.seconds.textContent = pad(Math.floor(ms / 1e3 % 60));
      if (ms === 0) {
        clearInterval(timer);
        var d = $('#cd-done'); if (d && d.textContent.trim()) d.hidden = false;
      }
    }
    tick(); timer = setInterval(tick, 1000);
    cleanups.push(function () { clearInterval(timer); });
  }

  /* ======================================================================
     10. MUSIC
     ====================================================================== */
  var audio = $('#bgm'), musicBtn = $('#music-btn');
  var musicStarted = false, userMuted = false, ducked = false;
  function setMutedUI(m) {
    if (!musicBtn) return;
    musicBtn.classList.toggle('is-muted', m);
    musicBtn.setAttribute('aria-label', m ? 'Unmute background music' : 'Mute background music');
  }
  function startMusic() {
    var M = cfg.music || {};
    if (!M.enabled || !audio || musicStarted) return;
    if (PREVIEW && !params.has('intro')) return;
    audio.src = M.file;
    audio.loop = true;
    audio.volume = num(M.volume, 0.45);
    musicBtn.hidden = false;
    musicStarted = true;
    var p = audio.play();
    if (p && p.then) p.then(function () { setMutedUI(false); }).catch(function () { userMuted = true; setMutedUI(true); });
    else setMutedUI(false);
  }
  if (musicBtn) {
    musicBtn.addEventListener('click', function () {
      if (!musicStarted) return;
      userMuted = !userMuted;
      if (userMuted) audio.pause(); else audio.play().catch(function () {});
      setMutedUI(userMuted);
    });
  }
  document.addEventListener('visibilitychange', function () {
    if (!musicStarted || userMuted || ducked || !audio) return;
    if (document.hidden) audio.pause(); else audio.play().catch(function () {});
  });
  function duckMusic(on) {
    if (!musicStarted || userMuted) return;
    ducked = on;
    if (on) audio.pause(); else audio.play().catch(function () {});
  }

  /* ======================================================================
     11. CLOSING PAGE (door-closing video → Thank You)
     ====================================================================== */
  function setupClosing() {
    var sec = $('[data-closing]');
    if (!sec) return;
    var C = cfg.closing || {};
    var video = $('video', sec), manual = $$('[data-manual]', sec);
    var revealed = false, played = false, timer = null;

    function reveal() {
      if (revealed) return;
      revealed = true; clearTimeout(timer);
      sec.classList.add('done');
      manual.forEach(function (el) { el.classList.add('is-in'); });
    }
    function reset() {
      revealed = false; sec.classList.remove('done');
      manual.forEach(function (el) { el.classList.remove('is-in'); });
    }
    if (!video) return;

    video.addEventListener('ended', reveal);
    function play() {
      played = true;
      if (revealed) reset();
      try { video.currentTime = 0; } catch (e) { /* ignore */ }
      var p = video.play();
      if (p && p.catch) p.catch(reveal);
      clearTimeout(timer);
      timer = setTimeout(reveal, ((video.duration || 8) + 3) * 1000);
    }
    if (!('IntersectionObserver' in window)) { reveal(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && (!played || (C.replayEachTime && revealed))) play();
      });
    }, { threshold: 0.6 });
    io.observe(sec);
    cleanups.push(function () { io.disconnect(); clearTimeout(timer); });
    sec.__play = play; sec.__reveal = reveal;
  }

  /* ======================================================================
     12. CUSTOM VIDEO PAGES + GALLERY
     ====================================================================== */
  function setupVideos() {
    $$('video.pv').forEach(function (v) {
      var withSound = v.getAttribute('data-muted') === '0';
      v.muted = !withSound;
      if (withSound) {
        v.addEventListener('play', function () { duckMusic(true); });
        v.addEventListener('pause', function () { duckMusic(false); });
        v.addEventListener('ended', function () { duckMusic(false); });
      }
      if (!('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var p = v.play();
            if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); });
          } else { v.pause(); }
        });
      }, { threshold: 0.5 });
      io.observe(v);
      cleanups.push(function () { io.disconnect(); });
    });
  }

  function setupGalleries() {
    $$('.gallery', root).forEach(function (g) {
      var track = $('.gal-track', g), dots = $$('.gal-dots i', g), items = $$('.gal-item', g);
      if (!track || !items.length) return;
      function idx() { var w = items[0].getBoundingClientRect().width + 12; return Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / w))); }
      function mark() { var i = idx(); dots.forEach(function (d, k) { d.classList.toggle('on', k === i); }); }
      track.addEventListener('scroll', mark, { passive: true });
      var secs = num(g.getAttribute('data-autoplay'), 0);
      if (secs > 0 && !reduceMotion && !PREVIEW) {
        var t = setInterval(function () {
          var r = g.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;
          var i = idx() + 1, w = items[0].getBoundingClientRect().width + 12;
          track.scrollTo({ left: i >= items.length ? 0 : i * w, behavior: 'smooth' });
        }, secs * 1000);
        cleanups.push(function () { clearInterval(t); });
      }
    });
  }

  /* ======================================================================
     13. SCROLL CUE (the "Scroll Down" button on the first screen)
     ====================================================================== */
  var cueBtn = $('#scroll-cue');
  function updateCue() {
    if (!cueBtn || !cfg) return;
    var hid = btnCfg('scrollCue').hidden;
    var on = cfg.scrollCue && cfg.scrollCue.enabled && !(hid === true || hid === 'on') && !document.body.classList.contains('locked') && window.scrollY < 60 &&
             document.documentElement.scrollHeight > window.innerHeight + 120;
    document.body.classList.toggle('cue-on', !!on);
  }
  if (cueBtn) {
    window.addEventListener('scroll', updateCue, { passive: true });
    window.addEventListener('resize', updateCue);
    cueBtn.addEventListener('click', function () {
      var next = root.children[1];
      var y = next ? next.getBoundingClientRect().top + window.scrollY : window.innerHeight * 0.9;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  }

  /* ======================================================================
     14. MOUNT / UNMOUNT
     ====================================================================== */
  function teardown() {
    while (cleanups.length) { try { cleanups.pop()(); } catch (e) { /* ignore */ } }
    $$('video', root).forEach(function (v) { try { v.pause(); } catch (e) { /* ignore */ } });
  }

  function mount(user, opts) {
    opts = opts || {};
    teardown();
    cfg = merge(window.INVITATION_DEFAULTS || {}, user || {});
    setupCustomFonts();
    applyTheme();
    root.innerHTML = renderAll();
    if (cfg.meta && cfg.meta.title) document.title = cfg.meta.title;
    setupBlocks();
    applyTexts();
    applyButtons();
    setupPetals();
    setupScratch();
    setupCountdown();
    setupClosing();
    setupVideos();
    setupGalleries();
    setupAnimations(!!opts.instant);
    updateCue();
    if (PREVIEW) { document.body.classList.toggle('pv-edit', editMode); markSelected(); setTimeout(sendTexts, 30); }
  }

  /* ======================================================================
     15. INTRO GATE
     ====================================================================== */
  function openedInvitation() {
    animReady = true;
    document.body.classList.remove('locked');
    kickAnimations();
    updateCue();
  }

  function initIntro() {
    var wrap = $('#intro-wrap'), gate = $('#intro'), video = $('#intro-video');
    var I = cfg.intro || {};
    if (!SHOW_INTRO || I.enabled === false || !wrap || !gate) {
      if (wrap) wrap.remove();
      openedInvitation();
      if (!PREVIEW) {
        var once = function () { startMusic(); document.removeEventListener('pointerdown', once); };
        document.addEventListener('pointerdown', once);
      }
      return;
    }
    if (video) {
      if (I.video) video.src = I.video;
      if (I.poster) video.poster = I.poster;
    }
    var started = false, opened = false, openAt = num(I.openAtSeconds, 5);
    function open() {
      if (opened) return;
      opened = true;
      window.scrollTo(0, 0);
      wrap.classList.add('hiding');
      openedInvitation();
      setTimeout(function () { wrap.remove(); }, 700);
    }
    function start() {
      if (started) return;
      started = true;
      startMusic();
      gate.classList.add('playing');
      if (!video || !I.video) { open(); return; }
      try { video.currentTime = 0; } catch (e) { /* ignore */ }
      var p = video.play();
      if (p && p.catch) p.catch(open);
      setTimeout(open, 12000);
    }
    gate.addEventListener('click', start);
    gate.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } });
    if (video) {
      video.addEventListener('timeupdate', function () { if (video.currentTime >= openAt) open(); });
      video.addEventListener('ended', open);
    }
  }

  /* ======================================================================
     16. PREVIEW-ONLY: click to select, drag to move, talk to the editor
     ====================================================================== */
  function toEditor(msg) {
    if (window.parent && window.parent !== window) { msg.source = 'invitation-preview'; window.parent.postMessage(msg, '*'); }
  }
  function sendTexts() {
    var seen = {}, list = [];
    $$('[data-tid]', root).forEach(function (el) {
      var tid = el.getAttribute('data-tid');
      if (seen[tid]) return; seen[tid] = 1;
      var sec = el.closest('section');
      var ev = el.closest('.event');
      list.push({
        tid: tid, label: el.getAttribute('data-tl') || tid,
        page: sec ? sec.id.replace(/^page-/, '') : '',
        eventId: ev ? ev.getAttribute('data-eid') : '',
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        hidden: el.classList.contains('tx-ghost'),
        block: el.hasAttribute('data-bid'),
        kind: el.classList.contains('btn') ? 'button' : 'text'
      });
    });
    toEditor({ type: 'texts', list: list });
  }
  function markSelected() {
    $$('.pv-sel').forEach(function (e) { e.classList.remove('pv-sel'); });
    if (!selTid) return;
    $$('[data-tid]').forEach(function (e) { if (e.getAttribute('data-tid') === selTid) e.classList.add('pv-sel'); });
  }
  function kPx(el) {
    var t = document.createElement('div');
    t.style.cssText = 'position:absolute;visibility:hidden;width:calc(var(--k) * 100);height:0';
    (el.parentNode || document.body).appendChild(t);
    var w = t.getBoundingClientRect().width / 100;
    t.remove();
    return w || 4;
  }
  function plainText(el) {
    var out = '';
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3) out += n.nodeValue;
      else if (n.nodeName === 'BR') out += '\n';
      else if (n.nodeType === 1) out += plainText(n) + (n.nodeName === 'DIV' ? '\n' : '');
    });
    return out;
  }
  function selectEl(el) {
    var tid = el.getAttribute('data-tid'), btn = el.getAttribute('data-btn');
    if (tid) {
      selTid = tid; markSelected();
      var cs = getComputedStyle(el);
      toEditor({ type: 'select', tid: tid, label: el.getAttribute('data-tl') || tid, text: plainText(el).replace(/^\s+|\s+$/g, ''),
        block: el.hasAttribute('data-bid'),
        css: { fontFamily: cs.fontFamily, fontSize: cs.fontSize, color: cs.color, fontWeight: cs.fontWeight } });
    } else if (btn) {
      toEditor({ type: 'select-button', id: btn, ev: el.getAttribute('data-ev') || '' });
    }
  }
  function editTarget(t) { return t && t.closest ? (t.closest('[data-tid]') || t.closest('[data-btn]')) : null; }

  if (PREVIEW) {
    var drag = null, swallow = false;
    document.addEventListener('pointerdown', function (e) {
      if (!editMode || e.button > 0) return;
      var el = editTarget(e.target);
      if (!el) return;
      var tid = el.getAttribute('data-tid'), s = styleOfTid(tid) || {};
      var blk = el.hasAttribute('data-bid');
      drag = { el: el, x: e.clientX, y: e.clientY, moved: false, tid: tid, blk: blk, bx: blk ? 0 : num(s.x, 0), by: blk ? 0 : num(s.y, 0) };
    }, true);
    document.addEventListener('pointermove', function (e) {
      if (!drag || !drag.tid) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      drag.moved = true; e.preventDefault();
      drag.dx = dx; drag.dy = dy;
      drag.el.style.translate = drag.blk
        ? 'calc(-50% + ' + dx + 'px) calc(-50% + ' + dy + 'px)'
        : 'calc(var(--k) * ' + drag.bx + ' + ' + dx + 'px) calc(var(--k) * ' + drag.by + ' + ' + dy + 'px)';
    }, true);
    document.addEventListener('pointerup', function () {
      if (!drag) return;
      var d = drag; drag = null;
      if (d.moved) {
        swallow = true; setTimeout(function () { swallow = false; }, 50);
        if (d.blk) {
          var layer = d.el.parentNode.getBoundingClientRect();
          toEditor({ type: 'drag', tid: d.tid, block: true, dx: d.dx / layer.width * 100, dy: d.dy / layer.height * 100 });
        } else {
          var k = kPx(d.el);
          toEditor({ type: 'drag', tid: d.tid, block: false, dx: d.dx / k, dy: d.dy / k });
        }
        selectEl(d.el);
      } else { selectEl(d.el); }
    }, true);
    document.addEventListener('click', function (e) {
      if (!editMode) return;
      if (swallow || editTarget(e.target)) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* ======================================================================
     17. START
     ====================================================================== */
  var userConfig = window.INVITATION;
  if (!userConfig) {
    root.innerHTML = '<p style="padding:40px;text-align:center">js/config.js is missing or has an error.</p>';
    document.body.classList.remove('locked');
    var w0 = $('#intro-wrap'); if (w0) w0.remove();
    return;
  }
  mount(userConfig, { instant: PREVIEW && !params.has('intro') });
  initIntro();

  if (PREVIEW) {
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || d.source !== 'invitation-editor') return;
      if (d.type === 'config') {
        if (d.guestName !== undefined) guestFromEditor = d.guestName || null;
        var y = window.scrollY;
        mount(d.config, { instant: !d.animate });
        window.scrollTo(0, y);
      } else if (d.type === 'replay') {
        mount(d.config || userConfig, { instant: false });
        window.scrollTo(0, 0);
      } else if (d.type === 'scrollTo') {
        var el = document.getElementById('page-' + d.id);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
      } else if (d.type === 'select-tid') {
        selTid = d.tid || ''; markSelected();
        var te = $$('[data-tid]').filter(function (x) { return x.getAttribute('data-tid') === selTid; })[0];
        if (te && d.scroll !== false) te.scrollIntoView({ block: 'center', behavior: 'smooth' });
        if (te && d.scroll !== false) setTimeout(function () { toEditor({ type: 'select', tid: selTid, label: te.getAttribute('data-tl') || selTid, text: plainText(te).replace(/^\s+|\s+$/g, ''), block: te.hasAttribute('data-bid'), css: (function () { var cs = getComputedStyle(te); return { fontFamily: cs.fontFamily, fontSize: cs.fontSize, color: cs.color, fontWeight: cs.fontWeight }; })() }); }, 50);
      } else if (d.type === 'mode') {
        editMode = !!d.edit; document.body.classList.toggle('pv-edit', editMode);
      } else if (d.type === 'confetti') {
        if (d.config) cfg = merge(window.INVITATION_DEFAULTS || {}, d.config);
        confetti();
      } else if (d.type === 'reveal-scratch') {
        var sc = $('#scratch'); if (sc && sc.__reveal) sc.__reveal();
      } else if (d.type === 'play-closing') {
        var cs = $('[data-closing]'); if (cs && cs.__play) { cs.scrollIntoView({ behavior: 'smooth' }); setTimeout(cs.__play, 500); }
        else if (cs && cs.__reveal) cs.__reveal();
      } else if (d.type === 'get-texts') { sendTexts(); }
    });
    toEditor({ type: 'ready' });
  }
})();
