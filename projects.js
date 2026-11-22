const modal = document.getElementById('project-modal');
const body = document.getElementById('pm-body');
let lastCard = null;

function openProject(card) {
  const tpl = document.getElementById('tpl-' + card.dataset.project);
  if (!tpl) return;
  lastCard = card;
  body.replaceChildren(tpl.content.cloneNode(true));
  modal.showModal();
  modal.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeProject() {
  modal.classList.add('closing');
  setTimeout(() => {
    modal.classList.remove('closing');
    modal.close();
  }, 180);
}

document.querySelectorAll('.card.clickable').forEach(card => {
  card.addEventListener('click', () => openProject(card));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(card); }
  });
});

modal.querySelector('.pm-close').addEventListener('click', closeProject);
modal.addEventListener('click', e => { if (e.target === modal) closeProject(); });
modal.addEventListener('cancel', e => { e.preventDefault(); closeProject(); });
modal.addEventListener('close', () => {
  document.body.style.overflow = '';
  if (lastCard) lastCard.focus();
});
