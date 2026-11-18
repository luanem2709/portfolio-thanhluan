// Lightweight background cleanup helper

class BackgroundEffects {
    constructor() {
        this.cleanupOldLayers();
    }

    cleanupOldLayers() {
        document.querySelectorAll(
            '.stars-background, .gradient-orb, .nebula-cloud, .aurora-wave, .light-beam, .cosmic-dust, .grid-lines, .vignette, .noise-overlay, .floating-particles, .spotlight'
        ).forEach(el => el.remove());
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BackgroundEffects();
    });
} else {
    new BackgroundEffects();
}
