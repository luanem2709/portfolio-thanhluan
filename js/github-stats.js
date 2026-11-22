// ========================================
// GITHUB STATS WIDGET
// Hiển thị stats real-time từ GitHub API
// ========================================

class GitHubStats {
    constructor() {
        this.username = CONFIG.info.github;
        this.apiUrl = CONFIG.api.github;
        this.stats = null;
        this.refreshInterval = null;
        this.animationTimers = {};
        this.init();
    }

    async init() {
        await this.fetchStats();
        this.createWidget();
        this.updateWidget();

        // Cập nhật mỗi 5 phút; xoá interval cũ nếu có để tránh rò rỉ
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(async () => {
            await this.fetchStats();
            this.updateWidget();
        }, 300000);
    }

    async fetchStats() {
        try {
            // Fetch user data
            const userResponse = await fetch(this.apiUrl);
            if (userResponse.status === 403) {
                throw new Error('GitHub API rate limit exceeded (60 req/h chưa xác thực)');
            }
            if (!userResponse.ok) {
                throw new Error(`GitHub user API lỗi: ${userResponse.status}`);
            }
            const userData = await userResponse.json();

            // Fetch repos
            const reposResponse = await fetch(`${this.apiUrl}/repos?sort=updated&per_page=100`);
            if (!reposResponse.ok) {
                throw new Error(`GitHub repos API lỗi: ${reposResponse.status}`);
            }
            const reposData = await reposResponse.json();
            if (!Array.isArray(reposData)) {
                throw new Error('GitHub repos API trả về dữ liệu không hợp lệ');
            }

            // Calculate stats
            const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
            const totalForks = reposData.reduce((sum, repo) => sum + repo.forks_count, 0);
            const languages = {};

            reposData.forEach(repo => {
                if (repo.language) {
                    languages[repo.language] = (languages[repo.language] || 0) + 1;
                }
            });

            const topLanguages = Object.entries(languages)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([lang]) => lang);

            this.stats = {
                repos: userData.public_repos,
                followers: userData.followers,
                following: userData.following,
                stars: totalStars,
                forks: totalForks,
                topLanguages: topLanguages,
                latestRepo: reposData[0],
                avatar: userData.avatar_url,
                bio: userData.bio
            };

        } catch (error) {
            console.warn('GitHub stats fallback:', error.message);
            // Use fallback data
            this.stats = {
                repos: 22,
                followers: 2,
                following: 5,
                stars: 3,
                forks: 0,
                topLanguages: ['HTML', 'TypeScript', 'C#'],
                latestRepo: { name: 'portfolio-thanhluan', updated_at: new Date().toISOString() }
            };
        }
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'github-stats-widget collapsed';
        widget.id = 'github-stats';
        widget.innerHTML = `
            <div class="github-widget-header" role="button" tabindex="0" aria-expanded="false" aria-label="GitHub Stats - mở hoặc thu gọn thống kê">
                <i class="fab fa-github"></i>
                <span>GitHub Stats</span>
                <span class="widget-toggle" aria-hidden="true">
                    <i class="fas fa-chevron-down"></i>
                </span>
            </div>
            <div class="github-widget-content">
                <div class="github-stat-grid">
                    <div class="github-stat-item">
                        <i class="fas fa-code-branch"></i>
                        <div class="stat-value" id="gh-repos">--</div>
                        <div class="stat-label">Repositories</div>
                    </div>
                    <div class="github-stat-item">
                        <i class="fas fa-star"></i>
                        <div class="stat-value" id="gh-stars">--</div>
                        <div class="stat-label">Stars</div>
                    </div>
                    <div class="github-stat-item">
                        <i class="fas fa-users"></i>
                        <div class="stat-value" id="gh-followers">--</div>
                        <div class="stat-label">Followers</div>
                    </div>
                    <div class="github-stat-item github-stat-item--langs">
                        <i class="fas fa-code"></i>
                        <div class="stat-value" id="gh-languages">--</div>
                        <div class="stat-label">Top Languages</div>
                    </div>
                </div>
                <div class="github-latest-repo">
                    <div class="repo-label">Latest Update:</div>
                    <div class="repo-name" id="gh-latest-repo">--</div>
                    <div class="repo-time" id="gh-latest-time">--</div>
                </div>
                <a href="https://github.com/${this.username}" target="_blank" rel="noopener noreferrer" class="github-profile-link">
                    <i class="fab fa-github"></i> View Full Profile
                </a>
            </div>
        `;

        document.body.appendChild(widget);

        const header = widget.querySelector('.github-widget-header');
        const toggleWidget = () => {
            const isCollapsed = widget.classList.toggle('collapsed');
            header.setAttribute('aria-expanded', String(!isCollapsed));
        };

        header.addEventListener('click', toggleWidget);
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleWidget();
            }
        });
    }

    updateWidget() {
        if (!this.stats) return;

        // Animate counter
        this.animateValue('gh-repos', 0, this.stats.repos, 1000);
        this.animateValue('gh-stars', 0, this.stats.stars, 1000);
        this.animateValue('gh-followers', 0, this.stats.followers, 1000);

        // Update languages
        const languagesEl = document.getElementById('gh-languages');
        if (languagesEl) {
            languagesEl.textContent = this.stats.topLanguages.join(', ');
        }

        // Update latest repo
        const repoNameEl = document.getElementById('gh-latest-repo');
        const repoTimeEl = document.getElementById('gh-latest-time');

        if (repoNameEl && this.stats.latestRepo) {
            repoNameEl.textContent = this.stats.latestRepo.name;
            repoTimeEl.textContent = this.getTimeAgo(this.stats.latestRepo.updated_at);
        }
    }

    animateValue(id, start, end, duration) {
        const element = document.getElementById(id);
        if (!element) return;

        // Xoá timer cũ của chính phần tử này trước khi chạy timer mới
        if (this.animationTimers[id]) {
            clearInterval(this.animationTimers[id]);
        }

        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        this.animationTimers[id] = setInterval(() => {
            current += increment;
            if (current >= end) {
                element.textContent = end;
                clearInterval(this.animationTimers[id]);
                this.animationTimers[id] = null;
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }
}

// Add GitHub widget styles
const githubStyles = document.createElement('style');
githubStyles.textContent = `
    .github-stats-widget {
        position: fixed;
        bottom: 24px;
        left: 24px;
        width: 310px;
        background: var(--surface, #ffffff);
        border-radius: 16px;
        border: 1px solid var(--line, #dbeafe);
        box-shadow: var(--shadow-md, 0 12px 32px rgba(14, 116, 184, 0.12));
        z-index: 940;
        overflow: hidden;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .github-stats-widget.collapsed {
        width: max-content;
        border-radius: 999px;
    }

    .github-stats-widget.collapsed .github-widget-header {
        padding: 10px 16px;
        border-bottom-color: transparent;
    }

    .github-stats-widget.collapsed .github-widget-content {
        display: none;
    }

    .github-stats-widget.collapsed .widget-toggle i {
        transform: rotate(-90deg);
    }

    .github-widget-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 18px;
        background: var(--surface-muted, #eef6ff);
        border-bottom: 1px solid var(--line, #dbeafe);
        cursor: pointer;
    }

    .github-widget-header i.fa-github {
        font-size: 18px;
        color: var(--brand, #0284c7);
        flex-shrink: 0;
    }

    .github-widget-header span {
        flex: 1;
        color: var(--text-strong, #0b1f33);
        font-weight: 600;
        font-size: 13.5px;
        white-space: nowrap;
        line-height: 1.2;
    }

    .widget-toggle {
        background: none;
        border: none;
        color: var(--muted, #5a728a);
        cursor: pointer;
        padding: 2px 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: color 0.2s ease;
    }

    .widget-toggle:hover {
        color: var(--brand, #0284c7);
    }

    .widget-toggle i {
        transition: transform 0.25s ease;
    }

    .github-widget-content {
        padding: 18px;
        max-height: 600px;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .github-widget-content::-webkit-scrollbar {
        width: 6px;
    }

    .github-widget-content::-webkit-scrollbar-track {
        background: var(--surface-muted, #eef6ff);
        border-radius: 10px;
    }

    .github-widget-content::-webkit-scrollbar-thumb {
        background: var(--line-strong, #bfdbfe);
        border-radius: 10px;
    }

    .github-stat-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 16px;
    }

    .github-stat-item {
        text-align: center;
        padding: 12px;
        background: var(--surface-muted, #eef6ff);
        border-radius: 12px;
        border: 1px solid var(--line, #dbeafe);
        transition: border-color 0.2s ease, transform 0.2s ease;
    }

    .github-stat-item:hover {
        border-color: var(--brand, #0284c7);
        transform: translateY(-2px);
    }

    .github-stat-item i {
        font-size: 18px;
        color: var(--brand, #0284c7);
        margin-bottom: 6px;
    }

    .stat-value {
        font-size: 22px;
        font-weight: 700;
        color: var(--text-strong, #0b1f33);
        margin-bottom: 4px;
    }

    .github-stat-item--langs .stat-value {
        font-size: 13px;
        line-height: 1.35;
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        word-break: break-word;
    }

    .stat-label {
        font-size: 11px;
        color: var(--muted, #5a728a);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .github-latest-repo {
        background: var(--brand-soft, #e0f2fe);
        padding: 12px 14px;
        border-radius: 10px;
        margin-bottom: 14px;
        border-left: 3px solid var(--brand, #0284c7);
    }

    .repo-label {
        font-size: 11px;
        color: var(--muted, #5a728a);
        text-transform: uppercase;
        margin-bottom: 4px;
    }

    .repo-name {
        font-size: 14px;
        color: var(--brand-hover, #0369a1);
        font-weight: 700;
        margin-bottom: 3px;
    }

    .repo-time {
        font-size: 12px;
        color: var(--muted, #5a728a);
    }

    .github-profile-link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 11px 14px;
        background: linear-gradient(135deg, var(--brand-hover, #075985), var(--brand, #0369a1));
        color: var(--on-brand, #ffffff);
        text-decoration: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 13px;
        transition: filter 0.2s ease, transform 0.2s ease;
    }

    .github-profile-link:hover {
        transform: translateY(-2px);
        filter: brightness(1.06);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .github-stats-widget {
            left: 16px;
            right: 16px;
            width: auto;
            bottom: 74px;
            max-height: 68vh;
        }

        .github-stats-widget.collapsed {
            right: auto;
            bottom: 20px;
            width: max-content;
            max-width: calc(100vw - 180px);
        }

        .github-stats-widget.collapsed .github-widget-header {
            padding: 10px 12px;
            gap: 8px;
        }

        .github-stats-widget.collapsed .github-widget-header span {
            font-size: 12.5px;
            white-space: nowrap;
        }

        .github-widget-content {
            max-height: calc(68vh - 60px);
            padding: 15px;
        }

        .github-stat-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }

        .github-stat-item {
            padding: 10px;
        }

        .stat-value {
            font-size: 20px;
        }
    }
`;
document.head.appendChild(githubStyles);

// Initialize GitHub stats
if (CONFIG.features.githubStats) {
    window.addEventListener('load', () => {
        new GitHubStats();
    });
}
