import React, { useState, useEffect, useRef } from 'react';
import {
  Github,
  Linkedin,
  Mail,
  Moon,
  Sun,
  ChevronUp,
  MapPin,
  Briefcase,
  ExternalLink,
  Code,
  Send,
  Menu,
  X,
  ArrowRight,
  Award,
  GraduationCap,
  Users,
  Download,
  FileText,
  Calendar,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   Tiny custom hook: fires a callback when element enters the viewport
───────────────────────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─────────────────────────────────────────────────────────────────────────
   Section wrapper with fade-up animation on scroll
───────────────────────────────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Typewriter effect
───────────────────────────────────────────────────────────────────────── */
function Typewriter({ words }: { words: string[] }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx % words.length];
    const speed = isDeleting ? 40 : 90;
    const timeout = setTimeout(() => {
      setText(prev => isDeleting ? current.substring(0, prev.length - 1) : current.substring(0, prev.length + 1));
      if (!isDeleting && text === current) {
        setTimeout(() => setIsDeleting(true), 1800);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setWordIdx(i => i + 1);
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIdx, words]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
      {text}
      <span className="animate-pulse text-amber-400">|</span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Main App
───────────────────────────────────────────────────────────────────────── */
function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formErrors, setFormErrors] = useState({ name: false, email: false, subject: false, message: false });
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const sectionsRef = {
    hero: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    projects: useRef<HTMLElement>(null),
    experience: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initial = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.setAttribute('data-theme', next);
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 50);
      setShowBackToTop(y > 300);
      let current = 'hero';
      for (const key of Object.keys(sectionsRef)) {
        const el = sectionsRef[key as keyof typeof sectionsRef].current;
        if (el && y >= el.offsetTop - 160) current = key;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: '', text: '' });
    const errors = {
      name: !formData.name.trim(),
      email: !formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      subject: !formData.subject.trim(),
      message: !formData.message.trim(),
    };
    setFormErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setFormStatus({ type: 'error', text: 'Please fill in all required fields correctly.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit.');
      setFormStatus({ type: 'success', text: 'Message sent successfully! I will get back to you shortly.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setFormStatus({ type: 'error', text: `Failed: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setFormErrors(p => ({ ...p, [name]: false }));
  };

  const navLinks = ['Home', 'About', 'Projects', 'Experience', 'Contact'];

  /* ── Enterprise Projects ── */
  const enterpriseProjects = [
    {
      title: 'Budget Management System',
      client: 'Bangladesh Navy',
      desc: 'Led requirement elicitation and coordinated delivery of budget workflow modules. Acted as stakeholder liaison to lock scope and manage change requests.',
      tags: ['Scope Management', 'Backlog Tracking', 'Agile'],
      accent: 'from-blue-500/20 to-blue-600/5',
    },
    {
      title: 'NATDOC Website (CMS)',
      client: 'Bangladesh Navy',
      desc: 'Validated on-site requirements and finalized SRS, establishing content structures, workflows, and approvals. Coordinated milestones and dev feedback loops.',
      tags: ['SRS', 'Requirement Eng.', 'Dynamic CMS'],
      accent: 'from-indigo-500/20 to-indigo-600/5',
    },
    {
      title: 'ERP Modules (HR, Payroll, Accounts)',
      client: 'Jamuna Oil Company',
      desc: 'Supported gap analysis and requirement detailing for HR and Payroll ERP modules. Structured timelines and rollout dependencies for phased delivery.',
      tags: ['Gap Analysis', 'ERP', 'Timeline Tracking'],
      accent: 'from-violet-500/20 to-violet-600/5',
    },
    {
      title: 'Dynamic University Website',
      client: 'Bangladesh Maritime University',
      desc: 'Coordinated a full redesign, content migration, and delivery workflows. Facilitated issue tracking, content verification, and rollout support.',
      tags: ['CMS Workflow', 'Content Migration', 'Issue Triage'],
      accent: 'from-amber-500/20 to-amber-600/5',
    },
    {
      title: 'Centralized Healthcare Platform',
      client: 'Ghana Healthcare Client',
      desc: 'Supported delivery of a multi-tenant platform where multiple hospital systems operate concurrently. Coordinated milestone tracking and cross-border comms.',
      tags: ['Multi-Tenant', 'Milestones', 'Cross-Border'],
      accent: 'from-emerald-500/20 to-emerald-600/5',
    },
  ];

  const academicProjects = [
    {
      title: 'USIS 3.0 Student Portal',
      desc: 'Student portal with schedule planning and course selection optimization. Demonstrates full-stack architectural integration.',
      tech: 'React · TypeScript · MongoDB · Tailwind',
    },
    {
      title: 'BRACU OCA System',
      desc: 'Club activity tracker and event approval workflow automation for the BRAC University Office of Co-Curricular Activities.',
      tech: 'Next.js · React · MongoDB',
    },
  ];

  const certifications = [
    { title: 'Certified Scrum Product Owner (CSPO)®', issuer: 'Scrum Alliance', date: 'Jun 2026', id: '2196763', link: 'https://bcert.me/siupsirvv' },
    { title: 'Project Initiation: Starting a Successful Project', issuer: 'Google · Coursera', date: 'Apr 2026', id: 'O2WTV45BBNIQ' },
    { title: 'Foundations of Project Management', issuer: 'Google · Coursera', date: 'Mar 2026', id: 'CRCUF0HV72LE' },
    { title: 'Generative AI for Project Managers', issuer: 'PMI', date: 'Feb 2026' },
  ];

  /* ────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 antialiased selection:bg-amber-500/30 selection:text-amber-100">

      {/* ── GLOBAL STYLES (injected once) ── */}
      <style>{`
        :root { scroll-behavior: smooth; }
        * { box-sizing: border-box; }

        /* scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #d97706; border-radius: 2px; }

        /* glass card */
        .glass {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
        }
        .glass:hover {
          border-color: rgba(245,158,11,0.18);
          box-shadow: 0 0 32px rgba(245,158,11,0.06);
        }

        /* ambient glow blobs */
        .glow-amber {
          position: absolute;
          border-radius: 50%;
          background: rgba(245,158,11,0.07);
          filter: blur(100px);
          pointer-events: none;
        }

        /* skill pill hover */
        .skill-pill {
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .skill-pill:hover {
          background: rgba(245,158,11,0.15);
          color: #fbbf24;
          transform: translateY(-1px);
        }

        /* noise overlay for texture */
        .noise::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }

        /* active nav underline slide */
        .nav-active::after {
          content: '';
          display: block;
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, #f59e0b, #fcd34d);
          border-radius: 2px;
          margin-top: 2px;
        }

        /* card hover lift */
        .card-lift {
          transition: transform 0.3s cubic-bezier(.25,.8,.25,1), box-shadow 0.3s;
        }
        .card-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        /* timeline line gradient */
        .timeline-line {
          background: linear-gradient(to bottom, #f59e0b, rgba(245,158,11,0.1));
        }

        /* form input */
        .form-input {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #f5f5f5;
          font-size: 13px;
          padding: 10px 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
          border-color: rgba(245,158,11,0.5);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.08);
        }
        .form-input.error {
          border-color: rgba(239,68,68,0.5);
        }
        .form-input::placeholder { color: #525252; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float { animation: float 6s ease-in-out infinite; }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>

      {/* ── BACK TO TOP ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-black rounded-full shadow-lg shadow-amber-500/25 transition-all duration-300 ${showBackToTop ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
        aria-label="Back to top"
      >
        <ChevronUp size={18} strokeWidth={2.5} />
      </button>

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? 'py-3 bg-[#080808]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50' : 'py-5 bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollTo('hero')}
            className="group flex items-center space-x-2"
          >
            <span className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black text-sm">N</span>
            <span className="font-bold text-sm tracking-wide text-neutral-200 group-hover:text-amber-400 transition-colors">
              nafis<span className="text-amber-500">.</span>dev
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(item => {
              const target = item === 'Home' ? 'hero' : item.toLowerCase();
              const active = activeSection === target;
              return (
                <button
                  key={item}
                  onClick={() => scrollTo(target)}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-all duration-200 ${active ? 'text-amber-400 bg-amber-500/10 font-semibold' : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'}`}
                >
                  {item}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-white/5 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a
              href="mailto:mdnafissadiqueniloy@gmail.com"
              className="hidden md:flex items-center space-x-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-all shadow-lg shadow-amber-500/20"
            >
              <Mail size={12} />
              <span>Hire Me</span>
            </a>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-white/5 transition-all"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      <div className={`fixed inset-0 z-30 md:hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-[#080808]/95 backdrop-blur-2xl" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute top-[68px] left-4 right-4 glass p-6 flex flex-col space-y-1 transition-all duration-300 ${isMenuOpen ? 'translate-y-0' : '-translate-y-4'}`}>
          {navLinks.map(item => {
            const target = item === 'Home' ? 'hero' : item.toLowerCase();
            return (
              <button key={item} onClick={() => scrollTo(target)} className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeSection === target ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-300 hover:bg-white/5'}`}>
                {item}
              </button>
            );
          })}
          <div className="pt-3 border-t border-white/5">
            <a href="mailto:mdnafissadiqueniloy@gmail.com" className="flex items-center justify-center space-x-2 py-3 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-all">
              <Mail size={14} /><span>Hire Me</span>
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section id="hero" ref={sectionsRef.hero} className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Ambient blobs */}
        <div className="glow-amber w-[600px] h-[600px] top-[-100px] right-[-150px] opacity-60" />
        <div className="glow-amber w-[400px] h-[400px] bottom-[-50px] left-[-100px] opacity-40" />

        <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* ── Left text column ── */}
            <div className="space-y-8">
              {/* Badge */}
              <FadeUp delay={0}>
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Sparkles size={12} />
                  <span>Certified Scrum Product Owner (CSPO)® · ID 2196763</span>
                </div>
              </FadeUp>

              {/* Name & Typewriter */}
              <FadeUp delay={100}>
                <div className="space-y-3">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none">
                    <span className="text-white">Nafis</span>
                    <br />
                    <span className="text-white">Sadique</span>
                    <br />
                    <span className="text-neutral-500">Niloy</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-neutral-300 font-medium pt-1">
                    <Typewriter words={['Project Coordinator', 'Product Owner', 'Agile Practitioner', 'Delivery Specialist']} />
                  </p>
                </div>
              </FadeUp>

              {/* Bio */}
              <FadeUp delay={200}>
                <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
                  Computer Science graduate and CSPO® managing software delivery and Agile execution at ATI Limited. Bridging business needs and engineering teams across ERP, government, and enterprise platforms.
                </p>
              </FadeUp>

              {/* CTA buttons */}
              <FadeUp delay={300}>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => scrollTo('projects')}
                    className="group inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5"
                  >
                    <span>View Projects</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a
                    href="/CV of Md. Nafis Sadique Niloy.pdf"
                    download="CV_Md_Nafis_Sadique_Niloy.pdf"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 text-white text-sm font-medium rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    <Download size={13} />
                    <span>Download CV</span>
                  </a>
                  <a
                    href="/linkedin.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white/3 hover:bg-white/8 border border-white/6 hover:border-white/12 text-neutral-300 text-sm font-medium rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    <FileText size={13} />
                    <span>LinkedIn PDF</span>
                  </a>
                </div>
              </FadeUp>

              {/* Social icons + location */}
              <FadeUp delay={400}>
                <div className="flex items-center space-x-4">
                  <a href="https://github.com/Nafis588" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-amber-500/30 text-neutral-400 hover:text-amber-400 transition-all" aria-label="GitHub">
                    <Github size={16} />
                  </a>
                  <a href="https://www.linkedin.com/in/nafissn/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-amber-500/30 text-neutral-400 hover:text-amber-400 transition-all" aria-label="LinkedIn">
                    <Linkedin size={16} />
                  </a>
                  <a href="mailto:mdnafissadiqueniloy@gmail.com" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-amber-500/30 text-neutral-400 hover:text-amber-400 transition-all" aria-label="Email">
                    <Mail size={16} />
                  </a>
                  <div className="flex items-center space-x-1.5 text-xs text-neutral-500 pl-2 border-l border-white/8">
                    <MapPin size={11} className="text-amber-500" />
                    <span>Dhaka, BD</span>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* ── Right bento column ── */}
            <FadeUp delay={200} className="grid grid-cols-2 gap-4">
              {/* Big highlight card */}
              <div className="glass card-lift col-span-2 p-6 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Award size={22} className="text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold">Top Credential</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">CSPO® — Certified Scrum Product Owner</h3>
                  <p className="text-xs text-neutral-400 mt-1">Scrum Alliance · Credential ID: 2196763 · Jun 2026</p>
                  <a href="https://bcert.me/siupsirvv" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-[10px] text-amber-500 hover:text-amber-300 mt-2 transition-colors">
                    <span>Verify Credential</span><ExternalLink size={9} />
                  </a>
                </div>
              </div>

              {/* Current role */}
              <div className="glass card-lift p-5 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
                  <Briefcase size={16} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Trainee Project Coordinator</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">ATI Limited</p>
                  <span className="inline-block mt-2 text-[9px] px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">● Active · Jan 2026</span>
                </div>
              </div>

              {/* Education */}
              <div className="glass card-lift p-5 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
                  <GraduationCap size={16} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">B.Sc. Computer Science</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">BRAC University · CGPA 3.27</p>
                  <span className="inline-block mt-2 text-[9px] px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full">Graduated Sep 2025</span>
                </div>
              </div>

              {/* Club leadership */}
              <div className="glass card-lift col-span-2 p-5 flex items-center space-x-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Users size={16} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-white">Former President · BRAC University Computer Club</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Led 500+ members · Founded R&amp;D Dept · Directed IntraHacktive 1.0 hackathon</p>
                </div>
                <span className="text-[9px] text-neutral-500 whitespace-nowrap">Oct 2023 – Dec 2024</span>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ABOUT SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section id="about" ref={sectionsRef.about} className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">

          <FadeUp className="mb-14 text-center">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold">About Me</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Career Objective &amp; Competencies</h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full mx-auto mt-4" />
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Bio card */}
            <FadeUp delay={0} className="lg:col-span-5">
              <div className="glass card-lift h-full p-7 flex flex-col space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white mb-3">Who I Am</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Goal-oriented Computer Science graduate and Certified Scrum Product Owner® working as a Project Coordinator at ATI Limited. Hands-on experience managing software delivery, requirement elicitation, and Agile execution across ERP and government-sector projects.
                  </p>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Core strength: translating business needs into detailed technical requirements, aligning cross-functional teams (Design / Engineering / QA), and ensuring predictability in product releases.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { icon: MapPin, label: 'Dhaka, Bangladesh', color: 'text-amber-400' },
                    { icon: Briefcase, label: 'Project · Product Delivery', color: 'text-blue-400' },
                    { icon: Calendar, label: 'Jan 2026 – Present', color: 'text-emerald-400' },
                    { icon: CheckCircle, label: 'CSPO® Certified', color: 'text-violet-400' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center space-x-2">
                      <Icon size={13} className={color} />
                      <span className="text-[11px] text-neutral-300">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Skills grid */}
            <FadeUp delay={100} className="lg:col-span-7">
              <div className="glass card-lift h-full p-7 space-y-6">
                <h3 className="text-base font-bold text-white">Skills Portfolio</h3>

                {[
                  {
                    category: 'Project Management & Agile',
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/8',
                    border: 'border-amber-500/15',
                    skills: ['Sprint Planning', 'Backlog Grooming', 'UAT Facilitation', 'Release Readiness', 'Cross-functional Coordination', 'Agile / Hybrid SDLC'],
                  },
                  {
                    category: 'Requirements & Business Analysis',
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/8',
                    border: 'border-blue-500/15',
                    skills: ['Requirement Elicitation', 'User Story Mapping', 'BRD / SRS Writing', 'Acceptance Criteria', 'Workflow Analysis', 'Prioritization Workshops'],
                  },
                  {
                    category: 'Tools & Technical Stack',
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/8',
                    border: 'border-emerald-500/15',
                    skills: ['Jira', 'Notion', 'Slack', 'GitHub', 'React.js', 'TypeScript', 'Node.js', 'MongoDB', 'HTML5 & CSS3'],
                  },
                ].map(({ category, color, bg, border, skills }) => (
                  <div key={category}>
                    <h4 className={`text-[11px] font-bold uppercase tracking-wider ${color} mb-2.5`}>{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(s => (
                        <span key={s} className={`skill-pill text-[11px] px-2.5 py-1 ${bg} border ${border} text-neutral-300 rounded-lg cursor-default`}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          PROJECTS SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section id="projects" ref={sectionsRef.projects} className="py-24 relative">
        {/* top separator */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        <div className="max-w-6xl mx-auto px-6">

          <FadeUp className="mb-14 text-center">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold">Portfolio</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Coordinated Projects</h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full mx-auto mt-4" />
          </FadeUp>

          {/* Enterprise grid */}
          <div className="mb-12">
            <FadeUp>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-1 h-5 bg-amber-500 rounded-full" />
                <h3 className="text-sm font-bold text-neutral-200">Enterprise Delivery — ATI Limited</h3>
              </div>
            </FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enterpriseProjects.map((proj, idx) => (
                <FadeUp key={idx} delay={idx * 60}>
                  <div className={`glass card-lift h-full p-6 flex flex-col justify-between group relative overflow-hidden`}>
                    {/* gradient accent top bar */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${proj.accent} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-widest px-2 py-1 bg-amber-500/8 text-amber-400 border border-amber-500/15 rounded-md">
                        {proj.client}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-3 mb-2">{proj.title}</h4>
                      <p className="text-[12px] text-neutral-400 leading-relaxed">{proj.desc}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/5">
                      {proj.tags.map(tag => (
                        <span key={tag} className="text-[9px] px-2 py-0.5 bg-white/4 border border-white/8 text-neutral-400 rounded-md">{tag}</span>
                      ))}
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Academic grid */}
          <div>
            <FadeUp>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <h3 className="text-sm font-bold text-neutral-200">Academic Engineering</h3>
              </div>
            </FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {academicProjects.map((proj, idx) => (
                <FadeUp key={idx} delay={idx * 80}>
                  <div className="glass card-lift h-full p-6 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/40 to-violet-600/5" />
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-widest px-2 py-1 bg-violet-500/8 text-violet-400 border border-violet-500/15 rounded-md">
                        Academic Project
                      </span>
                      <h4 className="text-sm font-bold text-white mt-3 mb-2">{proj.title}</h4>
                      <p className="text-[12px] text-neutral-400 leading-relaxed">{proj.desc}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-white/5">
                      <Code size={11} className="text-amber-500 flex-shrink-0" />
                      <span className="text-[10px] text-neutral-500">{proj.tech}</span>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          EXPERIENCE SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section id="experience" ref={sectionsRef.experience} className="py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        <div className="max-w-6xl mx-auto px-6">

          <FadeUp className="mb-14 text-center">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold">My Journey</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Experience &amp; Credentials</h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full mx-auto mt-4" />
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── Work Experience Timeline ── */}
            <div className="lg:col-span-7 space-y-0">
              <FadeUp>
                <div className="flex items-center space-x-2 mb-8">
                  <div className="w-1 h-5 bg-amber-500 rounded-full" />
                  <h3 className="text-sm font-bold text-neutral-200">Work Experience</h3>
                </div>
              </FadeUp>

              <div className="relative">
                {/* Timeline vertical line */}
                <div className="absolute left-4 top-2 bottom-2 w-px timeline-line" />

                <div className="space-y-10 pl-12">
                  {[
                    {
                      date: 'Jan 2026 – Present',
                      role: 'Trainee Project Coordinator',
                      company: 'ATI Limited',
                      status: 'Current',
                      statusColor: 'text-green-400 bg-green-500/10 border-green-500/20',
                      points: [
                        'Coordinating delivery of multiple ERP, government, and web platform projects across education, energy, and public-sector clients.',
                        'Supporting requirement engineering (BRD/SRS inputs), sprint tracking, cross-team alignment, and delivery follow-ups with Dev/QA/Design.',
                        'Assisting UAT coordination, release readiness, documentation, and stakeholder communication for ongoing implementations.',
                      ],
                    },
                    {
                      date: 'Oct 2025 – Dec 2025',
                      role: 'Project Management Intern',
                      company: 'ATI Limited',
                      status: 'Completed',
                      statusColor: 'text-neutral-400 bg-white/5 border-white/10',
                      points: [
                        'Supported requirement elicitation, backlog refinement, sprint review preparation, and coordinating task boards.',
                        'Facilitated team syncs and developer follow-ups to maintain sprint goals and lock deliverables.',
                      ],
                    },
                  ].map((exp, idx) => (
                    <FadeUp key={idx} delay={idx * 100}>
                      <div className="relative">
                        {/* Timeline node */}
                        <div className="absolute -left-[37px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#080808] border-2 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                        <div className="glass card-lift p-6">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div>
                              <h3 className="text-sm font-bold text-white">{exp.role}</h3>
                              <p className="text-xs text-amber-400 mt-0.5">{exp.company}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${exp.statusColor}`}>{exp.status}</span>
                              <span className="text-[10px] text-neutral-500">{exp.date}</span>
                            </div>
                          </div>
                          <ul className="space-y-2">
                            {exp.points.map((pt, pi) => (
                              <li key={pi} className="flex items-start space-x-2.5">
                                <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                <span className="text-[12px] text-neutral-400 leading-relaxed">{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </FadeUp>
                  ))}
                </div>
              </div>

              {/* Education card */}
              <FadeUp delay={200} className="mt-8">
                <div className="glass card-lift p-6 flex items-center space-x-5">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={22} className="text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">B.Sc. in Computer Science</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">BRAC University</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">CGPA: 3.27 / 4.00 &nbsp;·&nbsp; Jun 2021 – Sep 2025</p>
                  </div>
                  <span className="text-[9px] px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full font-semibold">Completed</span>
                </div>
              </FadeUp>
            </div>

            {/* ── Right column: Leadership + Certifications ── */}
            <div className="lg:col-span-5 space-y-6">

              {/* Leadership */}
              <FadeUp>
                <div className="glass card-lift p-6 space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                    <h3 className="text-sm font-bold text-neutral-200">Leadership</h3>
                  </div>
                  {[
                    { role: 'President', org: 'BRAC University Computer Club (BUCC)', period: 'Oct 2023 – Dec 2024' },
                    { role: 'Senior Executive, HR', org: 'BRAC University Computer Club (BUCC)', period: 'Jun 2022 – Oct 2023' },
                  ].map((lead, li) => (
                    <div key={li} className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-0.5">
                      <h4 className="text-xs font-bold text-white">{lead.role}</h4>
                      <p className="text-[10px] text-emerald-400">{lead.org}</p>
                      <p className="text-[9px] text-neutral-500">{lead.period}</p>
                    </div>
                  ))}
                  <p className="text-[11px] text-neutral-400 leading-relaxed pt-1 border-t border-white/5">
                    Led a tech org with <strong className="text-neutral-200">500+ active members</strong>. Founded the R&amp;D Department and Web &amp; App Team. Directed the end-to-end execution of the <strong className="text-neutral-200">IntraHacktive 1.0</strong> hackathon.
                  </p>
                </div>
              </FadeUp>

              {/* Certifications */}
              <FadeUp delay={100}>
                <div className="glass card-lift p-6 space-y-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-1 h-5 bg-amber-500 rounded-full" />
                    <h3 className="text-sm font-bold text-neutral-200">Credentials</h3>
                  </div>
                  {certifications.map((cert, ci) => (
                    <div key={ci} className={`pb-4 ${ci < certifications.length - 1 ? 'border-b border-white/5' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[11px] font-bold text-white leading-snug flex-1">{cert.title}</h4>
                        <span className="text-[9px] text-neutral-500 whitespace-nowrap">{cert.date}</span>
                      </div>
                      <p className="text-[9px] text-amber-400 mt-0.5">{cert.issuer}</p>
                      {cert.id && <p className="text-[9px] text-neutral-500 mt-0.5">ID: {cert.id}</p>}
                      {cert.link && (
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-[9px] text-amber-500 hover:text-amber-300 mt-1.5 transition-colors">
                          <span>Verify</span><ExternalLink size={8} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CONTACT SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section id="contact" ref={sectionsRef.contact} className="py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        <div className="glow-amber w-[500px] h-[500px] bottom-0 left-1/2 -translate-x-1/2 opacity-30" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">

          <FadeUp className="mb-14 text-center">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold">Connect</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Get In Touch</h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full mx-auto mt-4" />
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Info column */}
            <div className="lg:col-span-4 space-y-5">
              <FadeUp>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Open to product coordination, project management, and business analysis roles. Drop a message — I will respond within 24 hours.
                </p>
              </FadeUp>

              {[
                { icon: Mail, label: 'Email', value: 'mdnafissadiqueniloy@gmail.com', href: 'mailto:mdnafissadiqueniloy@gmail.com', delay: 50 },
                { icon: MapPin, label: 'Location', value: 'Bashundhara RA, Dhaka, Bangladesh', href: null, delay: 100 },
              ].map(({ icon: Icon, label, value, href, delay }) => (
                <FadeUp key={label} delay={delay}>
                  <div className="glass card-lift p-5 flex items-start space-x-4">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">{label}</p>
                      {href ? (
                        <a href={href} className="text-[12px] text-neutral-200 hover:text-amber-400 transition-colors mt-0.5 block">{value}</a>
                      ) : (
                        <p className="text-[12px] text-neutral-200 mt-0.5">{value}</p>
                      )}
                    </div>
                  </div>
                </FadeUp>
              ))}

              <FadeUp delay={150}>
                <div className="glass card-lift p-5 space-y-3">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Social Profiles</p>
                  <div className="flex space-x-3">
                    <a href="https://github.com/Nafis588" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white/4 border border-white/8 hover:border-amber-500/25 hover:text-amber-400 text-neutral-300 text-xs font-medium transition-all">
                      <Github size={14} /><span>GitHub</span>
                    </a>
                    <a href="https://www.linkedin.com/in/nafissn/" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white/4 border border-white/8 hover:border-amber-500/25 hover:text-amber-400 text-neutral-300 text-xs font-medium transition-all">
                      <Linkedin size={14} /><span>LinkedIn</span>
                    </a>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* Contact form */}
            <FadeUp delay={100} className="lg:col-span-8">
              <form onSubmit={handleSubmit} className="glass card-lift p-8 space-y-5">
                <h3 className="text-sm font-bold text-white">Send a Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Full Name</label>
                    <input
                      type="text" id="name" name="name" value={formData.name} onChange={handleInput}
                      placeholder="Your Name"
                      className={`form-input ${formErrors.name ? 'error' : ''}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Email Address</label>
                    <input
                      type="email" id="email" name="email" value={formData.email} onChange={handleInput}
                      placeholder="your@email.com"
                      className={`form-input ${formErrors.email ? 'error' : ''}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Subject</label>
                  <input
                    type="text" id="subject" name="subject" value={formData.subject} onChange={handleInput}
                    placeholder="Project Inquiry / Collaboration / Opportunity"
                    className={`form-input ${formErrors.subject ? 'error' : ''}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Message</label>
                  <textarea
                    id="message" name="message" rows={5} value={formData.message} onChange={handleInput}
                    placeholder="Describe your inquiry..."
                    className={`form-input resize-none ${formErrors.message ? 'error' : ''}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:-translate-y-0.5"
                >
                  {submitting ? <span>Sending...</span> : <><span>Send Message</span><Send size={13} /></>}
                </button>

                {formStatus.text && (
                  <div className={`p-3 rounded-xl text-xs font-medium border ${formStatus.type === 'success' ? 'bg-emerald-500/8 text-emerald-400 border-emerald-500/20' : 'bg-red-500/8 text-red-400 border-red-500/20'}`}>
                    {formStatus.text}
                  </div>
                )}
              </form>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-neutral-500 text-xs">
          <div className="flex items-center space-x-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black text-xs">N</span>
            <div>
              <p className="text-neutral-300 font-semibold text-sm">Nafis Sadique Niloy</p>
              <p className="text-[10px]">Personal Portfolio · Project Coordinator</p>
            </div>
          </div>
          <p className="text-[10px]">© 2026 Md. Nafis Sadique Niloy · All rights reserved.</p>
          <div className="flex space-x-3">
            <a href="https://github.com/Nafis588" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors" aria-label="GitHub"><Github size={15} /></a>
            <a href="https://www.linkedin.com/in/nafissn/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors" aria-label="LinkedIn"><Linkedin size={15} /></a>
            <a href="mailto:mdnafissadiqueniloy@gmail.com" className="hover:text-amber-400 transition-colors" aria-label="Email"><Mail size={15} /></a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
