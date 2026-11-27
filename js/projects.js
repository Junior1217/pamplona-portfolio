/**
 * REIN ONLINE — Portfolio Data Registry (Skills, Quests, Achievements)
 * Uses normalized forward-slash paths matching assets/images/...
 */
const ReinData = (() => {
    const skillCategories = [
        {
            category: 'PROGRAMMING LANGUAGES',
            tier: 'CORE SYNTAX',
            skills: [
                { name: 'C', detail: 'Structured procedural programming, memory fundamentals, and algorithmic problem solving.' },
                { name: 'C++', detail: 'Object-oriented programming concepts, data structures, and logic implementation.' },
                { name: 'Java', detail: 'Object-oriented software architecture, class design, and desktop/academic applications.' },
                { name: 'Python', detail: 'Scripting, automation, data processing, and foundational AI/machine learning workflows.' },
                { name: 'PHP', detail: 'Server-side web scripting, form processing, and relational database connectivity.' },
                { name: 'JavaScript', detail: 'Interactive DOM manipulation, asynchronous logic, and modern client-side web applications.' }
            ]
        },
        {
            category: 'FRONTEND DEVELOPMENT',
            tier: 'INTERFACE CRAFT',
            skills: [
                { name: 'HTML', detail: 'Semantic HTML5 document architecture, accessibility landmarks, and structured layouts.' },
                { name: 'CSS', detail: 'Responsive Grid/Flexbox layouts, custom properties, keyframe animations, and modern UI styling.' },
                { name: 'JavaScript', detail: 'ES6+ modular frontend logic, state management, and event-driven user interfaces.' },
                { name: 'React', detail: 'Component-based web application development paired with Vite for fast builds.' }
            ]
        },
        {
            category: 'BACKEND DEVELOPMENT',
            tier: 'SERVER LOGIC',
            skills: [
                { name: 'PHP', detail: 'Backend request handling, authentication flows, and server-side business logic.' },
                { name: 'Node.js', detail: 'JavaScript runtime environment for modern web tooling, APIs, and development workflows.' }
            ]
        },
        {
            category: 'DATABASE',
            tier: 'DATA STORAGE',
            skills: [
                { name: 'MySQL', detail: 'Relational schema design, SQL queries, normalization, and structured data persistence.' },
                { name: 'Firebase', detail: 'Cloud-hosted NoSQL database and real-time backend services for web applications.' }
            ]
        },
        {
            category: 'UI/UX DESIGN',
            tier: 'VISUAL DESIGN',
            skills: [
                { name: 'Figma', detail: 'Interactive wireframing, mobile app prototyping, and collaborative interface design systems.' },
                { name: 'Canva', detail: 'Rapid visual layout creation, presentations, and graphic communication assets.' },
                { name: 'Photoshop', detail: 'Image editing, digital compositing, and custom visual asset preparation.' }
            ]
        },
        {
            category: 'DEV ENVIRONMENT / BUILD TOOLS',
            tier: 'WORKFLOW ENGINE',
            skills: [
                { name: 'VS Code', detail: 'Primary integrated development environment with debugging and extension workflows.' },
                { name: 'Vite', detail: 'Next-generation frontend build tool and local development server.' },
                { name: 'XAMPP', detail: 'Local Apache and MySQL server stack for testing PHP and database applications.' }
            ]
        },
        {
            category: 'VERSION CONTROL & HOSTING',
            tier: 'DEPLOYMENT',
            skills: [
                { name: 'Git', detail: 'Distributed source code tracking, branching, and collaborative commit management.' },
                { name: 'GitHub', detail: 'Remote repository hosting, team collaboration, and project documentation.' },
                { name: 'Vercel', detail: 'Continuous cloud deployment for modern frontend web applications.' },
                { name: 'GitHub Pages', detail: 'Static site hosting directly from GitHub repositories.' }
            ]
        },
        {
            category: 'NETWORKING TOOLS',
            tier: 'INFRASTRUCTURE',
            skills: [
                { name: 'Cisco Packet Tracer', detail: 'Network topology simulation, router/switch configuration, VLANs, and connectivity testing.' }
            ]
        },
        {
            category: 'SOFT SKILLS',
            tier: 'PLAYER TRAITS',
            skills: [
                { name: 'Communication', detail: 'Clear articulation of technical ideas across team members and stakeholders.' },
                { name: 'Problem-Solving', detail: 'Analytical troubleshooting and structured debugging under project constraints.' },
                { name: 'Critical Thinking', detail: 'Evaluating system trade-offs and designing reliable, logical solutions.' },
                { name: 'Teamwork', detail: 'Collaborative development across multi-member capstone and design teams.' },
                { name: 'Time Management', detail: 'Prioritizing milestones to deliver academic and technical projects on schedule.' },
                { name: 'Adaptability', detail: 'Quickly adjusting to new frameworks, tools, and evolving project requirements.' },
                { name: 'Willingness to Learn', detail: 'Continuous self-improvement across software engineering and networking domains.' }
            ]
        }
    ];

    const projects = [
        {
            id: 'QUEST_01',
            title: 'BrewBound',
            description:
                'A web-based navigation and information management system for selected barangays in Calamba City (Barangays 1–7).',
            technologies: ['React with Vite', 'Node.js', 'Tailwind CSS', 'CSS', 'JavaScript', 'GitHub', 'Vercel'],
            team: ['John Rein M. Pamplona', 'Elvis Joshua L. Lucio', 'Eavan C. Firme'],
            image: 'assets/images/brewbound.png',
            liveUrl: 'https://brewbound-final.vercel.app/'
        },
        {
            id: 'QUEST_02',
            title: 'Task Monitoring System',
            description:
                'A web-based productivity application designed to efficiently track, manage, and monitor pending and completed daily tasks.',
            technologies: ['HTML', 'CSS', 'JavaScript'],
            team: ['John Rein M. Pamplona'],
            image: 'assets/images/taskmonitoring.png',
            liveUrl: 'https://junior1217.github.io/task_monitoring/'
        },
        {
            id: 'QUEST_03',
            title: 'Password Validation Tool',
            description:
                'An interactive security assessment tool for signup forms that dynamically evaluates password strength in real time.',
            features: [
                'Minimum of 8 characters',
                'At least one uppercase letter',
                'At least one special character',
                'At least one number',
                'Password strength assessment: Very Weak, Weak, Medium Strength, Strong, and Very Strong'
            ],
            technologies: ['HTML', 'CSS', 'JavaScript'],
            team: ['John Rein M. Pamplona'],
            image: 'assets/images/passvalidation.png',
            liveUrl: 'https://junior1217.github.io/form/'
        },
        {
            id: 'QUEST_04',
            title: 'Escapar',
            description:
                'A prototype of a mobile application ordering system designed for a coffee shop.',
            technologies: ['Figma'],
            team: [
                'James Mathew Castillo',
                'Reynalyn Cornelio',
                'John Rein Pamplona',
                'Gellian Mae Ronquillo',
                'Mariella Taming',
                'Derick Tresvalles'
            ],
            image: 'assets/images/escapar.png',
            liveUrl: 'https://tinyurl.com/escapar-shop'
        }
    ];

    const achievements = [
        {
            id: 'ACH_01',
            title: 'Certificate of Participation — Figma for Talents and Local Businesses',
            organization: 'Department of Computing and Informatics, City College of Calamba',
            date: 'March 14, 2026',
            image: 'assets/images/certificates/figma.jpg'
        },
        {
            id: 'ACH_02',
            title: 'Certificate of Course Completion — Introduction to Cybersecurity',
            organization: 'Cisco Networking Academy',
            date: 'July 26, 2026',
            image: 'assets/images/certificates/introcyb.jpg'
        },
        {
            id: 'ACH_03',
            title: 'Community-Powered Impact',
            organization: 'Verified Training Certificate',
            date: '2026',
            image: 'assets/images/certificates/community-powered-impact.jpg'
        },
        {
            id: 'ACH_04',
            title: 'Effective Speaking',
            organization: 'Verified Training Certificate',
            date: '2026',
            image: 'assets/images/certificates/effective-speaking.png'
        },
        {
            id: 'ACH_05',
            title: 'Interpersonal Skills',
            organization: 'Verified Training Certificate',
            date: '2026',
            image: 'assets/images/certificates/interpersonal-skills.png'
        },
        {
            id: 'ACH_06',
            title: 'Self-Management',
            organization: 'Verified Training Certificate',
            date: '2026',
            image: 'assets/images/certificates/self-management.png'
        }
    ];

    function renderSkills() {
        const container = document.getElementById('skills-grid');
        if (!container) return;

        container.innerHTML = skillCategories
            .map(
                (group) => `
        <article class="skill-category-card holo-panel reveal-item">
          <div class="cat-header">
            <h3 class="cat-title">${group.category}</h3>
            <span class="cat-count">[${group.skills.length} MODULES]</span>
          </div>
          <div class="skill-chips-grid">
            ${group.skills
                        .map(
                            (skill) => `
                <button
                  type="button"
                  class="skill-chip"
                  data-skill-name="${skill.name}"
                  data-skill-cat="${group.category}"
                  data-skill-tier="${group.tier}"
                  data-skill-detail="${skill.detail}"
                >
                  <div class="skill-chip-top">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-tag">EQUIPPED</span>
                  </div>
                  <div class="skill-meter-bar">
                    <div class="skill-meter-segment"></div>
                  </div>
                </button>
              `
                        )
                        .join('')}
          </div>
        </article>
      `
            )
            .join('');

        // Skill click inspector interaction
        const chips = container.querySelectorAll('.skill-chip');
        chips.forEach((chip) => {
            chip.addEventListener('click', () => {
                chips.forEach((c) => c.classList.remove('active-skill'));
                chip.classList.add('active-skill');

                document.getElementById('inspector-category').textContent = chip.dataset.skillCat;
                document.getElementById('inspector-name').textContent = chip.dataset.skillName;
                document.getElementById('inspector-detail').textContent = chip.dataset.skillDetail;
                document.getElementById('inspector-tier').textContent = `MODULE: ${chip.dataset.skillTier}`;

                ReinFX.playTone('click');
            });
        });
    }

    function renderProjects() {
        const container = document.getElementById('quests-grid');
        if (!container) return;

        container.innerHTML = projects
            .map(
                (proj, index) => `
        <article class="quest-card holo-panel reveal-item" data-project-index="${index}" tabindex="0" role="button" aria-label="Inspect Quest ${proj.title}">
          <div class="quest-thumb">
            <img src="${proj.image}" alt="${proj.title} preview" loading="lazy" />
            <span class="quest-cleared-badge">&#10003; QUEST CLEARED</span>
          </div>
          <div class="quest-body">
            <span class="quest-id">${proj.id}</span>
            <h3 class="quest-title">${proj.title}</h3>
            <p class="quest-desc">${proj.description}</p>
            <div class="quest-tech-list">
              ${proj.technologies.map((tech) => `<span class="tech-pill">${tech}</span>`).join('')}
            </div>
            <div class="quest-footer">
              <span class="quest-party">PARTY: ${proj.team.length} ${proj.team.length > 1 ? 'MEMBERS' : 'SOLO'}</span>
              <span class="rpg-btn secondary-btn" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">[ VIEW QUEST ]</span>
            </div>
          </div>
        </article>
      `
            )
            .join('');

        container.querySelectorAll('.quest-card').forEach((card) => {
            const openHandler = () => {
                const idx = Number(card.dataset.projectIndex);
                openProjectModal(projects[idx]);
            };
            card.addEventListener('click', openHandler);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openHandler();
                }
            });
        });
    }

    function renderAchievements() {
        const container = document.getElementById('achievements-grid');
        if (!container) return;

        container.innerHTML = achievements
            .map(
                (ach, index) => `
        <article class="achievement-card holo-panel reveal-item" data-ach-index="${index}" tabindex="0" role="button" aria-label="Inspect Achievement ${ach.title}">
          <div class="ach-top">
            <div class="ach-icon">&#9733;</div>
            <div class="ach-meta">
              <span class="ach-unlocked">[ ACHIEVEMENT UNLOCKED ]</span>
              <h3 class="ach-title">${ach.title}</h3>
              <p class="ach-org">${ach.organization}</p>
              <p class="ach-date">DATE RECEIVED: ${ach.date}</p>
            </div>
          </div>
          <div class="ach-preview-box">
            <img src="${ach.image}" alt="${ach.title}" loading="lazy" />
          </div>
        </article>
      `
            )
            .join('');

        container.querySelectorAll('.achievement-card').forEach((card) => {
            const openHandler = () => {
                const idx = Number(card.dataset.achIndex);
                openAchievementModal(achievements[idx]);
            };
            card.addEventListener('click', openHandler);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openHandler();
                }
            });
        });
    }

    function openProjectModal(project) {
        if (!project) return;
        const featuresHtml = project.features
            ? `
        <div class="modal-section-label">KEY SYSTEM FEATURES</div>
        <ul style="padding-left: 1.25rem; color: var(--text-secondary); margin-bottom: 1rem;">
          ${project.features.map((f) => `<li>${f}</li>`).join('')}
        </ul>
      `
            : '';

        const html = `
      <img src="${project.image}" alt="${project.title}" class="modal-preview-img" />
      <h3 class="modal-title">${project.title}</h3>
      <p style="color: var(--text-secondary); margin-bottom: 1rem;">${project.description}</p>
      ${featuresHtml}
      <div class="modal-section-label">TECHNOLOGIES EQUIPPED</div>
      <div class="quest-tech-list">
        ${project.technologies.map((t) => `<span class="tech-pill">${t}</span>`).join('')}
      </div>
      <div class="modal-section-label">PARTY / TEAM MEMBERS</div>
      <ul class="modal-team-list">
        ${project.team.map((member) => `<li>${member}</li>`).join('')}
      </ul>
      <div style="margin-top: 1.5rem;">
        <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="rpg-btn primary-btn">
          <span>[ OPEN LIVE PROJECT &nearr; ]</span>
        </a>
      </div>
    `;

        ReinInteractions.openModal(`QUEST ARCHIVE // ${project.id}`, html);
        ReinNav.showSystemToast(`QUEST DATA LOADED: ${project.title.toUpperCase()}`);
    }

    function openAchievementModal(ach) {
        if (!ach) return;
        const html = `
      <img src="${ach.image}" alt="${ach.title}" class="modal-preview-img" style="max-height: 420px; object-fit: contain; background: #05080F;" />
      <h3 class="modal-title">${ach.title}</h3>
      <div class="modal-section-label">ISSUING ORGANIZATION</div>
      <p style="color: var(--text-primary);">${ach.organization}</p>
      <div class="modal-section-label">DATE RECEIVED</div>
      <p style="color: var(--accent-primary); font-family: var(--font-hud); font-weight: 700;">${ach.date}</p>
    `;

        ReinInteractions.openModal(`ACHIEVEMENT RECORD // ${ach.id}`, html);
        ReinNav.showSystemToast('CERTIFICATE PREVIEW LOADED.');
    }

    return {
        renderSkills,
        renderProjects,
        renderAchievements,
        projects,
        achievements
    };
})();