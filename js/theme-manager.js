// ========================================
// DARK MODE & THEME SYSTEM
// Hệ thống theme với nhiều màu sắc
// ========================================

class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.isDark = false;
        this.isImmersive = false;  // NEW: Track immersive state
        this.themes = CONFIG.themes;
        this.init();
    }

    init() {
        // Load saved theme
        const savedTheme = localStorage.getItem('portfolio-theme');
        const savedMode = localStorage.getItem('portfolio-dark-mode');

        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }

        if (savedMode === 'true') {
            this.isDark = true;
        }

        // Load saved immersive state
        const savedImmersive = localStorage.getItem('portfolio-immersive');
        if (savedImmersive === 'true') {
            this.isImmersive = true;
        }

        // Create theme controls
        this.createControls();

        // Apply theme
        this.applyTheme();
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'theme-controls';
        controls.innerHTML = `
            <button type="button" class="theme-toggle" id="dark-mode-toggle" title="Chuyển chế độ Tối / Sáng" aria-label="Chuyển chế độ Tối / Sáng">
                <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            </button>
            
            <div class="theme-selector">
                <button type="button" class="theme-selector-btn" title="Đổi bảng màu" aria-label="Đổi bảng màu" aria-expanded="false">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
                        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
                        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
                        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
                    </svg>
                </button>
                <div class="theme-dropdown">
                    ${Object.keys(this.themes).map(key => `
                        <button type="button" class="theme-option ${key === this.currentTheme ? 'active' : ''}" data-theme="${key}">
                            <span class="theme-preview" style="background: linear-gradient(135deg, ${this.themes[key].primary}, ${this.themes[key].secondary})"></span>
                            <span class="theme-name">${this.themes[key].name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(controls);

        // Event listeners
        document.getElementById('dark-mode-toggle').addEventListener('click', () => this.toggleDarkMode());

        const selectorBtn = controls.querySelector('.theme-selector-btn');
        const dropdown = controls.querySelector('.theme-dropdown');

        controls.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setTheme(btn.dataset.theme);
                dropdown.classList.remove('show');
                selectorBtn.setAttribute('aria-expanded', 'false');
            });
        });

        selectorBtn.addEventListener('click', () => {
            const isOpen = dropdown.classList.toggle('show');
            selectorBtn.setAttribute('aria-expanded', String(isOpen));
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-selector')) {
                dropdown.classList.remove('show');
                selectorBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    toggleDarkMode() {
        // Enhanced: Toggle both dark mode and immersive mode together
        this.isDark = !this.isDark;
        this.isImmersive = this.isDark;  // Immersive follows dark mode

        localStorage.setItem('portfolio-dark-mode', this.isDark);
        localStorage.setItem('portfolio-immersive', this.isImmersive);

        this.applyTheme();
        this.applyImmersiveEffects();
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) return;

        this.currentTheme = themeName;
        localStorage.setItem('portfolio-theme', themeName);

        // Update active state
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });

        this.applyTheme();
    }

    applyTheme() {
        const theme = this.themes[this.currentTheme];
        const root = document.documentElement;

        // Apply CSS variables
        if (this.isDark) {
            root.style.setProperty('--p', theme.primary);
            root.style.setProperty('--s', theme.secondary);
            root.style.setProperty('--d', theme.dark);
            root.style.setProperty('--l', theme.light);
            root.style.setProperty('--bg', theme.dark);
            root.style.setProperty('--text', theme.light);
            document.body.classList.add('dark-mode');
        } else {
            root.style.setProperty('--p', theme.primary);
            root.style.setProperty('--s', theme.secondary);
            root.style.setProperty('--d', theme.dark);
            root.style.setProperty('--l', '#8892B0');
            root.style.setProperty('--bg', theme.dark);
            root.style.setProperty('--text', '#E6F1FF');
            document.body.classList.remove('dark-mode');
        }

        // Add transition class
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 500);

        // Apply immersive effects after theme
        this.applyImmersiveEffects();
    }

    // NEW: Immersive mode effects
    applyImmersiveEffects() {
        if (this.isImmersive) {
            document.body.classList.add('immersive-mode');
            this.addImmersiveOverlay();
        } else {
            document.body.classList.remove('immersive-mode');
            this.removeImmersiveOverlay();
        }
    }

    addImmersiveOverlay() {
        if (document.querySelector('.immersive-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'immersive-overlay';
        overlay.innerHTML = `
            <div class="immersive-particles">
                ${this.generateParticles(15)}
            </div>
        `;

        document.body.prepend(overlay);
        setTimeout(() => overlay.classList.add('active'), 100);
    }

    removeImmersiveOverlay() {
        const overlay = document.querySelector('.immersive-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 600);
        }
    }

    generateParticles(count) {
        let html = '';
        for (let i = 0; i < count; i++) {
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 10;

            html += `<div class="particle" style="
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
            "></div>`;
        }
        return html;
    }
}

// Add theme styles
const themeStyles = document.createElement('style');
themeStyles.textContent = `
    .theme-controls {
        position: fixed;
        top: 100px;
        right: 30px;
        z-index: 950;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .theme-toggle,
    .theme-selector-btn {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(17, 34, 64, 0.9), rgba(26, 47, 82, 0.9));
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 212, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .theme-toggle:hover,
    .theme-selector-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 30px rgba(0, 102, 255, 0.4);
        border-color: rgba(0, 212, 255, 0.5);
    }

    .theme-toggle svg {
        width: 24px;
        height: 24px;
        color: #E6F1FF;
        transition: all 0.3s ease;
    }

    .theme-toggle .sun-icon {
        display: block;
    }

    .theme-toggle .moon-icon {
        display: none;
    }

    body.dark-mode .theme-toggle .sun-icon {
        display: none;
    }

    body.dark-mode .theme-toggle .moon-icon {
        display: block;
    }

    .theme-selector {
        position: relative;
    }

    .theme-selector-btn svg {
        width: 24px;
        height: 24px;
        color: #E6F1FF;
    }

    .theme-dropdown {
        position: absolute;
        right: 60px;
        top: 0;
        background: rgba(13, 27, 52, 0.97);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        padding: 10px;
        min-width: 200px;
        border: 1px solid rgba(0, 212, 255, 0.25);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
        opacity: 0;
        visibility: hidden;
        transform: translateX(10px);
        transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
    }

    .theme-dropdown.show {
        opacity: 1;
        visibility: visible;
        transform: translateX(0);
    }

    .theme-option {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #E6F1FF;
    }

    .theme-option:hover {
        background: rgba(0, 102, 255, 0.1);
        border-color: rgba(0, 212, 255, 0.3);
    }

    .theme-option.active {
        background: rgba(0, 102, 255, 0.2);
        border-color: rgba(0, 212, 255, 0.5);
    }

    .theme-preview {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .theme-name {
        font-size: 14px;
        font-weight: 500;
    }

    /* Smooth theme transition */
    body.theme-transitioning {
        transition: background-color 0.4s ease, color 0.4s ease;
    }

    /* Dark mode adjustments */
    body.dark-mode {
        background: linear-gradient(-45deg, #000000, #0A0A0A, #0D0D0D, #050505);
    }

    body.dark-mode .navbar {
        background: rgba(0, 0, 0, 0.9);
    }

    body.dark-mode .project-card,
    body.dark-mode .achievement-card,
    body.dark-mode .stat-item,
    body.dark-mode .skills-category {
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(10, 10, 10, 0.8));
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .theme-controls {
            top: auto;
            bottom: 20px;
            right: 68px;
            flex-direction: row;
            gap: 8px;
        }

        .theme-toggle,
        .theme-selector-btn {
            width: 42px;
            height: 42px;
        }

        .theme-toggle svg,
        .theme-selector-btn svg {
            width: 20px;
            height: 20px;
        }

        .theme-dropdown {
            right: 0;
            top: auto;
            bottom: 52px;
        }
    }

    /* Immersive Mode Styles */
    .immersive-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(ellipse at center, 
            rgba(10, 25, 47, 0.3) 0%, 
            rgba(0, 0, 0, 0.6) 100%);
        pointer-events: none;
        z-index: 1;
        opacity: 0;
        transition: opacity 0.6s ease;
    }

    .immersive-overlay.active {
        opacity: 1;
    }

    .immersive-particles {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .particle {
        position: absolute;
        background: radial-gradient(circle, 
            rgba(0, 212, 255, 0.6) 0%, 
            rgba(0, 102, 255, 0.2) 50%, 
            transparent 100%);
        border-radius: 50%;
        filter: blur(2px);
        animation: particleFloat linear infinite;
    }

    @keyframes particleFloat {
        0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) translateX(100px);
            opacity: 0;
        }
    }

    body.immersive-mode {
        background: #000000;
    }

    body.immersive-mode .project-card,
    body.immersive-mode .blog-card,
    body.immersive-mode .achievement-card {
        box-shadow: 
            0 12px 48px rgba(0, 102, 255, 0.3),
            0 0 40px rgba(0, 212, 255, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    /* Ensure content is above overlay without overriding fixed navbar */
    .hero,
    section,
    footer {
        position: relative;
        z-index: 2;
    }

    /* Footer Dark Mode Styles */
    body.dark-mode .footer {
        background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.95), 
            rgba(10, 10, 10, 0.95));
        border-top: 1px solid rgba(0, 212, 255, 0.15);
    }

    body.dark-mode .footer h3,
    body.dark-mode .footer h4 {
        color: #E6F1FF;
    }

    body.dark-mode .footer p {
        color: #8892B0;
    }

    body.dark-mode .footer-links a {
        color: #CCD6F6;
    }

    body.dark-mode .footer-links a:hover {
        color: #00D4FF;
    }

    body.dark-mode .footer-contact li {
        color: #8892B0;
    }

    body.dark-mode .footer-contact i {
        color: #0066FF;
    }

    body.dark-mode .footer-social a {
        background: rgba(0, 102, 255, 0.1);
        border-color: rgba(0, 212, 255, 0.2);
        color: #8892B0;
    }

    body.dark-mode .footer-social a:hover {
        background: linear-gradient(135deg, #0066FF, #00D4FF);
        color: white;
        border-color: rgba(0, 212, 255, 0.5);
    }

    body.dark-mode .footer-bottom {
        border-top: 1px solid rgba(0, 212, 255, 0.1);
    }

    body.dark-mode .footer-bottom p {
        color: #8892B0;
    }

    /* Scroll Top Button Dark Mode */
    body.dark-mode .scroll-top {
        background: linear-gradient(135deg, 
            rgba(0, 102, 255, 0.15),
            rgba(0, 212, 255, 0.15));
        border: 1px solid rgba(0, 212, 255, 0.3);
    }

    body.dark-mode .scroll-top:hover {
        background: linear-gradient(135deg, #0066FF, #00D4FF);
        box-shadow: 0 6px 24px rgba(0, 212, 255, 0.4);
    }
`;
document.head.appendChild(themeStyles);

// Initialize theme manager
window.addEventListener('load', () => {
    new ThemeManager();
});
