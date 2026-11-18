// Hiệu ứng gõ chữ ở hero (chỉ chạy khi có phần tử .typing-text)
const typingText = document.querySelector('.typing-text');
const phrases = [
    'Software Engineer',
    'Web & WordPress Developer',
    'IT HelpDesk & Systems',
    'Chrome Extension Dev',
    'Discord Bot & Automation'
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 150;

function type() {
    if (!typingText) return;

    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typingText.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingText.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 150;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 500;
    }

    setTimeout(type, typingSpeed);
}

if (typingText) {
    document.addEventListener('DOMContentLoaded', type);
}

// Animate thanh kỹ năng khi cuộn tới
const progressBars = document.querySelectorAll('.progress[data-progress]');

if (progressBars.length) {
    const fillBar = (bar) => {
        if (bar.dataset.filled === 'true') return;
        const progress = bar.getAttribute('data-progress');
        if (progress) {
            bar.style.width = `${progress}%`;
            bar.dataset.filled = 'true';
        }
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        progressBars.forEach(fillBar);
    } else {
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                fillBar(entry.target);
                skillObserver.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px 40px 0px' });

        progressBars.forEach(bar => skillObserver.observe(bar));
    }
}

// Bảo đảm các card nội dung luôn hiển thị sẵn (tránh bị ẩn khi cuộn nhanh)
document.querySelectorAll(
    '.achievement-card, .skill-item, .stat-item, .info-card, .skill-card, .blog-card, .section-header'
).forEach(el => {
    el.classList.remove('fade-in');
    el.classList.add('reveal-active', 'fade-in-visible');
});

// Lightbox xem phóng to chứng chỉ ở trang Thành tựu
const achievementCards = document.querySelectorAll('.achievement-card');
if (achievementCards.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'cert-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.innerHTML = `
        <div class="cert-lightbox-inner">
            <button type="button" class="cert-lightbox-close" aria-label="Đóng">&times;</button>
            <img src="" alt="">
            <div class="cert-lightbox-caption"></div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lbImg = lightbox.querySelector('img');
    const lbCaption = lightbox.querySelector('.cert-lightbox-caption');
    const closeLb = () => lightbox.classList.remove('open');

    lightbox.querySelector('.cert-lightbox-close').addEventListener('click', closeLb);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLb();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLb();
    });

    achievementCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('.achievement-image img');
            const title = card.querySelector('h3')?.textContent || '';
            const issuer = card.querySelector('.issuer')?.textContent || '';
            if (!img) return;
            lbImg.src = img.src;
            lbImg.alt = img.alt || title;
            lbCaption.textContent = issuer ? `${title} — ${issuer}` : title;
            lightbox.classList.add('open');
        });
    });
}

console.log('%cNguyễn Thành Luân - Software Engineer & Web / IT Portfolio', 'color:#0284c7;font-size:16px;font-weight:700');
console.log('%cHUTECH Công nghệ Phần mềm · Hyundai Miền Nam Intern', 'color:#38bdf8;font-size:13px');
