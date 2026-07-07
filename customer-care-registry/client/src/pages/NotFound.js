import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="auth-page">
    <div className="auth-card" style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.4rem', margin: 0 }}>404</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-flex' }}>
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
