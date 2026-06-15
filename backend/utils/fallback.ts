import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (filename: string) => path.join(DATA_DIR, filename);

export function readLocalFile<T>(filename: string, defaultValue: T): T {
  try {
    const file = getFilePath(filename);
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content || JSON.stringify(defaultValue)) as T;
  } catch (err) {
    console.error(`Error reading local file ${filename}:`, err);
    return defaultValue;
  }
}

export function writeLocalFile<T>(filename: string, data: T): boolean {
  try {
    const file = getFilePath(filename);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing local file ${filename}:`, err);
    return false;
  }
}

// Helpers for specific fallback databases

export const fallbackProfile = {
  get: () => {
    const defaultProfile = {
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
        primaryColor: '#6366f1', // Minimalist Indigo
        secondaryColor: '#475569', // Slate
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
      stat4: { value: 3, suffix: '+', label: 'Years in PM / Tech' },
      location: 'Dhaka & Rangpur, Bangladesh',
      clients: [
        { name: 'Bangladesh Navy', icon: '⚓' },
        { name: 'Jamuna Oil Company', icon: '🏭' },
        { name: 'Bangladesh Maritime University', icon: '🎓' },
        { name: 'ATI Limited', icon: '💼' },
        { name: 'Ghana Healthcare Client', icon: '🏥' }
      ],
      visitCount: 0,
      showVisitorCount: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      smtpFrom: '',
      smtpTo: 'mdnafissadiqueniloy@gmail.com'
    };
    const data = readLocalFile('profile.json', defaultProfile);
    if (Array.isArray(data) || !data.fullName) return defaultProfile;
    return data;
  },
  save: (profile: any) => writeLocalFile('profile.json', profile)
};

export const fallbackProjects = {
  getAll: () => readLocalFile<any[]>('projects.json', [
    {
      _id: 'p1',
      title: 'Bangladesh Navy Budget Management Software (BMS)',
      client: 'Bangladesh Navy',
      category: 'Enterprise',
      status: 'Delivered',
      sdlcStage: 'Maintenance',
      description: 'Spearheaded the development phase and Agile sprint methodology for a comprehensive budget tracking system. (Note: Exclusively focused on financial management, not naval rating systems).',
      technologies: ['Agile', 'PostgreSQL', 'Springboot'],
      repositoryUrl: '',
      liveUrl: '',
      thumbnailUrl: '',
      sortOrder: 1
    },
    {
      _id: 'p2',
      title: 'ERP Modules (HR, Payroll & Bonus)',
      client: 'BMTF',
      category: 'Enterprise',
      status: 'In Progress',
      sdlcStage: 'Implementation',
      description: 'Managed issue documentation and module stabilization for enterprise payroll and bonus systems.',
      technologies: ['ERP', 'Gap Analysis', 'Agile'],
      repositoryUrl: '',
      liveUrl: '',
      thumbnailUrl: '',
      sortOrder: 2
    },
    {
      _id: 'p3',
      title: 'NATDOC Website (CMS)',
      client: 'Bangladesh Navy',
      category: 'Enterprise',
      status: 'Delivered',
      sdlcStage: 'Maintenance',
      description: 'Finalized Software Requirements Specifications (SRS) on-site at the Lalua Chor naval base.',
      technologies: ['SRS', 'CMS', 'Requirement Engineering'],
      repositoryUrl: '',
      liveUrl: '',
      thumbnailUrl: '',
      sortOrder: 3
    },
    {
      _id: 'p4',
      title: 'CSMS Ghana Healthcare Platform',
      client: 'Samson Kofi Larbi',
      category: 'Enterprise',
      status: 'Delivered',
      sdlcStage: 'Maintenance',
      description: 'Coordinated development and support handover for 12 identical medical software installations globally.',
      technologies: ['React', 'PostgreSQL', 'Springboot'],
      repositoryUrl: '',
      liveUrl: '',
      thumbnailUrl: '',
      sortOrder: 4
    },
    {
      _id: 'p5',
      title: 'USIS 3.0 Student Portal',
      client: 'BRAC University',
      category: 'Academic',
      status: 'Delivered',
      sdlcStage: 'Maintenance',
      description: 'Student portal with schedule planning and course selection optimization. Built to demonstrate full-stack architectural integration.',
      technologies: ['React', 'TypeScript', 'MongoDB', 'Tailwind'],
      repositoryUrl: '',
      liveUrl: '',
      thumbnailUrl: '',
      sortOrder: 5
    },
    {
      _id: 'p6',
      title: 'BRACU OCA System',
      client: 'BRAC University',
      category: 'Academic',
      status: 'Delivered',
      sdlcStage: 'Maintenance',
      description: 'Club activity tracker and event approval workflow automation for the BRAC University Office of Co-Curricular Activities.',
      technologies: ['Next.js', 'React', 'MongoDB'],
      repositoryUrl: '',
      liveUrl: '',
      thumbnailUrl: '',
      sortOrder: 6
    }
  ]),
  save: (projects: any[]) => writeLocalFile('projects.json', projects),
  create: (project: any) => {
    const projects = fallbackProjects.getAll();
    const newProject = { _id: crypto.randomBytes(8).toString('hex'), ...project, createdAt: new Date().toISOString() };
    projects.push(newProject);
    fallbackProjects.save(projects);
    return newProject;
  },
  update: (id: string, data: any) => {
    const projects = fallbackProjects.getAll();
    const index = projects.findIndex(p => p._id === id);
    if (index === -1) return null;
    projects[index] = { ...projects[index], ...data, updatedAt: new Date().toISOString() };
    fallbackProjects.save(projects);
    return projects[index];
  },
  delete: (id: string) => {
    const projects = fallbackProjects.getAll();
    const filtered = projects.filter(p => p._id !== id);
    fallbackProjects.save(filtered);
    return true;
  }
};

export const fallbackExperiences = {
  getAll: () => readLocalFile<any[]>('experiences.json', [
    {
      _id: 'e1',
      roleTitle: 'Trainee Project Coordinator',
      organization: 'ATI Limited (Project Management Unit)',
      categoryType: 'Work',
      periodStart: new Date('2025-11-01T00:00:00Z').toISOString(),
      periodEnd: null,
      isActive: true,
      bulletPoints: [
        'Coordinate delivery of ERP, government, and web platform projects.',
        'Utilize Agile methodologies for sprint-based recovery plans.',
        'Work closely with engineering directors to define project timelines and feature updates.'
      ],
      sortOrder: 1
    },
    {
      _id: 'e2',
      roleTitle: 'Project Management Intern',
      organization: 'ATI Limited',
      categoryType: 'Work',
      periodStart: new Date('2025-10-01T00:00:00Z').toISOString(),
      periodEnd: new Date('2025-10-31T00:00:00Z').toISOString(),
      isActive: false,
      bulletPoints: [
        'Supported requirement elicitation, backlog refinement, and sprint reviews.',
        'Facilitated developer follow-ups.'
      ],
      sortOrder: 2
    },
    {
      _id: 'e3',
      roleTitle: 'B.Sc. in Computer Science',
      organization: 'BRAC University',
      categoryType: 'Education',
      periodStart: new Date('2021-06-01T00:00:00Z').toISOString(),
      periodEnd: new Date('2025-09-01T00:00:00Z').toISOString(),
      isActive: false,
      bulletPoints: [
        'CGPA: 3.27/4.00',
        'BUCC Presidency (Oct 2023 - Dec 2024): Led 500+ active members.'
      ],
      sortOrder: 3
    },
    {
      _id: 'e4',
      roleTitle: 'Programming & Robotics Instructor',
      organization: 'Dreamers Academy',
      categoryType: 'Instruction',
      periodStart: new Date('2023-06-01T00:00:00Z').toISOString(),
      periodEnd: new Date('2025-11-01T00:00:00Z').toISOString(),
      isActive: false,
      bulletPoints: [
        'Instructed students in programming basics (Python/JavaScript).'
      ],
      sortOrder: 4
    },
    {
      _id: 'e5',
      roleTitle: 'President',
      organization: 'BUCC',
      categoryType: 'Leadership',
      periodStart: new Date('2023-10-01T00:00:00Z').toISOString(),
      periodEnd: new Date('2024-12-01T00:00:00Z').toISOString(),
      isActive: false,
      bulletPoints: [
        'Led student activities and hacker coordination campaigns.'
      ],
      sortOrder: 5
    },
    {
      _id: 'cert1',
      roleTitle: 'Certified Scrum Product Owner (CSPO)®',
      organization: 'Scrum Alliance',
      categoryType: 'Certification',
      periodStart: new Date('2026-06-01T00:00:00Z').toISOString(),
      periodEnd: null,
      isActive: false,
      bulletPoints: ['2196763', 'https://bcert.me/siupsirvv'],
      sortOrder: 6,
      badge: '🏅',
      link: 'https://bcert.me/siupsirvv'
    },
    {
      _id: 'cert2',
      roleTitle: 'Project Initiation: Starting a Successful Project',
      organization: 'Google · Coursera',
      categoryType: 'Certification',
      periodStart: new Date('2026-04-01T00:00:00Z').toISOString(),
      periodEnd: null,
      isActive: false,
      bulletPoints: ['O2WTV45BBNIQ', ''],
      sortOrder: 7,
      badge: '🎓',
      link: 'https://coursera.org'
    },
    {
      _id: 'cert3',
      roleTitle: 'Foundations of Project Management',
      organization: 'Google · Coursera',
      categoryType: 'Certification',
      periodStart: new Date('2026-03-01T00:00:00Z').toISOString(),
      periodEnd: null,
      isActive: false,
      bulletPoints: ['CRCUF0HV72LE', ''],
      sortOrder: 8,
      badge: '🎓',
      link: 'https://coursera.org'
    },
    {
      _id: 'cert4',
      roleTitle: 'Generative AI for Project Managers',
      organization: 'PMI',
      categoryType: 'Certification',
      periodStart: new Date('2026-02-01T00:00:00Z').toISOString(),
      periodEnd: null,
      isActive: false,
      bulletPoints: ['', ''],
      sortOrder: 9,
      badge: '🤖',
      link: 'https://www.pmi.org'
    },
    {
      _id: 'lead2',
      roleTitle: 'Senior Executive, HR',
      organization: 'BUCC',
      categoryType: 'Leadership',
      periodStart: new Date('2022-06-01T00:00:00Z').toISOString(),
      periodEnd: new Date('2023-10-01T00:00:00Z').toISOString(),
      isActive: false,
      bulletPoints: [
        'Managed member recruiting, onboarding runs, and internal conflict triages.',
        'Coordinated operations for multiple campus workshops, seminars, and tech events.'
      ],
      sortOrder: 10,
      badge: '🤝',
      link: 'https://www.facebook.com/BRACU.Computer.Club/'
    },
    {
      _id: 'ach_hero',
      roleTitle: 'Hero of the Quarter',
      organization: 'ATI Limited, Q4 2025',
      categoryType: 'Achievement',
      periodStart: new Date('2025-10-01T00:00:00Z').toISOString(),
      periodEnd: new Date('2025-12-31T00:00:00Z').toISOString(),
      isActive: false,
      bulletPoints: [],
      sortOrder: 11,
      badge: 'medal',
      badgeBgColor: 'rgba(244, 63, 94, 0.12)',
      badgeTextColor: '#f43f5e',
      badgeShape: 'circle',
      link: 'https://atilimited.net'
    },
    {
      _id: 'ach_academic',
      roleTitle: 'Academic Excellence',
      organization: 'BRAC University',
      categoryType: 'Achievement',
      periodStart: new Date('2025-09-01T00:00:00Z').toISOString(),
      periodEnd: null,
      isActive: false,
      bulletPoints: [
        'VC Certificate ×5',
        'Dean\'s Certificate ×3'
      ],
      sortOrder: 12,
      badge: 'graduation',
      badgeBgColor: 'rgba(245, 158, 11, 0.12)',
      badgeTextColor: '#fbbf24',
      badgeShape: 'circle'
    },
    {
      _id: 'ach1',
      roleTitle: 'IntraHacktive 1.0 Director & Founder',
      organization: 'BRAC University Computer Club (BUCC)',
      categoryType: 'Achievement',
      periodStart: new Date('2024-01-01T00:00:00Z').toISOString(),
      periodEnd: new Date('2024-12-31T00:00:00Z').toISOString(),
      isActive: false,
      bulletPoints: [
        'Successfully initiated and executed BRAC University\'s premier intra-university hackathon.',
        'Directed a team of 40+ organizers and secured corporate sponsor partnerships.'
      ],
      sortOrder: 13,
      badge: 'trophy',
      badgeBgColor: 'rgba(99, 102, 241, 0.12)',
      badgeTextColor: '#6366f1',
      badgeShape: 'circle'
    }
  ]),
  save: (experiences: any[]) => writeLocalFile('experiences.json', experiences),
  create: (experience: any) => {
    const experiences = fallbackExperiences.getAll();
    const newExp = { _id: crypto.randomBytes(8).toString('hex'), ...experience, createdAt: new Date().toISOString() };
    experiences.push(newExp);
    fallbackExperiences.save(experiences);
    return newExp;
  },
  update: (id: string, data: any) => {
    const experiences = fallbackExperiences.getAll();
    const index = experiences.findIndex(e => e._id === id);
    if (index === -1) return null;
    experiences[index] = { ...experiences[index], ...data, updatedAt: new Date().toISOString() };
    fallbackExperiences.save(experiences);
    return experiences[index];
  },
  delete: (id: string) => {
    const experiences = fallbackExperiences.getAll();
    const filtered = experiences.filter(e => e._id !== id);
    fallbackExperiences.save(filtered);
    return true;
  }
};

export const fallbackStartups = {
  getAll: () => readLocalFile<any[]>('startups.json', [
    {
      _id: 's1',
      brandName: 'Obscura IT',
      role: 'Founder / Core Developer',
      philosophy: 'Building scalable digital identities and software solutions.',
      websiteUrl: 'https://obscura.it',
      logoUrl: '',
      isActive: true
    }
  ]),
  save: (startups: any[]) => writeLocalFile('startups.json', startups),
  create: (startup: any) => {
    const startups = fallbackStartups.getAll();
    const newStartup = { _id: crypto.randomBytes(8).toString('hex'), ...startup, createdAt: new Date().toISOString() };
    startups.push(newStartup);
    fallbackStartups.save(startups);
    return newStartup;
  },
  update: (id: string, data: any) => {
    const startups = fallbackStartups.getAll();
    const index = startups.findIndex(s => s._id === id);
    if (index === -1) return null;
    startups[index] = { ...startups[index], ...data, updatedAt: new Date().toISOString() };
    fallbackStartups.save(startups);
    return startups[index];
  },
  delete: (id: string) => {
    const startups = fallbackStartups.getAll();
    const filtered = startups.filter(s => s._id !== id);
    fallbackStartups.save(filtered);
    return true;
  }
};

export const fallbackSkills = {
  getAll: () => readLocalFile<any[]>('skills.json', [
    // Agile & Product Delivery
    { _id: 'sk1', name: 'Jira', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 1 },
    { _id: 'sk2', name: 'Confluence', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 2 },
    { _id: 'sk3', name: 'Sprint Planning', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 3 },
    { _id: 'sk4', name: 'Backlog Grooming', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 4 },
    { _id: 'sk5', name: 'UAT Facilitation', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 5 },
    { _id: 'sk6', name: 'Release Readiness', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 6 },
    // Business Analysis
    { _id: 'sk7', name: 'Requirement Elicitation', category: 'Business Analysis', icon: '📝', sortOrder: 7 },
    { _id: 'sk8', name: 'BRD & SRS Drafting', category: 'Business Analysis', icon: '📝', sortOrder: 8 },
    { _id: 'sk9', name: 'Gap Analysis', category: 'Business Analysis', icon: '📝', sortOrder: 9 },
    { _id: 'sk10', name: 'Stakeholder Liaison', category: 'Business Analysis', icon: '📝', sortOrder: 10 },
    { _id: 'sk11', name: 'Agile/Hybrid SDLC', category: 'Business Analysis', icon: '📝', sortOrder: 11 },
    // Languages & Frameworks
    { _id: 'sk12', name: 'React.js', category: 'Languages & Frameworks', icon: '💻', sortOrder: 12 },
    { _id: 'sk13', name: 'TypeScript', category: 'Languages & Frameworks', icon: '💻', sortOrder: 13 },
    { _id: 'sk14', name: 'Node.js', category: 'Languages & Frameworks', icon: '💻', sortOrder: 14 },
    { _id: 'sk15', name: 'Express.js', category: 'Languages & Frameworks', icon: '💻', sortOrder: 15 },
    { _id: 'sk16', name: 'MongoDB', category: 'Languages & Frameworks', icon: '💻', sortOrder: 16 },
    { _id: 'sk17', name: 'RESTful APIs', category: 'Languages & Frameworks', icon: '💻', sortOrder: 17 },
    { _id: 'sk18', name: 'Git/GitHub', category: 'Languages & Frameworks', icon: '💻', sortOrder: 18 },
    { _id: 'sk19', name: 'Next.js', category: 'Languages & Frameworks', icon: '💻', sortOrder: 19 },
    { _id: 'sk20', name: 'Python', category: 'Languages & Frameworks', icon: '💻', sortOrder: 20 },
    // Communication & Leadership
    { _id: 'sk21', name: 'Cross-Team Alignment', category: 'Communication & Leadership', icon: '🤝', sortOrder: 21 },
    { _id: 'sk22', name: 'Client Liaison', category: 'Communication & Leadership', icon: '🤝', sortOrder: 22 },
    { _id: 'sk23', name: 'Presentation', category: 'Communication & Leadership', icon: '🤝', sortOrder: 23 },
    { _id: 'sk24', name: 'Team Mentoring', category: 'Communication & Leadership', icon: '🤝', sortOrder: 24 },
    { _id: 'sk25', name: 'Conflict Resolution', category: 'Communication & Leadership', icon: '🤝', sortOrder: 25 }
  ]),
  save: (skills: any[]) => writeLocalFile('skills.json', skills),
  create: (skill: any) => {
    const skills = fallbackSkills.getAll();
    const newSkill = { _id: crypto.randomBytes(8).toString('hex'), ...skill, createdAt: new Date().toISOString() };
    skills.push(newSkill);
    fallbackSkills.save(skills);
    return newSkill;
  },
  update: (id: string, data: any) => {
    const skills = fallbackSkills.getAll();
    const index = skills.findIndex(s => s._id === id);
    if (index === -1) return null;
    skills[index] = { ...skills[index], ...data, updatedAt: new Date().toISOString() };
    fallbackSkills.save(skills);
    return skills[index];
  },
  delete: (id: string) => {
    const skills = fallbackSkills.getAll();
    const filtered = skills.filter(s => s._id !== id);
    fallbackSkills.save(filtered);
    return true;
  }
};

export const fallbackUsers = {
  getAll: () => readLocalFile<any[]>('users.json', []),
  save: (users: any[]) => writeLocalFile('users.json', users)
};
