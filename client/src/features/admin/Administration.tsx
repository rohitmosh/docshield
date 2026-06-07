import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { File, WebhookConfig } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const Administration: React.FC = () => {
  const { apiRequest } = useAuth();
  const { showToast } = useNotification();

  const [categoryCounts, setCategoryCounts] = useState({
    Technical: 0,
    Administrative: 0,
    Financial: 0,
    Regulatory: 0,
    Legal: 0
  });

  const [expiredFiles, setExpiredFiles] = useState<File[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvent, setWebhookEvent] = useState('document.published');
  const [loading, setLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Load category retention count statistics
      const vaultData = await apiRequest('/documents/vault?all=true');
      const files: File[] = vaultData.files || [];
      const counts = { Technical: 0, Administrative: 0, Financial: 0, Regulatory: 0, Legal: 0 };
      files.forEach(f => {
        if (f.category in counts) {
          counts[f.category as keyof typeof counts]++;
        }
      });
      setCategoryCounts(counts);

      // 2. Load expired files queue
      const expiredData = await apiRequest('/admin/expired');
      setExpiredFiles(expiredData || []);

      // 3. Load webhook configurations
      const webhookData: WebhookConfig = await apiRequest('/admin/webhook');
      setWebhookUrl(webhookData.url || '');
      setWebhookEvent(webhookData.event || 'document.published');

    } catch (e: any) {
      console.error('Error loading admin configurations:', e);
      showToast('Error loading admin configurations.', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiRequest, showToast]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handlePurge = async (docId: string, name: string) => {
    if (!window.confirm(`CRITICAL COMPLIANCE NOTICE: Purging ${name} will permanently shred all ciphertext and signature blocks. Confirm?`)) {
      return;
    }
    try {
      await apiRequest(`/admin/purge/${docId}`, { method: 'POST' });
      showToast(`${name} securely purged and shredded.`, 'success');
      loadAdminData();
    } catch (e: any) {
      showToast(e.message || 'Purge failed', 'error');
    }
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/admin/webhook', {
        method: 'POST',
        body: JSON.stringify({ url: webhookUrl, event: webhookEvent })
      });
      showToast('Webhook endpoint settings saved successfully.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to save webhook settings', 'error');
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      showToast('Please enter a valid target Webhook URL', 'warning');
      return;
    }
    showToast('Dispatching mock webhook trigger...', 'info');
    try {
      const data = await apiRequest('/admin/webhook/test', {
        method: 'POST',
        body: JSON.stringify({ url: webhookUrl, event: webhookEvent })
      });
      alert(`Webhook delivered successfully!\nStatus: 200 OK\nPayload:\n${JSON.stringify(data.payload, null, 2)}`);
      showToast('Webhook test payload confirmed by remote listener.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Webhook test dispatch failed', 'error');
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
        
        {/* Webhooks configuration panel */}
        <div className="section-card" style={{ height: 'fit-content' }}>
          <h4 className="section-title" style={{ marginBottom: '1rem' }}>External webhook integration</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Dispatch real-time payload alerts to external compliance dashboards when security audits occur.
          </p>
          <form onSubmit={handleSaveWebhook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="admin-webhook-url">Webhook Target URL</label>
              <input 
                type="url" 
                id="admin-webhook-url" 
                className="form-input" 
                placeholder="e.g. https://api.ohpc.gov.in/v1/compliance" 
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="admin-webhook-event">Event Trigger</label>
              <select 
                id="admin-webhook-event" 
                className="form-input"
                value={webhookEvent}
                onChange={e => setWebhookEvent(e.target.value)}
              >
                <option value="document.published">document.published</option>
                <option value="document.purged">document.purged</option>
                <option value="envelope.verified">envelope.verified</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ flexGrow: 1, padding: '0.55rem', fontSize: '0.8rem', fontWeight: 700 }}>Save Settings</button>
              <button 
                type="button" 
                onClick={handleTestWebhook} 
                className="btn-secondary" 
                style={{ padding: '0.55rem 1rem', fontSize: '0.8rem', fontWeight: 700 }}
              >
                Test Connection
              </button>
            </div>
          </form>
        </div>

        {/* Expired purge queues */}
        <div className="section-card">
          <h4 className="section-title" style={{ marginBottom: '1rem' }}>Compliance shredding queue</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Documents that have exceeded their configured corporate retention schedule. Purging hard-deletes block payloads and issues a secure signed Certificate of Destruction.
          </p>
          
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading expired queue...</p>
          ) : (
            <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Expired Resource</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredFiles.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        No files currently flagged for lifecycle destruction.
                      </td>
                    </tr>
                  ) : (
                    expiredFiles.map(doc => (
                      <tr key={doc.id}>
                        <td>
                          <div className="doc-name-cell" style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
                            {getFileIcon(doc.type)}
                            <span>{doc.name}</span>
                          </div>
                        </td>
                        <td>
                          <button 
                            className="btn-primary" 
                            onClick={() => handlePurge(doc.id, doc.name)}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', background: 'var(--error)' }}
                          >
                            Purge / Shred
                          </button>
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

    </div>
  );
};

export default Administration;
