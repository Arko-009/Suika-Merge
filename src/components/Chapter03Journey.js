import { sound } from '../sound/SoundEngine.js';

export class Chapter03Journey {
  constructor() {
    this.el = null;
    this.streakCount = 21;
    this.init();
  }

  init() {
    this.el = document.createElement('section');
    this.el.id = 'ch-journey';
    this.el.className = 'valk-section ch-journey';
    this.el.innerHTML = `
      <div class="section-container">
        <!-- Colontitle -->
        <div class="colontitle-bar">
          <div class="colontitle-tag">
            <span class="colon-dot"></span>
            <span>ABOUT JOURNEY</span>
          </div>
          <span class="colon-num">CHAPTER 03</span>
        </div>

        <div class="journey-header">
          <span class="journey-kicker">PERMANENT CRUCIBLE</span>
          <h2 class="journey-heading">
            The quest fades by tomorrow.<br>
            <em>What you felt right after doing it doesn’t.</em>
          </h2>
          <p class="journey-sub">
            That’s how a thing you did becomes a permanent memory you carry. One deliberate trial every single day until autopilot is dissolved forever.
          </p>
        </div>

        <!-- Timeline Milestones -->
        <div class="milestones-track">
          <div class="milestone-node active" data-cursor="LEVEL 01">
            <span class="m-roman">I</span>
            <div class="m-info">
              <span class="m-stage">STAGE 01</span>
              <h4>The Awakening</h4>
              <p>Break the first reflex. Realize the cage was unlocked all along.</p>
            </div>
          </div>

          <div class="milestone-node active" data-cursor="LEVEL 15">
            <span class="m-roman">II</span>
            <div class="m-info">
              <span class="m-stage">STAGE 02</span>
              <h4>The Iron Cadence</h4>
              <p>Two continuous weeks of completed trials. The friction becomes fire.</p>
            </div>
          </div>

          <div class="milestone-node active" data-cursor="LEVEL 30">
            <span class="m-roman">III</span>
            <div class="m-info">
              <span class="m-stage">STAGE 03</span>
              <h4>The Vanguard</h4>
              <p>All four stats elevated past 50 points. You lead guild expeditions.</p>
            </div>
          </div>

          <div class="milestone-node" data-cursor="LEVEL 50">
            <span class="m-roman">IV</span>
            <div class="m-info">
              <span class="m-stage">STAGE 04 // FINAL</span>
              <h4>The Auto-Graduation</h4>
              <p>Level 50 achieved. You no longer need the app. Your account cancels itself.</p>
            </div>
          </div>
        </div>

        <!-- Interactive Streak Matrix -->
        <div class="streak-matrix-card" data-cursor="GRID">
          <div class="matrix-head">
            <div>
              <span class="matrix-tag">CRUCIBLE RECORD // CURRENT CYCLE</span>
              <h3 class="matrix-title">Consecutive Days of Conquest</h3>
            </div>
            <div class="matrix-streak-pill">
              <span class="streak-flame">🔥</span>
              <span class="streak-val" id="streak-counter">21 DAYS ACTIVE</span>
            </div>
          </div>

          <!-- 28-Day Calendar Grid -->
          <div class="streak-grid" id="streak-grid">
            ${Array.from({ length: 28 }, (_, i) => {
              const day = i + 1;
              const isPast = day <= 21;
              const isCurrent = day === 21;
              return `
                <div class="streak-cell ${isPast ? 'completed' : ''} ${isCurrent ? 'current' : ''}" 
                     data-day="${day}" 
                     data-cursor="DAY ${day}">
                  <span class="cell-num">${day.toString().padStart(2, '0')}</span>
                  <span class="cell-glow"></span>
                  <div class="cell-stat-tag">${isPast ? '+XP' : ''}</div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="matrix-footer">
            <div class="legend-row">
              <span class="legend-dot completed"></span>
              <span>Completed Quest</span>
              <span class="legend-dot current"></span>
              <span>Today's Trial</span>
              <span class="legend-dot upcoming"></span>
              <span>Locked Horizon</span>
            </div>
            <div class="matrix-quote">
              "We graduate you out, not trap you in."
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupInteractions();
  }

  setupInteractions() {
    const cells = this.el.querySelectorAll('.streak-cell');
    cells.forEach((cell) => {
      cell.addEventListener('mouseenter', () => {
        sound.playHover();
      });
      cell.addEventListener('click', () => {
        sound.playTick();
        cell.classList.toggle('highlighted');
      });
    });
  }
}

