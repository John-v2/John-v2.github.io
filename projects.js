const panel = document.getElementById('hover-panel');
const body = document.getElementById('hp-body');
const arrow = panel.querySelector('.hp-arrow');
const canHover = matchMedia('(hover: hover)').matches;
const GAP = 14, EDGE = 12;
let active = null;

function fill(card) {
  const tpl = document.getElementById('tpl-' + card.dataset.project);
  if (!tpl) return false;
  body.replaceChildren(tpl.content.cloneNode(true));
  return true;
}

function place(card) {
  const r = card.getBoundingClientRect();
  const pw = panel.offsetWidth, ph = panel.offsetHeight;
  const vw = innerWidth, vh = innerHeight;
  let side, x, y;

  const roomR = vw - r.right - GAP - EDGE >= pw, roomL = r.left - GAP - EDGE >= pw;
  const outer = r.left + r.width / 2 < vw / 2 ? 'left' : 'right';
  if (outer === 'left' && roomL) side = 'left';
  else if (outer === 'right' && roomR) side = 'right';
  else if (roomR) side = 'right';
  else if (roomL) side = 'left';
  else if (vh - r.bottom - GAP - EDGE >= ph || r.top < vh / 2) side = 'below';
  else side = 'above';

  if (side === 'right' || side === 'left') {
    x = side === 'right' ? r.right + GAP : r.left - GAP - pw;
    y = Math.min(Math.max(r.top, EDGE + 64), vh - ph - EDGE);
    const ay = Math.min(Math.max(r.top + 28 - y, 16), ph - 28);
    arrow.style.top = ay + 'px'; arrow.style.left = '';
  } else {
    x = Math.min(Math.max(r.left + r.width / 2 - pw / 2, EDGE), vw - pw - EDGE);
    y = side === 'below' ? r.bottom + GAP : r.top - GAP - ph;
    const ax = Math.min(Math.max(r.left + r.width / 2 - x - 6, 16), pw - 28);
    arrow.style.left = ax + 'px'; arrow.style.top = '';
  }
  panel.dataset.side = side;
  panel.style.transform = '';
  panel.style.left = Math.round(x) + 'px';
  panel.style.top = Math.round(y) + 'px';
}

function show(card) {
  if (!fill(card)) return;
  active = card;
  panel.classList.toggle('touch', !canHover);
  panel.setAttribute('aria-hidden', 'false');
  place(card);
  panel.classList.add('show');
}

function hide() {
  active = null;
  panel.classList.remove('show');
  panel.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.card.clickable').forEach(card => {
  if (canHover) {
    card.addEventListener('mouseenter', () => show(card));
    card.addEventListener('mouseleave', hide);
  } else {
    card.addEventListener('click', e => {
      e.stopPropagation();
      active === card ? hide() : show(card);
    });
  }
  card.addEventListener('focus', () => show(card));
  card.addEventListener('blur', hide);
});

document.addEventListener('click', e => { if (!canHover && active && !panel.contains(e.target)) hide(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
addEventListener('scroll', () => { if (active) canHover ? place(active) : hide(); }, { passive: true });
addEventListener('resize', () => { if (active) place(active); });
