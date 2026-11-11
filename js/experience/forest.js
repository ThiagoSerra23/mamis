/**
 * ForestScene — Parallax forest background with fireflies and fog.
 */
class ForestScene {
    constructor(sceneElement) {
        this.scene = sceneElement;
        this.layers = [];
        this.parallaxEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this._boundMouseMove = (e) => this.handleMouseMove(e);
        this._boundOrientation = (e) => this.handleDeviceOrientation(e);
    }

    init() {
        if (!this.scene) return;

        // Collect parallax layers with their depth factors
        const back = this.scene.querySelectorAll('.forest-trees--back');
        const mid = this.scene.querySelectorAll('.forest-trees--mid');
        const front = this.scene.querySelectorAll('.forest-trees--front');
        const fog = this.scene.querySelectorAll('.forest-fog');
        const moon = this.scene.querySelectorAll('.forest-moon');

        back.forEach(el => this.layers.push({ el, depth: 0.02 }));
        mid.forEach(el => this.layers.push({ el, depth: 0.04 }));
        front.forEach(el => this.layers.push({ el, depth: 0.06 }));
        fog.forEach(el => this.layers.push({ el, depth: 0.01 }));
        moon.forEach(el => this.layers.push({ el, depth: 0.015 }));

        if (this.parallaxEnabled) {
            window.addEventListener('mousemove', this._boundMouseMove);

            // Try gyroscope for mobile
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', this._boundOrientation);
            }
        }

        this.addFireflies();
        this.startFog();
    }

    handleMouseMove(e) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx; // -1 to 1
        const dy = (e.clientY - cy) / cy;

        for (const layer of this.layers) {
            const offsetX = dx * layer.depth * 40;
            const offsetY = dy * layer.depth * 20;
            layer.el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
    }

    handleDeviceOrientation(e) {
        if (e.gamma === null || e.beta === null) return;

        // gamma: left-right tilt (-90 to 90), beta: front-back tilt (-180 to 180)
        const dx = Math.max(-1, Math.min(1, e.gamma / 30));
        const dy = Math.max(-1, Math.min(1, (e.beta - 45) / 30));

        for (const layer of this.layers) {
            const offsetX = dx * layer.depth * 40;
            const offsetY = dy * layer.depth * 20;
            layer.el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
    }

    addFireflies() {
        if (!this.scene) return;

        const forestBg = this.scene.querySelector('.forest-bg');
        if (!forestBg) return;

        const count = this.parallaxEnabled ? 8 : 3;

        for (let i = 0; i < count; i++) {
            const firefly = document.createElement('div');
            firefly.className = 'forest-firefly';
            firefly.style.cssText = `
                position: absolute;
                width: ${3 + Math.random() * 3}px;
                height: ${3 + Math.random() * 3}px;
                background: radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,215,0,0) 70%);
                border-radius: 50%;
                top: ${20 + Math.random() * 60}%;
                left: ${10 + Math.random() * 80}%;
                pointer-events: none;
                z-index: 25;
                animation: fireflyFloat${i % 3} ${4 + Math.random() * 6}s ease-in-out infinite,
                           fireflyGlow ${2 + Math.random() * 3}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            forestBg.appendChild(firefly);
        }

        // Inject firefly keyframes if not already present
        if (!document.getElementById('firefly-keyframes')) {
            const style = document.createElement('style');
            style.id = 'firefly-keyframes';
            style.textContent = `
                @keyframes fireflyFloat0 {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(15px, -20px); }
                    50% { transform: translate(-10px, -35px); }
                    75% { transform: translate(20px, -15px); }
                }
                @keyframes fireflyFloat1 {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(-20px, -10px); }
                    50% { transform: translate(10px, -25px); }
                    75% { transform: translate(-15px, -30px); }
                }
                @keyframes fireflyFloat2 {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(10px, -30px); }
                    50% { transform: translate(25px, -10px); }
                    75% { transform: translate(-5px, -20px); }
                }
                @keyframes fireflyGlow {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    startFog() {
        if (!this.scene) return;
        // Fog animations are driven by CSS, but ensure the elements are visible
        const fogs = this.scene.querySelectorAll('.forest-fog');
        fogs.forEach(fog => {
            fog.style.opacity = fog.style.opacity || '1';
        });
    }

    destroy() {
        window.removeEventListener('mousemove', this._boundMouseMove);
        window.removeEventListener('deviceorientation', this._boundOrientation);

        // Remove dynamic fireflies
        if (this.scene) {
            const fireflies = this.scene.querySelectorAll('.forest-firefly');
            fireflies.forEach(f => f.remove());
        }

        // Reset transforms
        for (const layer of this.layers) {
            layer.el.style.transform = '';
        }
        this.layers = [];
    }
}
