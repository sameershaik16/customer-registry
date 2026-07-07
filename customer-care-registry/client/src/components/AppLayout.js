import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const TITLES = {
  '/': 'Dashboard',
  '/customers': 'Customers',
  '/complaints': 'Complaints',
  '/feedback': 'Feedback',
  '/reports': 'Reports & Analytics',
};

const resolveTitle = (pathname) => {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/customers/')) return 'Customer Profile';
  if (pathname.startsWith('/complaints/')) return 'Complaint Details';
  return 'Customer Care Registry';
};

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} />
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 90 }}
        />
      )}
      <div className="main-content">
        <Topbar title={resolveTitle(location.pathname)} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
