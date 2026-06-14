import mongoose, { Schema, Document } from 'mongoose';

export interface IGlobalProfile extends Document {
  fullName: string;
  siteName: string;
  metaDescription: string;
  heroGreeting: string;
  heroTitles: string[];
  bioParagraphs: string[];
  avatarUrl: string;
  heroBadgeText: string;
  aboutStatusText: string;
  designTokens: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    backgroundColor: string;
    textColor: string;
    cardColor: string;
    themeTemplate: string;
  };
  socialLinks: {
    github: string;
    linkedin: string;
    email: string;
  };
  resumeUrl: string;
  sectionVisibility: {
    showExperience: boolean;
    showStartups: boolean;
    showCertifications: boolean;
    showEducation: boolean;
    showSkills: boolean;
    showLeadership: boolean;
    showAchievements: boolean;
  };
  stat1: { value: number; suffix: string; label: string };
  stat2: { value: number; suffix: string; label: string };
  stat3: { value: number; suffix: string; label: string };
  stat4: { value: number; suffix: string; label: string };
  location: string;
  clients: { name: string; icon: string }[];
}

const ProfileSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true, default: 'Md. Nafis Sadique Niloy' },
    siteName: { type: String, required: true, default: 'Nafis Niloy Portfolio' },
    metaDescription: { type: String, required: true, default: 'Md. Nafis Sadique Niloy - Certified Scrum Product Owner (CSPO) & Trainee Project Coordinator' },
    heroGreeting: { type: String, required: true, default: 'Hi, I am' },
    heroTitles: { type: [String], default: [] },
    bioParagraphs: { type: [String], default: [] },
    avatarUrl: { type: String, default: '/profile.png' },
    heroBadgeText: { type: String, default: 'CSPO® Certified Product Owner' },
    aboutStatusText: { type: String, default: 'Currently active at ATI Limited — Full-Time' },
    designTokens: {
      primaryColor: { type: String, default: '#6366f1' },
      secondaryColor: { type: String, default: '#475569' },
      fontFamily: { type: String, default: 'Plus Jakarta Sans' },
      backgroundColor: { type: String, default: '#040814' },
      textColor: { type: String, default: '#f1f5f9' },
      cardColor: { type: String, default: 'rgba(15, 23, 42, 0.5)' },
      themeTemplate: { type: String, default: 'cyan-emerald' }
    },
    socialLinks: {
      github: { type: String, default: 'https://github.com/Nafis588' },
      linkedin: { type: String, default: 'https://www.linkedin.com/in/nafissn/' },
      email: { type: String, default: 'mdnafissadiqueniloy@gmail.com' }
    },
    resumeUrl: { type: String, default: '/CV of Md. Nafis Sadique Niloy.pdf' },
    sectionVisibility: {
      showExperience: { type: Boolean, default: true },
      showStartups: { type: Boolean, default: true },
      showCertifications: { type: Boolean, default: true },
      showEducation: { type: Boolean, default: true },
      showSkills: { type: Boolean, default: true },
      showLeadership: { type: Boolean, default: true },
      showAchievements: { type: Boolean, default: true }
    },
    stat1: {
      value: { type: Number, default: 7 },
      suffix: { type: String, default: '+' },
      label: { type: String, default: 'Projects Coordinated' }
    },
    stat2: {
      value: { type: Number, default: 4 },
      suffix: { type: String, default: '+' },
      label: { type: String, default: 'Certs & Credentials' }
    },
    stat3: {
      value: { type: Number, default: 500 },
      suffix: { type: String, default: '+' },
      label: { type: String, default: 'BUCC Members Led' }
    },
    stat4: {
      value: { type: Number, default: 3 },
      suffix: { type: String, default: '+' },
      label: { type: String, default: 'Years in PM / Tech' }
    },
    location: { type: String, default: 'Dhaka & Rangpur, Bangladesh' },
    clients: {
      type: [{ name: { type: String }, icon: { type: String } }],
      default: [
        { name: 'Bangladesh Navy', icon: '⚓' },
        { name: 'Jamuna Oil Company', icon: '🏭' },
        { name: 'Bangladesh Maritime University', icon: '🎓' },
        { name: 'ATI Limited', icon: '💼' },
        { name: 'Ghana Healthcare Client', icon: '🏥' }
      ]
    }
  },
  {
    timestamps: true
  }
);

const Profile = mongoose.model<IGlobalProfile>('Profile', ProfileSchema);
export default Profile;
