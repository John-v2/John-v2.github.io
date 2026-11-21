const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

const c = document.getElementById('stars');
const ctx = c.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let stars = [], shooters = [];

function resize() {
  c.width = innerWidth; c.height = innerHeight;
  const n = Math.min(400, Math.floor((c.width * c.height) / 5000));
  stars = Array.from({ length: n }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    r: Math.random() < 0.9 ? Math.random() * 1 + 0.3 : Math.random() * 1.2 + 1,
    p: Math.random() * Math.PI * 2,
    s: Math.random() * 0.02 + 0.005
  }));
}

function draw() {
  ctx.clearRect(0, 0, c.width, c.height);
  for (const s of stars) {
    if (!reduce) s.p += s.s;
    ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(s.p));
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  if (!reduce && Math.random() < 0.004) {
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
resize(); draw();

const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
