/**
 * MemoriesGallery — Photo gallery with placeholders and lightbox.
 */
class MemoriesGallery {
    constructor(container, memoriesData) {
        this.container = container;
        this.memories = memoriesData || [];
        this.lightboxEl = null;
        this._boundKeydown = (e) => this._handleKeydown(e);
    }

    init() {
        if (!this.container) return;

        if (this.memories.length === 0) {
            this.renderPlaceholders();
        } else {
            this.renderGallery();
        }
    }

    /* Create elegant placeholder cards when no images are loaded yet */
    renderPlaceholders() {
        // The HTML already contains placeholder cards from the foundation,
        // so we enhance them rather than replacing.
        const existing = this.container.querySelectorAll('.memory-card--placeholder');
        if (existing.length > 0) {
            // Placeholders already in HTML — just ensure they have the right label
            existing.forEach((card) => {
                const label = card.querySelector('.memory-card-label');
                if (label && !card.classList.contains('memory-card--add')) {
                    label.textContent = 'Espaço reservado para uma lembrança especial';
                }
            });
            return;
        }

        // Fallback: generate placeholders dynamically
        const placeholderCount = 6;
        const cameraSvg = `<svg class="memory-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
        </svg>`;

        for (let i = 0; i < placeholderCount; i++) {
            const card = document.createElement('div');
            card.className = 'memory-card memory-card--placeholder wolf-fade-in';
            card.style.transitionDelay = `${0.4 + i * 0.1}s`;

            card.innerHTML = `
                <div class="memory-card-inner">
                    ${cameraSvg}
                    <span class="memory-card-label">Espaço reservado para uma lembrança especial</span>
                </div>
            `;
            this.container.appendChild(card);

            // Trigger animation
            requestAnimationFrame(() => card.classList.add('visible'));
        }
    }

    /* Render actual images from the memories data array */
    renderGallery() {
        // Clear existing placeholders
        this.container.innerHTML = '';

        this.memories.forEach((memory, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card wolf-fade-in';
            card.style.transitionDelay = `${0.3 + index * 0.1}s`;

            const img = document.createElement('img');
            img.src = memory.src || memory.url || '';
            img.alt = memory.caption || `Memória ${index + 1}`;
            img.loading = 'lazy';
            img.className = 'memory-card-image';

            const caption = document.createElement('div');
            caption.className = 'memory-card-caption';
            caption.textContent = memory.caption || '';

            card.appendChild(img);
            if (memory.caption) {
                card.appendChild(caption);
            }

            card.addEventListener('click', () => this.openLightbox(index));
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', memory.caption || `Ver memória ${index + 1}`);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openLightbox(index);
                }
            });

            this.container.appendChild(card);
            requestAnimationFrame(() => card.classList.add('visible'));
        });
    }

    /* Full-screen lightbox with backdrop blur */
    openLightbox(index) {
        if (index < 0 || index >= this.memories.length) return;
        const memory = this.memories[index];

        // Create lightbox overlay
        this.lightboxEl = document.createElement('div');
        this.lightboxEl.className = 'memories-lightbox';
        this.lightboxEl.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: var(--z-modal, 60);
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(7, 17, 31, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            opacity: 0;
            transition: opacity 0.4s ease;
            cursor: pointer;
        `;

        const img = document.createElement('img');
        img.src = memory.src || memory.url || '';
        img.alt = memory.caption || '';
        img.style.cssText = `
            max-width: 90vw;
            max-height: 85vh;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            transform: scale(0.9);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            cursor: default;
        `;
        img.addEventListener('click', (e) => e.stopPropagation());

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.setAttribute('aria-label', 'Fechar');
        closeBtn.style.cssText = `
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            background: none;
            border: none;
            color: #fff;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            opacity: 0.7;
            transition: opacity 0.2s;
        `;
        closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
        closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.7');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeLightbox();
        });

        // Caption
        if (memory.caption) {
            const captionEl = document.createElement('p');
            captionEl.textContent = memory.caption;
            captionEl.style.cssText = `
                position: absolute;
                bottom: 2rem;
                left: 50%;
                transform: translateX(-50%);
                color: #C8D4E3;
                font-family: var(--font-body, 'Inter', sans-serif);
                font-size: 0.95rem;
                text-align: center;
                max-width: 80%;
            `;
            this.lightboxEl.appendChild(captionEl);
        }

        this.lightboxEl.appendChild(img);
        this.lightboxEl.appendChild(closeBtn);
        this.lightboxEl.addEventListener('click', () => this.closeLightbox());

        document.body.appendChild(this.lightboxEl);

        // Animate in
        requestAnimationFrame(() => {
            this.lightboxEl.style.opacity = '1';
            img.style.transform = 'scale(1)';
        });

        // Keyboard listener for Escape
        document.addEventListener('keydown', this._boundKeydown);
    }

    closeLightbox() {
        if (!this.lightboxEl) return;
        this.lightboxEl.style.opacity = '0';
        setTimeout(() => {
            if (this.lightboxEl && this.lightboxEl.parentElement) {
                this.lightboxEl.parentElement.removeChild(this.lightboxEl);
            }
            this.lightboxEl = null;
        }, 400);
        document.removeEventListener('keydown', this._boundKeydown);
    }

    _handleKeydown(e) {
        if (e.key === 'Escape') {
            this.closeLightbox();
        }
    }

    destroy() {
        this.closeLightbox();
        document.removeEventListener('keydown', this._boundKeydown);
    }
}
