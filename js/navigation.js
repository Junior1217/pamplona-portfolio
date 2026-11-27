/**
 * REIN ONLINE — Top HUD Navigation, Digital Clock,
 * Section Exploration Progress Tracker & System Notifications
 */
const ReinNav = (() => {
    const visitedSections = new Set(['home']);
    const totalSections = 6;
    let lastNotifiedSection = 'home';

    function init() {
        startClock();
        setupMobileMenu();
        setupHUDControls();
        setupBackToTop();
        setupSectionTracking();
    }

    function startClock() {
        const clockEl = document.getElementById('hud-clock-time');
        if (!clockEl) return;

        const update = () => {
            const now = new Date();
            clockEl.textContent = now.toTimeString().split(' ')[0];
        };
        update();
        setInterval(update, 1000);
    }

    function setupMobileMenu() {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const drawer = document.getElementById('mobile-hud-drawer');
        if (!menuBtn || !drawer) return;

        menuBtn.addEventListener('click', () => {
            const isOpen = drawer.classList.toggle('open');
            menuBtn.setAttribute('aria-expanded', String(isOpen));
            drawer.setAttribute('aria-hidden', String(!isOpen));
            ReinFX.playTone('click');
        });

        drawer.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                drawer.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
                drawer.setAttribute('aria-hidden', 'true');
            });
        });
    }

    function setupHUDControls() {
        const soundBtn = document.getElementById('hud-sound-btn');
        const fsBtn = document.getElementById('hud-fullscreen-btn');

        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                ReinFX.setAudioEnabled(!ReinFX.isAudioEnabled());
            });
        }

        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                ReinFX.playTone('click');
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen?.().catch(() => { });
                } else {
                    document.exitFullscreen?.().catch(() => { });
                }
            });
        }
    }

    function setupBackToTop() {
        const topBtn = document.getElementById('back-to-top-btn');
        if (!topBtn) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 420) {
                topBtn.classList.add('visible');
            } else {
                topBtn.classList.remove('visible');
            }
        });

        topBtn.addEventListener('click', () => {
            ReinFX.playTone('click');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function setupSectionTracking() {
        const sections = document.querySelectorAll('.portfolio-section[data-section-name]');
        const navLinks = document.querySelectorAll('.nav-link');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        const label = entry.target.getAttribute('data-section-name');

                        // Highlight active nav link
                        navLinks.forEach((link) => {
                            link.classList.toggle('active', link.getAttribute('data-section') === id);
                        });

                        // Track exploration percentage
                        if (id && ['home', 'profile', 'skills', 'quests', 'achievements', 'contact'].includes(id)) {
                            visitedSections.add(id);
                            updateExplorationProgress();
                        }

                        // Trigger subtle system notification when entering a new section
                        if (id && id !== lastNotifiedSection) {
                            lastNotifiedSection = id;
                            showSystemToast(`${label} ACCESSED.`);
                        }
                    }
                });
            },
            { threshold: 0.35 }
        );

        sections.forEach((sec) => observer.observe(sec));
        updateExplorationProgress();
    }

    function updateExplorationProgress() {
        const percent = Math.min(100, Math.round((visitedSections.size / totalSections) * 100));
        const textEl = document.getElementById('exploration-percent');
        const mobileTextEl = document.getElementById('mobile-exploration-text');
        const barEl = document.getElementById('exploration-bar-fill');

        if (textEl) textEl.textContent = `${percent}%`;
        if (mobileTextEl) mobileTextEl.textContent = `EXPLORATION: ${percent}%`;
        if (barEl) barEl.style.width = `${percent}%`;
    }

    function showSystemToast(message) {
        const container = document.getElementById('system-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'system-toast';
        toast.innerHTML = `
      <div class="toast-header">[ SYSTEM MESSAGE ]</div>
      <div class="toast-body">${message}</div>
    `;

        container.appendChild(toast);
        ReinFX.playTone('notify');

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.35s ease';
            setTimeout(() => toast.remove(), 350);
        }, 3200);
    }

    return {
        init,
        showSystemToast
    };
})();