/**
 * REIN ONLINE — Modal Controls, Formspree Contact Submission,
 * Custom Desktop Cursor & Konami Code Easter Egg
 */
const ReinInteractions = (() => {
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xbgoobpw';

    function init() {
        setupModal();
        setupContactForm();
        setupCustomCursor();
        setupKonamiEasterEgg();
    }

    function setupModal() {
        const modal = document.getElementById('rpg-modal');
        const backdrop = document.getElementById('modal-backdrop');
        const closeBtn = document.getElementById('modal-close-btn');

        if (!modal) return;

        const close = () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            ReinFX.playTone('click');
        };

        backdrop?.addEventListener('click', close);
        closeBtn?.addEventListener('click', close);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                close();
            }
        });
    }

    function openModal(badgeText, innerHTML) {
        const modal = document.getElementById('rpg-modal');
        const badge = document.getElementById('modal-badge');
        const body = document.getElementById('modal-body');
        const loadBar = document.getElementById('modal-loading-bar');

        if (!modal || !body) return;

        if (badge) badge.textContent = badgeText;
        body.innerHTML = innerHTML;
        body.scrollTop = 0;
        ReinFX.playTone('open');

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');

        if (loadBar) {
            loadBar.style.width = '0%';
            void loadBar.offsetWidth; // force reflow so the bar animates every time
            requestAnimationFrame(() => {
                loadBar.style.width = '100%';
            });
        }
    }

    function setupContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            ReinFX.playTone('click');

            const nameInput = document.getElementById('sender-name');
            const emailInput = document.getElementById('sender-email');
            const subjectInput = document.getElementById('sender-subject');
            const messageInput = document.getElementById('sender-message');
            const submitBtn = document.getElementById('contact-submit-btn');
            const notice = document.getElementById('form-notice');

            // Clear previous errors
            document.getElementById('error-name').textContent = '';
            document.getElementById('error-email').textContent = '';
            document.getElementById('error-subject').textContent = '';
            document.getElementById('error-message').textContent = '';
            notice.className = 'form-notice';
            notice.textContent = '';

            let valid = true;

            if (!nameInput.value.trim()) {
                document.getElementById('error-name').textContent = 'Sender name is required.';
                valid = false;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailInput.value.trim())) {
                document.getElementById('error-email').textContent = 'Please enter a valid email address.';
                valid = false;
            }

            if (!subjectInput.value.trim()) {
                document.getElementById('error-subject').textContent = 'Transmission subject is required.';
                valid = false;
            }

            if (messageInput.value.trim().length < 10) {
                document.getElementById('error-message').textContent = 'Message must be at least 10 characters.';
                valid = false;
            }

            if (!valid) {
                ReinNav.showSystemToast('VALIDATION ERROR: CHECK INPUT FIELDS.');
                return;
            }

            const endpoint = form.getAttribute('action') || FORMSPREE_ENDPOINT;
            const payload = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                subject: subjectInput.value.trim(),
                message: messageInput.value.trim()
            };

            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>[ TRANSMITTING... ]</span>';
            }

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    form.reset();
                    notice.classList.add('info-notice');
                    notice.innerHTML = `
            <strong>[ TRANSMISSION COMPLETE ]</strong><br />
            Your message has been delivered. Player will respond as soon as possible.
          `;
                    ReinNav.showSystemToast('MESSAGE TRANSMITTED SUCCESSFULLY.');
                } else {
                    const data = await response.json().catch(() => ({}));
                    const errMsg =
                        Array.isArray(data.errors) && data.errors.length > 0
                            ? data.errors.map((item) => item.message).join(', ')
                            : 'Unable to send message through Formspree.';
                    notice.classList.add('info-notice');
                    notice.style.borderColor = 'var(--status-danger)';
                    notice.innerHTML = `<strong>[ TRANSMISSION FAILED ]</strong><br />${errMsg}`;
                    ReinNav.showSystemToast('TRANSMISSION ERROR: TRY AGAIN.');
                }
            } catch (err) {
                notice.classList.add('info-notice');
                notice.style.borderColor = 'var(--status-danger)';
                notice.innerHTML = `
          <strong>[ NETWORK ERROR ]</strong><br />
          Connection failed while sending packet. You can also reach out directly via <strong>[ EMAIL ME ]</strong>.
        `;
                ReinNav.showSystemToast('CONNECTION ERROR // CHECK NETWORK.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml || '<span>[ SEND TRANSMISSION ]</span>';
                }
            }
        });
    }

    /* ---------- Cursor ----------
       Simple + switchable. Change CURSOR_DEFAULT to pick the starting style,
       or click the cursor button in the top HUD to cycle through them
       (your choice is remembered).
         'dot'    -> small dot with a soft ring that follows it
         'arrow'  -> clean cyan arrow
         'sword'  -> small sword, tip is the click point
         'native' -> normal system cursor                                   */
    const CURSOR_DEFAULT = 'arrow';
    const CURSOR_ORDER = ['dot', 'arrow', 'sword', 'native'];
    const CURSOR_LABELS = { dot: 'DOT', arrow: 'ARROW', sword: 'SWORD', native: 'SYSTEM' };
    let setCursorStyleFn = () => { };

    const cursorUrl = (svg, x, y) =>
        `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${x} ${y}, auto`;

    const arrowSvg = (fill) =>
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 2 L3 19 L7.5 14.8 L10.5 21 L13 19.8 L10 13.8 L16 13.5 Z" fill="${fill}" stroke="#03111c" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

    const swordSvg = (accent) =>
        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="2,2 5.5,3.2 21.2,18.8 18.8,21.2 3.2,5.5" fill="#E2F8FF" stroke="#03111c" stroke-width="1" stroke-linejoin="round"/><line x1="14.5" y1="25.5" x2="25.5" y2="14.5" stroke="#03111c" stroke-width="5" stroke-linecap="round"/><line x1="14.5" y1="25.5" x2="25.5" y2="14.5" stroke="${accent}" stroke-width="3" stroke-linecap="round"/><line x1="22.5" y1="22.5" x2="28" y2="28" stroke="#03111c" stroke-width="5" stroke-linecap="round"/><line x1="22.5" y1="22.5" x2="28" y2="28" stroke="#475569" stroke-width="3" stroke-linecap="round"/></svg>`;

    function cursorCss(name) {
        // the DOM dot/ring is only used by the 'dot' style
        let css = 'html:not(.rein-cursor-dot) .custom-cursor { display: none !important; }\n';
        if (name === 'native') return css;

        if (name === 'dot') {
            return css + `
html.rein-cursor-dot, html.rein-cursor-dot * { cursor: none !important; }
html.rein-cursor-dot input, html.rein-cursor-dot textarea { cursor: text !important; }
.custom-cursor { display: block; position: fixed; top: 0; left: 0; width: 0; height: 0;
  pointer-events: none; z-index: 99999; opacity: 0; transition: opacity 0.25s ease; }
.custom-cursor.visible { opacity: 1; }
.custom-cursor .cursor-dot { position: fixed; top: 0; left: 0; width: 6px; height: 6px;
  margin: -3px 0 0 -3px; border: 0; border-radius: 50%; background: #00D9FF;
  transform: none; box-shadow: 0 0 8px #00D9FF; }
.custom-cursor .cursor-ring,
.custom-cursor.hovering .cursor-ring { position: fixed; top: 0; left: 0; width: 30px; height: 30px;
  margin: -15px 0 0 -15px; border: 1px solid rgba(0, 217, 255, 0.65); border-radius: 50%;
  background: transparent; transform: none; transition: border-color 0.2s ease, background 0.2s ease; }
.custom-cursor.hovering .cursor-ring { border-color: #00D9FF; background: rgba(0, 217, 255, 0.12); }`;
        }

        const make = name === 'arrow'
            ? { base: cursorUrl(arrowSvg('#00D9FF'), 3, 2), hover: cursorUrl(arrowSvg('#A78BFA'), 3, 2) }
            : { base: cursorUrl(swordSvg('#00D9FF'), 2, 2), hover: cursorUrl(swordSvg('#A78BFA'), 2, 2) };
        const root = `html.rein-cursor-${name}`;
        const interactive = ['a', 'button', '[role="button"]', 'label', 'select',
            '.quest-card', '.achievement-card', '.skill-chip'];
        const hoverSel = interactive.map((s) => `${root} ${s}, ${root} ${s} *`).join(', ');

        return css +
            `${root}, ${root} * { cursor: ${make.base} !important; }\n` +
            `${hoverSel} { cursor: ${make.hover} !important; }\n` +
            `${root} input, ${root} textarea { cursor: text !important; }`;
    }

    function setupCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const dot = cursor && cursor.querySelector('.cursor-dot');
        const ring = cursor && cursor.querySelector('.cursor-ring');

        let styleEl = document.getElementById('rein-cursor-style');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'rein-cursor-style';
            document.head.appendChild(styleEl);
        }

        let current = CURSOR_DEFAULT;
        try {
            const saved = localStorage.getItem('rein-cursor');
            if (CURSOR_ORDER.includes(saved)) current = saved;
        } catch (e) { /* storage blocked: use default */ }

        const apply = (name) => {
            if (!CURSOR_ORDER.includes(name)) name = CURSOR_DEFAULT;
            CURSOR_ORDER.forEach((n) => document.documentElement.classList.remove(`rein-cursor-${n}`));
            document.documentElement.classList.add(`rein-cursor-${name}`);
            styleEl.textContent = cursorCss(name);
            current = name;
            try { localStorage.setItem('rein-cursor', name); } catch (e) { /* ignore */ }
        };
        setCursorStyleFn = apply;
        apply(current);

        // HUD button to cycle styles
        const controls = document.querySelector('.hud-controls');
        if (controls && !document.getElementById('hud-cursor-btn')) {
            const btn = document.createElement('button');
            btn.id = 'hud-cursor-btn';
            btn.type = 'button';
            btn.className = 'hud-ctrl-btn';
            btn.title = 'Change cursor';
            btn.setAttribute('aria-label', 'Change cursor style');
            btn.innerHTML =
                '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 3l14 7-6 2-2 6z"></path></svg>';
            controls.insertBefore(
                btn,
                document.getElementById('hud-sound-btn') || document.getElementById('mobile-menu-btn') || null
            );
            btn.addEventListener('click', () => {
                const next = CURSOR_ORDER[(CURSOR_ORDER.indexOf(current) + 1) % CURSOR_ORDER.length];
                apply(next);
                ReinFX.playTone('click');
                ReinNav.showSystemToast(`CURSOR: ${CURSOR_LABELS[next]}`);
            });
        }

        if (!cursor || !dot || !ring) return;

        // 'dot' style motion: dot is exact, ring trails smoothly
        let tx = 0, ty = 0, dx = 0, dy = 0, rx = 0, ry = 0;
        let scale = 1, hovering = false, pressed = false, visible = false, raf = 0;

        const loop = () => {
            dx += (tx - dx) * 0.65;
            dy += (ty - dy) * 0.65;
            rx += (tx - rx) * 0.18;
            ry += (ty - ry) * 0.18;
            const target = pressed ? 0.8 : hovering ? 1.5 : 1;
            scale += (target - scale) * 0.22;

            dot.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
            ring.style.translate = `${rx.toFixed(1)}px ${ry.toFixed(1)}px`;
            ring.style.scale = scale.toFixed(3);

            const settled = Math.abs(tx - rx) < 0.1 && Math.abs(ty - ry) < 0.1 && Math.abs(target - scale) < 0.003;
            raf = settled ? 0 : requestAnimationFrame(loop);
        };
        const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

        window.addEventListener('pointermove', (e) => {
            if (current !== 'dot' || (e.pointerType && e.pointerType !== 'mouse')) return;
            tx = e.clientX;
            ty = e.clientY;
            if (!visible) {
                visible = true;
                dx = rx = tx;
                dy = ry = ty;
                cursor.classList.add('visible');
            }
            kick();
        }, { passive: true });

        document.documentElement.addEventListener('mouseleave', () => {
            visible = false;
            cursor.classList.remove('visible');
        });
        document.addEventListener('pointerdown', () => { pressed = true; kick(); });
        document.addEventListener('pointerup', () => { pressed = false; kick(); });
        document.addEventListener('mouseover', (e) => {
            hovering = Boolean(e.target.closest('a, button, input, textarea, [role="button"], .quest-card, .achievement-card, .skill-chip'));
            cursor.classList.toggle('hovering', hovering);
            if (current === 'dot') kick();
        });
    }

    function setupKonamiEasterEgg() {
        const konamiSequence = [
            'ArrowUp',
            'ArrowUp',
            'ArrowDown',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'ArrowLeft',
            'ArrowRight',
            'b',
            'a'
        ];
        let index = 0;

        document.addEventListener('keydown', (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (key === konamiSequence[index]) {
                index++;
                if (index === konamiSequence.length) {
                    index = 0;
                    ReinFX.playTone('linkStart');
                    ReinNav.showSystemToast('SECRET UNLOCKED: DUAL WIELDING SKILL EQUIPPED!');
                }
            } else {
                index = 0;
            }
        });
    }

    return {
        init,
        openModal,
        setCursorStyle: (name) => setCursorStyleFn(name)
    };
})();