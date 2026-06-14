import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Profile from './models/Profile.js';
import Experience from './models/Experience.js';
import Project from './models/Project.js';
import Startup from './models/Startup.js';
import Skill from './models/Skill.js';
import { hashPassword } from './utils/auth.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Clear Existing Collections
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Experience.deleteMany({});
    await Project.deleteMany({});
    await Startup.deleteMany({});
    await Skill.deleteMany({});
    console.log('Old collections cleared.');

    // 2. Seed Admin User
    const adminEmail = 'admin@nafis.info';
    const adminPassword = 'adminpassword123';
    console.log(`Seeding Master Admin account: ${adminEmail}...`);
    await User.create({
      email: adminEmail,
      password: hashPassword(adminPassword),
    });

    // 3. Seed Global Profile Settings
    console.log('Seeding Global Settings & Profile...');
    await Profile.create({
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
      avatarUrl: '/profile.png',
      heroBadgeText: 'CSPO® Certified Product Owner',
      aboutStatusText: 'Currently active at ATI Limited — Full-Time',
      designTokens: {
        primaryColor: '#6366f1', // Premium Indigo
        secondaryColor: '#475569', // Minimalist Slate
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
      ]
    });

    // 4. Seed Experiences
    console.log('Seeding Experiences...');
    await Experience.create([
      {
        roleTitle: 'Trainee Project Coordinator',
        organization: 'ATI Limited (Project Management Unit)',
        categoryType: 'Work',
        periodStart: new Date('2025-11-01T00:00:00Z'),
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
        roleTitle: 'Project Management Intern',
        organization: 'ATI Limited',
        categoryType: 'Work',
        periodStart: new Date('2025-10-01T00:00:00Z'),
        periodEnd: new Date('2025-10-31T00:00:00Z'),
        isActive: false,
        bulletPoints: [
          'Supported requirement elicitation, backlog refinement, and sprint reviews.',
          'Facilitated developer follow-ups.'
        ],
        sortOrder: 2
      },
      {
        roleTitle: 'B.Sc. in Computer Science',
        organization: 'BRAC University',
        categoryType: 'Education',
        periodStart: new Date('2021-06-01T00:00:00Z'),
        periodEnd: new Date('2025-09-01T00:00:00Z'),
        isActive: false,
        bulletPoints: [
          'CGPA: 3.27/4.00',
          'BUCC Presidency (Oct 2023 - Dec 2024): Led 500+ active members.'
        ],
        sortOrder: 3
      },
      {
        roleTitle: 'Programming & Robotics Instructor',
        organization: 'Dreamers Academy',
        categoryType: 'Instruction',
        periodStart: new Date('2023-06-01T00:00:00Z'),
        periodEnd: new Date('2025-11-01T00:00:00Z'),
        isActive: false,
        bulletPoints: [
          'Instructed students in programming basics (Python/JavaScript).'
        ],
        sortOrder: 4
      },
      {
        roleTitle: 'President',
        organization: 'BUCC',
        categoryType: 'Leadership',
        periodStart: new Date('2023-10-01T00:00:00Z'),
        periodEnd: new Date('2024-12-01T00:00:00Z'),
        isActive: false,
        bulletPoints: [
          'Led student activities and hacker coordination campaigns.'
        ],
        sortOrder: 5
      },
      {
        roleTitle: 'Certified Scrum Product Owner (CSPO)®',
        organization: 'Scrum Alliance',
        categoryType: 'Certification',
        periodStart: new Date('2026-06-01T00:00:00Z'),
        periodEnd: null,
        isActive: false,
        bulletPoints: ['2196763', 'https://bcert.me/siupsirvv'],
        sortOrder: 6,
        badge: '🏅'
      },
      {
        roleTitle: 'Project Initiation: Starting a Successful Project',
        organization: 'Google · Coursera',
        categoryType: 'Certification',
        periodStart: new Date('2026-04-01T00:00:00Z'),
        periodEnd: null,
        isActive: false,
        bulletPoints: ['O2WTV45BBNIQ', ''],
        sortOrder: 7,
        badge: '🎓'
      },
      {
        roleTitle: 'Foundations of Project Management',
        organization: 'Google · Coursera',
        categoryType: 'Certification',
        periodStart: new Date('2026-03-01T00:00:00Z'),
        periodEnd: null,
        isActive: false,
        bulletPoints: ['CRCUF0HV72LE', ''],
        sortOrder: 8,
        badge: '🎓'
      },
      {
        roleTitle: 'Generative AI for Project Managers',
        organization: 'PMI',
        categoryType: 'Certification',
        periodStart: new Date('2026-02-01T00:00:00Z'),
        periodEnd: null,
        isActive: false,
        bulletPoints: ['', ''],
        sortOrder: 9,
        badge: '🤖'
      },
      {
        roleTitle: 'Senior Executive, HR',
        organization: 'BUCC',
        categoryType: 'Leadership',
        periodStart: new Date('2022-06-01T00:00:00Z'),
        periodEnd: new Date('2023-10-01T00:00:00Z'),
        isActive: false,
        bulletPoints: [
          'Managed member recruiting, onboarding runs, and internal conflict triages.',
          'Coordinated operations for multiple campus workshops, seminars, and tech events.'
        ],
        sortOrder: 10,
        badge: '🤝'
      },
      {
        roleTitle: 'IntraHacktive 1.0 Director & Founder',
        organization: 'BRAC University Computer Club (BUCC)',
        categoryType: 'Achievement',
        periodStart: new Date('2024-01-01T00:00:00Z'),
        periodEnd: new Date('2024-12-31T00:00:00Z'),
        isActive: false,
        bulletPoints: [
          'Successfully initiated and executed BRAC University\'s premier intra-university hackathon.',
          'Directed a team of 40+ organizers and secured corporate sponsor partnerships.'
        ],
        sortOrder: 11,
        badge: '🏆'
      }
    ]);

    // 5. Seed Projects
    console.log('Seeding Projects...');
    await Project.create([
      {
        title: 'Bangladesh Navy Budget Management Software (BMS)',
        client: 'Bangladesh Navy',
        category: 'Enterprise',
        status: 'Delivered',
        description: 'Spearheaded the development phase and Agile sprint methodology for a comprehensive budget tracking system. (Note: Exclusively focused on financial management, not naval rating systems).',
        technologies: ['Agile', 'PostgreSQL', 'Springboot'],
        sortOrder: 1
      },
      {
        title: 'ERP Modules (HR, Payroll & Bonus)',
        client: 'BMTF',
        category: 'Enterprise',
        status: 'In Progress',
        description: 'Managed issue documentation and module stabilization for enterprise payroll and bonus systems.',
        technologies: ['ERP', 'Gap Analysis', 'Agile'],
        sortOrder: 2
      },
      {
        title: 'NATDOC Website (CMS)',
        client: 'Bangladesh Navy',
        category: 'Enterprise',
        status: 'Delivered',
        description: 'Finalized Software Requirements Specifications (SRS) on-site at the Lalua Chor naval base.',
        technologies: ['SRS', 'CMS', 'Requirement Engineering'],
        sortOrder: 3
      },
      {
        title: 'CSMS Ghana Healthcare Platform',
        client: 'Samson Kofi Larbi',
        category: 'Enterprise',
        status: 'Delivered',
        description: 'Coordinated development and support handover for 12 identical medical software installations globally.',
        technologies: ['React', 'PostgreSQL', 'Springboot'],
        sortOrder: 4
      },
      {
        title: 'USIS 3.0 Student Portal',
        client: 'BRAC University',
        category: 'Academic',
        status: 'Delivered',
        description: 'Student portal with schedule planning and course selection optimization. Built to demonstrate full-stack architectural integration.',
        technologies: ['React', 'TypeScript', 'MongoDB', 'Tailwind'],
        sortOrder: 5
      },
      {
        title: 'BRACU OCA System',
        client: 'BRAC University',
        category: 'Academic',
        status: 'Delivered',
        description: 'Club activity tracker and event approval workflow automation for the BRAC University Office of Co-Curricular Activities.',
        technologies: ['Next.js', 'React', 'MongoDB'],
        sortOrder: 6
      }
    ]);

    // 6. Seed Startups
    console.log('Seeding Startups...');
    await Startup.create([
      {
        brandName: 'Obscura IT',
        role: 'Founder / Core Developer',
        philosophy: 'Building scalable digital identities and software solutions.',
        websiteUrl: 'https://obscura.it',
        logoUrl: '',
        isActive: true
      }
    ]);

    // 7. Seed Skills
    console.log('Seeding Skills...');
    await Skill.create([
      // Agile & Product Delivery
      { name: 'Jira', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 1 },
      { name: 'Confluence', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 2 },
      { name: 'Sprint Planning', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 3 },
      { name: 'Backlog Grooming', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 4 },
      { name: 'UAT Facilitation', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 5 },
      { name: 'Release Readiness', category: 'Agile & Product Delivery', icon: '📋', sortOrder: 6 },
      // Business Analysis
      { name: 'Requirement Elicitation', category: 'Business Analysis', icon: '📝', sortOrder: 7 },
      { name: 'BRD & SRS Drafting', category: 'Business Analysis', icon: '📝', sortOrder: 8 },
      { name: 'Gap Analysis', category: 'Business Analysis', icon: '📝', sortOrder: 9 },
      { name: 'Stakeholder Liaison', category: 'Business Analysis', icon: '📝', sortOrder: 10 },
      { name: 'Agile/Hybrid SDLC', category: 'Business Analysis', icon: '📝', sortOrder: 11 },
      // Languages & Frameworks
      { name: 'React.js', category: 'Languages & Frameworks', icon: '💻', sortOrder: 12 },
      { name: 'TypeScript', category: 'Languages & Frameworks', icon: '💻', sortOrder: 13 },
      { name: 'Node.js', category: 'Languages & Frameworks', icon: '💻', sortOrder: 14 },
      { name: 'Express.js', category: 'Languages & Frameworks', icon: '💻', sortOrder: 15 },
      { name: 'MongoDB', category: 'Languages & Frameworks', icon: '💻', sortOrder: 16 },
      { name: 'RESTful APIs', category: 'Languages & Frameworks', icon: '💻', sortOrder: 17 },
      { name: 'Git/GitHub', category: 'Languages & Frameworks', icon: '💻', sortOrder: 18 },
      { name: 'Next.js', category: 'Languages & Frameworks', icon: '💻', sortOrder: 19 },
      { name: 'Python', category: 'Languages & Frameworks', icon: '💻', sortOrder: 20 },
      // Communication & Leadership
      { name: 'Cross-Team Alignment', category: 'Communication & Leadership', icon: '🤝', sortOrder: 21 },
      { name: 'Client Liaison', category: 'Communication & Leadership', icon: '🤝', sortOrder: 22 },
      { name: 'Presentation', category: 'Communication & Leadership', icon: '🤝', sortOrder: 23 },
      { name: 'Team Mentoring', category: 'Communication & Leadership', icon: '🤝', sortOrder: 24 },
      { name: 'Conflict Resolution', category: 'Communication & Leadership', icon: '🤝', sortOrder: 25 }
    ]);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
