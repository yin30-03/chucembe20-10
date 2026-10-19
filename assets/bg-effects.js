/**
 * Background Effects – starfield, galaxy, snowfall, fireworks
 * Lấy từ cricle/enhanced-effects.js, chỉ giữ phần nền
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.172.0/build/three.module.js';

const isMobile = window.innerWidth < 768;

let scene, camera, renderer;
let snowParticles, staticStars, galaxy;
let snowVelocities = [];
let fireworks = [];
let isInitialized = false;
let effectsOpacity = 1;
let effectsStartTime = 0;
const EFFECTS_FADE_DURATION = 800;

function initBgEffects() {
    if (isInitialized) return;
    isInitialized = true;

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.id = 'effects-overlay';
    overlayCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        background: transparent;
    `;
    document.body.insertBefore(overlayCanvas, document.body.firstChild);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 10, 65);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
        canvas: overlayCanvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    createStarfield();
    createGalaxy();
    createSnowfall();

    effectsStartTime = Date.now();
    animateEffects();
    window.addEventListener('resize', onWindowResize);
}

function createStarfield() {
    const vertices = [];
    for (let i = 0; i < 8000; i++) {
        vertices.push(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000
        );
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.6
    });
    staticStars = new THREE.Points(geometry, material);
    scene.add(staticStars);
}

function createGalaxy() {
    const particleCount = isMobile ? 18000 : 30000;
    const vertices = [];
    const colors = [];
    const maxRadius = 80;
    const spin = 1;

    const innerColor = new THREE.Color(0xfd9595);
    const midColor = new THREE.Color(0xffb8b8);
    const outerColor = new THREE.Color(0x9966cc);

    for (let i = 0; i < particleCount; i++) {
        const r = Math.pow(Math.random(), 1.5) * maxRadius;
        const angle = Math.random() * Math.PI * 2;
        const spinAngle = r * spin * 0.05;
        const x = Math.cos(angle + spinAngle) * r;
        const y = (Math.random() - 0.5) * 1.5;
        const z = Math.sin(angle + spinAngle) * r;
        vertices.push(x, y, z);

        const t = r / maxRadius;
        let color;
        if (t < 0.5) {
            color = innerColor.clone().lerp(midColor, t * 2);
        } else {
            color = midColor.clone().lerp(outerColor, (t - 0.5) * 2);
        }
        const variation = 0.1;
        color.r += (Math.random() - 0.5) * variation;
        color.g += (Math.random() - 0.5) * variation;
        color.b += (Math.random() - 0.5) * variation;
        colors.push(color.r, color.g, color.b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.12,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.5,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    galaxy = new THREE.Points(geometry, material);
    galaxy.position.y = -20;
    scene.add(galaxy);
}

function createSnowfall() {
    const snowCount = isMobile ? 5000 : 8000;
    const snowVertices = [];
    snowVelocities = [];

    for (let i = 0; i < snowCount; i++) {
        snowVertices.push(
            (Math.random() - 0.5) * 200,
            Math.random() * 200 - 50,
            (Math.random() - 0.5) * 200
        );
        snowVelocities.push({
            y: Math.random() * 0.02 + 0.01,
            swayX: (Math.random() - 0.5) * 0.1,
            swayZ: (Math.random() - 0.5) * 0.1,
            freq: Math.random() * 0.5 + 0.2
        });
    }

    const snowGeometry = new THREE.BufferGeometry();
    snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowVertices, 3));
    const snowMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    snowParticles = new THREE.Points(snowGeometry, snowMaterial);
    scene.add(snowParticles);
}

class Firework {
    constructor(scene) {
        this.scene = scene;
        this.isDead = false;
        const startX = (Math.random() - 0.5) * 40;
        const startY = 20 + Math.random() * 30;
        const startZ = (Math.random() - 0.5) * 20;
        this.createExplosion(new THREE.Vector3(startX, startY, startZ));
    }

    createExplosion(position) {
        const particleCount = 80;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];
        const hue = Math.random();
        const color = new THREE.Color().setHSL(hue, 0.9, 0.6);

        for (let i = 0; i < particleCount; i++) {
            positions.push(position.x, position.y, position.z);
            positions.push(position.x, position.y, position.z);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const speed = 0.12 + Math.random() * 0.2;
            velocities.push({
                x: Math.sin(phi) * Math.cos(theta) * speed,
                y: Math.sin(phi) * Math.sin(theta) * speed,
                z: Math.cos(phi) * speed
            });
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });

        this.mesh = new THREE.LineSegments(geometry, material);
        this.mesh.userData = { velocities, life: 1.0, drag: 0.96 };
        this.scene.add(this.mesh);
    }

    update() {
        if (this.isDead) return;
        const positions = this.mesh.geometry.attributes.position.array;
        const velocities = this.mesh.userData.velocities;
        const gravity = -0.005;
        const drag = this.mesh.userData.drag;

        this.mesh.userData.life -= 0.012;
        this.mesh.material.opacity = this.mesh.userData.life;

        for (let i = 0; i < velocities.length; i++) {
            velocities[i].x *= drag;
            velocities[i].y *= drag;
            velocities[i].z *= drag;
            velocities[i].y += gravity;

            const headIdx = i * 6;
            const tailIdx = i * 6 + 3;

            positions[tailIdx] += (positions[headIdx] - positions[tailIdx]) * 0.15;
            positions[tailIdx + 1] += (positions[headIdx + 1] - positions[tailIdx + 1]) * 0.15;
            positions[tailIdx + 2] += (positions[headIdx + 2] - positions[tailIdx + 2]) * 0.15;

            positions[headIdx] += velocities[i].x;
            positions[headIdx + 1] += velocities[i].y;
            positions[headIdx + 2] += velocities[i].z;
        }

        this.mesh.geometry.attributes.position.needsUpdate = true;

        if (this.mesh.userData.life <= 0) {
            this.isDead = true;
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}

function setEffectsOpacity(opacity) {
    if (snowParticles && snowParticles.material) {
        snowParticles.material.opacity = 0.7 * opacity;
    }
    if (staticStars && staticStars.material) {
        staticStars.material.opacity = 0.6 * opacity;
    }
    if (galaxy && galaxy.material) {
        galaxy.material.opacity = 0.35 * opacity;
    }
}

function animateEffects() {
    requestAnimationFrame(animateEffects);

    const time = Date.now() * 0.0005;
    const now = Date.now();

    if (effectsOpacity < 1 && effectsStartTime > 0) {
        const elapsed = now - effectsStartTime;
        effectsOpacity = Math.min(1, elapsed / EFFECTS_FADE_DURATION);
        setEffectsOpacity(effectsOpacity);
    }

    if (snowParticles) {
        const snowPositions = snowParticles.geometry.attributes.position.array;
        for (let i = 0; i < snowPositions.length; i += 3) {
            const idx = i / 3;
            if (snowVelocities[idx]) {
                const vel = snowVelocities[idx];
                snowPositions[i + 1] -= vel.y;
                snowPositions[i] += Math.sin(time * vel.freq + i) * vel.swayX * 0.1;
                snowPositions[i + 2] += Math.cos(time * vel.freq + i) * vel.swayZ * 0.1;
                if (snowPositions[i + 1] < -60) snowPositions[i + 1] = 100;
            }
        }
        snowParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (galaxy) {
        galaxy.rotation.y += 0.0003;
    }

    if (Math.random() < 0.02) {
        fireworks.push(new Firework(scene));
    }
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        if (fireworks[i].isDead) fireworks.splice(i, 1);
    }

    if (renderer) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Tự chạy khi load
setTimeout(initBgEffects, 80);
