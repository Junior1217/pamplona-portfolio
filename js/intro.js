/**
 * REIN ONLINE — Cinematic LINK START Sequence
 * Always starts from Scene 1 (Boot) -> Scene 2 (Welcome) -> Scene 3 (Link Start)
 * every time the page is loaded or restarted.
 */
const ReinIntro = (() => {
    const bootMessages = [
        '[ SYSTEM BOOTING... ]',
        '[ CONNECTING TO VIRTUAL WORLD... ]',
        '[ LOADING PLAYER DATA... ]',
        '[ INITIALIZING PORTFOLIO SYSTEM... ]',
        '[ SYSTEM READY ]'
    ];

    let currentScene = 1;
    let linkTriggered = false;

    function init(onEnterWorld) {
        const overlay = document.getElementById('intro-overlay');
        const mainWorld = document.getElementById('main-world');
        const skipBtn = document.getElementById('skip-intro-btn');
        const linkBtn = document.getElementById('link-start-btn');
        const introSoundBtn = document.getElementById('intro-sound-toggle');

        // Initialize default ON audio state & browser unlock listeners
        ReinFX.setupAudioAutoUnlock();

        // Audio toggle button on intro screen
        if (introSoundBtn) {
            introSoundBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                ReinFX.setAudioEnabled(!ReinFX.isAudioEnabled());
            });
        }

        // Skip intro button
        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                ReinFX.playTone('click');
                enterWorldImmediately(overlay, mainWorld, onEnterWorld, true);
            });
        }

        // Start Scene 1 Boot Sequence every page load
        runBootSequence(() => {
            switchScene(2);
        });

        // Scene 2: Trigger LINK START on button click, screen click, or ENTER key
        if (linkBtn) {
            linkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                triggerLinkStart(overlay, mainWorld, onEnterWorld);
            });
        }

        const scene2 = document.getElementById('intro-scene-2');
        if (scene2) {
            scene2.addEventListener('click', () => {
                if (currentScene === 2) {
                    triggerLinkStart(overlay, mainWorld, onEnterWorld);
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && currentScene === 2 && !linkTriggered) {
                triggerLinkStart(overlay, mainWorld, onEnterWorld);
            }
        });
    }

    function runBootSequence(onComplete) {
        const logEl = document.getElementById('boot-log');
        const barEl = document.getElementById('boot-progress-bar');
        const percentEl = document.getElementById('boot-percent');
        const hexEl = document.getElementById('boot-hex-code');
        const statusLabelEl = document.getElementById('boot-status-label');

        let step = 0;
        const totalSteps = bootMessages.length;

        const hexTimer = setInterval(() => {
            if (hexEl) {
                const randHex = Math.floor(Math.random() * 0xffff)
                    .toString(16)
                    .toUpperCase()
                    .padStart(4, '0');
                hexEl.textContent = `0x${randHex}`;
            }
        }, 90);

        const interval = setInterval(() => {
            if (step < totalSteps) {
                if (logEl) {
                    logEl.querySelectorAll('.boot-line:not(.ready)').forEach((prevLine) => {
                        prevLine.classList.add('done');
                    });

                    const isLast = step === totalSteps - 1;
                    const line = document.createElement('div');
                    line.className = 'boot-line' + (isLast ? ' ready' : '');
                    line.textContent = bootMessages[step];
                    logEl.appendChild(line);

                    if (statusLabelEl) {
                        statusLabelEl.textContent = isLast ? 'SYSTEM ONLINE' : 'SYNCHRONIZING MODULES';
                    }
                }

                ReinFX.playTone('boot');

                step++;
                const pct = Math.round((step / totalSteps) * 100);
                if (barEl) barEl.style.width = `${pct}%`;
                if (percentEl) percentEl.textContent = `${pct}%`;
            } else {
                clearInterval(interval);
                clearInterval(hexTimer);
                setTimeout(onComplete, 600);
            }
        }, 520);
    }

    function switchScene(sceneNumber) {
        currentScene = sceneNumber;
        document.querySelectorAll('.intro-scene').forEach((s) => s.classList.remove('active'));
        const target = document.getElementById(`intro-scene-${sceneNumber}`);
        if (target) target.classList.add('active');
    }

    function triggerLinkStart(overlay, mainWorld, onEnterWorld) {
        if (linkTriggered) return;
        linkTriggered = true;

        ReinFX.playTone('linkStart');
        switchScene(3);
        ReinFX.playLinkStartWarpCanvas(1500);

        const flash = document.getElementById('flash-overlay');
        setTimeout(() => {
            if (flash) flash.classList.add('flash-active');
        }, 850);

        setTimeout(() => {
            enterWorldImmediately(overlay, mainWorld, onEnterWorld, true);
        }, 1500);
    }

    function enterWorldImmediately(overlay, mainWorld, onEnterWorld, showWelcomeToast) {
        if (overlay) overlay.classList.add('dismissed');
        if (mainWorld) mainWorld.classList.remove('hidden-world');
        if (typeof onEnterWorld === 'function') {
            onEnterWorld(showWelcomeToast);
        }
    }

    return { init };
})();