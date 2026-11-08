import { ContainerFactory, ContainerType } from './GameContainer.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { ParticleSystem } from './ParticleSystem.js';
import { SoundManager } from './SoundManager.js';

export const GameState = {
  READY: 'READY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

export class GameEngine {
  constructor(theme, containerType = ContainerType.FLASK, soundManager = null) {
    this.theme = theme;
    this.containerType = containerType;
    this.soundManager = soundManager || new SoundManager();
    this.particleSystem = new ParticleSystem();

    this.container = ContainerFactory.create(this.containerType);
    this.physics = new PhysicsEngine(this.container, 32);

    this.state = GameState.READY;

    // Scores
    this.currentScore = 0;
    this.highScoreKey = `suika_highscore_${this.theme.id}`;
    this.highScore = parseInt(localStorage.getItem(this.highScoreKey) || '0', 10);
    this.currentMaxLevel = 0;
    this.totalMergesKey = `suika_merges_${this.theme.id}`;
    this.totalMerges = parseInt(localStorage.getItem(this.totalMergesKey) || '0', 10);

    // Combo system
    this.comboCount = 1;
    this.lastMergeTime = 0;
    this.comboWindowMs = 1200;

    // Dropper
    this.dropperX = 0;
    this.currentDropperLevel = 0;
    this.nextBallLevel = 0;
    this.dropInterval = 1.0;
    this.dropCountdown = this.dropInterval;
    this.canDrop = true;

    // Danger / Overflow
    this.dangerTimer = 0;
    this.maxDangerDuration = 3.0;
    this.isWarningActive = false;

    // Callbacks
    this.onScoreChanged = null;
    this.onCurrentMaxBallChanged = null;
    this.onGameOver = null;
    this.onCombo = null;

    // Bind physics merge listener
    this.physics.onBallsMerged = (newBall, a, b) => this.handleBallsMerged(newBall, a, b);

    this.prepareNextBall();
  }

  setContainerType(type, viewWidth, viewHeight) {
    this.containerType = type;
    this.container = ContainerFactory.create(type);
    if (viewWidth > 0 && viewHeight > 0) {
      this.container.setup(viewWidth, viewHeight);
    }
    this.physics.container = this.container;
  }

  setTheme(theme) {
    this.theme = theme;
    this.highScoreKey = `suika_highscore_${this.theme.id}`;
    this.highScore = parseInt(localStorage.getItem(this.highScoreKey) || '0', 10);
    this.totalMergesKey = `suika_merges_${this.theme.id}`;
    this.totalMerges = parseInt(localStorage.getItem(this.totalMergesKey) || '0', 10);
  }

  startNewGame() {
    this.physics.clear();
    this.particleSystem.clear();

    this.currentScore = 0;
    this.comboCount = 1;
    this.dangerTimer = 0;
    this.isWarningActive = false;
    this.dropCountdown = this.dropInterval;
    this.canDrop = true;

    this.dropperX = this.container.centerX;
    this.currentDropperLevel = 0;
    this.currentMaxLevel = 0;
    this.prepareNextBall();

    this.state = GameState.PLAYING;

    if (this.onScoreChanged) this.onScoreChanged(this.currentScore, this.highScore);
    if (this.onCurrentMaxBallChanged) this.onCurrentMaxBallChanged(this.currentMaxLevel);
  }

  pause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
    }
  }

  resume() {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
    }
  }

  prepareNextBall() {
    const roll = Math.random();
    if (this.currentScore > 1500 && roll < 0.25) {
      this.nextBallLevel = roll < 0.08 ? 2 : 1;
    } else if (this.currentScore > 500 && roll < 0.15) {
      this.nextBallLevel = 1;
    } else {
      this.nextBallLevel = 0;
    }
  }

  dropBall() {
    if (this.state !== GameState.PLAYING || !this.canDrop) return;

    const minX = this.container.centerX - this.container.neckHalfWidth * 0.75;
    const maxX = this.container.centerX + this.container.neckHalfWidth * 0.75;
    const clampedX = Math.max(minX, Math.min(this.dropperX, maxX));
    const dropY = this.container.neckTopY - 20;

    const ball = this.physics.addBall(clampedX, dropY, this.currentDropperLevel);
    ball.vy = 120;
    ball.angularVelocity = (Math.random() - 0.5) * 4;

    if (this.currentDropperLevel > this.currentMaxLevel) {
      this.currentMaxLevel = this.currentDropperLevel;
      if (this.onCurrentMaxBallChanged) this.onCurrentMaxBallChanged(this.currentMaxLevel);
    }

    this.soundManager.playDropSound();

    // Advance dropper queue
    this.currentDropperLevel = this.nextBallLevel;
    this.prepareNextBall();
    this.dropCountdown = this.dropInterval;
  }

  setDropperPosition(x) {
    const minX = this.container.centerX - this.container.neckHalfWidth * 0.85;
    const maxX = this.container.centerX + this.container.neckHalfWidth * 0.85;
    this.dropperX = Math.max(minX, Math.min(x, maxX));
  }

  stirContainer() {
    if (this.state !== GameState.PLAYING) return;
    this.physics.applyStirImpulse(1.0);
    this.soundManager.playBounceSound(0.6);
  }

  update(deltaTime) {
    if (this.state !== GameState.PLAYING) return;

    // 1. Auto-drop countdown
    this.dropCountdown -= deltaTime;
    if (this.dropCountdown <= 0) {
      this.dropBall();
    }

    // 2. Physics step
    this.physics.step(deltaTime);

    // 3. Container update & overflow danger check
    this.container.update(deltaTime);
    this.checkDanger(deltaTime);

    // 4. Particle juice
    this.particleSystem.update(deltaTime);

    // 5. Combo reset
    const now = performance.now();
    if (this.comboCount > 1 && (now - this.lastMergeTime) > this.comboWindowMs) {
      this.comboCount = 1;
    }
  }

  checkDanger(deltaTime) {
    let anyInDanger = false;
    const dangerY = this.container.dangerLineY;

    for (const ball of this.physics.balls) {
      if ((ball.y - ball.radius) < dangerY && ball.vy < 50) {
        anyInDanger = true;
        break;
      }
    }

    if (anyInDanger) {
      this.isWarningActive = true;
      this.dangerTimer += deltaTime;
      if (this.dangerTimer >= this.maxDangerDuration) {
        this.triggerGameOver();
      }
    } else {
      this.isWarningActive = false;
      this.dangerTimer = Math.max(0, this.dangerTimer - deltaTime * 1.5);
    }
  }

  triggerGameOver() {
    this.state = GameState.GAME_OVER;
    const isNewHigh = this.currentScore > this.highScore;
    if (isNewHigh) {
      this.highScore = this.currentScore;
      localStorage.setItem(this.highScoreKey, this.highScore.toString());
    }

    if (this.onGameOver) {
      this.onGameOver(this.currentScore, this.currentMaxLevel, isNewHigh);
    }
  }

  handleBallsMerged(newBall, a, b) {
    if (this.state !== GameState.PLAYING) return;

    const now = performance.now();
    if (now - this.lastMergeTime <= this.comboWindowMs) {
      this.comboCount++;
      if (this.onCombo) this.onCombo(this.comboCount);
    } else {
      this.comboCount = 1;
    }
    this.lastMergeTime = now;

    const points = newBall.scoreValue * this.comboCount;
    this.currentScore += points;

    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      localStorage.setItem(this.highScoreKey, this.highScore.toString());
    }

    if (newBall.level > this.currentMaxLevel) {
      this.currentMaxLevel = newBall.level;
      if (this.onCurrentMaxBallChanged) this.onCurrentMaxBallChanged(this.currentMaxLevel);
    }

    this.totalMerges++;
    localStorage.setItem(this.totalMergesKey, this.totalMerges.toString());

    this.soundManager.playLevelSound(newBall.level);
    this.particleSystem.triggerMergeBurst(newBall.x, newBall.y, newBall.radius, newBall.level);
    this.particleSystem.triggerScorePopup(newBall.x, newBall.y - newBall.radius, points, this.comboCount);

    if (this.onScoreChanged) this.onScoreChanged(this.currentScore, this.highScore);
  }
}
