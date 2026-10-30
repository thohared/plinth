const startupGuide = document.getElementById('plinth-guide');

/** Boot-only fallback; running editor context recovery has its own lifecycle. */
export function showStartupFailure(reason: 'graphics' | 'load' | 'startup'): void {
  delete document.documentElement.dataset['plinthReady'];
  if (document.getElementById('startup-error')) return;
  const fallback = document.createElement('main');
  fallback.id = 'startup-error';
  const title = document.createElement('h1');
  title.textContent = 'Plinth could not start';
  title.tabIndex = -1;
  const message = document.createElement('p');
  message.textContent = reason === 'graphics'
    ? 'The 3D preview could not start. Plinth needs WebGL 2 graphics support. Try reloading, or check your browser’s graphics settings and try another supported browser.'
    : reason === 'load'
      ? 'The studio could not load. Check your connection, then reload the page to try again.'
      : 'The studio could not finish starting. Reload the page to try again.';
  const reload = document.createElement('button');
  reload.type = 'button';
  reload.textContent = 'Reload page';
  reload.addEventListener('click', () => window.location.reload());
  fallback.append(title, message, reload);
  const guide = document.getElementById('plinth-guide') ?? startupGuide;
  if (guide) fallback.append(guide);
  document.body.append(fallback);
  document.body.classList.add('startup-failed');
  title.focus();
}
