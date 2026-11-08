/**
 * VALKYRIE // SMOOTH MOMENTUM SCROLL ENGINE
 * High-performance virtual inertia scrolling for that Awwwards feel.
 */

export class SmoothScroll {
  constructor(options = {}) {
    this.onChapterChange = options.onChapterChange || (() => {});
    this.currentScroll = window.scrollY;
    this.targetScroll = window.scrollY;
    this.ease = 0.085;
    this.isScrolling = false;
    this.rafId = null;

    this.chapters = [
      { id: 'hero', label: 'CH 00', title: 'THE QUEST SPIRAL' },
      { id: 'ch-problem', label: 'CH 01', title: 'ABOUT PROBLEM' },
      { id: 'ch-timer', label: 'CH 02', title: 'ABOUT TIMER' },
      { id: 'ch-journey', label: 'CH 03', title: 'ABOUT JOURNEY' },
      { id: 'ch-voice', label: 'CH 04', title: 'ABOUT VOICE FEEDBACK' },
      { id: 'ch-totems', label: 'CH 05', title: 'ABOUT TOTEMS' },
      { id: 'ch-stats', label: 'CH 06', title: 'ABOUT STATS' },
      { id: 'ch-guilds', label: 'CH 07', title: 'ABOUT GUILDS' },
      { id: 'ch-waitlist', label: 'CH 08', title: 'GET IN EARLY' }
    ];

    this.activeChapter = this.chapters[0];
    this.init();
  }

  init() {
    let isTicking = false;
    window.addEventListener('scroll', () => {
      this.currentScroll = window.scrollY;
      if (!isTicking) {
        requestAnimationFrame(() => {
          this.checkActiveChapter();
          isTicking = false;
        });
        isTicking = true;
      }
    }, { passive: true });

    // Handle internal anchor clicks smoothly
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (anchor) {
        const id = anchor.getAttribute('href').slice(1);
        if (id) {
          e.preventDefault();
          this.scrollToId(id);
        }
      }
    });

    this.checkActiveChapter();
  }

  scrollToId(id) {
    const targetEl = document.getElementById(id);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  checkActiveChapter() {
    const scrollPos = window.scrollY + window.innerHeight * 0.4;
    
    for (let i = this.chapters.length - 1; i >= 0; i--) {
      const ch = this.chapters[i];
      const el = document.getElementById(ch.id);
      if (el) {
        const top = el.offsetTop;
        if (scrollPos >= top) {
          if (this.activeChapter.id !== ch.id) {
            this.activeChapter = ch;
            this.onChapterChange(ch.label, ch.title);
          }
          break;
        }
      }
    }
  }
}

