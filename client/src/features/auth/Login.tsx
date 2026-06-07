import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async (roleKey: string) => {
    setLoading(true);
    const success = await login(roleKey, null);
    setLoading(false);
    if (success) {
      window.location.hash = '#dashboard';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    const success = await login(null, username);
    setLoading(false);
    if (success) {
      const userJSON = localStorage.getItem('docshield_user');
      if (userJSON) {
        const u = JSON.parse(userJSON);
        if (u.role === 'ANONYMOUS') {
          window.location.hash = '#home';
        } else {
          window.location.hash = '#dashboard';
        }
      }
    }
  };

  return (
    <div className="login-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', padding: '2rem' }}>
      <div className="login-container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', maxWidth: '850px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Left Side: Traditional Form */}
        <div style={{ padding: '3rem' }}>
          <h2 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem', fontSize: '1.75rem' }}>Internal Portal Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Authenticate to access the secure document vaults and compliance workflows.</p>
          
          <form onSubmit={handleFormSubmit} id="login-form">
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="login-username">Corporate Username or Email</label>
              <input 
                type="text" 
                id="login-username" 
                className="form-input" 
                placeholder="e.g. sasmita.d@ohpc.gov.in"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="login-password">Password Token</label>
              <input 
                type="password" 
                id="login-password" 
                className="form-input" 
                placeholder="••••••••••••"
                disabled={loading}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                Note: Standard authentication uses secure state tokens mapped to system roles.
              </span>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Secure Log In'}
            </button>
          </form>
        </div>

        {/* Right Side: Quick Demo Accounts Matrix */}
        <div style={{ background: 'rgba(8, 59, 138, 0.02)', padding: '3rem', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '1.25rem', fontSize: '1.15rem' }}>Demo Accounts Matrix</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
            Click any role card below to instantly authenticate and inspect its access control permissions in the system.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              onClick={() => handleDemoLogin('sys-admin')} 
              className="btn-demo-login" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: '#FFFFFF', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              disabled={loading}
            >
              <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>SA</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>System Administrator</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 600 }}>SYSTEM ADMIN &bull; IT</span>
              </div>
            </button>

            <button 
              onClick={() => handleDemoLogin('dept-admin')} 
              className="btn-demo-login" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: '#FFFFFF', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              disabled={loading}
            >
              <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>MM</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>Manoj Mishra</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>DEPT ADMIN &bull; Transmission</span>
              </div>
            </button>

            <button 
              onClick={() => handleDemoLogin('approver')} 
              className="btn-demo-login" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: '#FFFFFF', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              disabled={loading}
            >
              <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>DO</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>Director Operations</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>APPROVER &bull; Generation</span>
              </div>
            </button>

            <button 
              onClick={() => handleDemoLogin('editor')} 
              className="btn-demo-login" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: '#FFFFFF', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              disabled={loading}
            >
              <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>SD</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>Sasmita Dash</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>EDITOR &bull; Generation</span>
              </div>
            </button>

            <button 
              onClick={() => handleDemoLogin('viewer')} 
              className="btn-demo-login" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: '#FFFFFF', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              disabled={loading}
            >
              <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>RP</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>Ranjan Pattnaik</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', fontWeight: 600 }}>VIEWER &bull; Finance</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Login;
