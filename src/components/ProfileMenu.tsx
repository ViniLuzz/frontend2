import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

const ProfileMenu: React.FC<{ user?: { email?: string } }> = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('pago');
    navigate('/');
  };

  const handleGoToAnalises = () => {
    navigate('/analises');
    setOpen(false);
  };

  return (
    <div ref={menuRef} style={{ position: 'fixed', top: 24, right: 32, zIndex: 10000 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          outline: 'none',
          padding: 0,
        }}
      >
        {/* Avatar ou ícone de perfil */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: '#f87171',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'relative',
        }}>
          <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
          </svg>
          {/* Online dot */}
          <span style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            width: 12,
            height: 12,
            background: '#22c55e',
            borderRadius: '50%',
            border: '2px solid #fff',
          }} />
        </div>
      </button>
      {open && (
        <div style={{
          marginTop: 12,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 24px 0 rgba(80, 80, 180, 0.10)',
          minWidth: 180,
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}>
          <button
            onClick={handleGoToAnalises}
            style={{
              background: 'none',
              border: 'none',
              color: '#3730a3',
              fontWeight: 500,
              fontSize: 16,
              padding: '12px 16px',
              textAlign: 'left',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="20" height="20" fill="#6366f1" viewBox="0 0 24 24"><path d="M4 4h16v2H4zm0 4h16v2H4zm0 4h10v2H4zm0 4h10v2H4z"/></svg>
            Análises de contratos
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              fontWeight: 500,
              fontSize: 16,
              padding: '12px 16px',
              textAlign: 'left',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 4,
            }}
          >
            {/* Ícone de portinha */}
            <svg width="20" height="20" fill="#ef4444" viewBox="0 0 24 24"><path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8c-1.1 0-2 .9-2 2v3h2V5h8v14h-8v-3h-2v3c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
            Sair
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu; 