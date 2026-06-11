import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, 
  Linkedin, 
  Twitter, 
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
  Laptop, 
  CloudSun 
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
    "a Fullstack Developer.",
    "a Frontend Specialist.",
    "an Open Source Contributor.",
    "a Clean Code Advocate."
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  // GitHub integration state
  const [githubUsername, setGithubUsername] = useState("");
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
    const savedUsername = localStorage.getItem('github_username');
    if (savedUsername) {
      setGithubUsername(savedUsername);
      fetchGitHubRepos(savedUsername);
    }
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
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
      if (!response.ok) {
        throw new Error('User not found or GitHub API limit reached');
      }
      const data: Repo[] = await response.json();
      setRepos(data);
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
            &lt;Dev<span className="text-white">.Portfolio /&gt;</span>
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
              Welcome to my space
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">A Passionate Developer</span>
            </h1>
            <h2 className="text-xl sm:text-2xl font-medium text-slate-300">
              I am <span className="text-emerald-400">{currentText}</span>
              <span className="inline-block w-[3px] h-[22px] bg-emerald-400 ml-1 animate-pulse"></span>
            </h2>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              Building premium, high-performance web applications with clean architecture and stunning, user-centered designs using the MERN stack. Let's create experiences that make an impact.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => scrollToSection('projects')} 
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center space-x-2 transition-all hover:shadow-lg hover:shadow-emerald-500/20 transform hover:-translate-y-0.5"
              >
                <span>View Projects</span> <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-all transform hover:-translate-y-0.5"
              >
                Get In Touch
              </button>
            </div>
            
            <div className="flex space-x-4 pt-6 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-emerald-400 hover:bg-slate-800/40 rounded-lg transition-all" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-emerald-400 hover:bg-slate-800/40 rounded-lg transition-all" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-emerald-400 hover:bg-slate-800/40 rounded-lg transition-all" aria-label="Twitter">
                <Twitter size={20} />
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
{`const developer = {
  name: 'Creative Engineer',
  stack: ['MongoDB', 'Express', 'React', 'Node'],
  tools: ['TypeScript', 'TailwindCSS v4'],
  status: 'Building premium MERN apps'
};

async function createImpact() {
  console.log('Crafting interactive interfaces...');
  await buildNextBigThing();
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white">My Background & Core Competencies</h2>
            <div className="w-20 h-1 bg-emerald-400 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 dark:bg-slate-950/30 p-8 flex flex-col space-y-6">
              <h3 className="text-xl font-semibold text-white">Who I Am</h3>
              <p className="text-slate-400 leading-relaxed">
                I'm a goal-oriented software developer specializing in building modern web applications. My journey started with a curiosity about how the web works, which quickly evolved into a full-fledged passion for creating pixel-perfect, clean, and interactive websites.
              </p>
              <p className="text-slate-400 leading-relaxed">
                I bridge the gap between pure engineering and high-end aesthetics. My goal is to build web apps that are not only performant and scalable under the hood but are also beautiful, accessible, and delightful to interact with.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-slate-300">
                <div className="flex items-center space-x-3">
                  <MapPin className="text-emerald-400" size={18} />
                  <span>Based in: <strong>Remote / Global</strong></span>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="text-emerald-400" size={18} />
                  <span>Available for: <strong>Full-time</strong></span>
                </div>
              </div>
            </div>

            {/* Technical Skills Panels */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 dark:bg-slate-950/30 p-8 flex flex-col space-y-6">
              <h3 className="text-xl font-semibold text-white">Technical Skills</h3>
              <p className="text-slate-400 text-sm">A curated list of tools and technologies I specialize in:</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2">Frontend Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {['React.js', 'TypeScript', 'TailwindCSS v4', 'Vite', 'HTML5 & CSS3', 'ES6+ JS'].map(skill => (
                      <span key={skill} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-md text-xs border border-slate-700">{skill}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2">Backend & Database</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'RESTful APIs'].map(skill => (
                      <span key={skill} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-md text-xs border border-slate-700">{skill}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2">Workflow & Design</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Git / GitHub', 'CI/CD Webhooks', 'Responsive Layouts', 'Glassmorphism', 'Web Accessibility'].map(skill => (
                      <span key={skill} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-md text-xs border border-slate-700">{skill}</span>
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
            <span className="text-emerald-400 font-semibold tracking-wider uppercase text-sm">My Work</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Featured Projects</h2>
            <p className="text-slate-400 max-w-lg">A dynamic listing of live GitHub repositories and static concepts.</p>
            <div className="w-20 h-1 bg-emerald-400 rounded-full"></div>
          </div>

          {/* GitHub configuration form */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 max-w-2xl mx-auto mb-12 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/25">
                <Github className="text-emerald-400" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-white">Integrate Your GitHub Profile</h4>
                <p className="text-slate-400 text-xs">Enter your username to fetch public repositories using the GitHub API.</p>
              </div>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex w-full md:w-auto gap-2">
              <input 
                type="text" 
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="Enter GitHub username" 
                className="px-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 w-full md:w-48 text-slate-100"
              />
              <button 
                onClick={handleFetchRepos}
                className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all shrink-0"
              >
                Load Repos
              </button>
            </form>
          </div>

          {/* Repository display grid */}
          {loadingRepos ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm">Loading repositories from GitHub...</p>
            </div>
          ) : repoError ? (
            <div className="text-center py-8">
              <p className="text-red-400 text-sm mb-4">Error loading live projects: {repoError}</p>
              <p className="text-slate-400 text-xs">Loading static concept projects instead...</p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.length > 0 ? (
              repos.map(repo => (
                <div key={repo.id} className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transform">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                        Repository
                      </span>
                      <Github size={18} className="text-slate-400" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{repo.name.replace(/[-_]/g, ' ')}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-3">
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
              ))
            ) : (
              // Fallback / Static items
              <>
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                        Featured
                      </span>
                      <Laptop size={18} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Premium MERN Portfolio</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      A premium, state-of-the-art React, TypeScript, and TailwindCSS portfolio with an integrated Express.js server and database storage.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-4 mb-4 text-slate-300 text-xs">
                      <span className="flex items-center space-x-1"><Code size={12} className="text-emerald-400" /><span>TypeScript</span></span>
                    </div>
                    <div className="flex space-x-4 text-xs font-semibold pt-3 border-t border-slate-850">
                      <span className="text-slate-500 cursor-not-allowed">Source Code</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                        Application
                      </span>
                      <Laptop size={18} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Kanban Task Board</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      An interactive drag-and-drop project management board featuring customizable columns, task tagging, and state persistence.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-4 mb-4 text-slate-300 text-xs">
                      <span className="flex items-center space-x-1"><Code size={12} className="text-emerald-400" /><span>React</span></span>
                    </div>
                    <div className="flex space-x-4 text-xs font-semibold pt-3 border-t border-slate-850">
                      <span className="text-slate-500 cursor-not-allowed">Source Code</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                        Web API
                      </span>
                      <CloudSun size={18} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Global Weather Center</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      A clean, responsive dashboard displaying dynamic meteorological graphs and five-day weather forecasts utilizing third-party APIs.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-4 mb-4 text-slate-300 text-xs">
                      <span className="flex items-center space-x-1"><Code size={12} className="text-emerald-400" /><span>JavaScript</span></span>
                    </div>
                    <div className="flex space-x-4 text-xs font-semibold pt-3 border-t border-slate-850">
                      <span className="text-slate-500 cursor-not-allowed">Source Code</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Experience Timeline Section */}
      <section id="experience" ref={sectionsRef.experience} className="py-24 bg-slate-900 border-t border-slate-800 dark:bg-slate-950 dark:border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <span className="text-emerald-400 font-semibold tracking-wider uppercase text-sm">My Journey</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Work Experience & Milestones</h2>
            <div className="w-20 h-1 bg-emerald-400 rounded-full"></div>
          </div>

          <div className="max-w-3xl mx-auto relative border-l-2 border-slate-800 pl-8 space-y-12">
            {[
              {
                date: '2024 - Present',
                role: 'Lead Frontend Architect',
                company: 'Innovate Tech Labs',
                desc: 'Driving the development of high-fidelity client dashboards and responsive applications. Managed a small team to migrate legacy software to modern single-page architectures, resulting in a 40% loading speed optimization.'
              },
              {
                date: '2022 - 2024',
                role: 'Fullstack Software Engineer',
                company: 'Apex Digital Solutions',
                desc: 'Developed scalable API endpoints and created polished client-facing interfaces. Implemented clean coding guidelines, automated unit tests, and reduced bug reports in production cycles by 25%.'
              },
              {
                date: '2020 - 2022',
                role: 'Junior Frontend Developer',
                company: 'Pixel Perfect Studios',
                desc: 'Crafted customized HTML/CSS responsive templates and interactive components for diverse e-commerce layouts. Partnered with UX design leads to ensure pixel-perfect fidelity across browsers and devices.'
              }
            ].map((exp, idx) => (
              <div key={idx} className="relative">
                {/* Timeline node */}
                <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-950 border-4 border-emerald-400"></div>
                
                <span className="text-xs font-semibold text-emerald-400 tracking-wide">{exp.date}</span>
                <h3 className="text-xl font-bold text-white mt-1">{exp.role}</h3>
                <h4 className="text-slate-400 text-sm font-medium mb-3">{exp.company}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={sectionsRef.contact} className="py-24 bg-slate-900/50 border-t border-slate-800 dark:bg-slate-950/50 dark:border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <span className="text-emerald-400 font-semibold tracking-wider uppercase text-sm">Let's Connect</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Get In Touch With Me</h2>
            <p className="text-slate-400 max-w-md">Have a project in mind, a job opportunity, or just want to say hi? Send a message!</p>
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
                  <p className="text-slate-400 text-sm">Remote Global</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col space-y-4">
                <h4 className="font-semibold text-white">Follow & Chat</h4>
                <div className="flex space-x-3 text-slate-400">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800 hover:text-emerald-400 rounded-lg transition-all" aria-label="GitHub">
                    <Github size={18} />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800 hover:text-emerald-400 rounded-lg transition-all" aria-label="LinkedIn">
                    <Linkedin size={18} />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800 hover:text-emerald-400 rounded-lg transition-all" aria-label="Twitter">
                    <Twitter size={18} />
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
                      placeholder="John Doe" 
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
                      placeholder="john@example.com" 
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
                    placeholder="Project Inquiry" 
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
                    placeholder="Tell me about your project..." 
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
            <span className="text-lg font-bold text-emerald-400 tracking-wider">&lt;Dev.Portfolio /&gt;</span>
            <p className="text-xs">Designed and coded with passion. MERN stack personal portfolio.</p>
          </div>
          
          <div className="flex space-x-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors" aria-label="GitHub"><Github size={18} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors" aria-label="LinkedIn"><Linkedin size={18} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors" aria-label="Twitter"><Github size={18} /></a>
          </div>

          <p className="text-xs font-light">&copy; 2026 Portfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
