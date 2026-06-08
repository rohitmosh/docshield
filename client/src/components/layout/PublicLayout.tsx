import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface PublicLayoutProps {
  currentRoute: string;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ currentRoute, children }) => {
  const { user } = useAuth();
  const isLoggedIn = user && user.role !== 'ANONYMOUS';

  return (
    <div id="public-layout">
      <header className="public-header">
        <div className="nav-container">
          <div className="logo-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a href="#home" className="logo-ohpc" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/ohpc_logo.jpg" alt="OHPC Logo" style={{ height: '42px', objectFit: 'contain' }} />
            </a>
            <div className="logo-separator" style={{ height: '28px', width: '1px', background: 'var(--border-color)' }}></div>
            <a href="#home" className="logo-brand" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/docshield_full.png" alt="DocShield Logo" style={{ height: '32px', objectFit: 'contain' }} />
            </a>
          </div>
          <nav className="public-menu">
            <a href="#home" className={`menu-link ${currentRoute === 'home' ? 'active' : ''}`}>Home</a>
            <a href="#public-documents" className={`menu-link ${currentRoute === 'public-documents' ? 'active' : ''}`}>Public Documents</a>
            <a href="#about" className={`menu-link ${currentRoute === 'about' ? 'active' : ''}`}>About</a>
            
            {isLoggedIn ? (
              <a href="#dashboard" className="btn-primary btn-login-nav" style={{ textDecoration: 'none' }}>Go To Workspace</a>
            ) : (
              <a href="#login" className="btn-primary btn-login-nav" style={{ textDecoration: 'none' }}>Sign In</a>
            )}
          </nav>
        </div>
      </header>

      <main style={{ minHeight: 'calc(100vh - 350px)' }}>
        {children}
      </main>

      <footer className="public-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h4>DocShield</h4>
            <p>Odisha Hydro Power Corporation Limited is dedicated to grid-stabilization and clean hydropower development across Odisha.</p>
          </div>
          <div className="footer-links">
            <h5>Resource Directory</h5>
            <ul>
              <li><a href="#public-documents">Public Documents</a></li>
              <li><a href="#about">About System</a></li>
              <li><a href="#about">Regulatory Disclosures</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h5>Compliance</h5>
            <ul>
              <li><a href="#login">Internal Sign In</a></li>
              <li><a href="#about">Vulnerability Disclosure</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h5>Contact Details</h5>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              IT Department, OHPC Corporate Office,<br />
              Bhubaneswar, Odisha - 751001<br />
              Email: security-dms@ohpc.gov.in
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Odisha Hydro Power Corporation Ltd. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#home">Privacy Policy</a>
            <a href="#home">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default PublicLayout;
