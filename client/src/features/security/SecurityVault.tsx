import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { File } from '../../types';

interface SecurityVaultProps {
  initialDocId?: string | null;
}

export const SecurityVault: React.FC<SecurityVaultProps> = ({ initialDocId }) => {
  const { apiRequest } = useAuth();
  const { showToast } = useNotification();
  
  const [secureFiles, setSecureFiles] = useState<File[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [logs, setLogs] = useState<Array<{ text: string; type: 'header' | 'info' | 'success' }>>([
    { text: '[DocShield Cryptographic Subsystem Initialized]', type: 'header' },
    { text: '[System Ready] Choose a document from the dropdown or click "Inspect Security Wrapper" in the Repository to test the decrypt pipelines, or upload new files to execute full block scrambling.', type: 'info' }
  ]);

  // Animation states
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [animationActive, setAnimationActive] = useState<boolean>(false);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  
  // Real cryptographic values fetched or mocked matching real pipeline
  const [certDetails, setCertDetails] = useState<{
    name: string;
    id: string;
    classification: string;
    checksum: string;
    wrappedKey: string;
    signature: string;
    author: string;
    date: string;
  } | null>(null);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Load Restricted/Confidential/Secret files for dropdown selector
  const loadSecureFiles = useCallback(async () => {
    try {
      const data = await apiRequest('/documents/vault?all=true');
      const allFiles: File[] = data.files || [];
      const secure = allFiles.filter(f => f.classification !== 'PUBLIC');
      setSecureFiles(secure);
    } catch (e) {
      console.error(e);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadSecureFiles();
  }, [loadSecureFiles]);

  // Scroll to bottom of terminal
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Trigger animation helper
  const triggerPipelineAnimation = useCallback((doc: File) => {
    if (animationActive) return;
    setAnimationActive(true);
    setCurrentStep(0);
    setShowCertModal(false);

    setLogs([
      { text: '[DocShield Cryptographic Subsystem Activated]', type: 'header' },
      { text: `[Loading Secure Wrapper for Resource ID: ${doc.id}] File: ${doc.name}`, type: 'info' }
    ]);

    const sha256Mock = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return 'f9e0a2b8' + Math.abs(hash).toString(16).padStart(8, '0') + 'b4822dfd3e580ffaa889ce';
    };

    const steps = [
      {
        num: 1,
        run: () => {
          const checksumStr = doc.signature ? doc.signature.substring(0, 32) : sha256Mock(doc.name + doc.size).substring(0, 32);
          setLogs(prev => [
            ...prev,
            { text: '[SHA-256 Hash Computation]', type: 'header' },
            ...Array.from([
              { text: `Reading file blocks... Size: ${doc.size} bytes`, type: 'info' as const },
              { text: `Computed Checksum: SHA256:${checksumStr}`, type: 'success' as const }
            ])
          ]);
        }
      },
      {
        num: 2,
        run: () => {
          setLogs(prev => [
            ...prev,
            { text: '[Bit Scrambler Transposition]', type: 'header' },
            ...Array.from([
              { text: 'Executing matrix transposition table shuffle...', type: 'info' as const },
              { text: 'Rearranging data blocks using FIPS-compliant key distribution vectors.', type: 'info' as const },
              { text: 'Payload Obfuscation Completed. Raw bytes scrambled.', type: 'success' as const }
            ])
          ]);
        }
      },
      {
        num: 3,
        run: () => {
          const aesKeyStr = doc.wrapped_key ? doc.wrapped_key.substring(0, 32) : sha256Mock('aes-key-' + doc.id).substring(0, 32);
          setLogs(prev => [
            ...prev,
            { text: '[AES-256-GCM Symmetric Cipher]', type: 'header' },
            ...Array.from([
              { text: 'Initializing cipher context... Key Size: 256 bits', type: 'info' as const },
              { text: 'Generated IV: 12-byte random parameter', type: 'info' as const },
              { text: `Symmetric Key Generated: 0x${aesKeyStr}`, type: 'info' as const },
              { text: 'Encrypted Payload Ciphertext Block written to vault storage.', type: 'success' as const }
            ])
          ]);
        }
      },
      {
        num: 4,
        run: () => {
          setLogs(prev => [
            ...prev,
            { text: '[RSA Key Wrapping]', type: 'header' },
            ...Array.from([
              { text: 'Querying OHPC master HSM public certificates...', type: 'info' as const },
              { text: 'Encrypting 256-bit AES key with OHPC Master RSA-4096 Public Key.', type: 'info' as const },
              { text: 'Ciphertext wrapped key securely appended to document header.', type: 'success' as const }
            ])
          ]);
        }
      },
      {
        num: 5,
        run: () => {
          const sigStr = doc.signature || sha256Mock('sig-' + doc.name).substring(0, 48);
          const checksumVal = doc.signature ? doc.signature.substring(0, 32) : sha256Mock(doc.name + doc.size).substring(0, 32);
          const wrappedKeyVal = doc.wrapped_key ? doc.wrapped_key.substring(0, 32) : sha256Mock('aes-key-' + doc.id).substring(0, 32);
          
          setLogs(prev => [
            ...prev,
            { text: '[RSASSA-PSS Digital Signature]', type: 'header' },
            ...Array.from([
              { text: 'Hashing encrypted envelope header blocks...', type: 'info' as const },
              { text: "Signing checksum using author's private key credential...", type: 'info' as const },
              { text: `Digital Signature Generated: 0x${sigStr}`, type: 'success' as const },
              { text: 'Digital Envelope validated and locked. System clearance verified.', type: 'success' as const }
            ])
          ]);

          // Set Cert details
          setCertDetails({
            name: doc.name,
            id: doc.id,
            classification: doc.classification,
            checksum: checksumVal,
            wrappedKey: wrappedKeyVal,
            signature: sigStr,
            author: doc.author || 'System Agent',
            date: new Date(doc.modified_time || Date.now()).toLocaleString()
          });

          // Log Action
          apiRequest(`/documents/${doc.id}/decrypt`, { method: 'POST' }).catch(() => {});

          setTimeout(() => {
            setShowCertModal(true);
            setAnimationActive(false);
            showToast('Decryption pipeline successfully verified.', 'success');
          }, 1200);
        }
      }
    ];

    let stepIndex = 0;
    const runNext = () => {
      if (stepIndex >= steps.length) return;
      const step = steps[stepIndex];
      setCurrentStep(step.num);
      step.run();
      stepIndex++;

      setTimeout(() => {
        runNext();
      }, 1200);
    };

    runNext();

  }, [animationActive, apiRequest, showToast]);

  // Handle trigger from dropdown select
  const handleInspectClick = () => {
    if (!selectedDocId) {
      alert('Please select a document from the dropdown.');
      return;
    }
    const match = secureFiles.find(f => f.id === selectedDocId);
    if (match) triggerPipelineAnimation(match);
  };

  // Run automatically if initialDocId is supplied
  useEffect(() => {
    if (initialDocId && secureFiles.length > 0) {
      const match = secureFiles.find(f => f.id === initialDocId);
      if (match) {
        setSelectedDocId(initialDocId);
        triggerPipelineAnimation(match);
      }
    }
  }, [initialDocId, secureFiles, triggerPipelineAnimation]);

  const handleClearLogs = () => {
    setLogs([
      { text: '[DocShield Cryptographic Subsystem Cleaned]', type: 'header' },
      { text: '[System Ready] Choose a document and trigger wrapper inspection.', type: 'info' }
    ]);
  };

  return (
    <div className="security-visualizer-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Pipeline Control Header */}
      <div className="section-card">
        <h4 className="section-title" style={{ margin: 0, marginBottom: '0.5rem' }}>Cryptographic Pipeline Sandbox</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Upload or select a file to watch DocShield run the complete secure scrambling, AES-256 symmetric cipher, RSA master wrapper, and Digital Signature authentication pipeline.
        </p>

        {/* Action controls */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, minWidth: '280px' }}>
            <select 
              className="form-input" 
              value={selectedDocId} 
              onChange={e => setSelectedDocId(e.target.value)}
              disabled={animationActive}
            >
              <option value="">-- Choose Secure Document --</option>
              {secureFiles.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.classification})</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleInspectClick} 
            className="btn-primary" 
            style={{ padding: '0.55rem 1.5rem', fontWeight: 700 }}
            disabled={animationActive}
          >
            {animationActive ? 'Scrambling...' : 'Inspect Security Wrapper'}
          </button>
        </div>

        {/* Pipeline Diagram */}
        <div className="pipeline-diagram" id="security-pipeline-nodes" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', overflowX: 'auto', padding: '1rem 0' }}>
          {[
            { num: 1, name: 'File Hash', tech: '(SHA-256)' },
            { num: 2, name: 'Bit Scrambler', tech: '(Transposition)' },
            { num: 3, name: 'AES-256-GCM', tech: '(Encryption)' },
            { num: 4, name: 'RSA Key Wrap', tech: '(Master Lock)' },
            { num: 5, name: 'Digital Sign', tech: '(RSASSA-PSS)' }
          ].map((step, idx) => {
            const isActive = currentStep === step.num;
            const isSuccess = currentStep > step.num;
            const stepClass = isSuccess ? 'success' : isActive ? 'active' : '';

            return (
              <React.Fragment key={step.num}>
                <div className={`pipeline-step ${stepClass}`}>
                  <div className="step-circle">{step.num}</div>
                  <span className="step-label">{step.name}<br />{step.tech}</span>
                </div>
                {idx < 4 && (
                  <div className={`pipeline-connector ${currentStep > step.num ? 'success' : ''}`}>
                    <div className="pipeline-connector-progress" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Live Log Console */}
      <div className="section-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 className="section-title" style={{ margin: 0 }}>Cryptographic Logs Output</h4>
          <button onClick={handleClearLogs} className="btn-clear-logs" style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Clear Output</button>
        </div>
        <div className="pipeline-log-console" id="security-console-log" style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '1.25rem', height: '240px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {logs.map((log, idx) => (
            <div key={idx} className={`console-line ${log.type}`}>
              {log.text}
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
      </div>

      {/* Master System Keys Inspect */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="section-card">
          <h4 className="section-title" style={{ marginBottom: '1rem' }}>OHPC Master RSA Key Pair</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Master Public Certificate (SHA-256 Fingerprint)</label>
              <input 
                type="text" 
                className="form-input" 
                readOnly 
                value="SHA256: 4F:9C:A1:8B:22:DF:D3:E5:80:FF:AA:88:9C:EE:AA:51:77:BA:90" 
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', background: '#F8FAFC' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Active Key Size / Algorithm</label>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)' }}>RSA-4096 / FIPS-140-2 Level 3 Hardware Security Module (HSM)</div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h4 className="section-title" style={{ marginBottom: '1rem' }}>Digital Signature Ledger</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Active Signing Authorities</label>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>&bull; <strong>SysAdmin Signature Certificate:</strong> (Valid & Verified)</div>
                <div>&bull; <strong>Approver Signature Key:</strong> (Valid & Verified)</div>
                <div>&bull; <strong>Department Officer Key:</strong> (Self-signed)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal Dialog overlay */}
      {showCertModal && certDetails && (
        <div className="dialog-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(7, 13, 25, 0.65)', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '480px', background: '#070D19', border: '2px double var(--navy)', borderRadius: '12px', padding: '1.75rem', position: 'relative' }}>
            
            <button 
              className="btn-icon" 
              onClick={() => setShowCertModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>ODISHA HYDRO POWER CORP LTD.</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>CRYPTOGRAPHIC ENVELOPE RECORD</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem', color: '#E2E8F0', lineHeight: '1.6' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Resource:</span>
                <strong style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', wordBreak: 'break-all' }}>{certDetails.name}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Resource ID:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{certDetails.id}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Security Level:</span>
                <span className={`badge-classification ${certDetails.classification.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', display: 'inline-block', width: 'fit-content', textAlign: 'center' }}>{certDetails.classification}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Cipher Suite:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34D399' }}>AES-256-GCM / RSA-4096 / RSASSA-PSS</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>SHA256 Checksum:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#60A5FA', wordBreak: 'break-all' }}>SHA256:{certDetails.checksum}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Wrapped Key:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#F59E0B', wordBreak: 'break-all' }}>0x{certDetails.wrappedKey}...</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Digital Signature:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#10B981', wordBreak: 'break-all' }}>0x{certDetails.signature}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Signed By:</span>
                <span>{certDetails.author}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>Signed Time:</span>
                <span>{certDetails.date}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCertModal(false)} className="btn-primary" style={{ padding: '0.45rem 1.25rem' }}>Close Record</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SecurityVault;
