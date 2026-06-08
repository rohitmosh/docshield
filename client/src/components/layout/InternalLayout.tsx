import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface InternalLayoutProps {
  currentRoute: string;
  children: React.ReactNode;
}

export const InternalLayout: React.FC<InternalLayoutProps> = ({ currentRoute, children }) => {
  const { user, login, logout } = useAuth();

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    await login(role, null);
    window.location.reload(); // Force state refresh
  };

  const getPageTitle = (route: string) => {
    const titles: Record<string, string> = {
      dashboard: 'System Operations Dashboard',
      repository: 'Secure Document Vault Explorer',
      security: 'Cryptographic Scrambling Pipeline',
      audit: 'Immutable Ledger Compliance Log',
      administration: 'Governance & Approval Queue',
      profile: 'Internal Security Profile'
    };
    return titles[route] || 'Secure Portal';
  };

  // Visibility flags based on permissions
  const canSeeAdmin = user.role === 'SYSTEM_ADMIN' || user.can_approve === 1;
  const canSeeAudits = user.role === 'SYSTEM_ADMIN';

  return (
    <div id="internal-layout" className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <a href="#dashboard" className="sidebar-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1.25rem 1rem' }}>
            <img src="/docshield_shield.png" alt="DocShield Logo" style={{ height: '24px', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>DocShield</span>
          </a>
          <nav className="sidebar-menu">
            <a href="#dashboard" className={`sidebar-link ${currentRoute === 'dashboard' ? 'active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
              <span>Dashboard</span>
            </a>
            <a href="#repository" className={`sidebar-link ${currentRoute === 'repository' ? 'active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
              <span>Repository</span>
            </a>
            
            <a href="#security" className={`sidebar-link ${currentRoute === 'security' ? 'active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <span>Security Vault</span>
            </a>

            {canSeeAudits && (
              <a href="#audit" className={`sidebar-link ${currentRoute === 'audit' ? 'active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <span>Audit Log</span>
              </a>
            )}

            {canSeeAdmin && (
              <a href="#administration" className={`sidebar-link ${currentRoute === 'administration' ? 'active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                <span>Administration</span>
              </a>
            )}

            <a href="#profile" className={`sidebar-link ${currentRoute === 'profile' ? 'active' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <span>Profile Settings</span>
            </a>
          </nav>
        </div>
        <div className="sidebar-footer">
          <button onClick={logout} className="btn-logout" id="btn-sidebar-logout" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="app-main">
        <header className="app-header">
          <div className="header-title-bar">
            <h2 id="internal-page-title">{getPageTitle(currentRoute)}</h2>
          </div>
          <div className="header-user-actions">
            {/* Quick Role Select */}
            <div className="quick-role-picker">
              <span>Role Matrix:</span>
              <select 
                id="quick-role-select" 
                value={user.id} 
                onChange={handleRoleChange}
              >
                <option value="anonymous">Public Visitor</option>
                <option value="official-mgr">Official (Sasmita Dash)</option>
                <option value="sys-admin">System Admin</option>
              </select>
            </div>

            <a href="#home" className="btn-public-toggle" style={{ textDecoration: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Public Portal
            </a>

            {/* Profile Avatar Widget */}
            <div className="header-user-profile">
              <div className="user-avatar" id="header-user-avatar">{user.avatar}</div>
              <div className="user-meta-details">
                <span className="user-meta-name" id="header-user-name">{user.name}</span>
                <span className="user-meta-role" id="header-user-role">
                  {user.role === 'SYSTEM_ADMIN' ? 'SYSTEM ADMIN' : user.role === 'ANONYMOUS' ? 'GUEST' : `OFFICIAL (${user.rank})`}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="app-content" style={{ overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
export default InternalLayout;
