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
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '64px',
        background: '#13112b',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #312e81',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Brand */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          🧠
        </div>

        <span
          style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#ffffff',
          }}
        >
          Career<span style={{ color: '#6366f1' }}>AI</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: location.pathname === link.to ? '600' : '400',
              color:
                location.pathname === link.to
                  ? '#818cf8'
                  : '#cbd5e1',
              background:
                location.pathname === link.to
                  ? 'rgba(99,102,241,0.25)'
                  : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
            }}
          >
            {link.icon} {link.label}
          </Link>
        ))}

        {/* Get Started Button */}
        <Link
          to="/assessment"
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            color: '#fff',
            fontWeight: '600',
            fontSize: '0.9rem',
            textDecoration: 'none',
            marginLeft: '0.5rem',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}
        >
          🚀 Get Started
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;