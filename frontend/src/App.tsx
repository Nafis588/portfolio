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
  Star, 
  Send, 
  Menu, 
  X, 
  ArrowRight, 
  Award,
  GraduationCap,
  Users
} from 'lucide-react';

// Define structures for our TypeScript types
interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage?: string;
  language: string;
  stargazers_count: number;
}

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Typewriter effect state
  const words = [
    "a Certified Scrum Product Owner® (CSPO).",
    "a Trainee Project Coordinator.",
    "an Agile Delivery Specialist.",
    "a Computer Science Graduate."
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  // GitHub integration state
  const [githubUsername, setGithubUsername] = useState("Nafis588");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState("");

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

  // Typewriter logic
  useEffect(() => {
    const activeWord = words[currentWordIndex];
    
    const handleType = () => {
      if (isDeleting) {
        // Deleting text
        setCurrentText(prev => prev.substring(0, prev.length - 1));
        setTypingSpeed(50);
      } else {
        // Typing text
        setCurrentText(activeWord.substring(0, currentText.length + 1));
        setTypingSpeed(100);
      }

      // Transition check
      if (!isDeleting && currentText === activeWord) {
        // Wait before deleting
        setTypingSpeed(1500);
        setIsDeleting(true);
      } else if (isDeleting && currentText === "") {
        // Move to next word
        setIsDeleting(false);
        setCurrentWordIndex(prev => (prev + 1) % words.length);
        setTypingSpeed(500);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, typingSpeed]);

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

  // Saved username retrieval
  useEffect(() => {
    const savedUsername = localStorage.getItem('github_username') || 'Nafis588';
    setGithubUsername(savedUsername);
    fetchGitHubRepos(savedUsername);
  }, []);

  const handleFetchRepos = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = githubUsername.trim();
    if (cleanUsername) {
      localStorage.setItem('github_username', cleanUsername);
      fetchGitHubRepos(cleanUsername);
    } else {
      alert("Please enter a valid GitHub username.");
    }
  };

  const fetchGitHubRepos = async (username: string) => {
    setLoadingRepos(true);
    setRepoError("");
    setRepos([]);

    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`);
      if (!response.ok) {
        throw new Error('User not found or GitHub API limit reached');
      }
      const data: Repo[] = await response.json();
      
      // Filter out homework, assignments and practice repositories to keep it professional
      const filtered = data
        .filter(repo => {
          const name = repo.name.toLowerCase();
          return !name.includes('assignment') && 
                 !name.includes('practice') && 
                 !name.includes('homework') && 
                 !name.startsWith('ph-') &&
                 !name.startsWith('ph ');
        })
        .slice(0, 6);

      setRepos(filtered);
    } catch (err: any) {
      console.error(err);
      setRepoError(err.message || "Could not fetch repositories.");
    } finally {
      setLoadingRepos(false);
    }
  };

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

      setFormStatus({ type: 'success', text: 'Thank you! Your message has been saved to the database successfully.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error(err);
      setFormStatus({ type: 'error', text: `Connection to backend failed: ${err.message}. (Is the backend server running?)` });
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
    <div className="min-h-screen bg-slate-900 text-slate-100 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Back to top button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg transition-all duration-300 transform ${showBackToTop ? 'translate-y-0 opacity-100 hover:scale-110' : 'translate-y-10 opacity-0 pointer-events-none'}`}
        aria-label="Back to top"
      >
        <ChevronUp size={24} />
      </button>

      {/* Header / Navbar */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'py-4 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md shadow-lg border-b border-slate-800' : 'py-6 bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }} className="text-xl font-bold tracking-wider text-emerald-400">
            &lt;Nafis<span className="text-white">.Sadique /&gt;</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            {['Home', 'About', 'Projects', 'Experience', 'Contact'].map((item) => {
              const target = item === 'Home' ? 'hero' : item.toLowerCase();
              return (
                <button
                  key={item}
                  onClick={() => scrollToSection(target)}
                  className={`transition-colors relative py-1 hover:text-emerald-400 ${activeSection === target ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}
                >
                  {item}
                  {activeSection === target && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="md:hidden p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-all"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed top-[72px] left-0 w-full h-[calc(100vh-72px)] bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-lg z-30 transition-transform duration-300 md:hidden flex flex-col items-center justify-center space-y-6 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {['Home', 'About', 'Projects', 'Experience', 'Contact'].map((item) => {
          const target = item === 'Home' ? 'hero' : item.toLowerCase();
          return (
            <button
              key={item}
              onClick={() => scrollToSection(target)}
              className={`text-xl hover:text-emerald-400 transition-colors ${activeSection === target ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
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
        className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden flex items-center min-h-[90vh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-850 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-emerald-500/10 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[20%] left-[10%] w-96 h-96 rounded-full bg-indigo-500/10 blur-[150px] animate-pulse"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
          <div className="md:col-span-7 flex flex-col space-y-6">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20 max-w-max">
              CSPO® Certified Product Owner
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 font-extrabold">Nafis Sadique Niloy</span>
            </h1>
            <h2 className="text-xl sm:text-2xl font-medium text-slate-300">
              I am <span className="text-emerald-400">{currentText}</span>
              <span className="inline-block w-[3px] h-[22px] bg-emerald-400 ml-1 animate-pulse"></span>
            </h2>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              Goal-oriented CS graduate and Certified Scrum Product Owner working as a Project Coordinator. Experienced in software delivery, requirement engineering, stakeholder coordination, and managing Agile releases across ERP and web platforms.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => scrollToSection('projects')} 
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center space-x-2 transition-all hover:shadow-lg hover:shadow-emerald-500/20 transform hover:-translate-y-0.5"
              >
                <span>View Projects</span> <ArrowRight size={16} />
              </button>
              <a 
                href="/CV of Md. Nafis Sadique Niloy.pdf" 
                download="CV_Md_Nafis_Sadique_Niloy.pdf"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Download CV</span>
              </a>
              <a 
                href="/linkedin.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700 text-slate-300 font-medium rounded-lg border border-slate-850 hover:border-slate-700 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>LinkedIn Export</span>
              </a>
            </div>
            
            <div className="flex space-x-4 pt-6 text-slate-400">
              <a href="https://github.com/Nafis588" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-emerald-400 hover:bg-slate-800/40 rounded-lg transition-all" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="https://www.linkedin.com/in/nafissn/" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-emerald-400 hover:bg-slate-800/40 rounded-lg transition-all" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="mailto:mdnafissadiqueniloy@gmail.com" className="p-2 hover:text-emerald-400 hover:bg-slate-800/40 rounded-lg transition-all" aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Right side: Code window Visual */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-2xl p-6">
              <div className="flex space-x-1.5 mb-4 border-b border-slate-800 pb-3">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                <code>
{`const coordinator = {
  name: 'Md. Nafis Sadique Niloy',
  role: 'Trainee Project Coordinator',
  certification: 'CSPO® (Scrum Alliance)',
  frameworks: ['Agile', 'Scrum', 'Hybrid SDLC'],
  tools: ['Jira', 'Notion', 'Slack', 'GitHub'],
  techBase: ['React', 'TypeScript', 'Node', 'MongoDB']
};

async function deliverValue() {
  console.log('Translating requirements to software...');
  await alignTeamsAndRelease();
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section id="about" ref={sectionsRef.about} className="py-24 bg-slate-900 border-t border-slate-800 dark:bg-slate-950 dark:border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <span className="text-emerald-400 font-semibold tracking-wider uppercase text-sm">About Me</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Background & Core Competencies</h2>
            <div className="w-20 h-1 bg-emerald-400 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 dark:bg-slate-950/30 p-8 flex flex-col space-y-6">
              <h3 className="text-xl font-semibold text-white">Who I Am</h3>
              <p className="text-slate-400 leading-relaxed">
                I am a Computer Science graduate from BRAC University and a Certified Scrum Product Owner® (CSPO) currently working as a Trainee Project Coordinator at ATI Limited. I possess hands-on experience in software delivery, stakeholder coordination, and Agile execution.
              </p>
              <p className="text-slate-400 leading-relaxed">
                I specialize in translating business needs into structured requirements, aligning cross-functional design, engineering, and QA teams, and supporting predictable releases across ERP, government workflows, and web platforms. I am eager to grow into a Project/Product Management role with greater ownership of delivery, process improvement, and product outcomes.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-slate-300">
                <div className="flex items-center space-x-3">
                  <MapPin className="text-emerald-400" size={18} />
                  <span>Dhaka, Bangladesh</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="text-emerald-400" size={18} />
                  <span>Product / Project Delivery</span>
                </div>
              </div>
            </div>

            {/* Technical Skills Panels */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 dark:bg-slate-950/30 p-8 flex flex-col space-y-6">
              <h3 className="text-xl font-semibold text-white">Technical & Professional Skills</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-1">Project Management & Delivery</h4>
                  <p className="text-slate-400 text-xs">Sprint planning, backlog tracking, cross-functional coordination (Dev/QA/Design), UAT facilitation, release readiness, and ERP/HR/Payroll delivery (Agile/Hybrid SDLC).</p>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-400 mb-1">Business Analysis & Requirements</h4>
                  <p className="text-slate-400 text-xs">Requirement gathering, workflow analysis, user stories, acceptance criteria, BRD/SRS inputs, scope clarification, and stakeholder workshops.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-400 mb-1">System Understanding & Process</h4>
                  <p className="text-slate-400 text-xs">Dependency tracking, impact analysis, integration awareness (APIs/CMS workflows), issue triage, meeting minutes, trackers, and implementation planning.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-400 mb-1">Tools & Technical Foundation</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['Jira', 'Notion', 'Slack', 'GitHub', 'React basics', 'TypeScript', 'Node.js', 'MongoDB', 'HTML5 & CSS3'].map(skill => (
                      <span key={skill} className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" ref={sectionsRef.projects} className="py-24 bg-slate-900/50 border-t border-slate-800 dark:bg-slate-950/50 dark:border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <span className="text-emerald-400 font-semibold tracking-wider uppercase text-sm">Project Portfolio</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Key Projects Coordinated</h2>
            <p className="text-slate-400 max-w-lg">A listing of enterprise systems I've managed, alongside academic products.</p>
            <div className="w-20 h-1 bg-emerald-400 rounded-full"></div>
          </div>

          {/* Professional Projects Grid */}
          <div className="mb-16">
            <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center space-x-2">
              <Briefcase size={20} />
              <span>Professional Projects (ATI Limited)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Budget Management System",
                  client: "Bangladesh Navy",
                  desc: "Leading requirement gathering and coordinating delivery of budget workflow modules with cross-functional teams. Acting as liaison between naval stakeholders and engineering to lock scope.",
                  tags: ["Agile SDLC", "Scope Management", "Backlog Grooming"]
                },
                {
                  title: "NATDOC Website (Dynamic/CMS)",
                  client: "Bangladesh Navy",
                  desc: "Conducted on-site requirement validation and finalized SRS to confirm workflows, content structure, and approvals. Coordinating development progress, documentation updates, and stakeholder loops.",
                  tags: ["SRS", "Requirement Validation", "CMS Workflows"]
                },
                {
                  title: "ERP Modules (HR, Payroll, Accounts)",
                  client: "Jamuna Oil Company Limited (JOCL)",
                  desc: "Supporting gap analysis and requirement detailing for HR, payroll, and accounts-related workflows inside ERP. Preparing implementation plans and tracking rollout tasks with dependencies.",
                  tags: ["Gap Analysis", "ERP", "Dependency Tracking"]
                },
                {
                  title: "Dynamic University Website (CMS)",
                  client: "Bangladesh Maritime University (BMU)",
                  desc: "Coordinating redesign and development lifecycle of the official university portal with CMS-driven workflows. Supporting content migration planning, issue tracking, and delivery follow-ups.",
                  tags: ["CMS", "Redesign Lifecycle", "Content Migration"]
                },
                {
                  title: "Centralized Healthcare Platform",
                  client: "Ghana (Healthcare/Insurance Client)",
                  desc: "Supporting delivery of a multi-tenant platform where multiple hospitals operate within a single system. Coordinating cross-border communication, milestone tracking, and documentation.",
                  tags: ["Multi-Tenant", "Milestone Tracking", "Cross-Border Comm"]
                }
              ].map((proj, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transform">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                      {proj.client}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-3 mb-2">{proj.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">{proj.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-850">
                    {proj.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded border border-slate-700">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Projects Grid */}
          <div className="mb-20">
            <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center space-x-2">
              <GraduationCap size={20} />
              <span>Academic Projects (BRAC University)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "USIS 3.0 Student Portal",
                  desc: "Student portal with advanced course planning features. Designed to optimize course selection workflows and schedule visualization.",
                  tech: "React, TypeScript, MongoDB, Tailwind CSS"
                },
                {
                  title: "BRACU OCA System",
                  desc: "Club management tool for BRAC University Office of Co-Curricular Activities to automate event scheduling and club resource allocation.",
                  tech: "Next.js, React, MongoDB"
                }
              ].map((proj, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transform">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                      Academic
                    </span>
                    <h4 className="text-lg font-bold text-white mt-3 mb-2">{proj.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">{proj.desc}</p>
                  </div>
                  <div className="text-xs text-slate-400 pt-3 border-t border-slate-850 flex items-center space-x-1.5">
                    <Code size={12} className="text-emerald-400" />
                    <span><strong>Tech Stack:</strong> {proj.tech}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub configuration form & live repo listing */}
          <div className="border-t border-slate-800 pt-16">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 max-w-2xl mx-auto mb-12 flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/25">
                  <Github className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Live GitHub Repositories</h4>
                  <p className="text-slate-400 text-xs">Public code repositories fetched live via the GitHub REST API.</p>
                </div>
              </div>
              
              <form onSubmit={(e) => e.preventDefault()} className="flex w-full md:w-auto gap-2">
                <input 
                  type="text" 
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="GitHub Username" 
                  spellCheck={false}
                  className="px-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 w-full md:w-48 text-slate-100 font-mono"
                />
                <button 
                  onClick={handleFetchRepos}
                  className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all shrink-0"
                >
                  Load
                </button>
              </form>
            </div>

            {loadingRepos ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm">Loading repositories from GitHub...</p>
              </div>
            ) : repoError ? (
              <div className="text-center py-8">
                <p className="text-red-400 text-sm">Error loading live repositories: {repoError}</p>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.length > 0 && repos.map(repo => (
                <div key={repo.id} className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all hover:shadow-xl hover:-translate-y-1 transform">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                        Repository
                      </span>
                      <Github size={18} className="text-slate-400" />
                    </div>
                    
                    <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">{repo.name.replace(/[-_]/g, ' ')}</h3>
                    <p className="text-slate-400 text-[11px] leading-relaxed mb-6 line-clamp-3">
                      {repo.description || "No description provided. Click below to inspect code and details directly."}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-4 mb-4 text-slate-300 text-xs">
                      <span className="flex items-center space-x-1">
                        <Code size={12} className="text-emerald-400" />
                        <span>{repo.language || 'JavaScript'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Star size={12} className="text-amber-400" />
                        <span>{repo.stargazers_count}</span>
                      </span>
                    </div>

                    <div className="flex space-x-4 text-xs font-semibold pt-3 border-t border-slate-850">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-emerald-400 flex items-center space-x-1">
                        <span>Source Code</span> <ExternalLink size={12} />
                      </a>
                      {repo.homepage && (
                        <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-emerald-400 flex items-center space-x-1">
                          <span>Live Demo</span> <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience Timeline Section */}
      <section id="experience" ref={sectionsRef.experience} className="py-24 bg-slate-900 border-t border-slate-800 dark:bg-slate-950 dark:border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <span className="text-emerald-400 font-semibold tracking-wider uppercase text-sm">My Journey</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Experience & Certifications</h2>
            <div className="w-20 h-1 bg-emerald-400 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Work Experience Timeline */}
            <div className="lg:col-span-7 relative border-l-2 border-slate-800 pl-8 space-y-12">
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
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-950 border-4 border-emerald-400"></div>
                  
                  <span className="text-xs font-semibold text-emerald-400 tracking-wide">{exp.date}</span>
                  <h3 className="text-xl font-bold text-white mt-1">{exp.role}</h3>
                  <h4 className="text-slate-400 text-sm font-medium mb-3">{exp.company}</h4>
                  <ul className="list-disc pl-4 text-slate-400 text-xs space-y-2 leading-relaxed">
                    {exp.desc.map((bullet, bidx) => <li key={bidx}>{bullet}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* Right Column: Leadership & Certifications */}
            <div className="lg:col-span-5 space-y-8">
              {/* Leadership block */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Users size={18} className="text-emerald-400" />
                  <span>Leadership & Extra-Curriculars</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">President</h4>
                    <span className="text-xs text-emerald-400 font-semibold">BRAC University Computer Club (BUCC)</span>
                    <p className="text-slate-500 text-[10px] mt-0.5">Oct 2023 - Dec 2024</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Former Senior Executive, HR</h4>
                    <span className="text-xs text-emerald-400 font-semibold">BRAC University Computer Club (BUCC)</span>
                    <p className="text-slate-500 text-[10px] mt-0.5">Jun 2022 - Oct 2023</p>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed border-t border-slate-800 pt-3">
                    Led a university tech organization with <strong>500+ active members</strong>. Founded the Research & Development Department and Web & App Team. Coordinated operations, mentorships, and directed the end-to-end execution of the <strong>IntraHacktive 1.0</strong> hackathon.
                  </p>
                </div>
              </div>

              {/* Certifications block */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Award size={18} className="text-emerald-400" />
                  <span>Certifications</span>
                </h3>
                <div className="space-y-4">
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
                    <div key={cidx} className="text-xs border-b border-slate-850 last:border-b-0 pb-3 last:pb-0">
                      <h4 className="font-bold text-white leading-snug">{cert.title}</h4>
                      <div className="flex justify-between text-slate-400 text-[10px] mt-1">
                        <span>{cert.issuer}</span>
                        <span>{cert.date}</span>
                      </div>
                      {cert.details && <p className="text-slate-500 text-[10px] mt-0.5">{cert.details}</p>}
                      {cert.link && (
                        <a 
                          href={cert.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-emerald-400 hover:underline text-[10px] mt-1 inline-flex items-center space-x-1"
                        >
                          <span>Verify Credential</span> <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Education block at the bottom */}
          <div className="max-w-3xl mx-auto mt-16 p-6 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                <GraduationCap size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">B.Sc. in Computer Science</h4>
                <p className="text-slate-400 text-sm">BRAC University</p>
                <p className="text-slate-500 text-xs">CGPA: 3.27/4.00 | Jun 2021 – Sep 2025</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold self-start md:self-auto">
              Completed
            </span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={sectionsRef.contact} className="py-24 bg-slate-900/50 border-t border-slate-800 dark:bg-slate-950/50 dark:border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <span className="text-emerald-400 font-semibold tracking-wider uppercase text-sm">Let's Connect</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Get In Touch</h2>
            <p className="text-slate-400 max-w-md">Have a role, project, or opportunity you'd like to discuss? Drop a message!</p>
            <div className="w-20 h-1 bg-emerald-400 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Info Cards */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex items-start space-x-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Email Me</h4>
                  <a href="mailto:mdnafissadiqueniloy@gmail.com" className="text-slate-400 hover:text-emerald-400 text-sm">mdnafissadiqueniloy@gmail.com</a>
                  <p className="text-slate-500 text-xs mt-1">Typically responds within 24 hours</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex items-start space-x-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Location</h4>
                  <p className="text-slate-400 text-sm">House 167, Road 6, F Block, Bashundhara RA, Dhaka, Bangladesh</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col space-y-4">
                <h4 className="font-semibold text-white">Profiles</h4>
                <div className="flex space-x-3 text-slate-400">
                  <a href="https://github.com/Nafis588" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800 hover:text-emerald-400 rounded-lg transition-all" aria-label="GitHub">
                    <Github size={18} />
                  </a>
                  <a href="https://www.linkedin.com/in/nafissn/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800 hover:text-emerald-400 rounded-lg transition-all" aria-label="LinkedIn">
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleFormSubmit} className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 flex flex-col space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="name" className="text-xs font-semibold uppercase text-slate-400">Full Name</label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name" 
                      className={`px-4 py-3 bg-slate-950 border ${formErrors.name ? 'border-red-500' : 'border-slate-800'} rounded-lg focus:outline-none focus:border-emerald-500 text-sm text-slate-100`}
                    />
                    {formErrors.name && <span className="text-[10px] text-red-500 font-semibold">Name is required</span>}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label htmlFor="email" className="text-xs font-semibold uppercase text-slate-400">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com" 
                      className={`px-4 py-3 bg-slate-950 border ${formErrors.email ? 'border-red-500' : 'border-slate-800'} rounded-lg focus:outline-none focus:border-emerald-500 text-sm text-slate-100`}
                    />
                    {formErrors.email && <span className="text-[10px] text-red-500 font-semibold">Please enter a valid email address</span>}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="subject" className="text-xs font-semibold uppercase text-slate-400">Subject</label>
                  <input 
                    type="text" 
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Project / Role Inquiry" 
                    className={`px-4 py-3 bg-slate-950 border ${formErrors.subject ? 'border-red-500' : 'border-slate-800'} rounded-lg focus:outline-none focus:border-emerald-500 text-sm text-slate-100`}
                  />
                  {formErrors.subject && <span className="text-[10px] text-red-500 font-semibold">Subject is required</span>}
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="message" className="text-xs font-semibold uppercase text-slate-400">Message</label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your inquiry..." 
                    className={`px-4 py-3 bg-slate-950 border ${formErrors.message ? 'border-red-500' : 'border-slate-800'} rounded-lg focus:outline-none focus:border-emerald-500 text-sm text-slate-100`}
                  />
                  {formErrors.message && <span className="text-[10px] text-red-500 font-semibold">Message content is required</span>}
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-all"
                >
                  {submitting ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <span>Send Message</span> <Send size={16} />
                    </>
                  )}
                </button>

                {formStatus.text && (
                  <div className={`p-4 rounded-lg text-xs font-medium ${formStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {formStatus.text}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800 dark:bg-slate-950 dark:border-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col space-y-2 text-center md:text-left">
            <span className="text-lg font-bold text-emerald-400 tracking-wider">&lt;Nafis.Sadique /&gt;</span>
            <p className="text-xs">Personal Portfolio & Dynamic MERN Dashboard.</p>
          </div>
          
          <div className="flex space-x-4">
            <a href="https://github.com/Nafis588" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors" aria-label="GitHub"><Github size={18} /></a>
            <a href="https://www.linkedin.com/in/nafissn/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors" aria-label="LinkedIn"><Linkedin size={18} /></a>
          </div>

          <p className="text-xs font-light">&copy; 2026 Md. Nafis Sadique Niloy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
