import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  PieChart, Pie, Cell
} from 'recharts';

import { getComparison, getPdfUrl } from '../services/api';

// ── helpers ──────────────────────────────────────────────
const calculateFitScore = (input) => {
  let score = 0;
  score += ((parseFloat(input.cgpa) || 0) / 4) * 25;
  score += input.experience     === 'Yes' ? 20 : 0;
  score += input.certifications === 'Yes' ? 10 : 0;
  score += input.workshops      === 'Yes' ? 10 : 0;
  score += input.hackathons     === 'Yes' ? 10 : 0;
  score += input.self_learning  === 'Yes' ? 10 : 0;
  score += (input.extra_courses && input.extra_courses !== 'nan') ? 5 : 0;
  return Math.min(Math.round(score), 100);
};

const getSkillScore = (skill) => {
  const high = ['ML', 'Python', 'SQL', 'Cloud Computing'];
  const mid  = ['Java', 'Networking', 'CAD/CAE(autocad/catia/ansys/proE/SeimensNX)'];
  if (high.includes(skill)) return 90;
  if (mid.includes(skill))  return 75;
  return 65;
};

const getInterestScore = (interest) => {
  const tech = ['Data scientist', 'Technology', 'Cloud computing', 'Research', 'Machine Learning'];
  const biz  = ['Financial Analysis', 'Trading'];
  if (tech.includes(interest)) return 88;
  if (biz.includes(interest))  return 82;
  return 75;
};

const MODEL_COLORS = {
  'Random Forest':       '#6366f1',
  'Decision Tree':       '#f59e0b',
  'SVM':                 '#ec4899',
  'Logistic Regression': '#10b981',
};

const METRIC_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981'];

// ── individual model card ────────────────────────────────
const ModelCard = ({ modelName, prediction, metricsData, isSelected }) => {
  const color = MODEL_COLORS[modelName] || '#6366f1';
  const m = metricsData || {};

  const barData = [
    { name: 'Accuracy',  value: Math.round((m.accuracy  || 0) * 10000) / 100 },
    { name: 'Precision', value: Math.round((m.precision || 0) * 10000) / 100 },
    { name: 'Recall',    value: Math.round((m.recall    || 0) * 10000) / 100 },
    { name: 'F1 Score',  value: Math.round((m.f1        || 0) * 10000) / 100 },
  ];

  const confPct = Math.round((prediction?.confidence || 0) * 100);
  const pieData = [
    { name: 'Confidence', value: confPct },
    { name: 'Rest',       value: 100 - confPct },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: isSelected ? `rgba(99,102,241,0.05)` : '#fff',
        border: `2px solid ${isSelected ? color : '#e2e8f0'}`,
        borderRadius: '16px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          {isSelected && (
            <span style={{
              fontSize: '0.68rem', fontWeight: '700', padding: '2px 8px',
              borderRadius: '6px', background: color, color: '#fff',
              marginBottom: '6px', display: 'inline-block'
            }}>✓ SELECTED</span>
          )}
          <div style={{ fontWeight: '700', fontSize: '1rem', color }}>{modelName}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
            Predicts:
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>
            {prediction?.career || '—'}
          </div>
        </div>

        {/* confidence pie */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={32}
                  dataKey="value" startAngle={90} endAngle={-270}>
                  <Cell fill={color} />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '-4px' }}>Confidence</div>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', color }}>{confPct}%</div>
        </div>
      </div>

      {/* bar chart */}
      <div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
          Model Performance
        </div>
        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barSize={20} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 9 }} />
              <Tooltip formatter={v => [`${v}%`]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={METRIC_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* metric pills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {barData.map(({ name, value }) => (
          <div key={name} style={{
            textAlign: 'center', background: '#f8fafc',
            borderRadius: '8px', padding: '5px 4px'
          }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{name}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>{value}%</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ── main ResultPage ───────────────────────────────────────
const ResultPage = () => {
  const { state }                           = useLocation();
  const [comparison, setComparison]         = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  if (!state || !state.result) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
        <h2>No Result Found</h2>
        <Link to="/assessment" className="btn btn-primary">Go to Assessment</Link>
      </div>
    );
  }

  const result         = state.result;
  const career         = result.career;
  const metrics        = result.metrics;
  const id             = result.id;
  const input          = state.input;
  const modelUsed      = result.model_used || 'Random Forest';
  const allPredictions = result.all_predictions || {};

  const cgpaPercent   = Math.round((parseFloat(input.cgpa) / 4) * 100);
  const expScore      = input.experience === 'Yes' ? 80 : 15;
  const skillScore    = getSkillScore(input.skills);
  const interestScore = getInterestScore(input.interests);
  const hackScore     = input.hackathons === 'Yes' ? 80 : 35;
  const fitScore      = calculateFitScore(input);
  const confidencePct = Math.round((metrics.confidence || metrics.accuracy || 0) * 100);

  const radarData = [
    { subject: 'Technical Skill', A: skillScore,    fullMark: 100 },
    { subject: 'Interest Fit',    A: interestScore, fullMark: 100 },
    { subject: 'Academic Score',  A: cgpaPercent,   fullMark: 100 },
    { subject: 'Experience',      A: expScore,      fullMark: 100 },
    { subject: 'Hackathons',      A: hackScore,     fullMark: 100 },
  ];

  useEffect(() => {
    getComparison()
      .then(r => setComparison(r.data || r))
      .catch(console.error);
  }, []);

  const canShowComparison = comparison && Object.keys(allPredictions).length > 0;

  return (
    <div className="fade-in">

      {/* ── RESULT CARD ─────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card"
        style={{ marginBottom: '2rem' }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'center',
          marginTop: '1rem'
        }}>

          {/* LEFT */}
          <div>
            <h2 style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '0.3rem' }}>
              Recommended Career
            </h2>
            <h1 style={{ fontSize: '2.4rem', margin: '0.3rem 0 1rem' }} className="gradient-text">
              {career}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Based on your profile, you are best suited for <b>{career}</b> because your
              skill in <b>{input.skills}</b> and interest in <b>{input.interests}</b> strongly
              match this field. Your CGPA of <b>{input.cgpa}</b> and{' '}
              {input.experience === 'Yes' ? 'work experience' : 'academic background'}
              {' '}further support this recommendation.
            </p>

            {/* stat cards */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '12px', flex: 1, minWidth: '90px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Confidence</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#6366f1' }}>{confidencePct}%</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  How sure the model is about this career out of all possibilities
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '12px', flex: 1, minWidth: '90px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fit Score</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#ec4899' }}>{fitScore}/100</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Profile strength based on CGPA, experience, skills & activities
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '12px', flex: 1, minWidth: '90px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Model Used</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: MODEL_COLORS[modelUsed] || '#6366f1' }}>
                  {modelUsed}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Highest accuracy model — Acc: {Math.round(metrics.accuracy * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — radar */}
          <div style={{ height: '300px' }}>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Profile Analysis Radar
            </p>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Your Profile" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.55} />
                <Tooltip formatter={val => [`${val}`, 'Score']} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* metric pills — Random Forest stats */}
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
          marginTop: '1.5rem', padding: '1rem',
          background: '#f8fafc', borderRadius: '12px'
        }}>
          {[
            { label: 'Accuracy',  val: metrics.accuracy,  desc: 'Overall correct predictions' },
            { label: 'Precision', val: metrics.precision, desc: 'Correct out of predicted' },
            { label: 'Recall',    val: metrics.recall,    desc: 'Correct out of actual' },
            { label: 'F1 Score',  val: metrics.f1,        desc: 'Balance of precision & recall' },
          ].map(({ label, val, desc }) => (
            <div key={label} style={{ flex: 1, minWidth: '100px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                {val ? `${Math.round(val * 10000) / 100}%` : 'N/A'}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* buttons */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={getPdfUrl(id)} target="_blank" rel="noreferrer" className="btn btn-primary">
            📄 Download PDF Report
          </a>

          {/* Sir wala button — comparison toggle */}
          {canShowComparison && (
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              📊 {showComparison ? 'Hide Model Comparison' : 'View All Model Comparisons'}
            </button>
          )}

          <Link to="/history" className="btn btn-secondary">🕐 View All History</Link>
        </div>
      </motion.div>

      {/* ── ALL MODELS — shown on button click ──────────── */}
      <AnimatePresence>
        {showComparison && canShowComparison && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="glass-card"
            style={{ marginBottom: '2rem' }}
          >
            <h3 style={{ textAlign: 'center', marginBottom: '0.3rem' }}>
              📊 All Models — Individual Performance
            </h3>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Each model predicts independently — their accuracy & confidence for your profile
            </p>

            {/* best model banner */}
            <div style={{
              textAlign: 'center', marginBottom: '1.5rem',
              padding: '10px', background: 'rgba(99,102,241,0.08)',
              borderRadius: '10px', fontSize: '0.88rem'
            }}>
              ✅ <b style={{ color: '#6366f1' }}>{modelUsed}</b> selected as primary —
              highest accuracy ({Math.round(metrics.accuracy * 100)}%) among all models
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(allPredictions).map(([name, pred]) => (
                <ModelCard
                  key={name}
                  modelName={name}
                  prediction={pred}
                  metricsData={comparison[name]}
                  isSelected={name === modelUsed}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ResultPage;