// js/motor3d.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';
// Modularization: Import configuration from js/data.js
import { planetDataConfig } from './data.js';

// --- 1. SETUP DEL MOTOR ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(-100, 100, 300); // Vista cinemática esparcida
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.4;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;

// --- GESTOR DE CARGA PREMIUM (UX/UI Senior) ---
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.getElementById('loading-progress');

const manager = new THREE.LoadingManager();
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    loadingProgress.style.width = `${(itemsLoaded / itemsTotal) * 100}%`;
};
manager.onLoad = () => {
    // Cuando todo termina, desvanecer pantalla de carga
    gsap.to(loadingScreen, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            loadingScreen.style.display = 'none';
        }
    });
};

// --- 2. FONDO ESTELAR (SKYBOX + PARTÍCULAS) ---
const textureLoader = new THREE.TextureLoader(manager); // address PROBLEM 2: USAR MANAGER

// Skybox base fotorealista
const starGeo = new THREE.SphereGeometry(2000, 64, 64);
const starMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load('js/textures/stars.jpg'), // address PROBLEM 2: TEXTURA LOCAL
    side: THREE.BackSide,
    color: 0xaaaaaa
});
const starMesh = new THREE.Mesh(starGeo, starMat);
scene.add(starMesh);

// Partículas de polvo estelar para profundidad extra
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 3000;
const posArray = new Float32Array(particlesCount * 3);
for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 2000;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({ size: 1.2, color: 0xffffff, transparent: true, opacity: 0.6 });
const particleMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particleMesh);

// --- 3. ILUMINACIÓN ---
scene.add(new THREE.AmbientLight(0xffffff, 0.08));
const sunLight = new THREE.PointLight(0xffffee, 3.5, 1500);
scene.add(sunLight);

// Luz frontal atada a la cámara para eliminar las caras negras
const cameraLight = new THREE.PointLight(0xffffff, 0.9, 300);
camera.add(cameraLight);

// --- 4. SOL Y PLANETAS ---
const planets = {};
const physicalPlanets = {};
const planetGroup = new THREE.Group();
scene.add(planetGroup);

// Sol
const sunGeo = new THREE.SphereGeometry(25, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load('js/textures/sun.jpg'),
    color: 0xffffff // address PROBLEM 2: BLANCO PURO PARA BLOOM INTENSO
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Crear planetas dispersos
for (const [id, data] of Object.entries(planetDataConfig)) {
    // 1. Contenedor de Órbita: ESTO es lo que rota alrededor del Sol
    const orbitContainer = new THREE.Object3D();
    planetGroup.add(orbitContainer);

    // 2. El Planeta físico con texturasAAA locales
    const geo = new THREE.SphereGeometry(data.radius, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(`js/textures/${data.img}.jpg`),
        roughness: 0.8, // Menos plástico
        metalness: 0.1
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = data.distance; // Distancia fija inicial en X

    // address PROBLEM 2: ANILLOS DE SATURNO PREMIUM
    if (data.hasRings) {
        const ringGeo = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.2, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xddccaa,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
    }

    orbitContainer.add(mesh);

    // address PROBLEM 1: DISPERSIÓN CINEMÁTICA SUPERIOR (UX/UI Senior)
    // Rotamos el orbitContainer ALEATORIAMENTE al inicio para esparcirlos cinemáticamente
    orbitContainer.rotation.y = Math.random() * Math.PI * 2;
    // address PROBLEM 1: VARIAR LA INCLINACIÓN orbital aleatoriamente para esparcirlos por toda la pantalla (Profundidad)
    orbitContainer.rotation.x = (Math.random() - 0.5) * 0.4;

    planets[id] = orbitContainer;
    physicalPlanets[id] = mesh;
}

// --- 5. POST-PROCESAMIENTO (BLOOM) ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.6, 0.5, 0.4);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- 6. CÁMARA CINEMÁTICA Y LÓGICA (GSAP) ---
let isZoomed = false;
let globalOrbitTime = 0;

const homeCameraPos = camera.position.clone();
const homeTargetPos = controls.target.clone();

// UI Elements
const planetDetailsPanel = document.getElementById('planet-details');
const backBtn = document.getElementById('btn-back-orbit');
const mainLogo = document.getElementById('main-logo');
const planetMenu = document.getElementById('planet-menu');
const topNav = document.getElementById('top-nav');

// EXPORTAMOS la función para que interaction.js la pueda llamar
export function zoomToPlanet(planetId) {
    const physicalPlanet = physicalPlanets[planetId];
    if (!physicalPlanet) return;

    isZoomed = true;
    controls.enabled = false;

    // Actualizar nombre en el HUD
    const detailsPlanetName = document.getElementById('details-planet-name');
    if(detailsPlanetName && planetDataConfig[planetId]) {
        detailsPlanetName.innerText = planetDataConfig[planetId].descriptionTitle;
    }

    // Obtener la posición global del planeta en este momento exacto de su órbita
    const targetPos = new THREE.Vector3();
    physicalPlanet.getWorldPosition(targetPos);

    // address PROBLEM 1: CALCULAR VISTA CINEMÁTICA SEGÚN TAMAÑO (Senior UX/UI)
    const radius = physicalPlanet.geometry.parameters.radius;
    // Acercar la cámara cinemáticamente (atrás, arriba y de lado)
    const cameraOffset = new THREE.Vector3(radius * 2.5, radius * 1, radius * 2.5);
    const finalCamPos = targetPos.clone().add(cameraOffset);

    // Ocultar UI general con fluidez
    gsap.to([topNav, mainLogo, planetMenu], { opacity: 0, duration: 0.4, pointerEvents: 'none' });

    // Animar posición de la cámara cinemáticamente
    gsap.to(camera.position, {
        x: finalCamPos.x, y: finalCamPos.y, z: finalCamPos.z,
        duration: 2, ease: "power3.inOut"
    });

    // Animar hacia dónde mira la cámara (hacia el planeta)
    gsap.to(controls.target, {
        x: targetPos.x, y: targetPos.y, z: targetPos.z,
        duration: 2, ease: "power3.inOut",
        onComplete: () => {
            controls.enabled = true;
            // Mostrar HUD Sci-Fi
            planetDetailsPanel.classList.add('is-open');
        }
    });
}

// EXPORTAMOS la función de regreso
export function returnToOverview() {
    controls.enabled = false;
    planetDetailsPanel.classList.remove('is-open');

    // Restaurar UI general
    gsap.to([topNav, mainLogo, planetMenu], { opacity: 1, duration: 1, pointerEvents: 'auto' });

    // Animar cámara de vuelta a casa
    gsap.to(camera.position, {
        x: homeCameraPos.x, y: homeCameraPos.y, z: homeCameraPos.z,
        duration: 2, ease: "power3.inOut"
    });

    gsap.to(controls.target, {
        x: homeTargetPos.x, y: homeTargetPos.y, z: homeTargetPos.z,
        duration: 2, ease: "power3.inOut",
        onComplete: () => {
            controls.enabled = true;
            isZoomed = false;
        }
    });
}

// --- 7. BUCLE DE RENDERIZADO ---
function animate() {
    requestAnimationFrame(animate);

    sun.rotation.y += 0.002;
    starMesh.rotation.y += 0.0001;
    particleMesh.rotation.y += 0.0002; // Polvo estelar flotando suavemente

    // address PROBLEM 1: DETENER ÓRBITAS AL ACERCARSE (Senior UX/UI)
    if (!isZoomed) {
        globalOrbitTime += 0.001;
    }

    for (const [id, orbitContainer] of Object.entries(planets)) {
        // Movimiento orbital (Traslación)
        orbitContainer.rotation.y = globalOrbitTime * planetDataConfig[id].orbitSpeed;

        // Rotación axial sobre sí mismo (Siempre rota)
        physicalPlanets[id].rotation.y += planetDataConfig[id].rotSpeed;
    }

    // address PROBLEM 1: LA LUZ SIGUE A LA CÁMARA (Senior Trick)
    // Esto asegura que siempre veamos la cara iluminada de cualquier planeta que visitemos
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