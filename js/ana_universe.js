const container = document.getElementById('canvas-container');

// Scene Setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0005);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.z = 800;

const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true }); // Alpha false because we have background
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- BACKGROUND MERGE (The Nebula) ---
const loader = new THREE.TextureLoader();
// High res space texture from three.js examples
const bgTexture = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/cube/space/px.jpg');
scene.background = bgTexture;

// A subtle dark overlay to ensure text pops
// We can't use CSS overlay easily with 3D depth, so we just make particles brighter

// --- PARTICLE SYSTEM ---
const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 6000; // Increased count for density

const posArray = new Float32Array(particleCount * 3);

// Spread particles in a galaxy shape initially
for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 4000; // Wide spread
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Material - Higher Opacity and Brightness
const material = new THREE.PointsMaterial({
    size: 5, // Slightly bigger
    color: 0xaaddff, // Light Cyan/Blue
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

// Particles Mesh
const particlesMesh = new THREE.Points(particlesGeometry, material);
scene.add(particlesMesh);

// --- INTERACTION ---
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// Touch support
document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 0) {
        mouseX = (event.touches[0].clientX - windowHalfX);
        mouseY = (event.touches[0].clientY - windowHalfY);
    }
}, { passive: true });

// --- TEXT FORMATION LOGIC ---
function createTextPoints(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; // Higher res
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // HUGE BOLD FONT
    ctx.font = '900 100px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const points = [];

    // Scan pixels
    for (let y = 0; y < canvas.height; y += 2) { // Skip every other pixel for performance if needed
        for (let x = 0; x < canvas.width; x += 2) {
            const alpha = data[(y * canvas.width + x) * 4 + 3];
            if (alpha > 128) {
                points.push({
                    x: (x - canvas.width / 2) * 12, // Scale factor
                    y: -(y - canvas.height / 2) * 12,
                    z: 0
                });
            }
        }
    }
    return points;
}

const anaPoints = createTextPoints("ANA");
let isFormingText = true; // Start forming immediately
let formTimer = 0;

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    targetX = mouseX * 0.0005;
    targetY = mouseY * 0.0005;

    // Rotate entire system gently based on mouse
    particlesMesh.rotation.y += 0.002; // Constant slow spin
    particlesMesh.rotation.x += (targetY - particlesMesh.rotation.x) * 0.05;
    particlesMesh.rotation.y += (targetX - particlesMesh.rotation.y) * 0.05;

    const positions = particlesGeometry.attributes.position.array;

    // Cycle text formation
    // formTimer += 0.01;
    // if(formTimer > 10) { ... } // Let's just keep it formed mostly, maybe breathe?

    // Pulse effect scale
    const pulse = 1 + Math.sin(elapsedTime * 2) * 0.05;

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        if (isFormingText && i < anaPoints.length) {
            const p = anaPoints[i];

            // Apply Pulse to target positions
            const tx = p.x * pulse;
            const ty = p.y * pulse;
            const tz = p.z; // Z is 0 mostly

            // Lerp towards text shape
            // Add some noise so it's not perfectly static
            const noiseX = Math.cos(elapsedTime * 5 + i) * 2;
            const noiseY = Math.sin(elapsedTime * 5 + i) * 2;

            positions[i3] += (tx + noiseX - positions[i3]) * 0.05;
            positions[i3 + 1] += (ty + noiseY - positions[i3 + 1]) * 0.05;
            positions[i3 + 2] += (tz - positions[i3 + 2]) * 0.05;

        } else {
            // Background Stars
            // Simply float around
            // const x = positions[i3];
            // positions[i3+1] += Math.sin(elapsedTime + x * 0.01) * 0.5;

            // If we want them to feel like a cloud around the text
            // positions[i3] *= 0.99; // pull in? No, let them be space.
        }
    }

    particlesGeometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
