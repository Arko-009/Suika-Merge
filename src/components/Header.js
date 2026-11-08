import { sound } from '../sound/SoundEngine.js';

export class Header {
  constructor(options = {}) {
    this.onToggleLab = options.onToggleLab || (() => {});
    this.onNavigateChapter = options.onNavigateChapter || (() => {});
    this.activeChapter = 'CHAPTER 00';
    this.activeTitle = 'THE QUEST SPIRAL';
    this.isMenuOpen = false;
    this.el = null;

    this.init();
  }

  init() {
    this.el = document.createElement('header');
    this.el.className = 'valk-header';
    this.el.innerHTML = `
      <div class="valk-header-inner">
        <!-- Official Brand Lockup -->
        <a href="#hero" class="valk-brand" aria-label="Suika Merge">
          <img src="/official-logo.png" alt="Suika Merge Emblem" class="valk-brand-emblem" />
          <img src="/official-logotext.png" alt="Suika Merge" class="valk-brand-text-img" />
        </a>

        <!-- Center Subtext from Grail -->
        <div class="valk-header-center">
          <span>One real-world quest a day. Four stats that go up when you do</span>
          <span>things out in the world.</span>
        </div>

        <!-- Right Controls -->
        <div class="valk-header-actions">
          <!-- Chapter Pill / Quick Menu Dropdown -->
          <div class="valk-chapter-indicator" id="header-chapter-pill">
            <span class="valk-chapter-dot"></span>
            <span class="valk-chapter-label" id="header-chapter-label">CH 00</span>
            <svg class="valk-chevron" viewBox="0 0 16 16" width="12" height="12">
              <path fill="currentColor" d="M4 6l4 4 4-4" />
            </svg>

            <!-- Dropdown drawer for all chapters -->
            <div class="valk-chapter-dropdown" id="header-chapter-menu">
              <div class="ch-menu-item" data-target="hero"><span>00</span> The Quest Spiral</div>
              <div class="ch-menu-item" data-target="ch-problem"><span>01</span> About Problem</div>
              <div class="ch-menu-item" data-target="ch-timer"><span>02</span> About Timer</div>
              <div class="ch-menu-item" data-target="ch-journey"><span>03</span> About Journey</div>
              <div class="ch-menu-item" data-target="ch-voice"><span>04</span> About Voice Feedback</div>
              <div class="ch-menu-item" data-target="ch-totems"><span>05</span> About Totems</div>
              <div class="ch-menu-item" data-target="ch-stats"><span>06</span> About Stats</div>
              <div class="ch-menu-item" data-target="ch-guilds"><span>07</span> About Guilds</div>
              <div class="ch-menu-item" data-target="ch-waitlist"><span>08</span> Get In Early</div>
            </div>
          </div>

          <!-- Lab Control Toggle -->
          <button class="valk-btn-pill valk-lab-btn" id="header-lab-btn" title="Open Lab Controls">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6" />
            </svg>
            <span class="btn-text">LAB</span>
          </button>

          <!-- Audio Equalizer Button -->
          <button class="valk-btn-pill valk-audio-btn" id="header-audio-btn" title="Toggle Sound">
            <div class="eq-bars">
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
              <span class="eq-bar"></span>
            </div>
            <span class="audio-label" id="header-audio-label">MUTE</span>
          </button>

          <!-- Join Waitlist Button from Screenshot -->
          <a href="#ch-waitlist" class="valk-btn-waitlist">
            <span>Join Waitlist</span>
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(this.el);

    // Audio click handler
    const audioBtn = this.el.querySelector('#header-audio-btn');
    const audioLabel = this.el.querySelector('#header-audio-label');
    audioBtn.addEventListener('click', () => {
      sound.ensureContext();
      const unmuted = sound.toggle();
      audioLabel.textContent = unmuted ? 'ON' : 'MUTE';
      audioBtn.classList.toggle('active', unmuted);
    });

    // Lab click handler
    const labBtn = this.el.querySelector('#header-lab-btn');
    labBtn.addEventListener('click', () => {
      sound.playClick();
      labBtn.classList.toggle('active');
      this.onToggleLab();
    });

    // Chapter dropdown toggle
    const chapterPill = this.el.querySelector('#header-chapter-pill');
    const chapterMenu = this.el.querySelector('#header-chapter-menu');
    chapterPill.addEventListener('click', (e) => {
      if (e.target.closest('.ch-menu-item')) return;
      this.isMenuOpen = !this.isMenuOpen;
      chapterMenu.classList.toggle('open', this.isMenuOpen);
      sound.playClick();
    });

    // Chapter item navigation
    chapterMenu.querySelectorAll('.ch-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const targetId = item.getAttribute('data-target');
        sound.playWhoosh();
        chapterMenu.classList.remove('open');
        this.isMenuOpen = false;
        this.onNavigateChapter(targetId);
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!chapterPill.contains(e.target)) {
        chapterMenu.classList.remove('open');
        this.isMenuOpen = false;
      }
    });

    this.startVisualizer();
  }

  updateChapter(label, title) {
    this.activeChapter = label;
    this.activeTitle = title;
    const labelEl = this.el.querySelector('#header-chapter-label');
    if (labelEl) {
      labelEl.textContent = label;
    }
  }

  startVisualizer() {
    const bars = Array.from(this.el.querySelectorAll('.eq-bar'));
    let visRaf = null;

    const loop = () => {
      if (!sound.isMuted) {
        const data = sound.getByteFrequencyData();
        for (let idx = 0; idx < bars.length; idx++) {
          const val = data[idx * 3] || 10;
          bars[idx].style.height = `${Math.max(3, (val / 255) * 14)}px`;
        }
        visRaf = requestAnimationFrame(loop);
      } else {
        for (let idx = 0; idx < bars.length; idx++) {
          bars[idx].style.height = '3px';
        }
        visRaf = null;
      }
    };

    const audioBtn = this.el.querySelector('#header-audio-btn');
    audioBtn.addEventListener('click', () => {
      if (!sound.isMuted && !visRaf) {
        visRaf = requestAnimationFrame(loop);
      }
    });
  }
}
