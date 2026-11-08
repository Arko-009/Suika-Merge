import { GAME_CATALOG } from './portal/catalog.js';
import { LeaderboardManager } from './portal/leaderboard.js';
import { GameEngine, GameState } from './engine/GameEngine.js';
import { GameCanvas } from './engine/GameCanvas.js';
import { ContainerType, ContainerMeta } from './engine/GameContainer.js';
import { SoundManager } from './engine/SoundManager.js';
import { CatMergeTheme } from './games/catMergeTheme.js';

class SuikaPortalApp {
  constructor() {
    this.soundManager = new SoundManager();
    this.activeGameId = 'cat-merge';
    this.activeTheme = CatMergeTheme;
    this.activeContainerType = localStorage.getItem('suika_selected_shape') || ContainerType.FLASK;

    this.engine = null;
    this.gameCanvas = null;

    this.initDOM();
    this.renderCatalog('all');
    this.renderLeaderboard();
    this.bindPortalEvents();
  }

  initDOM() {
    // Portal elements
    this.portalContainer = document.getElementById('portalContainer');
    this.catalogGrid = document.getElementById('catalogGrid');
    this.categoryTabs = document.querySelectorAll('.tab-btn');
    this.leaderboardBody = document.getElementById('leaderboardBody');
    this.btnNavSound = document.getElementById('btnNavSound');
    this.btnNavFullscreen = document.getElementById('btnNavFullscreen');

    // Game Overlay elements
    this.gameOverlay = document.getElementById('gameOverlay');
    this.canvasElement = document.getElementById('gameCanvas');
    this.hudScore = document.getElementById('hudScore');
    this.hudBest = document.getElementById('hudBest');
    this.hudCurrentImg = document.getElementById('hudCurrentImg');
    this.btnStir = document.getElementById('btnStir');
    this.btnSound = document.getElementById('btnSound');
    this.btnSettings = document.getElementById('btnSettings');
    this.btnBackToPortal = document.getElementById('btnBackToPortal');

    // Pre-game modal
    this.pregameModal = document.getElementById('pregameModal');
    this.pregameTitle = document.getElementById('pregameTitle');
    this.pregameSubtitle = document.getElementById('pregameSubtitle');
    this.pregameHeroIcon = document.getElementById('pregameHeroIcon');
    this.shapeDescText = document.getElementById('shapeDescText');
    this.shapeCards = document.querySelectorAll('.shape-card');
    this.btnStartPlay = document.getElementById('btnStartPlay');
    this.btnExitToPortal = document.getElementById('btnExitToPortal');

    // Modals
    this.modalPause = document.getElementById('modalPause');
    this.btnResume = document.getElementById('btnResume');
    this.btnRestart = document.getElementById('btnRestart');
    this.btnHomeFromPause = document.getElementById('btnHomeFromPause');

    this.modalGameOver = document.getElementById('modalGameOver');
    this.finalScoreVal = document.getElementById('finalScoreVal');
    this.newHighBanner = document.getElementById('newHighBanner');
    this.highestCatImg = document.getElementById('highestCatImg');
    this.highestCatName = document.getElementById('highestCatName');
    this.btnPlayAgain = document.getElementById('btnPlayAgain');
    this.btnHomeFromGameOver = document.getElementById('btnHomeFromGameOver');

    // Update initial audio button icons
    this.updateAudioIcons();
  }

  renderCatalog(filter = 'all') {
    this.catalogGrid.innerHTML = '';

    const games = filter === 'all'
      ? GAME_CATALOG
      : GAME_CATALOG.filter(g => g.category === filter);

    for (const game of games) {
      const card = document.createElement('div');
      card.className = 'game-card';

      const badgeClass = game.isPlayable ? 'badge-playable' : 'badge-coming';
      const playBtn = game.isPlayable
        ? `<button class="btn-card-play" data-game-id="${game.id}">PLAY NOW ▶</button>`
        : `<button class="btn-card-disabled" disabled>SOON</button>`;

      card.innerHTML = `
        <div class="card-thumb">
          <img src="${game.coverImage}" alt="${game.title}" loading="lazy"/>
          <span class="card-badge ${badgeClass}">${game.badge}</span>
          <span class="card-rating">${game.rating}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${game.title}</h3>
          <div class="card-tagline">${game.tagline}</div>
          <p class="card-desc">${game.description}</p>
          <div class="card-footer">
            <span class="card-plays">${game.players}</span>
            ${playBtn}
          </div>
        </div>
      `;

      if (game.isPlayable) {
        card.querySelector('.btn-card-play').addEventListener('click', () => {
          this.openGame(game.id);
        });
      }

      this.catalogGrid.appendChild(card);
    }
  }

  renderLeaderboard() {
    const list = LeaderboardManager.getLeaderboardData(this.activeGameId);
    this.leaderboardBody.innerHTML = '';

    list.forEach((entry, idx) => {
      const row = document.createElement('tr');
      if (entry.isUser) row.className = 'leaderboard-row-user';

      row.innerHTML = `
        <td>${entry.badge || idx + 1}</td>
        <td>${entry.name}</td>
        <td>${entry.score.toLocaleString()}</td>
      `;
      this.leaderboardBody.appendChild(row);
    });
  }

  bindPortalEvents() {
    // Category tabs
    this.categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderCatalog(tab.dataset.category);
      });
    });

    // Audio toggles
    const handleAudioToggle = () => {
      this.soundManager.toggleMute();
      this.updateAudioIcons();
    };
    this.btnNavSound.addEventListener('click', handleAudioToggle);
    this.btnSound.addEventListener('click', handleAudioToggle);

    // Fullscreen toggle
    this.btnNavFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Hero "Play Now" CTA button
    const heroBtn = document.getElementById('btnHeroPlay');
    if (heroBtn) {
      heroBtn.addEventListener('click', () => this.openGame('cat-merge'));
    }

    // Pre-game shape selector cards
    this.shapeCards.forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.shape;
        this.selectShape(type);
      });
    });

    // Start Game from pre-game modal
    this.btnStartPlay.addEventListener('click', () => {
      this.startGame();
    });

    // Exit pre-game to portal
    this.btnExitToPortal.addEventListener('click', () => {
      this.closeGame();
    });
    this.btnBackToPortal.addEventListener('click', () => {
      this.closeGame();
    });

    // Stir button
    this.btnStir.addEventListener('click', () => {
      if (this.engine) this.engine.stirContainer();
    });

    // Settings / Pause button
    this.btnSettings.addEventListener('click', () => {
      if (this.engine) {
        this.engine.pause();
        this.modalPause.classList.remove('hidden');
      }
    });

    // Resume button
    this.btnResume.addEventListener('click', () => {
      this.modalPause.classList.add('hidden');
      if (this.engine) this.engine.resume();
    });

    // Restart button
    this.btnRestart.addEventListener('click', () => {
      this.modalPause.classList.add('hidden');
      if (this.engine) this.engine.startNewGame();
    });

    // Home from pause
    this.btnHomeFromPause.addEventListener('click', () => {
      this.modalPause.classList.add('hidden');
      this.closeGame();
    });

    // Play again
    this.btnPlayAgain.addEventListener('click', () => {
      this.modalGameOver.classList.add('hidden');
      if (this.engine) this.engine.startNewGame();
    });

    // Home from game over
    this.btnHomeFromGameOver.addEventListener('click', () => {
      this.modalGameOver.classList.add('hidden');
      this.closeGame();
    });
  }

  selectShape(type) {
    this.activeContainerType = type;
    localStorage.setItem('suika_selected_shape', type);

    this.shapeCards.forEach(c => {
      if (c.dataset.shape === type) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    const meta = ContainerMeta[type];
    if (meta) {
      this.shapeDescText.textContent = meta.tagline;
    }
  }

  openGame(gameId) {
    const game = GAME_CATALOG.find(g => g.id === gameId);
    if (!game || !game.isPlayable) return;

    this.activeGameId = game.id;
    this.activeTheme = game.theme;

    // Show game overlay
    this.gameOverlay.classList.remove('hidden');

    // Setup pre-game modal
    this.pregameTitle.textContent = game.title.toUpperCase();
    this.pregameSubtitle.textContent = game.theme.subtitle;
    this.pregameHeroIcon.src = game.theme.getImageUrl(0);

    this.selectShape(this.activeContainerType);
    this.pregameModal.classList.remove('hidden');

    // Create or reconfigure engine
    if (!this.engine) {
      this.engine = new GameEngine(this.activeTheme, this.activeContainerType, this.soundManager);
      this.setupEngineCallbacks();
      this.gameCanvas = new GameCanvas(this.canvasElement, this.engine);
    } else {
      this.engine.setTheme(this.activeTheme);
      this.engine.setContainerType(this.activeContainerType, this.canvasElement.clientWidth, this.canvasElement.clientHeight);
      this.gameCanvas.initImages();
      this.gameCanvas.resize();
    }

    this.gameCanvas.start();
  }

  setupEngineCallbacks() {
    this.engine.onScoreChanged = (score, high) => {
      this.hudScore.textContent = score.toLocaleString();
      this.hudBest.textContent = high.toLocaleString();
    };

    this.engine.onCurrentMaxBallChanged = (level) => {
      this.hudCurrentImg.src = this.activeTheme.getImageUrl(level);
      this.hudCurrentImg.classList.add('pop');
      setTimeout(() => this.hudCurrentImg.classList.remove('pop'), 180);
    };

    this.engine.onGameOver = (finalScore, highestLvl, isNewHigh) => {
      this.finalScoreVal.textContent = finalScore.toLocaleString();
      this.newHighBanner.style.display = isNewHigh ? 'block' : 'none';

      this.highestCatImg.src = this.activeTheme.getImageUrl(highestLvl);
      this.highestCatName.textContent = this.activeTheme.names[highestLvl] || `Level ${highestLvl}`;

      this.modalGameOver.classList.remove('hidden');
      this.renderLeaderboard();
    };

    this.engine.onCombo = (combo) => {
      if (navigator.vibrate) navigator.vibrate(30);
    };
  }

  startGame() {
    this.pregameModal.classList.add('hidden');
    this.engine.setContainerType(this.activeContainerType, this.canvasElement.clientWidth, this.canvasElement.clientHeight);
    this.gameCanvas.resize();
    this.engine.startNewGame();
  }

  closeGame() {
    if (this.engine) {
      this.engine.pause();
    }
    this.modalPause.classList.add('hidden');
    this.modalGameOver.classList.add('hidden');
    this.pregameModal.classList.add('hidden');
    this.gameOverlay.classList.add('hidden');

    this.renderLeaderboard();
  }

  updateAudioIcons() {
    const icon = this.soundManager.isMuted ? '🔇' : '🔊';
    if (this.btnNavSound) this.btnNavSound.textContent = icon;
    if (this.btnSound) this.btnSound.textContent = icon;
  }
}

// Bootstrap on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new SuikaPortalApp();
});
