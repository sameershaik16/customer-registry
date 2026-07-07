import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiAlertCircle,
  FiClock,
  FiStar,
  FiBarChart2,
  FiHeart,
} from 'react-icons/fi';

const links = [
  { to: '/', label: 'Dashboard', icon: <FiGrid />, end: true },
  { to: '/customers', label: 'Customers', icon: <FiUsers /> },
  { to: '/complaints', label: 'Complaints', icon: <FiAlertCircle /> },
  { to: '/feedback', label: 'Feedback', icon: <FiStar /> },
  { to: '/reports', label: 'Reports', icon: <FiBarChart2 /> },
];

const Sidebar = ({ open }) => (
  <aside className={`sidebar ${open ? 'open' : ''}`}>
    <div className="sidebar-brand">
      <FiHeart /> Customer Care Registry
    </div>
    <nav>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {link.icon} {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
    <div className="sidebar-footer">
      <FiClock /> Nonprofit Support Platform
    </div>
  </aside>
);

export default Sidebar;
