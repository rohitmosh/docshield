import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { File } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const Administration: React.FC = () => {
  const { user, apiRequest } = useAuth();
  const { showToast } = useNotification();

  const [categoryCounts, setCategoryCounts] = useState({
    Technical: 0,
    Administrative: 0,
    Financial: 0,
    Regulatory: 0,
    Legal: 0
  });

  const [profiles, setProfiles] = useState<any[]>([]);
  const [pendingDocs, setPendingDocs] = useState<File[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [loading, setLoading] = useState(true);

  const isSystemAdmin = user.role === 'SYSTEM_ADMIN';
  const isApprover = user.role === 'SYSTEM_ADMIN' || user.can_approve === 1;

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Load workflows for anyone with approval rights
      if (isApprover) {
        const vaultData = await apiRequest('/documents/vault?all=true');
        const allFiles: File[] = vaultData.files || [];
        setPendingDocs(allFiles.filter(f => f.status === 'pending'));

        // Load stats for dashboard if System Admin
        if (isSystemAdmin) {
          const counts = { Technical: 0, Administrative: 0, Financial: 0, Regulatory: 0, Legal: 0 };
          allFiles.forEach(f => {
            if (f.category in counts) {
              counts[f.category as keyof typeof counts]++;
            }
          });
          setCategoryCounts(counts);
        }
      }

      // 2. Load admin-only profiles
      if (isSystemAdmin) {
        const profilesData = await apiRequest('/auth/profiles');
        setProfiles(profilesData.filter((u: any) => u.role === 'OFFICIAL'));

        // Load tags and departments
        const tagsData = await apiRequest('/admin/tags');
        setTags(tagsData || []);
        const deptsData = await apiRequest('/admin/departments');
        setDepartments(deptsData || []);
      }

    } catch (e: any) {
      console.error('Error loading admin configurations:', e);
      showToast('Error loading admin configurations.', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiRequest, showToast, isSystemAdmin, isApprover]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);


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
      loadAdminData();
    } catch (e: any) {
      showToast(e.message || 'Operation failed', 'error');
    }
  };

  const handleSaveUser = async (id: string, dept: string, rank: string, canEdit: boolean, canApprove: boolean) => {
    try {
      await apiRequest(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          dept,
          rank,
          can_edit: canEdit ? 1 : 0,
          can_approve: canApprove ? 1 : 0
        })
      });
      showToast('Official access privileges updated successfully.', 'success');
      loadAdminData();
    } catch (e: any) {
      showToast(e.message || 'Failed to update privileges.', 'error');
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await apiRequest('/admin/tags', {
        method: 'POST',
        body: JSON.stringify({ name: newTagName.trim() })
      });
      showToast(`Tag "${newTagName}" added successfully.`, 'success');
      setNewTagName('');
      const tagsData = await apiRequest('/admin/tags');
      setTags(tagsData || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to add tag.', 'error');
    }
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    try {
      await apiRequest('/admin/departments', {
        method: 'POST',
        body: JSON.stringify({ name: newDeptName.trim() })
      });
      showToast(`Department "${newDeptName}" added successfully.`, 'success');
      setNewDeptName('');
      const deptsData = await apiRequest('/admin/departments');
      setDepartments(deptsData || []);
    } catch (e: any) {
      showToast(e.message || 'Failed to add department.', 'error');
    }
  };

  const getFileIcon = (type: string) => {
    let color = '#3B82F6';
    if (type === 'PDF') color = '#EF4444';
    if (type === 'DOCX') color = '#2563EB';
    if (type === 'XLSX') color = '#10B981';

    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', flexShrink: 0 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  };

  return (
    <div className="admin-view" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Compliance & Approval Review Queue (Visible to all approvers/admins) */}
      {isApprover && (
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. System Administrator Operations (Visible to SYSTEM_ADMIN only) */}
      {isSystemAdmin && (
        <>
          {/* Category retention counters */}
          <div className="section-card">
            <h4 className="section-title" style={{ marginBottom: '1.25rem' }}>Active Document Retention Policies</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {Object.entries(categoryCounts).map(([cat, val]) => (
                <div key={cat} style={{ background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{cat}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>{val}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Active Logs</div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Access Controls matrix */}
          <div className="section-card">
            <h4 className="section-title" style={{ marginBottom: '0.25rem' }}>Official Account Permissions Matrix</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Configure rank, department clearances, edit permissions, and approval rights for officials. Changes take effect on next login.
            </p>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Official Name</th>
                    <th>Department</th>
                    <th>Designation / Rank</th>
                    <th style={{ textAlign: 'center', width: '150px' }}>Can Edit</th>
                    <th style={{ textAlign: 'center', width: '150px' }}>Can Approve</th>
                    <th style={{ textAlign: 'center', width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(prof => (
                    <tr key={prof.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: 'var(--primary-blue)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 700 }}>
                            {prof.avatar}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{prof.name}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className="filter-select"
                          style={{ padding: '0.35rem 0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
                          value={prof.dept}
                          onChange={e => {
                            const val = e.target.value;
                            setProfiles(prev => prev.map(p => p.id === prof.id ? { ...p, dept: val } : p));
                          }}
                        >
                          {departments.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="search-input"
                          style={{ padding: '0.35rem 0.5rem', borderRadius: '8px', fontSize: '0.85rem', width: '160px' }}
                          value={prof.rank || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setProfiles(prev => prev.map(p => p.id === prof.id ? { ...p, rank: val } : p));
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          checked={!!prof.can_edit}
                          onChange={e => {
                            const val = e.target.checked ? 1 : 0;
                            setProfiles(prev => prev.map(p => p.id === prof.id ? { ...p, can_edit: val } : p));
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          checked={!!prof.can_approve}
                          onChange={e => {
                            const val = e.target.checked ? 1 : 0;
                            setProfiles(prev => prev.map(p => p.id === prof.id ? { ...p, can_approve: val } : p));
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-primary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                          onClick={() => handleSaveUser(prof.id, prof.dept, prof.rank, !!prof.can_edit, !!prof.can_approve)}
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side-by-side panels for Tags & Departments */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Manage Tags */}
            <div className="section-card">
              <h4 className="section-title" style={{ marginBottom: '0.25rem' }}>Manage Classification Tags</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Add new custom metadata tags for classification.
              </p>
              <form onSubmit={handleAddTag} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  className="search-input"
                  style={{ padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', flexGrow: 1 }}
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="New tag name (e.g. balimela-2026)..."
                  required
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Add Tag
                </button>
              </form>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                {tags.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tags found.</span>
                ) : (
                  tags.map(t => (
                    <span key={t.id} style={{ display: 'inline-block', background: 'var(--bg-slate)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.8rem', fontWeight: 500 }}>
                      #{t.name}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Manage Departments */}
            <div className="section-card">
              <h4 className="section-title" style={{ marginBottom: '0.25rem' }}>Manage Corporate Departments</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Add new corporate departments to assign document owners/clearances.
              </p>
              <form onSubmit={handleAddDept} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  className="search-input"
                  style={{ padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', flexGrow: 1 }}
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  placeholder="New department name (e.g. Safety)..."
                  required
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Add Dept
                </button>
              </form>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                {departments.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No departments found.</span>
                ) : (
                  departments.map(d => (
                    <span key={d.id} style={{ display: 'inline-block', background: 'var(--bg-slate)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--navy)' }}>
                      {d.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default Administration;
