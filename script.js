/* ═══════════════════════════════════════════════════════════════
   NAFIS NILOY — Portfolio Script
   Vanilla JS · API Integration · Animations · Theme Toggle
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Configuration ───
  const API_BASE = window.location.port === '5000'
    ? 'http://localhost:5000/api'
    : (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

  // ─── Default Data (fallback if API is offline) ───
  const DEFAULTS = {
    profile: {
      name: 'Md. Nafis Sadique Niloy',
      headline: 'Project Coordinator & Certified Product Owner',
      bioShort: 'Computer Science graduate and CSPO® managing ERP, government, and enterprise software delivery at ATI Limited — bridging business needs with engineering execution.',
      bioDetailed1: 'My core strength lies in translating business needs into detailed technical requirements, aligning cross-functional teams (Design / Engineering / QA), and ensuring predictability in product releases.',
      bioDetailed2: 'I look to leverage my skills in a Project or Product Management role to drive delivery efficiency and business value across enterprise and government clients.',
      githubUrl: 'https://github.com/Nafis588',
      linkedinUrl: 'https://www.linkedin.com/in/nafissn/',
      email: 'mdnafissadiqueniloy@gmail.com',
      location: 'Dhaka, Bangladesh',
      cvUrl: '/public/CV of Md. Nafis Sadique Niloy.pdf',
      stats: { projectsCount: 5, certsCount: 4, membersCount: 500, yearsExperience: 3 }
    },
    projects: [
      { _id: 'p1', title: 'Budget Management System', client: 'Bangladesh Navy', category: 'ATI', description: 'Led requirement elicitation and delivery coordination of budget workflow modules with engineering teams. Acted as stakeholder liaison to lock scope and manage change requests across phased rollout.', status: 'Delivered', tags: ['Scope Management', 'Backlog Tracking', 'Agile Execution'], sdlcStage: 7, order: 1 },
      { _id: 'p2', title: 'NATDOC Website (CMS)', client: 'Bangladesh Navy', category: 'ATI', description: 'On-site requirement validation, finalized SRS for content structures and approval workflows.', status: 'Delivered', tags: ['SRS', 'CMS', 'Requirement Eng.'], sdlcStage: 7, order: 2 },
      { _id: 'p3', title: 'ERP Modules (HR, Payroll)', client: 'Jamuna Oil Co.', category: 'ATI', description: 'Gap analysis and requirement detailing for HR and Payroll ERP modules.', status: 'In QA', tags: ['Gap Analysis', 'ERP', 'Timeline Tracking'], sdlcStage: 5, order: 3 },
      { _id: 'p4', title: 'University CMS Portal', client: 'Bangladesh Maritime Uni.', category: 'ATI', description: 'Coordinated full redesign, content migration, and rollout workflows.', status: 'Delivered', tags: ['Content Migration', 'CMS', 'Issue Triage'], sdlcStage: 7, order: 4 },
      { _id: 'p5', title: 'Healthcare Platform', client: 'Ghana Client', category: 'ATI', description: 'Multi-tenant platform delivery across multiple hospital systems, cross-border coordination.', status: 'In Dev', tags: ['Multi-Tenant', 'Cross-Border'], sdlcStage: 4, order: 5 },
      { _id: 'p6', title: 'USIS 3.0 Student Portal', client: 'Academic', category: 'Academic', description: 'Student portal with schedule planning and course selection optimization.', status: 'Completed', tags: ['React', 'TypeScript', 'MongoDB', 'Tailwind'], sdlcStage: 7, order: 6 },
      { _id: 'p7', title: 'BRACU OCA System', client: 'Academic', category: 'Academic', description: 'Club activity tracker and event approval workflow automation.', status: 'Completed', tags: ['Next.js', 'React', 'MongoDB'], sdlcStage: 7, order: 7 }
    ],
    experiences: [
      { _id: 'e1', role: 'Trainee Project Coordinator', company: 'ATI Limited', period: 'Jan 2026 – Present', category: 'work', status: 'Active', points: ['Coordinating delivery of ERP, government, and web platform projects.', 'Supporting BRD/SRS inputs, sprint tracking, cross-team alignment with Dev/QA/Design.', 'Assisting UAT, release readiness, and stakeholder communication.'], order: 1 },
      { _id: 'e2', role: 'Project Management Intern', company: 'ATI Limited', period: 'Oct 2025 – Dec 2025', category: 'work', status: 'Completed', points: ['Supported requirement elicitation, backlog refinement, and sprint reviews.', 'Facilitated developer follow-ups to maintain sprint goals.'], order: 2 },
      { _id: 'e3', role: 'Programming & Robotics Instructor', company: 'Octobrain / Dreamers Academy', period: 'Jun 2023 – Nov 2025', category: 'instruction', status: 'Completed', points: ['Instructed students in programming basics (Python/JavaScript) and robotics foundations.', 'Developed course materials and organized mini-competitions.'], order: 3 },
      { _id: 'e4', role: 'B.Sc. in Computer Science', company: 'BRAC University', period: 'Jun 2021 – Sep 2025', category: 'education', status: 'Completed', points: ['CGPA: 3.27/4.00', 'BUCC Presidency (Oct 2023 - Dec 2024): Led 500+ active members, directed IntraHacktive 1.0 hackathon.'], order: 4 }
    ],
    clients: [
      { name: 'Bangladesh Navy', icon: '⚓' },
      { name: 'Jamuna Oil Company', icon: '🏭' },
      { name: 'Bangladesh Maritime University', icon: '🎓' },
      { name: 'ATI Limited', icon: '💼' },
      { name: 'Ghana Healthcare Client', icon: '🏥' }
    ]
  };

  const SDLC_STAGES = ['Planning', 'Analysis', 'Design', 'Implementation', 'Testing', 'Deployment', 'Maintenance'];

  // ─── State ───
  let profile = DEFAULTS.profile;
  let projects = DEFAULTS.projects;
  let experiences = DEFAULTS.experiences;

  // ═══════════════════════════════════════════
  // API FETCHING
  // ═══════════════════════════════════════════
  async function fetchApi(url) {
    try {
      const res = await fetch(API_BASE + url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      console.warn('API offline, using defaults:', url, err.message);
      return null;
    }
  }

  async function loadData() {
    const [profData, projData, expData] = await Promise.all([
      fetchApi('/profile'),
      fetchApi('/projects'),
      fetchApi('/experiences')
    ]);

    if (profData && profData.name) profile = profData;
    if (projData && projData.length > 0) projects = projData;
    if (expData && expData.length > 0) experiences = expData;

    renderProfile();
    renderExperiences();
    renderProjects();
    renderMarquee();
  }

  // ═══════════════════════════════════════════
  // RENDER FUNCTIONS
  // ═══════════════════════════════════════════
  function renderProfile() {
    const el = (id) => document.getElementById(id);
    if (el('hero-bio')) el('hero-bio').textContent = profile.bioShort;
    if (el('about-bio-1')) el('about-bio-1').textContent = profile.bioDetailed1;
    if (el('about-bio-2')) el('about-bio-2').textContent = profile.bioDetailed2;
    if (el('contact-email')) {
      el('contact-email').textContent = profile.email;
      el('contact-email').href = 'mailto:' + profile.email;
    }
    if (el('contact-location')) el('contact-location').textContent = profile.location;

    // Update social links
    if (el('social-github')) el('social-github').href = profile.githubUrl;
    if (el('social-linkedin')) el('social-linkedin').href = profile.linkedinUrl;

    // Update stat counter targets
    const stats = profile.stats;
    const counters = document.querySelectorAll('.counter');
    const targets = [stats.projectsCount, stats.certsCount, stats.membersCount, stats.yearsExperience];
    counters.forEach((c, i) => {
      if (targets[i] !== undefined) c.dataset.target = targets[i];
    });
  }

  function renderExperiences() {
    const container = document.getElementById('experience-container');
    if (!container) return;

    const categories = [
      { key: 'work', title: '💼 Work Experience', color: 'var(--accent-primary)' },
      { key: 'instruction', title: '📚 Instruction', color: 'var(--accent-secondary)' },
      { key: 'education', title: '🎓 Education', color: '#8b5cf6' }
    ];

    let html = '';
    categories.forEach(cat => {
      const items = experiences.filter(e => e.category === cat.key);
      if (items.length === 0) return;

      html += `<h3 class="exp-category-title reveal">${cat.title}</h3>`;
      html += `<div class="timeline"><div class="timeline-line"><div class="timeline-line-progress"></div></div>`;

      items.forEach((exp, idx) => {
        const statusClass = exp.status === 'Active' ? 'active' : 'completed';
        html += `
          <div class="timeline-node ${exp.status === 'Active' ? 'active' : ''} reveal" data-delay="${idx + 1}">
            <div class="timeline-dot" style="border-color:${cat.color}"></div>
            <div class="timeline-content">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
                <div>
                  <span class="timeline-date">${exp.period}</span>
                  <h4 class="timeline-role">${exp.role}</h4>
                  <span class="timeline-company">${exp.company}</span>
                </div>
                ${exp.status ? `<span class="timeline-status ${statusClass}">${exp.status}</span>` : ''}
              </div>
              <ul class="timeline-points">
                ${exp.points.map(pt => `<li>${pt}</li>`).join('')}
              </ul>
            </div>
          </div>`;
      });

      html += `</div>`;
    });

    container.innerHTML = html;
    // Re-observe newly added elements
    observeRevealElements();
  }

  function renderProjects(filter = 'all') {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);

    grid.innerHTML = filtered.map((proj, idx) => {
      const statusClass = (proj.status === 'Delivered' || proj.status === 'Completed') ? 'delivered' : proj.status === 'In QA' ? 'in-qa' : 'in-dev';
      const stage = proj.sdlcStage || guessStage(proj.status);

      return `
        <div class="project-card reveal" data-delay="${(idx % 4) + 1}" data-category="${proj.category}">
          <div class="project-meta">
            <span class="project-client">${proj.client}</span>
            <span class="project-status ${statusClass}">${proj.status}</span>
          </div>
          <h4 class="project-title">${proj.title}</h4>
          <div class="sdlc-pipeline">
            ${SDLC_STAGES.map((s, i) => `
              <div class="pipeline-segment">
                <div class="pipeline-dot ${i < stage ? 'active' : ''}">
                  <span class="pipeline-tooltip">${s}</span>
                </div>
                ${i < SDLC_STAGES.length - 1 ? `<div class="pipeline-line ${i < stage - 1 ? 'active' : ''}"></div>` : ''}
              </div>
            `).join('')}
          </div>
          <p class="project-desc">${proj.description}</p>
          <div class="project-tags">
            ${proj.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
          </div>
        </div>`;
    }).join('');

    observeRevealElements();
  }

  function guessStage(status) {
    if (status === 'Delivered' || status === 'Completed') return 7;
    if (status === 'In QA') return 5;
    if (status === 'In Dev') return 4;
    return 3;
  }

  function renderMarquee() {
    const container = document.getElementById('marquee-content');
    if (!container) return;

    const clients = DEFAULTS.clients;
    // Duplicate items for seamless infinite scroll
    const items = [...clients, ...clients, ...clients].map(c =>
      `<div class="marquee-item"><span>${c.icon}</span> ${c.name}</div>`
    ).join('');

    container.innerHTML = items;
  }

  // ═══════════════════════════════════════════
  // THEME TOGGLE
  // ═══════════════════════════════════════════
  function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'dark'); // Default dark
    document.documentElement.setAttribute('data-theme', theme);

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // ═══════════════════════════════════════════
  // NAVBAR SCROLL EFFECTS
  // ═══════════════════════════════════════════
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

    // Glass effect on scroll
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Active section tracking
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-70px 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));

    // Mobile menu toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    menuBtn?.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      menuBtn.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
    });

    // Close mobile menu on link click
    mobileMenu?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuBtn.textContent = '☰';
      });
    });
  }

  // ═══════════════════════════════════════════
  // TYPEWRITER ANIMATION
  // ═══════════════════════════════════════════
  function initTypewriter() {
    const roles = [
      'Trainee Project Coordinator',
      'Certified Product Owner (CSPO®)',
      'Bridging Business & Engineering',
      'Agile Sprint Delivery'
    ];
    const el = document.getElementById('role-text');
    if (!el) return;

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function type() {
      const current = roles[roleIndex];

      if (!deleting) {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          setTimeout(() => { deleting = true; type(); }, 2000);
          return;
        }
        setTimeout(type, 60);
      } else {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(type, 400);
          return;
        }
        setTimeout(type, 30);
      }
    }

    setTimeout(type, 800);
  }

  // ═══════════════════════════════════════════
  // CLI TERMINAL ANIMATION
  // ═══════════════════════════════════════════
  function initTerminal() {
    const body = document.getElementById('terminal-body');
    if (!body) return;

    const commands = [
      { type: 'cmd', text: 'npm run deliver-sprint' },
      { type: 'output', text: 'Initializing sprint delivery pipeline...' },
      { type: 'output', text: 'Fetching backlog user stories from Jira... [14 stories]' },
      { type: 'output', text: 'Executing CSPO® prioritizations... [Grooming DONE]' },
      { type: 'output', text: 'Aligning Dev, QA, and UI/UX design... [Aligned]' },
      { type: 'output', text: 'Running automated integration builds... [All PASSED]' },
      { type: 'output', text: 'Starting ERP module UAT... [Passed]' },
      { type: 'output', text: 'Pushing release tag to QA server...' },
      { type: 'success', text: 'Sprint 12 successfully delivered! 🚀' }
    ];

    let lineIndex = 0;

    function renderLine() {
      if (lineIndex >= commands.length) {
        setTimeout(() => {
          body.innerHTML = '';
          lineIndex = 0;
          renderLine();
        }, 4000);
        return;
      }

      const cmd = commands[lineIndex];
      const div = document.createElement('div');
      div.style.marginBottom = '4px';

      if (cmd.type === 'cmd') {
        div.innerHTML = `<span class="cmd-prompt">~/nafis-pm$</span> <span class="cmd-text">${cmd.text}</span>`;
      } else if (cmd.type === 'success') {
        div.innerHTML = `<span class="cmd-success">${cmd.text}</span>`;
      } else {
        div.innerHTML = `<span class="cmd-output">${cmd.text}</span>`;
      }

      // Typing animation
      div.style.opacity = '0';
      body.appendChild(div);

      let charIdx = 0;
      const fullHTML = div.innerHTML;
      div.textContent = '';
      div.style.opacity = '1';

      const typeChar = () => {
        if (charIdx <= cmd.text.length) {
          if (cmd.type === 'cmd') {
            div.innerHTML = `<span class="cmd-prompt">~/nafis-pm$</span> <span class="cmd-text">${cmd.text.substring(0, charIdx)}</span><span style="animation:blink 1s step-end infinite">_</span>`;
          } else if (cmd.type === 'success') {
            div.innerHTML = `<span class="cmd-success">${cmd.text.substring(0, charIdx)}</span>`;
          } else {
            div.innerHTML = `<span class="cmd-output">${cmd.text.substring(0, charIdx)}</span>`;
          }
          charIdx++;
          setTimeout(typeChar, cmd.type === 'cmd' ? 35 : 18);
        } else {
          // Remove cursor blink after typing
          if (cmd.type === 'cmd') {
            div.innerHTML = `<span class="cmd-prompt">~/nafis-pm$</span> <span class="cmd-text">${cmd.text}</span>`;
          }
          lineIndex++;
          setTimeout(renderLine, cmd.type === 'cmd' ? 500 : 200);
        }
      };

      setTimeout(typeChar, 100);
    }

    setTimeout(renderLine, 1000);
  }

  // ═══════════════════════════════════════════
  // SCROLL REVEAL
  // ═══════════════════════════════════════════
  let revealObserver;

  function observeRevealElements() {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    }

    document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .reveal-scale:not(.visible)').forEach(el => {
      revealObserver.observe(el);
    });
  }

  // ═══════════════════════════════════════════
  // STAT COUNTERS
  // ═══════════════════════════════════════════
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target) || 0;
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  function animateCounter(el, target) {
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // ═══════════════════════════════════════════
  // PROJECT FILTERS
  // ═══════════════════════════════════════════
  function initFilters() {
    document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('filter-btn')) return;
      const filter = e.target.dataset.filter;

      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      renderProjects(filter);
    });
  }

  // ═══════════════════════════════════════════
  // CONTACT FORM
  // ═══════════════════════════════════════════
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusEl = document.getElementById('form-status');
      const submitBtn = document.getElementById('form-submit');

      const data = {
        name: document.getElementById('cf-name').value.trim(),
        email: document.getElementById('cf-email').value.trim(),
        subject: document.getElementById('cf-subject').value.trim(),
        message: document.getElementById('cf-message').value.trim()
      };

      // Validate
      let valid = true;
      ['cf-name', 'cf-email', 'cf-subject', 'cf-message'].forEach(id => {
        const input = document.getElementById(id);
        if (!input.value.trim()) {
          input.classList.add('error');
          valid = false;
        } else {
          input.classList.remove('error');
        }
      });

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        document.getElementById('cf-email').classList.add('error');
        valid = false;
      }

      if (!valid) {
        statusEl.textContent = 'Please fill in all fields with a valid email.';
        statusEl.className = 'form-status error';
        statusEl.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const res = await fetch(API_BASE + '/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();

        if (res.ok) {
          statusEl.textContent = result.message || 'Message sent! I will respond within 24 hours.';
          statusEl.className = 'form-status success';
          form.reset();
        } else {
          throw new Error(result.message || 'Failed to send message');
        }
      } catch (err) {
        statusEl.textContent = err.message || 'Error sending message. Please try again.';
        statusEl.className = 'form-status error';
      } finally {
        statusEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
      }
    });
  }

  // ═══════════════════════════════════════════
  // FOOTER YEAR
  // ═══════════════════════════════════════════
  function initFooter() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ═══════════════════════════════════════════
  // INITIALIZE EVERYTHING
  // ═══════════════════════════════════════════
  function init() {
    initTheme();
    initNavbar();
    initTypewriter();
    initTerminal();
    initFilters();
    initContactForm();
    initFooter();
    observeRevealElements();
    initCounters();
    renderMarquee();
    renderExperiences();
    renderProjects();

    // Load data from API (async, non-blocking)
    loadData();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
