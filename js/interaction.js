// js/interaction.js
import {
    zoomToPlanet,
    returnToOverview,
    visitCurrentPlanet,
    returnToPlanetOverview,
    enterStructureView,
    exitStructureView,
    zoomToSun
} from './motor3d.js';
import { planetDataConfig, planetEncyclopedia } from './data.js';
import { openGame, closeGame } from './games.js';
import { audio } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
    const planetRadios = document.querySelectorAll('input[name="planet"]');
    const panel = document.getElementById('planet-details');
    const structureOverlay = document.getElementById('structure-overlay');

    let activePlanetId = null;

    function showView(viewName) {
        panel.querySelectorAll('.panel-view').forEach(v => {
            v.hidden = (v.dataset.view !== viewName);
        });
        structureOverlay.hidden = (viewName !== 'structure');
    }

    // Devuelve datos para mostrar (planetas + sol)
    function getPlanetTitle(planetId) {
        if (planetId === 'sun') return 'SOL';
        return planetDataConfig[planetId]?.descriptionTitle || planetId.toUpperCase();
    }

    function setHeaderName(planetId) {
        const enc = planetEncyclopedia[planetId];
        if (!enc) return;
        const title = getPlanetTitle(planetId);

        document.getElementById('details-planet-name').innerText = title;
        document.getElementById('details-planet-type').innerText = enc.type;
        document.getElementById('enc-planet-name').innerText = title;
        document.getElementById('enc-planet-type').innerText = enc.type;
        document.getElementById('struct-planet-name').innerText = title;
        document.getElementById('struct-planet-type').innerText = enc.type;
    }

    function renderEncyclopedia(planetId) {
        const enc = planetEncyclopedia[planetId];
        if (!enc) return;

        const table = document.getElementById('enc-stats');
        table.innerHTML = '';
        for (const [k, v] of Object.entries(enc.stats)) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="enc-key">${k}</td><td class="enc-val">${v}</td>`;
            table.appendChild(tr);
        }

        const body = document.getElementById('enc-body');
        let html = `<p class="enc-intro">${enc.intro}</p>`;
        for (const sec of enc.sections) {
            html += `<h3 class="section-title">${sec.title}</h3><p>${sec.text}</p>`;
        }
        body.innerHTML = html;
    }

    function renderStructure(planetId) {
        const enc = planetEncyclopedia[planetId];
        if (!enc) return;
        const struct = enc.structure;

        document.getElementById('struct-intro').innerText = struct.intro;

        const sectionsEl = document.getElementById('struct-sections');
        sectionsEl.innerHTML = '';
        for (const sec of struct.sections) {
            const block = document.createElement('div');
            block.className = 'struct-block';
            block.innerHTML = `<h3 class="section-title">${sec.title}</h3><p>${sec.text}</p>`;
            sectionsEl.appendChild(block);
        }

        // Overlay 3D: etiquetas estilo HUD junto al cutaway
        const diagram = document.getElementById('struct-diagram');
        diagram.innerHTML = '';
        const labels = document.createElement('div');
        labels.className = 'struct-labels';
        for (const layer of struct.layers) {
            const tag = document.createElement('div');
            tag.className = 'struct-label';
            tag.style.borderLeftColor = layer.color;
            tag.innerHTML = `<div class="struct-label-name">${layer.name}</div><div class="struct-label-detail">${layer.detail}</div>`;
            labels.appendChild(tag);
        }
        diagram.appendChild(labels);
    }

    // Lógica común para seleccionar un planeta (sea por menú o clic en el canvas)
    function selectPlanet(id) {
        activePlanetId = id;
        setHeaderName(activePlanetId);
        showView('menu');
        exitStructureView();
        audio.sfxWhoosh();
        if (activePlanetId === 'sun') {
            zoomToSun();
        } else {
            zoomToPlanet(activePlanetId, 'overview');
        }
    }

    // Selección desde el menú lateral
    planetRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (!e.target.checked) return;
            selectPlanet(e.target.id);
        });
    });

    // Selección desde un clic directo sobre un planeta del canvas 3D (Raycaster)
    document.addEventListener('planet-click', (e) => {
        const id = e.detail?.id;
        if (!id) return;
        // Sincronizar el radio del menú lateral para que el estado visual coincida
        const radio = document.getElementById(id);
        if (radio) radio.checked = true;
        selectPlanet(id);
    });

    // Volver al sistema solar
    const btnBackOrbit = document.getElementById('btn-back-orbit');
    if (btnBackOrbit) {
        btnBackOrbit.addEventListener('click', (e) => {
            e.preventDefault();
            audio.sfxWhoosh();
            activePlanetId = null;
            structureOverlay.hidden = true;
            showView('menu');
            returnToOverview();
            planetRadios.forEach(r => r.checked = false);
        });
    }

    // Botones VISITA / ENCICLOPEDIA / ESTRUCTURA y back
    panel.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn && activePlanetId) {
            const action = actionBtn.dataset.action;
            audio.sfxClick();
            if (action === 'visit') {
                exitStructureView();
                showView('menu');
                if (activePlanetId === 'sun') {
                    zoomToSun('visit');
                } else {
                    visitCurrentPlanet();
                }
            } else if (action === 'encyclopedia') {
                exitStructureView();
                renderEncyclopedia(activePlanetId);
                showView('encyclopedia');
                if (activePlanetId === 'sun') {
                    zoomToSun();
                } else {
                    returnToPlanetOverview();
                }
            } else if (action === 'structure') {
                renderStructure(activePlanetId);
                showView('structure');
                enterStructureView(activePlanetId);
            } else if (action === 'game') {
                openGame(activePlanetId);
            }
            return;
        }

        const backBtn = e.target.closest('[data-back]');
        if (backBtn) {
            const target = backBtn.dataset.back;
            exitStructureView();
            showView(target);
            if (activePlanetId === 'sun') {
                zoomToSun();
            } else if (activePlanetId) {
                returnToPlanetOverview();
            }
            return;
        }

        if (e.target.closest('#panel-back-menu')) {
            activePlanetId = null;
            structureOverlay.hidden = true;
            showView('menu');
            returnToOverview();
            planetRadios.forEach(r => r.checked = false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;

        // 1. Minijuego abierto
        const gameModal = document.getElementById('game-modal');
        if (gameModal && !gameModal.hidden && gameModal.classList.contains('is-open')) {
            closeGame();
            return;
        }

        // 2. Modal de autenticación abierto
        const authModal = document.getElementById('auth-modal');
        if (authModal && authModal.classList.contains('is-open')) {
            const closeBtn = document.getElementById('close-auth');
            if (closeBtn) closeBtn.click();
            return;
        }

        const detailsPanel = document.getElementById('planet-details');
        if (detailsPanel && detailsPanel.classList.contains('is-open')) {
            const currentView = panel.querySelector('.panel-view:not([hidden])');
            const viewName = currentView?.dataset.view;

            if (viewName === 'encyclopedia' || viewName === 'structure') {
                exitStructureView();
                showView('menu');
                if (activePlanetId === 'sun') zoomToSun();
                else if (activePlanetId) returnToPlanetOverview();
                return;
            }

            activePlanetId = null;
            structureOverlay.hidden = true;
            showView('menu');
            returnToOverview();
            planetRadios.forEach(r => r.checked = false);
        }
    });
});
