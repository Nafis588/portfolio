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
  Users
} from 'lucide-react';



function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    subject: false,
    message: false
  });
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  // References for scroll checking
  const sectionsRef = {
    hero: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    projects: useRef<HTMLElement>(null),
    experience: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };

  // Sync theme with HTML class
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Scroll checking logic (navbar states and active sections)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Navbar styling on scroll
      setIsScrolled(scrollY > 50);
      
      // Back to top button visibility
      setShowBackToTop(scrollY > 300);

      // Detect active section
      let currentSection = 'hero';
      const offsets = Object.keys(sectionsRef).map(key => {
        const ref = sectionsRef[key as keyof typeof sectionsRef];
        return {
          id: key,
          offsetTop: ref.current ? ref.current.offsetTop - 150 : 0,
          offsetBottom: ref.current ? ref.current.offsetTop + ref.current.offsetHeight - 150 : 0,
        };
      });

      for (const section of offsets) {
        if (scrollY >= section.offsetTop && scrollY < section.offsetBottom) {
          currentSection = section.id;
          break;
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Form submit handler connecting to Express backend API
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: '', text: '' });
    
    // Validate
    const errors = {
      name: !formData.name.trim(),
      email: !formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      subject: !formData.subject.trim(),
      message: !formData.message.trim(),
    };

    setFormErrors(errors);

    const hasErrors = Object.values(errors).some(err => err);
    if (hasErrors) {
      setFormStatus({ type: 'error', text: 'Please fill in all required fields with valid input.' });
      return;
    }

    setSubmitting(true);
    try {
      // Connect to the Express backend
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to submit form.');
      }

      setFormStatus({ type: 'success', text: 'Thank you! Your message has been saved successfully.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error(err);
      setFormStatus({ type: 'error', text: `Connection to backend failed: ${err.message}.` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: false }));
  };

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Back to top button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg transition-all duration-300 transform ${showBackToTop ? 'translate-y-0 opacity-100 hover:scale-110' : 'translate-y-10 opacity-0 pointer-events-none'}`}
        aria-label="Back to top"
      >
        <ChevronUp size={24} />
      </button>

      {/* Header / Navbar */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'py-4 bg-slate-950/80 backdrop-blur-md shadow-md border-b border-slate-900' : 'py-6 bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }} className="text-lg font-bold tracking-wider text-indigo-400">
            Nafis<span className="text-white">.Sadique</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            {['Home', 'About', 'Projects', 'Experience', 'Contact'].map((item) => {
              const target = item === 'Home' ? 'hero' : item.toLowerCase();
              return (
                <button
                  key={item}
                  onClick={() => scrollToSection(target)}
                  className={`transition-colors relative py-1 hover:text-indigo-400 ${activeSection === target ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {item}
                  {activeSection === target && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="md:hidden p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-all"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed top-[72px] left-0 w-full h-[calc(100vh-72px)] bg-slate-950/95 backdrop-blur-lg z-30 transition-transform duration-300 md:hidden flex flex-col items-center justify-center space-y-6 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {['Home', 'About', 'Projects', 'Experience', 'Contact'].map((item) => {
          const target = item === 'Home' ? 'hero' : item.toLowerCase();
          return (
            <button
              key={item}
              onClick={() => scrollToSection(target)}
              className={`text-xl hover:text-indigo-400 transition-colors ${activeSection === target ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Hero Section */}
      <section 
        id="hero" 
        ref={sectionsRef.hero}
        className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden flex items-center min-h-[85vh] bg-slate-950"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] right-[15%] w-80 h-80 rounded-full bg-indigo-900/10 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[10%] left-[15%] w-80 h-80 rounded-full bg-slate-900/20 blur-[120px] animate-pulse"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
          <div className="md:col-span-7 flex flex-col space-y-6">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/5 px-3 py-1.5 rounded-full border border-indigo-500/10 max-w-max">
              <Award size={14} className="mr-1" />
              <span>Certified Scrum Product Owner (CSPO)®</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Md. Nafis <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-slate-200">Sadique Niloy</span>
            </h1>
            
            <h2 className="text-lg sm:text-xl font-medium text-slate-300">
              Project Coordinator & Product Delivery Specialist
            </h2>
            
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              Computer Science graduate and Scrum Product Owner currently managing software delivery and Agile execution. Experienced in translating requirements, aligning cross-functional teams, and coordinating releases across ERP and enterprise platforms.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => scrollToSection('projects')} 
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg flex items-center space-x-2 transition-all"
              >
                <span>Coordinated Projects</span> <ArrowRight size={14} />
              </button>
              <a 
                href="/CV of Md. Nafis Sadique Niloy.pdf" 
                download="CV_Md_Nafis_Sadique_Niloy.pdf"
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg border border-slate-800 hover:border-slate-700 flex items-center space-x-2 transition-all"
              >
                <span>Download CV</span>
              </a>
              <a 
                href="/linkedin.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-medium text-sm rounded-lg border border-slate-900 hover:border-slate-800 flex items-center space-x-2 transition-all"
              >
                <span>LinkedIn PDF</span>
              </a>
            </div>
            
            <div className="flex space-x-4 pt-4 text-slate-400">
              <a href="https://github.com/Nafis588" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-all" aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href="https://www.linkedin.com/in/nafissn/" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-all" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="mailto:mdnafissadiqueniloy@gmail.com" className="p-2 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-all" aria-label="Email">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Right side: Modern Summary Card */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm p-6 space-y-6">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-900 pb-3">Professional Highlights</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-1.5 bg-indigo-500/10 rounded-md text-indigo-400">
                    <Award size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">CSPO® Certified</h4>
                    <p className="text-[11px] text-slate-500">Credential ID: 2196763 (Scrum Alliance)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-1.5 bg-indigo-500/10 rounded-md text-indigo-400">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Trainee Project Coordinator</h4>
                    <p className="text-[11px] text-slate-500">ATI Limited — Coordinating Government & ERP Systems</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-1.5 bg-indigo-500/10 rounded-md text-indigo-400">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">B.Sc. in Computer Science</h4>
                    <p className="text-[11px] text-slate-500">BRAC University Graduate (CGPA: 3.27)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-1.5 bg-indigo-500/10 rounded-md text-indigo-400">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Former President</h4>
                    <p className="text-[11px] text-slate-500">BRAC University Computer Club (BUCC)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section id="about" ref={sectionsRef.about} className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-3 mb-12">
            <span className="text-indigo-400 font-semibold tracking-wider uppercase text-xs">About Me</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Career Objective & Competencies</h2>
            <div className="w-12 h-1 bg-indigo-500 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-6 flex flex-col space-y-4">
              <h3 className="text-lg font-semibold text-white">Who I Am</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                I am a goal-oriented Computer Science graduate and a Certified Scrum Product Owner® (CSPO) working as a Project Coordinator. I possess hands-on experience in managing software delivery, requirement elicitation, and Agile execution.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                My core strength lies in translating business needs into detailed technical requirements, aligning cross-functional teams (Design/Engineering/QA), and ensuring predictability in releases. I look to leverage my skills in a Project or Product Management role to drive delivery efficiency and business value.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-slate-300 text-xs">
                <div className="flex items-center space-x-2">
                  <MapPin className="text-indigo-400" size={16} />
                  <span>Dhaka, Bangladesh (Bashundhara RA)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="text-indigo-400" size={16} />
                  <span>Product Owner / Project Delivery</span>
                </div>
              </div>
            </div>

            {/* Technical Skills Panels */}
            <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-6 flex flex-col space-y-5">
              <h3 className="text-lg font-semibold text-white">Skills Portfolio</h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-indigo-400 mb-1">Project Management & Agile Delivery</h4>
                  <p className="text-slate-400">Sprint planning, backlog grooming, cross-functional coordination, UAT facilitation, release readiness, and ERP/HR/Payroll delivery (Agile/Hybrid SDLC).</p>
                </div>

                <div>
                  <h4 className="font-semibold text-indigo-400 mb-1">Requirements & Business Analysis</h4>
                  <p className="text-slate-400">Requirement elicitation, workflow analysis, user story mapping, acceptance criteria formulation, BRD/SRS documentation, and prioritization workshops.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-indigo-400 mb-1">Tools & Technical Foundation</h4>
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {['Jira', 'Notion', 'Slack', 'GitHub', 'React.js', 'TypeScript', 'Node.js', 'MongoDB', 'HTML5 & CSS3'].map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-900 text-slate-400 rounded text-[10px] border border-slate-800">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" ref={sectionsRef.projects} className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-3 mb-12">
            <span className="text-indigo-400 font-semibold tracking-wider uppercase text-xs">Projects</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Coordinated Portfolio</h2>
            <div className="w-12 h-1 bg-indigo-500 rounded-full"></div>
          </div>

          {/* Professional Projects Grid */}
          <div className="mb-12">
            <h3 className="text-base font-bold text-indigo-400 mb-6 flex items-center space-x-2">
              <Briefcase size={16} />
              <span>Enterprise Delivery (ATI Limited)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Budget Management System",
                  client: "Bangladesh Navy",
                  desc: "Leading requirement elicitation and delivery coordination of budget workflow modules with engineering teams. Acted as liaison with stakeholders to lock scope.",
                  tags: ["Scope Management", "Backlog Tracking", "Agile Execution"]
                },
                {
                  title: "NATDOC Website (CMS)",
                  client: "Bangladesh Navy",
                  desc: "Conducted on-site requirement validation and finalized SRS to establish content structure, workflows, and approvals. Coordinated milestones and developer feedback loops.",
                  tags: ["SRS Document", "Requirement Engineering", "Dynamic CMS"]
                },
                {
                  title: "ERP Modules (HR, Payroll, Accounts)",
                  client: "Jamuna Oil Company Limited (JOCL)",
                  desc: "Supported gap analysis and requirement detailing for payroll and HR modules inside ERP. Structured implementation timelines and rollout dependencies.",
                  tags: ["Gap Analysis", "ERP Customization", "Timeline Tracking"]
                },
                {
                  title: "Dynamic University Website (CMS)",
                  client: "Bangladesh Maritime University (BMU)",
                  desc: "Coordinated redesign, content migration, and delivery workflows for BMU's official portal. Facilitated issue tracking and rollout support.",
                  tags: ["CMS Workflow", "Content Migration", "Issue Triage"]
                },
                {
                  title: "Centralized Healthcare Platform",
                  client: "Ghana (Healthcare Client)",
                  desc: "Supported delivery of a multi-tenant platform where multiple hospital systems operate concurrently. Coordinated milestone tracking and cross-border communications.",
                  tags: ["Multi-Tenant", "Milestone Tracking", "Cross-Border Delivery"]
                }
              ].map((proj, idx) => (
                <div key={idx} className="rounded-xl border border-slate-900 bg-slate-900/10 p-5 flex flex-col justify-between hover:border-indigo-500/20 transition-all hover:shadow-md transform">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 rounded">
                      {proj.client}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-3 mb-2">{proj.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-4">{proj.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-900">
                    {proj.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-900 text-slate-500 text-[9px] rounded border border-slate-800">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Projects Grid */}
          <div>
            <h3 className="text-base font-bold text-indigo-400 mb-6 flex items-center space-x-2">
              <GraduationCap size={16} />
              <span>Academic Engineering</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "USIS 3.0 Student Portal",
                  desc: "Student portal with schedule planning and course selection optimization. Built to demonstrate fullstack architectural integration.",
                  tech: "React, TypeScript, MongoDB, Tailwind"
                },
                {
                  title: "BRACU OCA System",
                  desc: "Club activity tracker and event approval workflow automation for the BRAC University Office of Co-Curricular Activities.",
                  tech: "Next.js, React, MongoDB"
                }
              ].map((proj, idx) => (
                <div key={idx} className="rounded-xl border border-slate-900 bg-slate-900/10 p-5 flex flex-col justify-between hover:border-indigo-500/20 transition-all hover:shadow-md transform">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded">
                      Academic Project
                    </span>
                    <h4 className="text-sm font-bold text-white mt-3 mb-2">{proj.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-4">{proj.desc}</p>
                  </div>
                  <div className="text-xs text-slate-500 pt-3 border-t border-slate-900 flex items-center space-x-1.5">
                    <Code size={12} className="text-indigo-400" />
                    <span className="text-[10px]"><strong>Stack:</strong> {proj.tech}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience & Timeline Section */}
      <section id="experience" ref={sectionsRef.experience} className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-3 mb-12">
            <span className="text-indigo-400 font-semibold tracking-wider uppercase text-xs">My Journey</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Experience & Certifications</h2>
            <div className="w-12 h-1 bg-indigo-500 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Work Experience Timeline */}
            <div className="lg:col-span-7 relative border-l border-slate-900 pl-6 space-y-10">
              {[
                {
                  date: 'Jan 2026 - Present',
                  role: 'Trainee Project Coordinator',
                  company: 'ATI Limited',
                  desc: [
                    'Coordinating delivery of multiple ERP, government, and web platform projects across education, energy, and public-sector clients.',
                    'Supporting requirement engineering (BRD/SRS inputs), sprint tracking, cross-team alignment, and delivery follow-ups with Dev/QA/Design.',
                    'Assisting UAT coordination, release readiness, documentation, and stakeholder communication for ongoing implementations.'
                  ]
                },
                {
                  date: 'Oct 2025 - Dec 2025',
                  role: 'Project Management Intern',
                  company: 'ATI Limited',
                  desc: [
                    'Supported requirement elicitation, backlog refinement, sprint review preparation, and coordinating task boards.',
                    'Facilitated team syncs and developer follow-ups to maintain sprint goals and lock deliverables.'
                  ]
                }
              ].map((exp, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline node */}
                  <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-slate-950 border-2 border-indigo-500"></div>
                  
                  <span className="text-[10px] font-semibold text-indigo-400 tracking-wide">{exp.date}</span>
                  <h3 className="text-base font-bold text-white mt-1">{exp.role}</h3>
                  <h4 className="text-slate-400 text-xs font-medium mb-3">{exp.company}</h4>
                  <ul className="list-disc pl-4 text-slate-400 text-xs space-y-2 leading-relaxed">
                    {exp.desc.map((bullet, bidx) => <li key={bidx}>{bullet}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* Right Column: Leadership & Certifications */}
            <div className="lg:col-span-5 space-y-8">
              {/* Leadership block */}
              <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Users size={16} className="text-indigo-400" />
                  <span>Leadership</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">President</h4>
                    <span className="text-[10px] text-indigo-400 font-semibold">BRAC University Computer Club (BUCC)</span>
                    <p className="text-slate-500 text-[9px]">Oct 2023 - Dec 2024</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Former Senior Executive, HR</h4>
                    <span className="text-[10px] text-indigo-400 font-semibold">BRAC University Computer Club (BUCC)</span>
                    <p className="text-slate-500 text-[9px]">Jun 2022 - Oct 2023</p>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed border-t border-slate-900 pt-3">
                    Led a university tech organization with <strong>500+ active members</strong>. Founded the R&D Department and Web & App Team. Coordinated operations, mentorships, and directed the end-to-end execution of the <strong>IntraHacktive 1.0</strong> hackathon.
                  </p>
                </div>
              </div>

              {/* Certifications block */}
              <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Award size={16} className="text-indigo-400" />
                  <span>Credentials</span>
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      title: "Certified Scrum Product Owner (CSPO)®",
                      issuer: "Scrum Alliance",
                      date: "Jun 7, 2026",
                      link: "https://bcert.me/siupsirvv",
                      details: "Credential ID: 2196763"
                    },
                    {
                      title: "Project Initiation: Starting a Successful Project",
                      issuer: "Google (Coursera)",
                      date: "Apr 2026",
                      details: "Credential ID: O2WTV45BBNIQ"
                    },
                    {
                      title: "Foundations of Project Management",
                      issuer: "Google (Coursera)",
                      date: "Mar 2026",
                      details: "Credential ID: CRCUF0HV72LE"
                    },
                    {
                      title: "Generative AI for Project Managers",
                      issuer: "PMI",
                      date: "Feb 2026"
                    }
                  ].map((cert, cidx) => (
                    <div key={cidx} className="text-xs border-b border-slate-900 last:border-b-0 pb-3 last:pb-0">
                      <h4 className="font-bold text-white leading-snug">{cert.title}</h4>
                      <div className="flex justify-between text-slate-400 text-[9px] mt-1">
                        <span>{cert.issuer}</span>
                        <span>{cert.date}</span>
                      </div>
                      {cert.details && <p className="text-slate-500 text-[9px] mt-0.5">{cert.details}</p>}
                      {cert.link && (
                        <a 
                          href={cert.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-indigo-400 hover:underline text-[9px] mt-1 inline-flex items-center space-x-1"
                        >
                          <span>Verify</span> <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Education block at the bottom */}
          <div className="max-w-3xl mx-auto mt-12 p-5 rounded-xl border border-slate-900 bg-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-indigo-500/5 rounded-lg text-indigo-400 border border-indigo-500/10">
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">B.Sc. in Computer Science</h4>
                <p className="text-slate-400 text-xs">BRAC University</p>
                <p className="text-slate-500 text-[10px]">CGPA: 3.27/4.00 | Jun 2021 – Sep 2025</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 rounded-full text-xs font-semibold self-start md:self-auto">
              Completed
            </span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={sectionsRef.contact} className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-3 mb-12">
            <span className="text-indigo-400 font-semibold tracking-wider uppercase text-xs">Connect</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Get In Touch</h2>
            <div className="w-12 h-1 bg-indigo-500 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Info Cards */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-5 flex items-start space-x-4">
                <div className="p-2.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-indigo-400">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-xs mb-1">Email Me</h4>
                  <a href="mailto:mdnafissadiqueniloy@gmail.com" className="text-slate-400 hover:text-indigo-400 text-xs">mdnafissadiqueniloy@gmail.com</a>
                </div>
              </div>

              <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-5 flex items-start space-x-4">
                <div className="p-2.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-indigo-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-xs mb-1">Location</h4>
                  <p className="text-slate-400 text-xs">Bashundhara RA, Dhaka, Bangladesh</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-900 bg-slate-900/10 p-5 flex flex-col space-y-3">
                <h4 className="font-semibold text-white text-xs">Profiles</h4>
                <div className="flex space-x-3 text-slate-400">
                  <a href="https://github.com/Nafis588" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900 hover:text-indigo-400 rounded-lg transition-all" aria-label="GitHub">
                    <Github size={16} />
                  </a>
                  <a href="https://www.linkedin.com/in/nafissn/" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900 hover:text-indigo-400 rounded-lg transition-all" aria-label="LinkedIn">
                    <Linkedin size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleFormSubmit} className="rounded-xl border border-slate-900 bg-slate-900/10 p-6 flex flex-col space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="name" className="text-[10px] font-semibold uppercase text-slate-400">Full Name</label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name" 
                      className={`px-3 py-2 bg-slate-950 border ${formErrors.name ? 'border-red-500' : 'border-slate-900'} rounded-lg focus:outline-none focus:border-indigo-500 text-xs text-slate-100`}
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label htmlFor="email" className="text-[10px] font-semibold uppercase text-slate-400">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com" 
                      className={`px-3 py-2 bg-slate-950 border ${formErrors.email ? 'border-red-500' : 'border-slate-900'} rounded-lg focus:outline-none focus:border-indigo-500 text-xs text-slate-100`}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor="subject" className="text-[10px] font-semibold uppercase text-slate-400">Subject</label>
                  <input 
                    type="text" 
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Project Inquiry" 
                    className={`px-3 py-2 bg-slate-950 border ${formErrors.subject ? 'border-red-500' : 'border-slate-900'} rounded-lg focus:outline-none focus:border-indigo-500 text-xs text-slate-100`}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor="message" className="text-[10px] font-semibold uppercase text-slate-400">Message</label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your inquiry..." 
                    className={`px-3 py-2 bg-slate-950 border ${formErrors.message ? 'border-red-500' : 'border-slate-900'} rounded-lg focus:outline-none focus:border-indigo-500 text-xs text-slate-100`}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <span>Send Message</span> <Send size={12} />
                    </>
                  )}
                </button>

                {formStatus.text && (
                  <div className={`p-3 rounded-lg text-[11px] font-medium ${formStatus.type === 'success' ? 'bg-indigo-500/5 text-indigo-400 border border-indigo-500/10' : 'bg-red-500/5 text-red-400 border border-red-500/10'}`}>
                    {formStatus.text}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-950 border-t border-slate-900 text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col space-y-1 text-center md:text-left">
            <span className="text-sm font-bold text-indigo-400 tracking-wider">Nafis.Sadique</span>
            <p className="text-[10px]">Personal Portfolio & Delivery Dashboard.</p>
          </div>
          
          <div className="flex space-x-4">
            <a href="https://github.com/Nafis588" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors" aria-label="GitHub"><Github size={16} /></a>
            <a href="https://www.linkedin.com/in/nafissn/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors" aria-label="LinkedIn"><Linkedin size={16} /></a>
          </div>

          <p className="text-[10px]">&copy; 2026 Md. Nafis Sadique Niloy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
