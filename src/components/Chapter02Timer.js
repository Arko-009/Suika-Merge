import { WarpFill } from './WarpFill.js';
import { sound } from '../sound/SoundEngine.js';

/**
 * GRAIL // CHAPTER 02: ABOUT TIMER
 * 1:1 Frame-by-frame exact match of grail-app.com motion design:
 * - Pure WebGL organic ink blot (WarpFill) with domain-warped FBM reaching fingers
 * - Giant 24vw typography countdown clock (47 : MM : SS) in PP Pangaia
 * - Radial gradient ink mask revealing the center minutes directly behind the 3D card
 * - 3D perspective floating phone mockup swooping in with depth blur (blur(14px) -> blur(0px))
 * - Staggered rising words headline: QUEST ACCEPTED. CLOCK'S RUNNING. in deep plum (#2c1538)
 * - Expanding hairline divider (#62356247) and two-column editorial copy in deep plum (#623562)
 */
export class Chapter02Timer {
  constructor() {
    this.el = null;
    this.warpFill = null;
    this.canvas = null;
    // Authentic countdown matching Grail's screenshot
    this.totalSeconds = 47 * 3600 + 44 * 60 + 15;
    this.digitElements = [];
    this.timerInterval = null;
    this.boundScroll = null;
    this.boundResize = null;
    this.init();
  }

  init() {
    this.el = document.createElement('div');
    this.el.className = 'grail-timer-wrapper';
    this.el.innerHTML = `
      <!-- Section 3 Transition Runway (Scroll spacer between Ch 01 and Ch 02) -->
      <section class="grail-section3" aria-hidden="true"></section>

      <!-- Section 4 Anchor for Chapter 02 (Spy & Scroll Target) -->
      <section id="ch-timer" class="grail-section4" aria-label="Chapter 02: About Timer">
        <!-- 1. Fullscreen WebGL Organic Ink Blot Background Canvas -->
        <canvas class="grail-accept-bg" id="grail-accept-canvas" aria-hidden="true"></canvas>

        <!-- 2. Giant Atmospheric Countdown Clock Stage -->
        <div class="grail-clock-stage" id="grail-clock-stage" aria-hidden="true">
          <div class="grail-clock-num">
            <div class="grail-clock-group">
              <span class="grail-clock-digit" data-digit="0">4</span>
              <span class="grail-clock-digit" data-digit="1">7</span>
            </div>
            <span class="grail-clock-colon">:</span>
            <div class="grail-clock-group">
              <span class="grail-clock-digit" data-digit="2">4</span>
              <span class="grail-clock-digit" data-digit="3">4</span>
            </div>
            <span class="grail-clock-colon">:</span>
            <div class="grail-clock-group">
              <span class="grail-clock-digit" data-digit="4">1</span>
              <span class="grail-clock-digit" data-digit="5">5</span>
            </div>
          </div>
        </div>

        <!-- 3. 3D Floating Perspective Phone Mockup (Exact Grail Asset) -->
        <img 
          class="grail-phone" 
          id="grail-phone-img"
          src="/accept-phone.webp" 
          alt="" 
          aria-hidden="true" 
          width="643" 
          height="1306" 
          loading="lazy" 
          decoding="async" 
        />

        <!-- 4. Pinned Accept Overlay & Staggered Typography -->
        <div class="grail-accept-overlay" id="grail-accept-overlay" aria-hidden="true">
          <!-- Fixed Colontitle Bar -->
          <div class="grail-s4-colontitle">
            <span class="colon-label">About Timer</span>
            <span class="colon-right">Chapter 02</span>
          </div>

          <!-- Staggered Rising Words Headline -->
          <h2 class="grail-s4-head">
            <span class="grail-s4-line">
              <span class="grail-s4-word" style="--i: 0">QUEST</span>
              <span class="grail-s4-word" style="--i: 1">ACCEPTED.</span>
            </span>
            <span class="grail-s4-line">
              <span class="grail-s4-word" style="--i: 2">CLOCK’S</span>
              <span class="grail-s4-word" style="--i: 3">RUNNING.</span>
            </span>
          </h2>

          <!-- Expanding Hairline Divider Line -->
          <div class="grail-s4-divider"></div>

          <!-- Two-Column Editorial Copy with Radial Ink Reveal -->
          <div class="grail-ink-reveal">
            <div class="grail-s4-body">
              <p class="grail-s4-lead">
                Now there’s a clock on it. Forty-eight hours to go do the thing, because “later” is how every one of these dies.
              </p>
              <p class="grail-s4-para">
                Not 24, since a day is too easy to lose to work or weather or a bad mood. Two days gives you room to fit it into a real life, and keeps it tight enough that you can’t quietly let it slide. The clock is there to turn someday into this week.
              </p>
            </div>
          </div>
        </div>

        <!-- Hidden Interactive Fallback Button for Quest Accept Trigger -->
        <button id="t-accept-btn" style="position:absolute; opacity:0; pointer-events:none;" aria-label="Accept Quest"></button>
      </section>
    `;

    // Cache elements
    this.canvas = this.el.querySelector('#grail-accept-canvas');
    this.digitElements = Array.from(this.el.querySelectorAll('.grail-clock-digit'));
    this.phoneStage = this.el.querySelector('#grail-phone-img');
    this.acceptBg = this.canvas;
    this.clockStage = this.el.querySelector('#grail-clock-stage');
    this.acceptOverlay = this.el.querySelector('#grail-accept-overlay');

    // Initialize WebGL WarpFill ink blot
    if (this.canvas) {
      this.warpFill = new WarpFill(this.canvas);
    }

    this.startCountdown();
    this.setupInteractions();
    this.setupScrollListener();
    this.setupResizeListener();
  }

  /**
   * Continuous live countdown ticker matching grail-app.com
   */
  startCountdown() {
    const pad2 = (n) => String(n).padStart(2, '0');

    const updateDigits = () => {
      const h = Math.floor(this.totalSeconds / 3600);
      const m = Math.floor((this.totalSeconds % 3600) / 60);
      const s = this.totalSeconds % 60;
      const str = `${pad2(h)}${pad2(m)}${pad2(s)}`;

      for (let i = 0; i < 6; i++) {
        const el = this.digitElements[i];
        if (el && el.textContent !== str[i]) {
          el.textContent = str[i];
        }
      }

      this.totalSeconds = Math.max(0, this.totalSeconds - 1);
    };

    updateDigits();
    this.timerInterval = setInterval(updateDigits, 1000);
  }

  setupInteractions() {
    const acceptBtn = this.el.querySelector('#t-accept-btn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        sound.playWarp();
        this.totalSeconds = 48 * 3600;
      });
    }
  }

  setupResizeListener() {
    this.boundResize = () => {
      if (this.warpFill) {
        this.warpFill.onResize();
      }
    };
    window.addEventListener('resize', this.boundResize, { passive: true });
  }

  setupScrollListener() {
    this.boundScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight || 1;
      const progress = scrollY / vh;
      this.onScroll(progress, scrollY, vh);
    };
    window.addEventListener('scroll', this.boundScroll, { passive: true });
    // Run once on mount
    this.boundScroll();
  }

  /**
   * Cubic Hermite Smoothstep matching grail-app.com $ function
   */
  smoothstep(min, max, val) {
    const r = Math.min(1, Math.max(0, (val - min) / (max - min)));
    return r * r * (3 - 2 * r);
  }

  /**
   * Frame-by-frame exact scroll calculation
   * Drives WebGL WarpFill shader & CSS variables matching Grail
   */
  onScroll(progress, scrollY, vh) {
    const root = document.documentElement;

    // Timeline:
    // 0.0 - 1.0: Hero
    // 1.0 - 1.75: Chapter 01 Problem (Text overlays 3D card)
    // 1.75 - 1.90: Section 3 runway (Only centered 3D card in pure black silence)
    // 1.90 - 2.60: Transformation starts:
    //              - WarpFill WebGL organic ink blot expands
    //              - Radial mask reveals center minutes [44] behind card (Image 1)
    //              - Liquid shores deform with reaching fingers (Image 2)
    //              - Clock expands across screen (47 : 46 : 13)
    //              - 3D card executes 360° wave flip (uFlip: 1.95 -> 2.55)
    //              - Hairline divider draws left to right (dgrow: 2.10 -> 2.45)
    //              - Editorial plum copy reveals via ink mask
    // 2.20 - 2.65: Phone mockup swoops in with perspective & depth blur (Image 3)
    // 2.30 - 2.72: Headline rising words in deep plum #2c1538 (Image 4)

    const ink = this.smoothstep(1.90, 2.60, progress);
    const inkFill = this.smoothstep(1.90, 2.60, progress);
    const dGrow = this.smoothstep(2.10, 2.45, progress);
    const phone = this.smoothstep(2.20, 2.65, progress);
    const hl = this.smoothstep(2.30, 2.72, progress);
    // The 3D card executes its full 360° wave flip / bend from 1.95 to 2.55 (matching Grail 1:1).
    // On desktop, the card docks cleanly inside the phone mockup and stays visible inside the phone frame (media_1794907880786_4b9cd442.png).
    // It remains docked throughout Chapter 02 until scrolling away into Chapter 03 via --afade.
    // On mobile, the 3D card fades out as mobile uses the static fallback layout.
    const isMobile = window.innerWidth <= 768;
    const vCard = 0.0;
    const deckOut = isMobile ? this.smoothstep(1.98, 2.12, progress) : 0.0;

    // Fade out smoothly as user scrolls into Chapter 03 (About Journey)
    // Synchronized to Section 5 top edge distance: n / (vh * 0.7) matching Grail 1:1
    const ch03El = document.getElementById('ch-journey');
    let aFade = 1.0;
    if (ch03El) {
      const n = ch03El.offsetTop - scrollY;
      aFade = Math.min(1, Math.max(0, n / (vh * 0.7)));
    } else if (progress > 3.2) {
      aFade = Math.max(0, 1 - this.smoothstep(3.2, 3.8, progress));
    }

    // Drive WebGL organic ink blot
    if (this.warpFill) {
      this.warpFill.setProgress(ink);
    }

    // Set CSS variables on root documentElement
    root.style.setProperty('--ink', ink.toFixed(4));
    root.style.setProperty('--inkfill', inkFill.toFixed(4));
    root.style.setProperty('--dgrow', dGrow.toFixed(4));
    root.style.setProperty('--phone', phone.toFixed(4));
    root.style.setProperty('--hl', hl.toFixed(4));
    root.style.setProperty('--vcard', vCard.toFixed(4));
    root.style.setProperty('--deckout', deckOut.toFixed(4));
    root.style.setProperty('--afade', aFade.toFixed(4));

    // Visibility toggle to avoid wasting GPU compositing outside Chapter 02
    const isVisible = progress >= 1.6 && progress <= 4.2 && aFade > 0.001;
    const visStr = isVisible ? 'visible' : 'hidden';

    if (this.acceptBg) this.acceptBg.style.visibility = visStr;
    if (this.clockStage) this.clockStage.style.visibility = visStr;
    if (this.phoneStage) this.phoneStage.style.visibility = visStr;
    if (this.acceptOverlay) this.acceptOverlay.style.visibility = visStr;
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.boundScroll) {
      window.removeEventListener('scroll', this.boundScroll);
      this.boundScroll = null;
    }
    if (this.boundResize) {
      window.removeEventListener('resize', this.boundResize);
      this.boundResize = null;
    }
    if (this.warpFill) {
      this.warpFill.dispose();
      this.warpFill = null;
    }
  }
}
