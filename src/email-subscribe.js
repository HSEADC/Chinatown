/** Shared newsletter submission for the intro dialog and the landing form. */
export function mountEmailSubscribe(form, { signal } = {}) {
  const emailInput = form.querySelector('input[type="email"]');
  const submitButton = form.querySelector('[type="submit"]');
  const status = form.querySelector('[role="status"]');
  const options = signal ? { signal } : undefined;

  emailInput.addEventListener('input', () => {
    emailInput.removeAttribute('aria-invalid');
    status.textContent = '';
  }, options);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton.disabled) return;
    const email = emailInput.value.trim();
    emailInput.value = email;
    if (!emailInput.checkValidity()) {
      emailInput.setAttribute('aria-invalid', 'true');
      status.textContent = 'Введите корректный адрес электропочты.';
      emailInput.focus();
      return;
    }

    const endpoint = form.action;
    if (!/^https:\/\/formspree\.io\/f\/[a-z0-9]+\/?$/i.test(endpoint)) {
      status.textContent = 'Форма пока не настроена. Попробуйте позже.';
      return;
    }

    submitButton.disabled = true;
    status.textContent = 'Отправляем…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (response.status === 429) {
        status.textContent = 'Слишком много попыток. Попробуйте позже.';
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errors = Array.isArray(data?.errors) ? data.errors : [];
        if (errors.some((error) => error?.field === 'email')) {
          emailInput.setAttribute('aria-invalid', 'true');
        }
        status.textContent = errors.map((error) => error?.message).filter((message) => typeof message === 'string').join(' ') || 'Не удалось отправить адрес. Попробуйте ещё раз.';
        return;
      }
      form.reset();
      status.textContent = 'Готово! Заявка отправлена.';
    } catch {
      status.textContent = 'Не удалось отправить адрес. Попробуйте ещё раз.';
    } finally {
      submitButton.disabled = false;
    }
  }, options);
}
