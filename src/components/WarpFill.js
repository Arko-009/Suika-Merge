/**
 * GRAIL // WebGL Domain-Warped Organic Ink Expansion (WarpFill)
 * Extracted 1:1 from grail-app.com assets/warpFill-CfnOsA5y.js
 *
 * Implements:
 * - Domain-warped FBM noise with reaching organic fingers (ridged noise layer)
 * - Low-frequency lobes deforming the circular boundary into an organic liquid ink blot
 * - Radial gradient coloring: bright center (#ffdcff) -> base (#f7c6f7) -> deep edges (#9a5ec2)
 * - Premultiplied alpha rendering over transparent/black backdrop
 * - Dynamic undulating boundary time animation (dt * 1.7)
 */

const VERTEX_SHADER = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uRes;
uniform vec2 uOrigin;
uniform float uProgress;
uniform float uNoiseAmp;
uniform float uNoiseScale;
uniform float uEdge;
uniform float uTime;
uniform vec3 uBright;
uniform vec3 uBase;
uniform vec3 uDeep;
uniform vec3 uBackdrop;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    v += valueNoise(p) * amp;
    p = p * 2.02 + 11.3;
    amp *= 0.5;
  }
  return v / 0.969;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  // Flip y so the origin matches top-left coordinate system
  vec2 uv = vec2(frag.x / uRes.x, 1.0 - frag.y / uRes.y);

  float aspect = uRes.x / uRes.y;
  vec2 delta = uv - uOrigin;
  delta.x *= aspect;
  float dist = length(delta);

  // Normalize distance: 0 at origin -> 1 at the farthest corner
  float md = 0.0;
  vec2 d0 = vec2(0.0, 0.0) - uOrigin; d0.x *= aspect; md = max(md, length(d0));
  vec2 d1 = vec2(1.0, 0.0) - uOrigin; d1.x *= aspect; md = max(md, length(d1));
  vec2 d2 = vec2(0.0, 1.0) - uOrigin; d2.x *= aspect; md = max(md, length(d2));
  vec2 d3 = vec2(1.0, 1.0) - uOrigin; d3.x *= aspect; md = max(md, length(d3));
  float d = dist / max(md, 0.001);

  // Domain warp: shove sample coordinates by flowing FBM noise field
  vec2 wq = uv * 2.2;
  vec2 warp = vec2(fbm(wq + uTime * 0.24), fbm(wq + 31.7 - uTime * 0.2)) - 0.5;
  vec2 suv = uv + warp * 0.4;

  // Animated 2D fractal noise field
  float scl = uNoiseScale * 0.5;
  float nz = fbm(suv * scl + uTime * 0.14);
  nz = nz * 0.6 + fbm(suv * scl * 2.3 - uTime * 0.09) * 0.4;

  // Ridged layer -> thin reaching fingers (Grail signature organic shore)
  float ridged = 1.0 - abs(nz * 2.0 - 1.0);
  // Big low-frequency lobes warp whole outline into random liquid blob rather than circle
  float lobe = fbm(suv * (scl * 0.3) + 7.0 + uTime * 0.06);
  float fieldNoise = (nz - 0.5) * 1.4 + (ridged - 0.5) * 0.6 + (lobe - 0.5) * 1.9;

  float reach = uProgress * 1.35 - 0.05;
  // Boundary wild mid-spread, then vanishes so screen fills to solid hole-free pink
  float settle = 1.0 - smoothstep(0.4, 1.0, uProgress);
  // Concentrate distortion toward advancing boundary
  float edge = clamp(d * 1.8, 0.0, 1.0);
  float coverage = (reach - d) + fieldNoise * uNoiseAmp * max(reach, 0.0) * settle * edge;

  float aa = max(uEdge, 0.004);
  float alpha = smoothstep(-aa, aa, coverage);

  // Faint uneven pooling inside the blot
  float inside = step(0.0, coverage);
  float mottle = fbm(uv * 7.0 + 3.0) * 0.08 * inside;

  // Radial gradient: bright center -> base -> deep edge
  float pixelDist = length((uv - uOrigin) * uRes);
  float gradT = clamp(pixelDist / (max(uRes.x, uRes.y) * 0.6), 0.0, 1.0);
  vec3 col = gradT < 0.5
    ? mix(uBright, uBase, gradT * 2.0)
    : mix(uBase, uDeep, (gradT - 0.5) * 2.0);
  col *= (1.0 - mottle);

#ifdef TRANSPARENT
  // Premultiplied alpha output for clean zero-bleed composition over black
  gl_FragColor = vec4(col * alpha, alpha);
#else
  gl_FragColor = vec4(mix(uBackdrop, col, alpha), 1.0);
#endif
}
`;

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

function lerpColor(c1, c2, t) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t
  ];
}

function smoothstep(min, max, val) {
  const r = Math.min(1, Math.max(0, (val - min) / (max - min)));
  return r * r * (3 - 2 * r);
}

export class WarpFill {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {
      transparent: true,
      origin: [0.5, 0.5],
      noiseAmp: 0.82,
      noiseScale: 8.5,
      edge: 0.01,
      ...options
    };

    this.gl = null;
    this.program = null;
    this.buffer = null;
    this.locations = {};
    
    // Animation & State
    this.progress = 0;
    this.lastDrawnProgress = -1;
    this.simTime = 0;
    this.lastTime = performance.now() / 1000;
    this.rafId = null;
    this.wakeUntil = 0;
    this.isDisposed = false;

    // Palette: exact Grail palette
    this.cBright = hexToRgb('#ffdcff');
    this.cBase = hexToRgb('#f7c6f7');
    this.cDeep = hexToRgb('#9a5ec2');
    this.cBackdrop = hexToRgb('#000000');

    this.init();
  }

  init() {
    const gl = this.canvas.getContext('webgl', {
      alpha: !!this.options.transparent,
      antialias: false,
      premultipliedAlpha: true
    }) || this.canvas.getContext('experimental-webgl');

    if (!gl) {
      console.warn('WarpFill: WebGL not available, falling back to CSS radial background');
      return;
    }
    this.gl = gl;

    // Compile Shaders
    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fsSource = (this.options.transparent ? '#define TRANSPARENT\n' : '') + FRAGMENT_SHADER;
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error('WarpFill link failed: ' + err);
    }
    this.program = program;
    gl.useProgram(program);

    // Quad Buffer
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform Locations
    const u = (name) => gl.getUniformLocation(program, name);
    this.locations = {
      uRes: u('uRes'),
      uOrigin: u('uOrigin'),
      uProgress: u('uProgress'),
      uNoiseAmp: u('uNoiseAmp'),
      uNoiseScale: u('uNoiseScale'),
      uEdge: u('uEdge'),
      uTime: u('uTime'),
      uBright: u('uBright'),
      uBase: u('uBase'),
      uDeep: u('uDeep'),
      uBackdrop: u('uBackdrop')
    };

    this.onResize();
    this.draw(0);

    // Start RAF loop
    this.loop = this.loop.bind(this);
    this.rafId = requestAnimationFrame(this.loop);
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('WarpFill compile error: ' + info);
    }
    return shader;
  }

  onResize() {
    if (!this.gl || this.isDisposed) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = Math.floor((this.canvas.clientWidth || window.innerWidth) * dpr);
    const h = Math.floor((this.canvas.clientHeight || window.innerHeight) * dpr);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = Math.max(1, w);
      this.canvas.height = Math.max(1, h);
      this.draw(this.progress);
    }
  }

  setProgress(p) {
    const clamped = Math.max(0, Math.min(1, p));
    if (Math.abs(clamped - this.progress) > 0.0001) {
      this.progress = clamped;
      // Keep undulating loop awake for at least 0.4s after any movement
      this.wakeUntil = performance.now() / 1000 + 0.4;
    }
  }

  draw(progress) {
    const gl = this.gl;
    if (!gl || this.isDisposed) return;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);

    const t = smoothstep(0.5, 0.96, progress);
    const bright = lerpColor(this.cBright, this.cBase, t);
    const deep = lerpColor(this.cDeep, this.cBase, t);

    gl.uniform2f(this.locations.uRes, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.locations.uOrigin, this.options.origin[0], this.options.origin[1]);
    gl.uniform1f(this.locations.uProgress, progress);
    gl.uniform1f(this.locations.uNoiseAmp, this.options.noiseAmp);
    gl.uniform1f(this.locations.uNoiseScale, this.options.noiseScale);
    gl.uniform1f(this.locations.uEdge, this.options.edge);
    gl.uniform1f(this.locations.uTime, this.simTime);
    gl.uniform3fv(this.locations.uBright, bright);
    gl.uniform3fv(this.locations.uBase, this.cBase);
    gl.uniform3fv(this.locations.uDeep, deep);
    gl.uniform3fv(this.locations.uBackdrop, this.cBackdrop);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.lastDrawnProgress = progress;
  }

  loop() {
    if (this.isDisposed) return;

    const now = performance.now() / 1000;
    const dt = Math.min(0.05, now - this.lastTime) || 0.016;
    this.lastTime = now;

    const isActiveRange = this.progress > 0.001 && this.progress < 0.999;
    const isAwake = now <= this.wakeUntil;

    if (isActiveRange || isAwake || Math.abs(this.progress - this.lastDrawnProgress) > 0.0001) {
      if (isActiveRange) {
        this.simTime += dt * 1.7; // Fluid undulation speed matching Grail
      }
      this.draw(this.progress);
    }

    this.rafId = requestAnimationFrame(this.loop);
  }

  dispose() {
    this.isDisposed = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    const gl = this.gl;
    if (gl) {
      if (this.buffer) gl.deleteBuffer(this.buffer);
      if (this.program) gl.deleteProgram(this.program);
    }
  }
}

