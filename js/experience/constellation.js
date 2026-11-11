/**
 * ConstellationScene — Interactive star constellation with message cards.
 */
class ConstellationScene {
    constructor(container, messages) {
        this.container = container;
        this.messages = messages || [];
        this.stars = [];         // background star data for canvas
        this.interactiveStars = [];
        this.visitedStars = new Set();
        this.activeCard = null;
        this.canvas = null;
        this.ctx = null;
        this.animFrameId = null;
        this.running = false;
        this._boundResize = () => this.resizeCanvas();
        this._boundClickOutside = (e) => this._handleClickOutside(e);
    }

    init() {
        if (!this.container) return;

        this.canvas = this.container.querySelector('#stars-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', this._boundResize);
        }

        this.createBackgroundStars();
        this.setupInteractiveStars();
        this.running = true;
        this.animateStars();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement || this.container;
        this.canvas.width = parent.clientWidth || window.innerWidth;
        this.canvas.height = parent.clientHeight || window.innerHeight;
    }

    /* Populate ~200 tiny background stars */
    createBackgroundStars() {
        if (!this.canvas) return;
        this.stars = [];
        const count = 200;
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 0.3 + Math.random() * 1.5,
                baseOpacity: 0.2 + Math.random() * 0.6,
                twinkleSpeed: 0.005 + Math.random() * 0.02,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    /* rAF loop: redraw with twinkling */
    animateStars() {
        if (!this.running || !this.ctx) return;
        this.animFrameId = requestAnimationFrame(() => this.animateStars());

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const star of this.stars) {
            star.twinklePhase += star.twinkleSpeed;
            const twinkle = 0.5 + 0.5 * Math.sin(star.twinklePhase);
            const opacity = star.baseOpacity * twinkle;

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = star.size * 2;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    /* Bind click/tap events to .constellation-star elements */
    setupInteractiveStars() {
        if (!this.container) return;

        this.interactiveStars = Array.from(
            this.container.querySelectorAll('.constellation-star')
        );

        this.interactiveStars.forEach((starEl) => {
            const index = parseInt(starEl.dataset.index, 10);

            // Populate data-message from config if empty
            if (!starEl.dataset.message && this.messages[index]) {
                starEl.dataset.message = this.messages[index];
            }

            starEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showMessage(index);
            });

            // Keyboard accessibility
            starEl.setAttribute('tabindex', '0');
            starEl.setAttribute('role', 'button');
            starEl.setAttribute('aria-label', `Estrela ${index + 1}`);
            starEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showMessage(index);
                }
            });
        });

        // Close card on click outside
        document.addEventListener('click', this._boundClickOutside);

        // Close button
        const closeBtn = this.container.querySelector('#constellation-message-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideMessage();
            });
        }
    }

    /* Show the message card for a star */
    showMessage(index) {
        if (index < 0 || index >= this.messages.length) return;

        const card = this.container.querySelector('#constellation-message-card');
        const textEl = this.container.querySelector('#constellation-message-text');
        if (!card || !textEl) return;

        textEl.textContent = this.messages[index];
        card.classList.add('visible');
        this.activeCard = card;

        // Mark star as visited
        this.visitedStars.add(index);
        if (this.interactiveStars[index]) {
            this.interactiveStars[index].classList.add('star-visited');
        }

        // Check if all stars have been visited
        if (this.visitedStars.size >= this.messages.length) {
            const continueBtn = this.container.querySelector('#btn-constellation-continue');
            if (continueBtn) {
                continueBtn.style.display = 'inline-flex';
                continueBtn.classList.add('visible');
            }
        }
    }

    hideMessage() {
        const card = this.container.querySelector('#constellation-message-card');
        if (card) {
            card.classList.remove('visible');
        }
        this.activeCard = null;
    }

    _handleClickOutside(e) {
        if (!this.activeCard) return;
        const inner = this.activeCard.querySelector('.message-card-inner');
        if (inner && !inner.contains(e.target) && !e.target.closest('.constellation-star')) {
            this.hideMessage();
        }
    }

    /* Draw faint lines connecting the interactive stars (handled by SVG in HTML,
       but we ensure the SVG lines are visible when the scene initializes) */
    drawConstellationLines() {
        const svg = this.container.querySelector('#constellation-lines');
        if (svg) {
            svg.style.opacity = '1';
        }
    }

    destroy() {
        this.running = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        window.removeEventListener('resize', this._boundResize);
        document.removeEventListener('click', this._boundClickOutside);
    }
}
