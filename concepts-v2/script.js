const buttons = Array.from(document.querySelectorAll('[data-scene]'));
const panels = Array.from(document.querySelectorAll('[data-panel]'));

function showScene(index) {
  buttons.forEach((button) => button.classList.toggle('active', button.dataset.scene === String(index)));
  panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === String(index)));
}

buttons.forEach((button) => {
  button.addEventListener('click', () => showScene(button.dataset.scene));
});

document.addEventListener('keydown', (event) => {
  const current = buttons.findIndex((button) => button.classList.contains('active'));
  if (event.key === 'ArrowRight') showScene((current + 1) % buttons.length);
  if (event.key === 'ArrowLeft') showScene((current - 1 + buttons.length) % buttons.length);
});
