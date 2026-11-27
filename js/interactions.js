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

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');

        if (loadBar) {
            loadBar.style.width = '0%';
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

    function setupCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const dot = cursor.querySelector('.cursor-dot');
        const ring = cursor.querySelector('.cursor-ring');

        window.addEventListener('mousemove', (e) => {
            dot.style.left = `${e.clientX}px`;
            dot.style.top = `${e.clientY}px`;
            ring.style.left = `${e.clientX}px`;
            ring.style.top = `${e.clientY}px`;
        });

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('a, button, .quest-card, .achievement-card, .skill-chip')) {
                cursor.classList.add('hovering');
            } else {
                cursor.classList.remove('hovering');
            }
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
        openModal
    };
})();