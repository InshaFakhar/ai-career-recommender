import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHistory } from '../services/api';

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

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  // By default dark mode select karne ke liye true kiya hai
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory();
        setHistory(response);
      } catch (error) {
        console.error("Error fetching history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Dark mode body
  useEffect(() => {
    document.body.style.background = dark ? '#0f0e1a' : '';
    document.body.style.color = dark ? '#e0e7ff' : '';
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
  }, [dark]);

  const textPri  = dark ? '#e0e7ff' : '#1e293b';
  const textSec  = dark ? '#a5b4fc' : 'var(--text-muted)';
  const cardBg   = dark ? '#13112b' : undefined;
  const cardBorder = dark ? '1px solid #312e81' : undefined;
  const theadBg  = dark ? '#1e1b4b' : '#f8fafc';
  const rowBorder = dark ? '1px solid #312e81' : '1px solid #f1f5f9';

  return (
    <div className="fade-in">
      <DarkModeToggle dark={dark} toggle={() => setDark(!dark)} />

      <h2 style={{ marginBottom: '2rem', color: textPri }}>Prediction <span className="gradient-text">History</span></h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: textPri }}>Loading records...</div>
      ) : history.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', background: cardBg, border: cardBorder }}>
          <p style={{ color: textPri, margin: 0 }}>No predictions found yet. Start your first assessment!</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', background: cardBg, border: cardBorder }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: theadBg }}>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '1.2rem 1.5rem', color: textPri }}>Date & Time</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: textPri }}>Skills</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: textPri }}>Interests</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: textPri }}>CGPA</th>
                  <th style={{ padding: '1.2rem 1.5rem', color: textPri }}>Predicted Career</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: rowBorder }}
                  >
                    <td style={{ padding: '1rem 1.5rem', color: textSec, fontSize: '0.9rem' }}>
                      {record.timestamp}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500', color: textPri }}>{record.skills}</td>
                    <td style={{ padding: '1rem 1.5rem', color: textPri }}>{record.interests}</td>
                    <td style={{ padding: '1rem 1.5rem', color: textPri }}>{record.cgpa}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        padding: '0.4rem 0.8rem',
                        background: dark ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99, 102, 241, 0.1)',
                        color: dark ? '#a5b4fc' : 'var(--primary)',
                        borderRadius: '8px',
                        fontWeight: '600'
                      }}>
                        {record.career}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;