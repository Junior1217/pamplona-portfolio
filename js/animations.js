/**
 * REIN ONLINE — Visual Effects Engine
 * - Layered Web Audio synth (noise whooshes, sub-boom, chimes)
 * - LINK START 3D warp tunnel (perspective star streaks, chromatic fringe, camera roll/shake)
 * - Depth-layered ambient particles (parallax + cursor repel)
 * - Staggered scroll reveal + text decode effect
 * - Spotlight, 3D card tilt, magnetic buttons, ripples, hero parallax, scroll progress
 */
const ReinFX = (() => {
    let audioEnabled = true;
    let audioCtx = null;
    let master = null;
    let noiseBuf = null;

    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /* =====================================================
       AUDIO
       ===================================================== */
    function initAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
                const comp = audioCtx.createDynamicsCompressor();
                master = audioCtx.createGain();
                master.gain.value = 0.9;
                master.connect(comp);
                comp.connect(audioCtx.destination);
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => { });
        }
    }

    function setupAudioAutoUnlock() {
        updateAudioUI();
        initAudioContext();

        const unlock = () => {
            if (audioEnabled) {
                initAudioContext();
            }
            if (audioCtx && audioCtx.state === 'running') {
                document.removeEventListener('pointerdown', unlock);
                document.removeEventListener('keydown', unlock);
            }
        };

        document.addEventListener('pointerdown', unlock);
        document.addEventListener('keydown', unlock);
    }

    function setAudioEnabled(state) {
        audioEnabled = Boolean(state);
        if (audioEnabled) {
            initAudioContext();
            playTone('toggle');
        }
        updateAudioUI();
    }

    function isAudioEnabled() {
        return audioEnabled;
    }

    function updateAudioUI() {
        const introState = document.getElementById('intro-audio-state');
        const introBtn = document.getElementById('intro-sound-toggle');
        const iconOn = document.getElementById('sound-icon-on');
        const iconOff = document.getElementById('sound-icon-off');

        if (introState) introState.textContent = audioEnabled ? 'ON' : 'MUTED';
        if (introBtn) introBtn.classList.toggle('audio-active', audioEnabled);

        if (iconOn && iconOff) {
            iconOn.classList.toggle('hidden', !audioEnabled);
            iconOff.classList.toggle('hidden', audioEnabled);
        }
    }

    function getNoise() {
        if (noiseBuf) return noiseBuf;
        const len = audioCtx.sampleRate * 2;
        noiseBuf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        return noiseBuf;
    }

    /** Pitched blip with a soft attack so it never clicks. */
    function tone({ type = 'sine', f0, f1, start = 0, dur = 0.1, vol = 0.05, attack = 0.006 }) {
        const t = audioCtx.currentTime + start;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f0, t);
        if (f1) osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(vol, t + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + dur + 0.03);
    }

    /** Filtered noise sweep — the "air" in whooshes and impacts. */
    function noise({ start = 0, dur = 1, vol = 0.2, f0 = 200, f1 = 5000, q = 1.2, type = 'bandpass', peak = 0.7 }) {
        const t = audioCtx.currentTime + start;
        const src = audioCtx.createBufferSource();
        src.buffer = getNoise();
        src.loop = true;
        const filter = audioCtx.createBiquadFilter();
        filter.type = type;
        filter.Q.value = q;
        filter.frequency.setValueAtTime(f0, t);
        filter.frequency.exponentialRampToValueAtTime(f1, t + dur);
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(vol, t + dur * peak);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        src.start(t);
        src.stop(t + dur + 0.05);
    }

    function playTone(type = 'click') {
        if (!audioEnabled) return;
        initAudioContext();
        if (!audioCtx || audioCtx.state !== 'running') return;

        switch (type) {
            case 'boot':
                tone({ f0: 520, f1: 880, dur: 0.09, vol: 0.05 });
                tone({ type: 'triangle', f0: 1760, dur: 0.05, vol: 0.014, start: 0.02 });
                break;

            case 'linkStart':
                // rising whoosh + engine pitch sweep
                noise({ dur: 2.0, vol: 0.28, f0: 150, f1: 7000, q: 1.1, peak: 0.85 });
                tone({ type: 'sawtooth', f0: 90, f1: 900, dur: 1.9, vol: 0.06, attack: 0.25 });
                // breakthrough: sub boom + air burst
                tone({ f0: 120, f1: 30, start: 1.8, dur: 1.1, vol: 0.5, attack: 0.01 });
                noise({ start: 1.8, dur: 0.9, vol: 0.25, f0: 2200, f1: 120, type: 'lowpass', peak: 0.1 });
                // arrival chime
                [784, 1175, 1568].forEach((f, i) =>
                    tone({ type: 'triangle', f0: f, start: 2.0 + i * 0.07, dur: 1.0, vol: 0.045, attack: 0.01 })
                );
                break;

            case 'notify':
                tone({ type: 'triangle', f0: 660, dur: 0.12, vol: 0.04 });
                tone({ type: 'triangle', f0: 990, dur: 0.14, vol: 0.04, start: 0.07 });
                break;

            case 'toggle':
                tone({ f0: 440, f1: 660, dur: 0.1, vol: 0.05 });
                break;

            case 'open':
                tone({ f0: 300, f1: 900, dur: 0.2, vol: 0.04 });
                noise({ dur: 0.25, vol: 0.05, f0: 800, f1: 4000, q: 0.8, peak: 0.5 });
                break;

            default:
                tone({ f0: 760, f1: 420, dur: 0.07, vol: 0.04 });
        }
    }

    /* =====================================================
       LINK START — 3D WARP TUNNEL
       ===================================================== */
    function playLinkStartWarpCanvas(durationMs = 2600) {
        const canvas = document.getElementById('link-warp-canvas');
        if (!canvas || reduceMotion()) return;
        const ctx = canvas.getContext('2d');

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = window.innerWidth;
        const H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cx = W / 2;
        const cy = H / 2;
        const maxR = Math.hypot(cx, cy);
        const K = 0.1; // perspective constant: screen radius = R * K / z

        const palette = [
            [0, 217, 255], [125, 211, 252], [248, 250, 252],
            [59, 130, 246], [167, 139, 250], [34, 211, 238]
        ];

        const spawn = (initial) => {
            const a = Math.random() * Math.PI * 2;
            return {
                cos: Math.cos(a),
                sin: Math.sin(a),
                R: maxR * (0.06 + Math.pow(Math.random(), 0.7)),
                z: initial ? 0.08 + Math.random() * 0.92 : 0.85 + Math.random() * 0.15,
                c: palette[(Math.random() * palette.length) | 0]
            };
        };

        const stars = Array.from({ length: W < 700 ? 240 : 520 }, () => spawn(true));
        const start = performance.now();
        let last = start;

        function frame(now) {
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            const t = Math.min((now - start) / durationMs, 1);

            // acceleration curve: lazy drift -> hard ramp (feels like engines spooling up)
            const speed = 0.12 + 3.4 * Math.pow(t, 2.4);
            const fadeIn = Math.min(1, t * 6);

            // trail persistence: longer smear as speed climbs
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = `rgba(3, 6, 14, ${0.34 - 0.18 * t})`;
            ctx.fillRect(0, 0, W, H);

            // camera: slow roll + shake that builds toward breakthrough
            const shake = Math.pow(t, 3) * 7;
            ctx.save();
            ctx.translate(cx + (Math.random() - 0.5) * shake, cy + (Math.random() - 0.5) * shake);
            ctx.rotate(Math.pow(t, 3) * 0.32);
            ctx.translate(-cx, -cy);
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'round';

            for (const s of stars) {
                s.z -= speed * dt;
                let r = (s.R * K) / s.z;
                if (s.z <= 0.02 || r > maxR * 1.2) {
                    Object.assign(s, spawn(false));
                    r = (s.R * K) / s.z;
                }

                const zTail = Math.min(1.3, s.z + speed * 0.07 + 0.008);
                const rTail = (s.R * K) / zTail;

                const x1 = cx + s.cos * rTail;
                const y1 = cy + s.sin * rTail;
                const x2 = cx + s.cos * r;
                const y2 = cy + s.sin * r;

                const a = fadeIn * clamp((1 - s.z) * 1.8, 0.12, 1);
                const lw = 0.6 + (1 - s.z) * 2.2 * (0.6 + 0.8 * t);
                const [cr, cg, cb] = s.c;

                // chromatic fringe on outer, fast streaks
                if (t > 0.3 && r > maxR * 0.3) {
                    const o = (r / maxR) * 4 * t;
                    ctx.lineWidth = lw;
                    ctx.strokeStyle = `rgba(255, 60, 120, ${(a * 0.33).toFixed(3)})`;
                    ctx.beginPath();
                    ctx.moveTo(x1 + s.cos * o, y1 + s.sin * o);
                    ctx.lineTo(x2 + s.cos * o, y2 + s.sin * o);
                    ctx.stroke();
                    ctx.strokeStyle = `rgba(60, 110, 255, ${(a * 0.33).toFixed(3)})`;
                    ctx.beginPath();
                    ctx.moveTo(x1 - s.cos * o, y1 - s.sin * o);
                    ctx.lineTo(x2 - s.cos * o, y2 - s.sin * o);
                    ctx.stroke();
                }

                ctx.lineWidth = lw;
                ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${a.toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            // light at the end of the tunnel
            const coreR = maxR * (0.08 + 0.9 * Math.pow(t, 3));
            const coreA = 0.2 + 0.75 * Math.pow(t, 3);
            const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
            core.addColorStop(0, `rgba(255, 255, 255, ${coreA})`);
            core.addColorStop(0.35, `rgba(0, 217, 255, ${coreA * 0.55})`);
            core.addColorStop(1, 'rgba(0, 217, 255, 0)');
            ctx.fillStyle = core;
            ctx.fillRect(0, 0, W, H);
            ctx.restore();

            // rotating HUD arcs (fade out as speed takes over)
            const ringAlpha = Math.max(0, 1 - Math.pow(t, 1.6)) * 0.85;
            if (ringAlpha > 0.01) {
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.translate(cx, cy);
                ctx.rotate(t * Math.PI * 1.6);
                ctx.strokeStyle = `rgba(0, 217, 255, ${ringAlpha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, Math.min(W, H) * 0.24, 0, Math.PI * 1.35);
                ctx.stroke();

                ctx.rotate(-t * Math.PI * 3.1);
                ctx.strokeStyle = `rgba(59, 130, 246, ${ringAlpha})`;
                ctx.lineWidth = 2;
                ctx.setLineDash([12, 8]);
                ctx.beginPath();
                ctx.arc(0, 0, Math.min(W, H) * 0.17, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.clearRect(0, 0, W, H);
            }
        }

        requestAnimationFrame(frame);
    }

    /* =====================================================
       AMBIENT PARTICLES (3 depth layers, parallax, cursor repel)
       ===================================================== */
    function initParticles() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const reduced = reduceMotion();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        let w = 0;
        let h = 0;
        const resize = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        const count = reduced ? 18 : Math.min(70, Math.floor(w / 20));
        const make = () => {
            const d = Math.random() * 0.8 + 0.2; // depth: bigger/faster = closer
            return {
                x: Math.random() * w, y: Math.random() * h, d,
                r: 0.5 + d * 1.8,
                vx: (Math.random() - 0.5) * 0.25 * d,
                vy: -(0.08 + d * 0.45),
                a: 0.2 + d * 0.5,
                ph: Math.random() * Math.PI * 2,
                px: 0, py: 0
            };
        };
        const ps = Array.from({ length: count }, make);

        let mx = 0, my = 0, smx = 0, smy = 0;
        const pointer = { x: -999, y: -999 };

        window.addEventListener('pointermove', (e) => {
            if (e.pointerType && e.pointerType !== 'mouse') return;
            pointer.x = e.clientX;
            pointer.y = e.clientY;
            mx = e.clientX / w - 0.5;
            my = e.clientY / h - 0.5;
        }, { passive: true });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 120);
        });

        let raf = 0;
        let last = performance.now();

        function render(now) {
            const dt = Math.min((now - last) / 16.67, 3);
            last = now;
            smx += (mx - smx) * 0.04;
            smy += (my - smy) * 0.04;
            ctx.clearRect(0, 0, w, h);

            for (const p of ps) {
                p.ph += 0.02 * dt;

                const dx = p.x - pointer.x;
                const dy = p.y - pointer.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < 14400) {
                    const dist = Math.sqrt(d2) || 1;
                    const f = (1 - dist / 120) * 0.9 * p.d;
                    p.px += (dx / dist) * f;
                    p.py += (dy / dist) * f;
                }
                p.px *= 0.93;
                p.py *= 0.93;

                p.x += (p.vx + p.px) * dt;
                p.y += (p.vy + p.py) * dt;

                if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;

                const x = p.x - smx * p.d * 40;
                const y = p.y - smy * p.d * 40;
                const tw = 0.65 + 0.35 * Math.sin(p.ph);

                ctx.beginPath();
                ctx.arc(x, y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 217, 255, ${(p.a * tw).toFixed(3)})`;
                ctx.fill();

                if (p.d > 0.75) {
                    ctx.beginPath();
                    ctx.arc(x, y, p.r * 3.2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(0, 217, 255, ${(p.a * tw * 0.12).toFixed(3)})`;
                    ctx.fill();
                }
            }

            raf = reduced ? 0 : requestAnimationFrame(render);
        }

        raf = requestAnimationFrame(render);

        // don't burn battery in background tabs
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(raf);
                raf = 0;
            } else if (!reduced && !raf) {
                last = performance.now();
                raf = requestAnimationFrame(render);
            }
        });
    }

    /* =====================================================
       TEXT DECODE (section titles)
       ===================================================== */
    const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/';

    function scrambleText(el, duration = 800) {
        if (!el || el.dataset.scrambled || reduceMotion()) return;
        el.dataset.scrambled = '1';

        const text = el.textContent;
        el.setAttribute('aria-label', text);
        el.textContent = '';

        // Each letter keeps its final width while scrambling, so the layout never jumps.
        const chars = [];
        text.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
                el.appendChild(document.createTextNode(' '));
                return;
            }
            const word = document.createElement('span');
            word.className = 'sc-word';
            word.setAttribute('aria-hidden', 'true');
            [...part].forEach((ch) => {
                const span = document.createElement('span');
                span.className = 'sc-char';
                span.textContent = ch;
                word.appendChild(span);
                chars.push({ el: span, ch });
            });
            el.appendChild(word);
        });

        const widths = chars.map((c) => c.el.getBoundingClientRect().width);
        chars.forEach((c, i) => { c.el.style.width = `${widths[i]}px`; });

        const startTime = performance.now();
        const n = chars.length;

        function step(now) {
            const p = Math.min((now - startTime) / duration, 1);
            const locked = Math.floor((1 - Math.pow(1 - p, 3)) * n);
            chars.forEach((c, i) => {
                c.el.textContent = i < locked
                    ? c.ch
                    : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
            });
            if (p < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = text;
                el.removeAttribute('aria-label');
            }
        }
        requestAnimationFrame(step);
    }

    /* =====================================================
       SCROLL REVEAL (batched stagger)
       ===================================================== */
    function initScrollReveal() {
        const items = Array.from(document.querySelectorAll('.reveal-item'));

        // charge-up order for skill chips / meters
        document.querySelectorAll('.skill-category-card').forEach((card) => {
            card.querySelectorAll('.skill-chip').forEach((chip, i) => chip.style.setProperty('--m', i));
        });

        const finalize = (el) => {
            el.classList.remove('reveal-item'); // hand control back to normal hover transitions
            el.style.transitionDelay = '';
        };

        if (!('IntersectionObserver' in window) || reduceMotion()) {
            items.forEach((el) => {
                el.classList.add('revealed');
                finalize(el);
            });
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                // items entering together are staggered in reading order
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) =>
                        a.boundingClientRect.top - b.boundingClientRect.top ||
                        a.boundingClientRect.left - b.boundingClientRect.left);

                visible.forEach((entry, i) => {
                    const el = entry.target;
                    observer.unobserve(el);

                    const delay = Math.min(i, 8) * 90;
                    el.style.transitionDelay = `${delay}ms`;
                    requestAnimationFrame(() => el.classList.add('revealed'));

                    const title = el.matches('.section-header') ? el.querySelector('.section-title') : null;
                    if (title) setTimeout(() => scrambleText(title, 800), delay + 200);

                    setTimeout(() => finalize(el), delay + 1300);
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
        );

        items.forEach((el) => observer.observe(el));
    }

    /* =====================================================
       INTERACTIVE MOTION: spotlight, tilt, magnetic, ripple, parallax, scroll progress
       ===================================================== */
    function initMotion() {
        initScrollFX();
        initRipples();
        if (reduceMotion()) return;
        initPointerMotion();
    }

    function initScrollFX() {
        const hud = document.querySelector('.top-hud');
        if (!hud) return;

        const bar = document.createElement('div');
        bar.className = 'scroll-progress';
        bar.setAttribute('aria-hidden', 'true');
        bar.innerHTML = '<span></span>';
        hud.appendChild(bar);
        const fill = bar.firstElementChild;

        let ticking = false;
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
            fill.style.transform = `scaleX(${p})`;
            hud.classList.toggle('scrolled', window.scrollY > 24);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });
        update();
    }

    function initRipples() {
        const SEL = '.rpg-btn, .hud-ctrl-btn, .hud-icon-btn';
        document.addEventListener('pointerdown', (e) => {
            const btn = e.target.closest && e.target.closest(SEL);
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            const d = Math.max(rect.width, rect.height) * 2.2;
            const ripple = document.createElement('span');
            ripple.className = 'fx-ripple';
            ripple.style.cssText =
                `width:${d}px;height:${d}px;left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px`;
            btn.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    }

    function initPointerMotion() {
        const TILT_SEL = '.quest-card, .achievement-card, .holo-frame';
        const MAG_SEL = '.rpg-btn:not(.full-width), .hud-ctrl-btn, .link-start-btn, .back-to-top-btn';

        const tilts = new Map();
        const mags = new Map();
        const par = { x: 0, y: 0, tx: 0, ty: 0 };

        const gridEl = document.querySelector('.digital-grid-bg');
        const ringOuter = document.querySelector('.outer-ring');
        const ringInner = document.querySelector('.inner-ring');

        let raf = 0;

        function loop() {
            let active = false;

            tilts.forEach((st, el) => {
                st.rx += (st.trx - st.rx) * 0.14;
                st.ry += (st.try - st.ry) * 0.14;
                st.s += (st.ts - st.s) * 0.14;
                el.style.transform =
                    `perspective(900px) rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg) scale(${st.s.toFixed(4)})`;
                if (st.released && Math.abs(st.rx) < 0.02 && Math.abs(st.ry) < 0.02 && Math.abs(st.s - 1) < 0.0005) {
                    el.style.transform = '';
                    el.classList.remove('is-tilting');
                    tilts.delete(el);
                } else {
                    active = true;
                }
            });

            mags.forEach((st, el) => {
                st.x += (st.tx - st.x) * 0.18;
                st.y += (st.ty - st.y) * 0.18;
                el.style.translate = `${st.x.toFixed(2)}px ${st.y.toFixed(2)}px`;
                if (st.released && Math.abs(st.x) < 0.05 && Math.abs(st.y) < 0.05) {
                    el.style.translate = '';
                    mags.delete(el);
                } else {
                    active = true;
                }
            });

            par.x += (par.tx - par.x) * 0.06;
            par.y += (par.ty - par.y) * 0.06;
            if (gridEl) gridEl.style.translate = `${(-par.x * 16).toFixed(2)}px ${(-par.y * 12).toFixed(2)}px`;
            if (ringOuter) ringOuter.style.translate = `${(par.x * 10).toFixed(2)}px ${(par.y * 10).toFixed(2)}px`;
            if (ringInner) ringInner.style.translate = `${(par.x * -7).toFixed(2)}px ${(par.y * -7).toFixed(2)}px`;
            if (Math.abs(par.tx - par.x) > 0.001 || Math.abs(par.ty - par.y) > 0.001) active = true;

            raf = active ? requestAnimationFrame(loop) : 0;
        }

        const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

        function releaseAll() {
            tilts.forEach((st) => { st.released = true; st.trx = 0; st.try = 0; st.ts = 1; });
            mags.forEach((st) => { st.released = true; st.tx = 0; st.ty = 0; });
            par.tx = 0;
            par.ty = 0;
            kick();
        }

        document.addEventListener('pointermove', (e) => {
            if (e.pointerType && e.pointerType !== 'mouse') return;
            const target = e.target;
            if (!target || !target.closest) return;

            // spotlight follows the cursor inside any panel
            const panel = target.closest('.holo-panel');
            if (panel) {
                const r = panel.getBoundingClientRect();
                panel.style.setProperty('--mx', `${e.clientX - r.left}px`);
                panel.style.setProperty('--my', `${e.clientY - r.top}px`);
            }

            // 3D tilt
            const tiltEl = target.closest(TILT_SEL);
            tilts.forEach((st, el) => {
                if (el !== tiltEl && !st.released) { st.released = true; st.trx = 0; st.try = 0; st.ts = 1; }
            });
            if (tiltEl) {
                let st = tilts.get(tiltEl);
                if (!st) {
                    st = { rx: 0, ry: 0, trx: 0, try: 0, s: 1, ts: 1, released: false };
                    tilts.set(tiltEl, st);
                    tiltEl.classList.add('is-tilting');
                }
                const r = tiltEl.getBoundingClientRect();
                const nx = (e.clientX - r.left) / r.width - 0.5;
                const ny = (e.clientY - r.top) / r.height - 0.5;
                const isAvatar = tiltEl.matches('.holo-frame');
                const max = isAvatar ? 10 : 6;
                st.released = false;
                st.trx = -ny * max;
                st.try = nx * max;
                st.ts = isAvatar ? 1.02 : 1.015;
            }

            // magnetic pull
            const magEl = target.closest(MAG_SEL);
            mags.forEach((st, el) => {
                if (el !== magEl && !st.released) { st.released = true; st.tx = 0; st.ty = 0; }
            });
            if (magEl) {
                let st = mags.get(magEl);
                if (!st) {
                    st = { x: 0, y: 0, tx: 0, ty: 0, released: false };
                    mags.set(magEl, st);
                }
                const r = magEl.getBoundingClientRect();
                st.released = false;
                st.tx = clamp((e.clientX - (r.left + r.width / 2)) * 0.28, -10, 10);
                st.ty = clamp((e.clientY - (r.top + r.height / 2)) * 0.35, -8, 8);
            }

            // hero parallax
            par.tx = (e.clientX / window.innerWidth) * 2 - 1;
            par.ty = (e.clientY / window.innerHeight) * 2 - 1;

            kick();
        }, { passive: true });

        document.documentElement.addEventListener('mouseleave', releaseAll);
    }

    return {
        initParticles,
        initScrollReveal,
        initMotion,
        scrambleText,
        setupAudioAutoUnlock,
        setAudioEnabled,
        isAudioEnabled,
        playTone,
        playLinkStartWarpCanvas
    };
})();