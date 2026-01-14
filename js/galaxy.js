// --- CENA 3D ---
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 5000);

let targetDist = 300; let currentDist = 300; let rotX = 0.2; let rotY = 0;

const loader = new THREE.TextureLoader();
// Usando textura de espaço
const nebulaTex = loader.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/cube/space/px.jpg");
scene.background = nebulaTex;

// Estrelas
(function (count = 2000, range = 3000) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(3 * count);
    for (let i = 0; i < count; i++) {
        const r = range * (0.3 + 0.7 * Math.random());
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[3 * i + 0] = r * Math.sin(phi) * Math.cos(theta);
        pos[3 * i + 1] = r * Math.cos(phi);
        pos[3 * i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.5, color: 0xffffff, depthWrite: false })));
})();

// Bola Preta Central
const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
const core = new THREE.Mesh(new THREE.SphereGeometry(40, 64, 64), coreMat);
scene.add(core);

// --- TEXTO ---
function makeCenterTextTexture(text) {
    const cvs = document.createElement("canvas"); cvs.width = 1024; cvs.height = 1024;
    const ctx = cvs.getContext("2d"); ctx.clearRect(0, 0, cvs.width, cvs.height);

    ctx.font = "bold 90px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#d400ff";
    ctx.shadowColor = "#aa00ff";
    ctx.shadowBlur = 40;

    ctx.fillText(text, cvs.width / 2, cvs.height / 2);
    return new THREE.CanvasTexture(cvs);
}

// *** ALTERADO DE Ana PARA ANA ***
const centerTex = makeCenterTextTexture(" ANA");

const centerMat = new THREE.SpriteMaterial({
    map: centerTex,
    transparent: true,
    depthTest: false,
    depthWrite: false
});

const centerSprite = new THREE.Sprite(centerMat);
centerSprite.scale.set(70, 70, 1);
centerSprite.renderOrder = 999;
scene.add(centerSprite);

// Brilho Roxo
function makeGlow(size = 768, color1 = "189,0,255", color2 = "102,0,153") {
    const cvs = document.createElement("canvas"); cvs.width = cvs.height = size;
    const ctx = cvs.getContext("2d");
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0.05 * size, size / 2, size / 2, 0.5 * size);
    grad.addColorStop(0, "rgba(" + color1 + ",0.9)");
    grad.addColorStop(0.5, "rgba(" + color2 + ",0.5)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(cvs);
}
const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlow(), transparent: true, depthWrite: false }));
glow.scale.set(500, 500, 1); scene.add(glow);

// Anéis
function ringTexture(size = 768) {
    const cvs = document.createElement("canvas"); cvs.width = cvs.height = size;
    const ctx = cvs.getContext("2d"); ctx.translate(size / 2, size / 2);
    const r1 = 0.34 * size, r2 = 0.49 * size;
    const grad = ctx.createRadialGradient(0, 0, 0.3 * r1, 0, 0, r2);
    grad.addColorStop(0, "rgba(230,200,255,1)");
    grad.addColorStop(0.3, "rgba(189,0,255,0.9)");
    grad.addColorStop(0.65, "rgba(102,0,153,0.6)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, r2, 0, 2 * Math.PI); ctx.arc(0, 0, r1, 0, 2 * Math.PI, true); ctx.closePath(); ctx.fill();
    return new THREE.CanvasTexture(cvs);
}
const ring1 = new THREE.Mesh(new THREE.RingGeometry(60, 80, 128), new THREE.MeshBasicMaterial({ map: ringTexture(), transparent: true, side: THREE.DoubleSide }));
const ring2 = new THREE.Mesh(new THREE.RingGeometry(85, 100, 128), new THREE.MeshBasicMaterial({ map: ringTexture(), transparent: true, side: THREE.DoubleSide, opacity: 0.6 }));
ring1.rotation.x = ring2.rotation.x = Math.PI / 2; scene.add(ring1); scene.add(ring2);

// Frases
const WORDS = [];
const baseWords = ["💖 Meu amor", "🌞 Meu sol", "🌎 Meu mundo", "✨ Você brilha", "❤️ ", "🌌 Universo", "👑 Rainha", "🌠 Estrela", "💫 Meu céu", "🔥 Sempre você", "🎶 Seu riso", "🦋 Liberdade", "💎 És tudo", "🙏 Gratidão", "💕 Carinho", "🌹 Amor eterno", "🤗 Abraços", "🌸 Esperança", "🌈 Alegria", "🌟 Contigo", "🧸 Ternura", "🎁 Minha razão", "🌙 Meu destino", "💌 Lembranças", "🕊️ Minha paz", "🪐 Meu universo", "🌊 Minha calma", "💡 Minha luz", "🍒 Doçura", "🥰 Minha vida", "🎇 Felicidade", "🌻 Alegria", "🌺 Minha flor", "💜 Eternidade", "🌟 Sonhos", "✨ Magia", "🎵 Canção", "🔥 Paixão", "⭐ Minha estrela", "🌴 Meu paraíso", "🌄 Amanhecer", "🌃 Noite contigo", "🎉 Minha festa", "💫 Inspiração", "🌷 Sempre juntos", "🎀 Minha ternura", "🍀 Minha sorte", "🪞 Meu reflexo"];
for (let i = 0; i < 6; i++) WORDS.push(...baseWords);

function makeTextTexture(text, color) {
    const cvs = document.createElement("canvas"); cvs.width = 512; cvs.height = 128;
    const ctx = cvs.getContext("2d"); ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.font = "bold 60px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff"; ctx.shadowColor = color; ctx.shadowBlur = 30;
    ctx.fillText(text, cvs.width / 2, cvs.height / 2);
    return new THREE.CanvasTexture(cvs);
}

const COLORS = ["#bd00ff", "#ff00cc", "#660099", "#9933ff", "#ff3399", "#cc99ff", "#0066ff", "#ff66ff", "#4d0099", "#ff99cc"];
const textGroup = new THREE.Group(); scene.add(textGroup);
for (let i = 0; i < WORDS.length; i++) {
    const tex = makeTextTexture(WORDS[i], COLORS[i % COLORS.length]);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat); sprite.scale.set(50, 16, 1);
    const phi = Math.acos(2 * Math.random() - 1); const theta = Math.random() * Math.PI * 2; const radius = 150 + 120 * Math.random();
    sprite.position.set(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
    sprite.userData = { phi: phi, theta: theta, radius: radius, speed: 0.001 + 0.001 * Math.random() };
    textGroup.add(sprite);
}

// Controles
let dragging = false; let lastX = 0, lastY = 0;
function onDown(e) { dragging = true; const t = e.touches ? e.touches[0] : e; lastX = t.clientX; lastY = t.clientY; }
function onMove(e) { if (!dragging) return; const t = e.touches ? e.touches[0] : e; const dx = (t.clientX - lastX) / innerWidth; const dy = (t.clientY - lastY) / innerHeight; rotY -= 3 * dx; rotX = Math.max(-1.2, Math.min(1.2, rotX - 2.2 * dy)); lastX = t.clientX; lastY = t.clientY; }
function onUp() { dragging = false; }
addEventListener("mousedown", onDown); addEventListener("mousemove", onMove); addEventListener("mouseup", onUp);
addEventListener("touchstart", onDown, { passive: true }); addEventListener("touchmove", onMove, { passive: true }); addEventListener("touchend", onUp, { passive: true });
addEventListener("wheel", (e) => { targetDist += 0.25 * e.deltaY; targetDist = Math.max(160, Math.min(600, targetDist)); }, { passive: true });
let pinch = 0; addEventListener("touchmove", (e) => { if (e.touches && e.touches.length === 2) { e.preventDefault(); const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY; const d = Math.hypot(dx, dy); if (pinch) { targetDist += 0.5 * (pinch - d); targetDist = Math.max(160, Math.min(600, targetDist)); } pinch = d; } }, { passive: false }); addEventListener("touchend", () => { pinch = 0; }, { passive: true });
window.addEventListener("resize", () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

// Loop
let t = 0;
function tick() {
    requestAnimationFrame(tick); t += 0.01;

    ring1.rotation.z += 0.002;
    ring2.rotation.z -= 0.0015;
    glow.scale.set(500 * (1 + 0.03 * Math.sin(0.4 * t)), 500 * (1 + 0.03 * Math.sin(0.4 * t)), 1);

    const pulse = 1 + 0.05 * Math.sin(3 * t);
    core.scale.set(pulse, pulse, pulse);

    centerSprite.scale.set(70 * pulse, 70 * pulse, 1);

    textGroup.children.forEach((sprite) => {
        sprite.material.opacity = 0.8 + 0.2 * Math.sin(2 * t);
        sprite.userData.theta += sprite.userData.speed;
        sprite.position.x = sprite.userData.radius * Math.sin(sprite.userData.phi) * Math.cos(sprite.userData.theta);
        sprite.position.z = sprite.userData.radius * Math.sin(sprite.userData.phi) * Math.sin(sprite.userData.theta);
    });

    currentDist += 0.06 * (targetDist - currentDist);
    const cx = Math.cos(rotX), sx = Math.sin(rotX);
    const cy = Math.cos(rotY), sy = Math.sin(rotY);
    camera.position.set(currentDist * sy * cx, currentDist * sx, currentDist * cy * cx);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}
tick();
