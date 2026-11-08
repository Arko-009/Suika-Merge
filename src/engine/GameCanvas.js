import { Ball } from './Ball.js';
import { GameState } from './GameEngine.js';

/**
 * 60-120 FPS hardware-accelerated Canvas renderer and input controller.
 */
export class GameCanvas {
  constructor(canvas, engine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;

    this.ballImages = new Map(); // level -> Image
    this.ambientBubbles = [];
    this.isRunning = false;
    this.lastTime = performance.now();

    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;

    this.initImages();
    this.initBubbles();
    this.bindEvents();
    this.resize();
  }

  initImages() {
    this.ballImages.clear();
    const maxLvl = this.engine.theme.maxLevel;
    for (let i = 0; i <= maxLvl; i++) {
      const img = new Image();
      img.src = this.engine.theme.getImageUrl(i);
      this.ballImages.set(i, img);
    }
  }

  initBubbles() {
    this.ambientBubbles = [];
    for (let i = 0; i < 20; i++) {
      this.ambientBubbles.push({
        x: Math.random() * (this.width || 600),
        y: Math.random() * (this.height || 900),
        vy: -(15 + Math.random() * 25),
        radius: 3 + Math.random() * 8,
        alpha: 0.1 + Math.random() * 0.25
      });
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.engine.container.setup(this.width, this.height);
    const baseRadius = Math.max(22, Math.min(48, this.engine.container.circleRadius * 0.122));
    this.engine.physics.baseRadius = baseRadius;
    this.engine.dropperX = this.engine.container.centerX;

    if (this.ambientBubbles.length === 0) {
      this.initBubbles();
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  stop() {
    this.isRunning = false;
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    let deltaTime = (currentTime - this.lastTime) / 1000.0;
    this.lastTime = currentTime;

    // Cap delta time to prevent spiral of death on tab switch
    if (deltaTime > 0.05) deltaTime = 0.05;

    // Update simulation
    this.engine.update(deltaTime);
    this.updateBubbles(deltaTime);

    // Render frame
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  updateBubbles(dt) {
    for (const b of this.ambientBubbles) {
      b.y += b.vy * dt;
      if (b.y < -20) {
        b.y = this.height + 20;
        b.x = Math.random() * this.width;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const eng = this.engine;
    const container = eng.container;
    const pSys = eng.particleSystem;

    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Screen shake transform
    if (pSys.shakeIntensity > 0.1) {
      ctx.translate(pSys.shakeOffsetX, pSys.shakeOffsetY);
    }

    // 2. Pure pitch black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    // 3. Ambient floating lab bubbles
    ctx.fillStyle = '#4DEEEA';
    for (const b of this.ambientBubbles) {
      ctx.globalAlpha = b.alpha * 0.4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 4. Container (Glass, Neon wall, Danger line)
    container.draw(ctx, eng.isWarningActive);

    // 5. Active Balls inside container
    for (const ball of eng.physics.balls) {
      this.drawBall(ctx, ball);
    }

    // 6. Aim Guide & Queued Dropper Ball
    if (eng.state === GameState.PLAYING) {
      this.drawDropper(ctx, eng);
    }

    // 7. Visual Juice: Particles, Floating Scores, Shockwaves
    pSys.draw(ctx);

    // 8. Danger Warning Overlay text
    if (eng.isWarningActive) {
      const remainingSec = Math.max(0, eng.maxDangerDuration - eng.dangerTimer).toFixed(1);
      ctx.save();
      ctx.font = 'bold 24px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#FF5252';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 12;
      ctx.fillText(`OVERFLOW IN ${remainingSec}s!`, container.centerX, container.neckTopY - 65);
      ctx.restore();
    }

    ctx.restore();
  }

  drawBall(ctx, ball) {
    const img = this.ballImages.get(ball.level);
    const targetDiameter = ball.radius * 2 * ball.visualScale;

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.angle);

    if (img && img.complete && img.naturalWidth > 0) {
      // Circular clip mask
      ctx.beginPath();
      ctx.arc(0, 0, targetDiameter / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, -targetDiameter / 2, -targetDiameter / 2, targetDiameter, targetDiameter);
    } else {
      // Fallback procedural circle
      ctx.beginPath();
      ctx.arc(0, 0, targetDiameter / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#4DEEEA';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawDropper(ctx, eng) {
    const container = eng.container;
    const dropX = eng.dropperX;
    const dropY = container.neckTopY - 26;
    const currentLvl = eng.currentDropperLevel;
    const ballRadius = Ball.calculateRadius(currentLvl, eng.physics.baseRadius);

    // Dotted aim guide straight down
    ctx.save();
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = 'rgba(77, 238, 234, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dropX, dropY + ballRadius);
    ctx.lineTo(dropX, container.neckBottomY);
    ctx.stroke();
    ctx.restore();

    // Queued ball preview at dropper
    const img = this.ballImages.get(currentLvl);
    const diameter = ballRadius * 2;
    ctx.save();
    ctx.translate(dropX, dropY);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, diameter / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, -diameter / 2, -diameter / 2, diameter, diameter);
    }
    ctx.restore();

    // Circular Auto-Drop Countdown Ring
    const progress = Math.max(0, Math.min(1, eng.dropCountdown / eng.dropInterval));
    const sweepAngle = progress * Math.PI * 2;

    ctx.save();
    // Track
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(dropX, dropY, ballRadius + 8, 0, Math.PI * 2);
    ctx.stroke();

    // Active fill
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(dropX, dropY, ballRadius + 8, -Math.PI / 2, -Math.PI / 2 + sweepAngle, false);
    ctx.stroke();
    ctx.restore();
  }

  bindEvents() {
    let isDragging = false;

    const getX = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return clientX - rect.left;
    };

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      this.engine.setDropperPosition(getX(e));
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging && this.engine.state === GameState.PLAYING) {
        this.engine.setDropperPosition(getX(e));
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (isDragging) {
        isDragging = false;
        if (this.engine.state === GameState.PLAYING) {
          this.engine.dropBall();
        }
      }
    });

    // Touch events (mobile browsers)
    this.canvas.addEventListener('touchstart', (e) => {
      isDragging = true;
      this.engine.setDropperPosition(getX(e));
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (isDragging && this.engine.state === GameState.PLAYING) {
        this.engine.setDropperPosition(getX(e));
      }
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      if (isDragging) {
        isDragging = false;
        if (this.engine.state === GameState.PLAYING) {
          this.engine.dropBall();
        }
      }
      e.preventDefault();
    }, { passive: false });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (this.engine.state !== GameState.PLAYING) return;

      const step = 20;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.engine.setDropperPosition(this.engine.dropperX - step);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.engine.setDropperPosition(this.engine.dropperX + step);
          break;
        case 'ArrowDown':
        case ' ':
          this.engine.dropBall();
          break;
        case 's':
        case 'S':
          this.engine.stirContainer();
          break;
        case 'p':
        case 'P':
        case 'Escape':
          this.engine.pause();
          break;
      }
    });

    // Window resize
    window.addEventListener('resize', () => this.resize());
  }
}

