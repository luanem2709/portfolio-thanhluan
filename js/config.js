// ========================================
// PORTFOLIO CONFIGURATION
// Cấu hình tổng thể cho portfolio
// ========================================

const CONFIG = {
    // Theme settings
    themes: {
        default: {
            name: 'Sky Blue',
            primary: '#0284c7',
            secondary: '#38bdf8',
            hover: '#0369a1',
            soft: '#e0f2fe',
            dark: '#07121e',
            light: '#e6f1fc'
        },
        indigo: {
            name: 'Cobalt Blue',
            primary: '#1d4ed8',
            secondary: '#0284c7',
            hover: '#1e40af',
            soft: '#eff6ff',
            dark: '#091120',
            light: '#e8f1f7'
        },
        emerald: {
            name: 'Emerald',
            primary: '#0c7a54',
            secondary: '#10b981',
            hover: '#065f46',
            soft: '#e6f5ef',
            dark: '#071713',
            light: '#e8f5ef'
        },
        sunset: {
            name: 'Amber Slate',
            primary: '#b45309',
            secondary: '#d97706',
            hover: '#92400e',
            soft: '#fef3c7',
            dark: '#17110d',
            light: '#f7eee8'
        }
    },

    // Feature flags (chỉ giữ những flag thực sự được script đọc)
    features: {
        particleCursor: false,
        easterEggs: true,
        githubStats: true,
        musicPlayer: false
    },

    // API endpoints
    api: {
        github: 'https://api.github.com/users/luanem2709',
        emailjs: {
            serviceId: 'service_tbgvmpj',
            templateId: 'template_heik4ow',
            publicKey: 'oCLX80jQ7U-0e5Mgc'
        }
    },

    // Personal info
    info: {
        name: 'Nguyễn Thành Luân',
        title: 'Software Engineer · Web & IT Specialist',
        email: 'nguyenthanhluan.270924@gmail.com',
        phone: '0816042709',
        github: 'luanem2709',
        discord: 'Ma Đạo Community',
        tiktok: '@LuanEm2709'
    },

    // Animation settings
    animations: {
        terminalSpeed: 50,
        particleCount: 50,
        typingSpeed: 150,
        scrollRevealDelay: 100
    },

    // Easter eggs
    secrets: {
        konamiCode: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
        secretWord: 'madao',
        logoClickCount: 5
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
