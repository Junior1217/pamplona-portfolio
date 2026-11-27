/**
 * REIN ONLINE — ATS-Friendly Resume PDF Generator
 * Uses verified personal data only (no fabricated experience or awards).
 * Editable configuration object at the top for easy future updates.
 */
const ReinResume = (() => {
    const resumeConfig = {
        fullName: 'JOHN REIN M. PAMPLONA',
        title: 'BSIT Student | Aspiring Software Developer | Aspiring Network Engineer',
        location: 'Calamba City, Laguna, Philippines',
        email: 'johnreinpamplona12@gmail.com',
        phone: '09359386414',
        facebook: 'https://www.facebook.com/pamplona.johnrein',
        summary:
            '3rd Year Bachelor of Science in Information Technology (BSIT) student at City College of Calamba with a strong foundation in Software Development Principles, Database Management, Cybersecurity Fundamentals, Networking Fundamentals, AI Skills, and Modern Web Architectures. Dedicated to writing clean code, building responsive web applications, and developing reliable network solutions.',
        education: {
            degree: 'Bachelor of Science in Information Technology (BSIT)',
            school: 'City College of Calamba',
            status: '3rd Year College Student'
        },
        technicalSkills: [
            'Programming Languages: C, C++, Java, Python, PHP, JavaScript',
            'Frontend Development: HTML, CSS, JavaScript, React',
            'Backend Development: PHP, Node.js',
            'Database: MySQL, Firebase',
            'UI/UX Design: Figma, Canva, Photoshop',
            'Development & Build Tools: VS Code, Vite, XAMPP',
            'Version Control & Hosting: Git, GitHub, Vercel, GitHub Pages',
            'Networking Tools: Cisco Packet Tracer'
        ],
        softSkills:
            'Communication, Problem-Solving, Critical Thinking, Teamwork, Time Management, Adaptability, Willingness to Learn',
        projects: [
            {
                name: 'BrewBound',
                tech: 'React with Vite, Node.js, Tailwind CSS, CSS, JavaScript, GitHub, Vercel',
                desc: 'A web-based navigation and information management system for selected barangays in Calamba City (Barangays 1-7).',
                link: 'https://brewbound-final.vercel.app/'
            },
            {
                name: 'Task Monitoring System',
                tech: 'HTML, CSS, JavaScript',
                desc: 'A web-based productivity application designed to efficiently track, manage, and monitor pending and completed daily tasks.',
                link: 'https://junior1217.github.io/task_monitoring/'
            },
            {
                name: 'Password Validation Tool',
                tech: 'HTML, CSS, JavaScript',
                desc: 'An interactive security assessment tool for signup forms that dynamically evaluates password strength in real time.',
                link: 'https://junior1217.github.io/form/'
            },
            {
                name: 'Escapar',
                tech: 'Figma',
                desc: 'A prototype of a mobile application ordering system designed for a coffee shop.',
                link: 'https://tinyurl.com/escapar-shop'
            }
        ],
        certifications: [
            'Certificate of Participation - Figma for Talents and Local Businesses | Department of Computing and Informatics, City College of Calamba (March 14, 2026)',
            'Certificate of Course Completion - Introduction to Cybersecurity | Cisco Networking Academy (July 26, 2026)'
        ]
    };

    function init() {
        const btn = document.getElementById('download-resume-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            ReinFX.playTone('click');
            generatePDF();
        });
    }

    function generatePDF() {
        // Fallback to static PDF if jsPDF CDN is offline
        if (!window.jspdf || !window.jspdf.jsPDF) {
            window.open('assets/images/resume/Resume.pdf', '_blank', 'noopener,noreferrer');
            ReinNav.showSystemToast('OPENING STATIC RESUME PDF.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'pt', format: 'letter' });

        const margin = 48;
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - margin * 2;
        let y = 52;

        const addSectionHeading = (title) => {
            if (y > 700) {
                doc.addPage();
                y = 52;
            }
            y += 10;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(15, 23, 42);
            doc.text(title, margin, y);
            y += 4;
            doc.setDrawColor(100, 116, 139);
            doc.setLineWidth(0.75);
            doc.line(margin, y, pageWidth - margin, y);
            y += 14;
        };

        const addWrappedText = (text, fontSize = 9.5, isBold = false) => {
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            doc.setFontSize(fontSize);
            doc.setTextColor(30, 41, 59);
            const lines = doc.splitTextToSize(text, contentWidth);
            for (const line of lines) {
                if (y > 735) {
                    doc.addPage();
                    y = 52;
                }
                doc.text(line, margin, y);
                y += fontSize + 4;
            }
        };

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.text(resumeConfig.fullName, margin, y);
        y += 16;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.text(resumeConfig.title, margin, y);
        y += 14;

        doc.setFontSize(9);
        doc.text(
            `${resumeConfig.location} | ${resumeConfig.email} | ${resumeConfig.phone}`,
            margin,
            y
        );
        y += 12;
        doc.text(`Facebook: ${resumeConfig.facebook}`, margin, y);
        y += 8;

        // Professional Summary
        addSectionHeading('PROFESSIONAL SUMMARY');
        addWrappedText(resumeConfig.summary);

        // Education
        addSectionHeading('EDUCATION');
        addWrappedText(
            `${resumeConfig.education.degree} — ${resumeConfig.education.school} (${resumeConfig.education.status})`,
            9.5,
            true
        );

        // Technical Skills
        addSectionHeading('TECHNICAL SKILLS');
        resumeConfig.technicalSkills.forEach((skillLine) => {
            addWrappedText(`• ${skillLine}`);
        });

        // Projects
        addSectionHeading('PROJECTS');
        resumeConfig.projects.forEach((proj) => {
            addWrappedText(`${proj.name} (${proj.tech})`, 9.5, true);
            addWrappedText(`${proj.desc} | Link: ${proj.link}`);
            y += 2;
        });

        // Certifications
        addSectionHeading('CERTIFICATIONS');
        resumeConfig.certifications.forEach((cert) => {
            addWrappedText(`• ${cert}`);
        });

        // Soft Skills
        addSectionHeading('SOFT SKILLS');
        addWrappedText(resumeConfig.softSkills);

        doc.save('John_Rein_Pamplona_Resume.pdf');
        ReinNav.showSystemToast('PLAYER DATA EXPORTED (PDF).');
    }

    return { init };
})();