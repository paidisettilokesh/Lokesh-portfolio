const nav = document.querySelector('.primary-nav');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = [...document.querySelectorAll('.primary-nav a')];
const header = document.querySelector('.site-header');

function setMenu(open) {
  menuToggle?.setAttribute('aria-expanded', String(open));
  menuToggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav?.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  if (open) nav?.querySelector('a')?.focus();
  else menuToggle?.focus();
}
menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
navLinks.forEach((link) => link.addEventListener('click', () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Open navigation');
  nav?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') setMenu(false);
});
document.querySelector('#year').textContent = new Date().getFullYear();

// Keep the header useful after the hero and expose the current section to assistive tech.
const sections = [...document.querySelectorAll('main section[id]')];
function updateActiveNavigation() {
  // The hero has no matching text-nav item, so leave the menu unselected at the top.
  if (window.scrollY < 160) {
    navLinks.forEach((link) => link.removeAttribute('aria-current'));
    return;
  }
  const readingLine = window.innerHeight * 0.38;
  const activeSection = [...sections].reverse().find((section) => section.getBoundingClientRect().top <= readingLine);
  navLinks.forEach((link) => {
    const active = activeSection && link.getAttribute('href') === `#${activeSection.id}`;
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 18);
  updateActiveNavigation();
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', updateActiveNavigation, { passive: true });

// Reveal content once as it enters view; without IntersectionObserver content stays visible.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reducedMotion) {
  const revealItems = document.querySelectorAll('.project-card,.service-card,.timeline-item,.skill-group,.credential-card,.activities-card,.contact-item');
  revealItems.forEach((item) => item.classList.add('reveal-item'));
  document.body.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px 280px 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

// A lightweight, dependency-free WebGL architectural miniature city.
// Clean by default; reveals location names, subtitles, and highlights when visitors interact.
const stage = document.querySelector('#city-stage');
const canvas = document.querySelector('#city-canvas');
const fallback = document.querySelector('#city-fallback');
const tooltip = document.querySelector('#city-tooltip');
const tooltipKicker = document.querySelector('#tooltip-kicker');
const tooltipTitle = document.querySelector('#tooltip-title');
const tooltipSubtitle = document.querySelector('#tooltip-subtitle');
const tooltipAction = document.querySelector('#tooltip-action');
const tooltipActionText = document.querySelector('#tooltip-action-text');
const tooltipDismiss = document.querySelector('#tooltip-dismiss');
const hotspotBtns = [...document.querySelectorAll('.city-hotspot-btn')];

const LOCATIONS = [
  {
    id: 1.0,
    point: 'resulens',
    title: 'ResuLens',
    subtitle: 'AI Resume Analyzer',
    kicker: 'PROJECT 01',
    actionText: 'Explore project',
    href: '#resulens',
    anchor: [-3.45, 3.85, -0.5],
    boxMin: [-4.3, 0.0, -1.3],
    boxMax: [-2.6, 4.2, 0.3],
    camera: { yaw: 0.74, pitch: 0.50, radius: 13.8 },
  },
  {
    id: 2.0,
    point: 'syntra',
    title: 'Syntra AI',
    subtitle: 'Email Intelligence',
    kicker: 'PROJECT 02',
    actionText: 'Explore project',
    href: '#syntra',
    anchor: [3.25, 4.45, -0.35],
    boxMin: [2.3, 0.0, -1.2],
    boxMax: [4.2, 4.6, 0.5],
    camera: { yaw: -0.34, pitch: 0.52, radius: 14.0 },
  },
  {
    id: 3.0,
    point: 'services',
    title: 'Services',
    subtitle: 'What I can build',
    kicker: 'SECTION 02',
    actionText: 'View services',
    href: '#services',
    anchor: [4.55, 2.5, 1.65],
    boxMin: [3.6, 0.0, 0.8],
    boxMax: [5.6, 2.9, 2.7],
    camera: { yaw: -0.58, pitch: 0.48, radius: 15.0 },
  },
  {
    id: 4.0,
    point: 'journey',
    title: 'Journey',
    subtitle: 'Experience & Education',
    kicker: 'SECTION 03',
    actionText: 'View journey',
    href: '#journey',
    anchor: [-2.3, 2.5, 3.8],
    boxMin: [-3.3, 0.0, 2.9],
    boxMax: [-1.3, 2.8, 4.8],
    camera: { yaw: 0.88, pitch: 0.60, radius: 16.2 },
  },
  {
    id: 5.0,
    point: 'contact',
    title: 'Contact',
    subtitle: 'Start a conversation',
    kicker: 'SECTION 04',
    actionText: 'Start conversation',
    href: '#contact',
    anchor: [2.5, 2.5, 3.8],
    boxMin: [1.5, 0.0, 2.9],
    boxMax: [3.5, 2.8, 4.8],
    camera: { yaw: -0.76, pitch: 0.48, radius: 15.4 },
  },
];

function showFallback() {
  stage.classList.add('city-fallback-ready');
  if (fallback) fallback.hidden = false;
  if (canvas) canvas.hidden = true;
  if (tooltip) tooltip.style.display = 'none';
  const liveIndicator = document.querySelector('.live-indicator');
  if (liveIndicator) liveIndicator.innerHTML = '<i></i> STATIC DIRECTORY';
  const captionHint = document.querySelector('.city-caption span:last-child');
  if (captionHint) captionHint.textContent = 'USE DIRECTORY BELOW TO EXPLORE';
}

if (canvas && stage) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    depth: true,
    powerPreference: 'low-power',
    premultipliedAlpha: false,
  });

  if (!gl) {
    showFallback();
  } else {
    const vertexShader = `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      attribute vec3 aNormal;
      attribute float aBuildingId;
      uniform mat4 uMVP;
      uniform mat4 uView;
      varying vec3 vColor;
      varying vec3 vNormal;
      varying float vDepth;
      varying float vHeight;
      varying float vBuildingId;

      void main() {
        vec4 clip = uMVP * vec4(aPosition, 1.0);
        gl_Position = clip;
        vColor = aColor;
        vNormal = mat3(uView) * aNormal;
        vDepth = clip.w;
        vHeight = aPosition.y;
        vBuildingId = aBuildingId;
      }
    `;

    const fragmentShader = `
      precision mediump float;
      varying vec3 vColor;
      varying vec3 vNormal;
      varying float vDepth;
      varying float vHeight;
      varying float vBuildingId;

      uniform float uHoveredId;
      uniform float uHighlightFactor;

      void main() {
        vec3 n = normalize(vNormal);
        vec3 keyLight = normalize(vec3(-0.35, 0.85, 0.55));
        vec3 fillLight = normalize(vec3(0.5, 0.4, -0.6));
        
        float diffKey = max(dot(n, keyLight), 0.0);
        float diffFill = max(dot(n, fillLight), 0.0);
        
        // Height-based ambient occlusion
        float groundAo = smoothstep(-0.25, 2.2, vHeight);
        float ao = 0.58 + groundAo * 0.42;
        
        vec3 lit = vColor * (0.50 + diffKey * 0.50) * ao + (vColor * 0.16 * diffFill);
        
        // Window self-illumination: detect warm amber accents
        float isWarm = max(0.0, vColor.r - vColor.b);
        if (isWarm > 0.16 && vHeight > 0.15) {
          lit += vec3(0.35, 0.26, 0.12) * isWarm * 1.4;
        }
        
        // Interactive architectural hover highlight on selected building
        if (uHoveredId > 0.5 && abs(vBuildingId - uHoveredId) < 0.2) {
          vec3 glowColor = vec3(0.96, 0.84, 0.55); // refined architectural amber
          lit = mix(lit * 1.25, glowColor, 0.42 * uHighlightFactor);
          lit += vec3(0.20, 0.24, 0.26) * uHighlightFactor;
        }
        
        // Atmospheric depth haze (architectural dusk fog)
        float fog = smoothstep(12.5, 29.5, vDepth);
        vec3 fogColor = vec3(0.055, 0.105, 0.14);
        gl_FragColor = vec4(mix(lit, fogColor, fog * 0.46), 1.0);
      }
    `;

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) || 'Shader compilation failed';
        gl.deleteShader(shader);
        throw new Error(message);
      }
      return shader;
    }

    function createProgram(vsSource, fsSource) {
      const program = gl.createProgram();
      gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vsSource));
      gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fsSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Shader link failed');
      }
      return program;
    }

    const identity = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    function multiply(a, b) {
      const out = new Float32Array(16);
      for (let c = 0; c < 4; c++) {
        for (let r = 0; r < 4; r++) {
          out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
        }
      }
      return out;
    }
    function perspective(fov, aspect, near, far) {
      const f = 1 / Math.tan(fov / 2);
      const nf = 1 / (near - far);
      const out = new Float32Array(16);
      out[0] = f / aspect;
      out[5] = f;
      out[10] = (far + near) * nf;
      out[11] = -1;
      out[14] = 2 * far * near * nf;
      return out;
    }
    const normalize = (v) => {
      const n = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / n, v[1] / n, v[2] / n];
    };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    function lookAt(eye, target) {
      const z = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
      const x = normalize(cross([0, 1, 0], z));
      const y = cross(z, x);
      const out = identity();
      out[0] = x[0]; out[1] = y[0]; out[2] = z[0];
      out[4] = x[1]; out[5] = y[1]; out[6] = z[1];
      out[8] = x[2]; out[9] = y[2]; out[10] = z[2];
      out[12] = -dot(x, eye); out[13] = -dot(y, eye); out[14] = -dot(z, eye);
      return out;
    }

    function invert4x4(m) {
      const inv = new Float32Array(16);
      inv[0] = m[5]  * m[10] * m[15] - m[5]  * m[11] * m[14] - m[9]  * m[6]  * m[15] + m[9]  * m[7]  * m[14] + m[13] * m[6]  * m[11] - m[13] * m[7]  * m[10];
      inv[4] = -m[4] * m[10] * m[15] + m[4]  * m[11] * m[14] + m[8]  * m[6]  * m[15] - m[8]  * m[7]  * m[14] - m[12] * m[6]  * m[11] + m[12] * m[7]  * m[10];
      inv[8] = m[4]  * m[9]  * m[15] - m[4]  * m[11] * m[13] - m[8]  * m[5]  * m[15] + m[8]  * m[7]  * m[13] + m[12] * m[5]  * m[11] - m[12] * m[7]  * m[9];
      inv[12] = -m[4] * m[9]  * m[14] + m[4] * m[10] * m[13] + m[8]  * m[5]  * m[14] - m[8]  * m[6]  * m[13] - m[12] * m[5]  * m[10] + m[12] * m[6]  * m[9];
      inv[1] = -m[1] * m[10] * m[15] + m[1]  * m[11] * m[14] + m[9]  * m[2]  * m[15] - m[9]  * m[3]  * m[14] - m[13] * m[2]  * m[11] + m[13] * m[3]  * m[10];
      inv[5] = m[0]  * m[10] * m[15] - m[0]  * m[11] * m[14] - m[8]  * m[2]  * m[15] + m[8]  * m[3]  * m[14] + m[12] * m[2]  * m[11] - m[12] * m[3]  * m[10];
      inv[9] = -m[0] * m[9]  * m[15] + m[0]  * m[11] * m[13] + m[8]  * m[1]  * m[15] - m[8]  * m[3]  * m[13] - m[12] * m[1]  * m[11] + m[12] * m[3]  * m[9];
      inv[13] = m[0] * m[9]  * m[14] - m[0]  * m[10] * m[13] - m[8]  * m[1]  * m[14] + m[8]  * m[2]  * m[13] + m[12] * m[1]  * m[10] - m[12] * m[2]  * m[9];
      inv[2] = m[1]  * m[6]  * m[15] - m[1]  * m[7]  * m[14] - m[5]  * m[2]  * m[15] + m[5]  * m[3]  * m[14] + m[13] * m[2]  * m[7]   - m[13] * m[3]  * m[6];
      inv[6] = -m[0] * m[6]  * m[15] + m[0]  * m[7]  * m[14] + m[4]  * m[2]  * m[15] - m[4]  * m[3]  * m[14] - m[12] * m[2]  * m[7]   + m[12] * m[3]  * m[6];
      inv[10] = m[0] * m[5]  * m[15] - m[0]  * m[7]  * m[13] - m[4]  * m[1]  * m[15] + m[4]  * m[3]  * m[13] + m[12] * m[1]  * m[7]   - m[12] * m[3]  * m[5];
      inv[14] = -m[0] * m[5] * m[14] + m[0]  * m[6]  * m[13] + m[4]  * m[1]  * m[14] - m[4]  * m[2]  * m[13] - m[12] * m[1]  * m[6]   + m[12] * m[2]  * m[5];
      inv[3] = -m[1] * m[6]  * m[11] + m[1]  * m[7]  * m[10] + m[5]  * m[2]  * m[11] - m[5]  * m[3]  * m[10] - m[9]  * m[2]  * m[7]   + m[9]  * m[3]  * m[6];
      inv[7] = m[0]  * m[6]  * m[11] - m[0]  * m[7]  * m[10] - m[4]  * m[2]  * m[11] + m[4]  * m[3]  * m[10] + m[8]  * m[2]  * m[7]   - m[8]  * m[3]  * m[6];
      inv[11] = -m[0] * m[5] * m[11] + m[0]  * m[7]  * m[9]  + m[4]  * m[1]  * m[11] - m[4]  * m[3]  * m[9]  - m[8]  * m[1]  * m[7]   + m[8]  * m[3]  * m[5];
      inv[15] = m[0] * m[5]  * m[10] - m[0]  * m[6]  * m[9]  - m[4]  * m[1]  * m[10] + m[4]  * m[2]  * m[9]  + m[8]  * m[1]  * m[6]   - m[8]  * m[2]  * m[5];
      let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
      if (det === 0) return null;
      det = 1.0 / det;
      for (let i = 0; i < 16; i++) inv[i] *= det;
      return inv;
    }

    function unprojectPoint(ndcX, ndcY, ndcZ, invMVP) {
      const x = invMVP[0] * ndcX + invMVP[4] * ndcY + invMVP[8] * ndcZ + invMVP[12];
      const y = invMVP[1] * ndcX + invMVP[5] * ndcY + invMVP[9] * ndcZ + invMVP[13];
      const z = invMVP[2] * ndcX + invMVP[6] * ndcY + invMVP[10] * ndcZ + invMVP[14];
      const w = invMVP[3] * ndcX + invMVP[7] * ndcY + invMVP[11] * ndcZ + invMVP[15];
      return [x / w, y / w, z / w];
    }

    function intersectRayBox(orig, dir, boxMin, boxMax) {
      let tmin = -Infinity, tmax = Infinity;
      for (let i = 0; i < 3; i++) {
        if (Math.abs(dir[i]) < 1e-6) {
          if (orig[i] < boxMin[i] || orig[i] > boxMax[i]) return null;
        } else {
          let t1 = (boxMin[i] - orig[i]) / dir[i];
          let t2 = (boxMax[i] - orig[i]) / dir[i];
          if (t1 > t2) [t1, t2] = [t2, t1];
          tmin = Math.max(tmin, t1);
          tmax = Math.min(tmax, t2);
          if (tmin > tmax || tmax < 0) return null;
        }
      }
      return tmin > 0 ? tmin : tmax;
    }

    const positions = [];
    const colors = [];
    const normals = [];
    const buildingIds = [];

    function box(cx, cy, cz, w, h, d, color, id = 0.0) {
      const x0 = cx - w / 2, x1 = cx + w / 2;
      const y0 = cy - h / 2, y1 = cy + h / 2;
      const z0 = cz - d / 2, z1 = cz + d / 2;
      const faces = [
        { n: [0, 0, -1], p: [[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]] },
        { n: [0, 0, 1], p: [[x1,y0,z1],[x0,y0,z1],[x0,y1,z1],[x1,y1,z1]] },
        { n: [-1, 0, 0], p: [[x0,y0,z1],[x0,y0,z0],[x0,y1,z0],[x0,y1,z1]] },
        { n: [1, 0, 0], p: [[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]] },
        { n: [0, 1, 0], p: [[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]] },
        { n: [0, -1, 0], p: [[x0,y0,z1],[x1,y0,z1],[x1,y0,z0],[x0,y0,z0]] },
      ];
      const brightness = [0.78, 0.95, 0.67, 0.82, 1.12, 0.52];
      for (let f = 0; f < faces.length; f++) {
        const face = faces[f];
        const order = [0, 1, 2, 0, 2, 3];
        const factor = brightness[f];
        for (const index of order) {
          positions.push(...face.p[index]);
          colors.push(color[0] * factor, color[1] * factor, color[2] * factor);
          normals.push(...face.n);
          buildingIds.push(id);
        }
      }
    }

    function triangle(a, b, c, color, id = 0.0) {
      const ab = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
      const ac = [c[0]-a[0], c[1]-a[1], c[2]-a[2]];
      const n = normalize(cross(ab, ac));
      [a, b, c].forEach((point) => {
        positions.push(...point);
        colors.push(...color);
        normals.push(...n);
        buildingIds.push(id);
      });
    }

    function pyramid(cx, baseY, cz, width, height, color, id = 0.0) {
      const half = width / 2;
      const corners = [[cx-half,baseY,cz-half],[cx+half,baseY,cz-half],[cx+half,baseY,cz+half],[cx-half,baseY,cz+half]];
      const apex = [cx, baseY + height, cz];
      for (let i = 0; i < 4; i++) triangle(corners[i], corners[(i + 1) % 4], apex, color, id);
    }

    function tree(x, z, scale = 1) {
      box(x, 0.25 * scale, z, 0.11 * scale, 0.5 * scale, 0.11 * scale, [0.34,0.25,0.17]);
      pyramid(x, 0.43 * scale, z, 0.78 * scale, 0.86 * scale, [0.19,0.42,0.35]);
      pyramid(x, 0.82 * scale, z, 0.54 * scale, 0.66 * scale, [0.27,0.53,0.43]);
    }

    // Ground plinth and quiet street grid
    box(0, -0.28, 0, 13.65, 0.38, 11.75, [0.075, 0.14, 0.17]);
    box(0, -0.075, 0, 13.35, 0.075, 11.45, [0.13, 0.22, 0.23]);
    box(0, -0.01, 0, 12.95, 0.035, 11.05, [0.16, 0.26, 0.26]);
    box(-4.9, 0.045, 0.35, 1.8, 0.09, 2.1, [0.16, 0.27, 0.27]);
    box(4.75, 0.045, 0.45, 1.85, 0.09, 2.05, [0.16, 0.27, 0.27]);
    box(0, 0.025, 4.55, 2.8, 0.06, 0.72, [0.16, 0.34, 0.35]);
    box(0, 0.06, 4.55, 2.45, 0.012, 0.42, [0.30, 0.55, 0.54]);
    for (let x = -6; x <= 6; x += 2) box(x, -0.007, 0, 0.035, 0.012, 10.7, [0.19, 0.32, 0.32]);
    for (let z = -5; z <= 5; z += 2) box(0, -0.006, z, 12.7, 0.012, 0.035, [0.19, 0.32, 0.32]);
    box(0, 0.005, 0, 1.05, 0.025, 10.6, [0.12, 0.22, 0.25]);
    box(0, 0.006, 0, 12.4, 0.025, 0.95, [0.12, 0.22, 0.25]);
    for (let z = -4.5; z <= 4.5; z += 0.75) box(0, 0.022, z, 0.035, 0.012, 0.28, [0.55, 0.57, 0.44]);
    for (let x = -5.4; x <= 5.4; x += 0.85) box(x, 0.022, 0, 0.3, 0.012, 0.035, [0.55, 0.57, 0.44]);

    const buildings = [
      [-4.35,-3.45,1.45,2.1,1.25,[0.20,0.39,0.41]], [-2.35,-3.5,1.15,1.3,1.1,[0.27,0.40,0.43]],
      [0,-3.55,1.55,1.9,1.25,[0.21,0.36,0.41]], [2.1,-3.5,1.1,1.45,1.2,[0.31,0.43,0.43]],
      [4.3,-3.45,1.5,2.35,1.25,[0.22,0.40,0.41]], [-5,-1.4,1.4,1.7,1.5,[0.28,0.4,0.42]],
      [-2.1,-1.5,1.25,2.3,1.2,[0.22,0.43,0.42]], [2.0,-1.55,1.2,1.6,1.3,[0.25,0.39,0.45]],
      [5.0,-1.5,1.25,1.5,1.55,[0.31,0.42,0.42]], [-4.5,1.6,1.2,1.5,1.2,[0.22,0.39,0.42]],
      [4.55,1.65,1.35,2.0,1.25,[0.22,0.38,0.41]], [-5.0,3.85,1.35,2.0,1.0,[0.28,0.39,0.41]],
      [-2.3,3.8,1.45,2.0,1.15,[0.24,0.38,0.43]], [0,3.75,1.25,1.55,1.25,[0.23,0.4,0.43]],
      [2.5,3.8,1.5,2.0,1.15,[0.29,0.42,0.42]], [5.0,3.8,1.15,1.6,1.15,[0.25,0.38,0.42]],
    ];

    function addBuilding([x,z,w,h,d,color], special = false, id = 0.0) {
      const body = special ? color : color.map((v) => v * 0.92);
      box(x, h / 2 + 0.04, z, w, h, d, body, id);
      box(x, h + 0.09, z, w + 0.14, 0.12, d + 0.14, special ? [0.36,0.65,0.58] : [0.28,0.43,0.43], id);
      box(x, h + 0.17, z, w * 0.68, 0.08, d * 0.7, special ? [0.23,0.45,0.43] : [0.22,0.34,0.36], id);
      if (special) {
        box(x, h + 0.34, z, 0.055, 0.44, 0.055, [0.76,0.59,0.35], id);
        box(x, h + 0.56, z, 0.18, 0.035, 0.18, [0.88,0.72,0.47], id);
        for (let fin = -1; fin <= 1; fin += 2) {
          box(x + fin * (w * 0.43), h * 0.52, z - d * 0.5 - 0.025, 0.035, h * 0.88, 0.055, [0.40,0.67,0.61], id);
        }
      }
      const rows = Math.max(2, Math.floor(h / 0.38));
      const cols = Math.max(2, Math.floor(w / 0.35));
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const wx = x - w * 0.32 + (cols === 1 ? 0 : col * (w * 0.64 / (cols - 1)));
          const wy = 0.28 + row * (Math.max(0.3, (h - 0.5) / rows));
          const tint = (row + col) % 5 === 0 ? [0.78,0.63,0.43] : [0.43,0.72,0.68];
          const ww = Math.min(0.12, w * 0.1);
          box(wx, wy, z - d / 2 - 0.012, ww, 0.055, 0.018, tint, id);
          box(wx, wy, z + d / 2 + 0.012, ww, 0.055, 0.018, tint.map((v) => v * 0.78), id);
        }
      }
      const sideRows = Math.max(2, Math.floor(h / 0.48));
      for (let row = 0; row < sideRows; row++) {
        const wy = 0.32 + row * (Math.max(0.3, (h - 0.55) / sideRows));
        box(x - w / 2 - 0.012, wy, z, 0.018, 0.06, Math.min(0.12, d * 0.12), [0.37,0.61,0.56], id);
        box(x + w / 2 + 0.012, wy, z, 0.018, 0.06, Math.min(0.12, d * 0.12), [0.30,0.51,0.49], id);
      }
      box(x - w / 2 - 0.018, h * 0.56, z, 0.025, h * 0.48, 0.045, [0.25,0.45,0.43], id);
    }

    buildings.forEach((building) => {
      let id = 0.0;
      if (Math.abs(building[0] - 4.55) < 0.2 && Math.abs(building[1] - 1.65) < 0.2) {
        id = 3.0; // Services building
      } else if (Math.abs(building[0] - (-2.3)) < 0.2 && Math.abs(building[1] - 3.8) < 0.2) {
        id = 4.0; // Journey building
      } else if (Math.abs(building[0] - 2.5) < 0.2 && Math.abs(building[1] - 3.8) < 0.2) {
        id = 5.0; // Contact building
      }
      addBuilding(building, id > 0, id);
    });

    // Landmark 1: ResuLens (id: 1.0)
    addBuilding([-3.45,-0.5,1.28,3.25,1.34,[0.19,0.49,0.46]], true, 1.0);
    // Landmark 2: Syntra AI (id: 2.0)
    addBuilding([3.25,-0.35,1.42,3.85,1.38,[0.22,0.42,0.49]], true, 2.0);
    // Central civic pavilion
    addBuilding([0.2,1.25,1.65,4.55,1.65,[0.22,0.43,0.45]], true, 0.0);
    addBuilding([-1.85,1.4,1.1,0.95,1.1,[0.27,0.39,0.41]], false, 0.0);
    addBuilding([2.0,1.55,0.92,1.15,0.95,[0.3,0.42,0.43]], false, 0.0);

    const treeSpots = [[-5.65,0.65],[-4.9,2.15],[-2.1,-4.7],[0.9,-4.55],[4.95,2.45],[5.65,-2.5],[-5.65,-2.5],[2.2,4.75]];
    treeSpots.forEach(([tx,tz], index) => {
      box(tx, 0.055, tz, 0.8, 0.1, 0.8, [0.20,0.31,0.27]);
      tree(tx, tz, index % 3 === 0 ? 0.95 : 0.78);
    });

    for (const lx of [-0.72, 0.72]) {
      for (const lz of [-3.5, -1.75, 1.75, 3.5]) {
        box(lx, 0.34, lz, 0.035, 0.68, 0.035, [0.53,0.59,0.52]);
        box(lx, 0.70, lz, 0.18, 0.045, 0.12, [0.83,0.68,0.45]);
      }
    }

    // Refined subtle beacon pins above the 5 interactive landmarks
    LOCATIONS.forEach((loc) => {
      const coords = loc.anchor;
      box(coords[0], coords[1] * 0.45, coords[2], 0.04, coords[1] * 0.9, 0.04, [0.67,0.52,0.31], loc.id);
      box(coords[0], coords[1], coords[2], 0.16, 0.03, 0.16, [0.86,0.72,0.48], loc.id);
    });

    let program;
    try {
      program = createProgram(vertexShader, fragmentShader);
    } catch (error) {
      console.error('City renderer setup failed:', error);
      showFallback();
    }

    if (program) {
      stage.classList.add('city-ready');
      const vertexData = new Float32Array((positions.length / 3) * 10);
      for (let i = 0, j = 0; i < positions.length / 3; i++, j += 10) {
        vertexData.set(positions.slice(i * 3, i * 3 + 3), j);
        vertexData.set(colors.slice(i * 3, i * 3 + 3), j + 3);
        vertexData.set(normals.slice(i * 3, i * 3 + 3), j + 6);
        vertexData[j + 9] = buildingIds[i] || 0.0;
      }

      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
      gl.useProgram(program);

      const stride = 10 * 4;
      const posLoc = gl.getAttribLocation(program, 'aPosition');
      const colorLoc = gl.getAttribLocation(program, 'aColor');
      const normalLoc = gl.getAttribLocation(program, 'aNormal');
      const buildingIdLoc = gl.getAttribLocation(program, 'aBuildingId');

      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(colorLoc);
      gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, stride, 3 * 4);
      gl.enableVertexAttribArray(normalLoc);
      gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, stride, 6 * 4);
      gl.enableVertexAttribArray(buildingIdLoc);
      gl.vertexAttribPointer(buildingIdLoc, 1, gl.FLOAT, false, stride, 9 * 4);

      const mvpLoc = gl.getUniformLocation(program, 'uMVP');
      const viewLoc = gl.getUniformLocation(program, 'uView');
      const hoveredIdLoc = gl.getUniformLocation(program, 'uHoveredId');
      const highlightFactorLoc = gl.getUniformLocation(program, 'uHighlightFactor');

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clearColor(0.055, 0.105, 0.14, 0.0);

      let curYaw = 0.67, targetYaw = 0.67;
      let curPitch = 0.58, targetPitch = 0.58;
      let curRadius = 17.5, targetRadius = 17.5;
      let curHoverId = 0.0, targetHoverId = 0.0;
      let curHighlight = 0.0, targetHighlight = 0.0;

      let drag = null;
      let pointerDownPos = null;
      let hasDragged = false;
      let isPinned = false;
      let activeLocation = null;

      let raf = 0;
      let lastSize = '';
      let invMVP = null;
      let currentEye = [0, 10, 15];
      const target = [0, 1.18, 0];

      function resize() {
        const rect = stage.getBoundingClientRect();
        const mobile = window.matchMedia('(max-width: 700px)').matches;
        const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.1 : 1.35);
        const width = Math.max(1, Math.round(rect.width * dpr));
        const height = Math.max(1, Math.round(rect.height * dpr));
        const size = `${width}x${height}`;
        if (size !== lastSize) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
          lastSize = size;
        }
        return { width, height, dpr };
      }

      function render() {
        const { width, height } = resize();
        const aspect = width / Math.max(1, height);

        const lerpFactor = reducedMotion ? 1.0 : 0.14;
        curYaw += (targetYaw - curYaw) * lerpFactor;
        curPitch += (targetPitch - curPitch) * lerpFactor;
        curRadius += (targetRadius - curRadius) * lerpFactor;
        curHighlight += (targetHighlight - curHighlight) * 0.18;
        curHoverId = targetHoverId;

        const isAnimating = Math.abs(targetYaw - curYaw) > 0.0005 ||
                            Math.abs(targetPitch - curPitch) > 0.0005 ||
                            Math.abs(targetRadius - curRadius) > 0.005 ||
                            Math.abs(targetHighlight - curHighlight) > 0.01;

        currentEye = [
          target[0] + curRadius * Math.sin(curYaw) * Math.cos(curPitch),
          target[1] + curRadius * Math.sin(curPitch),
          target[2] + curRadius * Math.cos(curYaw) * Math.cos(curPitch),
        ];

        const view = lookAt(currentEye, target);
        const projection = perspective(0.68, aspect, 0.1, 60);
        const mvp = multiply(projection, view);
        invMVP = invert4x4(mvp);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(viewLoc, false, view);
        gl.uniformMatrix4fv(mvpLoc, false, mvp);
        gl.uniform1f(hoveredIdLoc, curHoverId);
        gl.uniform1f(highlightFactorLoc, curHighlight);
        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);

        // Project location 3D anchors to screen coordinates
        const viewWidth = stage.clientWidth;
        const viewHeight = stage.clientHeight;

        LOCATIONS.forEach((loc) => {
          const [x, y, z] = loc.anchor;
          const clipX = mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12];
          const clipY = mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13];
          const clipZ = mvp[2] * x + mvp[6] * y + mvp[10] * z + mvp[14];
          const clipW = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15];
          const visible = clipW > 0 && clipZ / clipW > -1 && clipZ / clipW < 1;
          const px = (clipX / clipW * 0.5 + 0.5) * viewWidth;
          const py = (-clipY / clipW * 0.5 + 0.5) * viewHeight;

          loc.screenX = px;
          loc.screenY = py;
          loc.visible = visible && px > 10 && px < viewWidth - 10 && py > 10 && py < viewHeight - 20;

          const btn = document.querySelector(`.city-hotspot-btn[data-point="${loc.point}"]`);
          if (btn) {
            btn.style.left = `${px}px`;
            btn.style.top = `${py}px`;
            btn.style.display = loc.visible ? 'block' : 'none';
          }
        });

        // Update floating tooltip position when active
        if (tooltip && activeLocation) {
          if (activeLocation.visible) {
            tooltip.style.left = `${activeLocation.screenX}px`;
            tooltip.style.top = `${activeLocation.screenY}px`;
            tooltip.classList.add('is-visible');
          } else {
            tooltip.classList.remove('is-visible');
          }
        } else if (tooltip) {
          tooltip.classList.remove('is-visible');
        }

        if (isAnimating) {
          invalidate();
        }
      }

      function invalidate() {
        if (document.hidden || raf) return;
        raf = requestAnimationFrame(() => { raf = 0; render(); });
      }

      render();
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) invalidate();
        else if (raf) { cancelAnimationFrame(raf); raf = 0; }
      });
      canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        console.warn('WebGL context was lost; showing accessible city fallback.');
        showFallback();
      });

      // Hit-testing using Ray-AABB intersection + projected proximity
      function testHit(clientX, clientY) {
        const rect = stage.getBoundingClientRect();
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        if (mx < 0 || mx > rect.width || my < 0 || my > rect.height) return null;

        // 1. Check screen proximity to projected building anchor
        let closest = null;
        let closestDist = 42;
        for (const loc of LOCATIONS) {
          if (loc.visible && loc.screenX !== undefined) {
            const d = Math.hypot(mx - loc.screenX, my - loc.screenY);
            if (d < closestDist) {
              closestDist = d;
              closest = loc;
            }
          }
        }
        if (closest) return closest;

        // 2. Perform 3D raycasting against bounding boxes
        if (invMVP) {
          const ndcX = (mx / rect.width) * 2 - 1;
          const ndcY = -(my / rect.height) * 2 + 1;
          const nearP = unprojectPoint(ndcX, ndcY, -1, invMVP);
          const farP = unprojectPoint(ndcX, ndcY, 1, invMVP);
          const rayDir = normalize([farP[0] - nearP[0], farP[1] - nearP[1], farP[2] - nearP[2]]);
          let minT = Infinity;
          for (const loc of LOCATIONS) {
            const t = intersectRayBox(currentEye, rayDir, loc.boxMin, loc.boxMax);
            if (t !== null && t < minT) {
              minT = t;
              closest = loc;
            }
          }
          if (closest) return closest;
        }
        return null;
      }

      function showLocationTooltip(loc, pin = false) {
        activeLocation = loc;
        targetHoverId = loc.id;
        targetHighlight = 1.0;
        isPinned = pin;

        if (tooltip) {
          if (tooltipKicker) tooltipKicker.textContent = loc.kicker;
          if (tooltipTitle) tooltipTitle.textContent = loc.title;
          if (tooltipSubtitle) tooltipSubtitle.textContent = loc.subtitle;
          if (tooltipActionText) tooltipActionText.textContent = loc.actionText;
          if (tooltipAction) tooltipAction.href = loc.href;
          tooltip.classList.toggle('is-pinned', pin);
        }
        stage.style.cursor = 'pointer';
        invalidate();
      }

      function hideLocationTooltip() {
        if (isPinned) return;
        activeLocation = null;
        targetHoverId = 0.0;
        targetHighlight = 0.0;
        if (tooltip) {
          tooltip.classList.remove('is-visible', 'is-pinned');
        }
        stage.style.cursor = '';
        invalidate();
      }

      function forceHideTooltip() {
        isPinned = false;
        hideLocationTooltip();
      }

      function navigateToLocation(loc) {
        targetYaw = loc.camera.yaw;
        targetPitch = loc.camera.pitch;
        targetRadius = loc.camera.radius;
        invalidate();

        const targetEl = document.querySelector(loc.href);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          try { history.replaceState(null, '', loc.href); } catch {}
        }
      }

      tooltipDismiss?.addEventListener('click', (e) => {
        e.stopPropagation();
        forceHideTooltip();
      });

      tooltipAction?.addEventListener('click', (e) => {
        if (activeLocation) {
          e.preventDefault();
          navigateToLocation(activeLocation);
        }
      });

      // Camera reset and zoom buttons
      const reset = () => { targetYaw = 0.67; targetPitch = 0.58; targetRadius = 17.5; forceHideTooltip(); invalidate(); };
      document.querySelector('#city-reset')?.addEventListener('click', reset);
      document.querySelector('#city-zoom-in')?.addEventListener('click', () => { targetRadius = Math.max(11.5, targetRadius - 1.4); invalidate(); });
      document.querySelector('#city-zoom-out')?.addEventListener('click', () => { targetRadius = Math.min(24, targetRadius + 1.4); invalidate(); });

      // Pointer events: differentiate clean hover, click, and dragging
      stage.addEventListener('pointerdown', (event) => {
        if (event.target.closest('#city-tooltip, .city-controls, .tooltip-dismiss')) return;
        pointerDownPos = { x: event.clientX, y: event.clientY };
        hasDragged = false;
        drag = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
        stage.setPointerCapture?.(event.pointerId);
      });

      stage.addEventListener('pointermove', (event) => {
        if (drag && drag.pointerId === event.pointerId) {
          const dx = event.clientX - drag.x;
          const dy = event.clientY - drag.y;
          drag.x = event.clientX;
          drag.y = event.clientY;

          if (pointerDownPos && Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y) > 6) {
            hasDragged = true;
            if (!isPinned) hideLocationTooltip();
          }

          targetYaw += dx * 0.006;
          targetPitch = Math.max(0.18, Math.min(1.12, targetPitch + dy * 0.0045));
          invalidate();
          return;
        }

        // Hover detection when moving without drag
        if (!isPinned && event.pointerType !== 'touch') {
          const hit = testHit(event.clientX, event.clientY);
          if (hit) {
            showLocationTooltip(hit, false);
          } else {
            hideLocationTooltip();
          }
        }
      });

      const handlePointerEnd = (event) => {
        const wasDrag = hasDragged;
        hasDragged = false;
        pointerDownPos = null;
        if (drag && (event?.pointerId === undefined || drag.pointerId === event.pointerId)) {
          drag = null;
        }

        if (!wasDrag) {
          const hit = testHit(event.clientX, event.clientY);
          if (hit) {
            if (event.pointerType === 'touch') {
              if (activeLocation === hit && isPinned) {
                navigateToLocation(hit);
              } else {
                showLocationTooltip(hit, true);
              }
            } else {
              navigateToLocation(hit);
            }
          } else {
            if (isPinned) forceHideTooltip();
          }
        }
      };

      stage.addEventListener('pointerup', handlePointerEnd);
      stage.addEventListener('pointercancel', handlePointerEnd);
      stage.addEventListener('lostpointercapture', handlePointerEnd);

      stage.addEventListener('wheel', (event) => {
        event.preventDefault();
        targetRadius = Math.max(11.5, Math.min(24, targetRadius + Math.sign(event.deltaY) * 0.75));
        invalidate();
      }, { passive: false });

      // Keyboard accessibility for interactive hotspots
      hotspotBtns.forEach((btn) => {
        const point = btn.dataset.point;
        const loc = LOCATIONS.find((l) => l.point === point);
        if (!loc) return;

        btn.addEventListener('focus', () => showLocationTooltip(loc, true));
        btn.addEventListener('blur', (e) => {
          if (!stage.contains(e.relatedTarget)) forceHideTooltip();
        });
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          navigateToLocation(loc);
        });
      });

      canvas.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') targetYaw -= 0.12;
        else if (event.key === 'ArrowRight') targetYaw += 0.12;
        else if (event.key === 'ArrowUp') targetPitch = Math.min(1.12, targetPitch + 0.08);
        else if (event.key === 'ArrowDown') targetPitch = Math.max(0.18, targetPitch - 0.08);
        else if (event.key === '+' || event.key === '=') targetRadius = Math.max(11.5, targetRadius - 1.2);
        else if (event.key === '-') targetRadius = Math.min(24, targetRadius + 1.2);
        else return;
        event.preventDefault();
        invalidate();
      });

      const observer = new ResizeObserver(invalidate);
      observer.observe(stage);
      window.addEventListener('resize', invalidate, { passive: true });
    }
  }
}

// 3.5D spatial depth & perspective tilt response across project visuals, service tiles, and 3D architecture
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion) {
  document.querySelectorAll('.project-visual, .service-card, .axonometric-architecture').forEach((surface) => {
    surface.addEventListener('pointermove', (event) => {
      const rect = surface.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      surface.style.setProperty('--tilt-x', `${(0.5 - y) * 3.5}deg`);
      surface.style.setProperty('--tilt-y', `${(x - 0.5) * 4.5}deg`);
      surface.style.setProperty('--glow-x', `${x * 100}%`);
      surface.style.setProperty('--glow-y', `${y * 100}%`);
    });
    surface.addEventListener('pointerleave', () => {
      surface.style.setProperty('--tilt-x', '0deg');
      surface.style.setProperty('--tilt-y', '0deg');
      surface.style.setProperty('--glow-x', '50%');
      surface.style.setProperty('--glow-y', '50%');
    });
  });
}
