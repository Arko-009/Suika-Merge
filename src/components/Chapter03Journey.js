import { sound } from '../sound/SoundEngine.js';

/**
 * GRAIL // CHAPTER 03: ABOUT JOURNEY (Section 5)
 * 1:1 Frame-by-frame exact reproduction of grail-app.com motion design:
 * - Rotated entering card sheet:
 *   transform: rotate(calc(var(--s5rot, 0) * 7deg)) scale(calc(1 - var(--s5off, 0) * 0.16));
 *   transform-origin: 50%; background: #f6f6f6; border-radius: 24px;
 * - Colontitle: "About Journey // Chapter 03" with tone "light"
 * - Staggered rising words headline in PP Pangaia:
 *   "IT STARTS AS ONE [CREST] QUEST."
 *   "IT RARELY STAYS THAT WAY."
 * - Masked SVG Crest cycling through 5 guild crest patterns with vertical slide transition
 * - Subtitle: "No promises. Just what tends to happen when you show up."
 * - 5 Editorial Quest Rows with staggered scroll unveil:
 *   - Expanding hairline horizontal divider (scaleX(--rp))
 *   - Left column ("A chance", chance title, 01-05 number) sliding in from +17vw
 *   - Quest photo unveiling vertically via clip-path: inset(calc((1 - var(--rp)) * 50%))
 *   - Editorial description sliding in from -17vw
 * - Mathematical synchronization with Chapter 02 fade via --afade
 */
export class Chapter03Journey {
  constructor() {
    this.el = null;
    this.listEl = null;
    this.headEl = null;
    this.crestImgs = [];
    this.crestInterval = null;
    this.crestIndex = 0;
    this.inView = false;
    this.boundScroll = null;
    this.boundResize = null;

    this.quests = [
      {
        chance: 'To end up at someone’s table.',
        desc: 'You went out to do one small thing. Six hours later you’re somewhere you didn’t plan, with people you didn’t know this morning.',
        photo: '/story/01.jpg',
        srcset: '/story/01-320.webp 320w, /story/01-640.webp 640w',
        num: '01'
      },
      {
        chance: 'To be the only one out there.',
        desc: 'No one watching, no one to tell. Just you, somewhere you’d normally never be at this hour.',
        photo: '/story/02.jpg',
        srcset: '/story/02-320.webp 320w, /story/02-640.webp 640w',
        num: '02'
      },
      {
        chance: 'To find the place you’d have walked past.',
        desc: 'A street you never turn down. A door you never tried. It was there the whole time.',
        photo: '/story/03.jpg',
        srcset: '/story/03-320.webp 320w, /story/03-640.webp 640w',
        num: '03'
      },
      {
        chance: 'To find the scary thing was nothing.',
        desc: 'The thing you’d been putting off for weeks took four minutes. Then it was just done.',
        photo: '/story/04.jpg',
        srcset: '/story/04-320.webp 320w, /story/04-640.webp 640w',
        num: '04'
      },
      {
        chance: 'To come home with something to tell.',
        desc: 'Not a screenshot. An actual thing that happened, that you were in the middle of.',
        photo: '/story/05.jpg',
        srcset: '/story/05-320.webp 320w, /story/05-640.webp 640w',
        num: '05'
      }
    ];

    this.crestPatterns = [
      '/patterns/tempers-160.webp',
      '/patterns/brotherhood-of-tale-160.webp',
      '/patterns/keepers-of-time-160.webp',
      '/patterns/seeker-of-forsaken-160.webp',
      '/patterns/wind-shifters-160.webp'
    ];

    this.init();
  }

  init() {
    this.el = document.createElement('section');
    this.el.id = 'ch-journey';
    this.el.className = 'grail-section5';
    this.el.setAttribute('aria-label', 'Chapter 03: About Journey');

    this.el.innerHTML = `
      <!-- Colontitle Bar (Matching Grail ft component) -->
      <div class="grail-s5-colontitle" aria-hidden="true">
        <span>About Journey</span>
        <span class="colon-right">Chapter 03</span>
      </div>

      <div class="grail-s5-inner">
        <!-- Headline with Rising Lines and Masked Crest Cycling -->
        <h2 class="grail-s5-head" id="grail-s5-head">
          <span class="grail-s5-head-line">
            It starts as one&nbsp;<span class="grail-s5-quest-wrap"><span class="grail-s5-crest" aria-hidden="true">
              ${this.crestPatterns.map((src, i) => `
                <img 
                  class="grail-s5-crest-img"
                  src="${src}" 
                  alt="" 
                  width="160" 
                  height="158" 
                  loading="lazy" 
                  decoding="async"
                  style="opacity: ${i === 0 ? '1' : '0'}; transform: ${i === 0 ? 'translateY(0)' : 'translateY(45%)'};"
                />
              `).join('')}
            </span>&nbsp;quest.</span>
          </span>
          <span class="grail-s5-head-line">It rarely stays that way.</span>
        </h2>

        <p class="grail-s5-sub">No promises. Just what tends to happen when you show up.</p>

        <!-- Staggered Revealing Rows List -->
        <div class="grail-s5-list" id="grail-s5-list">
          ${this.quests.map((item, idx) => `
            <div class="grail-s5-row" data-row="${idx}">
              <div class="grail-s5-left">
                <div>
                  <p class="grail-s5-chance-label">A chance</p>
                  <p class="grail-s5-chance">${item.chance}</p>
                </div>
                <p class="grail-s5-num">${item.num}</p>
              </div>
              <img 
                class="grail-s5-photo" 
                src="${item.photo}" 
                srcset="${item.srcset}" 
                sizes="(max-width: 768px) 42vw, 201px" 
                alt="" 
                aria-hidden="true" 
                width="600" 
                height="400" 
                loading="lazy" 
                decoding="async" 
              />
              <p class="grail-s5-desc">${item.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Cache elements
    this.listEl = this.el.querySelector('#grail-s5-list');
    this.headEl = this.el.querySelector('#grail-s5-head');
    this.crestImgs = Array.from(this.el.querySelectorAll('.grail-s5-crest-img'));
    this.colontitleEl = this.el.querySelector('.grail-s5-colontitle');

    this.setupCrestCycling();
    this.setupInteractions();
    this.setupScrollListener();
  }

  /**
   * Cycles through guild crests every 1.4s matching Grail
   */
  setupCrestCycling() {
    this.crestInterval = setInterval(() => {
      this.crestIndex = (this.crestIndex + 1) % this.crestPatterns.length;
      this.crestImgs.forEach((img, idx) => {
        if (img) {
          img.style.opacity = idx === this.crestIndex ? '1' : '0';
          img.style.transform = idx === this.crestIndex ? 'translateY(0)' : 'translateY(45%)';
        }
      });
    }, 1400);
  }

  setupInteractions() {
    const rows = this.el.querySelectorAll('.grail-s5-row');
    rows.forEach((row) => {
      row.addEventListener('mouseenter', () => {
        sound.playHover();
      });
    });
  }

  setupScrollListener() {
    this.boundScroll = () => {
      this.onScroll();
    };
    window.addEventListener('scroll', this.boundScroll, { passive: true });
    this.boundResize = () => {
      this.onScroll();
    };
    window.addEventListener('resize', this.boundResize, { passive: true });

    // Initial evaluation
    requestAnimationFrame(() => this.onScroll());
  }

  /**
   * Exact scroll physics matching Grail's Section 5:
   * Drives --s5rot, --s5off, --vreveal, --afade, and per-row --rp
   */
  onScroll() {
    if (!this.el) return;

    const root = document.documentElement;
    const scrollY = window.scrollY || 0;
    const vh = window.innerHeight || 1;

    const s5Top = this.el.offsetTop;
    const s5H = this.el.offsetHeight;

    const n = s5Top - scrollY;
    const i = s5Top + s5H - scrollY;

    // a = exit progress (0 -> 1 as section exits upwards)
    const a = Math.min(1, Math.max(0, (vh - i) / vh));
    // s = entrance progress (0 -> 1 as section enters from bottom)
    const s = Math.min(1, Math.max(0, (vh - n) / vh));

    // Calculate Grail CSS variables
    const vreveal = a;
    // --afade fades Chapter 02 phone dock out as Section 5 approaches (n < 0.7 * vh)
    const afade = Math.min(1, Math.max(0, n / (vh * 0.7)));
    const s5off = Math.min(1, Math.max(0, 1 - s + a));
    const s5rot = 1 - s - a;

    root.style.setProperty('--vreveal', vreveal.toFixed(4));
    root.style.setProperty('--afade', afade.toFixed(4));
    root.style.setProperty('--s5off', s5off.toFixed(4));
    root.style.setProperty('--s5rot', s5rot.toFixed(4));

    // Colontitle fade out as section exits
    if (this.colontitleEl) {
      const colonOp = Math.min(1, Math.max(0, (0.8 - vreveal) / 0.2));
      this.colontitleEl.style.opacity = colonOp.toFixed(3);
    }

    // Trigger rising lines when heading reaches bottom 85% of screen
    if (!this.inView && n < vh * 0.85) {
      this.inView = true;
      if (this.headEl) {
        this.headEl.classList.add('grail-s5-in');
      }
    }

    // Per-row reveal math matching Grail:
    // r = clamp((0.9 * vh - rowRectTop) / (0.45 * vh), 0, 1)
    if (this.listEl && this.listEl.children) {
      const rows = this.listEl.children;
      for (let idx = 0; idx < rows.length; idx++) {
        const row = rows[idx];
        const rect = row.getBoundingClientRect();
        const rp = Math.min(1, Math.max(0, (vh * 0.9 - rect.top) / (vh * 0.45)));
        row.style.setProperty('--rp', rp.toFixed(4));
      }
    }
  }

  destroy() {
    if (this.crestInterval) {
      clearInterval(this.crestInterval);
      this.crestInterval = null;
    }
    if (this.boundScroll) {
      window.removeEventListener('scroll', this.boundScroll);
      this.boundScroll = null;
    }
    if (this.boundResize) {
      window.removeEventListener('resize', this.boundResize);
      this.boundResize = null;
    }
  }
}
