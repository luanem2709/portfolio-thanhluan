// Lightweight smooth scroll and compositor-friendly scroll progress indicator

class VisualEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addSmoothScroll();
    }

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

const effectsStyles = document.createElement('style');
effectsStyles.textContent = `
    .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, var(--brand, #0284c7), var(--accent, #38bdf8));
        transform: scaleX(0);
        transform-origin: left center;
        z-index: 1002;
        pointer-events: none;
        will-change: transform;
    }

    @media (prefers-reduced-motion: reduce) {
        html {
            scroll-behavior: auto;
        }
    }
`;
document.head.appendChild(effectsStyles);

// Add scroll progress indicator (skip on blog posts where blog-reading-progress.js renders it)
if (!document.querySelector('article.blog-post')) {
    const scrollProgress = document.createElement('div');
    scrollProgress.className = 'scroll-progress';
    document.body.appendChild(scrollProgress);

    let progressPending = false;
    // Đọc kích thước trong requestAnimationFrame (layout đã sạch) để tránh forced reflow
    function syncScrollProgress() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
        scrollProgress.style.transform = `scaleX(${ratio})`;
    }
    function queueSync() {
        if (progressPending) return;
        progressPending = true;
        requestAnimationFrame(() => {
            syncScrollProgress();
            progressPending = false;
        });
    }

    window.addEventListener('scroll', queueSync, { passive: true });
    window.addEventListener('resize', queueSync, { passive: true });
    window.addEventListener('load', queueSync);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new VisualEffects();
    });
} else {
    new VisualEffects();
}
