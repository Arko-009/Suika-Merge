/**
 * Arcade Rectangular Box container with open top and glowing RGB Rainbow neon borders.
 */
export class BoxContainer {
  constructor() {
    this.containerType = 'BOX';

    this.centerX = 0;
    this.circleCenterY = 0;
    this.circleRadius = 0;
    this.neckHalfWidth = 0;
    this.neckTopY = 0;
    this.neckBottomY = 0;
    this.dangerLineY = 0;

    this.leftX = 0;
    this.rightX = 0;
    this.topY = 0;
    this.bottomY = 0;
    this.cornerRadius = 32;

    this.rainbowRotation = 0;
    this.dangerPulseTime = 0;
  }

  setup(viewWidth, viewHeight) {
    this.centerX = viewWidth / 2;

    const boxWidth = Math.min(viewWidth * 0.86, viewHeight * 0.48);
    const boxHeight = Math.min(viewHeight * 0.58, boxWidth * 1.55);

    this.bottomY = viewHeight - 75;
    this.topY = this.bottomY - boxHeight;
    this.leftX = this.centerX - boxWidth / 2;
    this.rightX = this.centerX + boxWidth / 2;

    this.neckTopY = this.topY;
    this.neckBottomY = this.topY + 45;
    this.neckHalfWidth = boxWidth * 0.42;

    this.circleCenterY = this.topY + boxHeight * 0.55;
    this.circleRadius = boxWidth / 2;

    this.dangerLineY = this.topY + boxHeight * 0.16;
  }

  update(deltaTime) {
    this.rainbowRotation = (this.rainbowRotation + deltaTime * 35) % 360;
    this.dangerPulseTime += deltaTime * 5;
  }

  resolveBallCollision(ball, restitution = 0.25, friction = 0.03) {
    let collided = false;
    if (ball.y + ball.radius < this.topY) return false;

    // 1. Left Wall (straight vertical section)
    if (ball.y < this.bottomY - this.cornerRadius) {
      if (ball.x - ball.radius < this.leftX) {
        const pen = this.leftX - (ball.x - ball.radius);
        ball.x += pen;
        if (ball.vx < 0) {
          ball.vx = -ball.vx * restitution;
          ball.angularVelocity = -ball.vy * 0.001;
        }
        collided = true;
      }
    }

    // 2. Right Wall (straight vertical section)
    if (ball.y < this.bottomY - this.cornerRadius) {
      if (ball.x + ball.radius > this.rightX) {
        const pen = (ball.x + ball.radius) - this.rightX;
        ball.x -= pen;
        if (ball.vx > 0) {
          ball.vx = -ball.vx * restitution;
          ball.angularVelocity = ball.vy * 0.001;
        }
        collided = true;
      }
    }

    // 3. Bottom Wall (straight section between corners)
    const cornerLeft = this.leftX + this.cornerRadius;
    const cornerRight = this.rightX - this.cornerRadius;
    if (ball.x >= cornerLeft && ball.x <= cornerRight) {
      if (ball.y + ball.radius > this.bottomY) {
        const pen = (ball.y + ball.radius) - this.bottomY;
        ball.y -= pen;
        if (ball.vy > 0) ball.vy = -ball.vy * restitution;
        ball.vx *= (1 - friction);
        collided = true;
      }
    }

    // 4. Bottom-Left Corner
    const blcx = this.leftX + this.cornerRadius;
    const blcy = this.bottomY - this.cornerRadius;
    if (ball.x < blcx && ball.y > blcy) {
      const dx = ball.x - blcx;
      const dy = ball.y - blcy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = this.cornerRadius - ball.radius;
      if (dist > maxDist && maxDist > 0 && dist > 0.0001) {
        const nx = -dx / dist;
        const ny = -dy / dist;
        const pen = dist - maxDist;
        ball.x += nx * pen;
        ball.y += ny * pen;
        const vn = ball.vx * nx + ball.vy * ny;
        if (vn < 0) {
          ball.vx -= (1 + restitution) * vn * nx;
          ball.vy -= (1 + restitution) * vn * ny;
        }
        collided = true;
      }
    }

    // 5. Bottom-Right Corner
    const brcx = this.rightX - this.cornerRadius;
    const brcy = this.bottomY - this.cornerRadius;
    if (ball.x > brcx && ball.y > brcy) {
      const dx = ball.x - brcx;
      const dy = ball.y - brcy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = this.cornerRadius - ball.radius;
      if (dist > maxDist && maxDist > 0 && dist > 0.0001) {
        const nx = -dx / dist;
        const ny = -dy / dist;
        const pen = dist - maxDist;
        ball.x += nx * pen;
        ball.y += ny * pen;
        const vn = ball.vx * nx + ball.vy * ny;
        if (vn < 0) {
          ball.vx -= (1 + restitution) * vn * nx;
          ball.vy -= (1 + restitution) * vn * ny;
        }
        collided = true;
      }
    }

    return collided;
  }

  draw(ctx, isInDanger) {
    ctx.save();

    // Create glowing neon U-shaped box
    const grad = ctx.createLinearGradient(this.leftX, this.topY, this.rightX, this.bottomY);
    grad.addColorStop(0.0, '#00E5FF');
    grad.addColorStop(0.4, '#7B2CBF');
    grad.addColorStop(0.7, '#FF0055');
    grad.addColorStop(1.0, '#FFDD00');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.leftX, this.topY);
    ctx.lineTo(this.leftX, this.bottomY - this.cornerRadius);
    ctx.arcTo(this.leftX, this.bottomY, this.leftX + this.cornerRadius, this.bottomY, this.cornerRadius);
    ctx.lineTo(this.rightX - this.cornerRadius, this.bottomY);
    ctx.arcTo(this.rightX, this.bottomY, this.rightX, this.bottomY - this.cornerRadius, this.cornerRadius);
    ctx.lineTo(this.rightX, this.topY);

    // Outer glow
    ctx.strokeStyle = grad;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00E5FF';
    ctx.globalAlpha = 0.35;
    ctx.stroke();

    // Core stroke
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 6;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FF0055';
    ctx.stroke();
    ctx.restore();

    // Danger line
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([12, 10]);
    ctx.moveTo(this.leftX + 8, this.dangerLineY);
    ctx.lineTo(this.rightX - 8, this.dangerLineY);

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

