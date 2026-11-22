const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

const c = document.getElementById('stars');
const ctx = c.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WRAP = 2400;
let layers = [], bright = [], shooters = [];

const NEB_SPEED = 0.12, NEB_SCALE = 4;
let neb = null;
function hash(x, y, s) {
  let h = x * 374761393 + y * 668265263 + s * 982451653;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), cc = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v;
}
function fbm(x, y, s) {
  let t = 0, a = 0.5, f = 1;
  for (let i = 0; i < 6; i++) { t += a * vnoise(x * f, y * f, s + i * 17); f *= 2.03; a *= 0.5; }
  return t;
}
function sm(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }

function makeNebula() {
  const docH = Math.max(document.documentElement.scrollHeight, innerHeight);
  const w = Math.ceil(innerWidth / NEB_SCALE);
  const h = Math.ceil((innerHeight + (docH - innerHeight) * NEB_SPEED + 40) / NEB_SCALE);
  const off = document.createElement('canvas'); off.width = w; off.height = h;
  const o = off.getContext('2d'), img = o.createImageData(w, h), d = img.data;
  const pal = [[90, 55, 190], [175, 60, 160], [40, 135, 180], [220, 100, 135]];
  const unit = Math.max(w, 260 / NEB_SCALE * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = x / unit * 3, ny = y / unit * 3;
    const wx = fbm(nx + 1.7, ny + 9.2, 3) * 1.6, wy = fbm(nx + 8.3, ny + 2.8, 5) * 1.6;
    const dens = sm(0.42, 0.82, fbm(nx + wx, ny + wy, 1));
    const dust = sm(0.5, 0.72, fbm(nx * 1.8 + 5, ny * 1.8 + 1, 9));
    const band = Math.exp(-Math.pow((y / (innerHeight / NEB_SCALE) * 0.5 - 0.35) - (x / w - 0.5) * 0.6, 2) / 0.03);
    const m = fbm(nx * 0.7, ny * 0.7, 11) * 3.99, i0 = Math.floor(m) % 4, i1 = (i0 + 1) % 4, f = m - Math.floor(m);
    const col = pal[i0].map((v, k) => v + (pal[i1][k] - v) * f);
    const a = dens * (1 - dust * 0.85) * (0.5 + band * 0.6);
    const g = (x + y * w) * 4;
    d[g] = col[0] + dens * 60; d[g + 1] = col[1] + dens * 50; d[g + 2] = col[2] + dens * 60;
    d[g + 3] = Math.min(255, a * 230);
  }
  o.putImageData(img, 0, 0);
  neb = off;
}

function starColor() {
  const r = Math.random();
  if (r < 0.12) return '170,190,255';
  if (r < 0.55) return '235,240,255';
  if (r < 0.8) return '255,244,220';
  if (r < 0.94) return '255,214,160';
  return '255,170,130';
}

function makeStars(n, band) {
  return Array.from({ length: n }, () => {
    let x = Math.random(), y = Math.random() * WRAP;
    if (band && Math.random() < 0.5) { x = Math.random(); y = (0.35 + (x - 0.5) * 0.6 + (Math.random() - 0.5) * 0.18) * innerHeight * 2; }
    return {
    x, y,
    p: Math.random() * Math.PI * 2, s: Math.random(), c: starColor()
    };
  });
}

function resize() {
  c.width = innerWidth; c.height = innerHeight;
  const area = Math.min(1, (c.width * c.height) / (1440 * 900));
  layers = [
    { stars: makeStars(Math.round(420 * area) + 90, true), speed: 0.05, size: 0.45, alpha: 0.7 },
    { stars: makeStars(Math.round(90 * area) + 25), speed: 0.18, size: 0.8, alpha: 0.9 },
    { stars: makeStars(Math.round(22 * area) + 8), speed: 0.4, size: 1.2, alpha: 1 }
  ];
  makeNebula();
  bright = Array.from({ length: Math.round(6 * area) + 3 }, () => ({
    x: Math.random(), y: Math.random() * WRAP, p: Math.random() * Math.PI * 2, c: starColor()
  }));
}

function drawGlow(s, y, t) {
  const x = s.x * c.width, tw = 0.75 + 0.25 * Math.sin(s.p + t * 1.3);
  const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
  g.addColorStop(0, `rgba(${s.c},${0.9 * tw})`);
  g.addColorStop(0.25, `rgba(${s.c},${0.25 * tw})`);
  g.addColorStop(1, `rgba(${s.c},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - 14, y - 14, 28, 28);
  ctx.strokeStyle = `rgba(${s.c},${0.35 * tw})`; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.lineTo(x + 16, y); ctx.moveTo(x, y - 16); ctx.lineTo(x, y + 16); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill();
}

function draw(now) {
  const t = reduce ? 0 : now / 1000;
  const sy = scrollY;
  ctx.clearRect(0, 0, c.width, c.height);

  if (neb) {
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(neb, 0, -sy * NEB_SPEED, c.width, neb.height * NEB_SCALE * (c.width / (neb.width * NEB_SCALE)));
  }

  for (const L of layers) {
    for (const s of L.stars) {
      const y = ((s.y - sy * L.speed) % WRAP + WRAP) % WRAP;
      if (y > c.height + 4) continue;
      ctx.fillStyle = `rgba(${s.c},${L.alpha * (0.5 + 0.5 * Math.abs(Math.sin(s.p + t * (0.4 + s.s))))})`;
      ctx.beginPath(); ctx.arc(s.x * c.width, y, L.size * (0.5 + s.s), 0, Math.PI * 2); ctx.fill();
    }
  }
  for (const b of bright) {
    const y = ((b.y - sy * 0.4) % WRAP + WRAP) % WRAP;
    if (y < c.height + 20) drawGlow(b, y, t);
  }

  if (!reduce && Math.random() < 0.003) {
    shooters.push({ x: Math.random() * c.width, y: Math.random() * c.height * 0.5, life: 1 });
  }
  shooters = shooters.filter(s => s.life > 0);
  for (const s of shooters) {
    ctx.globalAlpha = s.life;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - 80, s.y - 30); ctx.stroke();
    s.x += 9; s.y += 3.4; s.life -= 0.02;
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}

let lastW = innerWidth;
addEventListener('resize', () => {
  if (innerWidth !== lastW) { lastW = innerWidth; resize(); }
  else { c.height = innerHeight; }
});
resize();
requestAnimationFrame(draw);

const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
