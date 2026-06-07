import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { AuditLog as AuditLogType } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AuditLog: React.FC = () => {
  const { apiRequest } = useAuth();
  const { showToast } = useNotification();
  
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogType[]>([]);
  
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = useCallback(async () => {
    try {
      const data = await apiRequest('/audit/logs');
      setLogs(data || []);
      setFilteredLogs(data || []);
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const applyFilters = useCallback(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = logs.filter(log => {
      // Action Filter
      if (filterAction !== 'ALL' && log.action !== filterAction) return false;
      
      // Status Filter
      if (filterStatus !== 'ALL' && log.status !== filterStatus) return false;

      // Text query filter (matches user, resource or ip)
      if (query) {
        const userMatch = log.user.toLowerCase().includes(query);
        const resourceMatch = log.resource.toLowerCase().includes(query);
        const actionMatch = log.action.toLowerCase().includes(query);
        const ipMatch = log.ip_address.toLowerCase().includes(query);
        return userMatch || resourceMatch || actionMatch || ipMatch;
      }

      return true;
    });
    setFilteredLogs(result);
  }, [logs, filterAction, filterStatus, searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // CSV Exporter
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      showToast('No logs available to export.', 'warning');
      return;
    }

    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Resource', 'Status', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.user,
      l.role,
      l.action,
      l.resource.replace(/"/g, '""'), // escape quotes
      l.status,
      l.ip_address
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DocShield_Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Compliance CSV ledger downloaded successfully.', 'success');
  };

  // Unique actions for filters
  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  return (
    <div className="audit-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Compliance Header Card */}
      <div className="section-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h3 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1.25rem', margin: 0, marginBottom: '0.25rem' }}>Immutable Compliance Audit Ledger</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Inspect system operations, digital signatures verification actions, and lifecycles purges logs.
          </p>
        </div>
        <button onClick={handleExportCSV} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.25rem', fontWeight: 700 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV Ledger
        </button>
      </div>

      {/* Filters bar */}
      <div className="section-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1.25rem' }}>
        
        {/* Search input */}
        <div style={{ flexGrow: 1, minWidth: '240px', display: 'flex', alignItems: 'center', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 0.75rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            className="search-input" 
            style={{ border: 'none', background: 'none', width: '100%', outline: 'none', padding: '0.5rem 0', fontSize: '0.85rem' }} 
            placeholder="Search by operator, resource name, or IP..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Action select */}
        <div style={{ minWidth: '180px' }}>
          <select 
            className="form-input" 
            style={{ padding: '0.45rem', fontSize: '0.85rem' }}
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        {/* Filter Status select */}
        <div style={{ minWidth: '140px' }}>
          <select 
            className="form-input" 
            style={{ padding: '0.45rem', fontSize: '0.85rem' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="Success">Success</option>
            <option value="Failure">Failure</option>
            <option value="Failure: Decrypt Refused">Decrypt Refused</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="section-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Action Activity</th>
                <th>Resource Context</th>
                <th>Operator</th>
                <th>User Role</th>
                <th>Status</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No matching compliance logs found in the ledger database.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const isSuccess = log.status.toLowerCase().includes('success');
                  const isShred = log.action.includes('Purge');
                  
                  return (
                    <tr key={log.id}>
                      <td>
                        <span style={{ fontWeight: 700, color: isShred ? 'var(--error)' : 'inherit' }}>{log.action}</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>{log.resource}</span>
                      </td>
                      <td>{log.user}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{log.role}</span>
                      </td>
                      <td>
                        <span className={`badge-status ${isSuccess ? 'published' : 'draft'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{log.ip_address}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AuditLog;
