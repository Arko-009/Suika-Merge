export class Chapter01Problem {
  constructor() {
    this.el = null;
    this.init();
  }

  init() {
    this.el = document.createElement('section');
    this.el.id = 'ch-problem';
    this.el.className = 'valk-section ch-problem';
    this.el.innerHTML = `
      <div class="section-container">
        <!-- Chapter Header Colontitle -->
        <div class="colontitle-bar">
          <div class="colontitle-tag">
            <span class="colon-dot"></span>
            <span>ABOUT PROBLEM</span>
          </div>
          <span class="colon-num">CHAPTER 01</span>
        </div>

        <!-- Grail Exact Staggered Editorial Headline with Words Rising -->
        <div class="grail-s2-head" aria-label="Everyone's out living. You're watching them do it on a screen.">
          <div class="grail-s2-line" style="margin-left: 42.4vw;">EVERYONE'S OUT</div>
          <div class="grail-s2-line" style="margin-left: 25.1vw;">LIVING. YOU'RE</div>
          <div class="grail-s2-line" style="margin-left: 17vw;">WATCHING THEM DO IT</div>
          <div class="grail-s2-line" style="margin-left: 42.4vw;">ON A SCREEN.</div>
        </div>

        <p class="grail-s2-body">
          Same week, over and over, until you can't tell them apart. You keep meaning to do the thing, go to the place, become the person, and somehow it’s always next week. The loop is comfortable, which is the problem, because comfortable is how a whole year slips by with nothing in it worth remembering.
        </p>

        <!-- Comparison Dual Cards -->
        <div class="problem-grid">
          <!-- Card A: The Routine -->
          <div class="problem-card routine-card">
            <div class="card-glow-edge"></div>
            <div class="card-status-badge">DEFAULT SCRIPT // NPC MODE</div>
            <h3 class="card-title">The Autopilot Routine</h3>
            <ul class="comparison-list">
              <li>
                <span class="icon-cross">✕</span>
                <div>
                  <strong>Infinite Feed Friction</strong>
                  <p>Consuming other people's conquests while your own physical stats remain stagnant.</p>
                </div>
              </li>
              <li>
                <span class="icon-cross">✕</span>
                <div>
                  <strong>Hypnotic Screen Amnesia</strong>
                  <p>Forty hours a week vanished into algorithmic feeds with zero tangible memory left behind.</p>
                </div>
              </li>
              <li>
                <span class="icon-cross">✕</span>
                <div>
                  <strong>The "Someday" Gravestone</strong>
                  <p>Postponing challenges until "later"—which is precisely how every ambition quietly dies.</p>
                </div>
              </li>
            </ul>
            <div class="card-metric-footer">
              <span class="metric-label">ANNUAL MEMORY DECAY</span>
              <span class="metric-val text-dim">98.4%</span>
            </div>
          </div>

          <!-- Card B: The Valkyrie Protocol -->
          <div class="problem-card valkyrie-card">
            <div class="card-glow-edge gold"></div>
            <div class="card-status-badge gold">VALKYRIE PROTOCOL // HERO MODE</div>
            <h3 class="card-title">The Awakened Journey</h3>
            <ul class="comparison-list">
              <li>
                <span class="icon-check">✓</span>
                <div>
                  <strong>One Real-World Quest Daily</strong>
                  <p>Push outside your comfortable perimeter with targeted physical and social trials.</p>
                </div>
              </li>
              <li>
                <span class="icon-check">✓</span>
                <div>
                  <strong>Four Primal RPG Attributes</strong>
                  <p>Direct XP allocation to Strength, Intellect, Charisma, and Wisdom based on true action.</p>
                </div>
              </li>
              <li>
                <span class="icon-check">✓</span>
                <div>
                  <strong>The Auto-Cancel Graduation</strong>
                  <p>When you reach Level 50 and master real-world agency, your membership automatically terminates.</p>
                </div>
              </li>
            </ul>
            <div class="card-metric-footer">
              <span class="metric-label">LIFETIME RETENTION & XP</span>
              <span class="metric-val text-gold">+10,000 XP</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupScrollReveal();
  }

  setupScrollReveal() {
    const lines = this.el.querySelectorAll('.grail-s2-line');
    const body = this.el.querySelector('.grail-s2-body');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            lines.forEach((l) => l.classList.add('in-view'));
            if (body) body.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(this.el);
  }
}
