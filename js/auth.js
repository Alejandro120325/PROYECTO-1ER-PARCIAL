// js/auth.js
import { apiFetch, session } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('auth-modal');
    const authBackdrop = document.getElementById('auth-backdrop');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const openLoginBtn = document.getElementById('open-login');
    const openRegisterBtn = document.getElementById('open-register');
    const closeAuthBtn = document.getElementById('close-auth');
    const switchToRegisterBtn = document.getElementById('switch-to-register');
    const switchToLoginBtn = document.getElementById('switch-to-login');
    const topNav = document.getElementById('top-nav');
    const body = document.body;

    // ---------- Helpers UI ----------
    function openModal() {
        authModal.classList.add('is-open');
        body.classList.add('modal-open');
    }
    function closeModal() {
        authModal.classList.remove('is-open');
        body.classList.remove('modal-open');
        clearErrors();
    }
    function showLoginForm() {
        loginForm.classList.add('is-active');
        registerForm.classList.remove('is-active');
        clearErrors();
    }
    function showRegisterForm() {
        registerForm.classList.add('is-active');
        loginForm.classList.remove('is-active');
        clearErrors();
    }

    function showError(formEl, message) {
        let errEl = formEl.querySelector('.auth-error');
        if (!errEl) {
            errEl = document.createElement('div');
            errEl.className = 'auth-error';
            const submit = formEl.querySelector('.auth-submit');
            submit.parentNode.insertBefore(errEl, submit);
        }
        errEl.textContent = message;
    }
    function clearErrors() {
        document.querySelectorAll('.auth-error').forEach(e => e.remove());
    }

    // ---------- Render del estado de sesión en la barra superior ----------
    function renderSession() {
        const user = session.getUser();
        if (!user) {
            topNav.innerHTML = `
                <button class="nav-btn nav-btn--ghost" id="open-login" type="button">Entrar</button>
                <button class="nav-btn nav-btn--cosmic" id="open-register" type="button">Registrarse</button>
            `;
            document.getElementById('open-login').addEventListener('click', () => { openModal(); showLoginForm(); });
            document.getElementById('open-register').addEventListener('click', () => { openModal(); showRegisterForm(); });
        } else {
            topNav.innerHTML = `
                <div class="nav-user">
                    <i class="fa fa-user-astronaut fa-user"></i>
                    <span>${escapeHtml(user.name)}</span>
                </div>
                <button class="nav-btn nav-btn--ghost" id="logout-btn" type="button">Salir</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', logout);
        }
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    // ---------- Acciones ----------
    async function login(email, password) {
        const data = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        session.setToken(data.token);
        session.setUser(data.user);
        renderSession();
        return data.user;
    }

    async function register(name, email, password) {
        const data = await apiFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        session.setToken(data.token);
        session.setUser(data.user);
        renderSession();
        return data.user;
    }

    function logout() {
        session.clear();
        renderSession();
    }

    // Restaurar sesión al cargar (verifica que el token siga siendo válido)
    async function restoreSession() {
        if (!session.getToken()) return;
        try {
            const data = await apiFetch('/api/auth/me');
            session.setUser(data.user);
            renderSession();
        } catch (_) {
            // Token inválido / expirado
            session.clear();
            renderSession();
        }
    }

    // ---------- Listeners iniciales ----------
    if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeModal);
    if (authBackdrop) authBackdrop.addEventListener('click', closeModal);
    if (switchToRegisterBtn) switchToRegisterBtn.addEventListener('click', showRegisterForm);
    if (switchToLoginBtn) switchToLoginBtn.addEventListener('click', showLoginForm);

    // Listeners iniciales para los botones del top-nav (que existen al cargar)
    if (openLoginBtn) openLoginBtn.addEventListener('click', () => { openModal(); showLoginForm(); });
    if (openRegisterBtn) openRegisterBtn.addEventListener('click', () => { openModal(); showRegisterForm(); });

    // Manejo de submit con fetch real
    loginForm.querySelector('.auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = e.target.querySelector('.auth-submit');
        const original = btn.innerText;
        btn.innerText = 'Conectando...';
        btn.disabled = true;
        try {
            await login(email, password);
            closeModal();
        } catch (err) {
            showError(loginForm, err.message);
        } finally {
            btn.innerText = original;
            btn.disabled = false;
        }
    });

    registerForm.querySelector('.auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const btn = e.target.querySelector('.auth-submit');
        const original = btn.innerText;
        btn.innerText = 'Creando cuenta...';
        btn.disabled = true;
        try {
            await register(name, email, password);
            closeModal();
        } catch (err) {
            showError(registerForm, err.message);
        } finally {
            btn.innerText = original;
            btn.disabled = false;
        }
    });

    // Estado inicial
    renderSession();
    restoreSession();
});
