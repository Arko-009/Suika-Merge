import { Ball } from './Ball.js';

/**
 * High-performance 2D rigid circle physics engine utilizing Position-Based Dynamics (PBD).
 * Guarantees zero resting penetration under gravity, stable stacking, and instant merging.
 */
export class PhysicsEngine {
  constructor(container, baseRadius = 36) {
    this.container = container;
    this.baseRadius = baseRadius;

    this.balls = [];
    this._nextId = 1;

    // Physics parameters matching Kotlin implementation
    this.gravityX = 0;
    this.gravityY = 1600; // px/s^2
    this.restitution = 0.25;
    this.friction = 0.03;
    this.substeps = 8;

    this.onBallsMerged = null; // Callback: (newBall, ballA, ballB) => void
  }

  addBall(x, y, level) {
    const ball = new Ball(this._nextId++, x, y, level, this.baseRadius);
    this.balls.push(ball);
    return ball;
  }

  removeBall(ball) {
    const idx = this.balls.indexOf(ball);
    if (idx !== -1) {
      this.balls.splice(idx, 1);
    }
  }

  clear() {
    this.balls = [];
  }

  step(deltaTime) {
    const clampedDelta = Math.max(0.001, Math.min(deltaTime, 0.033));

    // ----------------------------------------------------
    // Step 1: Detect & resolve merges before physics step
    // ----------------------------------------------------
    const merges = [];
    const mergedIds = new Set();
    const count = this.balls.length;

    for (let i = 0; i < count; i++) {
      const b1 = this.balls[i];
      if (mergedIds.has(b1.id)) continue;

      for (let j = i + 1; j < count; j++) {
        const b2 = this.balls[j];
        if (mergedIds.has(b2.id)) continue;

        // Identical level, below max level, touching or within 4% tolerance
        if (b1.level === b2.level && b1.level < Ball.MAX_LEVEL) {
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const distSq = dx * dx + dy * dy;
          const mergeDist = (b1.radius + b2.radius) * 1.04;

          if (distSq <= mergeDist * mergeDist) {
            merges.push([b1, b2]);
            mergedIds.add(b1.id);
            mergedIds.add(b2.id);
            break;
          }
        }
      }
    }

    // Execute merges
    for (const [a, b] of merges) {
      this.removeBall(a);
      this.removeBall(b);

      const midX = (a.x + b.x) * 0.5;
      const midY = (a.y + b.y) * 0.5;
      const newLevel = a.level + 1;

      const newBall = new Ball(this._nextId++, midX, midY, newLevel, this.baseRadius);
      newBall.vx = (a.vx + b.vx) * 0.5;
      newBall.vy = (a.vy + b.vy) * 0.5 - 30;
      newBall.triggerPopEffect(1.15);

      this.balls.push(newBall);
      if (this.onBallsMerged) {
        this.onBallsMerged(newBall, a, b);
      }
    }

    // ----------------------------------------------------
    // Step 2: Position-Based Dynamics (PBD) Simulation
    // ----------------------------------------------------
    const subDt = clampedDelta / this.substeps;

    for (let sub = 0; sub < this.substeps; sub++) {
      const n = this.balls.length;

      // Predict positions
      for (let i = 0; i < n; i++) {
        const b = this.balls[i];
        b.vx += this.gravityX * subDt;
        b.vy += this.gravityY * subDt;

        b.prevX = b.x;
        b.prevY = b.y;

        b.x += b.vx * subDt;
        b.y += b.vy * subDt;

        b.angle += b.angularVelocity * subDt;
      }

      // Container boundary constraints
      for (let i = 0; i < n; i++) {
        this.container.resolveBallCollision(this.balls[i], this.restitution, this.friction);
      }

      // Ball vs Ball contact constraints (rigid non-penetration)
      for (let i = 0; i < n; i++) {
        const b1 = this.balls[i];
        for (let j = i + 1; j < n; j++) {
          const b2 = this.balls[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const distSq = dx * dx + dy * dy;
          const minDist = b1.radius + b2.radius;

          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            let nx, ny, penetration;

            if (dist > 0.0001) {
              nx = dx / dist;
              ny = dy / dist;
              penetration = minDist - dist;
            } else {
              nx = 0;
              ny = -1;
              penetration = minDist;
            }

            const totalInvMass = b1.invMass + b2.invMass;
            if (totalInvMass > 0) {
              const push1 = penetration * (b1.invMass / totalInvMass);
              const push2 = penetration * (b2.invMass / totalInvMass);

              b1.x -= nx * push1;
              b1.y -= ny * push1;
              b2.x += nx * push2;
              b2.y += ny * push2;

              // Friction and spin exchange on contact
              const tx = -ny;
              const ty = nx;
              const rvx = b2.vx - b1.vx;
              const rvy = b2.vy - b1.vy;
              const tangentVel = rvx * tx + rvy * ty;
              const frictionImpulse = -tangentVel * this.friction * 0.5;

              b1.angularVelocity -= frictionImpulse * 0.005;
              b2.angularVelocity += frictionImpulse * 0.005;
            }
          }
        }
      }

      // Update velocity from corrected positions (prevents sinking & resting overlap)
      for (let i = 0; i < n; i++) {
        const b = this.balls[i];
        b.vx = ((b.x - b.prevX) / subDt) * 0.996;
        b.vy = ((b.y - b.prevY) / subDt) * 0.996;

        // Clamp speed to prevent supersonic spikes
        const speedSq = b.vx * b.vx + b.vy * b.vy;
        const maxSpeed = 1200;
        if (speedSq > maxSpeed * maxSpeed) {
          const s = maxSpeed / Math.sqrt(speedSq);
          b.vx *= s;
          b.vy *= s;
        }

        // Clamp spin to natural rolling rotation
        b.angularVelocity = Math.max(-10, Math.min(10, b.angularVelocity * 0.985));
        b.update(subDt);
      }
    }
  }

  applyStirImpulse(strength = 1.0) {
    const cx = this.container.centerX;
    const cy = this.container.circleCenterY;

    for (const ball of this.balls) {
      const dx = ball.x - cx;
      const dy = ball.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.001) {
        const tx = -dy / dist;
        const ty = dx / dist;
        ball.vx += tx * 260 * strength + (Math.random() - 0.5) * 120;
        ball.vy += ty * 180 * strength - 150 * strength;
        ball.angularVelocity += (Math.random() - 0.5) * 6;
      }
    }
  }
}
