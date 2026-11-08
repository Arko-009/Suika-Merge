import { sound } from '../sound/SoundEngine.js';

export class Chapter07Guilds {
  constructor() {
    this.el = null;
    this.currentAngle = 0;
    this.targetAngle = 0;
    this.isDragging = false;
    this.startX = 0;
    this.activeGuildIndex = 0;
    this.spokeCount = 16;
    this.rafId = null;

    this.guilds = [
      {
        id: 'steel',
        name: 'The Temperers of Steel',
        kicker: 'STRENGTH · ENDURANCE · HEAVY GRIT',
        color: '#ff6b4a',
        motto: '“Bone softens in comfort; iron hardens in flame.”',
        desc: 'Built for those whose minds clear only when their muscles burn. Cold rivers, dawn sprints, weighted rucks, and unbroken form.',
        activeMembers: '4,820 Active Vanguards',
        activeQuests: '12 Live Trials'
      },
      {
        id: 'tale',
        name: 'The Brotherhood of Tale',
        kicker: 'INTELLECT · CRAFT · DENSE STUDY',
        color: '#5b8def',
        motto: '“A mind starved of ink feeds on digital static.”',
        desc: 'Dedicated to the physical page, mechanical creation, and unhurried craftsmanship. Read deep texts, sketch by hand, build physical relics.',
        activeMembers: '3,940 Scholars',
        activeQuests: '15 Live Trials'
      },
      {
        id: 'time',
        name: 'The Keepers of Time',
        kicker: 'WISDOM · STILLNESS · NATURE FAST',
        color: '#4ecb8a',
        motto: '“The modern clock rushes; the mountain waits.”',
        desc: 'Reclaiming the forgotten art of doing nothing in the woods. Device-free treks, silent breakfasts, and stillness when the world panics.',
        activeMembers: '5,110 Wardens',
        activeQuests: '9 Live Trials'
      },
      {
        id: 'wind',
        name: 'The Wind Shifters',
        kicker: 'CHARISMA · UNCOMFORTABLE HONESTY',
        color: '#f5b945',
        motto: '“A stranger is a library you haven’t opened yet.”',
        desc: 'Forcing human contact back into everyday life. Calling instead of texting, asking deep questions to baristas, striking up impromptu banter.',
        activeMembers: '6,230 Diplomats',
        activeQuests: '14 Live Trials'
      },
      {
        id: 'forsaken',
        name: 'The Seekers of Forsaken',
        kicker: 'RADICAL DISCIPLINE · COLD TRUTH',
        color: '#b388ff',
        motto: '“Where you stumble, there lies your treasure.”',
        desc: 'Hunting down your most deeply avoided discomforts. Confronting the phone call you dread, walking through cold fog, facing hard truth.',
        activeMembers: '2,890 Ascetics',
        activeQuests: '8 Live Trials'
      }
    ];

    this.init();
  }

  init() {
    this.el = document.createElement('section');
    this.el.id = 'ch-guilds';
    this.el.className = 'valk-section ch-guilds';
    this.el.innerHTML = `
      <div class="section-container">
        <div class="colontitle-bar">
          <div class="colontitle-tag">
            <span class="colon-dot"></span>
            <span>ABOUT GUILDS</span>
          </div>
          <span class="colon-num">CHAPTER 07</span>
        </div>

        <div class="guilds-header">
          <span class="guilds-kicker">CHOOSE YOUR ORDER</span>
          <h2 class="guilds-heading">
            Pick your guilds.<br>
            <em>They define your quests.</em>
          </h2>
          <p class="guilds-sub">
            A guild is a corner of Valkyrie built around one core discipline. Getting strong. Getting out more. Slowing down. Making things. Join the brotherhood that demands the best of you.
          </p>
        </div>

        <div class="guilds-stage-layout">
          <div class="guilds-wheel-wrapper">
            <div class="wheel-center-crest">
              <svg viewBox="0 0 40 40" width="36" height="36" fill="currentColor">
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="M20 6 L23 17 L34 20 L23 23 L20 34 L17 23 L6 20 L17 17 Z"/>
              </svg>
            </div>

            <div class="guilds-wheel" id="g-wheel">
              ${Array.from({ length: this.spokeCount }, (_, i) => {
                const angle = (i * 360) / this.spokeCount;
                const guild = this.guilds[i % this.guilds.length];
                return `
                  <div class="wheel-spoke" style="transform: rotate(${angle}deg)" data-idx="${i % this.guilds.length}">
                    <div class="spoke-crest" style="color: ${guild.color}">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            
            <div class="wheel-indicator-needle">▼</div>
          </div>

          <div class="guild-info-card">
            <div class="guild-card-top">
              <span class="g-kicker" id="g-kicker" style="color:#ff6b4a">STRENGTH · ENDURANCE · HEAVY GRIT</span>
              <h3 class="g-name" id="g-name">The Temperers of Steel</h3>
              <blockquote class="g-motto" id="g-motto">“Bone softens in comfort; iron hardens in flame.”</blockquote>
              <p class="g-desc" id="g-desc">
                Built for those whose minds clear only when their muscles burn. Cold rivers, dawn sprints, weighted rucks, and unbroken form.
              </p>
            </div>

            <div class="guild-meta-grid">
              <div class="g-stat-box">
                <span class="meta-label">ACTIVE ROSTER</span>
                <strong class="meta-val" id="g-members">4,820 Active Vanguards</strong>
              </div>
              <div class="g-stat-box">
                <span class="meta-label">DISCIPLINE TRIALS</span>
                <strong class="meta-val" id="g-trials">12 Live Trials</strong>
              </div>
            </div>

            <button class="guild-join-btn" id="g-join-btn">
              <span>PLEDGE ALLEGIANCE ➔</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.setupWheel();
  }

  setupWheel() {
    this.wheelEl = this.el.querySelector('#g-wheel');
    const container = this.el.querySelector('.guilds-wheel-wrapper');

    let isDown = false;
    let lastX = 0;
    let lastAngle = 0;

    const onDown = (e) => {
      isDown = true;
      lastX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    };

    const onMove = (e) => {
      if (!isDown) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const deltaX = clientX - lastX;
      lastX = clientX;
      this.targetAngle += deltaX * 0.45;
      this.startWheelAnimation();

      if (Math.abs(this.targetAngle - lastAngle) > 22.5) {
        sound.playTick();
        lastAngle = this.targetAngle;
        const normalized = Math.floor(((-this.targetAngle % 360) + 360) / (360 / this.spokeCount));
        this.selectGuild(normalized % this.guilds.length);
      }
    };

    const onUp = () => {
      isDown = false;
    };

    container.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);

    container.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    this.el.querySelectorAll('.wheel-spoke').forEach((spoke) => {
      spoke.addEventListener('click', () => {
        const idx = parseInt(spoke.getAttribute('data-idx'));
        sound.playHover();
        this.selectGuild(idx);
      });
    });

    const joinBtn = this.el.querySelector('#g-join-btn');
    joinBtn.addEventListener('click', () => {
      sound.playWarp();
      joinBtn.classList.add('pledged');
      joinBtn.querySelector('span').textContent = 'OATH RECORDED IN THE TOMES';
      setTimeout(() => {
        joinBtn.classList.remove('pledged');
        joinBtn.querySelector('span').textContent = 'PLEDGE ALLEGIANCE ➔';
      }, 3000);
    });
  }

  startWheelAnimation() {
    if (this.rafId) return;

    const loop = () => {
      const diff = this.targetAngle - this.currentAngle;
      if (Math.abs(diff) < 0.05) {
        this.currentAngle = this.targetAngle;
        this.wheelEl.style.transform = `rotate(${this.currentAngle}deg)`;
        this.rafId = null;
        return;
      }

      this.currentAngle += diff * 0.12;
      this.wheelEl.style.transform = `rotate(${this.currentAngle}deg)`;
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  selectGuild(index) {
    this.activeGuildIndex = index;
    const g = this.guilds[index];

    const kicker = this.el.querySelector('#g-kicker');
    kicker.textContent = g.kicker;
    kicker.style.color = g.color;

    this.el.querySelector('#g-name').textContent = g.name;
    this.el.querySelector('#g-motto').textContent = g.motto;
    this.el.querySelector('#g-desc').textContent = g.desc;
    this.el.querySelector('#g-members').textContent = g.activeMembers;
    this.el.querySelector('#g-trials').textContent = g.activeQuests;
  }
}
