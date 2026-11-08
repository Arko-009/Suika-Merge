import confetti from 'canvas-confetti';
import { sound } from '../sound/SoundEngine.js';

export class Chapter08Waitlist {
  constructor() {
    this.el = null;
    this.isSubmitted = false;
    this.isVisible = false;
    this.cachedRect = null;
    this.init();
  }

  init() {
    this.el = document.createElement('section');
    this.el.id = 'ch-waitlist';
    this.el.className = 'valk-section ch-waitlist';
    this.el.innerHTML = `
      <div class="section-container">
        <div class="colontitle-bar">
          <div class="colontitle-tag">
            <span class="colon-dot"></span>
            <span>GET IN EARLY</span>
          </div>
          <span class="colon-num">CHAPTER 08</span>
        </div>

        <div class="waitlist-layout">
          <div class="dragon-art-wrapper" id="dragon-wrapper">
            <svg class="dragon-svg" viewBox="0 0 400 300" id="dragon-svg">
              <defs>
                <linearGradient id="goldDragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#fff5e2" />
                  <stop offset="50%" stop-color="#caa86e" />
                  <stop offset="100%" stop-color="#4d3b1e" />
                </linearGradient>
                <filter id="eyeGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <path d="M120 70 Q90 10 30 20 Q80 60 110 90 Z" fill="url(#goldDragonGrad)" opacity="0.85"/>
              <path d="M280 70 Q310 10 370 20 Q320 60 290 90 Z" fill="url(#goldDragonGrad)" opacity="0.85"/>

              <path d="M130 90 Q200 40 270 90 Q300 160 260 230 Q200 270 140 230 Q100 160 130 90 Z" 
                    fill="none" stroke="url(#goldDragonGrad)" stroke-width="2.5" />
              
              <path d="M160 170 L200 240 L240 170 Z" fill="#141a1e" stroke="url(#goldDragonGrad)" stroke-width="1.8"/>
              <line x1="200" y1="180" x2="200" y2="230" stroke="#caa86e" stroke-width="1.5" />

              <ellipse cx="165" cy="135" rx="18" ry="10" fill="#0d1114" stroke="#caa86e" stroke-width="1.5" />
              <circle cx="165" cy="135" r="5" fill="#ff4d4d" filter="url(#eyeGlow)" id="dragon-eye-left" />

              <ellipse cx="235" cy="135" rx="18" ry="10" fill="#0d1114" stroke="#caa86e" stroke-width="1.5" />
              <circle cx="235" cy="135" r="5" fill="#ff4d4d" filter="url(#eyeGlow)" id="dragon-eye-right" />

              <path d="M100 190 Q60 220 40 260 Q80 230 110 210 Z" fill="url(#goldDragonGrad)" opacity="0.5"/>
              <path d="M300 190 Q340 220 360 260 Q320 230 290 210 Z" fill="url(#goldDragonGrad)" opacity="0.5"/>
            </svg>
          </div>

          <div class="waitlist-card">
            <h2 class="waitlist-heading">
              Stop meaning to.<br>
              <em>Start doing.</em>
            </h2>
            <p class="waitlist-sub">
              We’re still forging Valkyrie, and we will only let in as many adventurers as the servers can hold. Leave your email and you’ll be among the first when the gates open.
            </p>

            <form class="waitlist-form" id="waitlist-form" onsubmit="return false;">
              <div class="input-container">
                <input 
                  type="email" 
                  id="waitlist-email" 
                  placeholder="Your email address" 
                  autocomplete="email" 
                  required
                />
                <button type="submit" id="waitlist-submit" class="waitlist-submit-btn">
                  <span>ENTER THE REALM</span>
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                    <path d="M6 3l5 5-5 5V3z"/>
                  </svg>
                </button>
              </div>

              <div class="input-hint-row">
                <span class="hint-dot" id="hint-dot"></span>
                <span class="hint-text" id="hint-text">Type your email to join the vanguard...</span>
              </div>
            </form>

            <div class="waitlist-perks-row">
              <div class="perk-pill">
                <span class="perk-icon">✦</span>
                <span>Founding Vanguard Badge</span>
              </div>
              <div class="perk-pill">
                <span class="perk-icon">✦</span>
                <span>Day-1 Exclusive Relic Totem</span>
              </div>
              <div class="perk-pill">
                <span class="perk-icon">✦</span>
                <span>Zero Subscription Spam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupDragonEyeTracking();
    this.setupValidation();
  }

  setupDragonEyeTracking() {
    const eyeL = this.el.querySelector('#dragon-eye-left');
    const eyeR = this.el.querySelector('#dragon-eye-right');
    const wrapper = this.el.querySelector('#dragon-wrapper');

    const observer = new IntersectionObserver(
      (entries) => {
        this.isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(this.el);

    const updateRect = () => {
      if (wrapper) this.cachedRect = wrapper.getBoundingClientRect();
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', () => { this.cachedRect = null; }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      if (!this.isVisible) return;
      if (!this.cachedRect) updateRect();
      const rect = this.cachedRect;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const maxDist = 6;
      const dx = Math.cos(angle) * maxDist;
      const dy = Math.sin(angle) * maxDist;

      eyeL.setAttribute('cx', (165 + dx).toFixed(1));
      eyeL.setAttribute('cy', (135 + dy).toFixed(1));

      eyeR.setAttribute('cx', (235 + dx).toFixed(1));
      eyeR.setAttribute('cy', (135 + dy).toFixed(1));
    }, { passive: true });
  }

  setupValidation() {
    const emailInput = this.el.querySelector('#waitlist-email');
    const hintText = this.el.querySelector('#hint-text');
    const hintDot = this.el.querySelector('#hint-dot');
    const form = this.el.querySelector('#waitlist-form');
    const submitBtn = this.el.querySelector('#waitlist-submit');

    emailInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();

      if (val.length === 0) {
        hintText.textContent = 'Type your email to join the vanguard...';
        hintDot.style.background = '#8e8e93';
      } else if (val.includes(',')) {
        hintText.textContent = 'commas are for lists, not emails...';
        hintDot.style.background = '#ff6b4a';
      } else if (val.length < 5) {
        hintText.textContent = 'keep going...';
        hintDot.style.background = '#f5b945';
      } else if (!val.includes('@')) {
        hintText.textContent = 'emails need an @...';
        hintDot.style.background = '#f5b945';
      } else if (val.endsWith('@')) {
        hintText.textContent = 'and then? enter your domain...';
        hintDot.style.background = '#f5b945';
      } else if (!val.includes('.')) {
        hintText.textContent = 'you forgot the .something (e.g. .com)...';
        hintDot.style.background = '#f5b945';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        hintText.textContent = 'that\'s not quite an email yet...';
        hintDot.style.background = '#ff6b4a';
      } else {
        hintText.textContent = 'The gates are ready to open. Press Enter to ascend.';
        hintDot.style.background = '#4ecb8a';
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = emailInput.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        sound.playTick();
        emailInput.focus();
        return;
      }

      this.isSubmitted = true;
      sound.playFanfare();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#caa86e', '#fff5e2', '#4ecb8a', '#f5b945']
      });

      submitBtn.classList.add('submitted');
      submitBtn.querySelector('span').textContent = 'VANGUARD RECORDED ✓';
      emailInput.disabled = true;
      hintText.textContent = 'Congratulations, Adventurer. You are on the founding roster.';
      hintDot.style.background = '#caa86e';
    });
  }
}
