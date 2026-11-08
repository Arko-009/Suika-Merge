import * as THREE from 'three';
import { sound } from '../sound/SoundEngine.js';

/**
 * SUIKA MERGE // LIQUID ENERGY METASPHERE PRELOADER
 * Awwwards-tier procedural 3D motion graphics animation.
 * Features an organic luminescent plasma fruit core with Simplex wave displacement,
 * volumetric ruby-emerald Fresnel glow, fiber-optic silk orbital ribbons,
 * 1,200 stardust vortex particles, kinetic katana laser cleavage shockwave,
 * and a seamless optical bloom hand-off into the live 3D realm.
 */
export class Preloader {
  constructor(optionsOrComplete) {
    if (typeof optionsOrComplete === 'function') {
      this.onComplete = optionsOrComplete;
      this.onReveal = null;
    } else if (optionsOrComplete && typeof optionsOrComplete === 'object') {
      this.onComplete = optionsOrComplete.onComplete || (() => {});
      this.onReveal = optionsOrComplete.onReveal || null;
    } else {
      this.onComplete = () => {};
      this.onReveal = null;
    }

    this.container = null;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;

    // Animation & State
    this.rafId = null;
    this.startTime = performance.now();
    this.isCompleting = false;
    this.isDismissed = false;
    this.hasTriggeredReveal = false;
    this.speedMultiplier = 1.0;
    this.soundTriggers = new Set();

    // 3D Elements
    this.coreMesh = null;
    this.coreMaterial = null;
    this.ribbonGroup = null;
    this.ribbons = [];
    this.ringInner = null;
    this.ringOuter = null;
    this.ringSparks = [];
    this.stardustPoints = null;
    this.stardustData = [];
    this.laserSlash = null;
    this.shockwave = null;
    this.holoCardsGroup = null;
    this.holoCards = [];
    this.bloomLight = null;

    // Timeline Configuration (seconds)
    // 0.0s - 0.9s: Genesis - Liquid Metasphere Awakening & Organic Resonance (0% -> 30%)
    // 0.9s - 1.8s: Harmonic Resonance - Fiber-Optic Silk Ribbons & Dual Rings (30% -> 65%)
    // 1.8s - 2.5s: Critical Charge - Stardust Gravitational Vortex Swirl (65% -> 95%)
    // 2.5s - 3.0s: The Katana Cleave - Kinetic Laser Slice & Supernova Blast (100%)
    // 3.0s - 3.7s: Quantum Ascension - Hologram 3D Spiral Cards Rise
    // 3.7s - 4.2s: Apex Bloom - Card Crystallization & Seamless Live Realm Hand-off
    this.duration = 4.2;

    this.init();
  }

  init() {
    // 1. DOM Container & Minimalist HUD
    this.container = document.createElement('div');
    this.container.id = 'preloader-root';
    this.container.className = 'preloader-root';
    this.container.innerHTML = `
      <canvas id="preloader-3d-canvas" class="preloader-frame-canvas"></canvas>

      <div class="preloader-hud-layer" id="preloader-hud">
        <div class="preloader-hud-card">
          <div class="preloader-hud-bar-wrap">
            <div class="preloader-hud-bar-fill" id="hud-bar-fill"></div>
          </div>
          <div class="preloader-hud-row">
            <span class="hud-status" id="hud-status">INITIATING QUANTUM HARMONICS</span>
            <span class="hud-pct" id="hud-pct">0%</span>
          </div>
        </div>

        <button class="preloader-enter-btn" id="preloader-skip-btn" aria-label="Enter Realm">
          <span class="btn-dot"></span>
          <span class="btn-label">ENTER REALM // SPACE ↵</span>
        </button>
      </div>

      <div class="preloader-flash-overlay" id="preloader-flash"></div>
    `;

    document.body.appendChild(this.container);

    this.canvas = this.container.querySelector('#preloader-3d-canvas');
    this.barFill = this.container.querySelector('#hud-bar-fill');
    this.statusText = this.container.querySelector('#hud-status');
    this.pctText = this.container.querySelector('#hud-pct');
    this.skipBtn = this.container.querySelector('#preloader-skip-btn');
    this.flashEl = this.container.querySelector('#preloader-flash');
    this.hud = this.container.querySelector('#preloader-hud');

    // 2. Setup Three.js WebGL Engine
    this.setupThree();

    // 3. Build Organic 3D Elements
    this.buildWorld();

    // 4. Interaction Events
    this.setupEvents();

    // 5. Begin 60 FPS Render Loop
    this.startTime = performance.now();
    this.animate = this.animate.bind(this);
    this.rafId = requestAnimationFrame(this.animate);
  }

  setupThree() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050608, 0.032);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 8.8);

    // Cinematic Stage Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(amb);

    const keyLight = new THREE.DirectionalLight(0xa5de41, 2.2);
    keyLight.position.set(6, 8, 5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff3b5c, 2.8);
    rimLight.position.set(-6, -4, 4);
    this.scene.add(rimLight);

    this.bloomLight = new THREE.PointLight(0xa5de41, 1.5, 20);
    this.bloomLight.position.set(0, 0, 0);
    this.scene.add(this.bloomLight);
  }

  buildWorld() {
    // -----------------------------------------------------------------
    // 1. ORGANIC LIQUID METASPHERE (High-Resolution Procedural Core)
    // -----------------------------------------------------------------
    const coreGeom = new THREE.SphereGeometry(1.42, 64, 48);

    // Custom GLSL Shader for smooth liquid wave displacement and Fresnel halo
    const vertexShader = `
      uniform float uTime;
      uniform float uMorph;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        // Fluid harmonic wave displacement (Simplex-style organic ripple)
        float wave1 = sin(position.x * 2.5 + uTime * 2.2) * cos(position.y * 2.5 + uTime * 1.8);
        float wave2 = sin(position.z * 3.0 - uTime * 2.0) * 0.5;
        float disp = (wave1 + wave2) * 0.075 * uMorph;
        vWave = disp;

        vec3 newPos = position + normal * disp;
        vec4 mvPos = modelViewMatrix * vec4(newPos, 1.0);
        vViewPosition = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColorPulp;
      uniform vec3 uColorRind;
      uniform vec3 uColorCore;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Volumetric optical Fresnel rim
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.6);
        float rim = pow(1.0 - max(dot(viewDir, normal), 0.0), 1.2);

        // Internal liquid pulp glow
        float internalPulse = 0.5 + 0.5 * sin(uTime * 2.5 + vWave * 15.0);
        vec3 pulpColor = mix(uColorPulp, uColorCore, internalPulse * 0.5);

        // Electric emerald rind halo on silhouette edges
        vec3 finalColor = mix(pulpColor, uColorRind, fresnel * 0.95);
        finalColor += uColorRind * pow(fresnel, 3.2) * 1.4;

        // Subtle embedded seed crystal facets inside
        float seedPattern = sin(vUv.x * 28.0) * cos(vUv.y * 22.0);
        if (seedPattern > 0.88 && rim < 0.65) {
          finalColor *= 0.38;
        }

        gl_FragColor = vec4(finalColor, uOpacity);
      }
    `;

    this.coreMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 1.0 },
        uOpacity: { value: 1.0 },
        uColorPulp: { value: new THREE.Color(0xf4284d) }, // Rich watermelon crimson
        uColorRind: { value: new THREE.Color(0xa5de41) }, // Luminous lime rind
        uColorCore: { value: new THREE.Color(0xff6036) }  // Vibrant coral core
      },
      transparent: true,
      side: THREE.FrontSide
    });

    this.coreMesh = new THREE.Mesh(coreGeom, this.coreMaterial);
    this.scene.add(this.coreMesh);

    // -----------------------------------------------------------------
    // 2. FIBER-OPTIC SILK ENERGY RIBBONS (Dynamic Curved Meridians)
    // -----------------------------------------------------------------
    this.ribbonGroup = new THREE.Group();
    this.scene.add(this.ribbonGroup);

    const ribbonMatGreen = new THREE.MeshBasicMaterial({
      color: 0xa5de41,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });

    const ribbonMatCoral = new THREE.MeshBasicMaterial({
      color: 0xfc7c35,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });

    const createSilkRibbon = (pts, mat) => {
      const curve = new THREE.CatmullRomCurve3(pts, true);
      const geom = new THREE.TubeGeometry(curve, 90, 0.038, 8, true);
      const mesh = new THREE.Mesh(geom, mat.clone());
      this.ribbonGroup.add(mesh);
      this.ribbons.push(mesh);
    };

    // Ribbon 1: Vertical Meridian wrap
    createSilkRibbon([
      new THREE.Vector3(0, 1.65, 0),
      new THREE.Vector3(1.2, 0.8, 0.8),
      new THREE.Vector3(1.6, -0.2, 0.2),
      new THREE.Vector3(0.8, -1.2, -0.7),
      new THREE.Vector3(0, -1.65, 0),
      new THREE.Vector3(-0.9, -1.1, 0.7),
      new THREE.Vector3(-1.55, 0.1, 0.3),
      new THREE.Vector3(-1.1, 1.0, -0.6)
    ], ribbonMatGreen);

    // Ribbon 2: Oblique Toroidal Swirl
    createSilkRibbon([
      new THREE.Vector3(1.4, 0.7, -0.7),
      new THREE.Vector3(0.5, 1.45, 0.5),
      new THREE.Vector3(-0.9, 0.9, 1.1),
      new THREE.Vector3(-1.5, -0.4, 0.4),
      new THREE.Vector3(-0.6, -1.4, -0.6),
      new THREE.Vector3(0.8, -1.1, -1.0),
      new THREE.Vector3(1.6, -0.1, -0.2)
    ], ribbonMatCoral);

    // -----------------------------------------------------------------
    // 3. PRISMATIC GRAVITATIONAL RINGS (Saturn-Like Halo)
    // -----------------------------------------------------------------
    const ringInnerGeom = new THREE.RingGeometry(2.35, 2.42, 100);
    const ringInnerMat = new THREE.MeshBasicMaterial({
      color: 0xa5de41,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    this.ringInner = new THREE.Mesh(ringInnerGeom, ringInnerMat);
    this.ringInner.rotation.x = Math.PI * 0.46;
    this.ringInner.rotation.y = Math.PI * 0.12;
    this.scene.add(this.ringInner);

    const ringOuterGeom = new THREE.RingGeometry(2.75, 2.81, 100);
    const ringOuterMat = new THREE.MeshBasicMaterial({
      color: 0xfc7c35,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    this.ringOuter = new THREE.Mesh(ringOuterGeom, ringOuterMat);
    this.ringOuter.rotation.x = Math.PI * 0.38;
    this.ringOuter.rotation.y = -Math.PI * 0.15;
    this.scene.add(this.ringOuter);

    // Spark nodes that run along the orbital rings
    const sparkGeom = new THREE.SphereGeometry(0.045, 8, 8);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending
    });
    for (let i = 0; i < 6; i++) {
      const sp = new THREE.Mesh(sparkGeom, sparkMat);
      sp.visible = false;
      this.scene.add(sp);
      this.ringSparks.push(sp);
    }

    // -----------------------------------------------------------------
    // 4. 1,200 STARDUST VORTEX PARTICLES (Fluid Embers)
    // -----------------------------------------------------------------
    const particleCount = 1200;
    const posArray = new Float32Array(particleCount * 3);
    const colArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const rad = 1.6 + Math.pow(Math.random(), 1.5) * 4.5;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 3.8;

      posArray[i * 3] = Math.cos(angle) * rad;
      posArray[i * 3 + 1] = height;
      posArray[i * 3 + 2] = Math.sin(angle) * rad;

      // Color mix: 60% electric lime, 30% ruby coral, 10% pure diamond white
      const rnd = Math.random();
      const c = rnd > 0.4 ? new THREE.Color(0xa5de41) : (rnd > 0.1 ? new THREE.Color(0xfc7c35) : new THREE.Color(0xffffff));
      colArray[i * 3] = c.r;
      colArray[i * 3 + 1] = c.g;
      colArray[i * 3 + 2] = c.b;

      this.stardustData.push({
        baseRadius: rad,
        baseAngle: angle,
        baseY: height,
        angularSpeed: (0.4 + Math.random() * 0.8) * (rad < 2.5 ? 1.5 : 0.8),
        yVel: (Math.random() - 0.5) * 0.3,
        explodeAngle: angle,
        explodeSpeed: 3.5 + Math.random() * 5.0
      });
    }

    const stardustGeom = new THREE.BufferGeometry();
    stardustGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    stardustGeom.setAttribute('color', new THREE.BufferAttribute(colArray, 3));

    // Soft Gaussian point texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
    grad.addColorStop(0.7, 'rgba(255,255,255,0.15)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 32, 32);

    const pointTexture = new THREE.CanvasTexture(pCanvas);

    const stardustMat = new THREE.PointsMaterial({
      size: 0.12,
      map: pointTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.stardustPoints = new THREE.Points(stardustGeom, stardustMat);
    this.scene.add(this.stardustPoints);

    // -----------------------------------------------------------------
    // 5. KATANA LASER CLEAVE & SHOCKWAVE (Frame 5 Supernova Climax)
    // -----------------------------------------------------------------
    // High-energy laser blade
    const laserGeom = new THREE.PlaneGeometry(0.06, 12);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.laserSlash = new THREE.Mesh(laserGeom, laserMat);
    this.laserSlash.rotation.z = Math.PI * 0.28; // Diagonal slash
    this.scene.add(this.laserSlash);

    // Expanding shockwave ripple
    const shockGeom = new THREE.RingGeometry(0.1, 0.4, 64);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x8ae4ef,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    this.shockwave = new THREE.Mesh(shockGeom, shockMat);
    this.scene.add(this.shockwave);
  }

  setupEvents() {
    const triggerSkip = (e) => {
      e?.preventDefault();
      e?.stopPropagation();
      sound.ensureContext();
      if (!this.isCompleting) {
        this.speedMultiplier = 3.8;
        this.triggerComplete();
      }
    };

    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', triggerSkip);
    }

    this.keyHandler = (e) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        triggerSkip(e);
      }
    };
    window.addEventListener('keydown', this.keyHandler);

    this.container.addEventListener('click', (e) => {
      triggerSkip(e);
    });

    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
  }

  onResize() {
    if (!this.renderer || !this.camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /**
   * 60 FPS Procedural Simulation & Choreography Loop
   */
  animate() {
    if (this.isDismissed) return;

    const now = performance.now();
    const elapsed = ((now - this.startTime) / 1000) * this.speedMultiplier;
    const t = Math.min(this.duration, elapsed);
    const progress = t / this.duration;

    // Update HUD
    this.updateHUD(t, progress);

    // -----------------------------------------------------------------
    // 1. CORE LIQUID METASPHERE ANIMATION
    // -----------------------------------------------------------------
    if (this.coreMaterial && this.coreMesh) {
      this.coreMaterial.uniforms.uTime.value = elapsed;

      // Gentle organic breathing & rotation
      this.coreMesh.rotation.y = elapsed * 0.95;
      this.coreMesh.rotation.x = Math.sin(elapsed * 0.7) * 0.15;

      const breathe = 1.0 + 0.035 * Math.sin(elapsed * 3.5);
      this.coreMesh.scale.set(breathe, breathe, breathe);

      // Core dissolution after Katana Cleave (t >= 2.5s)
      if (t >= 2.5) {
        const dissolveT = (t - 2.5) / 0.6;
        this.coreMaterial.uniforms.uOpacity.value = Math.max(0, 1.0 - dissolveT);
        this.coreMesh.scale.multiplyScalar(1.0 + dissolveT * 0.8);
      }
    }

    // -----------------------------------------------------------------
    // 2. FIBER-OPTIC SILK ENERGY RIBBONS
    // -----------------------------------------------------------------
    if (this.ribbonGroup) {
      this.ribbonGroup.rotation.y = -elapsed * 0.65;
      this.ribbonGroup.rotation.z = Math.sin(elapsed * 0.5) * 0.18;

      if (t >= 0.8 && t < 2.5) {
        const ribbonAlpha = Math.min(0.85, (t - 0.8) / 0.8);
        this.ribbons.forEach(r => r.material.opacity = ribbonAlpha);
      } else if (t >= 2.5) {
        this.ribbons.forEach(r => r.material.opacity *= 0.88);
      }
    }

    // -----------------------------------------------------------------
    // 3. PRISMATIC GRAVITATIONAL RINGS
    // -----------------------------------------------------------------
    if (t >= 1.0 && t < 2.5) {
      const ringAlpha = Math.min(0.85, (t - 1.0) / 0.7);
      if (this.ringInner) {
        this.ringInner.material.opacity = ringAlpha;
        this.ringInner.rotation.z += 0.025;
      }
      if (this.ringOuter) {
        this.ringOuter.material.opacity = ringAlpha * 0.75;
        this.ringOuter.rotation.z -= 0.018;
      }

      // Position spark nodes along rings
      this.ringSparks.forEach((sp, idx) => {
        sp.visible = true;
        const angle = elapsed * (1.8 + idx * 0.3) + idx * (Math.PI / 3);
        const rad = idx % 2 === 0 ? 2.38 : 2.78;
        const parentRot = idx % 2 === 0 ? Math.PI * 0.46 : Math.PI * 0.38;

        const lx = Math.cos(angle) * rad;
        const ly = Math.sin(angle) * rad;
        sp.position.set(lx, ly * Math.cos(parentRot), ly * Math.sin(parentRot));
      });
    } else if (t >= 2.5) {
      if (this.ringInner) this.ringInner.material.opacity *= 0.85;
      if (this.ringOuter) this.ringOuter.material.opacity *= 0.85;
      this.ringSparks.forEach(sp => sp.visible = false);
    }

    // -----------------------------------------------------------------
    // 4. STARDUST VORTEX & SUPERNOVA EXPANSION
    // -----------------------------------------------------------------
    if (this.stardustPoints) {
      const posAttr = this.stardustPoints.geometry.attributes.position;
      const positions = posAttr.array;

      for (let i = 0; i < this.stardustData.length; i++) {
        const sd = this.stardustData[i];

        if (t < 2.5) {
          // Normal harmonic vortex swirl
          sd.baseAngle += sd.angularSpeed * 0.018;
          positions[i * 3] = Math.cos(sd.baseAngle) * sd.baseRadius;
          positions[i * 3 + 1] = sd.baseY + Math.sin(elapsed * 2.0 + i) * 0.15;
          positions[i * 3 + 2] = Math.sin(sd.baseAngle) * sd.baseRadius;
        } else {
          // Supernova explosive dispersal
          const burstT = (t - 2.5);
          const r = sd.baseRadius + sd.explodeSpeed * burstT;
          positions[i * 3] = Math.cos(sd.explodeAngle) * r;
          positions[i * 3 + 1] = sd.baseY + (sd.yVel * 8.0) * burstT;
          positions[i * 3 + 2] = Math.sin(sd.explodeAngle) * r;
        }
      }
      posAttr.needsUpdate = true;

      if (t >= 2.5) {
        this.stardustPoints.material.opacity = Math.max(0, 0.85 - (t - 2.5) * 0.7);
      }
    }

    // -----------------------------------------------------------------
    // 5. KATANA LASER CLEAVE & SHOCKWAVE (t: 2.5s)
    // -----------------------------------------------------------------
    if (t >= 2.5 && t < 2.7) {
      const slashProgress = (t - 2.5) / 0.2;

      // Audio & Flash trigger
      if (!this.soundTriggers.has('slash')) {
        this.soundTriggers.add('slash');
        sound.playWhoosh();
        if (this.flashEl) {
          this.flashEl.style.opacity = '0.75';
          setTimeout(() => { if (this.flashEl) this.flashEl.style.opacity = '0'; }, 90);
        }
      }

      // Laser blade sweeps through
      if (this.laserSlash) {
        this.laserSlash.material.opacity = (1 - Math.abs(slashProgress - 0.5) * 2) * 1.8;
        this.laserSlash.position.x = (slashProgress - 0.5) * 7.0;
        this.laserSlash.position.y = -(slashProgress - 0.5) * 4.5;
      }

      // Shockwave ring expansion
      if (this.shockwave) {
        this.shockwave.material.opacity = 1.0 - slashProgress;
        const scale = 0.5 + slashProgress * 9.0;
        this.shockwave.scale.set(scale, scale, 1);
      }
    } else if (t >= 2.7) {
      if (this.laserSlash) this.laserSlash.material.opacity = 0;
      if (this.shockwave) this.shockwave.material.opacity = 0;
    }

    // -----------------------------------------------------------------
    // 6. REVEAL REAL SPIRAL STAIR DECK (t >= 2.4s)
    // -----------------------------------------------------------------
    if (t >= 2.4) {
      if (!this.soundTriggers.has('warp')) {
        this.soundTriggers.add('warp');
        sound.playWarp();
        if (this.onReveal && !this.hasTriggeredReveal) {
          this.hasTriggeredReveal = true;
          this.onReveal();
        }
        // Make preloader background transparent so the real 3D spiral deck shines through!
        if (this.container) {
          this.container.classList.add('preloader-revealing');
        }
      }
    }

    // -----------------------------------------------------------------
    // 7. APEX BLOOM (t >= 3.7s)
    // -----------------------------------------------------------------
    if (t >= 3.7 && !this.soundTriggers.has('fanfare')) {
      this.soundTriggers.add('fanfare');
      sound.playFanfare();
      sound.playChime();
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);

    // Timeline Completion Check
    if (t >= this.duration) {
      this.triggerComplete();
    } else {
      this.rafId = requestAnimationFrame(this.animate);
    }
  }

  updateHUD(t, progress) {
    const pct = Math.min(100, Math.round(progress * 100));
    if (this.barFill) this.barFill.style.width = `${pct}%`;
    if (this.pctText) this.pctText.textContent = `${pct}%`;

    if (this.statusText) {
      if (t < 0.9) {
        this.statusText.textContent = 'AWAKENING THE CORE // LIQUID HARMONICS';
      } else if (t < 1.8) {
        this.statusText.textContent = 'FIBER-OPTIC RESONANCE // ORBITAL SYNTHESIS';
      } else if (t < 2.5) {
        this.statusText.textContent = 'STARDUST VORTEX CHARGE // CRITICAL DETONATION';
      } else if (t < 3.2) {
        this.statusText.textContent = 'SUPERNOVA CLEAVE // ASCENDING SPIRAL DECK';
      } else {
        this.statusText.textContent = 'REALM BLOOM // WELCOME TO VALKYRIE';
      }
    }
  }

  triggerComplete() {
    if (this.isCompleting) return;
    this.isCompleting = true;

    if (!this.hasTriggeredReveal) {
      this.hasTriggeredReveal = true;
      if (this.onReveal) this.onReveal();
      sound.playWarp();
    }

    if (this.hud) {
      this.hud.style.opacity = '0';
      this.hud.style.pointerEvents = 'none';
    }

    if (this.onComplete) {
      this.onComplete();
    }

    this.dismiss();
  }

  dismiss() {
    if (this.isDismissed) return;

    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
    }
    window.removeEventListener('resize', this.onResize);

    this.container.classList.add('preloader-bloom-out');

    const hero = document.getElementById('hero');
    if (hero) {
      hero.classList.add('hero-warp-enter');
    }

    setTimeout(() => {
      this.isDismissed = true;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.disposeThree();
    }, 850);
  }

  disposeThree() {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    this.coreMesh = null;
    this.coreMaterial = null;
    this.ribbonGroup = null;
    this.stardustPoints = null;
  }
}
