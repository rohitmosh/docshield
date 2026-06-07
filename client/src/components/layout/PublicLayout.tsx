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
        <div className="header-container">
          <a href="#home" className="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>DocShield</span>
          </a>
          <nav className="public-menu">
            <a href="#home" className={`menu-link ${currentRoute === 'home' ? 'active' : ''}`}>Home</a>
            <a href="#public-documents" className={`menu-link ${currentRoute === 'public-documents' ? 'active' : ''}`}>Public Documents</a>
            <a href="#departments" className={`menu-link ${currentRoute === 'departments' ? 'active' : ''}`}>Departments</a>
            <a href="#about" className={`menu-link ${currentRoute === 'about' ? 'active' : ''}`}>About</a>
            <a href="#contact" className={`menu-link ${currentRoute === 'contact' ? 'active' : ''}`}>Contact</a>
            
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
        <div className="footer-container">
          <div className="footer-info">
            <div className="footer-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>DocShield DMS</span>
            </div>
            <p>Odisha Hydro Power Corporation regulatory portal. Secure archiving and verification services compliance platform.</p>
          </div>
          <div className="footer-links">
            <h4>Resource Directory</h4>
            <a href="#public-documents">Public Tender Records</a>
            <a href="#departments">Hydro Stations Maps</a>
            <a href="#about">Regulatory Disclosures</a>
          </div>
          <div className="footer-contact">
            <h4>Regulatory Compliance Hub</h4>
            <p>Office of the IT Director, OHPC Corporate Office, Bhubaneswar, Odisha.</p>
            <p>Email: security-dms@ohpc.gov.in</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
          &copy; 2026 Odisha Hydro Power Corporation Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
export default PublicLayout;
