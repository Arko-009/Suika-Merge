import { sound } from '../sound/SoundEngine.js';

export class Chapter04VoiceGarden {
  constructor() {
    this.el = null;
    this.activeTrack = 0;
    this.isPlaying = false;
    this.vineCanvas = null;
    this.vineCtx = null;
    this.branches = [];
    this.leaves = [];
    this.rafId = null;
    this.waveRafId = null;
    this.isVisible = false;

    this.voiceNotes = [
      {
        id: 1,
        title: 'Trial 04: The Cold Plunge in Dawn River',
        speaker: 'Vanguard Kaelen',
        guild: 'The Temperers of Steel',
        duration: '0:42',
        stat: '+400 STR',
        quote: '“At 5:30 AM my hands were shaking. I thought about staying in bed. When I stepped in, the shock erased every anxious thought in my head.”'
      },
      {
        id: 2,
        title: 'Trial 12: The Unscripted Stranger',
        speaker: 'Seer Aurelia',
        guild: 'The Wind Shifters',
        duration: '1:15',
        stat: '+350 CHA',
        quote: '“I stopped a carpenter carving chess pieces in the square. We spoke for 20 minutes about wood grains. You forget how hungry people are for real contact.”'
      },
      {
        id: 3,
        title: 'Trial 19: Ridge Ascent Without Devices',
        speaker: 'Warden Thorne',
        guild: 'The Keepers of Time',
        duration: '0:58',
        stat: '+500 WIS',
        quote: '“Three hours on the mountain ridge with no podcast, no music, no screen. The silence was deafening for twenty minutes, then pure clarity.”'
      }
    ];

    this.init();
  }

  init() {
    this.el = document.createElement('section');
    this.el.id = 'ch-voice';
    this.el.className = 'valk-section ch-voice';
    this.el.innerHTML = `
      <canvas class="voice-vine-canvas" id="voice-canvas"></canvas>

      <div class="section-container relative-z">
        <div class="colontitle-bar">
          <div class="colontitle-tag">
            <span class="colon-dot"></span>
            <span>ABOUT VOICE FEEDBACK</span>
          </div>
          <span class="colon-num">CHAPTER 04</span>
        </div>

        <div class="voice-header">
          <span class="voice-kicker">THE ECHOES OF CONQUEST</span>
          <h2 class="voice-heading">
            Leave thirty seconds<br>
            <em>while the blood is still warm.</em>
          </h2>
          <p class="voice-sub">
            Before you start, hear how other players survived this trial. When you conquer it, speak your truth into the record. That’s how a fleeting task transforms into permanent lore.
          </p>
        </div>

        <div class="voice-player-card">
          <div class="player-top">
            <div class="active-track-info">
              <span class="track-guild" id="v-guild">THE TEMPERERS OF STEEL</span>
              <h3 class="track-title" id="v-title">Trial 04: The Cold Plunge in Dawn River</h3>
              <span class="track-speaker" id="v-speaker">Recorded by Vanguard Kaelen · +400 STR</span>
            </div>

            <button class="voice-play-btn" id="v-play-btn">
              <svg class="play-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <polygon points="6,3 20,12 6,21" />
              </svg>
              <svg class="pause-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style="display:none;">
                <rect x="5" y="3" width="5" height="18"/>
                <rect x="14" y="3" width="5" height="18"/>
              </svg>
            </button>
          </div>

          <div class="waveform-box">
            <canvas class="waveform-canvas" id="waveform-canvas" width="600" height="70"></canvas>
            <div class="waveform-time-row">
              <span id="v-curr-time">0:00</span>
              <span id="v-total-time">0:42</span>
            </div>
          </div>

          <blockquote class="voice-quote" id="v-quote">
            “At 5:30 AM my hands were shaking. I thought about staying in bed. When I stepped in, the shock erased every anxious thought in my head.”
          </blockquote>

          <div class="voice-track-list">
            ${this.voiceNotes.map((note, idx) => `
              <div class="voice-track-tab ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
                <span class="tab-num">0${idx + 1}</span>
                <div class="tab-meta">
                  <span class="tab-name">${note.title}</span>
                  <span class="tab-stat">${note.stat}</span>
                </div>
                <span class="tab-duration">${note.duration}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.setupVineCanvas();
    this.setupPlayer();
    this.setupObserver();
  }

  setupObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        this.isVisible = entry.isIntersecting;
        if (this.isVisible) {
          if (!this.rafId) this.animateVines(performance.now());
          if (!this.waveRafId) this.drawWave(performance.now());
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(this.el);
  }

  setupVineCanvas() {
    this.vineCanvas = this.el.querySelector('#voice-canvas');
    this.vineCtx = this.vineCanvas.getContext('2d');

    const resize = () => {
      this.vineCanvas.width = this.el.clientWidth;
      this.vineCanvas.height = this.el.clientHeight;
      this.generateVines();
    };
    resize();
    window.addEventListener('resize', resize);
  }

  generateVines() {
    const w = this.vineCanvas.width;
    const h = this.vineCanvas.height;
    this.branches = [];
    this.leaves = [];

    const roots = [
      { x: 0, y: h * 0.35, angle: 0.2, length: w * 0.45, width: 2.5 },
      { x: w, y: h * 0.25, angle: Math.PI - 0.2, length: w * 0.45, width: 2.5 }
    ];

    roots.forEach((root) => {
      let curX = root.x;
      let curY = root.y;
      let curAngle = root.angle;
      const pts = [{ x: curX, y: curY, w: root.width }];

      const steps = 30;
      const stepLen = root.length / steps;

      for (let s = 0; s < steps; s++) {
        curAngle += (Math.random() - 0.5) * 0.18;
        curX += Math.cos(curAngle) * stepLen;
        curY += Math.sin(curAngle) * stepLen;
        const curW = root.width * (1 - s / steps * 0.7);
        pts.push({ x: curX, y: curY, w: Math.max(0.8, curW) });

        if (s > 4 && s % 6 === 0) {
          const side = Math.random() > 0.5 ? 1 : -1;
          this.leaves.push({
            x: curX,
            y: curY,
            size: 4 + Math.random() * 4,
            angle: curAngle + side * 1.2,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
      this.branches.push(pts);
    });
  }

  animateVines(time) {
    if (!this.isVisible) {
      this.rafId = null;
      return;
    }

    this.rafId = requestAnimationFrame((t) => this.animateVines(t));
    this.vineCtx.clearRect(0, 0, this.vineCanvas.width, this.vineCanvas.height);
    const t = time * 0.001;

    this.branches.forEach((pts) => {
      this.vineCtx.beginPath();
      this.vineCtx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const wave = Math.sin(t + i * 0.2) * (this.isPlaying ? 2.5 : 0.8);
        this.vineCtx.lineTo(pts[i].x, pts[i].y + wave);
      }
      this.vineCtx.strokeStyle = 'rgba(202, 168, 110, 0.35)';
      this.vineCtx.lineWidth = 1.5;
      this.vineCtx.stroke();
    });

    this.leaves.forEach((l) => {
      const pulse = Math.sin(t * 2 + l.phase) * (this.isPlaying ? 1.5 : 0.5);
      this.vineCtx.save();
      this.vineCtx.translate(l.x, l.y);
      this.vineCtx.rotate(l.angle);

      this.vineCtx.fillStyle = 'rgba(247, 224, 140, 0.6)';
      this.vineCtx.beginPath();
      this.vineCtx.ellipse(0, 0, l.size + pulse, (l.size + pulse) * 0.45, 0, 0, Math.PI * 2);
      this.vineCtx.fill();

      this.vineCtx.restore();
    });
  }

  setupPlayer() {
    const playBtn = this.el.querySelector('#v-play-btn');
    const playIcon = this.el.querySelector('.play-icon');
    const pauseIcon = this.el.querySelector('.pause-icon');
    const currTimeEl = this.el.querySelector('#v-curr-time');

    let currentSec = 0;
    let playTimer = null;

    playBtn.addEventListener('click', () => {
      this.isPlaying = !this.isPlaying;
      sound.ensureContext();
      sound.playClick();

      if (this.isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        playBtn.classList.add('playing');
        sound.playHover();

        playTimer = setInterval(() => {
          currentSec++;
          const mins = Math.floor(currentSec / 60);
          const secs = currentSec % 60;
          currTimeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
          if (currentSec >= 42) {
            currentSec = 0;
          }
        }, 1000);
      } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        playBtn.classList.remove('playing');
        clearInterval(playTimer);
      }
    });

    // Track tab switching
    const tabs = this.el.querySelectorAll('.voice-track-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        sound.playTick();
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const idx = parseInt(tab.getAttribute('data-idx'));
        this.activeTrack = idx;
        const note = this.voiceNotes[idx];

        this.el.querySelector('#v-guild').textContent = note.guild.toUpperCase();
        this.el.querySelector('#v-title').textContent = note.title;
        this.el.querySelector('#v-speaker').textContent = `Recorded by ${note.speaker} · ${note.stat}`;
        this.el.querySelector('#v-quote').textContent = note.quote;
        this.el.querySelector('#v-total-time').textContent = note.duration;

        currentSec = 0;
        currTimeEl.textContent = '0:00';
      });
    });
  }

  drawWave(t) {
    if (!this.isVisible) {
      this.waveRafId = null;
      return;
    }

    this.waveRafId = requestAnimationFrame((now) => this.drawWave(now));
    const waveCanvas = this.el.querySelector('#waveform-canvas');
    if (!waveCanvas) return;
    const waveCtx = waveCanvas.getContext('2d');

    waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
    const barCount = 36;
    const barWidth = 6;
    const gap = (waveCanvas.width - barCount * barWidth) / (barCount - 1);

    for (let i = 0; i < barCount; i++) {
      let h = 8;
      if (this.isPlaying) {
        const freq = Math.sin(t * 0.006 + i * 0.35) * 0.5 + 0.5;
        const noise = Math.cos(t * 0.009 + i * 0.2) * 0.3;
        h = Math.max(6, (freq + noise) * 55);
      } else {
        h = 6 + Math.sin(i * 0.4) * 4;
      }

      const x = i * (barWidth + gap);
      const y = (waveCanvas.height - h) / 2;

      waveCtx.fillStyle = '#caa86e';
      waveCtx.roundRect(x, y, barWidth, h, 3);
      waveCtx.fill();
    }
  }
}
