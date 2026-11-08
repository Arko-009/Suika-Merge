/**
 * High-performance visual juice: particle bursts, expanding shockwaves,
 * floating score numbers, and screen shake.
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.shockwaves = [];
    this.scorePopups = [];

    this.shakeIntensity = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    this.palette = [
      '#4DEEEA', '#FFDD00', '#FF7700', '#FF0055',
      '#7B2CBF', '#00FF66', '#FFFFFF', '#00E5FF'
    ];
  }

  clear() {
    this.particles = [];
    this.shockwaves = [];
    this.scorePopups = [];
    this.shakeIntensity = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  triggerMergeBurst(x, y, radius, level) {
    const count = 18 + level * 3;
    const color = this.palette[level % this.palette.length];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * (120 + level * 20);
      this.particles.push({
        x: x + Math.cos(angle) * (radius * 0.4),
        y: y + Math.sin(angle) * (radius * 0.4),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        radius: 3 + Math.random() * 4,
        color: color,
        life: 0.65 + Math.random() * 0.35,
        maxLife: 1.0,
        alpha: 1.0
      });
    }

    // Expanding shockwave ring
    this.shockwaves.push({
      x,
      y,
      radius: radius * 0.6,
      maxRadius: radius * 2.2,
      color: color,
      life: 0.35,
      maxLife: 0.35
    });

    // Screen shake scales with cat size
    if (level >= 3) {
      this.shakeIntensity = Math.min(24, this.shakeIntensity + 4 + level * 1.5);
    }
  }

  triggerScorePopup(x, y, points, combo = 1) {
    this.scorePopups.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      text: combo > 1 ? `+${points.toLocaleString()} (${combo}x!)` : `+${points.toLocaleString()}`,
      color: combo > 1 ? '#FFDD00' : '#4DEEEA',
      life: 0.9,
      maxLife: 0.9,
      vy: -70
    });
  }

  update(deltaTime) {
    // 1. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= deltaTime;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += 450 * deltaTime; // gravity
      p.alpha = Math.max(0, p.life / p.maxLife);
    }

    // 2. Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= deltaTime;
      if (sw.life <= 0) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      const progress = 1 - sw.life / sw.maxLife;
      sw.currentRadius = sw.radius + (sw.maxRadius - sw.radius) * progress;
      sw.alpha = Math.max(0, sw.life / sw.maxLife);
    }

    // 3. Update score popups
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const sp = this.scorePopups[i];
      sp.life -= deltaTime;
      if (sp.life <= 0) {
        this.scorePopups.splice(i, 1);
        continue;
      }
      sp.y += sp.vy * deltaTime;
      sp.alpha = Math.max(0, sp.life / sp.maxLife);
    }

    // 4. Update screen shake
    if (this.shakeIntensity > 0.05) {
      this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - deltaTime * 30);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  draw(ctx) {
    ctx.save();

    // Draw shockwaves
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha * 0.7;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.currentRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw particles
    for (const p of this.particles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw floating score numbers
    for (const sp of this.scorePopups) {
      ctx.save();
      ctx.font = 'bold 20px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = sp.alpha;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(sp.text, sp.x, sp.y);
      ctx.restore();
    }

    ctx.restore();
  }
}

