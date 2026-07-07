import React from 'react';
import { FiMenu, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/formatters';

const Topbar = ({ title, onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="menu-toggle" onClick={onToggleSidebar} aria-label="Toggle menu">
          <FiMenu />
        </button>
        <div className="topbar-title">{title}</div>
      </div>
      <div className="topbar-actions">
        <div className="user-chip">
          <div className="user-avatar">{initials(user?.name)}</div>
          <div className="user-meta">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
        </div>
        <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out">
          <FiLogOut />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
