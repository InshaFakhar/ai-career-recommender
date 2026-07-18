import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid #312e81',
        background: '#13112b',
        padding: '2.5rem 2rem 1.5rem',
        marginTop: '4rem'
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '2rem'
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '0.8rem'
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              🧠
            </div>

            <span
              style={{
                fontWeight: '700',
                color: '#ffffff'
              }}
            >
              Career<span style={{ color: '#6366f1' }}>AI</span>
            </span>
          </div>

          <p
            style={{
              fontSize: '0.85rem',
              color: '#cbd5e1',
              lineHeight: '1.6',
              maxWidth: '260px'
            }}
          >
            AI-powered career recommendation using 4 ML classifiers trained on
            real student data.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              marginTop: '1rem'
            }}
          >
            {[
              'Random Forest',
              'SVM',
              'Decision Tree',
              'Logistic Regression'
            ].map((m) => (
              <span
                key={m}
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  background: 'rgba(99,102,241,0.18)',
                  color: '#818cf8',
                  borderRadius: '10px',
                  fontWeight: '600'
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px'
            }}
          >
            Navigation
          </p>

          {[['/', 'Home'], ['/assessment', 'Assessment'], ['/history', 'History']].map(
            ([to, label]) => (
              <div key={to} style={{ marginBottom: '8px' }}>
                <Link
                  to={to}
                  style={{
                    fontSize: '0.9rem',
                    color: '#cbd5e1',
                    textDecoration: 'none'
                  }}
                >
                  {label}
                </Link>
              </div>
            )
          )}
        </div>

        {/* Features */}
        <div>
          <p
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px'
            }}
          >
            Features
          </p>

          {[
            'Career Prediction',
            'Model Comparison',
            'PDF Report',
            'Prediction History'
          ].map((f) => (
            <div key={f} style={{ marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.9rem',
                  color: '#cbd5e1'
                }}
              >
                {f}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div
        style={{
          borderTop: '1px solid #312e81',
          marginTop: '2rem',
          paddingTop: '1rem',
          maxWidth: '1100px',
          margin: '2rem auto 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            color: '#94a3b8'
          }}
        >
          © 2025 CareerAI · Final Year ML Project
        </span>

        <span
          style={{
            fontSize: '0.8rem',
            color: '#94a3b8'
          }}
        >
          Flask · React · SQLite · Scikit-learn
        </span>
      </div>
    </footer>
  );
};

export default Footer;