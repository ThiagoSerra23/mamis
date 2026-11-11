/**
 * app.js — Main Application Orchestrator for The Wolf Experience
 * Initializes and coordinates all scenes, animations, particles, and navigation.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Initialize Navigation
    const nav = new ExperienceNavigation();
    nav.init();

    // 3. Scene 1: Forest Entrance Setup
    const entranceSceneEl = document.getElementById('scene-entrance');
    const forest = new ForestScene(entranceSceneEl);
    forest.init();

    // Entrance particles
    const entranceParticles = new ParticleSystem('particles-canvas', {
        count: prefersReducedMotion ? 15 : 45,
        color: '#4C8DFF',
        minSize: 1,
        maxSize: 2.5,
        speed: prefersReducedMotion ? 0.15 : 0.4,
        glow: true
    });
    entranceParticles.init();

    // Wolf animation controller
    const wolfContainer = document.getElementById('entrance-wolf');
    const wolf = new WolfAnimation(wolfContainer);
    wolf.init();

    // Load Wolf SVG dynamically into .wolf-silhouette if empty
    const wolfSilhouette = wolfContainer ? wolfContainer.querySelector('.wolf-silhouette') : null;
    if (wolfSilhouette && !wolfSilhouette.querySelector('svg') && !wolfSilhouette.querySelector('img')) {
        const wolfImg = document.createElement('img');
        wolfImg.src = 'assets/images/wolf/wolf-silhouette.svg';
        wolfImg.alt = 'Lobo Mágico';
        wolfImg.draggable = false;
        wolfSilhouette.insertBefore(wolfImg, wolfSilhouette.firstChild);
    }

    // Enter Button click handler
    const btnEnter = document.getElementById('btn-enter');
    if (btnEnter) {
        let entered = false;
        btnEnter.addEventListener('click', async () => {
            if (entered) return;
            entered = true;

            // Animate wolf entrance: silhouette appears and illuminates
            await wolf.entrance();
            wolf.startBreathing();

            // Short emotional pause to appreciate the wolf, then transition to story
            setTimeout(() => {
                nav.nextScene();
            }, 1200);
        });
    }

    // 4. Scene 2: Story Continue Button
    const btnStoryContinue = document.getElementById('btn-story-continue');
    if (btnStoryContinue) {
        btnStoryContinue.addEventListener('click', () => {
            nav.nextScene();
        });
    }

    // 5. Scene 3: Constellation Scene
    const constellationEl = document.getElementById('scene-constellation');
    const constellation = new ConstellationScene(
        constellationEl,
        giftConfig.constellationMessages
    );

    const btnConstellationContinue = document.getElementById('btn-constellation-continue');
    if (btnConstellationContinue) {
        btnConstellationContinue.addEventListener('click', () => {
            nav.nextScene();
        });
    }

    // 6. Scene 4: Memories Gallery
    const memoriesGrid = document.getElementById('memories-gallery');
    const memories = new MemoriesGallery(
        memoriesGrid,
        giftConfig.memories || []
    );

    const btnMemoriesContinue = document.getElementById('btn-memories-continue');
    if (btnMemoriesContinue) {
        btnMemoriesContinue.addEventListener('click', () => {
            nav.nextScene();
        });
    }

    // 7. Scene 5: Hug Moment
    const btnHug = document.getElementById('btn-hug');
    const hugAnimation = document.getElementById('hug-animation');
    const hugAfter = document.getElementById('hug-after');
    const hugContent = document.getElementById('hug-content');
    const btnHugContinue = document.getElementById('btn-hug-continue');

    if (btnHug) {
        let hugTriggered = false;
        btnHug.addEventListener('click', () => {
            if (hugTriggered) return;
            hugTriggered = true;

            // Hide the hug button with fade
            btnHug.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            btnHug.style.opacity = '0';
            btnHug.style.transform = 'scale(0.8)';
            setTimeout(() => { btnHug.style.display = 'none'; }, 500);

            // Trigger the luminous expansion animation
            if (hugAnimation) {
                hugAnimation.classList.add('hug-active');

                // Particle burst from center
                const rect = btnHug.getBoundingClientRect();
                entranceParticles.burst(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    prefersReducedMotion ? 15 : 40
                );
            }

            // Reveal after-hug message and continue button
            setTimeout(() => {
                if (hugContent) hugContent.style.display = 'none';
                if (hugAfter) {
                    hugAfter.style.display = 'flex';
                    requestAnimationFrame(() => {
                        const afterMsg = document.getElementById('hug-after-message');
                        if (afterMsg) afterMsg.classList.add('visible');
                        if (btnHugContinue) btnHugContinue.classList.add('visible');
                    });
                }
            }, 1800);
        });
    }

    if (btnHugContinue) {
        btnHugContinue.addEventListener('click', () => {
            nav.nextScene();
        });
    }

    // 8. Scene 6: Finale / Flower Reveal
    const btnFinale = document.getElementById('btn-finale');
    if (btnFinale) {
        btnFinale.addEventListener('click', (e) => {
            e.preventDefault();
            nav.goToFlowers();
        });
    }

    // 9. Lazy Initialization of scenes when they become active
    let constellationInit = false;
    let memoriesInit = false;

    const sceneObserver = new MutationObserver(() => {
        // When constellation scene is active
        if (constellationEl && constellationEl.classList.contains('scene-active') && !constellationInit) {
            constellation.init();
            constellationInit = true;
        }

        // When memories scene is active
        const memoriesSceneEl = document.getElementById('scene-memories');
        if (memoriesSceneEl && memoriesSceneEl.classList.contains('scene-active') && !memoriesInit) {
            memories.init();
            memoriesInit = true;
        }
    });

    const appRoot = document.getElementById('wolf-app');
    if (appRoot) {
        sceneObserver.observe(appRoot, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
    }

    // Trigger initial check in case first scene triggers immediately
    if (entranceSceneEl && entranceSceneEl.classList.contains('scene-active')) {
        setTimeout(() => {
            const reveals = entranceSceneEl.querySelectorAll('.wolf-text-reveal, .wolf-fade-in');
            reveals.forEach(el => el.classList.add('revealed', 'visible'));
        }, 300);
    }
});

