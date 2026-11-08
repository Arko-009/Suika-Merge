import * as THREE from 'three';
import { sound } from '../sound/SoundEngine.js';

// Custom Vertex Shader from Grail - curls card edges + handles 360 flip
const cardVertexShader = `
uniform float uBend;
uniform float uFlip;   // 0..1 accept turn; rows stagger top -> bottom
uniform float uCardH;  // plane height, for the row stagger
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 p = position;
  // Curl the side edges back, plus a gentle vertical bow — the bent-plane look.
  p.z -= uBend * position.x * position.x;
  p.z -= uBend * 0.35 * position.y * position.y;

  // Accept flip: each row turns a full 360°, the top edge leading the bottom
  if (uFlip > 0.0001) {
    float yN = position.y / uCardH + 0.5;          // 0 bottom .. 1 top
    float delay = 0.2;                             // subtle lead of top over bottom
    float rp = clamp((uFlip - (1.0 - yN) * delay) / (1.0 - delay), 0.0, 1.0);
    float a = rp * 6.2831853;
    float s = sin(a), c = cos(a);
    float nx = p.x * c - p.z * s;
    p.z = p.x * s + p.z * c;
    p.x = nx;
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

// Custom Fragment Shader from Grail - double sided with front quest & back guild emblem
const cardFragmentShader = `
precision highp float;
uniform sampler2D uTex;
uniform sampler2D uBack;
uniform float uSmear;
uniform vec2 uDir;
uniform float uDim;
uniform float uReveal; // 0.0 = foreshadowed holographic crystal, 1.0 = fully materialized real card
varying vec2 vUv;

void main() {
  // Back of the card — the guild emblem pattern, full-bleed
  if (!gl_FrontFacing) {
    vec4 b = texture2D(uBack, vUv);
    vec3 backCol = b.rgb * max(uDim, 0.7);
    if (uReveal < 0.999) {
      vec3 holoBack = mix(vec3(0.06, 0.12, 0.18), backCol, uReveal);
      gl_FragColor = vec4(holoBack, b.a * (0.45 + 0.55 * uReveal));
      return;
    }
    gl_FragColor = vec4(backCol, b.a);
    return;
  }

  // Front of card — with subtle velocity smear
  vec4 c0 = texture2D(uTex, vUv);
  if (uSmear >= 0.0008) {
    vec4 acc = vec4(0.0);
    float total = 0.0;
    for (int i = 0; i < 7; i++) {
      float t = float(i) / 6.0 - 0.5;
      float w = 1.0 - abs(t) * 1.3;
      if (w <= 0.0) continue;
      acc += texture2D(uTex, vUv + uDir * t * uSmear) * w;
      total += w;
    }
    if (total > 0.0) c0 = acc / total;
  }

  // Foreshadowed Holographic Card Materialization Effect:
  if (uReveal < 0.999) {
    float edgeDistX = min(vUv.x, 1.0 - vUv.x);
    float edgeDistY = min(vUv.y, 1.0 - vUv.y);
    float edgeBorder = min(edgeDistX, edgeDistY);
    float wireGlow = smoothstep(0.045, 0.0, edgeBorder);

    float scanline = 0.88 + 0.12 * sin(vUv.y * 140.0);
    vec3 holoBase = vec3(0.08, 0.15, 0.22) * scanline;
    vec3 neonEdge = vec3(0.54, 0.87, 0.94); // Glowing cyan wireframe edge

    vec3 realCard = c0.rgb * uDim;
    vec3 mixedCard = mix(holoBase + neonEdge * wireGlow * 1.6, realCard, uReveal);
    float alpha = mix(0.5 + wireGlow * 0.5, c0.a, uReveal);

    gl_FragColor = vec4(mixedCard, alpha);
    return;
  }

  c0.rgb *= uDim;
  gl_FragColor = c0;
}
`;

// Helper: Hermite smoothstep
const _e = (start, end, val) => {
  const r = Math.min(1, Math.max(0, (val - start) / (end - start)));
  return r * r * (3 - 2 * r);
};

// Helper: Linear interpolation
const K = (a, b, t) => a + (b - a) * t;

// Shield crest drawing
function drawShieldCrest(ctx, x, y, w, h) {
  const a = w * 0.16;
  ctx.beginPath();
  ctx.moveTo(x + a, y);
  ctx.lineTo(x + w - a, y);
  ctx.arcTo(x + w, y, x + w, y + a, a);
  ctx.lineTo(x + w, y + h * 0.5);
  ctx.quadraticCurveTo(x + w, y + h * 0.86, x + w / 2, y + h);
  ctx.quadraticCurveTo(x, y + h * 0.86, x, y + h * 0.5);
  ctx.lineTo(x, y + a);
  ctx.arcTo(x, y, x + a, y, a);
  ctx.closePath();
}

function drawShieldImage(ctx, x, y, size, img, glowColor) {
  const h = size * 1.12;
  ctx.save();
  drawShieldCrest(ctx, x, y, size, h);
  ctx.shadowColor = glowColor || 'rgba(202, 168, 110, 0.4)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#dcdcdc';
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawShieldCrest(ctx, x, y, size, h);
  ctx.clip();
  if (img) {
    ctx.drawImage(img, x, y, size, h);
  }
  ctx.restore();
}

function drawAudioPills(ctx, x, y, avatars, id) {
  ctx.font = '500 14px "Switzer", "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.textBaseline = 'middle';
  let curX = x;
  const durations = ['0:18', '0:36', '0:48'];
  for (let i = 0; i < 3; i++) {
    const dur = durations[i];
    const pillW = 40 + ctx.measureText(dur).width + 8;
    ctx.beginPath();
    ctx.roundRect(curX, y, pillW, 40, 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();

    if (avatars && avatars.length > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(curX + 20, y + 20, 16, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatars[(id + i) % avatars.length], curX + 4, y + 4, 32, 32);
      ctx.restore();
    }

    ctx.fillStyle = '#6b7280';
    ctx.fillText(dur, curX + 40, y + 21);
    curX += pillW + 6;
  }

  // +12 pill
  const plusText = '+12';
  const plusW = 8 + ctx.measureText(plusText).width + 8;
  ctx.beginPath();
  ctx.roundRect(curX, y, plusW, 40, 20);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();
  ctx.fillStyle = '#6b7280';
  ctx.fillText(plusText, curX + 8, y + 21);
  ctx.textBaseline = 'alphabetic';
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 99) {
  let line = '';
  let count = 0;
  const words = text.split(' ');
  for (let n = 0; n < words.length; n++) {
    const testLine = line ? line + ' ' + words[n] : words[n];
    if (ctx.measureText(testLine).width <= maxWidth) {
      line = testLine;
      continue;
    }
    if (line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      count++;
      if (count >= maxLines) return y;
      line = words[n];
    }
  }
  if (line && count < maxLines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function drawCardBack(canvas, img) {
  const w = 345, h = 490, G = 2;
  canvas.width = w * G;
  canvas.height = h * G;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(G, 0, 0, G, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 20);
  ctx.clip();
  if (img) {
    const coverScale = Math.max(w / img.width, h / img.height);
    const sw = img.width * coverScale;
    const sh = img.height * coverScale;
    ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
  }
  ctx.restore();
}

function drawCardFront(canvas, quest, guild, emblemImg, glowColor, avatars) {
  const w = 345, h = 490, G = 2;
  canvas.width = w * G;
  canvas.height = h * G;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(G, 0, 0, G, 0, 0);
  ctx.clearRect(0, 0, w, h);

  // Card surface
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 20);
  ctx.fillStyle = '#efefef';
  ctx.fill();

  // Shield crest with pattern
  drawShieldImage(ctx, 16, 24, 56, emblemImg, glowColor);

  // Guild name
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 20);
  ctx.clip();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  let curY = 106.72;
  ctx.font = '500 15px "Switzer", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#7a7a7a';
  ctx.fillText(guild.name, 16, curY);

  // Headline
  ctx.font = '700 32px "Switzer", "Cinzel", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0a0a0a';
  curY = wrapText(ctx, quest.text, 16, curY + 36, w - 32, 32 * 0.97);

  // Body
  ctx.font = '400 15px "Switzer", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#464646';
  wrapText(ctx, quest.body, 16, curY + 16, w - 32, 15 * 1.25);

  // Audio recording pills
  drawAudioPills(ctx, 16, h - 47 - 40, avatars, quest.id);

  // Bottom footer bar
  ctx.fillStyle = '#f2f2f2';
  ctx.fillRect(0, h - 38, w, 38);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h - 38);
  ctx.lineTo(w, h - 38);
  ctx.stroke();

  // Centered quote
  ctx.font = '400 12px "Switzer", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#838383';
  ctx.textAlign = 'center';
  wrapText(ctx, 'In-person beats text for anything that matters.', w / 2, h - 22, w - 36, 14, 2);

  ctx.restore();
}

export class SpiralDeck {
  constructor(layerContainer, onSelectQuest) {
    this.layerEl = layerContainer;
    this.onSelectQuest = onSelectQuest || (() => {});
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.group = null;
    this.cardMeshes = [];
    this.frontTextures = [];
    this.backTextures = [];
    
    // Grail Exact Constants
    this.fe = 18; // 18 meshes
    this.pe = 9;  // center index
    this.ve = 345;
    this.be = 490;
    this.xe = 490;
    this.G = 2;
    this.Se = 2.4;
    this.Ce = (this.xe / this.ve) * this.Se; // 3.4087
    this.Me = 6.5;

    // Mathematical parameters from Grail
    this.cfg = {
      angleStep: 0.65,
      radius: 3.15,
      squish: 0.72,
      gapX: -0.04,
      gapY: 0.38,
      edgeTwist: -0.06,
      cardScale: 0.54,
      bend: 0.06,
      smear: 1.0,
      auto: true,
      autoSpeed: 0.38,
      mouseTilt: 0.12,
      magnet: 0.18 // Responsive tactile hover magnet
    };

    // Transition Thresholds for extended hero runway
    this.Pe = 0.45; // Hero -> Chapter 01
    this.Fe = 1.05;
    this.Ie = 1.45; // Chapter 01 -> Chapter 02
    this.Le = 1.95;
    this.Re = 2.15; // 360 Wave Flip
    this.ze = 2.75;
    this.Be = 2.35;
    this.Ve = 2.80;
    this.He = 0.86;
    this.Ue = 0.55;

    // Smooth single-accumulator motion
    this.targetScrollPos = 0;
    this.scrollPos = 0;
    this.prevPos = 0;
    this.smoothVel = 0;
    this.lastTime = performance.now() / 1000;
    this.pageScroll = 0;
    this.lockedIndex = null;
    this.revealProgress = 0; // 0 = outer ring, swirls inward to 1 during opening warp
    this.isActive = true;
    this.isDragging = false;
    this.isHovered = false;
    this.hoveredCardIdx = -1;
    this.currentFocalQuest = null;

    this.prevPointer = { x: 0, y: 0 };
    this.mouse = { x: 0, y: 0 };
    this.tilt = { x: 0, z: 0 };
    this.rafId = null;

    // Heraldic Guilds & Quests Data
    this.guilds = [
      { slug: 'tempers', name: 'The Temperers of Steel', color: '#ff6b5e' },
      { slug: 'brotherhood-of-tale', name: 'The Brotherhood of Tale', color: '#5b8def' },
      { slug: 'keepers-of-time', name: 'The Keepers of Time', color: '#4ecb8a' },
      { slug: 'seeker-of-forsaken', name: 'The Seekers of Forsaken', color: '#c77dff' },
      { slug: 'wind-shifters', name: 'The Wind Shifters', color: '#f5b945' }
    ];

    this.quests = [
      {
        id: 1,
        text: 'Call someone instead of texting them today. Anyone.',
        category: 'Uncomfortable',
        body: 'A voice carries what a text flattens. Pick a name, tap call, let it be a little awkward.',
        guildIndex: 3
      },
      {
        id: 2,
        text: 'Eat your next meal with no screen, no book, nothing. Just sit.',
        category: 'Exposure',
        body: 'One meal, just the food and you. Notice when you reach for the phone, and leave it face down.',
        guildIndex: 2
      },
      {
        id: 3,
        text: 'Ask a stranger for a recommendation today. A place, a book, anything.',
        category: 'Social',
        body: 'People like being asked. Open your mouth to the barista, the neighbor, the person in line.',
        guildIndex: 4
      },
      {
        id: 4,
        text: 'Sit in silence for 10 minutes. No podcast, no music, no phone. Just wherever you are.',
        category: 'Exposure',
        body: 'No input, no soundtrack. Ten minutes with your own head is longer than it sounds.',
        guildIndex: 2
      },
      {
        id: 5,
        text: 'Leave your phone in another room for the next 2 hours.',
        category: 'Uncomfortable',
        body: 'Out of reach, out of mind. Two hours to find out what your hands do without it.',
        guildIndex: 0
      },
      {
        id: 6,
        text: "Do something with your hands today that isn't typing.",
        category: 'Creative',
        body: 'Cook, fix, draw, build. Make one thing the screen had nothing to do with.',
        guildIndex: 1
      },
      {
        id: 7,
        text: 'Have a conversation today where you ask more than you talk.',
        category: 'Social',
        body: 'Trade the update for a question. Then another. Watch how far someone opens up.',
        guildIndex: 4
      },
      {
        id: 8,
        text: 'Go outside with no destination and no time limit. Come back when you feel like it.',
        category: 'Exposure',
        body: 'No map, no goal, no clock. Turn where you feel like turning and see where you land.',
        guildIndex: 2
      }
    ];

    this.init();
  }

  async init() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'spiral-webgl-canvas';
    this.canvas.style.cursor = 'grab';
    this.layerEl.appendChild(this.canvas);

    this.scene = new THREE.Scene();

    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    this.camera.position.z = 9.0;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Preload guild images & avatars
    const [emblemImages, avatarImages] = await this.loadAssets();

    // Generate high-res textures
    this.generateTextures(emblemImages, avatarImages);

    // Build the 18 plane meshes along the spiral
    this.buildMeshes();

    // Bind event listeners
    this.setupEvents();

    // Start RAF loop
    this.lastTime = performance.now() / 1000;
    this.animate();
  }

  loadAssets() {
    const loadImage = (src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

    const emblemPromises = this.guilds.map((g) => loadImage(`/patterns/${g.slug}.webp`));
    const avatarPromises = [1, 2, 3].map((n) => loadImage(`/avatars/a${n}.webp`));

    return Promise.all([
      Promise.all(emblemPromises),
      Promise.all(avatarPromises)
    ]);
  }

  generateTextures(emblemImages, avatarImages) {
    const de = this.quests.length;
    for (let i = 0; i < de; i++) {
      const q = this.quests[i];
      const g = this.guilds[q.guildIndex % this.guilds.length];
      const emb = emblemImages[q.guildIndex % emblemImages.length];

      // Front Texture
      const frontCanvas = document.createElement('canvas');
      drawCardFront(frontCanvas, q, g, emb, g.color, avatarImages);
      const frontTex = new THREE.CanvasTexture(frontCanvas);
      frontTex.colorSpace = THREE.SRGBColorSpace;
      frontTex.minFilter = THREE.LinearFilter;
      this.frontTextures.push(frontTex);

      // Back Texture
      const backCanvas = document.createElement('canvas');
      drawCardBack(backCanvas, emb);
      const backTex = new THREE.CanvasTexture(backCanvas);
      backTex.colorSpace = THREE.SRGBColorSpace;
      backTex.minFilter = THREE.LinearFilter;
      this.backTextures.push(backTex);
    }
  }

  buildMeshes() {
    const geom = new THREE.PlaneGeometry(this.Se, this.Ce, 24, 16);

    for (let i = 0; i < this.fe; i++) {
      const qIdx = i % this.quests.length;
      const mat = new THREE.ShaderMaterial({
        vertexShader: cardVertexShader,
        fragmentShader: cardFragmentShader,
        uniforms: {
          uTex: { value: this.frontTextures[qIdx] },
          uBack: { value: this.backTextures[qIdx] },
          uBend: { value: this.cfg.bend },
          uFlip: { value: 0.0 },
          uCardH: { value: this.Ce },
          uSmear: { value: 0.0 },
          uDir: { value: new THREE.Vector2(0, 1) },
          uDim: { value: 1.0 },
          uReveal: { value: 0.0 }
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: false
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.userData = { index: i };
      this.group.add(mesh);
      this.cardMeshes.push(mesh);
    }
  }

  startReveal() {
    this.revealProgress = 0;
    const startT = performance.now();
    const dur = 1800; // 1.8 seconds opening spiral convergence

    const step = () => {
      const elapsed = performance.now() - startT;
      const progress = Math.min(1, elapsed / dur);
      this.revealProgress = progress;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  onPageScroll(c) {
    this.pageScroll = c;
    if (this.layerEl) {
      if (c > 3.2) {
        this.layerEl.style.opacity = '0';
        this.layerEl.style.pointerEvents = 'none';
        this.isActive = false;
      } else {
        this.layerEl.style.opacity = '1';
        this.layerEl.style.pointerEvents = (c < 1.05) ? 'auto' : 'none';
        if (!this.isActive) {
          this.isActive = true;
          this.lastTime = performance.now() / 1000;
          this.animate();
        }
      }
    }
  }

  setupEvents() {
    const el = this.canvas;

    const onDown = (e) => {
      this.isDragging = true;
      this.canvas.style.cursor = 'grabbing';
      const cx = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
      const cy = e.clientY ?? (e.touches && e.touches[0].clientY) ?? 0;
      this.prevPointer.x = cx;
      this.prevPointer.y = cy;
    };

    const onMove = (e) => {
      const cx = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
      const cy = e.clientY ?? (e.touches && e.touches[0].clientY) ?? 0;
      const rect = this.canvas.getBoundingClientRect();

      // Mouse normalized coords (-1 to +1)
      this.mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -(((cy - rect.top) / rect.height) * 2 - 1);
      this.isHovered = true;

      if (this.isDragging) {
        const deltaY = cy - this.prevPointer.y;
        const deltaX = cx - this.prevPointer.x;
        this.prevPointer.x = cx;
        this.prevPointer.y = cy;

        const delta = e.type.startsWith('touch') ? deltaX * 0.008 : -deltaY * 0.006;
        this.targetScrollPos += delta;
      }
    };

    const onUp = () => {
      this.isDragging = false;
      this.canvas.style.cursor = this.hoveredCardIdx !== -1 ? 'pointer' : 'grab';
    };

    const onLeave = () => {
      this.isDragging = false;
      this.isHovered = false;
      this.hoveredCardIdx = -1;
      this.canvas.style.cursor = 'grab';
      this.mouse.x = 0;
      this.mouse.y = 0;
    };

    // Wheel directly advances spiral in hero
    window.addEventListener('wheel', (e) => {
      if (this.pageScroll < 0.2) {
        this.targetScrollPos += e.deltaY * 0.0016;
      }
    }, { passive: true });

    // Click on active front card to open modal
    el.addEventListener('click', (e) => {
      if (this.pageScroll < 0.8) {
        const activeIdx = ((Math.round(this.scrollPos) % this.quests.length) + this.quests.length) % this.quests.length;
        const activeQuest = this.quests[activeIdx];
        sound.playButtonPress();
        this.onSelectQuest(activeQuest);
      }
    });

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    el.addEventListener('mouseleave', onLeave);

    el.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  updateParams(params) {
    Object.assign(this.cfg, params);
  }

  animate() {
    if (!this.isActive) {
      this.rafId = null;
      return;
    }

    this.rafId = requestAnimationFrame(() => this.animate());

    const o = this.cfg;
    const c = this.pageScroll; // page scroll in viewports

    // Timing delta calculation matching Grail (seconds)
    const now = performance.now() / 1000;
    const dt = Math.min(0.05, now - this.lastTime) || 0.016;
    this.lastTime = now;

    // Interpolation milestones from Grail
    const l = _e(this.Pe, this.Fe, c); // Hero -> Chapter 01 merge
    const u = _e(this.Ie, this.Le, c); // Chapter 01 -> Chapter 02 merge
    const d = _e(this.Re, this.ze, c); // Wave flip 360
    const f = _e(this.Be, this.Ve, c);
    const p = Math.max(l, u);

    // Opening reveal expansion: 0 -> 1 over 2.2s
    let m = 1;
    if (this.revealProgress < 1) {
      const e = Math.min(1, Math.max(0, this.revealProgress));
      m = 1 - Math.pow(1 - e, 3); // cubic ease out
    }

    // Dynamic cylinder geometry during opening reveal
    const g = 12 + (o.radius - 12) * m;
    const revealSpeedBoost = 1.0 + 1.2 * (1 - m); // Fluid opening momentum
    const baseCardScale = 0.35 + (o.cardScale - 0.35) * m;

    // Auto advancement along the spiral:
    // When user hovers to inspect a card, auto speed eases down smoothly so they can read!
    const hoverDamp = this.isHovered ? 0.2 : 1.0;
    if (o.auto && !this.isDragging && l < 0.999) {
      this.targetScrollPos += o.autoSpeed * revealSpeedBoost * dt * hoverDamp * (1 - l);
    }

    // Inertia spring smoothing: exact Grail formula P += (M - P) * Math.min(1, dt * 8)
    this.scrollPos += (this.targetScrollPos - this.scrollPos) * Math.min(1, dt * 8);
    if (Math.abs(this.targetScrollPos - this.scrollPos) < 0.0003) {
      this.scrollPos = this.targetScrollPos;
    }
    const b = this.scrollPos;

    // Velocity smear
    const velocity = (b - this.prevPos) / dt;
    this.prevPos = b;
    this.smoothVel += (velocity - this.smoothVel) * 0.25;
    const smearVal = Math.min(0.055, Math.abs(this.smoothVel) * 0.012 * o.smear);

    // Active focal card detection & dynamic accent illumination
    const focalIdx = ((Math.round(b) % this.quests.length) + this.quests.length) % this.quests.length;
    const focalQuest = this.quests[focalIdx];
    if (this.currentFocalQuest !== focalQuest) {
      this.currentFocalQuest = focalQuest;
      const guild = this.guilds[focalQuest.guildIndex];
      document.documentElement.style.setProperty('--accent', guild.color);
    }

    // Cylinder & camera calculations
    const C = g * o.squish;
    this.camera.position.z = C + this.Me;

    // Mouse tilt on group: tilts toward cursor in X and Z
    this.tilt.x += (-this.mouse.y * o.mouseTilt - this.tilt.x) * Math.min(1, dt * 4);
    this.tilt.z += (this.mouse.x * o.mouseTilt - this.tilt.z) * Math.min(1, dt * 4);
    const D = 1 - p;
    this.group.rotation.x = this.tilt.x * D;
    this.group.rotation.z = -this.tilt.z * D;

    // Vertical spacing: lower the group slightly in hero so cards don't collide with title
    // and ease back to 0 in Chapter 01
    this.group.position.y = K(-0.35, 0.0, l);

    // Mouse 3D unprojected ray at z = 0 for Gaussian magnetic pull
    const unprojH = Math.tan((38 * Math.PI / 180) / 2) * this.camera.position.z;
    const unprojW = unprojH * this.camera.aspect;
    const rayX = this.mouse.x * unprojW;
    const rayY = this.mouse.y * unprojH;

    // Pinning logic for Chapter 01 merge:
    if (l > 0.001 && this.lockedIndex === null) {
      this.lockedIndex = Math.round(b);
    }
    if (l < 0.001) {
      this.lockedIndex = null;
    }
    const B = (this.lockedIndex ?? Math.round(b)) - this.pe;
    const de = this.quests.length;

    let hasHoveredCard = false;

    // Position each of the 18 cards along the helical spiral staircase
    for (let e = 0; e < this.fe; e++) {
      const t = B + e;
      const n = t - b;
      const r = n * o.angleStep;
      const cosR = Math.cos(r);
      const sinR = Math.sin(r);
      const mesh = this.cardMeshes[e];
      const cIdx = e - this.pe;

      // Helical Spiral Coordinates
      let posX = g * sinR + n * o.gapX;
      let posY = n * o.gapY;
      let posZ = C * cosR;

      // Gaussian magnetic hover field:
      // Pulls the card toward the cursor in X & Y, and elevates forward in Z on hover!
      const dx = rayX - posX;
      const dy = rayY - posY;
      const distSq = dx * dx + dy * dy;
      const hoverFactor = Math.exp(-distSq / 9); // 1.0 when cursor is right over card
      const magnetW = o.magnet * hoverFactor * (1 - l);

      posX += dx * magnetW;
      posY += dy * magnetW;

      // Hover elevation: card lifts forward toward camera on hover!
      const hoverElevate = hoverFactor * 0.45 * (1 - l);
      posZ += hoverElevate;

      if (hoverFactor > 0.45 && !this.isDragging && l < 0.5) {
        hasHoveredCard = true;
      }

      const twistZ = -sinR * o.edgeTwist;
      const baseDim = Math.max(0.32, 0.5 + 0.5 * cosR);
      const dimming = Math.min(1.0, baseDim + hoverFactor * 0.35); // Glow brighter on hover!
      const rawOrder = posZ * 100;
      
      // Card scale with gentle hover pop
      const hoverScale = 1 + hoverFactor * 0.08 * (1 - l);
      const targetMergeScale = o.cardScale * 1.15;
      const activeCh2Scale = (e === this.pe) ? o.cardScale * 1.35 : 0;

      // ============================================
      // EXACT GRAIL INTERPOLATIONS:
      // 1. Hero -> Chapter 01 merge with l:
      // ============================================
      let curX = K(posX, cIdx * 0.004, l);
      let curY = K(posY, cIdx * 0.0035, l);
      let curZ = K(posZ, -Math.abs(cIdx) * 0.012, l);
      let rotY = K(r, 0, l);
      let rotZ = K(twistZ, 0, l);
      let curScale = K(baseCardScale * hoverScale, targetMergeScale, l);
      let curDim = K(dimming, 1.0, l);

      // ============================================
      // 2. Chapter 01 -> Chapter 02 merge with u:
      // ============================================
      curX = K(curX, 0, u);
      curY = K(curY, 0, u);
      curZ = K(curZ, 0, u);
      rotY = K(rotY, 0, u);
      rotZ = K(rotZ, 0, u);
      curScale = K(curScale, activeCh2Scale, u);
      curDim = K(curDim, 1.0, u);
      curScale *= 1 - (1 - this.He) * f;
      curY += this.Ue * f;

      mesh.position.set(curX, curY, curZ);
      mesh.rotation.set(0, rotY, rotZ);
      mesh.scale.setScalar(curScale);

      // Render order: Hovered card gets depth priority boost
      const fanOrder = (50 - Math.abs(cIdx)) * 2;
      const hoverBoost = hoverFactor > 0.4 ? 60 : 0;
      mesh.renderOrder = Math.round(K(rawOrder + hoverBoost, fanOrder, p));

      // Dynamic shader uniforms
      const uniforms = mesh.material.uniforms;
      const qIdx = ((t % de) + de) % de;
      if (this.frontTextures[qIdx]) {
        uniforms.uTex.value = this.frontTextures[qIdx];
        uniforms.uBack.value = this.backTextures[qIdx];
      }
      // Relax curvature on hover like physical paper
      uniforms.uBend.value = o.bend * (1 - u) * (1 - hoverFactor * 0.35);
      uniforms.uSmear.value = smearVal;
      uniforms.uDim.value = curDim;
      uniforms.uFlip.value = d;
      uniforms.uReveal.value = m;
    }

    // Dynamic cursor feedback: pointer when hovering over any card
    if (!this.isDragging) {
      this.canvas.style.cursor = hasHoveredCard ? 'pointer' : 'grab';
    }

    this.renderer.render(this.scene, this.camera);
  }
}
