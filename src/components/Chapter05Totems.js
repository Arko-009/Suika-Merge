import * as THREE from 'three';
import { sound } from '../sound/SoundEngine.js';

export class Chapter05Totems {
  constructor() {
    this.el = null;
    this.activeTotemIndex = 0;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.totemGroup = null;
    this.totemMeshes = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.isVisible = false;
    this.rafId = null;
    this.cachedRect = null;

    this.totems = [
      {
        id: 'wolf',
        name: 'Totem of the Dire Wolf',
        archetype: 'INSTINCT & AGILITY',
        guild: 'The Wind Shifters',
        color: '#f5b945',
        lore: 'A carved golden beast forged from meteoric ore. Grants intuition in uncharted terrain and keen situational perception.',
        buffs: ['+35% Sprint Endurance', '+28 Charisma Aura', 'Pack Synergy']
      },
      {
        id: 'dragon',
        name: 'Totem of the Elder Wyrm',
        archetype: 'SOVEREIGNTY & IRON FORCE',
        guild: 'The Temperers of Steel',
        color: '#ff6b4a',
        lore: 'The primordial flame crystallized into obsidian scales and gilded talons. Inspires courage when facing intense physical resistance.',
        buffs: ['+45% Heavy Load XP', '+35 Raw Strength', 'Fear Immunity']
      },
      {
        id: 'raven',
        name: 'Totem of the Obsidian Raven',
        archetype: 'OMNISCIENCE & MEMORY',
        guild: 'The Brotherhood of Tale',
        color: '#5b8def',
        lore: 'Twin-beaked sentinel watching across past and future. Enhances deep focus during prolonged study and reflective silence.',
        buffs: ['+40% Reading Speed', '+32 Intellect Synthesis', 'Night Clarity']
      },
      {
        id: 'golem',
        name: 'Totem of the Iron Sentinel',
        archetype: 'FORTITUDE & TIME ANCHOR',
        guild: 'The Keepers of Time',
        color: '#4ecb8a',
        lore: 'An unyielding monolith shaped like an ancient knight\'s visor. Shields against habit decay and preserves streak momentum.',
        buffs: ['+50% Streak Shield', '+30 Wisdom Multiplier', 'Patience Surge']
      }
    ];

    this.init();
  }

  init() {
    this.el = document.createElement('section');
    this.el.id = 'ch-totems';
    this.el.className = 'valk-section ch-totems';
    this.el.innerHTML = `
      <div class="totem-stage-wrapper">
        <canvas class="totem-webgl-canvas" id="totem-canvas"></canvas>

        <div class="section-container relative-z totem-container">
          <div class="colontitle-bar">
            <div class="colontitle-tag">
              <span class="colon-dot"></span>
              <span>ABOUT TOTEMS</span>
            </div>
            <span class="colon-num">CHAPTER 05</span>
          </div>

          <div class="totem-header">
            <span class="totem-kicker">GUARDIAN ARCHETYPES</span>
            <h2 class="totem-heading">
              Pick the face you wear<br>
              <em>the entire journey.</em>
            </h2>
            <p class="totem-sub">
              Your totem is your physical anchor in the world. It houses your accumulated glory and buffs your specific style of life conquest.
            </p>
          </div>

          <div class="totem-interface-grid">
            <div class="totem-info-panel">
              <div class="totem-badge-row">
                <span class="totem-badge" id="t-arch">INSTINCT & AGILITY</span>
                <span class="totem-guild-tag" id="t-guild">THE WIND SHIFTERS</span>
              </div>
              <h3 class="totem-name" id="t-name">Totem of the Dire Wolf</h3>
              <p class="totem-lore" id="t-lore">
                A carved golden beast forged from meteoric ore. Grants intuition in uncharted terrain and keen situational perception.
              </p>
              
              <div class="totem-buffs-list" id="t-buffs">
                <span class="buff-chip">+35% Sprint Endurance</span>
                <span class="buff-chip">+28 Charisma Aura</span>
                <span class="buff-chip">Pack Synergy</span>
              </div>
            </div>

            <div class="totem-pills-col">
              ${this.totems.map((t, idx) => `
                <button class="totem-pill-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
                  <span class="pill-marker">0${idx + 1}</span>
                  <div class="pill-content">
                    <span class="pill-title">${t.name}</span>
                    <span class="pill-arch">${t.archetype}</span>
                  </div>
                  <span class="pill-arrow">➔</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupThreeStage();
    this.setupInteractions();
    this.setupObserver();
  }

  setupObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !this.rafId) {
          this.animate();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(this.el);
  }

  setupThreeStage() {
    this.canvas = this.el.querySelector('#totem-canvas');
    const width = this.el.clientWidth || window.innerWidth;
    const height = this.el.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    const ambient = new THREE.AmbientLight(0xffeedd, 1.2);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff0d0, 3.2);
    keyLight.position.set(4, 5, 4);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x73a5ff, 2.5);
    rimLight.position.set(-4, -2, -2);
    this.scene.add(rimLight);

    const glint = new THREE.PointLight(0xffc866, 10, 10);
    glint.position.set(0, 1, 3);
    this.scene.add(glint);

    this.totemGroup = new THREE.Group();
    this.scene.add(this.totemGroup);

    this.buildTotemMeshes();

    // Mouse tilt setup - only listen passively, update rect on resize/scroll
    const updateRect = () => {
      if (this.canvas) this.cachedRect = this.canvas.getBoundingClientRect();
    };
    updateRect();

    this.el.addEventListener('mousemove', (e) => {
      if (!this.isVisible) return;
      if (!this.cachedRect) updateRect();
      const rect = this.cachedRect;
      this.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.targetRotY = this.mouseX * 0.7;
      this.targetRotX = -this.mouseY * 0.4;
    }, { passive: true });

    window.addEventListener('resize', () => {
      updateRect();
      const w = this.el.clientWidth;
      const h = this.el.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    window.addEventListener('scroll', () => {
      this.cachedRect = null;
    }, { passive: true });
  }

  buildTotemMeshes() {
    const wolfGroup = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.22
    });
    const darkObsidianMat = new THREE.MeshStandardMaterial({
      color: 0x11161a,
      metalness: 0.9,
      roughness: 0.15
    });

    const wolfHeadGeom = new THREE.ConeGeometry(0.85, 2.2, 4);
    wolfHeadGeom.rotateX(Math.PI / 2);
    const wolfHead = new THREE.Mesh(wolfHeadGeom, goldMat);
    wolfHead.position.set(0, 0.4, 0.3);
    wolfGroup.add(wolfHead);

    const earGeom = new THREE.ConeGeometry(0.35, 0.9, 3);
    const leftEar = new THREE.Mesh(earGeom, goldMat);
    leftEar.position.set(-0.6, 1.4, -0.2);
    leftEar.rotation.z = -0.3;
    const rightEar = new THREE.Mesh(earGeom, goldMat);
    rightEar.position.set(0.6, 1.4, -0.2);
    rightEar.rotation.z = 0.3;
    wolfGroup.add(leftEar);
    wolfGroup.add(rightEar);

    const ringGeom = new THREE.TorusGeometry(1.6, 0.035, 12, 36);
    const ring1 = new THREE.Mesh(ringGeom, goldMat);
    ring1.rotation.x = Math.PI / 3;
    wolfGroup.add(ring1);

    const baseGeom = new THREE.CylinderGeometry(1.2, 1.4, 0.4, 8);
    const base = new THREE.Mesh(baseGeom, darkObsidianMat);
    base.position.set(0, -1.2, 0);
    wolfGroup.add(base);

    // 2. Dragon
    const dragonGroup = new THREE.Group();
    const dragonMat = new THREE.MeshStandardMaterial({
      color: 0xdd4b39,
      metalness: 0.75,
      roughness: 0.28
    });
    const dragonBodyGeom = new THREE.TorusKnotGeometry(0.8, 0.24, 48, 12, 2, 3);
    const dragonBody = new THREE.Mesh(dragonBodyGeom, dragonMat);
    dragonGroup.add(dragonBody);

    // 3. Raven
    const ravenGroup = new THREE.Group();
    const ravenMat = new THREE.MeshStandardMaterial({
      color: 0x3b6fbf,
      metalness: 0.88,
      roughness: 0.18
    });
    const ravenCoreGeom = new THREE.OctahedronGeometry(1.2, 1);
    const ravenCore = new THREE.Mesh(ravenCoreGeom, ravenMat);
    ravenGroup.add(ravenCore);

    // 4. Golem
    const golemGroup = new THREE.Group();
    const golemMat = new THREE.MeshStandardMaterial({
      color: 0x3cb371,
      metalness: 0.9,
      roughness: 0.25
    });
    const helmetGeom = new THREE.DodecahedronGeometry(1.15, 0);
    const helmet = new THREE.Mesh(helmetGeom, golemMat);
    golemGroup.add(helmet);

    this.totemMeshes = [wolfGroup, dragonGroup, ravenGroup, golemGroup];

    this.totemMeshes.forEach((mesh, idx) => {
      mesh.scale.set(1.15, 1.15, 1.15);
      mesh.position.set(0, 0.2, 0);
      mesh.visible = idx === 0;
      this.totemGroup.add(mesh);
    });
  }

  setupInteractions() {
    const pills = this.el.querySelectorAll('.totem-pill-btn');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const idx = parseInt(pill.getAttribute('data-idx'));
        if (idx === this.activeTotemIndex) return;

        sound.playWhoosh();
        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        this.switchTotem(idx);
      });
    });
  }

  switchTotem(index) {
    this.activeTotemIndex = index;
    const totem = this.totems[index];

    this.el.querySelector('#t-arch').textContent = totem.archetype;
    this.el.querySelector('#t-guild').textContent = totem.guild.toUpperCase();
    this.el.querySelector('#t-name').textContent = totem.name;
    this.el.querySelector('#t-lore').textContent = totem.lore;

    const buffsEl = this.el.querySelector('#t-buffs');
    buffsEl.innerHTML = totem.buffs.map((b) => `<span class="buff-chip">${b}</span>`).join('');

    this.totemMeshes.forEach((mesh, idx) => {
      mesh.visible = idx === index;
      if (idx === index) {
        mesh.rotation.y += Math.PI * 0.5;
      }
    });
  }

  animate() {
    if (!this.isVisible) {
      this.rafId = null;
      return;
    }

    this.rafId = requestAnimationFrame(() => this.animate());

    this.totemGroup.rotation.y += (this.targetRotY - this.totemGroup.rotation.y) * 0.08;
    this.totemGroup.rotation.x += (this.targetRotX - this.totemGroup.rotation.x) * 0.08;

    const t = performance.now() * 0.0015;
    this.totemGroup.position.y = Math.sin(t) * 0.12;

    this.renderer.render(this.scene, this.camera);
  }
}
