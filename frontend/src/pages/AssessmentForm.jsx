import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { predictCareer } from '../services/api';

// ================================================================
// STATIC DATA
// ================================================================
const SKILLS = [
  "Python","Java","C++","JavaScript","TypeScript","SQL","MySQL",
  "PostgreSQL","MongoDB","Machine Learning","Deep Learning",
  "Data Science","Data Analysis","Power BI","Tableau","Excel",
  "Pandas","NumPy","TensorFlow","PyTorch","Flutter","Dart",
  "React","Next.js","Node.js","Express.js","HTML","CSS",
  "Firebase","Git","GitHub","Docker","Kubernetes","Linux",
  "Networking","Cyber Security","Cloud Computing","AWS","Azure",
  "DevOps","UI/UX","Figma","REST APIs","Ethical Hacking",
];

const INTERESTS = [
  { name: "Artificial Intelligence", icon: "🤖" },
  { name: "Machine Learning",        icon: "🧠" },
  { name: "Data Science",            icon: "📊" },
  { name: "Data Analytics",          icon: "📈" },
  { name: "Software Development",    icon: "💻" },
  { name: "Mobile App Development",  icon: "📱" },
  { name: "Web Development",         icon: "🌐" },
  { name: "Cyber Security",          icon: "🛡️" },
  { name: "Cloud Computing",         icon: "☁️" },
  { name: "Networking",              icon: "🔌" },
  { name: "UI/UX Design",            icon: "🎨" },
  { name: "DevOps",                  icon: "⚙️" },
  { name: "Database Management",     icon: "🗄️" },
  { name: "Robotics",                icon: "🦾" },
  { name: "Automation",              icon: "🔁" },
  { name: "Research",                icon: "🔬" },
  { name: "Business Intelligence",   icon: "💼" },
  { name: "Backend Development",     icon: "🔧" },
];

const EXPERIENCE_OPTIONS = [
  { label: "No Experience", icon: "🌱", desc: "Just getting started", apiValue: "No" },
  { label: "Internship",    icon: "🎓", desc: "Learned on the job",   apiValue: "Yes" },
  { label: "Freelancer",    icon: "🧩", desc: "Independent projects", apiValue: "Yes" },
  { label: "Part Time",     icon: "⏱️", desc: "Some professional time", apiValue: "Yes" },
  { label: "Full Time",     icon: "🏢", desc: "Full-time professional", apiValue: "Yes" },
];

const STEPS = [
  { id: 1, title: "Basic Information", icon: "👤" },
  { id: 2, title: "Technical Skills",  icon: "💡" },
  { id: 3, title: "Interests",         icon: "🎯" },
  { id: 4, title: "Academic Info",     icon: "🎓" },
  { id: 5, title: "Review & Submit",   icon: "🚀" },
];

const LOADING_MESSAGES = [
  "Analyzing Skills...",
  "Matching Interests...",
  "Running AI Models...",
  "Generating Recommendation...",
];

// ================================================================
// HELPERS
// ================================================================
const cgpaLabel = (v) => {
  if (v >= 3.5) return { text: "Excellent", color: "#10b981" };
  if (v >= 3.0) return { text: "Very Good", color: "#6366f1" };
  if (v >= 2.5) return { text: "Good", color: "#f59e0b" };
  return { text: "Needs Improvement", color: "#ef4444" };
};

const getAiTip = (skills, interest) => {
  const s = skills.map(x => x.toLowerCase());
  const has = (...arr) => arr.some(a => s.includes(a.toLowerCase()));

  if (has("Python", "Machine Learning") && /artificial intelligence|machine learning|data science/i.test(interest)) {
    return "Python + Machine Learning usually leads to AI Engineer or Data Scientist careers.";
  }
  if (has("React", "JavaScript", "HTML", "CSS") && /web development/i.test(interest)) {
    return "React + JavaScript is a great combo for Frontend or Full Stack Developer roles.";
  }
  if (has("Node.js", "SQL", "REST APIs") && /web development|backend/i.test(interest)) {
    return "Node.js + SQL is a strong foundation for Backend Developer careers.";
  }
  if (has("Docker", "Kubernetes", "AWS", "Azure") && /cloud computing|devops/i.test(interest)) {
    return "Docker + Cloud skills point towards DevOps Engineer or Cloud Engineer roles.";
  }
  if (has("Cyber Security", "Ethical Hacking", "Networking") && /cyber security|networking/i.test(interest)) {
    return "Networking + Ethical Hacking is exactly what Cyber Security Analysts need.";
  }
  if (has("Figma", "UI/UX") && /ui\/ux/i.test(interest)) {
    return "Figma + UI/UX skills are perfect for a UI/UX Designer career path.";
  }
  if (skills.length === 0) {
    return "Add a few skills — the more we know, the sharper your career match will be.";
  }
  return "Keep adding relevant skills and certifications — well-rounded profiles get stronger matches.";
};

const estimateCareers = (skills, interest) => {
  const s = skills.map(x => x.toLowerCase());
  const has = (...arr) => arr.some(a => s.includes(a.toLowerCase()));
  const results = [];

  if (has("Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch") ||
      /artificial intelligence|machine learning|data science/i.test(interest)) {
    results.push("Data Scientist", "Machine Learning Engineer");
  }
  if (has("React", "JavaScript", "HTML", "CSS", "TypeScript", "Next.js")) {
    results.push("Frontend Developer", "Full Stack Developer");
  }
  if (has("Node.js", "Express.js", "SQL", "MongoDB", "REST APIs")) {
    results.push("Backend Developer");
  }
  if (has("Docker", "Kubernetes", "AWS", "Azure", "DevOps") || /cloud computing|devops/i.test(interest)) {
    results.push("DevOps Engineer", "Cloud Engineer");
  }
  if (has("Cyber Security", "Ethical Hacking", "Networking") || /cyber security|networking/i.test(interest)) {
    results.push("Cyber Security Analyst");
  }
  if (has("Figma", "UI/UX") || /ui\/ux/i.test(interest)) {
    results.push("UI/UX Designer");
  }
  if (results.length === 0) {
    results.push("Software Engineer", "Data Analyst", "Business Analyst");
  }
  return [...new Set(results)].slice(0, 3);
};

// ================================================================
// SMALL UI PIECES
// ================================================================
const DarkModeToggle = ({ dark, toggle }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={toggle}
    style={{
      position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000,
      background: dark ? '#312e81' : '#eef2ff',
      border: `2px solid ${dark ? '#6366f1' : '#c7d2fe'}`,
      borderRadius: '50%', width: 44, height: 44,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}
  >
    {dark ? '☀️' : '🌙'}
  </motion.button>
);

const ProgressBar = ({ step, total, dark }) => {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: dark ? '#e0e7ff' : '#1e293b' }}>
          Step {step} of {total}
        </span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6366f1' }}>
          {pct}% Complete
        </span>
      </div>
      <div style={{ height: '8px', background: dark ? '#312e81' : '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ height: '100%', borderRadius: '6px', background: 'linear-gradient(90deg, #6366f1, #ec4899)' }}
        />
      </div>
      <div className="af-step-dots">
        {STEPS.map(s => (
          <div key={s.id} className="af-step-dot-wrap">
            <div
              className={`af-step-dot ${s.id <= step ? 'af-step-dot-active' : ''} ${s.id === step ? 'af-step-dot-current' : ''}`}
              aria-current={s.id === step ? 'step' : undefined}
              title={s.title}
            >
              {s.id < step ? '✓' : s.icon}
            </div>
            <span className="af-step-dot-label">{s.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionHeading = ({ icon, title, subtitle, dark }) => (
  <div style={{ marginBottom: '1.4rem' }}>
    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: dark ? '#e0e7ff' : '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>{icon}</span> {title}
    </h3>
    {subtitle && <p style={{ color: dark ? '#a5b4fc' : 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>{subtitle}</p>}
  </div>
);

// ================================================================
// MAIN COMPONENT
// ================================================================
const AssessmentForm = () => {
  const navigate = useNavigate();

  const [dark, setDark] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);
  const [direction, setDirection] = useState(1);
const [university, setUniversity] = useState('');
  const [fullName, setFullName] = useState('');
  const [educationLevel, setEducationLevel] = useState('Bachelor');

  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState(['Python']);

  const [selectedInterest, setSelectedInterest] = useState('Data Science');

  const [cgpa, setCgpa] = useState(3.5);
  const [experienceChoice, setExperienceChoice] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const searchInputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 750);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Dark mode body
  useEffect(() => {
    document.body.style.background = dark ? '#0f0e1a' : '';
    document.body.style.color = dark ? '#e0e7ff' : '';
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
  }, [dark]);

  const filteredSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return SKILLS.filter(s => !selectedSkills.includes(s));
    return SKILLS.filter(s => s.toLowerCase().includes(q) && !selectedSkills.includes(s));
  }, [skillSearch, selectedSkills]);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
    setErrors(e => ({ ...e, skills: null }));
  };

  const removeSkill = (skill) => setSelectedSkills(prev => prev.filter(s => s !== skill));

  const handleSkillSearchKeyDown = (e) => {
    if (e.key === 'Enter' && filteredSkills.length > 0) {
      e.preventDefault();
      toggleSkill(filteredSkills[0]);
      setSkillSearch('');
    }
  };

  // ---------------- validation ----------------
  const validateStep = (step) => {
    if (step === 1) return fullName.trim().length >= 2;
    if (step === 2) return selectedSkills.length > 0;
    if (step === 3) return !!selectedInterest;
    if (step === 4) return !!experienceChoice;
    return true;
  };

  const stepValid = validateStep(currentStep);
  const allValid = [1, 2, 3, 4].every(validateStep);

  const goNext = () => {
    if (!validateStep(currentStep)) {
      setErrors(e => ({ ...e, [currentStep]: true }));
      return;
    }
    setDirection(1);
    const next = Math.min(currentStep + 1, STEPS.length);
    setCurrentStep(next);
    setMaxReached(m => Math.max(m, next));
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (id) => {
    if (id <= maxReached) {
      setDirection(id > currentStep ? 1 : -1);
      setCurrentStep(id);
    }
  };

  const experienceApiValue = useMemo(() => {
    const found = EXPERIENCE_OPTIONS.find(o => o.label === experienceChoice);
    return found ? found.apiValue : 'No';
  }, [experienceChoice]);

  const tip = useMemo(() => getAiTip(selectedSkills, selectedInterest), [selectedSkills, selectedInterest]);
  const estimated = useMemo(() => estimateCareers(selectedSkills, selectedInterest), [selectedSkills, selectedInterest]);

  const handleSubmit = async () => {
    if (!allValid) return;
    setLoading(true);
    setLoadingMsgIndex(0);
    const payload = {
      skills: selectedSkills.join(', '),
      interests: selectedInterest,
      cgpa: cgpa.toFixed(2),
      experience: experienceApiValue,
    };
    try {
      const response = await predictCareer(payload);
      navigate('/result', { state: { result: response, input: payload } });
    } catch (error) {
      console.error("Prediction Error:", error);
      alert("Backend error! Make sure Flask server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const cgpaMeta = cgpaLabel(cgpa);

  const slideVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  // Reusable dark-aware color shortcuts
  const textPri  = dark ? '#e0e7ff' : '#1e293b';
  const textSec  = dark ? '#a5b4fc' : '#64748b';
  const textMute = dark ? '#818cf8' : '#94a3b8';
  const cardBg   = dark ? '#13112b' : '#f8fafc';
  const glassCardStyle = dark ? { background: '#13112b', border: '1px solid #312e81' } : {};

  return (
    <div className={`fade-in ${dark ? 'af-dark' : ''}`} style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <DarkModeToggle dark={dark} toggle={() => setDark(!dark)} />

      <style>{`
        .af-step-dots {
          display: flex;
          justify-content: space-between;
          margin-top: 1.1rem;
          gap: 4px;
        }
        .af-step-dot-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          min-width: 0;
        }
        .af-step-dot {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border: 2px solid #e2e8f0;
          font-size: 0.85rem;
          color: #94a3b8;
          transition: all 0.3s ease;
        }
        .af-step-dot-active {
          background: #eef2ff;
          border-color: #6366f1;
          color: #6366f1;
        }
        .af-step-dot-current {
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
          transform: scale(1.1);
        }
        .af-step-dot-label {
          font-size: 0.62rem;
          color: #64748b;
          margin-top: 4px;
          text-align: center;
          display: none;
        }
        @media (min-width: 640px) {
          .af-step-dot-label { display: block; }
        }
        .af-badge {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 0.82rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .af-badge:hover {
          border-color: #6366f1;
          color: #6366f1;
          transform: translateY(-1px);
        }
        .af-badge:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }
        .af-badge-selected {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-color: transparent;
          color: #fff;
        }
        .af-badge-selected:hover {
          color: #fff;
        }
        .af-search-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .af-search-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .af-interest-card {
          padding: 16px;
          border-radius: 14px;
          border: 2px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .af-interest-card:hover {
          border-color: #6366f1;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(99,102,241,0.12);
        }
        .af-interest-card:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }
        .af-interest-card-selected {
          border-color: #6366f1;
          background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.08));
          box-shadow: 0 8px 24px rgba(99,102,241,0.18);
        }
        .af-exp-card {
          padding: 18px;
          border-radius: 14px;
          border: 2px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .af-exp-card:hover {
          border-color: #6366f1;
          transform: translateY(-2px);
        }
        .af-exp-card:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }
        .af-exp-card-selected {
          border-color: #6366f1;
          background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.08));
        }
        .af-slider {
          width: 100%;
          height: 8px;
          border-radius: 6px;
          appearance: none;
          background: linear-gradient(90deg, #ef4444, #f59e0b, #6366f1, #10b981);
          outline: none;
          cursor: pointer;
        }
        .af-slider::-webkit-slider-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 4px solid #6366f1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .af-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 4px solid #6366f1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .af-text-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          font-size: 0.92rem;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .af-text-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .af-error-text {
          color: #ef4444;
          font-size: 0.78rem;
          font-weight: 600;
          margin-top: 6px;
        }
        .af-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 860px) {
          .af-grid { grid-template-columns: 1fr; }
        }
        .af-interest-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }
        .af-exp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .af-nav-btns {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .af-loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .af-spinner {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 5px solid rgba(99,102,241,0.2);
          border-top-color: #6366f1;
          animation: af-spin 0.9s linear infinite;
          margin: 0 auto 1.2rem;
        }
        @keyframes af-spin {
          to { transform: rotate(360deg); }
        }
        .af-summary-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 14px;
          background: #eef2ff;
          color: #6366f1;
          font-size: 0.72rem;
          font-weight: 700;
          margin: 2px;
        }

        /* ================= DARK MODE OVERRIDES ================= */
        .af-dark .af-step-dot { background: #1e1b4b; border-color: #312e81; color: #a5b4fc; }
        .af-dark .af-step-dot-active { background: #312e81; border-color: #6366f1; color: #c7d2fe; }
        .af-dark .af-step-dot-current { background: linear-gradient(135deg, #6366f1, #ec4899); color: #fff; }
        .af-dark .af-step-dot-label { color: #a5b4fc; }
        .af-dark .af-badge { background: #1e1b4b; border-color: #312e81; color: #c7d2fe; }
        .af-dark .af-badge:hover { border-color: #6366f1; color: #a5b4fc; }
        .af-dark .af-search-input,
        .af-dark .af-text-input { background: #1e1b4b; border-color: #312e81; color: #e0e7ff; }
        .af-dark .af-search-input::placeholder,
        .af-dark .af-text-input::placeholder { color: #6b7299; }
        .af-dark .af-interest-card,
        .af-dark .af-exp-card { background: #13112b; border-color: #312e81; }
        .af-dark .af-interest-card-selected,
        .af-dark .af-exp-card-selected {
          background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(236,72,153,0.18));
          border-color: #6366f1;
        }
        .af-dark .af-summary-chip { background: #312e81; color: #c7d2fe; }
        .af-dark .glass-card { background: #13112b; border: 1px solid #312e81; color: #e0e7ff; }
        .af-dark select { background: #1e1b4b; color: #e0e7ff; border-color: #312e81; }
        .af-dark label { color: #e0e7ff; }
      `}</style>

      {/* ── HEADER ─────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '4px', color: textPri }}>
          Career <span className="gradient-text">Profile Assessment</span>
        </h2>
        <p style={{ color: textSec }}>
          A few quick steps — our AI will recommend your top 3 career matches.
        </p>
      </motion.div>

      <div className="af-grid">
        {/* ── MAIN FORM CARD ─────────────────────── */}
        <div className="glass-card" style={glassCardStyle}>
          <ProgressBar step={currentStep} total={STEPS.length} dark={dark} />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              {/* STEP 1 — BASIC INFORMATION */}
              {currentStep === 1 && (
                <div>
                  <SectionHeading icon="👤" title="Basic Information" subtitle="Tell us a little about yourself." dark={dark} />
                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label htmlFor="af-fullname" style={{ color: textPri }}>Full Name</label>
                    <input
                      id="af-fullname"
                      className="af-text-input"
                      type="text"
                      placeholder="e.g. Ayesha Khan"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setErrors(er => ({ ...er, 1: null })); }}
                      aria-required="true"
                      aria-invalid={!!errors[1]}
                    />
                    {errors[1] && <div className="af-error-text">Please enter your full name to continue.</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="af-education" style={{ color: textPri }}>Education Level</label>
                    <select
                      id="af-education"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                    >
                      <option value="Intermediate">Intermediate</option>
                      <option value="Bachelor">Bachelor's</option>
                      <option value="Master">Master's</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                </div>
              )}
              
<div className="form-group" style={{ marginTop: "1rem" }}>
  <label>University</label>

  <select
    value={university}
    onChange={(e) => setUniversity(e.target.value)}
  >
    <option value="">Select University</option>

    <option value="University of Gujrat">
      University of Gujrat
    </option>

    <option value="University of the Punjab">
      University of the Punjab
    </option>

    <option value="COMSATS University">
      COMSATS University
    </option>

    <option value="FAST NUCES">
      FAST NUCES
    </option>

    <option value="UET Lahore">
      UET Lahore
    </option>

    <option value="NUST">
      NUST
    </option>

    <option value="Other">
      Other
    </option>
  </select>
</div>
              {/* STEP 2 — TECHNICAL SKILLS */}
              {currentStep === 2 && (
                <div>
                  <SectionHeading icon="💡" title="Technical Skills" subtitle="Search and select all the skills you're comfortable with." dark={dark} />
                  <input
                    ref={searchInputRef}
                    className="af-search-input"
                    type="text"
                    placeholder="🔍 Search skills (e.g. Python, React, Docker)..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    onKeyDown={handleSkillSearchKeyDown}
                    aria-label="Search skills"
                  />

                  {selectedSkills.length > 0 && (
                    <div style={{ margin: '1rem 0' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: textSec, marginBottom: '8px' }}>
                        SELECTED ({selectedSkills.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedSkills.map(skill => (
                          <button
                            key={skill}
                            type="button"
                            className="af-badge af-badge-selected"
                            onClick={() => removeSkill(skill)}
                            aria-pressed="true"
                            aria-label={`Remove ${skill}`}
                          >
                            {skill} ✕
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: textSec, margin: '1rem 0 8px' }}>
                    {skillSearch ? 'MATCHING SKILLS' : 'ALL SKILLS'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                    {filteredSkills.length === 0 && (
                      <span style={{ fontSize: '0.82rem', color: textMute }}>No matching skills found.</span>
                    )}
                    {filteredSkills.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        className="af-badge"
                        onClick={() => toggleSkill(skill)}
                        aria-pressed="false"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                  {errors[2] && <div className="af-error-text">Please select at least one skill.</div>}
                </div>
              )}

              {/* STEP 3 — INTERESTS */}
              {currentStep === 3 && (
                <div>
                  <SectionHeading icon="🎯" title="Field of Interest" subtitle="Pick the field that excites you the most." dark={dark} />
                  <div className="af-interest-grid">
                    {INTERESTS.map(({ name, icon }) => (
                      <button
                        key={name}
                        type="button"
                        className={`af-interest-card ${selectedInterest === name ? 'af-interest-card-selected' : ''}`}
                        onClick={() => { setSelectedInterest(name); setErrors(e => ({ ...e, 3: null })); }}
                        aria-pressed={selectedInterest === name}
                      >
                        <span style={{ fontSize: '1.8rem' }}>{icon}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: selectedInterest === name ? '#6366f1' : textPri }}>
                          {name}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors[3] && <div className="af-error-text">Please choose a field of interest.</div>}
                </div>
              )}

              {/* STEP 4 — ACADEMIC INFORMATION */}
              {currentStep === 4 && (
                <div>
                  <SectionHeading icon="🎓" title="Academic Information" subtitle="Your CGPA and work experience help us fine-tune your match." dark={dark} />

                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                      <label style={{ fontWeight: 700, color: textPri }}>CGPA (out of 4.0)</label>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: cgpaMeta.color }}>{cgpa.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      className="af-slider"
                      min="0" max="4" step="0.01"
                      value={cgpa}
                      onChange={(e) => setCgpa(parseFloat(e.target.value))}
                      aria-valuemin={0}
                      aria-valuemax={4}
                      aria-valuenow={cgpa}
                      aria-label="CGPA slider"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: textMute, marginTop: '4px' }}>
                      <span>0.0</span><span>1.0</span><span>2.0</span><span>3.0</span><span>4.0</span>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '0.82rem', fontWeight: 700, color: cgpaMeta.color }}>
                      {cgpaMeta.text}
                    </div>
                  </div>

                  <div style={{ fontWeight: 700, color: textPri, marginBottom: '10px' }}>Work Experience</div>
                  <div className="af-exp-grid">
                    {EXPERIENCE_OPTIONS.map(opt => (
                      <button
                        key={opt.label}
                        type="button"
                        className={`af-exp-card ${experienceChoice === opt.label ? 'af-exp-card-selected' : ''}`}
                        onClick={() => { setExperienceChoice(opt.label); setErrors(e => ({ ...e, 4: null })); }}
                        aria-pressed={experienceChoice === opt.label}
                      >
                        <span style={{ fontSize: '1.6rem' }}>{opt.icon}</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: experienceChoice === opt.label ? '#6366f1' : textPri }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: textMute }}>{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors[4] && <div className="af-error-text">Please select your experience level.</div>}
                </div>
              )}

              {/* STEP 5 — REVIEW & SUBMIT */}
              {currentStep === 5 && (
                <div>
                  <SectionHeading icon="🚀" title="Review & Submit" subtitle="Double check your profile before we run the AI models." dark={dark} />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '1.4rem' }}>
                    <div style={{ padding: '14px', background: cardBg, borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.72rem', color: textSec, fontWeight: 700 }}>NAME</div>
                      <div style={{ fontWeight: 700, color: textPri }}>{fullName || '—'}</div>
                    </div>
                    <div style={{ padding: '14px', background: cardBg, borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.72rem', color: textSec, fontWeight: 700 }}>INTEREST</div>
                      <div style={{ fontWeight: 700, color: textPri }}>{selectedInterest || '—'}</div>
                    </div>
                    <div style={{ padding: '14px', background: cardBg, borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.72rem', color: textSec, fontWeight: 700 }}>CGPA</div>
                      <div style={{ fontWeight: 700, color: textPri }}>{cgpa.toFixed(2)} / 4.0</div>
                    </div>
                    <div style={{ padding: '14px', background: cardBg, borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.72rem', color: textSec, fontWeight: 700 }}>EXPERIENCE</div>
                      <div style={{ fontWeight: 700, color: textPri }}>{experienceChoice || '—'}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.4rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: textSec, marginBottom: '8px' }}>SKILLS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedSkills.map(s => <span key={s} className="af-summary-chip">{s}</span>)}
                    </div>
                  </div>

                  <div style={{
                    padding: '16px', borderRadius: '14px',
                    border: dark ? '1.5px solid #4c1d95' : '1.5px solid #ddd6fe',
                    background: dark ? 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(236,72,153,0.14))' : 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(236,72,153,0.06))',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontWeight: 700, color: dark ? '#c4b5fd' : '#4c1d95', marginBottom: '6px', fontSize: '0.85rem' }}>✨ Likely Career Matches (Preview)</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {estimated.map(c => (
                        <span key={c} style={{
                          padding: '6px 14px', borderRadius: '20px',
                          background: dark ? '#1e1b4b' : '#fff',
                          border: dark ? '1.5px solid #6d28d9' : '1.5px solid #c4b5fd',
                          color: dark ? '#c4b5fd' : '#6d28d9',
                          fontWeight: 700, fontSize: '0.78rem'
                        }}>
                          {c}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: dark ? '#a78bfa' : '#7c3aed', marginTop: '8px' }}>
                      Final AI prediction may differ once all models run.
                    </div>
                  </div>

                  {!allValid && (
                    <div className="af-error-text">Please complete all previous steps before submitting.</div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── NAV BUTTONS ───────────────────────── */}
          <div className="af-nav-btns">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={goBack}
              disabled={currentStep === 1}
              style={{ opacity: currentStep === 1 ? 0.5 : 1 }}
            >
              ← Back
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={goNext}
                style={{ opacity: stepValid ? 1 : 0.6 }}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!allValid || loading}
                style={{ opacity: !allValid || loading ? 0.6 : 1, padding: '0.9rem 1.8rem' }}
              >
                {loading ? '🔄 Analyzing Profile...' : '🚀 Get My Top 3 Career Matches'}
              </button>
            )}
          </div>
        </div>

        {/* ── SIDEBAR: LIVE SUMMARY + AI TIP ────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'sticky', top: '1.5rem' }}>
          <div className="glass-card" style={glassCardStyle}>
            <div style={{ fontWeight: 800, color: textPri, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📋 Live Summary
            </div>
            <div style={{ fontSize: '0.8rem', color: textSec, marginBottom: '4px' }}>Skills</div>
            <div style={{ marginBottom: '10px' }}>
              {selectedSkills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selectedSkills.slice(0, 8).map(s => <span key={s} className="af-summary-chip">{s}</span>)}
                  {selectedSkills.length > 8 && <span className="af-summary-chip">+{selectedSkills.length - 8} more</span>}
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: textMute }}>No skills selected yet</span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: textSec, marginBottom: '4px' }}>Interest</div>
            <div style={{ fontWeight: 700, color: textPri, marginBottom: '10px' }}>{selectedInterest || '—'}</div>
            <div style={{ fontSize: '0.8rem', color: textSec, marginBottom: '4px' }}>CGPA</div>
            <div style={{ fontWeight: 700, color: cgpaMeta.color, marginBottom: '10px' }}>{cgpa.toFixed(2)} / 4.0 · {cgpaMeta.text}</div>
            <div style={{ fontSize: '0.8rem', color: textSec, marginBottom: '4px' }}>Experience</div>
            <div style={{ fontWeight: 700, color: textPri }}>{experienceChoice || '—'}</div>
          </div>

          <div className="glass-card" style={glassCardStyle}>
            <div style={{ fontWeight: 800, color: textPri, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💡 AI Tip
            </div>
            <p style={{ fontSize: '0.83rem', color: dark ? '#c7d2fe' : '#475569', lineHeight: '1.6', margin: 0 }}>
              {tip}
            </p>
          </div>
        </div>
      </div>

      {/* ── LOADING OVERLAY ─────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="af-loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ background: dark ? '#13112b' : '#fff', borderRadius: '20px', padding: '2.5rem', textAlign: 'center', maxWidth: '340px', border: dark ? '1px solid #312e81' : 'none' }}>
              <div className="af-spinner" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingMsgIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  style={{ fontWeight: 700, color: textPri, fontSize: '1rem' }}
                >
                  {LOADING_MESSAGES[loadingMsgIndex]}
                </motion.div>
              </AnimatePresence>
              <p style={{ fontSize: '0.78rem', color: textMute, marginTop: '10px' }}>
                Our AI models are working on your career match.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssessmentForm;