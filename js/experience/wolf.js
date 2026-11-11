/**
 * WolfAnimation — Wolf silhouette entrance, breathing, and eye-tracking.
 */
class WolfAnimation {
    constructor(wolfElement) {
        this.wolf = wolfElement;
        this.eyes = wolfElement ? wolfElement.querySelectorAll('.wolf-eye') : [];
        this.silhouette = wolfElement ? wolfElement.querySelector('.wolf-silhouette') : null;
        this.glowAura = wolfElement ? wolfElement.querySelector('.wolf-glow-aura') : null;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this._boundFollowCursor = (e) => this.followCursor(e);
    }

    /* Prepare initial hidden state */
    init() {
        if (!this.wolf) return;
        this.wolf.style.opacity = '0';
        this.wolf.style.transition = 'none';
        if (this.silhouette) {
            this.silhouette.style.filter = 'brightness(0)';
        }
        this.eyes.forEach(eye => {
            eye.style.opacity = '0';
        });
    }

    /**
     * Animate wolf appearing: silhouette → illuminated over 3s.
     * Returns a Promise that resolves when the full entrance is done.
     */
    entrance() {
        return new Promise((resolve) => {
            if (!this.wolf) { resolve(); return; }

            const duration = this.reducedMotion ? 1000 : 3000;

            // Phase 1: fade the container in (silhouette appears dark)
            this.wolf.style.transition = `opacity ${duration * 0.4}ms var(--ease-smooth, cubic-bezier(0.4,0,0.2,1))`;
            this.wolf.style.opacity = '1';

            // Phase 2: illuminate the silhouette
            setTimeout(() => {
                if (this.silhouette) {
                    this.silhouette.style.transition = `filter ${duration * 0.5}ms var(--ease-smooth, cubic-bezier(0.4,0,0.2,1))`;
                    this.silhouette.style.filter = 'brightness(1)';
                }

                // Phase 3: glow aura
                if (this.glowAura) {
                    this.glowAura.style.transition = `opacity ${duration * 0.3}ms ease-in`;
                    this.glowAura.style.opacity = '1';
                }
            }, duration * 0.35);

            // Phase 4: eyes glow
            setTimeout(() => {
                this.eyeGlow();
            }, duration * 0.7);

            // Resolve after full sequence
            setTimeout(() => {
                // Start cursor tracking
                if (!this.reducedMotion) {
                    document.addEventListener('mousemove', this._boundFollowCursor);
                }
                resolve();
            }, duration);
        });
    }

    /* Add breathing animation class */
    startBreathing() {
        if (!this.wolf) return;

        // Inject breathing keyframes if missing
        if (!document.getElementById('wolf-breathing-keyframes')) {
            const style = document.createElement('style');
            style.id = 'wolf-breathing-keyframes';
            style.textContent = `
                @keyframes wolfBreathe {
                    0%, 100% { transform: scale(1) translateY(0); }
                    50% { transform: scale(1.015) translateY(-2px); }
                }
            `;
            document.head.appendChild(style);
        }

        if (this.silhouette) {
            this.silhouette.style.animation = this.reducedMotion
                ? 'none'
                : 'wolfBreathe 4s ease-in-out infinite';
        }
    }

    /* Animate eyes glowing */
    eyeGlow() {
        this.eyes.forEach((eye, i) => {
            setTimeout(() => {
                eye.style.transition = 'opacity 0.8s ease-in';
                eye.style.opacity = '1';
            }, i * 200);
        });
    }

    /* Very subtle: wolf eyes track cursor direction */
    followCursor(e) {
        if (!this.wolf || this.eyes.length === 0) return;

        const rect = this.wolf.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Normalized offset from wolf center, clamped to subtle range
        const dx = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth / 2)));
        const dy = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight / 2)));

        const maxShift = 2; // pixels — keep it very subtle
        this.eyes.forEach(eye => {
            eye.style.transform = `translate(${dx * maxShift}px, ${dy * maxShift}px)`;
        });
    }

    destroy() {
        document.removeEventListener('mousemove', this._boundFollowCursor);
        if (this.silhouette) {
            this.silhouette.style.animation = '';
        }
    }
}
