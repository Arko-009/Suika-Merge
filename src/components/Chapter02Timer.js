import { sound } from '../sound/SoundEngine.js';

export class Chapter02Timer {
  constructor() {
    this.el = null;
    this.remainingSeconds = 48 * 3600;
    this.isRunning = true;
    this.inkRafId = null;
    this.ripples = [];
    this.init();
  }

  init() {
    this.el = document.createElement('section');
    this.el.id = 'ch-timer';
    this.el.className = 'valk-section ch-timer';
    this.el.innerHTML = `
      <div class="timer-canvas-bg" id="timer-ink-canvas"></div>
      
      <div class="section-container">
        <div class="colontitle-bar">
          <div class="colontitle-tag">
            <span class="colon-dot"></span>
            <span>ABOUT TIMER</span>
          </div>
          <span class="colon-num">CHAPTER 02</span>
        </div>

        <div class="timer-layout">
          <div class="timer-copy">
            <span class="timer-kicker">THE TICKING CRUCIBLE</span>
            <h2 class="timer-heading">Quest accepted.<br><em>Clock’s running.</em></h2>
            <p class="timer-desc">
              Now there’s a clock on it. Forty-eight hours to go do the thing, because “later” is how every single one of these ambitions quietly dies.
            </p>
            <p class="timer-sub-desc">
              When the sand runs out, the quest expires uncompleted. The pressure isn’t artificial—it’s the antidote to procrastination.
            </p>

            <div class="timer-actions">
              <button class="timer-accept-btn" id="t-accept-btn">
                <span class="pulse-ring"></span>
                <span>ACCEPT NEW 48H QUEST</span>
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm-.5 3h1v3.25l2.5 1.5-.5.87-3-1.82V5z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="timer-dial-col">
            <div class="timer-dial-card">
              <div class="dial-svg-wrap">
                <svg class="dial-svg" viewBox="0 0 300 300">
                  <circle cx="150" cy="150" r="130" class="dial-track"/>
                  <circle cx="150" cy="150" r="130" class="dial-progress" id="timer-progress-ring"/>
                  <g class="dial-ticks">
                    ${Array.from({ length: 48 }, (_, i) => {
                      const angle = (i * 360) / 48;
                      return `<line x1="150" y1="26" x2="150" y2="34" transform="rotate(${angle} 150 150)" class="dial-tick-mark"/>`;
                    }).join('')}
                  </g>
                </svg>

                <div class="dial-center">
                  <span class="dial-quest-tag">ACTIVE TRIAL #104</span>
                  <div class="dial-time" id="timer-display">47:59:58</div>
                  <div class="dial-millis" id="timer-millis">.482</div>
                  <span class="dial-status">HOURS : MINUTES : SECONDS</span>
                </div>
              </div>

              <div class="dial-footer-strip">
                <div class="strip-item">
                  <span class="strip-label">STAKES</span>
                  <span class="strip-val text-gold">+450 XP / -100 HP</span>
                </div>
                <div class="strip-item">
                  <span class="strip-label">PATRON</span>
                  <span class="strip-val">KEEPERS OF TIME</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.startCountdown();
    this.setupAcceptButton();
    this.setupInkWaveCanvas();
  }

  startCountdown() {
    const display = this.el.querySelector('#timer-display');
    const millisEl = this.el.querySelector('#timer-millis');
    const ring = this.el.querySelector('#timer-progress-ring');
    const circumference = 2 * Math.PI * 130;
    ring.style.strokeDasharray = `${circumference} ${circumference}`;

    let lastTick = performance.now();
    let currentMs = 48 * 3600 * 1000 - 1500;

    const tick = (now) => {
      const delta = now - lastTick;
      lastTick = now;

      if (this.isRunning) {
        currentMs -= delta;
        if (currentMs <= 0) currentMs = 48 * 3600 * 1000;

        const totalSecs = Math.floor(currentMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        const millis = Math.floor((currentMs % 1000) / 10);

        display.textContent = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        millisEl.textContent = `.${millis.toString().padStart(2, '0')}`;

        const fraction = currentMs / (48 * 3600 * 1000);
        ring.style.strokeDashoffset = `${circumference * (1 - fraction)}`;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  setupAcceptButton() {
    const btn = this.el.querySelector('#t-accept-btn');
    btn.addEventListener('click', () => {
      sound.playWarp();
      this.triggerInkWave();

      btn.classList.add('accepted');
      btn.querySelector('span:last-of-type').textContent = 'QUEST INITIALIZED // 48:00:00';
      setTimeout(() => {
        btn.classList.remove('accepted');
        btn.querySelector('span:last-of-type').textContent = 'ACCEPT NEW 48H QUEST';
      }, 3500);
    });
  }

  setupInkWaveCanvas() {
    const container = this.el.querySelector('#timer-ink-canvas');
    this.inkCanvas = document.createElement('canvas');
    this.inkCanvas.className = 'ink-canvas';
    container.appendChild(this.inkCanvas);
    this.inkCtx = this.inkCanvas.getContext('2d');

    const resize = () => {
      this.inkCanvas.width = this.el.clientWidth;
      this.inkCanvas.height = this.el.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
  }

  startInkLoop() {
    if (this.inkRafId) return;

    const loop = () => {
      if (this.ripples.length === 0) {
        this.inkCtx.clearRect(0, 0, this.inkCanvas.width, this.inkCanvas.height);
        this.inkRafId = null;
        return;
      }

      this.inkCtx.clearRect(0, 0, this.inkCanvas.width, this.inkCanvas.height);
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += r.speed;
        r.alpha *= 0.96;

        this.inkCtx.beginPath();
        this.inkCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this.inkCtx.strokeStyle = `rgba(202, 168, 110, ${r.alpha})`;
        this.inkCtx.lineWidth = r.width;
        this.inkCtx.stroke();

        if (r.alpha < 0.01) {
          this.ripples.splice(i, 1);
        }
      }
      this.inkRafId = requestAnimationFrame(loop);
    };
    this.inkRafId = requestAnimationFrame(loop);
  }

  triggerInkWave() {
    const btn = this.el.querySelector('#t-accept-btn');
    const rect = btn.getBoundingClientRect();
    const sectionRect = this.el.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - sectionRect.left;
    const y = rect.top + rect.height / 2 - sectionRect.top;

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.ripples.push({
          x: x,
          y: y,
          radius: 10 + i * 15,
          speed: 6 + i * 2,
          alpha: 0.65 - i * 0.1,
          width: 3 - i * 0.5
        });
        this.startInkLoop();
      }, i * 100);
    }
  }
}
