// js/main.js
(() => {
  const modals = {
    login: document.getElementById('modal-login'),
    register: document.getElementById('modal-register'),
  };

  let lastFocused = null;

  const openModal = (name) => {
    const modal = modals[name];
    if (!modal) return;
    Object.values(modals).forEach(closeModalElement);
    lastFocused = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.classList.add('modal-open');
    const firstField = modal.querySelector('input:not([type="checkbox"]), button.auth-submit');
    if (firstField) setTimeout(() => firstField.focus({ preventScroll: true }), 50);
  };

  const closeModalElement = (modal) => {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    setTimeout(() => { modal.hidden = true; }, 350);
  };

  const closeAll = () => {
    Object.values(modals).forEach(closeModalElement);
    document.body.classList.remove('modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  };

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open-modal]');
    if (opener) {
      e.preventDefault();
      openModal(opener.dataset.openModal);
      return;
    }
    const switcher = e.target.closest('[data-switch-modal]');
    if (switcher) {
      e.preventDefault();
      openModal(switcher.dataset.switchModal);
      return;
    }
    if (e.target.matches('[data-close-modal]')) {
      e.preventDefault();
      closeAll();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  document.querySelectorAll('.auth-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const btn = form.querySelector('.auth-submit');
      if (btn) {
        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Connecting...';
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
          closeAll();
        }, 700);
      }
    });
  });
})();