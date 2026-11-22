// ========================================
// BLOG READING PROGRESS & ENHANCEMENTS
// Adds reading progress bar, time estimate, and mark-as-read features
// ========================================

class BlogReadingProgress {
    constructor() {
        this.progressBar = null;
        this.progressContainer = null;
        this.timeEstimate = null;
        this.articleBody = null;
        this.readingSpeed = 200; // words per minute (average Vietnamese reading speed)
        this.totalWords = 0;
        this.readArticles = this.loadReadArticles();

        this.init();
    }

    init() {
        // Only initialize on blog post pages (check if article content exists)
        this.articleBody = document.querySelector('.blog-post-content, .post-content, article.blog-post');

        if (!this.articleBody) {
            // If not on a blog post page, mark read articles and wire category filter
            this.markReadArticlesInList();
            this.initBlogFilter();
            return;
        }

        this.createProgressBar();
        this.calculateReadingTime();
        this.attachScrollListener();
        this.markCurrentAsRead();
        this.initShareButtons();
        this.initCodeCopyButtons();
    }

    initBlogFilter() {
        const buttons = document.querySelectorAll('.blog-filter-btn');
        const cards = document.querySelectorAll('.blog-card[data-category]');
        if (!buttons.length || !cards.length) return;

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                const filter = btn.getAttribute('data-filter');

                cards.forEach(card => {
                    const cat = card.getAttribute('data-category');
                    const visible = filter === 'all' || cat === filter;
                    card.style.display = visible ? '' : 'none';
                });
                window.dispatchEvent(new Event('reveal:check'));
            });
        });
    }

    initCodeCopyButtons() {
        const blocks = this.articleBody.querySelectorAll('pre');
        blocks.forEach(pre => {
            if (pre.querySelector('.copy-code-btn')) return;
            pre.classList.add('has-copy-btn');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'copy-code-btn';
            btn.innerHTML = '<i class="far fa-copy"></i> Sao chép';
            btn.addEventListener('click', async () => {
                const codeEl = pre.querySelector('code');
                const text = codeEl ? codeEl.innerText : pre.innerText;
                try {
                    await navigator.clipboard.writeText(text);
                    btn.innerHTML = '<i class="fas fa-check"></i> Đã chép';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.innerHTML = '<i class="far fa-copy"></i> Sao chép';
                        btn.classList.remove('copied');
                    }, 1800);
                } catch {
                    this.showNotification('Không thể sao chép đoạn mã.', 'info');
                }
            });
            pre.appendChild(btn);
        });
    }

    initShareButtons() {
        const shareButtons = document.querySelectorAll('.share-btn');
        if (!shareButtons.length) return;

        const url = window.location.href;
        const title = document.querySelector('h1')?.textContent?.trim() || document.title;

        shareButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (btn.classList.contains('facebook')) {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
                } else if (btn.classList.contains('twitter')) {
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank', 'noopener,noreferrer');
                } else if (btn.classList.contains('linkedin')) {
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
                } else if (btn.classList.contains('copy')) {
                    try {
                        await navigator.clipboard.writeText(url);
                        this.showNotification('Đã sao chép liên kết bài viết!', 'success');
                    } catch {
                        this.showNotification('Không thể tự động sao chép liên kết.', 'info');
                    }
                }
            });
        });
    }

    createProgressBar() {
        this.progressContainer = document.createElement('div');
        this.progressContainer.className = 'reading-progress-container';
        this.progressContainer.innerHTML = `<div class="reading-progress-bar"></div>`;
        document.body.prepend(this.progressContainer);

        const statsBadge = document.createElement('div');
        statsBadge.className = 'reading-stats';
        statsBadge.innerHTML = `
            <span class="time-remaining">
                <i class="fas fa-clock"></i>
                <span class="time-text">Tính toán...</span>
            </span>
            <span class="progress-percentage">0%</span>
        `;
        document.body.appendChild(statsBadge);

        this.progressBar = this.progressContainer.querySelector('.reading-progress-bar');
        this.timeEstimate = statsBadge.querySelector('.time-text');
        this.progressPercentage = statsBadge.querySelector('.progress-percentage');
    }

    calculateReadingTime() {
        // Count words in article
        const text = this.articleBody.innerText || this.articleBody.textContent;
        this.totalWords = text.trim().split(/\s+/).length;

        // Calculate estimated reading time
        const minutes = Math.ceil(this.totalWords / this.readingSpeed);
        const timeText = minutes < 60
            ? `${minutes} phút đọc`
            : `${Math.floor(minutes / 60)}h ${minutes % 60}m đọc`;

        this.timeEstimate.textContent = timeText;
        this.totalReadingMinutes = minutes;
    }

    attachScrollListener() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateProgress();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initial update
        this.updateProgress();
    }

    updateProgress() {
        // Calculate scroll progress
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Progress percentage
        const totalScroll = documentHeight - windowHeight;
        const currentProgress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 100;
        const progressPercent = Math.min(100, Math.max(0, currentProgress));

        // Update progress bar
        this.progressBar.style.transform = `scaleX(${progressPercent / 100})`;

        // Update percentage display
        if (this.progressPercentage) {
            this.progressPercentage.textContent = `${Math.round(progressPercent)}%`;
        }

        // Update time remaining
        if (this.totalReadingMinutes) {
            const remainingPercent = 100 - progressPercent;
            const remainingMinutes = Math.ceil((this.totalReadingMinutes * remainingPercent) / 100);

            if (remainingMinutes > 0) {
                this.timeEstimate.textContent = `Còn ${remainingMinutes} phút`;
            } else {
                this.timeEstimate.textContent = 'Hoàn thành!';
            }
        }

        // Show/hide progress container based on scroll
        if (scrollTop > 100) {
            this.progressContainer.classList.add('visible');
        } else {
            this.progressContainer.classList.remove('visible');
        }
    }

    markCurrentAsRead() {
        const articleId = this.getArticleId();

        if (articleId && !this.readArticles.includes(articleId)) {
            let marked = false;
            let pending = false;

            const onScroll = () => {
                if (marked || pending) return;
                pending = true;
                window.requestAnimationFrame(() => {
                    pending = false;
                    if (marked) return;
                    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
                    const scrollPercent = totalScroll > 0 ? (window.pageYOffset / totalScroll) * 100 : 0;

                    if (scrollPercent > 50) {
                        this.readArticles.push(articleId);
                        this.saveReadArticles();
                        marked = true;
                        window.removeEventListener('scroll', onScroll);
                        this.showNotification('Đã đánh dấu bài viết là đã đọc', 'success');
                    }
                });
            };

            window.addEventListener('scroll', onScroll, { passive: true });
        }
    }

    getArticleId() {
        // Try to get ID from URL, data attribute, or article title
        const urlParams = new URLSearchParams(window.location.search);
        const idFromUrl = urlParams.get('id');

        if (idFromUrl) return idFromUrl;

        const idFromData = this.articleBody?.getAttribute('data-article-id');
        if (idFromData) return idFromData;

        // Fallback: use article title as ID
        const title = document.querySelector('h1')?.textContent;
        return title ? this.slugify(title) : null;
    }

    slugify(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    loadReadArticles() {
        try {
            const saved = localStorage.getItem('readArticles');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    saveReadArticles() {
        localStorage.setItem('readArticles', JSON.stringify(this.readArticles));
    }

    markReadArticlesInList() {
        // Find all blog cards in the blog listing page
        const blogCards = document.querySelectorAll('.blog-card');

        blogCards.forEach(card => {
            const link = card.querySelector('.blog-link');
            const title = card.querySelector('h3')?.textContent;

            if (title) {
                const articleId = this.slugify(title);

                if (this.readArticles.includes(articleId)) {
                    card.classList.add('read-article');

                    // Add read indicator
                    if (!card.querySelector('.read-indicator')) {
                        const indicator = document.createElement('div');
                        indicator.className = 'read-indicator';
                        indicator.innerHTML = '<i class="fas fa-check-circle"></i> Đã đọc';
                        card.querySelector('.blog-content').prepend(indicator);
                    }
                }
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `blog-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add styles for reading progress
const progressStyles = document.createElement('style');
progressStyles.textContent = `
    .reading-progress-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: var(--line, #dbeafe);
        z-index: 1005;
        opacity: 0;
        transform: translateY(-100%);
        transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .reading-progress-container.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .reading-progress-bar {
        height: 100%;
        width: 100%;
        background: linear-gradient(90deg, var(--brand, #0284c7), var(--accent, #38bdf8));
        transform: scaleX(0);
        transform-origin: left center;
        will-change: transform;
    }

    .reading-stats {
        position: fixed;
        bottom: 24px;
        left: 24px;
        display: flex;
        gap: 12px;
        align-items: center;
        background: var(--surface, #ffffff);
        padding: 9px 16px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-strong, #0b1f33);
        box-shadow: var(--shadow-md, 0 8px 24px rgba(14, 116, 184, 0.12));
        border: 1px solid var(--line, #dbeafe);
        z-index: 940;
    }

    .time-remaining {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--brand, #0284c7);
    }

    .time-remaining i {
        font-size: 14px;
    }

    .progress-percentage {
        color: var(--text-strong, #0b1f33);
        font-weight: 700;
        min-width: 34px;
        text-align: right;
    }

    /* Read article indicator */
    .blog-card.read-article {
        opacity: 0.94;
        position: relative;
    }

    .read-indicator {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: var(--brand-soft, #e0f2fe);
        border: 1px solid color-mix(in srgb, var(--brand, #0284c7) 24%, transparent);
        border-radius: 20px;
        color: var(--brand-hover, #0369a1);
        font-size: 11px;
        font-weight: 600;
        margin-bottom: 10px;
        width: fit-content;
    }

    .read-indicator i {
        font-size: 12px;
    }

    /* Code block copy button */
    .main-content pre.has-copy-btn {
        position: relative;
        padding-top: 44px;
    }

    .copy-code-btn {
        position: absolute;
        top: 10px;
        right: 12px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 11px;
        border-radius: 999px;
        border: 1px solid rgba(125, 211, 252, 0.28);
        background: rgba(15, 42, 72, 0.85);
        color: #bae6fd;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
    }

    .copy-code-btn:hover {
        background: #0284c7;
        border-color: #38bdf8;
        color: #ffffff;
    }

    .copy-code-btn.copied {
        background: #059669;
        border-color: #34d399;
        color: #ffffff;
    }

    /* Notification */
    .blog-notification {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: var(--surface, #ffffff);
        color: var(--text-strong, #0b1f33);
        padding: 12px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: var(--shadow-md, 0 12px 32px rgba(14, 116, 184, 0.15));
        border: 1px solid var(--line, #dbeafe);
        opacity: 0;
        transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .blog-notification.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }

    .blog-notification.success {
        border-color: rgba(12, 122, 84, 0.35);
    }

    .blog-notification i {
        color: #0c7a54;
        font-size: 18px;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .reading-stats {
            bottom: 20px;
            left: 16px;
            padding: 7px 12px;
            gap: 8px;
            font-size: 11px;
        }

        .blog-notification {
            bottom: 20px;
            max-width: 90%;
            padding: 10px 16px;
            font-size: 13px;
        }
    }
`;
document.head.appendChild(progressStyles);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BlogReadingProgress();
    });
} else {
    new BlogReadingProgress();
}
