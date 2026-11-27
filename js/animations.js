/**
 * REIN ONLINE — Visual Effects, Ambient Particles, Web Audio Synth
 * & Link Start Radial Warp Canvas
 */
const ReinFX = (() => {
    let audioEnabled = true;
    let audioCtx = null;

    function initAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
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

    function playTone(type = 'click') {
        if (!audioEnabled) return;
        initAudioContext();
        if (!audioCtx || audioCtx.state !== 'running') return;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'boot') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            osc.start(now);
            osc.stop(now + 0.09);
        } else if (type === 'linkStart') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(1180, now + 0.85);
            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
            osc.start(now);
            osc.stop(now + 0.95);
        } else if (type === 'notify') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(660, now);
            osc.frequency.setValueAtTime(990, now + 0.07);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            osc.start(now);
            osc.stop(now + 0.16);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(760, now);
            osc.frequency.exponentialRampToValueAtTime(420, now + 0.06);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
            osc.start(now);
            osc.stop(now + 0.07);
        }
    }

    /* Link Start Radial Warp Streaks & Circular HUD Canvas */
    function playLinkStartWarpCanvas(durationMs = 1500) {
        const canvas = document.getElementById('link-warp-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const cx = width / 2;
        const cy = height / 2;
        const maxRadius = Math.hypot(cx, cy);

        const palette = [
            '#00D9FF',
            '#3B82F6',
            '#8B5CF6',
            '#22D3EE',
            '#F8FAFC',
            '#38BDF8'
        ];

        const rays = Array.from({ length: 44 }, (_, i) => {
            const angle = (Math.PI * 2 * i) / 44 + (Math.random() - 0.5) * 0.08;
            return {
                angle,
                width: Math.random() * 6 + 2.5,
                startDist: Math.random() * 35 + 10,
                color: palette[i % palette.length],
                delay: Math.random() * 0.18
            };
        });

        const startTime = performance.now();

        function drawFrame(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / durationMs, 1);

            ctx.clearRect(0, 0, width, height);

            // Initial bright surge flash
            if (t < 0.22) {
                const flashAlpha = (1 - t / 0.22) * 0.72;
                ctx.fillStyle = `rgba(248, 250, 252, ${flashAlpha})`;
                ctx.fillRect(0, 0, width, height);
            }

            // Radial speed streaks bursting outward from center
            for (const ray of rays) {
                const localT = Math.max(0, (t - ray.delay) / (1 - ray.delay));
                if (localT <= 0) continue;

                const eased = 1 - Math.pow(1 - Math.min(localT * 1.25, 1), 3);
                const innerR = ray.startDist + eased * maxRadius * 0.35;
                const outerR = Math.min(maxRadius * 1.15, innerR + 60 + eased * maxRadius * 0.85);

                const x1 = cx + Math.cos(ray.angle) * innerR;
                const y1 = cy + Math.sin(ray.angle) * innerR;
                const x2 = cx + Math.cos(ray.angle) * outerR;
                const y2 = cy + Math.sin(ray.angle) * outerR;

                ctx.save();
                ctx.strokeStyle = ray.color;
                ctx.globalAlpha = Math.max(0, (1 - Math.pow(t, 2.2)) * 0.92);
                ctx.lineWidth = ray.width * (0.5 + eased * 1.3);
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.restore();
            }

            // Rotating sci-fi circular HUD arcs
            ctx.save();
            ctx.translate(cx, cy);
            const ringAlpha = Math.max(0, 1 - Math.pow(t, 1.8)) * 0.85;

            ctx.rotate(t * Math.PI * 1.6);
            ctx.strokeStyle = `rgba(0, 217, 255, ${ringAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(width, height) * 0.24, 0, Math.PI * 1.35);
            ctx.stroke();

            ctx.rotate(-t * Math.PI * 3.1);
            ctx.strokeStyle = `rgba(59, 130, 246, ${ringAlpha})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([12, 8]);
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(width, height) * 0.17, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();

            if (t < 1) {
                requestAnimationFrame(drawFrame);
            } else {
                ctx.clearRect(0, 0, width, height);
            }
        }

        requestAnimationFrame(drawFrame);
    }

    /* Ambient Cyan Particle Field */
    function initParticles() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const particleCount = prefersReduced ? 15 : Math.min(55, Math.floor(width / 24));

        const particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 2 + 0.8,
            vx: (Math.random() - 0.5) * 0.35,
            vy: -Math.random() * 0.45 - 0.15,
            alpha: Math.random() * 0.55 + 0.2
        }));

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        function render() {
            ctx.clearRect(0, 0, width, height);

            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;

                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 217, 255, ${p.alpha})`;
                ctx.fill();
            }

            if (!prefersReduced) {
                requestAnimationFrame(render);
            }
        }

        render();
    }

    /* IntersectionObserver Scroll Reveal */
    function initScrollReveal() {
        const items = document.querySelectorAll('.reveal-item');
        if (!('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('revealed'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        items.forEach((el) => observer.observe(el));
    }

    return {
        initParticles,
        initScrollReveal,
        setupAudioAutoUnlock,
        setAudioEnabled,
        isAudioEnabled,
        playTone,
        playLinkStartWarpCanvas
    };
})();