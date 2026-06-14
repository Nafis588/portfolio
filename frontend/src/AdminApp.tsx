import React, { useState, useEffect } from 'react';
import {
  Lock, LogOut, Edit, Trash2, Plus, Users, Code, Award, Mail, Upload, Globe, Settings
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

// Safe fetch wrapper deleted. Handled inside component for 401 logout tracking.

export default function AdminApp() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  
  // Safe fetch wrapper inside component to handle 401 logouts
  const fetchApi = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(`${API_BASE}${url}`, options);
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        setAdminToken('');
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Session expired. Please log in again.');
      }
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

  const [profile, setProfile] = useState<any>({
    fullName: 'Md. Nafis Sadique Niloy',
    siteName: 'Nafis Niloy Portfolio',
    metaDescription: 'Md. Nafis Sadique Niloy - Certified Scrum Product Owner (CSPO) & Trainee Project Coordinator',
    heroGreeting: 'Hi, I am',
    heroTitles: [],
    bioParagraphs: [],
    avatarUrl: '/profile.png',
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
    socialLinks: { github: '', linkedin: '', email: '' },
    resumeUrl: '',
    sectionVisibility: {
      showExperience: true,
      showStartups: true,
      showCertifications: true,
      showEducation: true,
      showSkills: true,
      showLeadership: true,
      showAchievements: true
    }
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Admin login & state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [adminTab, setAdminTab] = useState<'profile' | 'projects' | 'work-exp' | 'education' | 'leadership' | 'certifications' | 'achievements' | 'startups' | 'skills' | 'messages'>('profile');

  // Admin CRUD states
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [editingStartup, setEditingStartup] = useState<any>(null);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [crudModal, setCrudModal] = useState<{
    type: 'project' | 'work-exp' | 'education' | 'leadership' | 'certification' | 'achievement' | 'startup' | 'skill' | '';
    mode: 'add' | 'edit';
  }>({ type: '', mode: 'add' });

  // Local form editing string inputs (resolves cursor jump on split-joins)
  const [heroTitlesText, setHeroTitlesText] = useState('');
  const [bioParagraphsText, setBioParagraphsText] = useState('');
  const [technologiesText, setTechnologiesText] = useState('');
  const [bulletPointsText, setBulletPointsText] = useState('');
  const [clientsText, setClientsText] = useState('');

  // Sync settings inputs when profile changes
  useEffect(() => {
    if (profile) {
      setHeroTitlesText(profile.heroTitles?.join('\n') || '');
      setBioParagraphsText(profile.bioParagraphs?.join('\n') || '');
      if (profile.clients) {
        setClientsText(profile.clients.map((c: any) => `${c.name}, ${c.icon}`).join('\n'));
      } else {
        setClientsText('');
      }
    }
  }, [profile]);

  // Sync project/experience local inputs on modal opens
  useEffect(() => {
    if (editingProject) {
      setTechnologiesText(editingProject.technologies?.join(', ') || '');
    } else {
      setTechnologiesText('');
    }
  }, [editingProject?._id, crudModal.mode]);

  useEffect(() => {
    if (editingExperience) {
      setBulletPointsText(editingExperience.bulletPoints?.join('\n') || '');
    } else {
      setBulletPointsText('');
    }
  }, [editingExperience, crudModal.mode, crudModal.type]);

  // Preset Theme Applier
  const applyThemePreset = (preset: string) => {
    let updates: any = {};
    if (preset === 'cyan-emerald') {
      updates = { primaryColor: '#06b6d4', secondaryColor: '#10b981', backgroundColor: '#040814', textColor: '#f1f5f9', cardColor: 'rgba(15, 23, 42, 0.5)' };
    } else if (preset === 'indigo-space') {
      updates = { primaryColor: '#6366f1', secondaryColor: '#a855f7', backgroundColor: '#090514', textColor: '#f8fafc', cardColor: 'rgba(30, 27, 75, 0.4)' };
    } else if (preset === 'forest-green') {
      updates = { primaryColor: '#10b981', secondaryColor: '#84cc16', backgroundColor: '#060f0e', textColor: '#ecfdf5', cardColor: 'rgba(6, 78, 59, 0.3)' };
    } else if (preset === 'luxury-crimson') {
      updates = { primaryColor: '#f43f5e', secondaryColor: '#fb923c', backgroundColor: '#110608', textColor: '#fff1f2', cardColor: 'rgba(136, 19, 55, 0.35)' };
    } else if (preset === 'slate-minimalist') {
      updates = { primaryColor: '#e2e8f0', secondaryColor: '#94a3b8', backgroundColor: '#0f172a', textColor: '#f8fafc', cardColor: 'rgba(30, 41, 59, 0.6)' };
    }
    setProfile((prev: any) => ({
      ...prev,
      designTokens: {
        ...prev.designTokens,
        ...updates,
        themeTemplate: preset
      }
    }));
  };

  // Load data from Backend
  const loadData = async () => {
    try {
      const settings = await fetchApi('/settings');
      if (settings) setProfile(settings);
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

  useEffect(() => {
    loadData();
  }, []);

  // Fetch admin messages if logged in
  useEffect(() => {
    if (adminToken && adminTab === 'messages') {
      fetchApi('/contact/messages', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
        .then(data => setMessages(data))
        .catch(() => {});
    }
  }, [adminToken, adminTab]);

  // Admin login handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        setAdminToken(data.token);
        setLoginForm({ email: '', password: '' });
        loadData();
      }
    } catch (err: any) {
      setLoginErr(err.message || 'Invalid admin credentials');
    }
  };

  // Admin logout handler
  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken('');
  };

  // Profile Settings Save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedClients = clientsText.split('\n').map(line => {
      const parts = line.split(',');
      const name = parts[0]?.trim() || '';
      const icon = parts.slice(1).join(',').trim() || '';
      return { name, icon };
    }).filter(c => c.name);

    const updatedProfile = {
      ...profile,
      heroTitles: heroTitlesText.split('\n').map(s => s.trim()).filter(Boolean),
      bioParagraphs: bioParagraphsText.split('\n').map(s => s.trim()).filter(Boolean),
      clients: parsedClients
    };
    try {
      const data = await fetchApi('/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(updatedProfile)
      });
      alert(data.message || 'Global Settings saved!');
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to save settings');
    }
  };

  // File Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`
        },
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Upload failed');
      }
      const data = await res.json();
      if (data.url) {
        onComplete(data.url);
        alert('Image uploaded successfully!');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to upload image');
    }
  };

  // Project Save
  const handleProjectCrudSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = crudModal.mode === 'edit';
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/projects/${editingProject._id}` : '/projects';

    const payload = {
      ...editingProject,
      technologies: technologiesText.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      await fetchApi(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      setCrudModal({ type: '', mode: 'add' });
      setEditingProject(null);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to save project');
    }
  };

  // Experience Save
  const handleExpCrudSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = crudModal.mode === 'edit';
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/experiences/${editingExperience._id}` : '/experiences';

    const payload = {
      ...editingExperience,
      bulletPoints: bulletPointsText.split('\n').map(s => s.trim()).filter(Boolean),
      periodStart: editingExperience.periodStart ? new Date(editingExperience.periodStart) : undefined,
      periodEnd: editingExperience.isActive ? null : (editingExperience.periodEnd ? new Date(editingExperience.periodEnd) : null)
    };

    try {
      await fetchApi(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      setCrudModal({ type: '', mode: 'add' });
      setEditingExperience(null);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to save experience');
    }
  };

  // Startup Save
  const handleStartupCrudSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = crudModal.mode === 'edit';
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/startups/${editingStartup._id}` : '/startups';

    try {
      await fetchApi(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(editingStartup)
      });
      setCrudModal({ type: '', mode: 'add' });
      setEditingStartup(null);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to save startup');
    }
  };

  // Skill Save
  const handleSkillCrudSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = crudModal.mode === 'edit';
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/skills/${editingSkill._id}` : '/skills';

    try {
      await fetchApi(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(editingSkill)
      });
      setCrudModal({ type: '', mode: 'add' });
      setEditingSkill(null);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to save skill');
    }
  };

  // CRUD deletes
  const handleDeleteItem = async (type: 'project' | 'experience' | 'startup' | 'skill', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const url = `/${type}s/${id}`;
    try {
      await fetchApi(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete item');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans p-6 md:p-12 selection:bg-indigo-500 selection:text-slate-900 antialiased">
      
      {/* SECURE LOGIN CARD */}
      {!adminToken ? (
        <div className="max-w-md mx-auto my-24 bg-slate-950 border border-slate-900 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/50 border border-indigo-800/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Lock size={20} />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-100">Secure CMS Login</h2>
            <p className="text-xs text-slate-500">Authorized portfolio administration.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Admin Email</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="admin@nafis.info"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer">
              Log In
            </button>
          </form>

          {loginErr && (
            <div className="p-3 bg-rose-950/30 border border-rose-800/20 rounded-xl text-rose-400 text-xs font-semibold text-center">
              {loginErr}
            </div>
          )}
          
          <div className="text-center pt-2">
            <a href="/" className="text-xs text-slate-500 hover:text-slate-300 underline">
              Return to public portfolio
            </a>
          </div>
        </div>
      ) : (
        
        /* DYNAMIC ADMIN CONTROL DASHBOARD */
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header bar */}
          <div className="flex justify-between items-center border-b border-slate-900 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-slate-950 shadow-md">A</div>
              <div>
                <h2 className="font-extrabold text-base text-slate-100">CMS Control Dashboard</h2>
                <span className="text-[10px] text-slate-500">Logged in as {profile.socialLinks?.email || 'admin@nafis.info'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a href="/" className="text-xs text-slate-400 hover:text-slate-200 bg-slate-950 px-3 py-2 border border-slate-900 rounded-xl transition-colors">
                Public Site
              </a>
              <button onClick={handleAdminLogout} className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:bg-rose-950/40 text-xs font-semibold rounded-xl transition-colors cursor-pointer">
                <LogOut size={13} /> Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-900 overflow-x-auto gap-2">
            {[
              { id: 'profile', label: 'Settings', icon: Settings },
              { id: 'projects', label: 'Projects', icon: Code },
              { id: 'work-exp', label: 'Work Exp', icon: Award },
              { id: 'education', label: 'Education', icon: Award },
              { id: 'leadership', label: 'Leadership', icon: Award },
              { id: 'certifications', label: 'Certifications', icon: Award },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'startups', label: 'Startups', icon: Globe },
              { id: 'skills', label: 'Skills', icon: Users },
              { id: 'messages', label: 'Inbox', icon: Mail }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setAdminTab(t.id as any)}
                className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  adminTab === t.id
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-950/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <t.icon size={13} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* EDITOR PANELS CONTAINER */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 min-h-[400px]">
            
            {/* TAB: PROFILE SETTINGS */}
            {adminTab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-6">
                <h3 className="text-sm font-bold text-slate-200 border-b border-slate-900 pb-2">Global Settings (FR-CMS-01 & 02)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                    <input type="text" required value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Site Name</label>
                    <input type="text" required value={profile.siteName} onChange={(e) => setProfile({ ...profile, siteName: e.target.value })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hero Greeting</label>
                    <input type="text" required value={profile.heroGreeting} onChange={(e) => setProfile({ ...profile, heroGreeting: e.target.value })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current Location / Address</label>
                    <input type="text" required value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="Dhaka & Rangpur, Bangladesh" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Meta Description (SEO)</label>
                  <input type="text" required value={profile.metaDescription} onChange={(e) => setProfile({ ...profile, metaDescription: e.target.value })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hero Job Titles (One per line)</label>
                    <textarea rows={3} value={heroTitlesText} onChange={(e) => setHeroTitlesText(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bio Paragraphs (One per line)</label>
                    <textarea rows={3} value={bioParagraphsText} onChange={(e) => setBioParagraphsText(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Clients / Partners Marquee (Name, Emoji per line)</label>
                    <textarea rows={3} value={clientsText} onChange={(e) => setClientsText(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="Bangladesh Navy, ⚓&#10;ATI Limited, 💼" />
                  </div>
                </div>

                {/* Customizable Bio Metadata Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-900 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hero Badge Certification Text</label>
                    <input type="text" required value={profile.heroBadgeText || ''} onChange={(e) => setProfile({ ...profile, heroBadgeText: e.target.value })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">About Section Status Text</label>
                    <input type="text" required value={profile.aboutStatusText || ''} onChange={(e) => setProfile({ ...profile, aboutStatusText: e.target.value })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avatar / Profile Photo URL</label>
                    <div className="flex gap-2">
                      <input type="text" value={profile.avatarUrl || ''} onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })} className="flex-1 bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                      <label className="px-3 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-indigo-900/40">
                        <Upload size={12} />
                        Upload
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setProfile({ ...profile, avatarUrl: url }))} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Customizable Themes & Color Pickers */}
                <div className="border-t border-slate-900 pt-4 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-wider block">Dynamic Styling & Theme Presets (Entire Website Color Changing Options)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Select Preset Template Theme</label>
                      <select value={profile.designTokens?.themeTemplate || 'cyan-emerald'} onChange={(e) => applyThemePreset(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500">
                        <option value="cyan-emerald">Default Cyan/Emerald Theme</option>
                        <option value="indigo-space">Indigo Space Theme</option>
                        <option value="forest-green">Forest Green Theme</option>
                        <option value="luxury-crimson">Luxury Crimson Theme</option>
                        <option value="slate-minimalist">Slate Minimalist Theme</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Font Family</label>
                      <input type="text" value={profile.designTokens?.fontFamily || ''} onChange={(e) => setProfile({ ...profile, designTokens: { ...profile.designTokens, fontFamily: e.target.value } })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Primary Accent</label>
                      <input type="color" value={profile.designTokens?.primaryColor || '#6366f1'} onChange={(e) => setProfile({ ...profile, designTokens: { ...profile.designTokens, primaryColor: e.target.value } })} className="w-full h-8 bg-slate-900 border border-slate-800 text-xs rounded-xl text-slate-200 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Secondary Accent</label>
                      <input type="color" value={profile.designTokens?.secondaryColor || '#475569'} onChange={(e) => setProfile({ ...profile, designTokens: { ...profile.designTokens, secondaryColor: e.target.value } })} className="w-full h-8 bg-slate-900 border border-slate-800 text-xs rounded-xl text-slate-200 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Background Color</label>
                      <input type="color" value={profile.designTokens?.backgroundColor || '#040814'} onChange={(e) => setProfile({ ...profile, designTokens: { ...profile.designTokens, backgroundColor: e.target.value } })} className="w-full h-8 bg-slate-900 border border-slate-800 text-xs rounded-xl text-slate-200 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Text Color</label>
                      <input type="color" value={profile.designTokens?.textColor || '#f1f5f9'} onChange={(e) => setProfile({ ...profile, designTokens: { ...profile.designTokens, textColor: e.target.value } })} className="w-full h-8 bg-slate-900 border border-slate-800 text-xs rounded-xl text-slate-200 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Card Background</label>
                      <input type="text" value={profile.designTokens?.cardColor || 'rgba(15, 23, 42, 0.5)'} onChange={(e) => setProfile({ ...profile, designTokens: { ...profile.designTokens, cardColor: e.target.value } })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="rgba(15,23,42,0.5)" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-slate-900 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">GitHub URL</label>
                    <input type="text" value={profile.socialLinks?.github || ''} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, github: e.target.value } })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">LinkedIn URL</label>
                    <input type="text" value={profile.socialLinks?.linkedin || ''} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, linkedin: e.target.value } })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Contact</label>
                    <input type="text" value={profile.socialLinks?.email || ''} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, email: e.target.value } })} className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Resume File / PDF URL (CV Uploading Option)</label>
                    <div className="flex gap-2">
                      <input type="text" value={profile.resumeUrl || ''} onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })} className="flex-1 bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                      <label className="px-3 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-indigo-900/40">
                        <Upload size={12} />
                        Upload PDF
                        <input type="file" accept=".pdf" onChange={(e) => handleImageUpload(e, (url) => setProfile({ ...profile, resumeUrl: url }))} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Section Visibility Toggles</label>
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                    {[
                      { id: 'showExperience', label: 'Work Experience Section' },
                      { id: 'showEducation', label: 'Education Section' },
                      { id: 'showStartups', label: 'Startups Section' },
                      { id: 'showLeadership', label: 'Leadership Section' },
                      { id: 'showCertifications', label: 'Certifications Section' },
                      { id: 'showAchievements', label: 'Achievements Section' },
                      { id: 'showSkills', label: 'Skills Section' }
                    ].map(switchItem => (
                      <label key={switchItem.id} className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!profile.sectionVisibility?.[switchItem.id]}
                          onChange={(e) => setProfile({
                            ...profile,
                            sectionVisibility: {
                              ...profile.sectionVisibility,
                              [switchItem.id]: e.target.checked
                            }
                          })}
                          className="w-4 h-4 rounded border-slate-800 text-indigo-500 focus:ring-indigo-500 bg-slate-900"
                        />
                        <span>{switchItem.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Statistics & Counters Configuration */}
                <div className="border-t border-slate-900 pt-4 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-wider block">Custom Statistics & Counter Metrics (FR-CMS-07)</h4>
                  <p className="text-xs text-slate-500">Configure the 4 numeric counters visible in the About section on the main website.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {/* Stat 1 */}
                    <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl space-y-3">
                      <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">Statistic 1</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Value (Number)</label>
                          <input type="number" required value={profile.stat1?.value ?? 0} onChange={(e) => setProfile({ ...profile, stat1: { ...profile.stat1, value: parseInt(e.target.value) || 0 } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Suffix (e.g. +)</label>
                          <input type="text" value={profile.stat1?.suffix ?? ''} onChange={(e) => setProfile({ ...profile, stat1: { ...profile.stat1, suffix: e.target.value } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Label / Title</label>
                        <input type="text" required value={profile.stat1?.label ?? ''} onChange={(e) => setProfile({ ...profile, stat1: { ...profile.stat1, label: e.target.value } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl space-y-3">
                      <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">Statistic 2</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Value (Number)</label>
                          <input type="number" required value={profile.stat2?.value ?? 0} onChange={(e) => setProfile({ ...profile, stat2: { ...profile.stat2, value: parseInt(e.target.value) || 0 } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Suffix (e.g. +)</label>
                          <input type="text" value={profile.stat2?.suffix ?? ''} onChange={(e) => setProfile({ ...profile, stat2: { ...profile.stat2, suffix: e.target.value } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Label / Title</label>
                        <input type="text" required value={profile.stat2?.label ?? ''} onChange={(e) => setProfile({ ...profile, stat2: { ...profile.stat2, label: e.target.value } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl space-y-3">
                      <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">Statistic 3</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Value (Number)</label>
                          <input type="number" required value={profile.stat3?.value ?? 0} onChange={(e) => setProfile({ ...profile, stat3: { ...profile.stat3, value: parseInt(e.target.value) || 0 } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Suffix (e.g. +)</label>
                          <input type="text" value={profile.stat3?.suffix ?? ''} onChange={(e) => setProfile({ ...profile, stat3: { ...profile.stat3, suffix: e.target.value } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Label / Title</label>
                        <input type="text" required value={profile.stat3?.label ?? ''} onChange={(e) => setProfile({ ...profile, stat3: { ...profile.stat3, label: e.target.value } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>

                    {/* Stat 4 */}
                    <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl space-y-3">
                      <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">Statistic 4</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Value (Number)</label>
                          <input type="number" required value={profile.stat4?.value ?? 0} onChange={(e) => setProfile({ ...profile, stat4: { ...profile.stat4, value: parseInt(e.target.value) || 0 } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Suffix (e.g. +)</label>
                          <input type="text" value={profile.stat4?.suffix ?? ''} onChange={(e) => setProfile({ ...profile, stat4: { ...profile.stat4, suffix: e.target.value } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Label / Title</label>
                        <input type="text" required value={profile.stat4?.label ?? ''} onChange={(e) => setProfile({ ...profile, stat4: { ...profile.stat4, label: e.target.value } })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer">
                  Save Settings & Theming Configurations
                </button>
              </form>
            )}

            {/* TAB: PROJECTS (CRUD) */}
            {adminTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="font-bold text-slate-200 text-sm">Projects Inventory</h4>
                  <button
                    onClick={() => {
                      setEditingProject({ title: '', client: '', category: 'Enterprise', description: '', status: 'Delivered', technologies: [], repositoryUrl: '', liveUrl: '', thumbnailUrl: '', sortOrder: projects.length + 1 });
                      setCrudModal({ type: 'project', mode: 'add' });
                    }}
                    className="px-3.5 py-1.5 bg-indigo-950 border border-indigo-800/40 text-indigo-400 hover:bg-indigo-950/60 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} /> Add Project
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500">
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Title</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Client</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p) => (
                        <tr key={p._id} className="border-b border-slate-900/60 hover:bg-slate-950/30">
                          <td className="py-2.5 px-3 font-semibold text-slate-400">{p.sortOrder}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-200">{p.title}</td>
                          <td className="py-2.5 px-3 text-slate-400">{p.category}</td>
                          <td className="py-2.5 px-3 text-slate-400">{p.client}</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-slate-900 text-[10px] rounded-md font-semibold text-slate-300 border border-slate-800">{p.status}</span></td>
                          <td className="py-2.5 px-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingProject({ ...p });
                                setCrudModal({ type: 'project', mode: 'edit' });
                              }}
                              className="text-indigo-400 hover:text-indigo-300 cursor-pointer inline-flex p-1"
                            >
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteItem('project', p._id)} className="text-rose-400 hover:text-rose-300 cursor-pointer inline-flex p-1">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: WORK EXPERIENCES (CRUD) */}
            {adminTab === 'work-exp' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="font-bold text-slate-200 text-sm font-sans flex items-center gap-2">
                    <span>Work Experience & Instruction Inventory</span>
                  </h4>
                  <button
                    onClick={() => {
                      setEditingExperience({ roleTitle: '', organization: '', categoryType: 'Work', periodStart: '', periodEnd: '', isActive: false, bulletPoints: [], sortOrder: experiences.length + 1, badge: '', link: '' });
                      setCrudModal({ type: 'work-exp', mode: 'add' });
                    }}
                    className="px-3.5 py-1.5 bg-indigo-950 border border-indigo-800/40 text-indigo-400 hover:bg-indigo-950/60 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} /> Add Work Exp
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500">
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Role / Title</th>
                        <th className="py-2.5 px-3">Company</th>
                        <th className="py-2.5 px-3">Sub-Category</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experiences
                        .filter(e => e.categoryType === 'Work' || e.categoryType === 'Instruction')
                        .map((exp) => (
                          <tr key={exp._id} className="border-b border-slate-900/60 hover:bg-slate-950/30">
                            <td className="py-2.5 px-3 font-semibold text-slate-400">{exp.sortOrder}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-200">{exp.roleTitle}</td>
                            <td className="py-2.5 px-3 text-slate-400">{exp.organization}</td>
                            <td className="py-2.5 px-3 text-slate-400">
                              <span className="px-2 py-0.5 bg-slate-900/80 text-[10px] rounded-md font-semibold text-slate-300 border border-slate-800/50">
                                {exp.categoryType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-slate-900 text-[10px] rounded-md font-semibold text-slate-300 border border-slate-800">{exp.isActive ? 'Active' : 'Completed'}</span></td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  const formattedExp = {
                                    ...exp,
                                    periodStart: exp.periodStart ? new Date(exp.periodStart).toISOString().split('T')[0] : '',
                                    periodEnd: exp.periodEnd ? new Date(exp.periodEnd).toISOString().split('T')[0] : '',
                                    badge: exp.badge || '',
                                    link: exp.link || ''
                                  };
                                  setEditingExperience(formattedExp);
                                  setCrudModal({ type: 'work-exp', mode: 'edit' });
                                }}
                                className="text-indigo-400 hover:text-indigo-300 cursor-pointer inline-flex p-1"
                              >
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteItem('experience', exp._id)} className="text-rose-400 hover:text-rose-300 cursor-pointer inline-flex p-1">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: EDUCATION (CRUD) */}
            {adminTab === 'education' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="font-bold text-slate-200 text-sm font-sans flex items-center gap-2">
                    <span>Education & Academics Inventory</span>
                  </h4>
                  <button
                    onClick={() => {
                      setEditingExperience({ roleTitle: '', organization: '', categoryType: 'Education', periodStart: '', periodEnd: '', isActive: false, bulletPoints: [], sortOrder: experiences.length + 1, badge: '', link: '' });
                      setCrudModal({ type: 'education', mode: 'add' });
                    }}
                    className="px-3.5 py-1.5 bg-indigo-950 border border-indigo-800/40 text-indigo-400 hover:bg-indigo-950/60 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} /> Add Education
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500">
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Degree / Program</th>
                        <th className="py-2.5 px-3">School / Institution</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experiences
                        .filter(e => e.categoryType === 'Education')
                        .map((exp) => (
                          <tr key={exp._id} className="border-b border-slate-900/60 hover:bg-slate-950/30">
                            <td className="py-2.5 px-3 font-semibold text-slate-400">{exp.sortOrder}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-200">{exp.roleTitle}</td>
                            <td className="py-2.5 px-3 text-slate-400">{exp.organization}</td>
                            <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-slate-900 text-[10px] rounded-md font-semibold text-slate-300 border border-slate-800">{exp.isActive ? 'Currently Enrolled' : 'Graduated'}</span></td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  const formattedExp = {
                                    ...exp,
                                    periodStart: exp.periodStart ? new Date(exp.periodStart).toISOString().split('T')[0] : '',
                                    periodEnd: exp.periodEnd ? new Date(exp.periodEnd).toISOString().split('T')[0] : '',
                                    badge: exp.badge || '',
                                    link: exp.link || ''
                                  };
                                  setEditingExperience(formattedExp);
                                  setCrudModal({ type: 'education', mode: 'edit' });
                                }}
                                className="text-indigo-400 hover:text-indigo-300 cursor-pointer inline-flex p-1"
                              >
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteItem('experience', exp._id)} className="text-rose-400 hover:text-rose-300 cursor-pointer inline-flex p-1">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: LEADERSHIP (CRUD) */}
            {adminTab === 'leadership' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="font-bold text-slate-200 text-sm font-sans flex items-center gap-2">
                    <span>Leadership & Activities Inventory</span>
                  </h4>
                  <button
                    onClick={() => {
                      setEditingExperience({ roleTitle: '', organization: '', categoryType: 'Leadership', periodStart: '', periodEnd: '', isActive: false, bulletPoints: [], sortOrder: experiences.length + 1, badge: '', link: '' });
                      setCrudModal({ type: 'leadership', mode: 'add' });
                    }}
                    className="px-3.5 py-1.5 bg-indigo-950 border border-indigo-800/40 text-indigo-400 hover:bg-indigo-950/60 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} /> Add Leadership
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500">
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Role / Position</th>
                        <th className="py-2.5 px-3">Organization</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experiences
                        .filter(e => e.categoryType === 'Leadership')
                        .map((exp) => (
                          <tr key={exp._id} className="border-b border-slate-900/60 hover:bg-slate-950/30">
                            <td className="py-2.5 px-3 font-semibold text-slate-400">{exp.sortOrder}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-200">{exp.roleTitle}</td>
                            <td className="py-2.5 px-3 text-slate-400">{exp.organization}</td>
                            <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-slate-900 text-[10px] rounded-md font-semibold text-slate-300 border border-slate-800">{exp.isActive ? 'Active' : 'Completed'}</span></td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  const formattedExp = {
                                    ...exp,
                                    periodStart: exp.periodStart ? new Date(exp.periodStart).toISOString().split('T')[0] : '',
                                    periodEnd: exp.periodEnd ? new Date(exp.periodEnd).toISOString().split('T')[0] : '',
                                    badge: exp.badge || '',
                                    link: exp.link || ''
                                  };
                                  setEditingExperience(formattedExp);
                                  setCrudModal({ type: 'leadership', mode: 'edit' });
                                }}
                                className="text-indigo-400 hover:text-indigo-300 cursor-pointer inline-flex p-1"
                              >
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteItem('experience', exp._id)} className="text-rose-400 hover:text-rose-300 cursor-pointer inline-flex p-1">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: CERTIFICATIONS (CRUD) */}
            {adminTab === 'certifications' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="font-bold text-slate-200 text-sm font-sans flex items-center gap-2">
                    <span>Professional Certifications Inventory</span>
                  </h4>
                  <button
                    onClick={() => {
                      setEditingExperience({ roleTitle: '', organization: '', categoryType: 'Certification', periodStart: '', periodEnd: '', isActive: false, bulletPoints: [], sortOrder: experiences.length + 1, badge: '🏅', link: '' });
                      setCrudModal({ type: 'certification', mode: 'add' });
                    }}
                    className="px-3.5 py-1.5 bg-indigo-950 border border-indigo-800/40 text-indigo-400 hover:bg-indigo-950/60 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} /> Add Certification
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500">
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Badge</th>
                        <th className="py-2.5 px-3">Certification Title</th>
                        <th className="py-2.5 px-3">Issuer</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experiences
                        .filter(e => e.categoryType === 'Certification')
                        .map((exp) => (
                          <tr key={exp._id} className="border-b border-slate-900/60 hover:bg-slate-950/30">
                            <td className="py-2.5 px-3 font-semibold text-slate-400">{exp.sortOrder}</td>
                            <td className="py-2.5 px-3 text-base text-center">{exp.badge || '🏅'}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-200">{exp.roleTitle}</td>
                            <td className="py-2.5 px-3 text-slate-400">{exp.organization}</td>
                            <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-slate-900 text-[10px] rounded-md font-semibold text-slate-300 border border-slate-800">{exp.isActive ? 'No Expiration' : 'Expired / Completed'}</span></td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  const formattedExp = {
                                    ...exp,
                                    periodStart: exp.periodStart ? new Date(exp.periodStart).toISOString().split('T')[0] : '',
                                    periodEnd: exp.periodEnd ? new Date(exp.periodEnd).toISOString().split('T')[0] : '',
                                    badge: exp.badge || '🏅',
                                    link: exp.link || ''
                                  };
                                  setEditingExperience(formattedExp);
                                  setCrudModal({ type: 'certification', mode: 'edit' });
                                }}
                                className="text-indigo-400 hover:text-indigo-300 cursor-pointer inline-flex p-1"
                              >
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteItem('experience', exp._id)} className="text-rose-400 hover:text-rose-300 cursor-pointer inline-flex p-1">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: ACHIEVEMENTS (CRUD) */}
            {adminTab === 'achievements' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="font-bold text-slate-200 text-sm font-sans flex items-center gap-2">
                    <span>Achievements & Honors Inventory</span>
                  </h4>
                  <button
                    onClick={() => {
                      setEditingExperience({ roleTitle: '', organization: '', categoryType: 'Achievement', periodStart: '', periodEnd: '', isActive: false, bulletPoints: [], sortOrder: experiences.length + 1, badge: '🏆', link: '' });
                      setCrudModal({ type: 'achievement', mode: 'add' });
                    }}
                    className="px-3.5 py-1.5 bg-indigo-950 border border-indigo-800/40 text-indigo-400 hover:bg-indigo-950/60 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} /> Add Achievement
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500">
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Badge</th>
                        <th className="py-2.5 px-3">Award Title</th>
                        <th className="py-2.5 px-3">Conferred By</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experiences
                        .filter(e => e.categoryType === 'Achievement')
                        .map((exp) => (
                          <tr key={exp._id} className="border-b border-slate-900/60 hover:bg-slate-950/30">
                            <td className="py-2.5 px-3 font-semibold text-slate-400">{exp.sortOrder}</td>
                            <td className="py-2.5 px-3 text-base text-center">{exp.badge || '🏆'}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-200">{exp.roleTitle}</td>
                            <td className="py-2.5 px-3 text-slate-400">{exp.organization}</td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  const formattedExp = {
                                    ...exp,
                                    periodStart: exp.periodStart ? new Date(exp.periodStart).toISOString().split('T')[0] : '',
                                    periodEnd: exp.periodEnd ? new Date(exp.periodEnd).toISOString().split('T')[0] : '',
                                    badge: exp.badge || '🏆',
                                    link: exp.link || ''
                                  };
                                  setEditingExperience(formattedExp);
                                  setCrudModal({ type: 'achievement', mode: 'edit' });
                                }}
                                className="text-indigo-400 hover:text-indigo-300 cursor-pointer inline-flex p-1"
                              >
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteItem('experience', exp._id)} className="text-rose-400 hover:text-rose-300 cursor-pointer inline-flex p-1">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: STARTUPS (CRUD) */}
            {adminTab === 'startups' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="font-bold text-slate-200 text-sm">Startups & Ventures</h4>
                  <button
                    onClick={() => {
                      setEditingStartup({ brandName: '', role: '', philosophy: '', websiteUrl: '', logoUrl: '', isActive: true });
                      setCrudModal({ type: 'startup', mode: 'add' });
                    }}
                    className="px-3.5 py-1.5 bg-indigo-950 border border-indigo-800/40 text-indigo-400 hover:bg-indigo-950/60 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} /> Add Startup
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500">
                        <th className="py-2.5 px-3">Brand Name</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Philosophy</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {startups.map((s) => (
                        <tr key={s._id} className="border-b border-slate-900/60 hover:bg-slate-950/30">
                          <td className="py-2.5 px-3 font-bold text-slate-200">{s.brandName}</td>
                          <td className="py-2.5 px-3 text-slate-400">{s.role}</td>
                          <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{s.philosophy}</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-slate-900 text-[10px] rounded-md font-semibold text-slate-300 border border-slate-800">{s.isActive ? 'Active' : 'Completed'}</span></td>
                          <td className="py-2.5 px-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingStartup({ ...s });
                                setCrudModal({ type: 'startup', mode: 'edit' });
                              }}
                              className="text-indigo-400 hover:text-indigo-300 cursor-pointer inline-flex p-1"
                            >
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteItem('startup', s._id)} className="text-rose-400 hover:text-rose-300 cursor-pointer inline-flex p-1">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: SKILLS (CRUD) */}
            {adminTab === 'skills' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="font-bold text-slate-200 text-sm">Skills Base</h4>
                  <button
                    onClick={() => {
                      setEditingSkill({ name: '', category: 'Agile & Product Delivery', icon: '📋', sortOrder: skills.length + 1 });
                      setCrudModal({ type: 'skill', mode: 'add' });
                    }}
                    className="px-3.5 py-1.5 bg-indigo-950 border border-indigo-800/40 text-indigo-400 hover:bg-indigo-950/60 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} /> Add Skill
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500">
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Skill Name</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Icon</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.map((sk) => (
                        <tr key={sk._id} className="border-b border-slate-900/60 hover:bg-slate-950/30">
                          <td className="py-2.5 px-3 font-semibold text-slate-400">{sk.sortOrder}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-200">{sk.name}</td>
                          <td className="py-2.5 px-3 text-slate-400">{sk.category}</td>
                          <td className="py-2.5 px-3 text-slate-400">{sk.icon}</td>
                          <td className="py-2.5 px-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingSkill({ ...sk });
                                setCrudModal({ type: 'skill', mode: 'edit' });
                              }}
                              className="text-indigo-400 hover:text-indigo-300 cursor-pointer inline-flex p-1"
                            >
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteItem('skill', sk._id)} className="text-rose-400 hover:text-rose-300 cursor-pointer inline-flex p-1">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: INBOX MESSAGES */}
            {adminTab === 'messages' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-200 text-sm border-b border-slate-900 pb-3">Contact Messages Inbox</h4>
                
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">No contact form messages found.</div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {messages.map((msg) => (
                      <div key={msg._id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start flex-wrap gap-2 border-b border-slate-950 pb-2">
                          <div>
                            <h5 className="font-bold text-slate-200 text-sm">{msg.name}</h5>
                            <a href={`mailto:${msg.email}`} className="text-xs text-indigo-400 font-semibold">{msg.email}</a>
                          </div>
                          <span className="text-[10px] text-slate-600 font-semibold">{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div><strong className="text-slate-400">Subject:</strong> <span className="text-slate-300 font-semibold">{msg.subject}</span></div>
                          <div className="pt-2 text-slate-400 leading-relaxed font-mono text-[11px] bg-slate-950/40 p-3 rounded-lg border border-slate-950">{msg.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ─────── MODAL: PROJECT CRUD EDITOR ─────── */}
          {crudModal.type === 'project' && editingProject && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <form onSubmit={handleProjectCrudSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h4 className="font-black text-sm text-slate-200 border-b border-slate-800 pb-2">
                  {crudModal.mode === 'add' ? 'Add New Project' : 'Edit Project Entry'}
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Project Title</label>
                  <input required type="text" value={editingProject.title} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Client / Issuer</label>
                    <input required type="text" value={editingProject.client} onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                    <select value={editingProject.category} onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500">
                      <option value="Enterprise">Enterprise Module</option>
                      <option value="Academic">Academic / Tech</option>
                      <option value="Startup">Startup Ventures</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                  <textarea required rows={3} value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Delivery Status</label>
                    <select value={editingProject.status} onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500">
                      <option value="Delivered">Delivered</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Planned">Planned</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sort Order</label>
                    <input type="number" value={editingProject.sortOrder} onChange={(e) => setEditingProject({ ...editingProject, sortOrder: parseInt(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Technology Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={technologiesText}
                    onChange={(e) => setTechnologiesText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="React, PostgreSQL, Springboot"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Repository URL</label>
                    <input type="text" value={editingProject.repositoryUrl || ''} onChange={(e) => setEditingProject({ ...editingProject, repositoryUrl: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Live URL</label>
                    <input type="text" value={editingProject.liveUrl || ''} onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Project Image / Thumbnail URL</label>
                  <div className="flex gap-2">
                    <input type="text" value={editingProject.thumbnailUrl || ''} onChange={(e) => setEditingProject({ ...editingProject, thumbnailUrl: e.target.value })} className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                    <label className="px-3 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 hover:text-indigo-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-indigo-900/40">
                      <Upload size={12} />
                      Upload
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setEditingProject({ ...editingProject, thumbnailUrl: url }))} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => { setCrudModal({ type: '', mode: 'add' }); setEditingProject(null); }} className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-955 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer">Save Details</button>
                </div>
              </form>
            </div>
          )}

          {/* ─────── MODAL: WORK EXPERIENCE & INSTRUCTION EDITOR ─────── */}
          {crudModal.type === 'work-exp' && editingExperience && (
            <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <form onSubmit={handleExpCrudSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h4 className="font-black text-sm text-slate-200 border-b border-slate-800 pb-2 font-sans">
                  {crudModal.mode === 'add' ? 'Add Work / Instruction Experience' : 'Edit Work / Instruction Entry'}
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Role / Job Title</label>
                  <input required type="text" value={editingExperience.roleTitle} onChange={(e) => setEditingExperience({ ...editingExperience, roleTitle: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Company / Organization</label>
                    <input required type="text" value={editingExperience.organization} onChange={(e) => setEditingExperience({ ...editingExperience, organization: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sub-Category</label>
                    <select value={editingExperience.categoryType} onChange={(e) => setEditingExperience({ ...editingExperience, categoryType: e.target.value as any })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500">
                      <option value="Work">Work Experience (Jobs)</option>
                      <option value="Instruction">Instruction (Teaching / Coaching)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Period Start</label>
                    <input required type="date" value={editingExperience.periodStart} onChange={(e) => setEditingExperience({ ...editingExperience, periodStart: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Period End (Leave blank if Present)</label>
                    <input type="date" disabled={editingExperience.isActive} value={editingExperience.periodEnd || ''} onChange={(e) => setEditingExperience({ ...editingExperience, periodEnd: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-40" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingExperience.isActive}
                      onChange={(e) => setEditingExperience({ ...editingExperience, isActive: e.target.checked, periodEnd: e.target.checked ? '' : editingExperience.periodEnd })}
                      className="w-4 h-4 rounded border-slate-800 text-indigo-500 bg-slate-950"
                    />
                    <span>Active / Present Role</span>
                  </label>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sort Order</label>
                    <input type="number" value={editingExperience.sortOrder} onChange={(e) => setEditingExperience({ ...editingExperience, sortOrder: parseInt(e.target.value) || 0 })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bullet Points / Description (One per line)</label>
                  <textarea
                    rows={4}
                    value={bulletPointsText}
                    onChange={(e) => setBulletPointsText(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Led project delivery for enterprise systems&#10;Groomed product backlog using scrum framework"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Link / URL Option</label>
                  <input type="text" value={editingExperience.link || ''} onChange={(e) => setEditingExperience({ ...editingExperience, link: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="e.g., Company Website or Certificate URL" />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => { setCrudModal({ type: '', mode: 'add' }); setEditingExperience(null); }} className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-955 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer">Save Details</button>
                </div>
              </form>
            </div>
          )}

          {/* ─────── MODAL: EDUCATION EDITOR ─────── */}
          {crudModal.type === 'education' && editingExperience && (
            <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <form onSubmit={handleExpCrudSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h4 className="font-black text-sm text-slate-200 border-b border-slate-800 pb-2 font-sans">
                  {crudModal.mode === 'add' ? 'Add New Education Entry' : 'Edit Education Details'}
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Degree / Program</label>
                  <input required type="text" value={editingExperience.roleTitle} onChange={(e) => setEditingExperience({ ...editingExperience, roleTitle: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">School / Institution</label>
                    <input required type="text" value={editingExperience.organization} onChange={(e) => setEditingExperience({ ...editingExperience, organization: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Period Start</label>
                    <input required type="date" value={editingExperience.periodStart} onChange={(e) => setEditingExperience({ ...editingExperience, periodStart: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Period End (Leave blank if Present)</label>
                    <input type="date" disabled={editingExperience.isActive} value={editingExperience.periodEnd || ''} onChange={(e) => setEditingExperience({ ...editingExperience, periodEnd: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-40" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingExperience.isActive}
                      onChange={(e) => setEditingExperience({ ...editingExperience, isActive: e.target.checked, periodEnd: e.target.checked ? '' : editingExperience.periodEnd })}
                      className="w-4 h-4 rounded border-slate-800 text-indigo-500 bg-slate-950"
                    />
                    <span>Currently Enrolled</span>
                  </label>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sort Order</label>
                    <input type="number" value={editingExperience.sortOrder} onChange={(e) => setEditingExperience({ ...editingExperience, sortOrder: parseInt(e.target.value) || 0 })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bullet Points / Academic Details (One per line)</label>
                  <textarea
                    rows={4}
                    value={bulletPointsText}
                    onChange={(e) => setBulletPointsText(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="CGPA: 3.82&#10;Major in Software Engineering"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Link / URL Option</label>
                  <input type="text" value={editingExperience.link || ''} onChange={(e) => setEditingExperience({ ...editingExperience, link: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="e.g., Institution portal or degree verification link" />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => { setCrudModal({ type: '', mode: 'add' }); setEditingExperience(null); }} className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-955 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer">Save Details</button>
                </div>
              </form>
            </div>
          )}

          {/* ─────── MODAL: LEADERSHIP EDITOR ─────── */}
          {crudModal.type === 'leadership' && editingExperience && (
            <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <form onSubmit={handleExpCrudSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h4 className="font-black text-sm text-slate-200 border-b border-slate-800 pb-2 font-sans">
                  {crudModal.mode === 'add' ? 'Add New Leadership Entry' : 'Edit Leadership Details'}
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Role / Position</label>
                  <input required type="text" value={editingExperience.roleTitle} onChange={(e) => setEditingExperience({ ...editingExperience, roleTitle: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Organization / Club / Activity</label>
                    <input required type="text" value={editingExperience.organization} onChange={(e) => setEditingExperience({ ...editingExperience, organization: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Period Start</label>
                    <input required type="date" value={editingExperience.periodStart} onChange={(e) => setEditingExperience({ ...editingExperience, periodStart: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Period End (Leave blank if Present)</label>
                    <input type="date" disabled={editingExperience.isActive} value={editingExperience.periodEnd || ''} onChange={(e) => setEditingExperience({ ...editingExperience, periodEnd: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-40" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingExperience.isActive}
                      onChange={(e) => setEditingExperience({ ...editingExperience, isActive: e.target.checked, periodEnd: e.target.checked ? '' : editingExperience.periodEnd })}
                      className="w-4 h-4 rounded border-slate-800 text-indigo-500 bg-slate-950"
                    />
                    <span>Active / Present Role</span>
                  </label>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sort Order</label>
                    <input type="number" value={editingExperience.sortOrder} onChange={(e) => setEditingExperience({ ...editingExperience, sortOrder: parseInt(e.target.value) || 0 })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bullet Points / Responsibilities (One per line)</label>
                  <textarea
                    rows={4}
                    value={bulletPointsText}
                    onChange={(e) => setBulletPointsText(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Led a community of 500+ tech members&#10;Organized regional hackathons and seminars"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Link / URL Option</label>
                  <input type="text" value={editingExperience.link || ''} onChange={(e) => setEditingExperience({ ...editingExperience, link: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="e.g., Club site or leadership project link" />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => { setCrudModal({ type: '', mode: 'add' }); setEditingExperience(null); }} className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-955 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer">Save Details</button>
                </div>
              </form>
            </div>
          )}

          {/* ─────── MODAL: CERTIFICATION EDITOR ─────── */}
          {crudModal.type === 'certification' && editingExperience && (
            <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <form onSubmit={handleExpCrudSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h4 className="font-black text-sm text-slate-200 border-b border-slate-800 pb-2 font-sans">
                  {crudModal.mode === 'add' ? 'Add New Certification' : 'Edit Certification Details'}
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Certification Name</label>
                  <input required type="text" value={editingExperience.roleTitle} onChange={(e) => setEditingExperience({ ...editingExperience, roleTitle: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Issuing Organization</label>
                  <input required type="text" value={editingExperience.organization} onChange={(e) => setEditingExperience({ ...editingExperience, organization: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                {/* Badge Builder Grid */}
                <div className="bg-slate-955/40 p-4 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block font-sans">Custom Badge Designer</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Icon / Emoji / Text</label>
                      <input type="text" value={editingExperience.badge || ''} onChange={(e) => setEditingExperience({ ...editingExperience, badge: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="🏅" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Badge Shape</label>
                      <select value={editingExperience.badgeShape || 'pill'} onChange={(e) => setEditingExperience({ ...editingExperience, badgeShape: e.target.value as any })} className="w-full bg-slate-955 border border-slate-800 text-xs px-2 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500">
                        <option value="pill">Pill Shaped</option>
                        <option value="circle">Circular</option>
                        <option value="square">Square</option>
                        <option value="outline">Outlined Pill</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Background Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={editingExperience.badgeBgColor || '#1e1b4b'} onChange={(e) => setEditingExperience({ ...editingExperience, badgeBgColor: e.target.value })} className="w-8 h-8 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer" />
                        <input type="text" value={editingExperience.badgeBgColor || ''} onChange={(e) => setEditingExperience({ ...editingExperience, badgeBgColor: e.target.value })} className="flex-1 bg-slate-955 border border-slate-800 text-[10px] px-2 py-1 rounded-lg text-slate-200" placeholder="#1e1b4b" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Text / Accent Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={editingExperience.badgeTextColor || '#6366f1'} onChange={(e) => setEditingExperience({ ...editingExperience, badgeTextColor: e.target.value })} className="w-8 h-8 bg-slate-955 border border-slate-800 rounded-lg cursor-pointer" />
                        <input type="text" value={editingExperience.badgeTextColor || ''} onChange={(e) => setEditingExperience({ ...editingExperience, badgeTextColor: e.target.value })} className="flex-1 bg-slate-955 border border-slate-800 text-[10px] px-2 py-1 rounded-lg text-slate-200" placeholder="#6366f1" />
                      </div>
                    </div>
                  </div>

                  {/* Badge Live Preview */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Live Designer Preview:</span>
                    {(() => {
                      const icon = editingExperience.badge || '🏅';
                      const bg = editingExperience.badgeBgColor || 'rgba(99, 102, 241, 0.08)';
                      const color = editingExperience.badgeTextColor || 'var(--accent-primary)';
                      const shape = editingExperience.badgeShape || 'pill';

                      let borderRadius = '8px';
                      if (shape === 'circle') borderRadius = '9999px';
                      if (shape === 'square') borderRadius = '4px';

                      const isOutline = shape === 'outline';
                      const borderStyle = isOutline ? `1px solid ${color}` : '1px solid transparent';
                      const finalBg = isOutline ? 'transparent' : bg;

                      return (
                        <span 
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
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Period Start / Issue Date</label>
                    <input required type="date" value={editingExperience.periodStart} onChange={(e) => setEditingExperience({ ...editingExperience, periodStart: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Expiration Date (Leave blank if No Expiry)</label>
                    <input type="date" disabled={editingExperience.isActive} value={editingExperience.periodEnd || ''} onChange={(e) => setEditingExperience({ ...editingExperience, periodEnd: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-40" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingExperience.isActive}
                      onChange={(e) => setEditingExperience({ ...editingExperience, isActive: e.target.checked, periodEnd: e.target.checked ? '' : editingExperience.periodEnd })}
                      className="w-4 h-4 rounded border-slate-800 text-indigo-500 bg-slate-905"
                    />
                    <span>No Expiration (Lifetime)</span>
                  </label>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sort Order</label>
                    <input type="number" value={editingExperience.sortOrder} onChange={(e) => setEditingExperience({ ...editingExperience, sortOrder: parseInt(e.target.value) || 0 })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Credential Lines (Line 1: Credential ID, Line 2: Verification URL)</label>
                  <textarea
                    rows={4}
                    value={bulletPointsText}
                    onChange={(e) => setBulletPointsText(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-mono text-[11px]"
                    placeholder="Line 1: ID-12345&#10;Line 2: https://verify.org/id"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Dedicated Verification Link</label>
                  <input type="text" value={editingExperience.link || ''} onChange={(e) => setEditingExperience({ ...editingExperience, link: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="https://bcert.me/..." />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => { setCrudModal({ type: '', mode: 'add' }); setEditingExperience(null); }} className="px-4 py-2 bg-slate-955 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-955 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer">Save Details</button>
                </div>
              </form>
            </div>
          )}

          {/* ─────── MODAL: ACHIEVEMENT EDITOR ─────── */}
          {crudModal.type === 'achievement' && editingExperience && (
            <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <form onSubmit={handleExpCrudSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h4 className="font-black text-sm text-slate-200 border-b border-slate-800 pb-2 font-sans">
                  {crudModal.mode === 'add' ? 'Add New Achievement' : 'Edit Achievement Details'}
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Award Title / Achievement</label>
                  <input required type="text" value={editingExperience.roleTitle} onChange={(e) => setEditingExperience({ ...editingExperience, roleTitle: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Conferred Organization / Authority</label>
                  <input required type="text" value={editingExperience.organization} onChange={(e) => setEditingExperience({ ...editingExperience, organization: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                {/* Badge Builder Grid */}
                <div className="bg-slate-955/40 p-4 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block font-sans">Custom Badge Designer</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Icon / Emoji / Text</label>
                      <input type="text" value={editingExperience.badge || ''} onChange={(e) => setEditingExperience({ ...editingExperience, badge: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="🏆" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Badge Shape</label>
                      <select value={editingExperience.badgeShape || 'pill'} onChange={(e) => setEditingExperience({ ...editingExperience, badgeShape: e.target.value as any })} className="w-full bg-slate-955 border border-slate-800 text-xs px-2 py-1.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500">
                        <option value="pill">Pill Shaped</option>
                        <option value="circle">Circular</option>
                        <option value="square">Square</option>
                        <option value="outline">Outlined Pill</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Background Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={editingExperience.badgeBgColor || '#881337'} onChange={(e) => setEditingExperience({ ...editingExperience, badgeBgColor: e.target.value })} className="w-8 h-8 bg-slate-955 border border-slate-800 rounded-lg cursor-pointer" />
                        <input type="text" value={editingExperience.badgeBgColor || ''} onChange={(e) => setEditingExperience({ ...editingExperience, badgeBgColor: e.target.value })} className="flex-1 bg-slate-955 border border-slate-800 text-[10px] px-2 py-1 rounded-lg text-slate-200" placeholder="#881337" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Text / Accent Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={editingExperience.badgeTextColor || '#f43f5e'} onChange={(e) => setEditingExperience({ ...editingExperience, badgeTextColor: e.target.value })} className="w-8 h-8 bg-slate-955 border border-slate-800 rounded-lg cursor-pointer" />
                        <input type="text" value={editingExperience.badgeTextColor || ''} onChange={(e) => setEditingExperience({ ...editingExperience, badgeTextColor: e.target.value })} className="flex-1 bg-slate-955 border border-slate-800 text-[10px] px-2 py-1 rounded-lg text-slate-200" placeholder="#f43f5e" />
                      </div>
                    </div>
                  </div>

                  {/* Badge Live Preview */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Live Designer Preview:</span>
                    {(() => {
                      const icon = editingExperience.badge || '🏆';
                      const bg = editingExperience.badgeBgColor || 'rgba(99, 102, 241, 0.08)';
                      const color = editingExperience.badgeTextColor || 'var(--accent-primary)';
                      const shape = editingExperience.badgeShape || 'pill';

                      let borderRadius = '8px';
                      if (shape === 'circle') borderRadius = '9999px';
                      if (shape === 'square') borderRadius = '4px';

                      const isOutline = shape === 'outline';
                      const borderStyle = isOutline ? `1px solid ${color}` : '1px solid transparent';
                      const finalBg = isOutline ? 'transparent' : bg;

                      return (
                        <span 
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
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Date Conferred</label>
                    <input required type="date" value={editingExperience.periodStart} onChange={(e) => setEditingExperience({ ...editingExperience, periodStart: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sort Order</label>
                    <input type="number" value={editingExperience.sortOrder} onChange={(e) => setEditingExperience({ ...editingExperience, sortOrder: parseInt(e.target.value) || 0 })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bullet Points / Achievement Details (One per line)</label>
                  <textarea
                    rows={4}
                    value={bulletPointsText}
                    onChange={(e) => setBulletPointsText(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Secured 1st place out of 100 teams&#10;Awarded for excellence in Product Design"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Link / URL Option</label>
                  <input type="text" value={editingExperience.link || ''} onChange={(e) => setEditingExperience({ ...editingExperience, link: e.target.value })} className="w-full bg-slate-955 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="e.g., Certificate URL or event website link" />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => { setCrudModal({ type: '', mode: 'add' }); setEditingExperience(null); }} className="px-4 py-2 bg-slate-955 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-955 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer">Save Details</button>
                </div>
              </form>
            </div>
          )}

          {/* ─────── MODAL: STARTUP CRUD EDITOR ─────── */}
          {crudModal.type === 'startup' && editingStartup && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <form onSubmit={handleStartupCrudSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
                <h4 className="font-black text-sm text-slate-200 border-b border-slate-800 pb-2">
                  {crudModal.mode === 'add' ? 'Add New Startup' : 'Edit Startup Details'}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Brand Name</label>
                    <input required type="text" value={editingStartup.brandName} onChange={(e) => setEditingStartup({ ...editingStartup, brandName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Role / Position</label>
                    <input required type="text" value={editingStartup.role} onChange={(e) => setEditingStartup({ ...editingStartup, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Philosophy / Core Vision</label>
                  <input required type="text" value={editingStartup.philosophy} onChange={(e) => setEditingStartup({ ...editingStartup, philosophy: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Website URL</label>
                  <input type="text" value={editingStartup.websiteUrl || ''} onChange={(e) => setEditingStartup({ ...editingStartup, websiteUrl: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingStartup.isActive}
                      onChange={(e) => setEditingStartup({ ...editingStartup, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-800 text-indigo-500 bg-slate-950"
                    />
                    <span>Active Venture</span>
                  </label>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Logo Image URL</label>
                    <div className="flex gap-2">
                      <input type="text" value={editingStartup.logoUrl || ''} onChange={(e) => setEditingStartup({ ...editingStartup, logoUrl: e.target.value })} className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none" />
                      <label className="px-2 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer">
                        <Upload size={12} />
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setEditingStartup({ ...editingStartup, logoUrl: url }))} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => { setCrudModal({ type: '', mode: 'add' }); setEditingStartup(null); }} className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer">Save Venture</button>
                </div>
              </form>
            </div>
          )}

          {/* ─────── MODAL: SKILL CRUD EDITOR ─────── */}
          {crudModal.type === 'skill' && editingSkill && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <form onSubmit={handleSkillCrudSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
                <h4 className="font-black text-sm text-slate-200 border-b border-slate-800 pb-2">
                  {crudModal.mode === 'add' ? 'Add New Skill' : 'Edit Skill Details'}
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Skill Name</label>
                  <input required type="text" value={editingSkill.name} onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category Group</label>
                  <select value={editingSkill.category} onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500">
                    <option value="Agile & Product Delivery">Agile & Product Delivery</option>
                    <option value="Business Analysis">Business Analysis</option>
                    <option value="Languages & Frameworks">Languages & Frameworks</option>
                    <option value="Communication & Leadership">Communication & Leadership</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Emoji / Icon</label>
                    <input type="text" value={editingSkill.icon || ''} onChange={(e) => setEditingSkill({ ...editingSkill, icon: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="e.g. 📋" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sort Order</label>
                    <input type="number" value={editingSkill.sortOrder} onChange={(e) => setEditingSkill({ ...editingSkill, sortOrder: parseInt(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => { setCrudModal({ type: '', mode: 'add' }); setEditingSkill(null); }} className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer">Save Skill</button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
