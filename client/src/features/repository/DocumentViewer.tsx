import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { File } from '../../types';

interface DocumentViewerProps {
  docId: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ docId }) => {
  const { user, apiRequest } = useAuth();
  const { showToast } = useNotification();
  
  const [doc, setDoc] = useState<File | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string>('');
  const [verified, setVerified] = useState(false);
  const [checksum, setChecksum] = useState('');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDocument = useCallback(async () => {
    if (!docId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      // Fetch document details from vault list
      const data = await apiRequest('/documents/vault?all=true');
      const allFiles = data.files || [];
      const match = allFiles.find((f: File) => f.id === docId);

      if (!match) {
        setErrorMsg('Document not found in vault.');
        setLoading(false);
        return;
      }

      setDoc(match);

      // Perform Decryption and Envelope Verification if Restricted / Confidential / Secret
      if (match.classification !== 'PUBLIC') {
        try {
          const decryptResult = await apiRequest(`/documents/${docId}/decrypt`, { method: 'POST' });
          setDecryptedContent(decryptResult.content);
          setVerified(decryptResult.verified);
          setChecksum(decryptResult.checksum || '');
          setSignature(decryptResult.signature || '');
        } catch (err: any) {
          setErrorMsg(err.message || 'Access Denied: You do not have permissions to decrypt this secure record.');
        }
      } else {
        setDecryptedContent(match.content);
        setVerified(true);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Error loading document');
    } finally {
      setLoading(false);
    }
  }, [docId, apiRequest]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleDownload = async () => {
    if (!doc) return;
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
      showToast('Document downloaded successfully.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Download failed.', 'error');
    }
  };

  const handlePrint = () => {
    if (!doc) return;
    // Log the print action or print directly
    showToast('Sent document print stream to default printer.', 'success');
    window.print();
  };

  const handleRestoreVersion = async (version: string) => {
    if (!doc) return;
    try {
      await apiRequest(`/documents/${doc.id}/metadata`, {
        method: 'PUT',
        body: JSON.stringify({
          name: doc.name,
          classification: doc.classification,
          category: doc.category,
          tags: doc.tags,
          retention: doc.retention_years,
          changeReason: `Revert metadata active log to version ${version}`
        })
      });
      showToast(`Active version updated to reflect revert state for ${version}`, 'success');
      loadDocument();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontWeight: 600 }}>Loading Secure Document Viewer...</p>
      </div>
    );
  }

  if (errorMsg || !doc) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: '#FFF', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" style={{ marginBottom: '1rem' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3 style={{ color: 'var(--navy)', marginBottom: '0.75rem' }}>Access Denied / Load Failure</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{errorMsg || 'Unable to load file'}</p>
        <button className="btn-secondary" onClick={() => window.location.hash = '#repository'}>Return to Repository</button>
      </div>
    );
  }

  const getFileIcon = (type: string) => {
    let color = '#3B82F6';
    if (type === 'PDF') color = '#EF4444';
    if (type === 'DOCX') color = '#2563EB';
    if (type === 'XLSX') color = '#10B981';

    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  };

  const isEditor = user.role === 'SYSTEM_ADMIN' || user.can_edit === 1;

  return (
    <div className="viewer-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
      
      {/* Left Side: Mock Page Preview */}
      <div className="viewer-main" style={{ display: 'flex', flexDirection: 'column', background: '#FFF', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div className="viewer-bar" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
          <div className="viewer-bar-title" style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: 'var(--navy)' }}>
            {getFileIcon(doc.type)}
            <span>{doc.name}</span>
          </div>
          <div className="viewer-controls" style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="btn-icon" title="Zoom In"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
            <button className="btn-icon" title="Zoom Out"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
          </div>
        </div>

        <div className="viewer-content-pane" style={{ padding: '2rem', background: '#F8FAFC', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
          <div className="viewer-mock-page" style={{ position: 'relative', width: '100%', maxWidth: '650px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '3rem 2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            {/* Header branding */}
            <div className="viewer-mock-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>ODISHA HYDRO POWER CORPORATION LTD.</span>
            </div>

            {/* Watermark */}
            <div 
              className={`viewer-mock-watermark ${doc.classification.toLowerCase()}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-30deg)',
                fontSize: '4.5rem',
                fontWeight: 900,
                pointerEvents: 'none',
                opacity: 0.05,
                whiteSpace: 'nowrap',
                userSelect: 'none'
              }}
            >
              {doc.classification}
            </div>

            {/* Document Content */}
            <div className="viewer-mock-content" style={{ flexGrow: 1 }}>
              {doc.type === 'XLSX' ? (
                <>
                  <h3 style={{ fontFamily: 'var(--font-sans)', color: 'var(--navy)', fontSize: '1.1rem', marginBottom: '1rem' }}>Spreadsheet Data View</h3>
                  <div className="table-wrapper">
                    <p style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', color: '#334155' }}>{decryptedContent}</p>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={{ fontFamily: 'var(--font-sans)', color: 'var(--navy)', fontSize: '1.1rem', marginBottom: '1rem' }}>{doc.name.replace(/\.[^/.]+$/, "")}</h3>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line' }}>{decryptedContent}</p>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="viewer-mock-footer" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>DocShield DMS Secure Output</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Verification Ledger Details */}
        {doc.classification !== 'PUBLIC' && verified && (
          <div style={{ background: 'rgba(22, 163, 74, 0.03)', padding: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>RSASSA-PSS Secure Digital Envelope Verified</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div><strong>SHA-256 Checksum:</strong> <code style={{ color: 'var(--navy)', fontSize: '0.7rem' }}>{checksum}</code></div>
              <div><strong>RSA digital signature:</strong> <code style={{ color: 'var(--navy)', fontSize: '0.7rem' }}>{signature.substring(0, 48)}...</code></div>
              <div><strong>AES Key Wrap:</strong> <code style={{ color: 'var(--navy)', fontSize: '0.7rem' }}>{doc.wrapped_key?.substring(0, 48)}...</code></div>
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Properties Panel & Versioning */}
      <aside className="viewer-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#FFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
        <h3 className="viewer-sidebar-title" style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1.05rem', margin: 0 }}>Document Properties</h3>
        
        <div className="metadata-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="metadata-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span className="metadata-label" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Classification</span>
            <span className="metadata-value" id="viewer-classification">
              <span className={`badge-classification ${doc.classification.toLowerCase()}`}>{doc.classification}</span>
            </span>
          </div>

          <div className="metadata-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span className="metadata-label" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Department</span>
            <span className="metadata-value" style={{ fontWeight: 700, color: 'var(--navy)' }}>{doc.department}</span>
          </div>

          <div className="metadata-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span className="metadata-label" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Published Date</span>
            <span className="metadata-value" style={{ fontWeight: 500 }}>{new Date(doc.modified_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>

          <div className="metadata-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
            <span className="metadata-label" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Tags / Labels</span>
            <div className="metadata-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.25rem' }}>
              {doc.tags.map(t => (
                <span key={t} className="metadata-tag">{t}</span>
              ))}
            </div>
          </div>

          <div className="metadata-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span className="metadata-label" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Active Version</span>
            <span className="metadata-value" style={{ background: 'rgba(8, 59, 138, 0.08)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 700, color: 'var(--primary-blue)', fontSize: '0.8rem' }}>{doc.version}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          {/* Prevent Viewers from downloading CONFIDENTIAL/SECRET */}
          {!(user.role === 'OFFICIAL' && user.can_edit === 0 && ['CONFIDENTIAL', 'SECRET'].includes(doc.classification)) && (
            <button onClick={handleDownload} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.65rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Document
            </button>
          )}

          <button onClick={handlePrint} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.65rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Copy
          </button>
        </div>

        {/* Version History Segment */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.75rem' }}>Version History</h4>
          <div className="version-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto' }}>
            {doc.versions && doc.versions.length > 0 ? (
              doc.versions.map((ver, index) => {
                const isActive = ver.version === doc.version;
                const canRestore = !isActive && isEditor;
                return (
                  <div key={ver.version + index} className={`version-item ${isActive ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: isActive ? 'rgba(8, 59, 138, 0.02)' : 'none' }}>
                    <div className="version-meta-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span className="version-num" style={{ color: isActive ? 'var(--primary-blue)' : 'var(--navy)' }}>{ver.version} {isActive ? '(Current)' : ''}</span>
                      <span className="version-date" style={{ color: 'var(--text-muted)' }}>{ver.timestamp}</span>
                    </div>
                    <div className="version-author" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Author: {ver.author}</div>
                    <div className="version-desc" style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--navy)', fontWeight: 500 }}>{ver.change_reason}</div>
                    {canRestore && (
                      <div className="version-actions-row" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn-text-action" onClick={() => handleRestoreVersion(ver.version)} style={{ fontSize: '0.7rem', padding: 0 }}>Restore Version</button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No version backups recorded.</p>
            )}
          </div>
        </div>

      </aside>
    </div>
  );
};

export default DocumentViewer;
