const NEXT_ICON_URL = new URL('../../assets/icons/intro-navigate-next.svg', import.meta.url).href;

/** Mount the shared Figma 276:101 content without replacing the native button. */
export function mountActionButton(button) {
  if (button.querySelector(':scope > .action-button__content')) return button;

  const label = document.createElement('span');
  label.className = 'action-button__label';
  label.textContent = button.textContent.trim();

  const icon = document.createElement('img');
  icon.className = 'action-button__icon';
  icon.src = NEXT_ICON_URL;
  icon.alt = '';
  icon.width = 64;
  icon.height = 64;
  icon.setAttribute('aria-hidden', 'true');

  const content = document.createElement('span');
  content.className = 'action-button__content';
  content.append(label, icon);
  button.classList.add('action-button');
  button.replaceChildren(content);
  return button;
}

/** Create another instance using the same markup and native button behavior. */
export function createActionButton({ label, type = 'button' }) {
  const button = document.createElement('button');
  button.type = type;
  button.textContent = label;
  return mountActionButton(button);
}

/** Enhance the static buttons, keeping their IDs, listeners and form ownership. */
export function mountActionButtons(root = document) {
  root.querySelectorAll('button[data-action-button]').forEach(mountActionButton);
}
