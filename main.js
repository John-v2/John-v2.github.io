const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

const c = document.getElementById('stars');
const ctx = c.getContext('2d');
const photo = document.querySelector('.space-photo');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WRAP = 2400;
let layers = [], bright = [], shooters = [];

function starColor() {
  const r = Math.random();
  if (r < 0.12) return '170,190,255';
  if (r < 0.55) return '235,240,255';
  if (r < 0.8) return '255,244,220';
  if (r < 0.94) return '255,214,160';
  return '255,170,130';
}

function makeStars(n) {
  return Array.from({ length: n }, () => ({
    x: Math.random(), y: Math.random() * WRAP,
    p: Math.random() * Math.PI * 2, s: Math.random(), c: starColor()
  }));
}

function resize() {
  c.width = innerWidth; c.height = innerHeight;
  const area = Math.min(1, (c.width * c.height) / (1440 * 900));
  layers = [
    { stars: makeStars(Math.round(260 * area) + 60), speed: 0.05, size: 0.45, alpha: 0.7 },
    { stars: makeStars(Math.round(90 * area) + 25), speed: 0.18, size: 0.8, alpha: 0.9 },
    { stars: makeStars(Math.round(22 * area) + 8), speed: 0.4, size: 1.2, alpha: 1 }
  ];
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

  if (photo) photo.style.transform = `translate3d(0, ${-sy * 0.06}px, 0)`;

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
