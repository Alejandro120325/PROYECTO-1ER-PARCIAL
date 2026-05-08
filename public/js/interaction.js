// js/interaction.js
// Delegación Senior: Este archivo maneja los clics de la UI y llama al motor 3D
import { zoomToPlanet, returnToOverview } from './motor3d.js';

document.addEventListener('DOMContentLoaded', () => {

    // 1. Escuchar los clics en el menú lateral de planetas
    const planetRadios = document.querySelectorAll('input[name="planet"]');

    planetRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Llamamos a la función del motor 3D exportada
                zoomToPlanet(e.target.id);
            }
        });
    });

    // 2. Botón de volver al Sistema Solar (En el footer del HUD Sci-Fi)
    const btnBackOrbit = document.getElementById('btn-back-orbit');

    if (btnBackOrbit) {
        btnBackOrbit.addEventListener('click', (e) => {
            e.preventDefault();
            returnToOverview();

            // UX Senior: Desmarcar los radio buttons para limpiar el menú lateral
            planetRadios.forEach(r => r.checked = false);
        });
    }

    // 3. Efectos hover extra para botones sci-fi (opcional, mejora el UX)
    const scifiBtns = document.querySelectorAll('.scifi-btn');
    scifiBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            // Ejemplo: sonido hover o animación extra aquí
        });
    });
});