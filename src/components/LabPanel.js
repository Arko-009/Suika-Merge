import { sound } from '../sound/SoundEngine.js';

export class LabPanel {
  constructor(spiralDeck) {
    this.deck = spiralDeck;
    this.isOpen = false;
    this.el = null;

    this.state = {
      winding: this.deck.cfg.angleStep || 0.65,
      radius: this.deck.cfg.radius || 3.15,
      cardScale: this.deck.cfg.cardScale || 0.54,
      autoSpeed: this.deck.cfg.autoSpeed || 0.38,
      autoRotate: this.deck.cfg.auto ?? true
    };

    this.init();
  }

  init() {
    this.el = document.createElement('div');
    this.el.className = 'valk-lab-panel';
    this.el.innerHTML = `
      <div class="lab-header">
        <div class="lab-title-row">
          <span class="lab-tag">GRAIL · LAB GL</span>
          <button class="lab-close-btn" id="lab-close">✕</button>
        </div>
        <p class="lab-desc">Bent WebGL planes on a 3D spiral. Adjust parameters in real time.</p>
      </div>

      <div class="lab-controls">
        <!-- Winding -->
        <div class="lab-row">
          <div class="lab-label-row">
            <span>Winding</span>
            <span class="lab-val" id="val-winding">0.65</span>
          </div>
          <input type="range" min="0.25" max="1.1" step="0.02" value="0.65" id="slider-winding" />
        </div>

        <!-- Radius -->
        <div class="lab-row">
          <div class="lab-label-row">
            <span>Radius</span>
            <span class="lab-val" id="val-radius">3.6</span>
          </div>
          <input type="range" min="1.8" max="7.0" step="0.1" value="3.6" id="slider-radius" />
        </div>

        <!-- Card Scale -->
        <div class="lab-row">
          <div class="lab-label-row">
            <span>Card Scale</span>
            <span class="lab-val" id="val-scale">0.95</span>
          </div>
          <input type="range" min="0.4" max="1.5" step="0.05" value="0.95" id="slider-scale" />
        </div>

        <!-- Auto Speed -->
        <div class="lab-row">
          <div class="lab-label-row">
            <span>Auto Speed</span>
            <span class="lab-val" id="val-speed">0.38</span>
          </div>
          <input type="range" min="0" max="2.0" step="0.05" value="0.38" id="slider-speed" />
        </div>

        <!-- Auto Toggle -->
        <div class="lab-row lab-toggle-row">
          <span>Continuous Inertia</span>
          <label class="valk-switch">
            <input type="checkbox" id="toggle-autorotate" checked />
            <span class="valk-slider-round"></span>
          </label>
        </div>

        <!-- Reset Button -->
        <div class="lab-actions">
          <button class="lab-reset-btn" id="lab-reset">RESET DEFAULTS</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.el);

    // Close button
    this.el.querySelector('#lab-close').addEventListener('click', () => {
      this.toggle(false);
    });

    // Winding slider
    const sWinding = this.el.querySelector('#slider-winding');
    const vWinding = this.el.querySelector('#val-winding');
    sWinding.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      vWinding.textContent = val.toFixed(2);
      this.state.winding = val;
      this.deck.updateParams({ winding: val });
    });

    // Radius slider
    const sRadius = this.el.querySelector('#slider-radius');
    const vRadius = this.el.querySelector('#val-radius');
    sRadius.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      vRadius.textContent = val.toFixed(1);
      this.state.radius = val;
      this.deck.updateParams({ radius: val });
    });

    // Scale slider
    const sScale = this.el.querySelector('#slider-scale');
    const vScale = this.el.querySelector('#val-scale');
    sScale.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      vScale.textContent = val.toFixed(2);
      this.state.cardScale = val;
      this.deck.updateParams({ cardScale: val });
    });

    // Speed slider
    const sSpeed = this.el.querySelector('#slider-speed');
    const vSpeed = this.el.querySelector('#val-speed');
    sSpeed.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      vSpeed.textContent = val.toFixed(2);
      this.state.autoSpeed = val;
      this.deck.updateParams({ autoSpeed: val });
    });

    // Auto rotate checkbox
    const tAuto = this.el.querySelector('#toggle-autorotate');
    tAuto.addEventListener('change', (e) => {
      this.state.autoRotate = e.target.checked;
      this.deck.autoRotate = e.target.checked;
      sound.playClick();
    });

    // Reset button
    this.el.querySelector('#lab-reset').addEventListener('click', () => {
      sound.playWhoosh();
      sWinding.value = 0.65;
      vWinding.textContent = '0.65';
      sRadius.value = 3.6;
      vRadius.textContent = '3.6';
      sScale.value = 0.95;
      vScale.textContent = '0.95';
      sSpeed.value = 0.38;
      vSpeed.textContent = '0.38';
      tAuto.checked = true;

      this.deck.updateParams({
        winding: 0.65,
        radius: 3.15,
        cardScale: 0.54,
        autoSpeed: 0.38
      });
      this.deck.autoRotate = true;
    });
  }

  toggle(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    this.el.classList.toggle('open', this.isOpen);
  }
}

