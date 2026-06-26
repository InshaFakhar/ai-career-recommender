import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getStats } from '../services/api';

const Home = () => {
  const [stats, setStats] = useState(null);

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

  return (
    <div className="fade-in">
      <section style={{ textAlign: 'center', padding: '4rem 0' }}>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: '1.1' }}
        >
          AI-Driven <span className="gradient-text">Career Intelligence</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto 3rem' }}
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
          <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Predictions Made</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{stats?.total_predictions || '0'}</div>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>System Accuracy</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)' }}>{stats ? (stats.avg_accuracy * 100).toFixed(1) : '90.0'}%</div>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Trending Career</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.8rem 0' }}>{stats?.most_recommended || 'Data Science'}</div>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>ML Models Active</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{stats?.models_active || '4'}</div>
          </motion.div>
        </div>
      </section>

      {/* Career Explorer Section */}
      <section style={{ padding: '2rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Why Choose <span className="gradient-text">Our System?</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-card">
            <h3 style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>Data-Driven Insights</h3>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>We analyze thousands of data points from successful professionals to identify patterns that lead to career success.</p>
          </div>
          <div className="glass-card">
            <h3 style={{ borderLeft: '4px solid var(--secondary)', paddingLeft: '1rem' }}>Multi-Model Validation</h3>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Every profile is cross-verified across 4 different ML classifiers to ensure the most robust recommendation possible.</p>
          </div>
          <div className="glass-card">
            <h3 style={{ borderLeft: '4px solid var(--dark)', paddingLeft: '1rem' }}>Enterprise Reports</h3>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Download detailed PDF analytics including classifier benchmarks and skill gap analysis for your records.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
