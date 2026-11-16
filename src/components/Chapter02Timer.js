import { sound } from '../sound/SoundEngine.js';

/**
 * GRAIL // CHAPTER 02: ABOUT TIMER
 * 1:1 Frame-by-frame exact match of grail-app.com motion design:
 * - Fullscreen dynamic ink-reveal radial mask (--ink, --inkfill)
 * - Giant 24vw typography atmospheric ticking clock (47:59:58)
 * - 3D perspective floating phone swoop with blur, tilt, and de-blur (--phone)
 * - Staggered rising words headline (--hl, --i)
 * - Left-to-right expanding hairline divider (--dgrow)
 * - Two-column editorial copy with radial ink reveal
 * - Smoothstep transition from Chapter 01 through Section 3 runway into Chapter 02 and Chapter 03
 */
export class Chapter02Timer {
  constructor() {
    this.el = null;
    this.totalSeconds = 47 * 3600 + 59 * 60 + 58;
    this.digitElements = [];
    this.phoneTimerPill = null;
    this.timerInterval = null;
    this.boundScroll = null;
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
        <!-- 1. Fullscreen Atmospheric Ink Background -->
        <div class="grail-accept-bg" id="grail-accept-bg" aria-hidden="true"></div>

        <!-- 2. Giant Atmospheric Countdown Clock Stage -->
        <div class="grail-clock-stage" id="grail-clock-stage" aria-hidden="true">
          <!-- Initial Transformation Stage: Centered "48" with Soft Radial Aura (Grail Image 2 Match) -->
          <div class="grail-clock-initial-stage" id="grail-clock-initial-stage" aria-hidden="true">
            <div class="grail-clock-aura"></div>
            <div class="grail-clock-48">48</div>
          </div>

          <!-- Full Width Countdown Clock Stage (Active 47:59:58 Ticker) -->
          <div class="grail-clock-full-stage" id="grail-clock-full-stage" aria-hidden="true">
            <div class="grail-clock-num">
              <div class="grail-clock-group">
                <span class="grail-clock-digit" data-digit="0">4</span>
                <span class="grail-clock-digit" data-digit="1">7</span>
              </div>
              <span class="grail-clock-colon">:</span>
              <div class="grail-clock-group">
                <span class="grail-clock-digit" data-digit="2">5</span>
                <span class="grail-clock-digit" data-digit="3">9</span>
              </div>
              <span class="grail-clock-colon">:</span>
              <div class="grail-clock-group">
                <span class="grail-clock-digit" data-digit="4">5</span>
                <span class="grail-clock-digit" data-digit="5">8</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 3D Floating Perspective Phone with Live Accepted Quest Card -->
        <div class="grail-phone-stage" id="grail-phone-stage" aria-hidden="true">
          <div class="phone-card-wrap">
            <img 
              class="phone-frame-img" 
              src="/accept-phone.webp" 
              alt="Grail Accepted Quest Phone Mockup" 
              width="643" 
              height="1306" 
              loading="lazy" 
              decoding="async" 
            />
            <div class="phone-screen-card" id="phone-screen-card">
              <div class="phone-card-crest">
                <img src="/patterns/seeker-of-forsaken-160.webp" alt="Seekers of Forsaken Crest" width="160" height="158" loading="lazy" decoding="async" />
              </div>
              <div class="phone-card-guild">The Seekers of Forsaken</div>
              <h3 class="phone-card-quest">Ask a stranger for a recommendation today. A place, a book, anything.</h3>
              <p class="phone-card-desc">People like being asked. Open your mouth to the barista, the neighbor, the person in line.</p>
            </div>
            <div class="phone-live-pill" id="phone-timer-pill">47:59:58</div>
          </div>
        </div>

        <!-- 4. Pinned Editorial Accept Overlay -->
        <div class="grail-accept-overlay" id="grail-accept-overlay" aria-hidden="true">
          <!-- Fixed Colontitle Bar -->
          <div class="grail-s4-colontitle">
            <div class="colontitle-tag">
              <span class="colon-dot"></span>
              <span>ABOUT TIMER</span>
            </div>
            <span class="colon-num">CHAPTER 02</span>
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

    // Cache digit elements for atomic 60 FPS updates
    this.digitElements = Array.from(this.el.querySelectorAll('.grail-clock-digit'));
    this.phoneTimerPill = this.el.querySelector('#phone-timer-pill');
    this.phoneStage = this.el.querySelector('#grail-phone-stage');
    this.acceptBg = this.el.querySelector('#grail-accept-bg');
    this.clockStage = this.el.querySelector('#grail-clock-stage');
    this.acceptOverlay = this.el.querySelector('#grail-accept-overlay');

    this.startCountdown();
    this.setupInteractions();
    this.setupScrollListener();
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

      if (this.phoneTimerPill) {
        this.phoneTimerPill.textContent = `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
      }

      this.totalSeconds = Math.max(0, this.totalSeconds - 1);
    };

    updateDigits();
    this.timerInterval = setInterval(updateDigits, 1000);
  }

  setupInteractions() {
    const phoneCard = this.el.querySelector('#phone-screen-card');
    if (phoneCard) {
      phoneCard.addEventListener('click', () => {
        sound.playWarp();
        phoneCard.classList.add('pulse-glow');
        setTimeout(() => phoneCard.classList.remove('pulse-glow'), 1200);
      });
    }

    const acceptBtn = this.el.querySelector('#t-accept-btn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        sound.playWarp();
        this.totalSeconds = 48 * 3600;
      });
    }
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
   * Drives CSS variables on documentElement & toggles visibility
   */
  onScroll(progress, scrollY, vh) {
    const root = document.documentElement;

    // Range: Chapter 01 (p ~1.0) -> Section 3 (p ~2.0) -> Chapter 02 (p 2.0 to 3.2) -> Chapter 03 (p >3.2)
    // 1. Initial Transformation Stage (Grail Image 2: Centered "48" + Soft Aura)
    const aura = this.smoothstep(1.92, 2.12, progress) * (1 - this.smoothstep(2.35, 2.60, progress));
    const p48 = this.smoothstep(1.92, 2.12, progress) * (1 - this.smoothstep(2.22, 2.40, progress));
    const clockFull = this.smoothstep(2.22, 2.45, progress);

    // 2. Active Expansion Stage (Full Clock, Radial Mask, 3D Phone, Rising Words)
    const ink = this.smoothstep(1.95, 2.65, progress);
    const inkFill = this.smoothstep(1.95, 2.65, progress);
    const dGrow = this.smoothstep(2.15, 2.50, progress);
    const phone = this.smoothstep(2.20, 2.65, progress);
    const hl = this.smoothstep(2.30, 2.75, progress);
    const vCard = this.smoothstep(1.92, 2.40, progress);
    const deckOut = this.smoothstep(2.00, 2.25, progress);

    // Fade out as user reaches Chapter 03
    let aFade = 1.0;
    if (progress > 3.2) {
      aFade = Math.max(0, 1 - this.smoothstep(3.2, 3.8, progress));
    }

    root.style.setProperty('--aura', aura.toFixed(4));
    root.style.setProperty('--p48', p48.toFixed(4));
    root.style.setProperty('--clockfull', clockFull.toFixed(4));
    root.style.setProperty('--ink', ink.toFixed(4));
    root.style.setProperty('--inkfill', inkFill.toFixed(4));
    root.style.setProperty('--dgrow', dGrow.toFixed(4));
    root.style.setProperty('--phone', phone.toFixed(4));
    root.style.setProperty('--hl', hl.toFixed(4));
    root.style.setProperty('--vcard', vCard.toFixed(4));
    root.style.setProperty('--deckout', deckOut.toFixed(4));
    root.style.setProperty('--afade', aFade.toFixed(4));

    // Visibility toggle to avoid wasting GPU compositing outside Chapter 02 range
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
  }
}
