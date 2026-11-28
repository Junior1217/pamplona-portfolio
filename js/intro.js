/**
 * REIN ONLINE — Cinematic LINK START Sequence
 * Scene 1 (Boot, typewriter + eased loader) -> Scene 2 (Welcome) -> Scene 3 (Link Start warp)
 * Always starts from Scene 1 every time the page is loaded or restarted.
 *
 * LINK START timeline (ms):
 *     0  whoosh starts, warp canvas accelerates, rings + TOUCH/SIGHT/OK nodes pop
 *   300  "LINK START!" rushes toward the camera
 *  1800  breakthrough: boom, lens flare, shockwave, screen shake, white flash
 *  2250  overlay flies away and the world zooms in
 */
const ReinIntro = (() => {
    const bootMessages = [
        '[ SYSTEM BOOTING... ]',
        '[ CONNECTING TO VIRTUAL WORLD... ]',
        '[ LOADING PLAYER DATA... ]',
        '[ INITIALIZING PORTFOLIO SYSTEM... ]',
        '[ SYSTEM READY ]'
    ];

    const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentScene = 1;
    let linkTriggered = false;
    let entered = false;
    let hexTimer = null;
    const timers = [];

    function later(fn, ms) {
        const id = setTimeout(fn, ms);
        timers.push(id);
        return id;
    }

    function init(onEnterWorld) {
        const overlay = document.getElementById('intro-overlay');
        const mainWorld = document.getElementById('main-world');
        const skipBtn = document.getElementById('skip-intro-btn');
        const linkBtn = document.getElementById('link-start-btn');
        const introSoundBtn = document.getElementById('intro-sound-toggle');

        // Initialize default ON audio state & browser unlock listeners
        ReinFX.setupAudioAutoUnlock();

        if (introSoundBtn) {
            introSoundBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                ReinFX.setAudioEnabled(!ReinFX.isAudioEnabled());
            });
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                ReinFX.playTone('click');
                enterWorldImmediately(overlay, mainWorld, onEnterWorld, true);
            });
        }

        runBootSequence(() => switchScene(2));

        // Scene 2: LINK START on button click, screen click, or ENTER key
        if (linkBtn) {
            linkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentScene === 2) triggerLinkStart(overlay, mainWorld, onEnterWorld);
            });
        }

        const scene2 = document.getElementById('intro-scene-2');
        if (scene2) {
            scene2.addEventListener('click', () => {
                if (currentScene === 2) triggerLinkStart(overlay, mainWorld, onEnterWorld);
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && currentScene === 2 && !linkTriggered) {
                triggerLinkStart(overlay, mainWorld, onEnterWorld);
            }
        });
    }

    /* ---------- Scene 1: boot ---------- */
    function typeLine(el, text, msPerChar, onDone) {
        if (reduced()) {
            el.textContent = text;
            onDone();
            return;
        }
        const start = performance.now();
        let shown = 0;
        function step(now) {
            if (entered) return;
            const target = Math.min(text.length, Math.floor((now - start) / msPerChar) + 1);
            if (target !== shown) {
                shown = target;
                el.textContent = text.slice(0, shown);
            }
            if (shown < text.length) requestAnimationFrame(step);
            else onDone();
        }
        requestAnimationFrame(step);
    }

    function runBootSequence(onComplete) {
        const logEl = document.getElementById('boot-log');
        const barEl = document.getElementById('boot-progress-bar');
        const percentEl = document.getElementById('boot-percent');
        const hexEl = document.getElementById('boot-hex-code');
        const statusLabelEl = document.getElementById('boot-status-label');

        const total = bootMessages.length;
        let step = 0;
        let targetPct = 0;
        let shownPct = 0;

        hexTimer = setInterval(() => {
            if (hexEl) {
                const randHex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
                hexEl.textContent = `0x${randHex}`;
            }
        }, 90);

        // Loader eases toward its target instead of jumping, like a real progress bar
        function tickProgress() {
            if (entered) return;
            shownPct += (targetPct - shownPct) * 0.12;
            if (Math.abs(targetPct - shownPct) < 0.3) shownPct = targetPct;
            if (barEl) barEl.style.width = `${shownPct}%`;
            if (percentEl) percentEl.textContent = `${Math.round(shownPct)}%`;
            if (shownPct !== targetPct || step < total) requestAnimationFrame(tickProgress);
        }
        requestAnimationFrame(tickProgress);

        function nextLine() {
            if (entered) return;

            if (step >= total) {
                clearInterval(hexTimer);
                later(onComplete, 700);
                return;
            }

            const idx = step;
            const isLast = idx === total - 1;

            if (logEl) {
                logEl.querySelectorAll('.boot-line:not(.ready)').forEach((prev) => prev.classList.add('done'));
                const line = document.createElement('div');
                line.className = 'boot-line';
                logEl.appendChild(line);

                if (statusLabelEl) {
                    statusLabelEl.textContent = isLast ? 'SYSTEM ONLINE' : 'SYNCHRONIZING MODULES';
                }

                ReinFX.playTone('boot');

                typeLine(line, bootMessages[idx], 14, () => {
                    if (isLast) line.classList.add('ready');
                    targetPct = Math.round(((idx + 1) / total) * 100);
                    step++;
                    // irregular rhythm feels like real modules loading
                    later(nextLine, 140 + Math.random() * 200);
                });
            }
        }

        later(nextLine, 650); // let the CRT power-on play first
    }

    /* ---------- Scene switching ---------- */
    function switchScene(sceneNumber, immediate = false) {
        const current = document.querySelector('.intro-scene.active');
        const target = document.getElementById(`intro-scene-${sceneNumber}`);
        if (!target || current === target) return;

        currentScene = 0; // locked while transitioning

        if (current && !immediate && !reduced()) {
            current.classList.add('leaving');
            later(() => {
                current.classList.remove('active', 'leaving');
                target.classList.add('active');
                currentScene = sceneNumber;
            }, 380);
        } else {
            if (current) current.classList.remove('active', 'leaving');
            target.classList.add('active');
            currentScene = sceneNumber;
        }
    }

    /* ---------- Scene 3: LINK START ---------- */
    function triggerLinkStart(overlay, mainWorld, onEnterWorld) {
        if (linkTriggered) return;
        linkTriggered = true;

        const quick = reduced();
        const flashAt = quick ? 150 : 1800;
        const enterAt = quick ? 500 : 2250;

        ReinFX.playTone('linkStart');
        switchScene(3, true);
        currentScene = 3;
        ReinFX.playLinkStartWarpCanvas(2600);

        const flash = document.getElementById('flash-overlay');
        later(() => {
            if (flash) flash.classList.add('flash-active');
            if (overlay && !quick) overlay.classList.add('shake');
        }, flashAt);

        later(() => enterWorldImmediately(overlay, mainWorld, onEnterWorld, true), enterAt);
    }

    function enterWorldImmediately(overlay, mainWorld, onEnterWorld, showWelcomeToast) {
        if (entered) return;
        entered = true;
        timers.forEach(clearTimeout);
        timers.length = 0;
        clearInterval(hexTimer);

        if (overlay) overlay.classList.add('dismissed');
        if (mainWorld) {
            mainWorld.classList.remove('hidden-world');
            mainWorld.classList.add('world-live');
        }
        document.body.classList.add('world-entered');

        // free the GPU once the fly-through has finished
        setTimeout(() => {
            if (overlay) overlay.style.display = 'none';
        }, 1400);

        if (typeof onEnterWorld === 'function') {
            onEnterWorld(showWelcomeToast);
        }
    }

    return { init };
})();
