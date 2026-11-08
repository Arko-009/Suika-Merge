/**
 * Exact Chemistry Flask Container with clean vertical white neck
 * and glowing animated RGB Rainbow circular chamber.
 */
export class FlaskContainer {
  constructor() {
    this.containerType = 'FLASK';

    this.centerX = 0;
    this.circleCenterY = 0;
    this.circleRadius = 0;
    this.neckHalfWidth = 0;
    this.neckTopY = 0;
    this.neckBottomY = 0;
    this.dangerLineY = 0;

    this.rainbowRotation = 0;
    this.dangerPulseTime = 0;

    this.rainbowColors = [
      '#FF0055', '#FF7700', '#FFDD00', '#00FF66',
      '#00E5FF', '#3366FF', '#CC00FF', '#FF0055'
    ];
  }

  setup(viewWidth, viewHeight) {
    this.centerX = viewWidth / 2;

    this.circleRadius = Math.min(viewWidth * 0.44, viewHeight * 0.35);
    this.neckHalfWidth = this.circleRadius * 0.22;
    const neckLength = this.circleRadius * 0.65;

    const dy = Math.sqrt(this.circleRadius * this.circleRadius - this.neckHalfWidth * this.neckHalfWidth);
    const jarTotalHeight = neckLength + dy + this.circleRadius;

    const topHudSpace = Math.min(180, viewHeight * 0.16);
    const bottomMargin = 60;
    const availableHeight = viewHeight - topHudSpace - bottomMargin;

    const verticalOffset = availableHeight > jarTotalHeight
      ? topHudSpace + (availableHeight - jarTotalHeight) * 0.80
      : topHudSpace;

    this.neckTopY = verticalOffset;
    this.neckBottomY = this.neckTopY + neckLength;
    this.circleCenterY = this.neckBottomY + dy;

    this.dangerLineY = this.neckTopY + (this.neckBottomY - this.neckTopY) * 0.35;

    this.halfAngleRad = Math.asin(this.neckHalfWidth / this.circleRadius);
    this.arcStartAngle = -Math.PI / 2 + this.halfAngleRad;
    this.arcEndAngle = 1.5 * Math.PI - this.halfAngleRad;
  }

  update(deltaTime) {
    this.rainbowRotation = (this.rainbowRotation + deltaTime * 40) % 360;
    this.dangerPulseTime += deltaTime * 5;
  }

  resolveBallCollision(ball, restitution = 0.25, friction = 0.03) {
    let collided = false;
    const leftX = this.centerX - this.neckHalfWidth;
    const rightX = this.centerX + this.neckHalfWidth;

    // 1. Inside vertical white neck walls
    if (ball.y < this.neckBottomY) {
      if (ball.x - ball.radius < leftX) {
        const pen = leftX - (ball.x - ball.radius);
        ball.x += pen;
        if (ball.vx < 0) {
          ball.vx = -ball.vx * restitution;
          ball.angularVelocity = -ball.vy * 0.001;
        }
        collided = true;
      }

      if (ball.x + ball.radius > rightX) {
        const pen = (ball.x + ball.radius) - rightX;
        ball.x -= pen;
        if (ball.vx > 0) {
          ball.vx = -ball.vx * restitution;
          ball.angularVelocity = ball.vy * 0.001;
        }
        collided = true;
      }
    }

    // 2. Corner junctions where neck meets the circular chamber
    const cornerY = this.neckBottomY;

    // Left corner point
    const cldx = ball.x - leftX;
    const cldy = ball.y - cornerY;
    const cldistSq = cldx * cldx + cldy * cldy;
    if (cldistSq < ball.radius * ball.radius && ball.x < leftX + ball.radius * 0.5) {
      const dist = Math.sqrt(cldistSq);
      if (dist > 0.0001) {
        const nx = cldx / dist;
        const ny = cldy / dist;
        const pen = ball.radius - dist;
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

    // Right corner point
    const crdx = ball.x - rightX;
    const crdy = ball.y - cornerY;
    const crdistSq = crdx * crdx + crdy * crdy;
    if (crdistSq < ball.radius * ball.radius && ball.x > rightX - ball.radius * 0.5) {
      const dist = Math.sqrt(crdistSq);
      if (dist > 0.0001) {
        const nx = crdx / dist;
        const ny = crdy / dist;
        const pen = ball.radius - dist;
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

    // 3. Inside the circular chamber (ignoring open neck corridor)
    const inNeckOpening = (ball.y < this.circleCenterY) && (Math.abs(ball.x - this.centerX) < (this.neckHalfWidth - 2));

    if (!inNeckOpening) {
      const dx = ball.x - this.centerX;
      const dy = ball.y - this.circleCenterY;
      const distSq = dx * dx + dy * dy;
      const maxAllowedDist = this.circleRadius - ball.radius;

      if (distSq > maxAllowedDist * maxAllowedDist && maxAllowedDist > 0) {
        const dist = Math.sqrt(distSq);
        if (dist > 0.0001) {
          const nx = -dx / dist;
          const ny = -dy / dist;
          const pen = dist - maxAllowedDist;

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
          collided = true;
        }
      }
    }

    return collided;
  }

  draw(ctx, isInDanger) {
    ctx.save();

    const leftX = this.centerX - this.neckHalfWidth;
    const rightX = this.centerX + this.neckHalfWidth;

    // 1. White vertical neck lines (glow + crisp core)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(leftX, this.neckTopY);
    ctx.lineTo(leftX, this.neckBottomY);
    ctx.moveTo(rightX, this.neckTopY);
    ctx.lineTo(rightX, this.neckBottomY);
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    // 2. Circular RGB rainbow neon chamber
    ctx.save();
    ctx.translate(this.centerX, this.circleCenterY);
    ctx.rotate((this.rainbowRotation * Math.PI) / 180);

    // Create rotating conic / sweep gradient
    const grad = ctx.createConicGradient ? ctx.createConicGradient(0, 0, 0) : null;
    if (grad) {
      grad.addColorStop(0.00, '#FF0055');
      grad.addColorStop(0.15, '#FF7700');
      grad.addColorStop(0.30, '#FFDD00');
      grad.addColorStop(0.45, '#00FF66');
      grad.addColorStop(0.60, '#00E5FF');
      grad.addColorStop(0.75, '#3366FF');
      grad.addColorStop(0.90, '#CC00FF');
      grad.addColorStop(1.00, '#FF0055');
    }

    // Outer bloom
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00E5FF';
    ctx.strokeStyle = grad || '#00E5FF';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    // Arc in rotated frame: offset start/end by -rainbowRotation
    const rotOffset = (this.rainbowRotation * Math.PI) / 180;
    ctx.arc(0, 0, this.circleRadius, this.arcStartAngle - rotOffset, this.arcEndAngle - rotOffset);
    ctx.stroke();

    // Inner bright neon stroke
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 6;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FF0055';
    ctx.stroke();
    ctx.restore();

    // 3. Danger Line across neck
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([12, 10]);
    ctx.moveTo(leftX + 6, this.dangerLineY);
    ctx.lineTo(rightX - 6, this.dangerLineY);

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

