import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { File } from '../../types';

export const Home: React.FC = () => {
  const { apiRequest } = useAuth();
  const [recentDocs, setRecentDocs] = useState<File[]>([]);
  const [publicCount, setPublicCount] = useState(0);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await apiRequest('/documents/vault?folderId=root');
        if (data && data.files) {
          const publicFiles = data.files.filter((f: File) => f.classification === 'PUBLIC' && f.status === 'published');
          setPublicCount(publicFiles.length);
          setRecentDocs(publicFiles.sort((a: File, b: File) => b.modified_time - a.modified_time).slice(0, 4));
        }
      } catch (e) {
        console.error('Error fetching home data:', e);
      }
    };

    fetchHomeData();
  }, [apiRequest]);


  const getFileIcon = (type: string) => {
    let color = '#3B82F6';
    if (type === 'PDF') color = '#EF4444';
    if (type === 'XLSX') color = '#10B981';
    if (type === 'IMAGE') color = '#8B5CF6';

    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  };

  const handleDownload = async (doc: File) => {
    try {
      const response = await apiRequest(`/documents/${doc.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="home-view">
      <div className="hero-section">
        <div className="hero-container">
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img src="/docshield_full.png" alt="DocShield logo" style={{ height: '70px', objectFit: 'contain' }} />
          </div>
          <div className="badge-tagline">Secure Corporate Repository</div>
          <h1 className="hero-title">Odisha Hydro Power Corporation <span>DocShield</span></h1>
          <p className="hero-subtitle">Access public utilities, project declarations, notifications, and secure corporate records through our unified regulatory compliance platform.</p>
          <div className="hero-actions">
            <a href="#public-documents" className="btn-primary" style={{ textDecoration: 'none' }}>Browse Public Records</a>
            <a href="#login" className="btn-secondary" style={{ textDecoration: 'none' }}>Internal Log In</a>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <div className="stat-info">
              <h3>{publicCount || 4}</h3>
              <p>Public Documents</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div className="stat-info">
              <h3>6</h3>
              <p>Key Departments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div className="stat-info">
              <h3>12 Yrs</h3>
              <p>Archived History</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Info Columns */}
      <div className="home-content-columns" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', padding: '0 2rem 4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Recent Public Document Release */}
        <div className="section-card">
          <div className="section-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1.25rem' }}>Recent Public Releases</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latest regulatory and corporate records published online.</p>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Department</th>
                  <th>Published Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No public documents currently published.</td>
                  </tr>
                ) : (
                  recentDocs.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div className="doc-name-cell" style={{ display: 'flex', alignItems: 'center' }}>
                          {getFileIcon(doc.type)}
                          <span>{doc.name}</span>
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--navy)' }}>{doc.department}</span></td>
                      <td>{new Date(doc.modified_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a href={`#document-viewer?id=${doc.id}`} className="btn-text-action" style={{ textDecoration: 'none' }}>View</a>
                          <button onClick={() => handleDownload(doc)} className="btn-text-action" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Download</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
