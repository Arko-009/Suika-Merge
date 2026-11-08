/**
 * Cyber Funnel / Hexagonal chamber with sloped sliding neon walls and wide top opening.
 */
export class HexagonContainer {
  constructor() {
    this.containerType = 'HEXAGON';

    this.centerX = 0;
    this.circleCenterY = 0;
    this.circleRadius = 0;
    this.neckHalfWidth = 0;
    this.neckTopY = 0;
    this.neckBottomY = 0;
    this.dangerLineY = 0;

    this.topLeftX = 0;
    this.topRightX = 0;
    this.midLeftX = 0;
    this.midRightX = 0;
    this.botLeftX = 0;
    this.botRightX = 0;
    this.topY = 0;
    this.midY = 0;
    this.botY = 0;

    this.rainbowRotation = 0;
    this.dangerPulseTime = 0;
  }

  setup(viewWidth, viewHeight) {
    this.centerX = viewWidth / 2;

    const chamberWidth = Math.min(viewWidth * 0.88, viewHeight * 0.48);
    const chamberHeight = Math.min(viewHeight * 0.58, chamberWidth * 1.55);

    this.botY = viewHeight - 75;
    this.topY = this.botY - chamberHeight;
    this.midY = this.topY + chamberHeight * 0.40;

    this.topLeftX = this.centerX - chamberWidth * 0.48;
    this.topRightX = this.centerX + chamberWidth * 0.48;

    this.midLeftX = this.centerX - chamberWidth * 0.48;
    this.midRightX = this.centerX + chamberWidth * 0.48;

    this.botLeftX = this.centerX - chamberWidth * 0.28;
    this.botRightX = this.centerX + chamberWidth * 0.28;

    this.neckTopY = this.topY;
    this.neckBottomY = this.topY + 45;
    this.neckHalfWidth = chamberWidth * 0.42;

    this.circleCenterY = this.topY + chamberHeight * 0.55;
    this.circleRadius = chamberWidth / 2;

    this.dangerLineY = this.topY + chamberHeight * 0.16;
  }

  update(deltaTime) {
    this.rainbowRotation = (this.rainbowRotation + deltaTime * 35) % 360;
    this.dangerPulseTime += deltaTime * 5;
  }

  resolveBallCollision(ball, restitution = 0.25, friction = 0.03) {
    if (ball.y + ball.radius < this.topY) return false;

    let collided = false;

    // 1. Upper Left Vertical Wall (topY to midY)
    if (ball.y >= this.topY && ball.y <= this.midY) {
      if (ball.x - ball.radius < this.midLeftX) {
        const pen = this.midLeftX - (ball.x - ball.radius);
        ball.x += pen;
        if (ball.vx < 0) ball.vx = -ball.vx * restitution;
        ball.angularVelocity = -ball.vy * 0.001;
        collided = true;
      }
    }

    // 2. Upper Right Vertical Wall (topY to midY)
    if (ball.y >= this.topY && ball.y <= this.midY) {
      if (ball.x + ball.radius > this.midRightX) {
        const pen = (ball.x + ball.radius) - this.midRightX;
        ball.x -= pen;
        if (ball.vx > 0) ball.vx = -ball.vx * restitution;
        ball.angularVelocity = ball.vy * 0.001;
        collided = true;
      }
    }

    // 3. Lower Left Sloped Wall
    if (this.collideSegment(ball, this.midLeftX, this.midY, this.botLeftX, this.botY, restitution, friction)) {
      collided = true;
    }

    // 4. Lower Right Sloped Wall
    if (this.collideSegment(ball, this.botRightX, this.botY, this.midRightX, this.midY, restitution, friction)) {
      collided = true;
    }

    // 5. Bottom Floor
    if (ball.x >= this.botLeftX - ball.radius * 0.2 && ball.x <= this.botRightX + ball.radius * 0.2) {
      if (ball.y + ball.radius > this.botY) {
        const pen = (ball.y + ball.radius) - this.botY;
        ball.y -= pen;
        if (ball.vy > 0) ball.vy = -ball.vy * restitution;
        ball.vx *= (1 - friction);
        collided = true;
      }
    }

    return collided;
  }

  collideSegment(ball, ax, ay, bx, by, restitution, friction) {
    const abx = bx - ax;
    const aby = by - ay;
    const abLenSq = abx * abx + aby * aby;
    if (abLenSq < 1e-5) return false;

    const t = Math.max(0, Math.min(1, ((ball.x - ax) * abx + (ball.y - ay) * aby) / abLenSq));
    const cx = ax + t * abx;
    const cy = ay + t * aby;

    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const distSq = dx * dx + dy * dy;

    if (distSq < ball.radius * ball.radius) {
      const dist = Math.sqrt(distSq);
      if (dist > 0.0001) {
        const nx = dx / dist;
        const ny = dy / dist;
        const pen = ball.radius - dist;

        ball.x += nx * pen;
        ball.y += ny * pen;

        const vn = ball.vx * nx + ball.vy * ny;
        if (vn < 0) {
          const vtx = ball.vx - vn * nx;
          const vty = ball.vy - vn * ny;
          ball.vx = -vn * restitution * nx + vtx * (1 - friction);
          ball.vy = -vn * restitution * ny + vty * (1 - friction);
          ball.angularVelocity += (vtx * ny - vty * nx) * 0.001;
        }
        return true;
      }
    }
    return false;
  }

  draw(ctx, isInDanger) {
    ctx.save();

    const grad = ctx.createLinearGradient(this.topLeftX, this.topY, this.topRightX, this.botY);
    grad.addColorStop(0.0, '#00FF66');
    grad.addColorStop(0.3, '#00E5FF');
    grad.addColorStop(0.6, '#7B2CBF');
    grad.addColorStop(1.0, '#FF0055');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.topLeftX, this.topY);
    ctx.lineTo(this.midLeftX, this.midY);
    ctx.lineTo(this.botLeftX, this.botY);
    ctx.lineTo(this.botRightX, this.botY);
    ctx.lineTo(this.midRightX, this.midY);
    ctx.lineTo(this.topRightX, this.topY);

    // Glow
    ctx.strokeStyle = grad;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00FF66';
    ctx.globalAlpha = 0.35;
    ctx.stroke();

    // Core
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 6;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00E5FF';
    ctx.stroke();
    ctx.restore();

    // Danger line
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([12, 10]);
    ctx.moveTo(this.topLeftX + 8, this.dangerLineY);
    ctx.lineTo(this.topRightX - 8, this.dangerLineY);

    if (isInDanger) {
      const pulse = 0.5 + 0.5 * Math.sin(this.dangerPulseTime);
      ctx.strokeStyle = `rgba(255, 82, 82, ${0.4 + 0.6 * pulse})`;
      ctx.lineWidth = 4;
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 12;
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(255, 82, 82, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }
}
