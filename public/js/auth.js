// js/auth.js
// address PROBLEM 1 & 2: CONTROLADOR CONCEPTUAL ESPECTACULAR DE AUTENTICACIÓN

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authModal = document.getElementById('auth-modal');
    const authBackdrop = document.getElementById('auth-backdrop');
    const authCard = document.getElementById('auth-card');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const openLoginBtn = document.getElementById('open-login');
    const openRegisterBtn = document.getElementById('open-register');
    const closeAuthBtn = document.getElementById('close-auth');

    const switchToRegisterBtn = document.getElementById('switch-to-register');
    const switchToLoginBtn = document.getElementById('switch-to-login');

    // body element to block scroll
    const body = document.body;

    // --- FUNCIONES ---

    function openModal() {
        authModal.classList.add('is-open');
        body.classList.add('modal-open'); // UX Senior: Bloquear scroll

        // Animación de entrada espectacular con GSAP
        // gsap.fromTo(authCard, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
    }

    function closeModal() {
        authModal.classList.remove('is-open');
        body.classList.remove('modal-open');
    }

    function showLoginForm() {
        loginForm.classList.add('is-active');
        registerForm.classList.remove('is-active');
    }

    function showRegisterForm() {
        registerForm.classList.add('is-active');
        loginForm.classList.remove('is-active');
    }

    // --- LISTENERS ---

    // Abrir modales
    if (openLoginBtn) openLoginBtn.addEventListener('click', () => {
        openModal();
        showLoginForm();
    });

    if (openRegisterBtn) openRegisterBtn.addEventListener('click', () => {
        openModal();
        showRegisterForm();
    });

    // Cerrar modal
    if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeModal);
    // Cerrar al hacer clic en el fondo
    if (authBackdrop) authBackdrop.addEventListener('click', closeModal);
    // Cerrar con la tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal.classList.contains('is-open')) {
            closeModal();
        }
    });

    // Conmutar formularios (Spectacular Transition)
    if (switchToRegisterBtn) switchToRegisterBtn.addEventListener('click', showRegisterForm);
    if (switchToLoginBtn) switchToLoginBtn.addEventListener('click', showLoginForm);


    // --- Simulación de Envío (Conceptual AAA) ---
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // UX Senior: No recargar página

            // Simular carga AAA (puedes añadir un spinner aquí)
            const submitBtn = form.querySelector('.auth-submit');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "PROCESANDO MOTOR DE SALTO...";
            submitBtn.disabled = true;

            setTimeout(() => {
                // address PROBLEM 1: Mostrar alert conceptual
                alert("NIVEL DE ACCESO NO AUTORIZADO.\n\nPara un sistema de login espectacular y funcional, necesitas un Backend y Base de Datos (Node.js/Python, etc.).");

                // Restaurar estado
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                closeModal();
            }, 2000); // 2 segundos de simulación
        });
    });
});