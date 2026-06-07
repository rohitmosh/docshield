import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { File } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const Workflows: React.FC = () => {
  const { user, apiRequest } = useAuth();
  const { showToast } = useNotification();
  
  const [pendingDocs, setPendingDocs] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPendingDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/documents/vault?all=true');
      const allFiles: File[] = data.files || [];
      const pending = allFiles.filter(f => f.status === 'pending');
      setPendingDocs(pending);
    } catch (e) {
      console.error('Error loading pending workflows:', e);
      showToast('Failed to load pending workflows.', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiRequest, showToast]);

  useEffect(() => {
    loadPendingDocs();
  }, [loadPendingDocs]);

  const handleApprove = async (docId: string, approve: boolean, name: string) => {
    try {
      await apiRequest(`/documents/${docId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approve })
      });
      
      const message = approve 
        ? `Published: ${name} is now active.` 
        : `Rejected: ${name} returned to Editor draft queue.`;
      
      showToast(message, approve ? 'success' : 'warning');
      loadPendingDocs();
    } catch (e: any) {
      showToast(e.message || 'Operation failed', 'error');
    }
  };

  const isApprover = ['APPROVER', 'DEPT_ADMIN', 'SYSTEM_ADMIN'].includes(user.role);

  const getFileIcon = (type: string) => {
    let color = '#3B82F6';
    if (type === 'PDF') color = '#EF4444';
    if (type === 'DOCX') color = '#2563EB';
    if (type === 'XLSX') color = '#10B981';

    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', flexShrink: 0 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  };

  return (
    <div className="workflows-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="section-card">
        <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '0.25rem', fontSize: '1.25rem' }}>Compliance & Approval Review Queue</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Inspect documents submitted for publication. Approvers can verify digital envelopes and publish drafts to the active repository.
        </p>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading pending reviews...</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Department</th>
                  <th>Author</th>
                  <th>Classification</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <p style={{ fontWeight: 600 }}>Review queue is currently empty</p>
                      <p style={{ fontSize: '0.85rem' }}>All uploaded documents have been reviewed and processed.</p>
                    </td>
                  </tr>
                ) : (
                  pendingDocs.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div className="doc-name-cell" style={{ display: 'flex', alignItems: 'center' }}>
                          {getFileIcon(doc.type)}
                          <a href={`#document-viewer?id=${doc.id}`} style={{ fontWeight: 600, color: 'var(--navy)', textDecoration: 'none' }}>{doc.name}</a>
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.department}</span></td>
                      <td>{doc.author}</td>
                      <td><span className={`badge-classification ${doc.classification.toLowerCase()}`}>{doc.classification}</span></td>
                      <td>{new Date(doc.created_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td><span className="badge-status pending">{doc.status}</span></td>
                      <td>
                        {isApprover ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="btn-primary" 
                              onClick={() => handleApprove(doc.id, true, doc.name)} 
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: 'var(--success)' }}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn-secondary" 
                              onClick={() => handleApprove(doc.id, false, doc.name)} 
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', color: 'var(--error)', borderColor: 'var(--error)', boxShadow: 'none' }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Review Access Restrict</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workflows;
