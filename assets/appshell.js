// Clicking anywhere in the composer (except its buttons) focuses the textarea, caret at the end
document.querySelector('.composer')?.addEventListener('mousedown', e => {
  const textarea = e.currentTarget.querySelector('textarea');
  if (!textarea || e.target === textarea || e.target.closest('button, a, input, select')) return;
  e.preventDefault();
  textarea.focus();
  const end = textarea.value.length;
  textarea.setSelectionRange(end, end);
});

// Theme button (right rail): switch light / dark, remember the choice
(() => {
  const btn = document.querySelector('.rail-right [aria-label="Theme"]');
  if (!btn) return;
  const SUN = btn.innerHTML;
  const MOON = '<svg class="mi" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.37 5.51A7.35 7.35 0 0 0 9.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0 1 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>';
  const render = () => {
    const light = document.documentElement.dataset.theme === 'light';
    btn.innerHTML = light ? MOON : SUN;
    btn.title = light ? 'Switch to dark theme' : 'Switch to light theme';
    btn.setAttribute('aria-pressed', String(light));
  };
  btn.addEventListener('click', () => {
    const light = document.documentElement.dataset.theme !== 'light';
    if (light) document.documentElement.dataset.theme = 'light';
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('core.theme', light ? 'light' : 'dark'); } catch (e) {}
    render();
  });
  render();
})();

// Classic / Enhanced switch (header): Classic = panel page, Enhanced = full-screen page.
// Keeps the hash (background slug); text + background settings carry over via localStorage.
(() => {
  const PAGES = { Classic: 'core-appshell-panel.html', Enhanced: 'core-appshell-backgrounds.html' };
  document.querySelectorAll('.segmented[aria-label="View mode"] button').forEach(btn => {
    const target = PAGES[btn.textContent.trim()];
    if (!target || btn.getAttribute('aria-pressed') === 'true') return;
    btn.addEventListener('click', () => {
      location.href = target + location.hash;
    });
  });
})();
