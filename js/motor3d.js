// js/motor3d.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import gsap from 'gsap';
import { planetDataConfig, planetEncyclopedia } from './data.js';

// --- GESTOR DE CARGA ---
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.getElementById('loading-progress');

const manager = new THREE.LoadingManager();
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    loadingProgress.style.width = `${(itemsLoaded / itemsTotal) * 100}%`;
};
manager.onLoad = () => {
    gsap.to(loadingScreen, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            loadingScreen.style.display = 'none';
        }
    });
};

// --- SETUP DEL MOTOR ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 4000);
camera.position.set(-180, 220, 480); 
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Tone mapping ACES para colores más vibrantes y naturales (mejor que Reinhard)
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
// Espacio de color sRGB para reproducción correcta de las texturas
renderer.outputColorSpace = THREE.SRGBColorSpace;
// Filtrado anisotrópico máximo para texturas más nítidas en ángulos oblicuos
const MAX_ANISO = renderer.capabilities.getMaxAnisotropy();

// Renderer adicional para etiquetas HTML 2D (CSS2DRenderer)
// Las etiquetas viven en un overlay <div> que no intercepta el mouse (pointer-events: none),
// así el canvas sigue recibiendo eventos para raycaster y OrbitControls.
const css2dRenderer = new CSS2DRenderer();
css2dRenderer.setSize(window.innerWidth, window.innerHeight);
css2dRenderer.domElement.style.position = 'fixed';
css2dRenderer.domElement.style.top = '0';
css2dRenderer.domElement.style.left = '0';
css2dRenderer.domElement.style.pointerEvents = 'none';
css2dRenderer.domElement.style.zIndex = '40';
document.body.appendChild(css2dRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.maxDistance = 1500;

// --- FONDO ESTELAR ---
const textureLoader = new THREE.TextureLoader(manager);

// Helper: carga textura con anisotropía máxima y espacio de color sRGB (color maps)
function loadColorTexture(path) {
    const tex = textureLoader.load(path);
    tex.anisotropy = MAX_ANISO;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

const starGeo = new THREE.SphereGeometry(2500, 64, 64);
const starMat = new THREE.MeshBasicMaterial({
    map: loadColorTexture('js/textures/stars.jpg'),
    side: THREE.BackSide,
    color: 0xddddff
});
const starMesh = new THREE.Mesh(starGeo, starMat);
scene.add(starMesh);

// Polvo estelar
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 3000;
const posArray = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 2400;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({ size: 1.2, color: 0xffffff, transparent: true, opacity: 0.6 });
const particleMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particleMesh);

// --- ILUMINACIÓN ---
// Ambiente sutil para que el lado oscuro no quede totalmente negro
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

// Luz solar principal: punto en el origen (el Sol), color cálido
const sunLight = new THREE.PointLight(0xfff0d0, 5.0, 3000, 1.0);
scene.add(sunLight);

// Luz hemisférica fría desde arriba para dar profundidad cromática
scene.add(new THREE.HemisphereLight(0xbcd4ff, 0x1a1a2a, 0.45));

// Luz frontal atada a la cámara: ilumina el planeta visitado sin desaturar
const cameraLight = new THREE.PointLight(0xffffff, 1.0, 600);
camera.add(cameraLight);

// --- SOL Y PLANETAS ---
const planets = {};
const physicalPlanets = {};
const orbitLines = [];
const planetGroup = new THREE.Group();
scene.add(planetGroup);

// =========================================================
// MATERIAL DE ATMÓSFERA (glow Fresnel)
// Crea un halo coloreado en el contorno del planeta — efecto wow
// =========================================================
function makeAtmosphereMesh(radius, atmConfig) {
    const geo = new THREE.SphereGeometry(radius * (atmConfig.scale || 1.06), 64, 64);
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uGlowColor: { value: new THREE.Color(atmConfig.color) },
            uIntensity: { value: atmConfig.intensity ?? 1.0 }
        },
        vertexShader: /* glsl */`
            varying vec3 vNormal;
            varying vec3 vViewDir;
            void main() {
                vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
                vNormal = normalize(normalMatrix * normal);
                vViewDir = normalize(-viewPos.xyz);
                gl_Position = projectionMatrix * viewPos;
            }
        `,
        fragmentShader: /* glsl */`
            varying vec3 vNormal;
            varying vec3 vViewDir;
            uniform vec3 uGlowColor;
            uniform float uIntensity;
            void main() {
                float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);
                gl_FragColor = vec4(uGlowColor, fresnel * uIntensity);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });
    return new THREE.Mesh(geo, mat);
}

// =========================================================
// ETIQUETAS 2D FLOTANTES (CSS2DRenderer)
// Cada planeta tiene un <div> que sigue su posición 3D.
// Se almacenan en `labels` para hacer fade por distancia en el loop.
// =========================================================
const labels = []; // { id, element, mesh }

function makeLabel(text, parentMesh, yOffset, extraClass = '') {
    const div = document.createElement('div');
    div.className = `planet-label ${extraClass}`.trim();
    div.textContent = text;
    const obj = new CSS2DObject(div);
    obj.position.set(0, yOffset, 0);
    parentMesh.add(obj);
    labels.push({ element: div, mesh: parentMesh });
    return obj;
}

// =========================================================
// SOL — material emisivo brillante (no se ve afectado por luces)
// =========================================================
const sunGeo = new THREE.SphereGeometry(28, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({
    map: loadColorTexture('js/textures/sun.jpg'),
    color: 0xffffff
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Corona del Sol (halo doble: interior cálido + exterior amplio)
const sunCorona = makeAtmosphereMesh(28, { color: 0xffd060, intensity: 1.6, scale: 1.18 });
sun.add(sunCorona);
const sunCoronaOuter = makeAtmosphereMesh(28, { color: 0xff8a2a, intensity: 0.8, scale: 1.45 });
sun.add(sunCoronaOuter);

// Etiqueta flotante del Sol
makeLabel('SOL', sun, 28 * 1.6, 'planet-label--sun');

// =========================================================
// PLANETAS
// =========================================================
const atmospheres = []; // referencias por planeta para animar si hace falta

for (const [id, data] of Object.entries(planetDataConfig)) {
    const orbitContainer = new THREE.Object3D();
    orbitContainer.rotation.x = data.inclination ?? 0;
    orbitContainer.rotation.y = data.startAngle ?? Math.random() * Math.PI * 2;
    planetGroup.add(orbitContainer);

    // Geometría del planeta con más segmentos para mejor silueta
    const geo = new THREE.SphereGeometry(data.radius, 96, 96);
    const isSaturn = (id === 'saturn');

    const colorMap = loadColorTexture(`js/textures/${data.img}.jpg`);

    const mat = new THREE.MeshStandardMaterial({
        map: colorMap,
        roughness: data.roughness ?? 0.85,
        metalness: data.metalness ?? 0.05,
        // Tinte: Saturno ligeramente apagado para que el bloom no lo blanquee
        color: isSaturn ? new THREE.Color(0xb8a578) : new THREE.Color(0xffffff),
        // Emisiva muy sutil que ilumina el lado oscuro sin desaturar el día
        emissive: new THREE.Color(0x0a0a12),
        emissiveIntensity: 0.6
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = data.distance;

    // Atmósfera (glow) si está definida
    if (data.atmosphere) {
        const atm = makeAtmosphereMesh(data.radius, data.atmosphere);
        mesh.add(atm);
        atmospheres.push({ id, mesh: atm });
    }

    // Etiqueta flotante con el nombre del planeta en español
    makeLabel(data.descriptionTitle, mesh, data.radius * 1.5 + 2);

    // Anillos de Saturno con material PBR para mejor look
    if (data.hasRings) {
        const ringGeo = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.3, 128);
        // Aplicar UVs radiales para que el degradado del anillo se vea bien
        const pos = ringGeo.attributes.position;
        const uv = ringGeo.attributes.uv;
        const innerR = data.radius * 1.4;
        const outerR = data.radius * 2.3;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const r = Math.sqrt(x * x + y * y);
            uv.setXY(i, (r - innerR) / (outerR - innerR), 0.5);
        }
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xf0d8a8,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.2;
        mesh.add(ring);
    }

    orbitContainer.add(mesh);

    // Línea de órbita visual: anillo fino que marca el camino del planeta
    const orbitGeo = new THREE.RingGeometry(data.distance - 0.20, data.distance + 0.20, 256);
    const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x6a82b0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.32
    });
    const orbitLine = new THREE.Mesh(orbitGeo, orbitMat);
    orbitLine.rotation.x = Math.PI / 2;
    // Aplicar la misma inclinación al anillo de órbita
    const orbitWrapper = new THREE.Object3D();
    orbitWrapper.rotation.x = data.inclination ?? 0;
    orbitWrapper.add(orbitLine);
    planetGroup.add(orbitWrapper);
    orbitLines.push(orbitWrapper);

    planets[id] = orbitContainer;
    physicalPlanets[id] = mesh;
}

// --- CINTURÓN DE ASTEROIDES ---
function buildAsteroidBelt(count, innerR, outerR, ySpread, baseScale) {
    const asteroidGeo = new THREE.IcosahedronGeometry(0.5, 0);
    const asteroidMat = new THREE.MeshStandardMaterial({
        color: 0x9a8775,
        roughness: 0.95,
        metalness: 0.08,
        flatShading: true,
        emissive: 0x1a1410,
        emissiveIntensity: 0.4
    });
    const mesh = new THREE.InstancedMesh(asteroidGeo, asteroidMat, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = innerR + Math.random() * (outerR - innerR);
        // Pequeña inclinación para dar volumen al cinturón
        const incl = (Math.random() - 0.5) * 0.05;
        const yOff = (Math.random() - 0.5) * ySpread + Math.sin(angle) * incl * radius;
        dummy.position.set(Math.cos(angle) * radius, yOff, Math.sin(angle) * radius);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        const s = baseScale * (0.4 + Math.random() * 1.6);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
}

const mainBelt = buildAsteroidBelt(900, 215, 245, 4, 1.0);
scene.add(mainBelt);

const kuiperBelt = buildAsteroidBelt(500, 540, 640, 8, 1.4);
scene.add(kuiperBelt);

// =========================================================
// RAYCASTER — clic directo sobre planetas en el canvas 3D
// El click dispara el mismo flujo cinematográfico que el menú lateral
// =========================================================
const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

// Meshes interactivos (Sol + cada planeta físico)
const interactiveMeshes = [sun, ...Object.values(physicalPlanets)];

// Mapa inverso mesh → id para identificar qué se cliqueó
const meshToId = new Map();
meshToId.set(sun, 'sun');
for (const [id, mesh] of Object.entries(physicalPlanets)) {
    meshToId.set(mesh, id);
}

function updateMouseFromEvent(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouseNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickPlanet() {
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    if (hits.length === 0) return null;
    return meshToId.get(hits[0].object) || null;
}

// HOVER: cambia el cursor a pointer cuando se pasa sobre un planeta
renderer.domElement.addEventListener('mousemove', (event) => {
    updateMouseFromEvent(event);
    const id = pickPlanet();
    renderer.domElement.style.cursor = id ? 'pointer' : 'default';
});

// CLIC: detectar si fue un clic real (no un drag de OrbitControls)
let mouseDownPos = null;
const CLICK_DRAG_THRESHOLD = 6; // píxeles de tolerancia

renderer.domElement.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return; // solo botón izquierdo
    mouseDownPos = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener('mouseup', (event) => {
    if (event.button !== 0 || !mouseDownPos) return;
    const dx = event.clientX - mouseDownPos.x;
    const dy = event.clientY - mouseDownPos.y;
    const drag = Math.hypot(dx, dy);
    mouseDownPos = null;
    if (drag > CLICK_DRAG_THRESHOLD) return; // fue un arrastre, ignorar

    updateMouseFromEvent(event);
    const id = pickPlanet();
    if (!id) return;

    // Disparar evento — interaction.js lo escucha y aplica zoom + marca el radio del menú
    document.dispatchEvent(new CustomEvent('planet-click', { detail: { id } }));
});

// --- POST-PROCESAMIENTO (BLOOM) ---
// Ajustado para ACES: strength más bajo, radius más alto = halo amplio y suave
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.85, 0.6, 0.35);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- CÁMARA CINEMÁTICA ---
let isZoomed = false;
let currentPlanetId = null;
let globalOrbitTime = 0;

const homeCameraPos = camera.position.clone();
const homeTargetPos = controls.target.clone();

// UI Elements
const planetDetailsPanel = document.getElementById('planet-details');
const mainLogo = document.getElementById('main-logo');
const planetMenu = document.getElementById('planet-menu');
const topNav = document.getElementById('top-nav');

// Distancia base (medio plano) — VISITA = más cerca
function buildCameraOffset(radius, mode = 'overview') {
    // overview: a media distancia (panel abierto)
    // visit:    muy cerca, vista inmersiva
    if (mode === 'visit') {
        return new THREE.Vector3(radius * 1.6, radius * 0.5, radius * 1.6);
    }
    return new THREE.Vector3(radius * 3.0, radius * 1.2, radius * 3.0);
}

export function zoomToPlanet(planetId, mode = 'overview') {
    const physicalPlanet = physicalPlanets[planetId];
    if (!physicalPlanet) return;

    isZoomed = true;
    currentPlanetId = planetId;
    controls.enabled = false;

    // Actualizar nombre del HUD
    const detailsPlanetName = document.getElementById('details-planet-name');
    if (detailsPlanetName && planetDataConfig[planetId]) {
        detailsPlanetName.innerText = planetDataConfig[planetId].descriptionTitle;
    }

    const targetPos = new THREE.Vector3();
    physicalPlanet.getWorldPosition(targetPos);

    const radius = physicalPlanet.geometry.parameters.radius;
    const cameraOffset = buildCameraOffset(radius, mode);
    const finalCamPos = targetPos.clone().add(cameraOffset);

    // Ocultar UI general
    gsap.to([topNav, mainLogo, planetMenu], { opacity: 0, duration: 0.4, pointerEvents: 'none' });

    gsap.to(camera.position, {
        x: finalCamPos.x, y: finalCamPos.y, z: finalCamPos.z,
        duration: 2, ease: 'power3.inOut'
    });

    gsap.to(controls.target, {
        x: targetPos.x, y: targetPos.y, z: targetPos.z,
        duration: 2, ease: 'power3.inOut',
        onComplete: () => {
            controls.enabled = true;
            planetDetailsPanel.classList.add('is-open');
        }
    });
}

// Acercar más al planeta actual (modo VISITA)
export function visitCurrentPlanet() {
    if (!currentPlanetId) return;
    const physicalPlanet = physicalPlanets[currentPlanetId];
    if (!physicalPlanet) return;

    controls.enabled = false;
    const targetPos = new THREE.Vector3();
    physicalPlanet.getWorldPosition(targetPos);
    const radius = physicalPlanet.geometry.parameters.radius;
    const cameraOffset = buildCameraOffset(radius, 'visit');
    const finalCamPos = targetPos.clone().add(cameraOffset);

    gsap.to(camera.position, {
        x: finalCamPos.x, y: finalCamPos.y, z: finalCamPos.z,
        duration: 1.6, ease: 'power3.inOut'
    });
    gsap.to(controls.target, {
        x: targetPos.x, y: targetPos.y, z: targetPos.z,
        duration: 1.6, ease: 'power3.inOut',
        onComplete: () => { controls.enabled = true; }
    });
}

// Volver al "overview" sobre el mismo planeta (al cerrar enciclopedia/estructura)
export function returnToPlanetOverview() {
    if (!currentPlanetId) return;
    const physicalPlanet = physicalPlanets[currentPlanetId];
    if (!physicalPlanet) return;

    controls.enabled = false;
    const targetPos = new THREE.Vector3();
    physicalPlanet.getWorldPosition(targetPos);
    const radius = physicalPlanet.geometry.parameters.radius;
    const cameraOffset = buildCameraOffset(radius, 'overview');
    const finalCamPos = targetPos.clone().add(cameraOffset);

    gsap.to(camera.position, {
        x: finalCamPos.x, y: finalCamPos.y, z: finalCamPos.z,
        duration: 1.6, ease: 'power3.inOut'
    });
    gsap.to(controls.target, {
        x: targetPos.x, y: targetPos.y, z: targetPos.z,
        duration: 1.6, ease: 'power3.inOut',
        onComplete: () => { controls.enabled = true; }
    });
}

export function returnToOverview() {
    controls.enabled = false;
    planetDetailsPanel.classList.remove('is-open');
    currentPlanetId = null;
    exitStructureView({ silent: true });

    gsap.to([topNav, mainLogo, planetMenu], { opacity: 1, duration: 1, pointerEvents: 'auto' });

    gsap.to(camera.position, {
        x: homeCameraPos.x, y: homeCameraPos.y, z: homeCameraPos.z,
        duration: 2, ease: 'power3.inOut'
    });

    gsap.to(controls.target, {
        x: homeTargetPos.x, y: homeTargetPos.y, z: homeTargetPos.z,
        duration: 2, ease: 'power3.inOut',
        onComplete: () => {
            controls.enabled = true;
            isZoomed = false;
        }
    });
}

// =========================================================
// MODO ESTRUCTURA: CUTAWAY 3D (planeta seccionado)
// =========================================================
let structureGroup = null; // grupo del cutaway actual en escena
let structurePlanetId = null;
let originalPlanetVisible = null; // referencia al mesh oculto

function buildCutaway(planetId, baseRadius) {
    const enc = planetEncyclopedia[planetId];
    if (!enc || !enc.structure) return null;
    const layers = enc.structure.layers;

    const group = new THREE.Group();

    const phiStart = Math.PI;
    const phiLength = Math.PI * 1.5;

    const totalSize = layers.reduce((s, l) => s + l.size, 0);
    let cumOuter = baseRadius;

    for (const layer of layers) {
        const thickness = baseRadius * (layer.size / totalSize);
        const outerR = cumOuter;
        const innerR = Math.max(0.05, cumOuter - thickness);

        const mat = new THREE.MeshStandardMaterial({
            color: layer.color,
            side: THREE.DoubleSide,
            roughness: 0.6,
            metalness: 0.05,
            emissive: new THREE.Color(layer.color),
            emissiveIntensity: 0.45
        });

        // Cáscara esférica con la cuña recortada
        const shellGeo = new THREE.SphereGeometry(outerR, 64, 32, phiStart, phiLength);
        group.add(new THREE.Mesh(shellGeo, mat));

        // Caps (paredes planas) en los dos planos meridionales del corte
        // Cada cap es media-anilla en el plano meridional (radial+vertical)
        const buildCap = (phi) => {
            const capGeo = new THREE.RingGeometry(innerR, outerR, 64, 1, -Math.PI / 2, Math.PI);
            // Rota la media-anilla (que está en plano XY, lado +X) al plano meridional en phi
            capGeo.rotateY(phi + Math.PI);
            const capMat = mat.clone();
            return new THREE.Mesh(capGeo, capMat);
        };
        group.add(buildCap(phiStart));                   // pared al inicio del corte
        group.add(buildCap(phiStart + phiLength));       // pared al final del corte

        cumOuter = innerR;
    }

    // Inclinar ligeramente para vista 3/4 cinematográfica
    group.rotation.x = -0.2;
    group.rotation.y = 0.15;

    return group;
}

export function enterStructureView(planetId) {
    if (!planetId) return;
    // Limpiar uno previo si existía
    exitStructureView({ silent: true });

    structurePlanetId = planetId;

    // Tamaño base del cutaway (más grande que el planeta original para mejor visibilidad)
    let baseRadius;
    let worldPos = new THREE.Vector3();
    if (planetId === 'sun') {
        baseRadius = 38;
        sun.getWorldPosition(worldPos);
        sun.visible = false;
        originalPlanetVisible = sun;
    } else {
        const physical = physicalPlanets[planetId];
        if (!physical) return;
        baseRadius = physical.geometry.parameters.radius * 1.7;
        physical.getWorldPosition(worldPos);
        physical.visible = false;
        originalPlanetVisible = physical;
    }

    structureGroup = buildCutaway(planetId, baseRadius);
    if (!structureGroup) return;
    structureGroup.position.copy(worldPos);
    scene.add(structureGroup);

    // Cámara enfoca el cutaway desde un ángulo cinemático 3/4
    controls.enabled = false;
    const camOffset = new THREE.Vector3(baseRadius * 2.4, baseRadius * 1.2, baseRadius * 2.4);
    const finalCamPos = worldPos.clone().add(camOffset);

    gsap.to(camera.position, {
        x: finalCamPos.x, y: finalCamPos.y, z: finalCamPos.z,
        duration: 1.6, ease: 'power3.inOut'
    });
    gsap.to(controls.target, {
        x: worldPos.x, y: worldPos.y, z: worldPos.z,
        duration: 1.6, ease: 'power3.inOut',
        onComplete: () => { controls.enabled = true; }
    });
}

export function exitStructureView({ silent = false } = {}) {
    if (structureGroup) {
        scene.remove(structureGroup);
        structureGroup.traverse(o => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) o.material.dispose();
        });
        structureGroup = null;
    }
    if (originalPlanetVisible) {
        originalPlanetVisible.visible = true;
        originalPlanetVisible = null;
    }
    structurePlanetId = null;
}

// =========================================================
// ZOOM AL SOL
// =========================================================
export function zoomToSun(mode = 'overview') {
    isZoomed = true;
    currentPlanetId = 'sun';
    controls.enabled = false;

    const detailsPlanetName = document.getElementById('details-planet-name');
    if (detailsPlanetName) detailsPlanetName.innerText = 'SOL';

    const targetPos = new THREE.Vector3();
    sun.getWorldPosition(targetPos);

    const radius = 28;
    const cameraOffset = (mode === 'visit')
        ? new THREE.Vector3(radius * 1.8, radius * 0.6, radius * 1.8)
        : new THREE.Vector3(radius * 3.5, radius * 1.4, radius * 3.5);
    const finalCamPos = targetPos.clone().add(cameraOffset);

    gsap.to([topNav, mainLogo, planetMenu], { opacity: 0, duration: 0.4, pointerEvents: 'none' });

    gsap.to(camera.position, {
        x: finalCamPos.x, y: finalCamPos.y, z: finalCamPos.z,
        duration: 2, ease: 'power3.inOut'
    });
    gsap.to(controls.target, {
        x: targetPos.x, y: targetPos.y, z: targetPos.z,
        duration: 2, ease: 'power3.inOut',
        onComplete: () => {
            controls.enabled = true;
            planetDetailsPanel.classList.add('is-open');
        }
    });
}

// --- BUCLE DE RENDERIZADO ---
function animate() {
    requestAnimationFrame(animate);

    // El Sol siempre rota sobre sí mismo (no es un planeta que orbite)
    sun.rotation.y += 0.002;
    starMesh.rotation.y += 0.0001;
    particleMesh.rotation.y += 0.0002;

    // ========== PAUSA GLOBAL AL VISITAR UN PLANETA ==========
    // Cuando entras a cualquier planeta (isZoomed=true), TODO el sistema solar se congela:
    // órbitas, rotación de planetas y cinturones de asteroides.
    // Al volver al sistema solar (returnToOverview pone isZoomed=false) todo se reanuda
    // exactamente desde donde quedó.
    const systemRunning = !isZoomed;

    if (systemRunning) {
        // Velocidad orbital base: "lento pero visible". Mercurio da una vuelta en ~16s,
        // la Tierra en ~70s. Las realciones entre planetas son realistas (orbitSpeed por planeta).
        globalOrbitTime += 0.0016;
    }

    for (const [id, orbitContainer] of Object.entries(planets)) {
        const data = planetDataConfig[id];
        const startAngle = data.startAngle ?? 0;
        // Movimiento orbital: cada planeta sigue su anillo. Al congelarse el sistema,
        // globalOrbitTime no avanza, así que rotation.y queda fijo en su última posición.
        orbitContainer.rotation.y = startAngle + globalOrbitTime * data.orbitSpeed;

        if (systemRunning) {
            // Vista general: rotación axial con la velocidad propia del planeta
            physicalPlanets[id].rotation.y += data.rotSpeed;
        } else if (id === currentPlanetId) {
            // INSPECCIÓN: el planeta visitado queda quieto en su órbita
            // pero sigue girando sobre su eje a una velocidad agradable y constante
            // para que el usuario pueda observarlo desde todos los ángulos.
            physicalPlanets[id].rotation.y += 0.0035;
        }
        // El resto de planetas, mientras estamos en zoom, quedan totalmente quietos.
    }

    // Rotación lenta del cutaway si estamos en vista Estructura
    if (structureGroup) {
        structureGroup.rotation.y += 0.0025;
    }

    // Cinturones de asteroides: rotan con el sistema, pausan al visitar un planeta
    if (systemRunning) {
        if (mainBelt) mainBelt.rotation.y += 0.0003;
        if (kuiperBelt) kuiperBelt.rotation.y += 0.00012;
    }

    cameraLight.position.copy(camera.position);

    controls.update();
    composer.render();
    // Renderizado de las etiquetas 2D superpuestas en la misma cámara.
    // Las etiquetas son siempre visibles (estilo en CSS).
    css2dRenderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    css2dRenderer.setSize(window.innerWidth, window.innerHeight);
});
