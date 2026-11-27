/**
 * REIN ONLINE — Main Application Bootstrapper
 */
document.addEventListener('DOMContentLoaded', () => {
    // Set footer copyright year dynamically
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Initialize ambient particles
    ReinFX.initParticles();

    // Render dynamic RPG data sections
    ReinData.renderSkills();
    ReinData.renderProjects();
    ReinData.renderAchievements();

    // Initialize core modules
    ReinNav.init();
    ReinResume.init();
    ReinInteractions.init();

    // Initialize LINK START intro and trigger scroll reveals upon entry
    ReinIntro.init((showWelcomeToast) => {
        ReinFX.initScrollReveal();
        if (showWelcomeToast) {
            setTimeout(() => {
                ReinNav.showSystemToast('WELCOME TO MY PERSONAL PORTFOLIO, PLAYER!.');
            }, 450);
        }
    });
});