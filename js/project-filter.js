// Project Filter Functionality
// Filter projects by category when clicking filter buttons

class ProjectFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-card');
        this.timers = new WeakMap();
        this.init();
    }

    init() {
        if (this.filterBtns.length === 0 || this.projectCards.length === 0) return;

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filterProjects(btn));
        });
    }

    clearCardTimer(card) {
        const prev = this.timers.get(card);
        if (prev) {
            clearTimeout(prev);
            this.timers.delete(card);
        }
    }

    filterProjects(btn) {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        this.projectCards.forEach(card => {
            this.clearCardTimer(card);
            const category = card.getAttribute('data-category');
            const matches = filter === 'all' || category === filter;

            if (matches) {
                card.classList.add('fade-in-visible', 'reveal-active');
                card.style.display = '';
                card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.97)';

                const timer = setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                    this.timers.delete(card);
                }, 16);
                this.timers.set(card, timer);
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.97)';
            }
        });
    }
}

// Initialize project filter
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ProjectFilter();
    });
} else {
    new ProjectFilter();
}
