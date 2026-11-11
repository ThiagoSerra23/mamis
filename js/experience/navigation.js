/**
 * ExperienceNavigation — Scene navigation with cross-fade transitions.
 */
class ExperienceNavigation {
    constructor() {
        this.scenes = [];
        this.currentScene = 0;
        this.transitioning = false;
        this._boundKeydown = (e) => this._handleKeydown(e);
    }

    init() {
        this.scenes = Array.from(document.querySelectorAll('.wolf-section'));
        if (this.scenes.length === 0) return;

        // Ensure the first scene is visible and marked active
        this.scenes[0].classList.add('scene-active');
        this.scenes[0].style.display = 'flex';

        // Populate text content from giftConfig
        this._populateContent();

        // Trigger initial text reveal for scene 0
        requestAnimationFrame(() => {
            setTimeout(() => this._revealScene(this.scenes[0]), 300);
        });

        this.setupKeyboardNav();
    }

    /* Fill in text from giftConfig so HTML stays data-driven */
    _populateContent() {
        if (typeof giftConfig === 'undefined') return;

        const setTextById = (id, text) => {
            const el = document.getElementById(id);
            if (el && text) el.textContent = text;
        };

        // Scene 1 — Entrance
        setTextById('entrance-title', giftConfig.openingMessage);
        setTextById('entrance-subtitle', giftConfig.openingSubtext);
        setTextById('btn-enter', giftConfig.enterButton);

        // Scene 2 — Story
        setTextById('story-part1', giftConfig.story?.part1);
        setTextById('story-part2', giftConfig.story?.part2);
        setTextById('btn-story-continue', giftConfig.story?.continueButton);

        // Scene 5 — Hug
        setTextById('hug-message', giftConfig.hug?.message);
        const hugBtn = document.getElementById('btn-hug');
        if (hugBtn) hugBtn.textContent = giftConfig.hug?.button || '';
        setTextById('hug-after-message', giftConfig.hug?.afterMessage);

        // Scene 6 — Finale
        setTextById('finale-message1', giftConfig.finale?.message1);
        setTextById('finale-message2', giftConfig.finale?.message2);
        const finaleBtn = document.getElementById('btn-finale');
        if (finaleBtn) finaleBtn.textContent = giftConfig.finale?.button || '';
    }

    /**
     * Navigate to a specific scene by index.
     * Returns a Promise that resolves when the transition completes.
     */
    goToScene(index) {
        return new Promise((resolve) => {
            if (this.transitioning) { resolve(); return; }
            if (index < 0 || index >= this.scenes.length) { resolve(); return; }
            if (index === this.currentScene) { resolve(); return; }

            this.transitioning = true;

            const currentEl = this.scenes[this.currentScene];
            const nextEl = this.scenes[index];

            // Exit current scene
            currentEl.classList.add('scene-exit');
            currentEl.classList.remove('scene-active');

            setTimeout(() => {
                // Hide current
                currentEl.style.display = 'none';
                currentEl.classList.remove('scene-exit');

                // Reset text-reveal elements in the exiting scene
                const reveals = currentEl.querySelectorAll('.wolf-text-reveal, .wolf-fade-in');
                reveals.forEach(el => el.classList.remove('visible'));

                // Show next
                nextEl.style.display = 'flex';
                nextEl.classList.add('scene-enter', 'scene-active');

                // Trigger text reveals in the new scene
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this._revealScene(nextEl);
                        nextEl.classList.remove('scene-enter');
                        this.currentScene = index;
                        this.transitioning = false;
                        resolve();
                    }, 50);
                });
            }, 600); // Match CSS transition duration
        });
    }

    /* Make wolf-text-reveal and wolf-fade-in elements visible in a scene */
    _revealScene(sceneEl) {
        const reveals = sceneEl.querySelectorAll('.wolf-text-reveal, .wolf-fade-in');
        reveals.forEach(el => el.classList.add('visible'));
    }

    nextScene() {
        return this.goToScene(this.currentScene + 1);
    }

    previousScene() {
        return this.goToScene(this.currentScene - 1);
    }

    /**
     * Special transition to flower.html:
     * Darken screen → fade to black → navigate.
     */
    goToFlowers() {
        if (this.transitioning) return;
        this.transitioning = true;

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: #000;
            opacity: 0;
            z-index: 9999;
            transition: opacity 1.2s ease;
            pointer-events: none;
        `;
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        const dest = (typeof giftConfig !== 'undefined' && giftConfig.finale?.destination)
            ? giftConfig.finale.destination
            : 'flower.html';

        setTimeout(() => {
            window.location.href = dest;
        }, 1400);
    }

    /* Keyboard accessibility */
    setupKeyboardNav() {
        document.addEventListener('keydown', this._boundKeydown);
    }

    _handleKeydown(e) {
        // Only respond if no modal/lightbox is open and focus isn't in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                this.nextScene();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                this.previousScene();
                break;
            case 'Escape':
                e.preventDefault();
                this.previousScene();
                break;
            case 'Enter':
            case ' ':
                // Let buttons handle their own Enter/Space
                break;
        }
    }

    destroy() {
        document.removeEventListener('keydown', this._boundKeydown);
    }
}
