import React from 'react';

export const About: React.FC = () => {
  const departments = [
    {
      name: 'Generation',
      desc: 'Manages hydro power plant construction, maintenance operations, and technical turbine specifications across stations like Balimela and Rengali.',
      clearance: 'RESTRICTED, CONFIDENTIAL, SECRET'
    },
    {
      name: 'Transmission',
      desc: 'Controls switchyard maps, protection relay parameters, grid interlinks, and transmission network designs.',
      clearance: 'RESTRICTED, CONFIDENTIAL, SECRET'
    },
    {
      name: 'Finance',
      desc: 'Handles asset valuations, quarterly and annual audited statements, procurement tenders, and capital budgets.',
      clearance: 'PUBLIC, RESTRICTED, CONFIDENTIAL'
    },
    {
      name: 'Human Resources (HR)',
      desc: 'Coordinates personnel assignments, citizen service charters, grievance cells, and corporate training policies.',
      clearance: 'PUBLIC, RESTRICTED'
    },
    {
      name: 'IT Infrastructure',
      desc: 'Maintains system logs, cryptographic key management, access matrices, and secure DMS infrastructure portals.',
      clearance: 'PUBLIC, RESTRICTED, CONFIDENTIAL, SECRET'
    },
    {
      name: 'Legal & Contracts',
      desc: 'Oversees regulatory filings, contractor agreements, compliance audits, and litigation records.',
      clearance: 'RESTRICTED, CONFIDENTIAL'
    }
  ];

  return (
    <div className="about-view" style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 2rem', color: 'var(--text-muted)' }}>
      {/* System info block */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1rem' }}>About DocShield DMS</h1>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '750px', margin: '0 auto' }}>
          DocShield is the unified Document Management System (DMS) for the Odisha Hydro Power Corporation (OHPC). 
          It provides high-security document storage, lifecycle audit ledgers, and secure cryptographic workflow routing 
          for sensitive enterprise files while offering transparent public access for citizen charters and tenders.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginBottom: '4rem', alignItems: 'center' }}>
        <div>
          <h3 style={{ color: 'var(--navy)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '1rem' }}>Enterprise Security Principles</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1.25rem' }}>
            As a gold-category state public sector undertaking, OHPC handles sensitive grid designs, turbine logs, 
            and audited financial balance sheets. DocShield protects these records using advanced cryptography:
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
            <li><strong>Asymmetric Key Wrapping:</strong> High-security files are encrypted with unique AES keys wrapped inside RSA-4096 keys.</li>
            <li><strong>Logical AST Search:</strong> The secure OCR logical search engine allows officials to run boolean checks without exposing unencrypted document indexes.</li>
            <li><strong>Immutable Ledger Log:</strong> Every file checkout, view, edit, or approval operation is signed and stored inside a secure verification log.</li>
          </ul>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ color: 'var(--navy)', fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>Operational Compliance</h4>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '1rem' }}>
            Every document uploaded undergoes strict lifecycle validation. Based on corporate regulations, files have configured retention schedules 
            (e.g., standard 5-year schedules, long-term 10-year schedules, or permanent archives).
          </p>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
            Once the retention schedule expires, files are automatically flagged for purge clearance and securely shredded from the vault.
          </p>
        </div>
      </div>

      {/* Departments Section */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>Corporate Department Clearances</h2>
          <p style={{ maxWidth: '600px', margin: '0.5rem auto' }}>
            OHPC document directories are segregated by department. Access is authorized based on role designation and security clearance.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {departments.map(dept => (
            <div key={dept.name} style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--navy)', fontSize: '1.15rem' }}>{dept.name}</h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6', margin: 0, flexGrow: 1 }}>{dept.desc}</p>
              <div style={{ fontSize: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
                Clearances: {dept.clearance}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
