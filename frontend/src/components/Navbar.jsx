import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/assessment', label: 'Assessment', icon: '📋' },
    { to: '/history', label: 'History', icon: '🕐' },
  ];

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      height: '64px',
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'linear-gradient(135deg, #6366f1, #ec4899)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px'
        }}>🧠</div>
        <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1a1a2e' }}>
          Career<span style={{ color: '#6366f1' }}>AI</span>
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: location.pathname === link.to ? '600' : '400',
              color: location.pathname === link.to ? '#6366f1' : '#64748b',
              background: location.pathname === link.to ? 'rgba(99,102,241,0.1)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            {link.icon} {link.label}
          </Link>
        ))}

        <Link to="/assessment" style={{
          padding: '8px 20px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366f1, #ec4899)',
          color: 'white',
          fontWeight: '600',
          fontSize: '0.9rem',
          textDecoration: 'none',
          marginLeft: '0.5rem'
        }}>
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;