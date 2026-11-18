// ========================================
// PARTICLE CURSOR EFFECT
// Custom cursor với particle trail effect
// ========================================

class ParticleCursor {
    constructor() {
        this.particles = [];
        this.maxParticles = 30;
        this.canvas = null;
        this.ctx = null;
        this.rafId = null;
        this.mouse = { x: 0, y: 0 };
        this.colors = ['#0066FF', '#00D4FF', '#9333EA', '#EC4899'];
        this.init();
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-cursor';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10098;
        `;
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Event listeners
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    onMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // Create new particle
        this.createParticle(e.clientX, e.clientY);

        if (!this.rafId) {
            this.rafId = requestAnimationFrame(() => this.animate());
        }
    }

    createParticle(x, y) {
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift(); // Remove oldest particle
        }

        const particle = {
            x: x,
            y: y,
            size: Math.random() * 5 + 2,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            alpha: 1,
            decay: Math.random() * 0.02 + 0.025
        };

        this.particles.push(particle);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.speedX;
            p.y += p.speedY;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            this.ctx.save();
            this.ctx.globalAlpha = p.alpha * 0.5;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            this.rafId = requestAnimationFrame(() => this.animate());
        } else {
            this.rafId = null;
        }
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.canvas) {
            this.canvas.remove();
        }
    }
}

// Custom cursor styles
class CustomCursor {
    constructor() {
        this.cursor = null;
        this.cursorDot = null;
        this.init();
    }

    init() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';

        this.cursorDot = document.createElement('div');
        this.cursorDot.className = 'custom-cursor-dot';

        document.body.appendChild(this.cursor);
        document.body.appendChild(this.cursorDot);

        document.addEventListener('mousemove', (e) => {
            this.cursor.style.opacity = '1';
            this.cursorDot.style.opacity = '1';
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
            this.cursorDot.style.left = e.clientX + 'px';
            this.cursorDot.style.top = e.clientY + 'px';
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
            this.cursorDot.style.opacity = '0';
        });

        // Delegate hover so async-loaded navbar/footer links also respond
        document.addEventListener('mouseover', (e) => {
            const interactive = e.target.closest('a, button, .btn, .project-card, .achievement-card, .filter-btn');
            this.cursor.classList.toggle('hover', Boolean(interactive));
            this.cursorDot.classList.toggle('hover', Boolean(interactive));
        });

        // Keep native text cursor on form controls
        document.body.classList.add('has-custom-cursor');
    }
}

// Add cursor styles
const cursorStyles = document.createElement('style');
cursorStyles.textContent = `
    body.has-custom-cursor,
    body.has-custom-cursor a,
    body.has-custom-cursor button {
        cursor: none;
    }

    body.has-custom-cursor input,
    body.has-custom-cursor textarea,
    body.has-custom-cursor select {
        cursor: text !important;
    }

    .custom-cursor {
        position: fixed;
        width: 40px;
        height: 40px;
        border: 2px solid rgba(0, 102, 255, 0.5);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10099;
        opacity: 0;
        transform: translate(-50%, -50%);
        transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease, opacity 0.2s ease;
        mix-blend-mode: difference;
    }

    .custom-cursor.hover {
        width: 60px;
        height: 60px;
        border-color: rgba(0, 212, 255, 0.8);
    }

    .custom-cursor-dot {
        position: fixed;
        width: 8px;
        height: 8px;
        background: linear-gradient(135deg, #0066FF, #00D4FF);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10100;
        opacity: 0;
        transform: translate(-50%, -50%);
        transition: transform 0.2s ease, opacity 0.2s ease;
        box-shadow: 0 0 10px rgba(0, 102, 255, 0.5);
    }

    .custom-cursor-dot.hover {
        transform: translate(-50%, -50%) scale(1.5);
    }

    /* Hide custom cursor on mobile / touch / reduced motion */
    @media (max-width: 768px), (hover: none), (prefers-reduced-motion: reduce) {
        .custom-cursor,
        .custom-cursor-dot,
        #particle-cursor {
            display: none !important;
        }
        
        body.has-custom-cursor,
        body.has-custom-cursor a,
        body.has-custom-cursor button {
            cursor: auto !important;
        }
    }
`;
document.head.appendChild(cursorStyles);

// Initialize cursor effects
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!prefersReducedMotion && hasFinePointer && window.innerWidth > 768 && CONFIG.features.particleCursor) {
    window.addEventListener('load', () => {
        new ParticleCursor();
        new CustomCursor();
    });
}
