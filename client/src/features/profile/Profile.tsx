import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  // Mapping permissions checklist based on rank & capabilities
  const permissions = [
    { key: 'browse', name: 'Browse public portal', desc: 'Allows access to search and view public OHPC declarations.', allowed: true },
    { key: 'view', name: 'View secure vaults', desc: 'Allows access to search and view restricted/confidential files in authorized departments.', allowed: user.role !== 'ANONYMOUS' },
    { key: 'upload', name: 'Upload / Checkout documents', desc: 'Allows adding new documents, creating folders, and checking out documents for editing.', allowed: user.role === 'SYSTEM_ADMIN' || user.can_edit === 1 },
    { key: 'edit', name: 'Commit document modifications', desc: 'Allows saving metadata revisions and updates to files checked out by the user.', allowed: user.role === 'SYSTEM_ADMIN' || user.can_edit === 1 },
    { key: 'workflow', name: 'Approve workflow submissions', desc: 'Allows publishing draft or pending files to make them active.', allowed: user.role === 'SYSTEM_ADMIN' || user.can_approve === 1 },
    { key: 'perms', name: 'Manage files access control', desc: 'Allows setting department-specific access limits on files and folders.', allowed: user.role === 'SYSTEM_ADMIN' },
    { key: 'audit', name: 'Read compliance logs', desc: 'Allows full visibility into system audit ledger operations history.', allowed: user.role === 'SYSTEM_ADMIN' },
    { key: 'admin', name: 'Lifecycle & Webhooks configuration', desc: 'Allows purge management, webhook setup, and API keys updates.', allowed: user.role === 'SYSTEM_ADMIN' }
  ];

  return (
    <div className="profile-view" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
      
      {/* Left Column: Profile Card */}
      <div className="section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 1.5rem', height: 'fit-content' }}>
        <div className="avatar-circle" style={{ width: '90px', height: '90px', fontSize: '2.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-blue)', color: '#FFFFFF', borderRadius: '50%', fontWeight: 700 }}>
          {user.avatar}
        </div>
        <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--navy)', fontSize: '1.25rem' }}>{user.name}</h3>
        <p style={{ margin: '0.25rem 0 1.25rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email || 'Anonymous Portal User'}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Active Role:</span>
            <span className={`badge-classification ${user.role === 'SYSTEM_ADMIN' ? 'secret' : user.role === 'ANONYMOUS' ? 'public' : 'restricted'}`} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              {user.role === 'SYSTEM_ADMIN' ? 'SYSTEM ADMIN' : user.role === 'ANONYMOUS' ? 'GUEST' : `OFFICIAL (${user.rank})`}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Department:</span>
            <strong style={{ color: 'var(--navy)' }}>{user.dept}</strong>
          </div>
        </div>
      </div>

      {/* Right Column: Permissions Checklist */}
      <div className="section-card" style={{ height: 'fit-content' }}>
        <h4 className="section-title" style={{ marginBottom: '0.25rem' }}>Active Security Clearance & Permissions</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
          DocShield implements Role-Based Access Control (RBAC). Below is a summary of the capabilities granted to your current security credentials.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {permissions.map(perm => (
            <div key={perm.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '1.25rem', lineHeight: 1, color: perm.allowed ? 'var(--success)' : 'var(--error)', marginTop: '2px' }}>
                {perm.allowed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <strong style={{ fontSize: '0.9rem', color: perm.allowed ? 'var(--navy)' : 'var(--text-muted)' }}>{perm.name}</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{perm.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Profile;
