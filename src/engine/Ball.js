/**
 * Circular rigid body representation for meme cats and other merge items.
 */
export class Ball {
  static RADIUS_MULTIPLIERS = [
    1.00, // Level 0
    1.16, // Level 1
    1.34, // Level 2
    1.54, // Level 3
    1.76, // Level 4
    2.00, // Level 5
    2.26, // Level 6
    2.55, // Level 7
    2.86, // Level 8
    3.20, // Level 9
    3.56, // Level 10
    3.95, // Level 11
    4.38, // Level 12
    4.85  // Level 13
  ];

  static MAX_LEVEL = 13;

  static calculateRadius(level, baseRadius) {
    const idx = Math.max(0, Math.min(level, Ball.RADIUS_MULTIPLIERS.length - 1));
    return baseRadius * Ball.RADIUS_MULTIPLIERS[idx];
  }

  static calculateScore(level) {
    if (level <= 0) return 0;
    return (1 << (level - 1)) * 10;
  }

  constructor(id, x, y, level, baseRadius) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.level = level;
    this.baseRadius = baseRadius;

    // Velocities
    this.vx = 0;
    this.vy = 0;

    // Position-Based Dynamics history
    this.prevX = x;
    this.prevY = y;

    // Angular orientation (radians)
    this.angle = 0;
    this.angularVelocity = 0;

    // Physical radius & mass
    this.radius = Ball.calculateRadius(level, baseRadius);
    this.mass = Math.max(1.0, this.radius * this.radius * 0.005);
    this.invMass = 1.0 / this.mass;

    // Visual scale factor (1.0 = exact physics hitbox)
    this.visualScale = 1.0;
    this.scoreValue = Ball.calculateScore(level);
  }

  update(deltaTime) {
    if (this.visualScale > 1.0) {
      this.visualScale = Math.max(1.0, this.visualScale - deltaTime * 1.8);
    }
  }

  triggerPopEffect(startScale = 1.15) {
    this.visualScale = startScale;
  }
}

