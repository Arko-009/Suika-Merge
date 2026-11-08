import { sound } from '../sound/SoundEngine.js';

export class Footer {
  constructor(onBackToTop) {
    this.onBackToTop = onBackToTop || (() => { });
    this.el = null;
    this.fps = 60;
    this.init();
  }

  init() {
    this.el = document.createElement('footer');
    this.el.className = 'valk-footer';
    this.el.innerHTML = `
      <div class="footer-container">
        <!-- Giant Editorial Wordmark -->
        <div class="footer-hero-brand">
          <h2 class="giant-wordmark">VALKYRIE</h2>
          <span class="wordmark-sub">THE REALM OF DAILY CONQUEST</span>
        </div>

        <!-- Meta Grid -->
        <div class="footer-meta-grid">
          <div class="footer-col">
            <span class="footer-col-head">GUILDS</span>
            <ul class="footer-links">
              <li><a href="#ch-guilds">The Temperers of Steel</a></li>
              <li><a href="#ch-guilds">The Brotherhood of Tale</a></li>
              <li><a href="#ch-guilds">The Keepers of Time</a></li>
              <li><a href="#ch-guilds">The Wind Shifters</a></li>
              <li><a href="#ch-guilds">The Seekers of Forsaken</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <span class="footer-col-head">DISCIPLINES</span>
            <ul class="footer-links">
              <li><a href="#hero">The Quest Spiral GL</a></li>
              <li><a href="#ch-problem">Autopilot Dissolution</a></li>
              <li><a href="#ch-timer">48-Hour Boss Clocks</a></li>
              <li><a href="#ch-totems">Guardian Relics</a></li>
              <li><a href="#ch-stats">Primal Stat Physics</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <span class="footer-col-head">SANCTIONED COMMUNITY</span>
            <ul class="footer-links">
              <li><a href="https://discord.com" target="_blank" rel="noopener">Discord Stronghold</a></li>
              <li><a href="https://x.com" target="_blank" rel="noopener">Dispatch Feed (X)</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener">Open Source Codex</a></li>
              <li><a href="#ch-waitlist">Founding Alpha Pass</a></li>
            </ul>
          </div>

          <div class="footer-col col-status">
            <span class="footer-col-head">SYSTEM TELEMETRY</span>
            <div class="telemetry-box">
              <div class="telem-row">
                <span>OMNIVERSE STATUS:</span>
                <strong class="text-green">ONLINE // 99.98%</strong>
              </div>
              <div class="telem-row">
                <span>GRAPHICS ENGINE:</span>
                <span>THREE.JS WEBGL 2.0</span>
              </div>
              <div class="telem-row">
                <span>FRAME CADENCE:</span>
                <span id="footer-fps">60 FPS</span>
              </div>
              <div class="telem-row">
                <span>UNIVERSAL TIME:</span>
                <span id="footer-utc">12:00:00 UTC</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Colophon Bar -->
        <div class="footer-bottom-bar">
          <div class="bottom-left">
            <span>© 2026 VALKYRIE REALMS INC. ALL RIGHTS RESERVED.</span>
            <span class="sep">·</span>
            <span>END-TO-END AWWWARDS SOTD EXPERIENCE</span>
          </div>

          <button class="back-to-top-btn" id="footer-top-btn" data-cursor="ASCEND">
            <span>RETURN TO APEX ↑</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.el);

    this.el.querySelector('#footer-top-btn').addEventListener('click', () => {
      sound.playWhoosh();
      this.onBackToTop();
    });

    this.startTelemetry();
  }

  startTelemetry() {
    const fpsEl = this.el.querySelector('#footer-fps');
    const utcEl = this.el.querySelector('#footer-utc');

    setInterval(() => {
      fpsEl.textContent = '60 FPS';
      const d = new Date();
      utcEl.textContent = d.toISOString().slice(11, 19) + ' UTC';
    }, 1000);
  }
}

