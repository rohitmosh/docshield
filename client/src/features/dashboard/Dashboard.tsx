import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { File, AuditLog } from '../../types';

export const Dashboard: React.FC = () => {
  const { user, apiRequest } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    encrypted: 0,
    pending: 0,
    secret: 0
  });
  const [classifications, setClassifications] = useState({
    PUBLIC: 0,
    RESTRICTED: 0,
    CONFIDENTIAL: 0,
    SECRET: 0
  });
  const [deptDistribution, setDeptDistribution] = useState<Record<string, number>>({});
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [hasAuditAccess, setHasAuditAccess] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all files for stats calculations
        const fileData = await apiRequest('/documents/vault?all=true');
        const files: File[] = fileData.files || [];

        const total = files.length;
        const encrypted = files.filter(f => f.classification !== 'PUBLIC').length;
        const pending = files.filter(f => f.status === 'pending').length;
        const secret = files.filter(f => f.classification === 'SECRET').length;

        setStats({ total, encrypted, pending, secret });

        // Chart 1: Classification chart counts
        const classes = { PUBLIC: 0, RESTRICTED: 0, CONFIDENTIAL: 0, SECRET: 0 };
        files.forEach(f => {
          if (f.classification in classes) {
            classes[f.classification as keyof typeof classes]++;
          }
        });
        setClassifications(classes);

        // Chart 2: Department distribution
        const depts: Record<string, number> = {};
        files.forEach(f => {
          depts[f.department] = (depts[f.department] || 0) + 1;
        });
        setDeptDistribution(depts);

        // Conditional Audit Log fetching based on role
        const isAdmin = user.role === 'SYSTEM_ADMIN';
        setHasAuditAccess(isAdmin);
        if (isAdmin) {
          const auditData = await apiRequest('/audit/logs');
          setRecentLogs(auditData.slice(0, 5));
        }
      } catch (e) {
        console.error('Error loading dashboard metrics:', e);
      }
    };

    fetchDashboardData();
  }, [apiRequest, user.role]);

  // Compute SVG chart height percentages
  const maxClassVal = Math.max(...Object.values(classifications), 1);
  const maxDeptVal = Math.max(...Object.values(deptDistribution), 1);

  return (
    <div className="dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Metrics Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(8, 59, 138, 0.08)', color: 'var(--navy)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
          </div>
          <div className="stat-info">
            <h3 id="dash-stat-total-files">{stats.total}</h3>
            <p>Total Documents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(22, 163, 74, 0.08)', color: 'var(--success)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
          <div className="stat-info">
            <h3 id="dash-stat-encrypted-files">{stats.encrypted}</h3>
            <p>Encrypted Wrappers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(217, 119, 6, 0.08)', color: 'var(--warning)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
          </div>
          <div className="stat-info">
            <h3 id="dash-stat-pending-reviews">{stats.pending}</h3>
            <p>Pending Reviews</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(220, 38, 38, 0.08)', color: 'var(--error)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <div className="stat-info">
            <h3 id="dash-stat-secret-files">{stats.secret}</h3>
            <p>SECRET Drawings</p>
          </div>
        </div>
      </div>

      {/* SVG Analytics Charts Section */}
      <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Classification Distribution */}
        <div className="section-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>Classification Metrics</h4>
          <div id="dash-classification-chart" className="chart-bar-container" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', flexGrow: 1, height: '180px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {Object.entries(classifications).map(([label, val]) => {
              const heightPercent = Math.max((val / maxClassVal) * 80, 5);
              const color = label === 'PUBLIC' ? 'var(--color-public)' :
                            label === 'RESTRICTED' ? 'var(--color-restricted)' :
                            label === 'CONFIDENTIAL' ? 'var(--color-confidential)' : 'var(--color-secret)';
              return (
                <div key={label} className="bar-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                  <div 
                    className="bar-graphic" 
                    style={{ background: color, height: `${heightPercent}%`, width: '32px', borderRadius: '6px 6px 0 0', position: 'relative', transition: 'height 0.3s ease' }} 
                    data-value={val}
                  />
                  <span className="bar-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="section-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>Department Evacuation Loads</h4>
          <div id="dash-department-chart" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1, justifyContent: 'center' }}>
            {Object.entries(deptDistribution).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No department files loaded.</p>
            ) : (
              Object.entries(deptDistribution).map(([dept, val]) => {
                const widthPercent = (val / maxDeptVal) * 100;
                return (
                  <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, width: '90px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'right' }}>{dept}</span>
                    <div style={{ flexGrow: 1, height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${widthPercent}%`, background: 'var(--primary-blue)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                    </div>
                    <span style={{ fontWeight: 700, width: '20px' }}>{val}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Conditional Recent Audits Table */}
      {hasAuditAccess && (
        <div className="section-card">
          <h4 style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', fontSize: '1.05rem' }}>Recent Operations Audit</h4>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action Activity</th>
                  <th>Resource Context</th>
                  <th>Operator</th>
                  <th>Status</th>
                  <th>Date Recorded</th>
                </tr>
              </thead>
              <tbody id="dash-recent-ops-table">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent audit events logged.</td>
                  </tr>
                ) : (
                  recentLogs.map(log => (
                    <tr key={log.id}>
                      <td><strong>{log.action}</strong></td>
                      <td><span style={{ color: 'var(--primary-blue)', fontWeight: 500 }}>{log.resource}</span></td>
                      <td>{log.user}</td>
                      <td>
                        <span className={`badge-status ${log.status.toLowerCase().includes('success') ? 'published' : 'draft'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
export default Dashboard;
