import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHistory } from '../services/api';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '2rem' }}>Prediction <span className="gradient-text">History</span></h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading records...</div>
      ) : history.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No predictions found yet. Start your first assessment!</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '1.2rem 1.5rem' }}>Date & Time</th>
                  <th style={{ padding: '1.2rem 1.5rem' }}>Skills</th>
                  <th style={{ padding: '1.2rem 1.5rem' }}>Interests</th>
                  <th style={{ padding: '1.2rem 1.5rem' }}>CGPA</th>
                  <th style={{ padding: '1.2rem 1.5rem' }}>Predicted Career</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <motion.tr 
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {record.timestamp}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{record.skills}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{record.interests}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{record.cgpa}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.4rem 0.8rem', 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        color: 'var(--primary)',
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
