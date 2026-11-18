// ========================================
// LIGHT / DARK THEME & PALETTE MANAGER
// Giao diện nhẹ, chuyển đổi mượt bằng CSS tokens
// ========================================

class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.isDark = false;
        this.themes = CONFIG.themes;
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('portfolio-theme');
        const savedMode = localStorage.getItem('portfolio-dark-mode');

        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }

        // Mặc định dùng nền sáng; chỉ bật dark khi người dùng chọn
        if (savedMode === 'true') {
            this.isDark = true;
        }

        this.createControls();
        this.applyTheme();
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'theme-controls';
        controls.innerHTML = `
            <button type="button" class="theme-toggle" id="dark-mode-toggle" title="Chuyển chế độ Sáng / Tối" aria-label="Chuyển chế độ Sáng / Tối">
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

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-selector')) {
                dropdown.classList.remove('show');
                selectorBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    toggleDarkMode() {
        this.isDark = !this.isDark;
        localStorage.setItem('portfolio-dark-mode', String(this.isDark));
        this.applyTheme();
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) return;

        this.currentTheme = themeName;
        localStorage.setItem('portfolio-theme', themeName);

        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });

        this.applyTheme();
    }

    applyTheme() {
        const theme = this.themes[this.currentTheme] || this.themes.default;
        const root = document.documentElement;

        // Xoá lớp overlay cũ nếu tồn tại
        const oldOverlay = document.querySelector('.immersive-overlay');
        if (oldOverlay) oldOverlay.remove();

        root.dataset.theme = this.isDark ? 'dark' : 'light';
        root.style.colorScheme = this.isDark ? 'dark' : 'light';
        document.body.classList.toggle('dark-mode', this.isDark);
        document.body.classList.remove('immersive-mode');

        if (this.currentTheme === 'default' && !this.isDark) {
            root.style.removeProperty('--brand');
            root.style.removeProperty('--brand-hover');
            root.style.removeProperty('--brand-soft');
            root.style.removeProperty('--accent');
        } else if (this.isDark && this.currentTheme === 'default') {
            root.style.removeProperty('--brand');
            root.style.removeProperty('--brand-hover');
            root.style.removeProperty('--brand-soft');
            root.style.removeProperty('--accent');
        } else {
            const accentBrand = this.isDark ? theme.secondary : theme.primary;
            root.style.setProperty('--brand', accentBrand);
            root.style.setProperty('--brand-hover', theme.hover || theme.primary);
            root.style.setProperty('--accent', theme.secondary);
            if (!this.isDark && theme.soft) {
                root.style.setProperty('--brand-soft', theme.soft);
            } else {
                root.style.removeProperty('--brand-soft');
            }
        }
    }
}

const themeStyles = document.createElement('style');
themeStyles.textContent = `
    .theme-controls {
        position: fixed;
        top: 96px;
        right: 28px;
        z-index: 950;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .theme-toggle,
    .theme-selector-btn {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: var(--surface, #ffffff);
        border: 1px solid var(--line, #dce4e9);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: var(--shadow-sm, 0 8px 24px rgba(11, 29, 43, 0.08));
    }

    .theme-toggle:hover,
    .theme-selector-btn:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md, 0 12px 28px rgba(11, 29, 43, 0.14));
        border-color: var(--brand, #086d80);
    }

    .theme-toggle svg,
    .theme-selector-btn svg {
        width: 21px;
        height: 21px;
        color: var(--text-strong, #0a1d2b);
    }

    .theme-toggle .moon-icon {
        display: block;
    }

    .theme-toggle .sun-icon {
        display: none;
    }

    body.dark-mode .theme-toggle .moon-icon {
        display: none;
    }

    body.dark-mode .theme-toggle .sun-icon {
        display: block;
    }

    .theme-selector {
        position: relative;
    }

    .theme-dropdown {
        position: absolute;
        right: 56px;
        top: 0;
        background: var(--surface, #ffffff);
        border-radius: 14px;
        padding: 8px;
        min-width: 196px;
        border: 1px solid var(--line, #dce4e9);
        box-shadow: var(--shadow-md, 0 16px 36px rgba(11, 29, 43, 0.14));
        opacity: 0;
        visibility: hidden;
        transform: translateX(8px);
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
        padding: 9px 10px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 9px;
        cursor: pointer;
        transition: background 0.18s ease, border-color 0.18s ease;
        color: var(--text-strong, #0a1d2b);
    }

    .theme-option:hover {
        background: var(--surface-muted, #f7f9fa);
        border-color: var(--line, #dce4e9);
    }

    .theme-option.active {
        background: var(--brand-soft, #e9f4f6);
        border-color: color-mix(in srgb, var(--brand, #086d80) 30%, transparent);
    }

    .theme-preview {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--surface, #ffffff);
        box-shadow: 0 0 0 1px var(--line, #dce4e9);
        flex-shrink: 0;
    }

    .theme-name {
        font-size: 13.5px;
        font-weight: 600;
    }

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
            width: 19px;
            height: 19px;
        }

        .theme-dropdown {
            right: 0;
            top: auto;
            bottom: 52px;
        }
    }
`;
document.head.appendChild(themeStyles);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeManager();
    });
} else {
    new ThemeManager();
}
