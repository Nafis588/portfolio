import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Github, Linkedin, Mail, Moon, Sun, ChevronUp, MapPin,
  Briefcase, ExternalLink, Code, Send, Menu, X, ArrowRight,
  Award, GraduationCap, Users, Download, FileText, Sparkles,
  CheckCircle, Calendar,
} from 'lucide-react';

/* ─── intersection-observer hook ─── */
function useVisible(rootMargin = '-80px') {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return { ref, visible };
}

/* ─── animated section reveal ─── */
function Reveal({ children, delay = 0, from = 'bottom', className = '', style: extraStyle }: {
  children: React.ReactNode; delay?: number; from?: 'bottom' | 'left' | 'right'; className?: string; style?: React.CSSProperties;
}) {
  const { ref, visible } = useVisible();
  const transforms: Record<string, string> = { bottom: 'translateY(40px)', left: 'translateX(-40px)', right: 'translateX(40px)' };
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      ...extraStyle,
      transform: visible ? 'none' : transforms[from],
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>{children}</div>
  );
}

/* ─── typewriter ─── */
function Typewriter({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  const [txt, setTxt] = useState('');
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[idx % words.length];
    const t = setTimeout(() => {
      if (!del) {
        setTxt(word.slice(0, txt.length + 1));
        if (txt.length + 1 === word.length) setTimeout(() => setDel(true), 2000);
      } else {
        setTxt(word.slice(0, txt.length - 1));
        if (txt.length - 1 === 0) { setDel(false); setIdx(i => i + 1); }
      }
    }, del ? 35 : 80);
    return () => clearTimeout(t);
  }, [txt, del, idx, words]);
  return <><span className="text-violet-400">{txt}</span><span className="text-violet-400 animate-pulse">|</span></>;
}

/* ─── counter animation ─── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const { ref, visible } = useVisible();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const id = setInterval(() => { start = Math.min(start + step, to); setCount(start); if (start >= to) clearInterval(id); }, 40);
    return () => clearInterval(id);
  }, [visible, to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ══════════════════════════════════════════════════ MAIN APP ══ */
export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [active, setActive] = useState('hero');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formErr, setFormErr] = useState({ name: false, email: false, subject: false, message: false });
  const [formStatus, setFormStatus] = useState<{ t: 'success' | 'error' | ''; msg: string }>({ t: '', msg: '' });
  const [sending, setSending] = useState(false);

  const sections = { hero: useRef<HTMLElement>(null), about: useRef<HTMLElement>(null), projects: useRef<HTMLElement>(null), experience: useRef<HTMLElement>(null), contact: useRef<HTMLElement>(null) };

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const t = saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(t); applyTheme(t);
  }, []);

  const applyTheme = (t: string) => {
    document.documentElement.classList.toggle('dark', t === 'dark');
    document.documentElement.setAttribute('data-theme', t);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next); localStorage.setItem('theme', next); applyTheme(next);
  };

  const goTo = useCallback((id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;
      setScrolled(y > 60); setShowTop(y > 400);
      for (const k of ['contact', 'experience', 'projects', 'about', 'hero'] as const) {
        const el = sections[k].current;
        if (el && y >= el.offsetTop - 200) { setActive(k); break; }
      }
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setFormErr(p => ({ ...p, [name]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = {
      name: !formData.name.trim(), email: !formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      subject: !formData.subject.trim(), message: !formData.message.trim(),
    };
    setFormErr(errs);
    if (Object.values(errs).some(Boolean)) { setFormStatus({ t: 'error', msg: 'Please fill in all required fields.' }); return; }
    setSending(true);
    try {
      const res = await fetch('http://localhost:5000/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setFormStatus({ t: 'success', msg: 'Message sent! I\'ll get back to you within 24 hours.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setFormStatus({ t: 'error', msg: err.message || 'Failed to send.' });
    } finally { setSending(false); }
  };

  const nav = ['Home', 'About', 'Projects', 'Experience', 'Contact'];
  const skills = {
    'Project Management': ['Sprint Planning', 'Backlog Grooming', 'UAT Facilitation', 'Release Readiness', 'Agile/Hybrid SDLC', 'Cross-functional Teams'],
    'Business Analysis': ['Requirement Elicitation', 'User Story Mapping', 'BRD/SRS Writing', 'Workflow Analysis', 'Acceptance Criteria', 'Prioritization'],
    'Tools & Tech': ['Jira', 'Notion', 'Slack', 'GitHub', 'React.js', 'TypeScript', 'Node.js', 'MongoDB'],
  };

  /* ── RENDER ── */
  return (
    <div className="min-h-screen bg-[#05050c] text-neutral-100 antialiased">

      {/* ── INJECTED CSS ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }
        :root { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 2px; }

        /* ── layout containers ── */
        .site-wrap   { max-width: 1480px; margin: 0 auto; padding: 0 40px; }
        .site-wrap-sm{ max-width: 1100px; margin: 0 auto; padding: 0 40px; }

        @media (max-width: 768px) {
          .site-wrap, .site-wrap-sm { padding: 0 20px; }
        }

        /* ── section divider ── */
        .section-line { width: 48px; height: 3px; background: linear-gradient(90deg,#8b5cf6,#ec4899); border-radius: 2px; }

        /* ── card ── */
        .card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
        }
        .card:hover {
          border-color: rgba(139, 92, 246,0.25);
          box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(139, 92, 246,0.08);
          transform: translateY(-3px);
        }

        /* ── pill ── */
        .pill {
          display: inline-flex; align-items: center;
          padding: 4px 12px; font-size: 11px; font-weight: 600;
          background: rgba(139, 92, 246,0.08); color: #a78bfa;
          border: 1px solid rgba(139, 92, 246,0.18); border-radius: 999px;
          letter-spacing: 0.05em;
        }

        /* ── tag ── */
        .tag {
          display: inline-block; padding: 3px 10px;
          font-size: 10px; font-weight: 600;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; color: #a3a3a3;
          transition: background 0.2s, color 0.2s;
          cursor: default;
        }
        .tag:hover { background: rgba(139, 92, 246,0.12); color: #a78bfa; }

        /* ── skill block ── */
        .skill-group { border-radius: 16px; padding: 20px 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); }

        /* ── project card ── */
        .proj-card {
          position: relative; overflow: hidden;
          border-radius: 20px; padding: 28px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          display: flex; flex-direction: column; gap: 14px;
        }
        .proj-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246,0.5), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .proj-card:hover { border-color: rgba(139, 92, 246,0.2); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        .proj-card:hover::before { opacity: 1; }

        /* ── timeline ── */
        .tl-line { position: absolute; left: 23px; top: 48px; bottom: 0; width: 1px; background: linear-gradient(to bottom, rgba(139, 92, 246,0.6), transparent); }
        .tl-dot { width: 14px; height: 14px; border-radius: 50%; background: #05050c; border: 2px solid #8b5cf6; box-shadow: 0 0 10px rgba(139, 92, 246,0.4); flex-shrink: 0; margin-top: 4px; }

        /* ── form ── */
        .form-field {
          width: 100%; padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px; color: #f5f5f5;
          font-size: 13px; outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          font-family: inherit;
        }
        .form-field::placeholder { color: #4a4a4a; }
        .form-field:focus { border-color: rgba(139, 92, 246,0.45); box-shadow: 0 0 0 3px rgba(139, 92, 246,0.07); }
        .form-field.err { border-color: rgba(239,68,68,0.5); }

        /* ── nav ── */
        .nav-pill { padding: 6px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; transition: background 0.2s, color 0.2s; cursor: pointer; border: none; background: transparent; color: #737373; }
        .nav-pill:hover { color: #e5e5e5; background: rgba(255,255,255,0.05); }
        .nav-pill.active { color: #8b5cf6; background: rgba(139, 92, 246,0.1); font-weight: 600; }

        /* ── hero ── */
        .hero-number { font-size: clamp(120px, 18vw, 220px); font-weight: 900; line-height: 0.85; letter-spacing: -0.06em; color: rgba(255,255,255,0.04); user-select: none; pointer-events: none; }

        /* ── section label ── */
        .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #8b5cf6; }

        /* ── glow ── */
        .glow { position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none; }

        /* ── stat ── */
        .stat-item { padding: 28px 32px; border-right: 1px solid rgba(255,255,255,0.06); }
        .stat-item:last-child { border-right: none; }

        /* ── hover btn ── */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 24px; font-size: 13px; font-weight: 700;
          background: #8b5cf6; color: #000; border: none; border-radius: 12px;
          cursor: pointer; transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
        }
        .btn-primary:hover { background: #a78bfa; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139, 92, 246,0.3); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 22px; font-size: 13px; font-weight: 600;
          background: rgba(255,255,255,0.04); color: #d4d4d4;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          cursor: pointer; transition: background 0.2s, border-color 0.2s, transform 0.2s;
          text-decoration: none;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(139, 92, 246,0.25); transform: translateY(-2px); color: #fff; }

        /* ── scroll indicator ── */
        @keyframes scrollBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        .scroll-bounce { animation: scrollBounce 1.5s ease-in-out infinite; }

        /* ── cert badge ── */
        .cert-row { display: flex; align-items: flex-start; gap: 14px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .cert-row:last-child { border-bottom: none; padding-bottom: 0; }
        .cert-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(139, 92, 246,0.1); border: 1px solid rgba(139, 92, 246,0.2); }

        @keyframes fadeInDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:none} }
        .fade-in-down { animation: fadeInDown 0.25s ease forwards; }
      `}</style>

      {/* ───────────────────────── BACK TO TOP ───────────────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 60,
          width: 44, height: 44, borderRadius: 12,
          background: '#8b5cf6', color: '#000', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(139, 92, 246,0.35)',
          opacity: showTop ? 1 : 0, transform: showTop ? 'scale(1)' : 'scale(0.7)',
          transition: 'opacity 0.3s, transform 0.3s', pointerEvents: showTop ? 'auto' : 'none',
        }}
      >
        <ChevronUp size={18} strokeWidth={2.5} />
      </button>

      {/* ───────────────────────── NAVBAR ───────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.4s',
        padding: scrolled ? '10px 0' : '18px 0',
        background: scrolled ? 'rgba(5, 5, 12, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      }}>
        <div className="site-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <button onClick={() => goTo('hero')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, color: '#000' }}>N</div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#e5e5e5', letterSpacing: '-0.01em' }}>Nafis<span style={{ color: '#8b5cf6' }}>.</span></span>
          </button>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 4 }} className="hidden-mobile">
            {nav.map(item => {
              const id = item === 'Home' ? 'hero' : item.toLowerCase();
              return (
                <button key={item} onClick={() => goTo(id)} className={`nav-pill ${active === id ? 'active' : ''}`}>{item}</button>
              );
            })}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#a3a3a3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <a href="mailto:mdnafissadiqueniloy@gmail.com" className="btn-primary hidden-mobile" style={{ padding: '8px 18px', fontSize: 12 }}>
              <Mail size={12} /> Hire Me
            </a>
            <button onClick={() => setMenuOpen(!menuOpen)} className="show-mobile" style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#a3a3a3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Menu">
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="fade-in-down site-wrap" style={{ paddingTop: 12, paddingBottom: 12 }}>
            <div style={{ background: 'rgba(10, 10, 20, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 8px', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {nav.map(item => {
                const id = item === 'Home' ? 'hero' : item.toLowerCase();
                return <button key={item} onClick={() => goTo(id)} className={`nav-pill ${active === id ? 'active' : ''}`} style={{ textAlign: 'left' }}>{item}</button>;
              })}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <a href="mailto:mdnafissadiqueniloy@gmail.com" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}><Mail size={13} /> Hire Me</a>
              </div>
            </div>
          </div>
        )}
      </header>

      <style>{`
        @media(min-width:769px){ .hidden-mobile{ display:flex !important; } .show-mobile{ display:none !important; } }
        @media(max-width:768px){ .hidden-mobile{ display:none !important; } .show-mobile{ display:flex !important; } }
      `}</style>

      {/* ═══════════════════════════════ HERO ═══════════════════════════ */}
      <section id="hero" ref={sections.hero} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', paddingTop: 100, paddingBottom: 60 }}>

        {/* Background decorations */}
        <div className="glow" style={{ width: 700, height: 700, top: -200, right: -200, background: 'rgba(139, 92, 246,0.06)' }} />
        <div className="glow" style={{ width: 400, height: 400, bottom: 0, left: -100, background: 'rgba(139, 92, 246,0.04)' }} />

        {/* Watermark number */}
        <div className="hero-number" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', userSelect: 'none', lineHeight: 1 }}>01</div>

        <div className="site-wrap">
          {/* ── Top badge ── */}
          <Reveal delay={0}>
            <div style={{ marginBottom: 32 }}>
              <span className="pill"><Sparkles size={11} style={{ marginRight: 6 }} />CSPO® · Credential ID 2196763 · Scrum Alliance</span>
            </div>
          </Reveal>

          {/* ── Name block ── */}
          <Reveal delay={80}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 900, lineHeight: 0.92, letterSpacing: '-0.04em', color: '#fff' }}>
                Md. Nafis<br />
                <span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.25)', color: 'transparent' }}>Sadique</span><br />
                <span style={{ color: '#8b5cf6' }}>Niloy</span>
              </h1>
            </div>
          </Reveal>

          {/* ── Typewriter subtitle ── */}
          <Reveal delay={160}>
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 500, color: '#a3a3a3', marginBottom: 24, letterSpacing: '-0.01em' }}>
              <Typewriter words={['Project Coordinator', 'Certified Product Owner', 'Agile Practitioner', 'Delivery Specialist']} />
            </p>
          </Reveal>

          {/* ── Bio line ── */}
          <Reveal delay={220}>
            <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.7, maxWidth: 520, marginBottom: 36 }}>
              Computer Science graduate and CSPO® managing ERP, government, and enterprise software delivery at ATI Limited — bridging business needs with engineering execution.
            </p>
          </Reveal>

          {/* ── CTA row ── */}
          <Reveal delay={290}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 48 }}>
              <button className="btn-primary" onClick={() => goTo('projects')}>
                View Projects <ArrowRight size={14} />
              </button>
              <a href="/CV of Md. Nafis Sadique Niloy.pdf" download="CV_Md_Nafis_Sadique_Niloy.pdf" className="btn-ghost">
                <Download size={13} /> Download CV
              </a>
              <a href="/linkedin.pdf" target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <FileText size={13} /> LinkedIn PDF
              </a>
            </div>
          </Reveal>

          {/* ── Social row ── */}
          <Reveal delay={350}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {[
                { icon: Github, href: 'https://github.com/Nafis588', label: 'GitHub' },
                { icon: Linkedin, href: 'https://www.linkedin.com/in/nafissn/', label: 'LinkedIn' },
                { icon: Mail, href: 'mailto:mdnafissadiqueniloy@gmail.com', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" aria-label={label}
                  style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#737373', transition: 'all 0.2s', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#8b5cf6'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139, 92, 246,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#737373'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  <Icon size={16} />
                </a>
              ))}
              <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#525252', fontSize: 12 }}>
                <MapPin size={11} style={{ color: '#8b5cf6' }} /> Dhaka, Bangladesh
              </div>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#404040', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <div className="scroll-bounce" style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, #8b5cf6, transparent)' }} />
        </div>
      </section>

      {/* ═══════════════════════ STATS STRIP ═══════════════════════════ */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
        <div className="site-wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { value: 5, suffix: '+', label: 'Enterprise Projects', icon: Briefcase },
              { value: 4, suffix: '', label: 'Certifications', icon: Award },
              { value: 500, suffix: '+', label: 'Club Members Led', icon: Users },
              { value: 3, suffix: '+', label: 'Years in Tech', icon: Calendar },
            ].map(({ value, suffix, label, icon: Icon }, i) => (
              <Reveal key={label} delay={i * 80}>
                <div className="stat-item" style={{ textAlign: 'center', padding: '32px 24px' }}>
                  <Icon size={18} style={{ color: '#8b5cf6', marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    <Counter to={value} suffix={suffix} />
                  </div>
                  <div style={{ fontSize: 11, color: '#525252', marginTop: 6, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ABOUT SECTION ════════════════════════ */}
      <section id="about" ref={sections.about} style={{ padding: '100px 0', position: 'relative' }}>
        <div className="glow" style={{ width: 500, height: 500, top: 0, left: -200, background: 'rgba(139, 92, 246,0.04)' }} />

        <div className="site-wrap">
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 64, flexWrap: 'wrap', gap: 20 }}>
            <Reveal>
              <div>
                <p className="section-label" style={{ marginBottom: 12 }}>About Me</p>
                <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                  Career Objective<br />& Competencies
                </h2>
                <div className="section-line" style={{ marginTop: 16 }} />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div style={{ maxWidth: 380 }}>
                <p style={{ fontSize: 13, color: '#737373', lineHeight: 1.8 }}>
                  Goal-oriented Computer Science graduate and Certified Scrum Product Owner® working as a Project Coordinator. Hands-on experience managing software delivery, requirement elicitation, and Agile execution across ERP and government-sector projects.
                </p>
              </div>
            </Reveal>
          </div>

          {/* ── Two-column: Bio + Skills ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

            {/* Bio card */}
            <Reveal from="left">
              <div className="card" style={{ padding: '32px 36px', height: '100%' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Who I Am</h3>

                <p style={{ fontSize: 13, color: '#737373', lineHeight: 1.85, marginBottom: 20 }}>
                  My core strength lies in translating business needs into detailed technical requirements, aligning cross-functional teams (Design / Engineering / QA), and ensuring predictability in product releases.
                </p>

                <p style={{ fontSize: 13, color: '#737373', lineHeight: 1.85, marginBottom: 28 }}>
                  I look to leverage my skills in a Project or Product Management role to drive delivery efficiency and business value across enterprise and government clients.
                </p>

                {/* Quick facts grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { icon: MapPin, text: 'Dhaka, Bangladesh', color: '#8b5cf6' },
                    { icon: Briefcase, text: 'ATI Limited', color: '#60a5fa' },
                    { icon: CheckCircle, text: 'CSPO® Certified', color: '#34d399' },
                    { icon: GraduationCap, text: 'BRAC University', color: '#a78bfa' },
                  ].map(({ icon: Icon, text, color }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={13} style={{ color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: '#a3a3a3', fontWeight: 600 }}>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Availability badge */}
                <div style={{ marginTop: 28, padding: '10px 16px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>Available for new opportunities</span>
                </div>
              </div>
            </Reveal>

            {/* Skills */}
            <Reveal from="right" delay={80}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Skills Portfolio</h3>
                {Object.entries(skills).map(([cat, list], ci) => {
                  const colors = ['#8b5cf6', '#60a5fa', '#a78bfa'];
                  return (
                    <div key={cat} className="skill-group">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 3, height: 14, borderRadius: 2, background: colors[ci] }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: colors[ci], textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cat}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {list.map(s => <span key={s} className="tag">{s}</span>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PROJECTS ══════════════════════════════ */}
      <section id="projects" ref={sections.projects} style={{ padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', background: 'rgba(255,255,255,0.008)' }}>
        <div className="glow" style={{ width: 600, height: 600, top: 0, right: -200, background: 'rgba(139, 92, 246,0.04)' }} />

        <div className="site-wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 20 }}>
            <Reveal>
              <div>
                <p className="section-label" style={{ marginBottom: 12 }}>Portfolio</p>
                <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                  Coordinated<br />Projects
                </h2>
                <div className="section-line" style={{ marginTop: 16 }} />
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div style={{ padding: '8px 14px', background: 'rgba(139, 92, 246,0.08)', border: '1px solid rgba(139, 92, 246,0.18)', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={13} style={{ color: '#8b5cf6' }} />
                <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>ATI Limited — Enterprise Delivery</span>
              </div>
            </Reveal>
          </div>

          {/* ── Feature card (first) + grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20, marginBottom: 20 }}>

            {/* Featured project */}
            <div style={{ gridColumn: 'span 5' }}>
              <Reveal from="left" style={{ height: '100%' }}>
                <div className="proj-card" style={{ height: '100%' }}>
                  <span className="pill" style={{ alignSelf: 'flex-start' }}>Bangladesh Navy</span>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em' }}>Budget Management System</h3>
                  <p style={{ fontSize: 12, color: '#737373', lineHeight: 1.8 }}>
                    Led requirement elicitation and delivery coordination of budget workflow modules with engineering teams. Acted as stakeholder liaison to lock scope and manage change requests across phased rollout.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                    {['Scope Management', 'Backlog Tracking', 'Agile Execution'].map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right side 2×2 grid */}
            <div style={{ gridColumn: 'span 7', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                { title: 'NATDOC Website (CMS)', client: 'Bangladesh Navy', tags: ['SRS', 'CMS', 'Requirement Eng.'], desc: 'On-site requirement validation, finalized SRS for content structures and approval workflows.' },
                { title: 'ERP Modules (HR, Payroll)', client: 'Jamuna Oil Co.', tags: ['Gap Analysis', 'ERP', 'Timeline Tracking'], desc: 'Gap analysis and requirement detailing for HR and Payroll ERP modules.' },
                { title: 'University CMS Portal', client: 'Bangladesh Maritime Uni.', tags: ['Content Migration', 'CMS', 'Issue Triage'], desc: 'Coordinated full redesign, content migration, and rollout workflows.' },
                { title: 'Healthcare Platform', client: 'Ghana Client', tags: ['Multi-Tenant', 'Cross-Border'], desc: 'Multi-tenant platform delivery across multiple hospital systems, cross-border coordination.' },
              ].map((p, i) => (
                <Reveal key={p.title} delay={i * 60}>
                  <div className="proj-card" style={{ height: '100%' }}>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b5cf6', background: 'rgba(139, 92, 246,0.08)', border: '1px solid rgba(139, 92, 246,0.15)', padding: '3px 8px', borderRadius: 6, alignSelf: 'flex-start', display: 'inline-block' }}>{p.client}</span>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{p.title}</h4>
                    <p style={{ fontSize: 11, color: '#737373', lineHeight: 1.7, flexGrow: 1 }}>{p.desc}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto' }}>
                      {p.tags.map(t => <span key={t} className="tag" style={{ fontSize: 9 }}>{t}</span>)}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Academic row */}
          <div style={{ marginTop: 40 }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <GraduationCap size={15} style={{ color: '#a78bfa' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Academic Engineering</span>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {[
                { title: 'USIS 3.0 Student Portal', desc: 'Student portal with schedule planning and course selection optimization. Built to demonstrate full-stack architectural integration.', tech: 'React · TypeScript · MongoDB · Tailwind' },
                { title: 'BRACU OCA System', desc: 'Club activity tracker and event approval workflow automation for the BRAC University Office of Co-Curricular Activities.', tech: 'Next.js · React · MongoDB' },
              ].map((p, i) => (
                <Reveal key={p.title} delay={i * 80}>
                  <div className="proj-card">
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a78bfa', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.18)', padding: '3px 8px', borderRadius: 6, display: 'inline-block' }}>Academic</span>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{p.title}</h4>
                    <p style={{ fontSize: 12, color: '#737373', lineHeight: 1.7 }}>{p.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <Code size={11} style={{ color: '#8b5cf6' }} />
                      <span style={{ fontSize: 10, color: '#525252' }}>{p.tech}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ EXPERIENCE ════════════════════════════ */}
      <section id="experience" ref={sections.experience} style={{ padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>

        <div className="site-wrap">
          <Reveal style={{ marginBottom: 64 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>My Journey</p>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
              Experience &<br />Credentials
            </h2>
            <div className="section-line" style={{ marginTop: 16 }} />
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>

            {/* ── LEFT: Work + Education ── */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 28 }}>Work Experience</p>

              {/* Timeline */}
              <div style={{ position: 'relative' }}>
                <div className="tl-line" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingLeft: 52 }}>
                  {[
                    {
                      date: 'Jan 2026 – Present', role: 'Trainee Project Coordinator', company: 'ATI Limited',
                      status: 'Active', statusColor: '#34d399', statusBg: 'rgba(52,211,153,0.08)', statusBorder: 'rgba(52,211,153,0.2)',
                      points: ['Coordinating delivery of ERP, government, and web platform projects.', 'Supporting BRD/SRS inputs, sprint tracking, cross-team alignment with Dev/QA/Design.', 'Assisting UAT, release readiness, and stakeholder communication.'],
                    },
                    {
                      date: 'Oct 2025 – Dec 2025', role: 'Project Management Intern', company: 'ATI Limited',
                      status: 'Completed', statusColor: '#737373', statusBg: 'rgba(115,115,115,0.08)', statusBorder: 'rgba(115,115,115,0.2)',
                      points: ['Supported requirement elicitation, backlog refinement, and sprint reviews.', 'Facilitated developer follow-ups to maintain sprint goals.'],
                    },
                  ].map((exp, ei) => (
                    <Reveal key={ei} delay={ei * 100}>
                      <div style={{ position: 'relative' }}>
                        {/* Timeline dot */}
                        <div className="tl-dot" style={{ position: 'absolute', left: -42, top: 6 }} />

                        <div className="card" style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                            <div>
                              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{exp.role}</h3>
                              <p style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600 }}>{exp.company}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: exp.statusBg, color: exp.statusColor, border: `1px solid ${exp.statusBorder}` }}>{exp.status}</span>
                              <span style={{ fontSize: 10, color: '#525252' }}>{exp.date}</span>
                            </div>
                          </div>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {exp.points.map((pt, pi) => (
                              <li key={pi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0, marginTop: 6 }} />
                                <span style={{ fontSize: 11, color: '#737373', lineHeight: 1.7 }}>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* Education */}
              <Reveal delay={200} style={{ marginTop: 32 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Education</p>
                <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <GraduationCap size={20} style={{ color: '#a78bfa' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>B.Sc. in Computer Science</h4>
                    <p style={{ fontSize: 12, color: '#a3a3a3', marginTop: 2 }}>BRAC University</p>
                    <p style={{ fontSize: 11, color: '#525252', marginTop: 2 }}>CGPA: 3.27/4.00 · Jun 2021 – Sep 2025</p>
                  </div>
                  <span style={{ fontSize: 9, padding: '4px 10px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', borderRadius: 999, fontWeight: 700 }}>Done</span>
                </div>
              </Reveal>
            </div>

            {/* ── RIGHT: Leadership + Certifications ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Leadership */}
              <Reveal from="right">
                <div className="card" style={{ padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <Users size={16} style={{ color: '#34d399' }} />
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Leadership</h3>
                  </div>
                  {[
                    { role: 'President', org: 'BRAC University Computer Club (BUCC)', period: 'Oct 2023 – Dec 2024' },
                    { role: 'Senior Executive, HR', org: 'BRAC University Computer Club (BUCC)', period: 'Jun 2022 – Oct 2023' },
                  ].map((l, li) => (
                    <div key={li} style={{ padding: '14px 0', borderBottom: li === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{l.role}</h4>
                      <p style={{ fontSize: 11, color: '#34d399', fontWeight: 600, marginBottom: 2 }}>{l.org}</p>
                      <p style={{ fontSize: 10, color: '#525252' }}>{l.period}</p>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: '#737373', lineHeight: 1.75, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 4 }}>
                    Led <strong style={{ color: '#d4d4d4' }}>500+ active members</strong>. Founded R&D Department and Web & App Team. Directed <strong style={{ color: '#d4d4d4' }}>IntraHacktive 1.0</strong> hackathon end-to-end.
                  </p>
                </div>
              </Reveal>

              {/* Certifications */}
              <Reveal from="right" delay={100}>
                <div className="card" style={{ padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <Award size={16} style={{ color: '#8b5cf6' }} />
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Credentials</h3>
                  </div>
                  <div>
                    {[
                      { title: 'Certified Scrum Product Owner (CSPO)®', issuer: 'Scrum Alliance', date: 'Jun 2026', id: '2196763', link: 'https://bcert.me/siupsirvv' },
                      { title: 'Project Initiation: Starting a Successful Project', issuer: 'Google · Coursera', date: 'Apr 2026', id: 'O2WTV45BBNIQ' },
                      { title: 'Foundations of Project Management', issuer: 'Google · Coursera', date: 'Mar 2026', id: 'CRCUF0HV72LE' },
                      { title: 'Generative AI for Project Managers', issuer: 'PMI', date: 'Feb 2026' },
                    ].map((c, ci) => (
                      <div key={ci} className="cert-row">
                        <div className="cert-icon"><Award size={14} style={{ color: '#8b5cf6' }} /></div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 3 }}>{c.title}</h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                            <span style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 600 }}>{c.issuer}</span>
                            <span style={{ fontSize: 10, color: '#525252' }}>{c.date}</span>
                          </div>
                          {c.id && <p style={{ fontSize: 9, color: '#404040', marginTop: 2 }}>ID: {c.id}</p>}
                          {c.link && (
                            <a href={c.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, color: '#8b5cf6', textDecoration: 'none', marginTop: 4 }}>
                              Verify <ExternalLink size={8} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CONTACT ════════════════════════════════ */}
      <section id="contact" ref={sections.contact} style={{ padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', background: 'rgba(255,255,255,0.008)' }}>
        <div className="glow" style={{ width: 600, height: 600, bottom: -100, left: '50%', transform: 'translateX(-50%)', background: 'rgba(139, 92, 246,0.04)' }} />

        <div className="site-wrap-sm" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 60 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>Let's Talk</p>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em' }}>Get In Touch</h2>
            <div className="section-line" style={{ margin: '16px auto 0' }} />
            <p style={{ fontSize: 13, color: '#737373', marginTop: 16, lineHeight: 1.7, maxWidth: 460, margin: '16px auto 0' }}>
              Open to project coordination, product management, and business analysis opportunities. I respond within 24 hours.
            </p>
          </Reveal>

          {/* Contact grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

            {/* Info column */}
            <Reveal from="left">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: Mail, label: 'Email', value: 'mdnafissadiqueniloy@gmail.com', href: 'mailto:mdnafissadiqueniloy@gmail.com' },
                  { icon: MapPin, label: 'Location', value: 'Bashundhara RA, Dhaka, Bangladesh', href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139, 92, 246,0.08)', border: '1px solid rgba(139, 92, 246,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} style={{ color: '#8b5cf6' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
                      {href ? <a href={href} style={{ fontSize: 12, color: '#a3a3a3', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#8b5cf6')} onMouseLeave={e => (e.currentTarget.style.color = '#a3a3a3')}>{value}</a>
                        : <p style={{ fontSize: 12, color: '#a3a3a3' }}>{value}</p>}
                    </div>
                  </div>
                ))}

                {/* Social buttons */}
                <div className="card" style={{ padding: '18px 22px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Profiles</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { icon: Github, href: 'https://github.com/Nafis588', label: 'GitHub' },
                      { icon: Linkedin, href: 'https://www.linkedin.com/in/nafissn/', label: 'LinkedIn' },
                    ].map(({ icon: Icon, href, label }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '9px 0', fontSize: 12 }}>
                        <Icon size={13} /> {label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Form */}
            <Reveal from="right" delay={100}>
              <form onSubmit={handleSubmit} className="card" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Send a Message</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[{ id: 'name', placeholder: 'Your Name', type: 'text' }, { id: 'email', placeholder: 'your@email.com', type: 'email' }].map(f => (
                    <div key={f.id}>
                      <label htmlFor={f.id} style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{f.id === 'name' ? 'Full Name' : 'Email'}</label>
                      <input type={f.type} id={f.id} name={f.id} value={(formData as any)[f.id]} onChange={handleInput} placeholder={f.placeholder} className={`form-field ${(formErr as any)[f.id] ? 'err' : ''}`} />
                    </div>
                  ))}
                </div>

                <div>
                  <label htmlFor="subject" style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Subject</label>
                  <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInput} placeholder="Project Inquiry / Opportunity" className={`form-field ${formErr.subject ? 'err' : ''}`} />
                </div>

                <div>
                  <label htmlFor="message" style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Message</label>
                  <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleInput} placeholder="Tell me about your opportunity..." className={`form-field ${formErr.message ? 'err' : ''}`} style={{ resize: 'none' }} />
                </div>

                <button type="submit" disabled={sending} className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: sending ? 0.6 : 1, cursor: sending ? 'not-allowed' : 'pointer' }}>
                  {sending ? 'Sending...' : <><span>Send Message</span><Send size={13} /></>}
                </button>

                {formStatus.msg && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: formStatus.t === 'success' ? 'rgba(52,211,153,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${formStatus.t === 'success' ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`, color: formStatus.t === 'success' ? '#34d399' : '#f87171' }}>
                    {formStatus.msg}
                  </div>
                )}
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 0' }}>
        <div className="site-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#000' }}>N</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Nafis Sadique Niloy</p>
              <p style={{ fontSize: 10, color: '#404040' }}>Project Coordinator · CSPO®</p>
            </div>
          </div>
          <p style={{ fontSize: 10, color: '#404040' }}>© 2026 Md. Nafis Sadique Niloy · All rights reserved.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {[{ icon: Github, href: 'https://github.com/Nafis588' }, { icon: Linkedin, href: 'https://www.linkedin.com/in/nafissn/' }, { icon: Mail, href: 'mailto:mdnafissadiqueniloy@gmail.com' }].map(({ icon: Icon, href }, i) => (
              <a key={i} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ color: '#404040', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#8b5cf6')} onMouseLeave={e => (e.currentTarget.style.color = '#404040')}>
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
