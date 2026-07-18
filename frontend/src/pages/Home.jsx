import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getStats } from '../services/api';

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

const Home = () => {
  const [stats, setStats] = useState(null);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStats();
        setStats(response);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  // Dark mode body
  useEffect(() => {
    document.body.style.background = dark ? '#0f0e1a' : '';
    document.body.style.color = dark ? '#e0e7ff' : '';
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
  }, [dark]);

  // Root cause of "567.99%": the real backend's /stats route already
  // computes avg_confidence as a PERCENTAGE — `round((avg_row or 0) * 100, 1)`
  // in app.py — e.g. 5.68 means "5.68%". The previous Home.jsx multiplied
  // that value by 100 AGAIN (treating it as a 0-1 fraction), turning 5.68
  // into 568.0. Fix: use the value as-is, just guard against it being
  // missing/NaN so we never render NaN% or an inflated number.
  const rawAccuracy = stats?.avg_accuracy ?? stats?.avg_confidence;
  const accuracyPct = typeof rawAccuracy === 'number' && Number.isFinite(rawAccuracy)
    ? rawAccuracy.toFixed(1)
    : '0.0';

  const textPri = dark ? '#e0e7ff' : '#1e293b';
  const cardStyle = {
    textAlign: 'center', padding: '1.5rem',
    background: dark ? '#13112b' : undefined,
    border: dark ? '1px solid #312e81' : undefined,
    color: dark ? '#e0e7ff' : undefined,
  };

  return (
    <div className="fade-in">
      <DarkModeToggle dark={dark} toggle={() => setDark(!dark)} />

      <section style={{ textAlign: 'center', padding: '4rem 0' }}>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: '1.1', color: textPri }}
        >
          AI-Driven <span className="gradient-text">Career Intelligence</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '1.25rem', color: dark ? '#a5b4fc' : 'var(--text-muted)', maxWidth: '800px', margin: '0 auto 3rem' }}
        >
          Navigate the future of work with our advanced career recommendation engine. 
          Powered by industry-standard machine learning algorithms and real-world datasets.
        </motion.p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <Link to="/assessment" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
            Get Career Analysis
          </Link>
          <Link to="/history" className="btn btn-secondary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
            View History
          </Link>
        </div>
      </section>

      {/* Professional Stats Dashboard */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <motion.div whileHover={{ y: -5 }} className="glass-card" style={cardStyle}>
            <div style={{ fontSize: '0.9rem', color: dark ? '#a5b4fc' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Predictions Made</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{stats?.total_predictions || '0'}</div>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="glass-card" style={cardStyle}>
            <div style={{ fontSize: '0.9rem', color: dark ? '#a5b4fc' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>System Accuracy</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)' }}>{accuracyPct}%</div>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="glass-card" style={cardStyle}>
            <div style={{ fontSize: '0.9rem', color: dark ? '#a5b4fc' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Trending Career</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.8rem 0', color: textPri }}>{stats?.most_recommended || 'Data Science'}</div>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="glass-card" style={cardStyle}>
            <div style={{ fontSize: '0.9rem', color: dark ? '#a5b4fc' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>ML Models Active</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: textPri }}>{stats?.models_active || '4'}</div>
          </motion.div>
        </div>
      </section>

      {/* Career Explorer Section */}
      <section style={{ padding: '2rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: textPri }}>Why Choose <span className="gradient-text">Our System?</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ background: dark ? '#13112b' : undefined, border: dark ? '1px solid #312e81' : undefined }}>
            <h3 style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '1rem', color: textPri }}>Data-Driven Insights</h3>
            <p style={{ marginTop: '1rem', color: dark ? '#a5b4fc' : 'var(--text-muted)' }}>We analyze thousands of data points from successful professionals to identify patterns that lead to career success.</p>
          </div>
          <div className="glass-card" style={{ background: dark ? '#13112b' : undefined, border: dark ? '1px solid #312e81' : undefined }}>
            <h3 style={{ borderLeft: '4px solid var(--secondary)', paddingLeft: '1rem', color: textPri }}>Multi-Model Validation</h3>
            <p style={{ marginTop: '1rem', color: dark ? '#a5b4fc' : 'var(--text-muted)' }}>Every profile is cross-verified across 4 different ML classifiers to ensure the most robust recommendation possible.</p>
          </div>
          <div className="glass-card" style={{ background: dark ? '#13112b' : undefined, border: dark ? '1px solid #312e81' : undefined }}>
            <h3 style={{ borderLeft: '4px solid var(--dark)', paddingLeft: '1rem', color: textPri }}>Enterprise Reports</h3>
            <p style={{ marginTop: '1rem', color: dark ? '#a5b4fc' : 'var(--text-muted)' }}>Download detailed PDF analytics including classifier benchmarks and skill gap analysis for your records.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;