/**
 * ParticleSystem — Canvas-based particle engine for The Wolf Experience.
 * Respects prefers-reduced-motion.
 */
class ParticleSystem {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.running = false;
        this.animFrameId = null;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.options = {
            count: options.count || (this.reducedMotion ? 15 : 50),
            color: options.color || '#4C8DFF',
            minSize: options.minSize || 1,
            maxSize: options.maxSize || 3,
            speed: options.speed || (this.reducedMotion ? 0.15 : 0.5),
            opacity: options.opacity || 0.6,
            drift: options.drift !== undefined ? options.drift : true,
            glow: options.glow !== undefined ? options.glow : true,
            ...options
        };

        this._boundResize = () => this.resize();
        this.resize();
        window.addEventListener('resize', this._boundResize);
    }

    /* Set canvas dimensions to its parent's size */
    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement || document.body;
        this.canvas.width = parent.clientWidth || window.innerWidth;
        this.canvas.height = parent.clientHeight || window.innerHeight;
    }

    /* Create a single particle object */
    createParticle(x, y, burst = false) {
        const opts = this.options;
        const size = opts.minSize + Math.random() * (opts.maxSize - opts.minSize);
        const angle = Math.random() * Math.PI * 2;
        const speed = burst
            ? opts.speed * (2 + Math.random() * 4)
            : opts.speed * (0.2 + Math.random() * 0.8);

        return {
            x: x !== undefined ? x : Math.random() * this.canvas.width,
            y: y !== undefined ? y : Math.random() * this.canvas.height,
            size,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            opacity: 0.1 + Math.random() * opts.opacity,
            life: 1,
            decay: burst ? 0.008 + Math.random() * 0.012 : 0,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.01 + Math.random() * 0.02
        };
    }

    /* Fill particle pool and start the loop */
    init() {
        if (!this.canvas) return;
        this.particles = [];
        for (let i = 0; i < this.options.count; i++) {
            this.particles.push(this.createParticle());
        }
        this.running = true;
        this.animate();
    }

    /* Main animation loop */
    animate() {
        if (!this.running) return;
        this.animFrameId = requestAnimationFrame(() => this.animate());

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            this.update(p);

            // Remove dead burst particles
            if (p.decay > 0 && p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            this.draw(p);
        }
    }

    /* Move a particle, apply drift, wrap edges, pulse opacity */
    update(p) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Drift — gentle sine-wave side motion
        if (this.options.drift && !this.reducedMotion) {
            p.x += Math.sin(p.pulse) * 0.2;
        }

        // Opacity pulsing
        p.pulse += p.pulseSpeed;
        const pulseFactor = 0.7 + 0.3 * Math.sin(p.pulse);
        p.currentOpacity = p.opacity * pulseFactor;

        // Burst decay
        if (p.decay > 0) {
            p.life -= p.decay;
            p.currentOpacity *= Math.max(p.life, 0);
            p.speedX *= 0.98;
            p.speedY *= 0.98;
        }

        // Wrap around edges (non-burst only)
        if (p.decay === 0) {
            if (p.x < -p.size) p.x = this.canvas.width + p.size;
            if (p.x > this.canvas.width + p.size) p.x = -p.size;
            if (p.y < -p.size) p.y = this.canvas.height + p.size;
            if (p.y > this.canvas.height + p.size) p.y = -p.size;
        }
    }

    /* Draw a single particle (glowing circle) */
    draw(p) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = p.currentOpacity || p.opacity;

        if (this.options.glow && !this.reducedMotion) {
            ctx.shadowBlur = p.size * 4;
            ctx.shadowColor = this.options.color;
        }

        ctx.fillStyle = this.options.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /* Create a burst of particles at a specific position */
    burst(x, y, count = 20) {
        if (!this.canvas) return;
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(x, y, true));
        }
    }

    /* Stop the animation loop and clear canvas */
    stop() {
        this.running = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /* Full cleanup */
    destroy() {
        this.stop();
        window.removeEventListener('resize', this._boundResize);
    }
}
