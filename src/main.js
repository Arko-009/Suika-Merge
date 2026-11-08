/**
 * VALKYRIE // REAL-WORLD & GAMING QUESTS, EVERY DAY
 * End-to-end Awwwards Site of the Day Clone Architecture
 * Built with Three.js WebGL, Web Audio Synthesis, Matter-Style Physics, and Generative Canvases.
 */

import { sound } from './sound/SoundEngine.js';
import { Preloader } from './components/Preloader.js';
import { Header } from './components/Header.js';
import { SpiralDeck } from './components/SpiralDeck.js';
import { LabPanel } from './components/LabPanel.js';
import { QuestModal } from './components/QuestModal.js';
import { Chapter01Problem } from './components/Chapter01Problem.js';
import { Chapter02Timer } from './components/Chapter02Timer.js';
import { Chapter03Journey } from './components/Chapter03Journey.js';
import { Chapter04VoiceGarden } from './components/Chapter04VoiceGarden.js';
import { Chapter05Totems } from './components/Chapter05Totems.js';
import { Chapter06Stats } from './components/Chapter06Stats.js';
import { Chapter07Guilds } from './components/Chapter07Guilds.js';
import { Chapter08Waitlist } from './components/Chapter08Waitlist.js';
import { Footer } from './components/Footer.js';
import { SmoothScroll } from './components/SmoothScroll.js';

class App {
  constructor() {
    this.appEl = document.getElementById('app');
    this.init();
  }

  init() {
    // 1. Preloader with synchronized 3D Spiral Deck convergence
    this.preloader = new Preloader({
      onReveal: () => {
        if (this.spiralDeck) {
          this.spiralDeck.startReveal();
        }
      },
      onComplete: () => {
        console.log('Suika Merge // Realm Initialized');
      }
    });

    // 3. Quest Modal (shared across Hero and chapters)
    this.questModal = new QuestModal((acceptedQuest) => {
      // Scroll to timer and activate quest
      const timerSection = document.getElementById('ch-timer');
      if (timerSection) {
        timerSection.scrollIntoView({ behavior: 'smooth' });
        const acceptBtn = timerSection.querySelector('#t-accept-btn');
        if (acceptBtn) acceptBtn.click();
      }
    });

    // 4. Hero Section (Extended Hero Runway)
    this.heroEl = document.createElement('section');
    this.heroEl.id = 'hero';
    this.heroEl.className = 'valk-hero';
    this.heroEl.innerHTML = `
      <div class="hero-sticky-stage">
        <div class="hero-scroll-prompt">
          <span>SCROLL TO DESCEND</span>
          <div class="prompt-line"></div>
        </div>
      </div>
    `;
    this.appEl.appendChild(this.heroEl);

    // Dedicated Fixed Background Layer for Three.js Spiral Deck
    this.deckLayerEl = document.createElement('div');
    this.deckLayerEl.className = 'spiral-deck-fixed-layer';
    this.deckLayerEl.id = 'spiral-deck-layer';
    document.body.appendChild(this.deckLayerEl);

    // Mount 3D Three.js Spiral Deck onto the fixed layer
    this.spiralDeck = new SpiralDeck(this.deckLayerEl, (quest) => {
      this.questModal.open(quest);
    });

    // Lab panel to tune spiral parameters
    this.labPanel = new LabPanel(this.spiralDeck);

    // 5. Header (Colontitle)
    this.header = new Header({
      onToggleLab: () => {
        this.labPanel.toggle();
      },
      onNavigateChapter: (targetId) => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    // 6. Chapters (01 to 08)
    this.ch01 = new Chapter01Problem();
    this.appEl.appendChild(this.ch01.el);

    this.ch02 = new Chapter02Timer();
    this.appEl.appendChild(this.ch02.el);

    this.ch03 = new Chapter03Journey();
    this.appEl.appendChild(this.ch03.el);

    this.ch04 = new Chapter04VoiceGarden();
    this.appEl.appendChild(this.ch04.el);

    this.ch05 = new Chapter05Totems();
    this.appEl.appendChild(this.ch05.el);

    this.ch06 = new Chapter06Stats();
    this.appEl.appendChild(this.ch06.el);

    this.ch07 = new Chapter07Guilds();
    this.appEl.appendChild(this.ch07.el);

    this.ch08 = new Chapter08Waitlist();
    this.appEl.appendChild(this.ch08.el);

    // 7. Footer
    this.footer = new Footer(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 8. Smooth Momentum Scroll & Chapter Spy
    this.smoothScroll = new SmoothScroll({
      onChapterChange: (label, title) => {
        this.header.updateChapter(label, title);
      }
    });

    // Window scroll handler: parallax title & drive spiral deck merge
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight || 1;
      const progress = scrollY / vh;

      if (this.spiralDeck) {
        this.spiralDeck.onPageScroll(progress);
      }

      const prompt = document.querySelector('.hero-scroll-prompt');
      if (prompt) {
        const offset = Math.max(0, scrollY - vh * 0.2);
        const fade = Math.max(0, 1 - offset / (vh * 0.45));
        prompt.style.opacity = fade.toFixed(2);
      }
    }, { passive: true });

    // Global audio unlock on first user interaction
    const unlockAudio = () => {
      sound.ensureContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
