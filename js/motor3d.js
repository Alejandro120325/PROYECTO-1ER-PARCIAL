// js/motor3d.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
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
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.6;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.maxDistance = 1500;

// --- FONDO ESTELAR ---
const textureLoader = new THREE.TextureLoader(manager);

const starGeo = new THREE.SphereGeometry(2500, 64, 64);
const starMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load('js/textures/stars.jpg'),
    side: THREE.BackSide,
    color: 0xaaaaaa
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

// --- ILUMINACIÓN: más clara para que los planetas se vean mejor ---
scene.add(new THREE.AmbientLight(0xffffff, 0.55));

// Luz solar principal (puntual, en el origen)
const sunLight = new THREE.PointLight(0xffffee, 4.0, 3000, 1.2);
scene.add(sunLight);

// Luz hemisférica para suavizar el lado oscuro
scene.add(new THREE.HemisphereLight(0xbcd4ff, 0x1a1a2a, 0.35));

// Luz frontal atada a la cámara para iluminar el planeta visitado
const cameraLight = new THREE.PointLight(0xffffff, 1.4, 600);
camera.add(cameraLight);

// --- SOL Y PLANETAS ---
const planets = {};
const physicalPlanets = {};
const orbitLines = [];
const planetGroup = new THREE.Group();
scene.add(planetGroup);

// Sol
const sunGeo = new THREE.SphereGeometry(28, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load('js/textures/sun.jpg'),
    color: 0xffffff
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Crear planetas dispersos en sus órbitas
for (const [id, data] of Object.entries(planetDataConfig)) {
    // Contenedor de órbita: rota alrededor del sol
    const orbitContainer = new THREE.Object3D();

    // Inclinación orbital realista (varía por planeta)
    orbitContainer.rotation.x = data.inclination ?? 0;

    // Posición inicial en la órbita: NO alineados, cada uno en su propio punto
    orbitContainer.rotation.y = data.startAngle ?? Math.random() * Math.PI * 2;

    planetGroup.add(orbitContainer);

    // Planeta físico
    const geo = new THREE.SphereGeometry(data.radius, 64, 64);
    // Ajustes por planeta: Saturno se ve demasiado claro por su textura crema + bloom
    const isSaturn = (id === 'saturn');
    const mat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(`js/textures/${data.img}.jpg`),
        roughness: 0.85,
        metalness: 0.05,
        color: isSaturn ? new THREE.Color(0xa89878) : new THREE.Color(0xffffff),
        emissive: new THREE.Color(0x222233),
        emissiveIntensity: isSaturn ? 0.10 : 0.25
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = data.distance;

    // Anillos de Saturno
    if (data.hasRings) {
        const ringGeo = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.3, 96);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xe8d4a8,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.2;
        mesh.add(ring);
    }

    orbitContainer.add(mesh);

    // Línea de órbita visual sutil (anillo en el plano de la órbita)
    const orbitGeo = new THREE.RingGeometry(data.distance - 0.15, data.distance + 0.15, 128);
    const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x4a5a78,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.18
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

// --- POST-PROCESAMIENTO (BLOOM) ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.5);
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

    sun.rotation.y += 0.002;
    starMesh.rotation.y += 0.0001;
    particleMesh.rotation.y += 0.0002;

    // Detener órbitas al acercarse (para que la cámara siga al planeta cómodamente)
    if (!isZoomed) {
        globalOrbitTime += 0.0008;
    }

    for (const [id, orbitContainer] of Object.entries(planets)) {
        const data = planetDataConfig[id];
        const startAngle = data.startAngle ?? 0;
        // Movimiento orbital: cada planeta avanza desde su ángulo inicial
        orbitContainer.rotation.y = startAngle + globalOrbitTime * data.orbitSpeed;
        // Rotación axial: pausada para el planeta enfocado para que se pueda observar tranquilo
        if (!(isZoomed && id === currentPlanetId)) {
            physicalPlanets[id].rotation.y += data.rotSpeed;
        }
    }

    // Rotación lenta del cutaway si estamos en vista Estructura
    if (structureGroup) {
        structureGroup.rotation.y += 0.0025;
    }

    // Rotación muy lenta del cinturón de asteroides
    if (mainBelt) mainBelt.rotation.y += 0.0003;
    if (kuiperBelt) kuiperBelt.rotation.y += 0.00012;

    cameraLight.position.copy(camera.position);

    controls.update();
    composer.render();
}
animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
