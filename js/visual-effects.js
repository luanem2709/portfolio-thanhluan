// ========================================
// CUSTOM VISUAL EFFECTS - GUNS.LOL STYLE
// Click ripples, parallax, and smooth interactions
// ========================================

class VisualEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addSmoothScroll();
    }

    // Smooth momentum scrolling
    addSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offset = 80;
                    const targetPosition = target.offsetTop - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Add lightweight visual styles
const effectsStyles = document.createElement('style');
effectsStyles.textContent = `
    .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--brand, #086d80), var(--accent, #168da2));
        z-index: 1002;
        pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
        html {
            scroll-behavior: auto;
        }
    }
`;
document.head.appendChild(effectsStyles);

// Add scroll progress indicator
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.appendChild(scrollProgress);

let progressPending = false;
window.addEventListener('scroll', () => {
    if (progressPending) return;
    progressPending = true;
    requestAnimationFrame(() => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = windowHeight > 0 ? (window.pageYOffset / windowHeight) * 100 : 0;
        scrollProgress.style.width = scrolled + '%';
        progressPending = false;
    });
}, { passive: true });

// Lưu ý: reveal khi cuộn do script.js xử lý (nguồn duy nhất) để tránh trùng observer.

// Initialize visual effects
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new VisualEffects();
    });
} else {
    new VisualEffects();
}
