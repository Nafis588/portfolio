import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, MapPin, Award, Download, ExternalLink, Send,
  Trophy, Medal, GraduationCap, Star, Crown, Shield
} from 'lucide-react';
import './portfolio.css';

const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

const resolveImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const backendHost = API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE;
    return `${backendHost}${url}`;
  }
  return url;
};

// Safe fetch wrapper
const fetchApi = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(`${API_BASE}${url}`, options);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`API Error at ${url}:`, err.message);
    throw err;
  }
};

const SDLC_STAGES = ['Planning', 'Analysis', 'Design', 'Implementation', 'Testing', 'Deployment', 'Maintenance'];

const CLIENTS = [
  { name: 'Bangladesh Navy', icon: '⚓' },
  { name: 'Jamuna Oil Company', icon: '🏭' },
  { name: 'Bangladesh Maritime University', icon: '🎓' },
  { name: 'ATI Limited', icon: '💼' },
  { name: 'Ghana Healthcare Client', icon: '🏥' }
];

/* ─── Animate Counter Component ─── */
function Counter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);
  const currentTarget = useRef(target);

  useEffect(() => {
    // If target has changed and we already animated, animate from current count to new target
    if (animated.current && currentTarget.current !== target) {
      currentTarget.current = target;
      let startTimestamp: number | null = null;
      const duration = 1500;
      const startValue = count;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(startValue + (target - startValue) * eased));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
      return;
    }

    currentTarget.current = target;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          let startTimestamp: number | null = null;
          const duration = 1500;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.round(target * eased));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}</span>;
}

export default function App() {
  const [profile, setProfile] = useState<any>({
    fullName: 'Md. Nafis Sadique Niloy',
    siteName: 'Nafis Niloy Portfolio',
    metaDescription: 'Md. Nafis Sadique Niloy - Certified Scrum Product Owner (CSPO) & Trainee Project Coordinator',
    heroGreeting: 'Hi, I am',
    heroTitles: [
      'Trainee Project Coordinator',
      'Computer Science Graduate',
      'Agile & Product Management Enthusiast'
    ],
    bioParagraphs: [
      'I bridge business needs with engineering execution, specializing in Agile project management methodologies, sprint planning, and Work Breakdown Structures (WBS).',
      'Currently operating out of Dhaka and Rangpur, my core focus is driving delivery efficiency across enterprise and government clients.'
    ],
    avatarUrl: '',
    heroBadgeText: 'CSPO® Certified Product Owner',
    aboutStatusText: 'Currently active at ATI Limited — Full-Time',
    designTokens: {
      primaryColor: '#6366f1',
      secondaryColor: '#475569',
      fontFamily: 'Plus Jakarta Sans',
      backgroundColor: '#040814',
      textColor: '#f1f5f9',
      cardColor: 'rgba(15, 23, 42, 0.5)',
      themeTemplate: 'cyan-emerald'
    },
    socialLinks: {
      github: 'https://github.com/Nafis588',
      linkedin: 'https://www.linkedin.com/in/nafissn/',
      email: 'mdnafissadiqueniloy@gmail.com'
    },
    resumeUrl: '/CV of Md. Nafis Sadique Niloy.pdf',
    sectionVisibility: {
      showExperience: true,
      showStartups: true,
      showCertifications: true,
      showEducation: true,
      showSkills: true,
      showLeadership: true,
      showAchievements: true
    },
    stat1: { value: 7, suffix: '+', label: 'Projects Coordinated' },
    stat2: { value: 4, suffix: '+', label: 'Certs & Credentials' },
    stat3: { value: 500, suffix: '+', label: 'BUCC Members Led' },
    stat4: { value: 3, suffix: '+', label: 'Years in PM / Tech' }
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);

  const [projectFilter, setProjectFilter] = useState<'all' | 'Enterprise' | 'Academic' | 'Startup'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  // Contact form
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ type: '', msg: '' });
  const [contactSending, setContactSending] = useState(false);

  // Typewriter states
  const [typewriterText, setTypewriterText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Terminal logging states
  const [terminalLines, setTerminalLines] = useState<any[]>([]);
  const [currentTerminalLine, setCurrentTerminalLine] = useState('');
  const [terminalStep, setTerminalStep] = useState(0);
  const logs = [
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

  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Date formatting helpers
  const formatMonthYear = (dateStr: string | Date | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatExperiencePeriod = (exp: any) => {
    if (exp.isActive) {
      return `${formatMonthYear(exp.periodStart)} – Present`;
    }
    if (exp.periodEnd) {
      return `${formatMonthYear(exp.periodStart)} – ${formatMonthYear(exp.periodEnd)}`;
    }
    return `${formatMonthYear(exp.periodStart)} – Completed`;
  };

  // Custom badge renderer with full design customization
  const renderCustomBadge = (exp: any, defaultIcon: string) => {
    const icon = exp.badge || defaultIcon;
    if (!icon) return null;

    const bg = exp.badgeBgColor || 'rgba(99, 102, 241, 0.08)';
    const color = exp.badgeTextColor || 'var(--accent-primary)';
    const shape = exp.badgeShape || 'pill';

    let borderRadius = 'var(--radius-sm)';
    if (shape === 'circle') borderRadius = 'var(--radius-full)';
    if (shape === 'square') borderRadius = '4px';

    const isOutline = shape === 'outline';
    const borderStyle = isOutline ? `1px solid ${color}` : '1px solid transparent';
    const finalBg = isOutline ? 'transparent' : bg;

    return (
      <span 
        className="custom-designed-badge"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: shape === 'circle' ? '6px' : '4px 10px',
          fontSize: '0.75rem',
          fontWeight: 700,
          lineHeight: 1,
          borderRadius,
          backgroundColor: finalBg,
          color,
          border: borderStyle,
          minWidth: shape === 'circle' ? '28px' : 'auto',
          height: shape === 'circle' ? '28px' : 'auto',
        }}
      >
        {icon}
      </span>
    );
  };

  // Reusable timeline component
  const renderTimeline = (items: any[], accentColor: string, defaultIcon: string = '') => {
    return (
      <div className="timeline">
        <div className="timeline-line">
          <div className="timeline-line-progress"></div>
        </div>
        {items.map((exp) => (
          <div key={exp._id} className={`timeline-node ${exp.isActive ? 'active' : ''} reveal`}>
            <div className="timeline-dot" style={{ borderColor: accentColor }}></div>
            <div className="timeline-content">
              <div className="flex justify-between items-start flex-wrap gap-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap' }}>
                <div>
                  <span className="timeline-date">{formatExperiencePeriod(exp)}</span>
                  <h4 className="timeline-role" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {renderCustomBadge(exp, defaultIcon)}
                    <span>{exp.roleTitle}</span>
                  </h4>
                  <span className="timeline-company">{exp.organization}</span>
                  {exp.link && (
                    <a 
                      href={exp.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="experience-link"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        marginLeft: '12px',
                        fontSize: '0.72rem', 
                        color: 'var(--accent-primary)',
                        fontWeight: 600
                      }}
                    >
                      Visit Website
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                {exp.isActive && (
                  <span className="timeline-status active">Active</span>
                )}
              </div>
              {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                <ul className="timeline-points">
                  {exp.bulletPoints.map((pt: string, idx2: number) => (
                    <li key={idx2}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper to map badge input to Lucide outline icon with a neon glow
  const getAchievementIcon = (badge: string, color: string) => {
    const iconStyle = { color, filter: `drop-shadow(0 0 8px ${color})`, width: '44px', height: '44px', strokeWidth: 1.5 };
    const lowerBadge = badge ? badge.toLowerCase().trim() : '';

    if (lowerBadge.includes('medal') || lowerBadge.includes('hero') || lowerBadge.includes('ribbon') || lowerBadge.includes('🏅')) {
      return <Medal style={iconStyle} />;
    }
    if (lowerBadge.includes('trophy') || lowerBadge.includes('hackathon') || lowerBadge.includes('winner') || lowerBadge.includes('first') || lowerBadge.includes('🏆')) {
      return <Trophy style={iconStyle} />;
    }
    if (lowerBadge.includes('graduation') || lowerBadge.includes('education') || lowerBadge.includes('school') || lowerBadge.includes('🎓') || lowerBadge.includes('degree')) {
      return <GraduationCap style={iconStyle} />;
    }
    if (lowerBadge.includes('star') || lowerBadge.includes('⭐')) {
      return <Star style={iconStyle} />;
    }
    if (lowerBadge.includes('crown') || lowerBadge.includes('king') || lowerBadge.includes('president') || lowerBadge.includes('👑')) {
      return <Crown style={iconStyle} />;
    }
    if (lowerBadge.includes('shield') || lowerBadge.includes('security') || lowerBadge.includes('🛡️')) {
      return <Shield style={iconStyle} />;
    }
    if (lowerBadge.includes('cert') || lowerBadge.includes('academic') || lowerBadge.includes('excellence') || lowerBadge.includes('diploma') || lowerBadge.includes('award')) {
      return <Award style={iconStyle} />;
    }
    // Default fallback - if it is single emoji/character, render as text with drop shadow
    if (badge && badge.length <= 4) {
      return (
        <span style={{ fontSize: '2.5rem', filter: `drop-shadow(0 0 10px ${color})` }}>
          {badge}
        </span>
      );
    }
    return <Award style={iconStyle} />;
  };

  // Load backend content
  const loadData = async () => {
    try {
      const settings = await fetchApi('/settings?increment=true');
      if (settings && settings.fullName) {
        setProfile(settings);
        
        // Dynamically update site title and description for SEO
        if (settings.siteName) {
          document.title = settings.siteName;
        }
        if (settings.metaDescription) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', settings.metaDescription);
          }
        }

        // Inject dynamic theme design tokens
        if (settings.designTokens) {
          const { primaryColor, secondaryColor, fontFamily, backgroundColor, textColor, cardColor } = settings.designTokens;
          if (primaryColor) {
            document.documentElement.style.setProperty('--accent-primary', primaryColor);
          }
          if (secondaryColor) {
            document.documentElement.style.setProperty('--accent-secondary', secondaryColor);
          }
          if (primaryColor && secondaryColor) {
            document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`);
          }
          if (fontFamily) {
            document.documentElement.style.setProperty('--font-sans', fontFamily);
          }
          if (theme === 'dark') {
            if (backgroundColor) {
              document.documentElement.style.setProperty('--bg-primary', backgroundColor);
              document.documentElement.style.setProperty('--bg-secondary', backgroundColor);
              document.documentElement.style.setProperty('--bg-tertiary', backgroundColor);
            }
            if (textColor) {
              document.documentElement.style.setProperty('--text-primary', textColor);
            }
            if (cardColor) {
              document.documentElement.style.setProperty('--bg-card', cardColor);
              document.documentElement.style.setProperty('--bg-card-hover', cardColor);
            }
          }
        }
      }
    } catch (e) {}

    try {
      const projData = await fetchApi('/projects');
      if (projData) setProjects(projData);
    } catch (e) {}

    try {
      const expData = await fetchApi('/experiences');
      if (expData) setExperiences(expData);
    } catch (e) {}

    try {
      const startupData = await fetchApi('/startups');
      if (startupData) setStartups(startupData);
    } catch (e) {}

    try {
      const skillsData = await fetchApi('/skills');
      if (skillsData) setSkills(skillsData);
    } catch (e) {}
  };
  // Load data once on mount
  useEffect(() => {
    loadData();
  }, []);

  // Set up scroll listener and IntersectionObserver when content updates
  useEffect(() => {
    // Scroll reveal implementation
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      revealObserver.observe(el);
    });

    // Scroll handler for navbar glass effect
    const handleScroll = () => {
      setNavbarScrolled(window.scrollY > 50);

      // Track active section
      const sections = ['about', 'skills', 'experience', 'education', 'startups', 'leadership', 'projects', 'credentials', 'achievements', 'contact'];
      let currentSection = 'home';
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            currentSection = section;
            break;
          }
        }
      }
      setActiveNav(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealObserver.disconnect();
    };
  }, [projects, experiences, startups, skills]);
  // Typewriter Loop
  useEffect(() => {
    const typewriterRoles = (profile.heroTitles && profile.heroTitles.length > 0)
      ? profile.heroTitles
      : [
          'Trainee Project Coordinator',
          'Certified Product Owner (CSPO®)',
          'Bridging Business & Engineering',
          'Agile Sprint Delivery'
        ];

    const currentRole = typewriterRoles[roleIndex];
    if (!currentRole) return;

    if (isDeleting) {
      if (charIndex > 0) {
        const timer = setTimeout(() => {
          setTypewriterText(currentRole.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 30);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setRoleIndex((roleIndex + 1) % typewriterRoles.length);
      }
    } else {
      if (charIndex < currentRole.length) {
        const timer = setTimeout(() => {
          setTypewriterText(currentRole.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 60);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [charIndex, isDeleting, roleIndex, profile.heroTitles]);

  // CLI Terminal loops
  useEffect(() => {
    if (terminalStep >= logs.length) {
      const resetTimer = setTimeout(() => {
        setTerminalLines([]);
        setTerminalStep(0);
      }, 4000);
      return () => clearTimeout(resetTimer);
    }

    const currentLog = logs[terminalStep];
    let typedIndex = 0;
    
    const typingTimer = setInterval(() => {
      if (typedIndex <= currentLog.text.length) {
        setCurrentTerminalLine(currentLog.text.substring(0, typedIndex));
        typedIndex++;
      } else {
        clearInterval(typingTimer);
        setTimeout(() => {
          setTerminalLines(prev => [...prev, currentLog]);
          setCurrentTerminalLine('');
          setTerminalStep(s => s + 1);
        }, currentLog.type === 'cmd' ? 500 : 200);
      }
    }, currentLog.type === 'cmd' ? 35 : 18);

    return () => clearInterval(typingTimer);
  }, [terminalStep]);

  // Theme Manager
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'light') {
      document.documentElement.style.removeProperty('--bg-primary');
      document.documentElement.style.removeProperty('--bg-secondary');
      document.documentElement.style.removeProperty('--bg-tertiary');
      document.documentElement.style.removeProperty('--bg-card');
      document.documentElement.style.removeProperty('--bg-card-hover');
      document.documentElement.style.removeProperty('--text-primary');
    } else if (profile && profile.designTokens) {
      const { backgroundColor, textColor, cardColor } = profile.designTokens;
      if (backgroundColor) {
        document.documentElement.style.setProperty('--bg-primary', backgroundColor);
        document.documentElement.style.setProperty('--bg-secondary', backgroundColor);
        document.documentElement.style.setProperty('--bg-tertiary', backgroundColor);
      }
      if (textColor) {
        document.documentElement.style.setProperty('--text-primary', textColor);
      }
      if (cardColor) {
        document.documentElement.style.setProperty('--bg-card', cardColor);
        document.documentElement.style.setProperty('--bg-card-hover', cardColor);
      }
    }
  }, [theme, profile]);

  // Handle message submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus({ type: '', msg: '' });

    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.subject.trim() || !contactForm.message.trim()) {
      setContactStatus({ type: 'error', msg: 'Please fill in all fields with a valid email.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      setContactStatus({ type: 'error', msg: 'Please fill in a valid email address.' });
      return;
    }

    setContactSending(true);
    try {
      const res = await fetchApi('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      setContactStatus({ type: 'success', msg: res.message || 'Message sent! I will respond within 24 hours.' });
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setContactStatus({ type: 'error', msg: err.message || 'Error sending message. Please try again.' });
    } finally {
      setContactSending(false);
    }
  };

  // Group skills dynamically by category
  const groupedSkills: Record<string, { icon: string; items: string[] }> = {};
  skills.forEach(skill => {
    if (!groupedSkills[skill.category]) {
      groupedSkills[skill.category] = { icon: skill.icon || '🛠️', items: [] };
    }
    groupedSkills[skill.category].items.push(skill.name);
  });

  const currentYear = new Date().getFullYear();

  // Create array of active navigation items based on visibility settings
  const navLinks = [
    { id: 'about', label: 'About' },
    ...(profile.sectionVisibility?.showSkills && skills.length > 0 ? [{ id: 'skills', label: 'Skills' }] : []),
    ...(profile.sectionVisibility?.showExperience && experiences.some(e => e.categoryType === 'Work' || e.categoryType === 'Instruction') ? [{ id: 'experience', label: 'Experience' }] : []),
    ...(profile.sectionVisibility?.showEducation && experiences.some(e => e.categoryType === 'Education') ? [{ id: 'education', label: 'Education' }] : []),
    ...(profile.sectionVisibility?.showStartups && startups.length > 0 ? [{ id: 'startups', label: 'Startups' }] : []),
    ...(profile.sectionVisibility?.showLeadership && experiences.some(e => e.categoryType === 'Leadership') ? [{ id: 'leadership', label: 'Leadership' }] : []),
    { id: 'projects', label: 'Projects' },
    ...(profile.sectionVisibility?.showCertifications && experiences.some(e => e.categoryType === 'Certification') ? [{ id: 'credentials', label: 'Credentials' }] : []),
    ...(profile.sectionVisibility?.showAchievements && experiences.some(e => e.categoryType === 'Achievement') ? [{ id: 'achievements', label: 'Achievements' }] : []),
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <>
      {/* Ambient animated background */}
      <div className="ambient-bg">
        <div className="ambient-blob ambient-blob-1"></div>
        <div className="ambient-blob ambient-blob-2"></div>
      </div>

      {/* ─── NAVBAR ─── */}
      <nav className={`navbar ${navbarScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="container nav-container">
          <a href="#" className="nav-logo">{profile.fullName ? profile.fullName.split(' ').pop()?.toUpperCase() : 'NAFIS'}<span className="accent">.</span></a>

          <div className="nav-links">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={activeNav === link.id ? 'active' : ''}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              <span className="icon-moon">{theme === 'dark' ? '🌙' : '☀️'}</span>
            </button>
            <a href={resolveImageUrl(profile.resumeUrl) || '/CV of Md. Nafis Sadique Niloy.pdf'} download className="btn-cta btn-primary nav-cv-btn">
              <Download size={14} style={{ marginRight: '6px' }} />
              Download CV
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className={activeNav === link.id ? 'active' : ''}
            >
              {link.label}
            </a>
          ))}
          <a href={resolveImageUrl(profile.resumeUrl) || '/CV of Md. Nafis Sadique Niloy.pdf'} download onClick={() => setMobileMenuOpen(false)}>
            📄 Download CV
          </a>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="hero" id="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge reveal">
              <Award size={14} style={{ marginRight: '6px' }} />
              {profile.heroBadgeText || 'CSPO® Certified Product Owner'}
            </div>

            <h1 className="reveal">
              {profile.heroGreeting || 'Hi, I am'}<br />
              <span className="gradient-text">{profile.fullName ? profile.fullName.split(' ').slice(-2).join(' ') : 'Nafis Niloy'}</span>.
            </h1>

            <div className="hero-roles reveal">
              <span>{typewriterText}</span>
              <span className="cursor-blink"></span>
            </div>

            <p className="hero-bio reveal">
              {profile.bioParagraphs?.[0] || ''}
            </p>

            <div className="hero-ctas reveal">
              <a href="#projects" className="btn-cta btn-primary">
                View Projects
                <span style={{ marginLeft: '6px' }}>➔</span>
              </a>
              <a href={resolveImageUrl(profile.resumeUrl) || '/CV of Md. Nafis Sadique Niloy.pdf'} download className="btn-cta btn-secondary">
                <Download size={14} style={{ marginRight: '6px' }} />
                Resume PDF
              </a>
            </div>
          </div>

          {/* CLI Terminal Simulator */}
          <div className="terminal reveal-right">
            <div className="terminal-header">
              <div className="terminal-dot red"></div>
              <div className="terminal-dot yellow"></div>
              <div className="terminal-dot green"></div>
              <span className="terminal-title">pm-terminal.sh</span>
            </div>
            <div className="terminal-body">
              {terminalLines.map((line, idx) => (
                <div key={idx} style={{ marginBottom: '4px' }}>
                  {line.type === 'cmd' ? (
                    <>
                      <span className="cmd-prompt">~/nafis-pm$</span> <span className="cmd-text">{line.text}</span>
                    </>
                  ) : line.type === 'success' ? (
                    <span className="cmd-success">{line.text}</span>
                  ) : (
                    <span className="cmd-output">{line.text}</span>
                  )}
                </div>
              ))}
              {terminalStep < logs.length && (
                <div style={{ marginBottom: '4px' }}>
                  {logs[terminalStep].type === 'cmd' ? (
                    <>
                      <span className="cmd-prompt">~/nafis-pm$</span> <span className="cmd-text">{currentTerminalLine}</span>
                      <span className="animate-pulse">_</span>
                    </>
                  ) : logs[terminalStep].type === 'success' ? (
                    <span className="cmd-success">{currentTerminalLine}</span>
                  ) : (
                    <span className="cmd-output">{currentTerminalLine}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CLIENT MARQUEE ─── */}
      <div className="client-marquee">
        <div className="marquee-content">
          {(() => {
            const activeClients = (profile.clients && profile.clients.length > 0) ? profile.clients : CLIENTS;
            return [...activeClients, ...activeClients, ...activeClients].map((client, idx) => (
              <div key={idx} className="marquee-item">
                <span>{client.icon}</span> {client.name}
              </div>
            ));
          })()}
        </div>
      </div>

      {/* ─── ABOUT SECTION ─── */}
      <section className="section" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-photo-frame reveal-left">
              {profile.avatarUrl ? (
                <img src={resolveImageUrl(profile.avatarUrl)} alt={profile.fullName} id="about-photo" loading="lazy" />
              ) : (
                <div className="about-photo-placeholder">
                  {(() => {
                    if (!profile.fullName) return 'N';
                    const parts = profile.fullName.split(' ').filter((p: string) => p && p !== 'Md.' && p !== 'Md');
                    if (parts.length === 0) return 'N';
                    if (parts.length === 1) return parts[0][0].toUpperCase();
                    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                  })()}
                </div>
              )}
            </div>

            <div className="about-info">
              <span className="section-label reveal">Overview</span>
              <h2 className="section-title reveal">Who I Am</h2>

              <div className="about-status reveal">
                <span className="pulse-dot"></span>
                {profile.aboutStatusText || 'Currently active at ATI Limited — Full-Time'}
              </div>

              {profile.bioParagraphs?.slice(1).map((para: string, idx: number) => (
                <p className="about-text reveal" key={idx}>
                  {para}
                </p>
              ))}

              <div className="stats-grid">
                {[profile.stat1, profile.stat2, profile.stat3, profile.stat4].map((stat, i) => (
                  <div className="stat-item reveal-scale" key={i}>
                    <div className="stat-number">
                      <Counter target={stat?.value || 0} />{stat?.suffix || ''}
                    </div>
                    <div className="stat-label">{stat?.label || ''}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SKILLS SECTION ─── */}
      {profile.sectionVisibility?.showSkills && skills.length > 0 && (
        <section className="section" id="skills">
          <div className="container">
            <span className="section-label reveal">Competencies</span>
            <h2 className="section-title reveal">Technical Arsenal</h2>
            <p className="section-subtitle reveal">Core skills I bring to project delivery and team coordination.</p>

            <div className="skills-grid">
              {Object.keys(groupedSkills).map(catName => (
                <div className="skill-card reveal" key={catName}>
                  <h3>
                    <span className="skill-icon" style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)' }}>
                      {groupedSkills[catName].icon}
                    </span>
                    {catName}
                  </h3>
                  <div className="skill-tags">
                    {groupedSkills[catName].items.map(sName => (
                      <span key={sName} className="skill-tag">{sName}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── WORK EXPERIENCE SECTION ─── */}
      {profile.sectionVisibility?.showExperience && experiences.some(e => e.categoryType === 'Work' || e.categoryType === 'Instruction') && (
        <section className="section" id="experience">
          <div className="container">
            <span className="section-label reveal">Experience</span>
            <h2 className="section-title reveal">Work Experience</h2>
            {renderTimeline(experiences.filter(e => e.categoryType === 'Work' || e.categoryType === 'Instruction'), 'var(--accent-primary)')}
          </div>
        </section>
      )}

      {/* ─── EDUCATION & ACADEMICS SECTION ─── */}
      {profile.sectionVisibility?.showEducation && experiences.some(e => e.categoryType === 'Education') && (
        <section className="section" id="education">
          <div className="container">
            <span className="section-label reveal">Education</span>
            <h2 className="section-title reveal">Education & Academics</h2>
            {renderTimeline(experiences.filter(e => e.categoryType === 'Education'), '#8b5cf6', '🎓')}
          </div>
        </section>
      )}

      {/* ─── STARTUPS & VENTURES SECTION ─── */}
      {profile.sectionVisibility?.showStartups && startups.length > 0 && (
        <section className="section" id="startups">
          <div className="container">
            <span className="section-label reveal">Ventures</span>
            <h2 className="section-title reveal">Startups & Ventures</h2>
            <p className="section-subtitle reveal">Scalable software platforms and digital identities I founded or built.</p>

            <div className="skills-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
              {startups.map(startup => (
                <div key={startup._id} className="skill-card reveal" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
                        <span className="skill-icon" style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', display: 'inline-flex', alignSelf: 'center', fontSize: '1rem', width: '28px', height: '28px' }}>
                          {startup.logoUrl ? <img src={resolveImageUrl(startup.logoUrl)} alt={startup.brandName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '🚀'}
                        </span>
                        {startup.brandName}
                      </h3>
                      <span className={`timeline-status ${startup.isActive ? 'active' : 'completed'}`} style={{ padding: '2px 8px', fontSize: '10px' }}>
                        {startup.isActive ? 'Active' : 'Ventures'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 600, marginBottom: '6px' }}>
                      {startup.role}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.6' }}>
                      "{startup.philosophy}"
                    </p>
                  </div>
                  {startup.websiteUrl && (
                    <div style={{ marginTop: '16px' }}>
                      <a href={startup.websiteUrl} target="_blank" rel="noopener noreferrer" className="credential-link" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.78rem', color: 'var(--accent-primary)' }}>
                        Launch Venture
                        <ExternalLink size={10} style={{ marginLeft: '4px' }} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── LEADERSHIP & ACTIVITIES SECTION ─── */}
      {profile.sectionVisibility?.showLeadership && experiences.some(e => e.categoryType === 'Leadership') && (
        <section className="section" id="leadership">
          <div className="container">
            <span className="section-label reveal">Leadership</span>
            <h2 className="section-title reveal">Leadership & Activities</h2>
            {renderTimeline(experiences.filter(e => e.categoryType === 'Leadership'), '#f59e0b', '🌟')}
          </div>
        </section>
      )}

      {/* ─── PROJECTS SECTION ─── */}
      <section className="section" id="projects">
        <div className="container">
          <span className="section-label reveal">Works</span>
          <h2 className="section-title reveal">Coordinated Projects</h2>

          <div className="filter-container reveal">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'Enterprise', label: 'Enterprise Modules' },
              { id: 'Academic', label: 'Academic & Tech' }
            ].map(filt => (
              <button
                key={filt.id}
                onClick={() => setProjectFilter(filt.id as any)}
                className={`filter-btn ${projectFilter === filt.id ? 'active' : ''}`}
              >
                {filt.label}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {projects
              .filter(p => projectFilter === 'all' || p.category === projectFilter)
              .map(proj => {
                const isCompleted = proj.status === 'Delivered' || proj.status === 'Completed';
                const isQA = proj.status === 'In QA';
                const statusClass = isCompleted ? 'delivered' : isQA ? 'in-qa' : 'in-dev';
                
                // SDLC visualization stages
                const stageIndex = SDLC_STAGES.indexOf(proj.sdlcStage || 'Planning');
                const stage = stageIndex !== -1 ? stageIndex + 1 : 1;

                return (
                  <div key={proj._id} className="project-card reveal" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <div>
                      <div className="project-meta">
                        <span className="project-client">{proj.client}</span>
                        <span className={`project-status ${statusClass}`}>{proj.status}</span>
                      </div>
                      
                      {proj.thumbnailUrl && (
                        <div style={{ width: '100%', height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '14px', border: '1px solid var(--border-primary)' }}>
                          <img src={resolveImageUrl(proj.thumbnailUrl)} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}

                      <h4 className="project-title">{proj.title}</h4>
                      
                      {/* Visual SDLC Pipeline */}
                      <div className="sdlc-pipeline" style={{ margin: '12px 0 16px 0' }}>
                        {SDLC_STAGES.map((s, i) => (
                          <div key={s} className="pipeline-segment">
                            <div className={`pipeline-dot ${i < stage ? 'active' : ''}`}>
                              <span className="pipeline-tooltip">{s}</span>
                            </div>
                            {i < SDLC_STAGES.length - 1 && (
                              <div className={`pipeline-line ${i < stage - 1 ? 'active' : ''}`}></div>
                            )}
                          </div>
                        ))}
                      </div>

                      <p className="project-desc">{proj.description}</p>
                    </div>

                    <div>
                      <div className="project-tags" style={{ marginBottom: '14px' }}>
                        {proj.technologies?.map((tag: string) => (
                          <span key={tag} className="project-tag">{tag}</span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        {proj.repositoryUrl && (
                          <a href={proj.repositoryUrl} target="_blank" rel="noopener noreferrer" className="credential-link" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                            Repository
                            <ExternalLink size={10} style={{ marginLeft: '4px' }} />
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="credential-link" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                            Live Demo
                            <ExternalLink size={10} style={{ marginLeft: '4px' }} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* ─── CREDENTIALS SECTION ─── */}
      {profile.sectionVisibility?.showCertifications && experiences.some(e => e.categoryType === 'Certification') && (
        <section className="section" id="credentials">
          <div className="container">
            <span className="section-label reveal">Certifications</span>
            <h2 className="section-title reveal">Professional Credentials</h2>

            <div className="credentials-grid">
              {experiences
                .filter(e => e.categoryType === 'Certification')
                .map(cert => (
                  <div key={cert._id} className="credential-card reveal">
                    <div style={{ marginBottom: '14px' }}>
                      {renderCustomBadge(cert, '🏅')}
                    </div>
                    <div className="credential-title">{cert.roleTitle}</div>
                    <div className="credential-meta">
                      <span>{cert.organization}</span>
                      <span>{formatExperiencePeriod(cert)}</span>
                    </div>
                    {cert.bulletPoints?.[0] && <span className="credential-id">ID: {cert.bulletPoints[0]}</span>}
                    {(cert.link || cert.bulletPoints?.[1]) && (
                      <a href={cert.link || cert.bulletPoints[1]} target="_blank" rel="noopener noreferrer" className="credential-link">
                        Verify Credential
                        <ExternalLink size={10} style={{ marginLeft: '4px' }} />
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── RECOGNITION & LEADERSHIP (ACHIEVEMENTS) ─── */}
      {profile.sectionVisibility?.showAchievements && experiences.some(e => e.categoryType === 'Achievement') && (
        <section className="section" id="achievements">
          <div className="container">
            <span className="section-label reveal">Recognition</span>
            <h2 className="section-title reveal">Recognition & Leadership</h2>
            
            <div className="recognition-container">
              {experiences
                .filter(e => e.categoryType === 'Achievement')
                .map((ach) => {
                  const accentColor = ach.badgeTextColor || '#ef4444';
                  const badgeIcon = ach.badge || '🏆';
                  return (
                    <div 
                      key={ach._id} 
                      className="recognition-card reveal" 
                      style={{ 
                        '--card-accent': accentColor,
                        '--card-accent-glow': accentColor + '22',
                        borderColor: accentColor
                      } as React.CSSProperties}
                    >
                      {/* Diagonal Glass divider line overlay */}
                      <div className="recognition-card-glare"></div>
                      
                      {/* Card Content wrapper */}
                      <div className="recognition-card-content">
                        {/* Centered glowing outline icon */}
                        <div className="recognition-card-icon-wrap">
                          {getAchievementIcon(badgeIcon, accentColor)}
                        </div>
                        
                        {/* Glowing Title */}
                        <h3 className="recognition-card-title">{ach.roleTitle}</h3>
                        
                        {/* White/Off-white Subtitle (Organization) */}
                        <span className="recognition-card-subtitle">{ach.organization}</span>
                        
                        {/* Extra bullet points / details */}
                        {ach.bulletPoints && ach.bulletPoints.length > 0 && (
                          <div className="recognition-card-details">
                            {ach.bulletPoints.join(', ')}
                          </div>
                        )}

                        {/* Visit link */}
                        {ach.link && (
                          <a 
                            href={ach.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="achievement-link"
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              marginTop: '8px',
                              fontSize: '0.8rem', 
                              color: accentColor, 
                              fontWeight: 700,
                              textDecoration: 'none',
                              filter: `drop-shadow(0 0 4px ${accentColor}44)`
                            }}
                          >
                            View Achievement / Certificate
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* ─── CONTACT SECTION ─── */}
      <section className="section" id="contact">
        <div className="container">
          <span className="section-label reveal">Connect</span>
          <h2 className="section-title reveal">Get In Touch</h2>

          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-card reveal">
                <div className="contact-icon email-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="contact-card-label">Email Address</div>
                  <div className="contact-card-value">
                    <a href={`mailto:${profile.socialLinks?.email}`} id="contact-email">{profile.socialLinks?.email}</a>
                  </div>
                </div>
              </div>

              <div className="contact-card reveal">
                <div className="contact-icon location-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="contact-card-label">Current Location</div>
                  <div className="contact-card-value" id="contact-location">{profile.location || 'Dhaka & Rangpur, Bangladesh'}</div>
                </div>
              </div>

              <div className="contact-socials reveal">
                <a href={profile.socialLinks?.github} target="_blank" rel="noopener noreferrer" className="social-btn" id="social-github">
                  GitHub
                </a>
                <a href={profile.socialLinks?.linkedin} target="_blank" rel="noopener noreferrer" className="social-btn" id="social-linkedin">
                  LinkedIn
                </a>
              </div>
            </div>

            <form className="contact-form reveal-right" id="contact-form" onSubmit={handleContactSubmit}>
              <h3>Send a direct message</h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-name">Full Name</label>
                  <input
                    type="text"
                    id="cf-name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="form-input"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cf-email">Email Address</label>
                  <input
                    type="email"
                    id="cf-email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="form-input"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cf-subject">Subject</label>
                <input
                  type="text"
                  id="cf-subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="form-input"
                  placeholder="Inquiry / Opportunity"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cf-message">Message</label>
                <textarea
                  id="cf-message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="form-textarea"
                  placeholder="Details of your opportunity..."
                  rows={4}
                  required
                ></textarea>
              </div>

              <button type="submit" className="form-submit" id="form-submit" disabled={contactSending}>
                {contactSending ? 'Sending...' : 'Send Message'}
                <Send size={14} style={{ marginLeft: '6px' }} />
              </button>

              {contactStatus.msg && (
                <div className={`form-status ${contactStatus.type === 'success' ? 'success' : 'error'}`}>
                  {contactStatus.msg}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-links">
            <a href={profile.socialLinks?.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href={profile.socialLinks?.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={`mailto:${profile.socialLinks?.email}`}>Email</a>
          </div>
          <div className="footer-content">
            &copy; {currentYear} {profile.fullName || 'Md. Nafis Sadique Niloy'}. Built with ❤️
            {profile.showVisitorCount && profile.visitCount !== undefined && (
              <span className="visitor-counter" style={{ display: 'block', marginTop: '8px', fontSize: '0.75rem', opacity: 0.6 }}>
                Visitor count: <strong>{profile.visitCount}</strong>
              </span>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
