import { sound } from '../sound/SoundEngine.js';

export class Chapter06Stats {
  constructor() {
    this.el = null;
    this.canvas = null;
    this.ctx = null;
    this.bodies = [];
    this.isDragging = false;
    this.draggedBody = null;
    this.dragOffset = { x: 0, y: 0 };
    this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0, vx: 0, vy: 0 };
    this.rafId = null;
    this.isVisible = false;
    this.cachedRect = null;

    this.stats = [
      { key: 'CHA', label: 'Charisma', guild: 'The Wind Shifters', color: '#f5b945', value: 88, desc: 'Unscripted human contact, public speaking, charm under pressure.' },
      { key: 'STR', label: 'Strength', guild: 'The Temperers of Steel', color: '#ff6b4a', value: 52, desc: 'Raw muscular grit, endurance fasting, body resistance.' },
      { key: 'WIS', label: 'Wisdom', guild: 'The Keepers of Time', color: '#4ecb8a', value: 64, desc: 'Silence, deep nature exposure, impulse discipline.' },
      { key: 'INT', label: 'Intellect', guild: 'The Brotherhood of Tale', color: '#5b8def', value: 76, desc: 'Dense print synthesis, craftsmanship, tactical problem solving.' }
    ];

    this.init();
  }

  init() {
    this.el = document.createElement('section');
    this.el.id = 'ch-stats';
    this.el.className = 'valk-section ch-stats';
    this.el.innerHTML = `
      <div class="section-container">
        <div class="colontitle-bar">
          <div class="colontitle-tag">
            <span class="colon-dot"></span>
            <span>ABOUT STATS</span>
          </div>
          <span class="colon-num">CHAPTER 06</span>
        </div>

        <div class="stats-header">
          <span class="stats-kicker">PRIMAL ATTRIBUTES</span>
          <h2 class="stats-heading">
            Point at the part of yourself<br>
            <em>you want to build.</em>
          </h2>
          <p class="stats-sub">
            The quests you conquer pile up directly into four core attributes. Drag and toss the stat totems in the physics arena below to calibrate your attribute equilibrium.
          </p>
        </div>

        <div class="stats-interactive-grid">
          <div class="physics-arena-box">
            <div class="arena-top-bar">
              <span class="arena-tag">MATTER-STYLE GRAVITATIONAL FIELD</span>
              <span class="arena-hint">CLICK & THROW ORBS</span>
            </div>
            <canvas class="physics-canvas" id="stats-canvas"></canvas>
          </div>

          <div class="stats-metrics-card">
            <h3 class="metrics-card-title">Equilibrium Spectrum</h3>
            
            <div class="stat-bars-list">
              ${this.stats.map(s => `
                <div class="stat-row-item" data-key="${s.key}">
                  <div class="stat-info-head">
                    <span class="stat-dot" style="background:${s.color}"></span>
                    <strong class="stat-name">${s.label} (${s.key})</strong>
                    <span class="stat-val-text" id="stat-val-${s.key}">${s.value} / 100</span>
                  </div>
                  <div class="stat-meter-track">
                    <div class="stat-meter-fill" id="stat-bar-${s.key}" style="width:${s.value}%; background:${s.color}"></div>
                  </div>
                  <span class="stat-guild-label">${s.guild}</span>
                </div>
              `).join('')}
            </div>

            <div class="stat-card-footer">
              <div class="total-level-pill">
                <span>TOTAL ASCENSION XP</span>
                <strong class="text-gold">LEVEL 28 // 2,800 XP</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupPhysics();
    this.setupObserver();
  }

  setupObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !this.rafId) {
          this.loop();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(this.el);
  }

  setupPhysics() {
    this.canvas = this.el.querySelector('#stats-canvas');
    this.ctx = this.canvas.getContext('2d');

    const updateRect = () => {
      if (this.canvas) this.cachedRect = this.canvas.getBoundingClientRect();
    };

    const resize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = 420;
      this.initBodies();
      updateRect();
    };

    setTimeout(resize, 100);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', () => { this.cachedRect = null; }, { passive: true });

    const getPos = (e) => {
      if (!this.cachedRect) updateRect();
      const rect = this.cachedRect;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onDown = (e) => {
      updateRect();
      const pos = getPos(e);
      this.mouse.x = pos.x;
      this.mouse.y = pos.y;
      this.mouse.prevX = pos.x;
      this.mouse.prevY = pos.y;

      for (let i = this.bodies.length - 1; i >= 0; i--) {
        const b = this.bodies[i];
        const dist = Math.hypot(pos.x - b.x, pos.y - b.y);
        if (dist <= b.radius) {
          this.isDragging = true;
          this.draggedBody = b;
          this.dragOffset.x = pos.x - b.x;
          this.dragOffset.y = pos.y - b.y;
          b.vx = 0;
          b.vy = 0;
          sound.playTick();
          break;
        }
      }
    };

    const onMove = (e) => {
      if (!this.isDragging) return;
      const pos = getPos(e);
      this.mouse.vx = pos.x - this.mouse.prevX;
      this.mouse.vy = pos.y - this.mouse.prevY;
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
      this.mouse.x = pos.x;
      this.mouse.y = pos.y;

      if (this.draggedBody) {
        this.draggedBody.x = pos.x - this.dragOffset.x;
        this.draggedBody.y = pos.y - this.dragOffset.y;
      }
    };

    const onUp = () => {
      if (this.isDragging && this.draggedBody) {
        this.draggedBody.vx = this.mouse.vx * 0.85;
        this.draggedBody.vy = this.mouse.vy * 0.85;
        sound.playWhoosh();
        this.isDragging = false;
        this.draggedBody = null;
      }
    };

    this.canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);

    this.canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  }

  initBodies() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.bodies = [];

    this.stats.forEach((s, idx) => {
      this.bodies.push({
        x: 80 + idx * ((w - 160) / 3),
        y: 80 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: 44,
        color: s.color,
        label: s.key,
        name: s.label,
        value: s.value,
        isMajor: true
      });
    });

    for (let i = 0; i < 5; i++) {
      const stat = this.stats[i % 4];
      this.bodies.push({
        x: Math.random() * (w - 60) + 30,
        y: Math.random() * (h - 60) + 30,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 18,
        color: stat.color,
        label: '+XP',
        isMajor: false
      });
    }
  }

  loop() {
    if (!this.isVisible) {
      this.rafId = null;
      return;
    }

    this.rafId = requestAnimationFrame(() => this.loop());

    const w = this.canvas.width;
    const h = this.canvas.height;
    const gravity = 0.22;
    const bounce = 0.72;
    const friction = 0.985;

    this.ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];

      if (b !== this.draggedBody) {
        b.vy += gravity;
        b.vx *= friction;
        b.vy *= friction;
        b.x += b.vx;
        b.y += b.vy;

        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx = -b.vx * bounce;
        } else if (b.x + b.radius > w) {
          b.x = w - b.radius;
          b.vx = -b.vx * bounce;
        }

        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy = -b.vy * bounce;
        } else if (b.y + b.radius > h) {
          b.y = h - b.radius;
          b.vy = -b.vy * bounce;
        }
      }

      for (let j = i + 1; j < this.bodies.length; j++) {
        const b2 = this.bodies[j];
        const dx = b2.x - b.x;
        const dy = b2.y - b.y;
        const dist = Math.hypot(dx, dy);
        const minDist = b.radius + b2.radius;

        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          if (b !== this.draggedBody) {
            b.x -= nx * overlap * 0.5;
            b.y -= ny * overlap * 0.5;
            b.vx -= nx * 0.5;
            b.vy -= ny * 0.5;
          }
          if (b2 !== this.draggedBody) {
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;
            b2.vx += nx * 0.5;
            b2.vy += ny * 0.5;
          }
        }
      }

      this.ctx.save();
      this.ctx.translate(b.x, b.y);

      this.ctx.fillStyle = '#141a1f';
      this.ctx.strokeStyle = b.color;
      this.ctx.lineWidth = b.isMajor ? 2.5 : 1.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      if (b.isMajor) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '700 15px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(b.label, 0, -4);

        this.ctx.fillStyle = b.color;
        this.ctx.font = '600 11px "JetBrains Mono", monospace';
        this.ctx.fillText(`${b.value}PT`, 0, 14);
      } else {
        this.ctx.fillStyle = b.color;
        this.ctx.font = '600 10px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(b.label, 0, 0);
      }

      this.ctx.restore();
    }
  }
}
