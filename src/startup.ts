// Show the existing shell before downloading/evaluating the 3D editor. Its
// actions stay disabled until main has mounted the demo and warmed the studio.
const params = new URLSearchParams(window.location.search);
document.body.classList.add(params.get('pg') !== '1' || params.get('ui') === '1' ? 'editor' : 'pg');

void import('./main').catch(() => {
  const note = document.querySelector<HTMLElement>('#note');
  if (note) note.textContent = 'The studio could not load. Reload the page to try again.';
});
