import { db } from '../config/db';

export function runSeeds() {
  console.log('Checking database seed state...');

  // Check if users table is populated
  const usersCountQuery = db.prepare('SELECT COUNT(*) as count FROM users');
  const usersCount = (usersCountQuery.get() as { count: number }).count;

  if (usersCount > 0) {
    console.log('Database already has seeded data. Skipping seed execution.');
    return;
  }

  console.log('Seeding initial system database state...');

  // 1. Seed Users
  const userStmt = db.prepare(`
    INSERT INTO users (id, name, email, role, dept, avatar, rank, can_edit, can_approve)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  userStmt.run('anonymous', 'Public Visitor', null, 'ANONYMOUS', 'Public', 'PV', 'Guest', 0, 0);
  userStmt.run('official-mgr', 'Sasmita Dash', 'sasmita.d@ohpc.gov.in', 'OFFICIAL', 'Generation', 'SD', 'Manager', 1, 0);
  userStmt.run('sys-admin', 'System Administrator', 'admin@ohpc.gov.in', 'SYSTEM_ADMIN', 'IT', 'SA', 'Chief IT Officer', 1, 1);

  // 2. Seed Folders
  const folderStmt = db.prepare(`
    INSERT INTO folders (id, name, parent_id, allowed_depts)
    VALUES (?, ?, ?, ?)
  `);

  const allDepts = JSON.stringify(['Generation', 'Transmission', 'Finance', 'HR', 'IT', 'Legal']);

  folderStmt.run('f-1', 'Balimela Hydel Station', 'root', allDepts);
  folderStmt.run('f-2', 'Turbine Mechanical Logs', 'f-1', allDepts);
  folderStmt.run('f-3', 'Annual Financial Audits', 'root', allDepts);
  folderStmt.run('f-4', 'Procurement & Contracts', 'root', allDepts);
  folderStmt.run('f-5', 'Human Resource Policies', 'root', allDepts);
  folderStmt.run('f-6', 'Substation Designs', 'f-1', allDepts);

  // 3. Seed Files
  const fileStmt = db.prepare(`
    INSERT INTO files (
      id, name, type, size, category, department, classification, tags,
      version, status, locked_by, retention_years, created_time, modified_time,
      author, parent_id, ocr_text, allowed_depts, content, ciphertext, wrapped_key, signature
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const versionStmt = db.prepare(`
    INSERT INTO file_versions (file_id, version, author, timestamp, change_reason)
    VALUES (?, ?, ?, ?, ?)
  `);

  // doc-1
  fileStmt.run(
    'doc-1', 'Balimela_Unit3_Overhaul_Manual.pdf', 'PDF', 14500000, 'Technical', 'Generation', 'RESTRICTED',
    JSON.stringify(['turbine', 'overhaul', 'balimela']), 'v2.0', 'published', null, 10,
    1775640000000, 1780824000000, 'Sasmita Dash', 'f-2',
    'Balimela Power House Unit 3 mechanical logbooks. Servicing of turbine runner assembly, checking seal rings, shaft alignment, and governor settings.',
    allDepts,
    'Balimela Hydel Project Unit-3 Mechanical Overhaul Report.\n\nSummary:\nThe turbine unit was taken out of grid...',
    'CiphertextBlockDoc1Hex', 'WrappedKeyDoc1Hex', 'SignatureDoc1Hex'
  );
  versionStmt.run('doc-1', 'v2.0', 'Sasmita Dash', '02-Jun-2026 14:30', 'Adjusted alignment tolerances in Section 4.2');
  versionStmt.run('doc-1', 'v1.0', 'Sasmita Dash', '15-May-2026 09:12', 'Initial Draft Submission');

  // doc-2
  fileStmt.run(
    'doc-2', 'FY2025-26_Q4_Audited_Accounts.xlsx', 'XLSX', 2800000, 'Financial', 'Finance', 'CONFIDENTIAL',
    JSON.stringify(['audit', 'financials', 'quarterly']), 'v1.1', 'published', null, 5,
    1744012800000, 1778144400000, 'Sasmita Dash', 'f-3',
    'Odisha Hydro Power Corporation balance sheets Q4 FY25. Asset valuation, capital expenditure for hydel capacity additions, revenue audits.',
    allDepts,
    'Q4 Audited Accounts sheet tables...',
    'CiphertextBlockDoc2Hex', 'WrappedKeyDoc2Hex', 'SignatureDoc2Hex'
  );
  versionStmt.run('doc-2', 'v1.1', 'Sasmita Dash', '11-May-2026 16:45', 'Recalculated depreciation parameters');
  versionStmt.run('doc-2', 'v1.0', 'Sasmita Dash', '20-Apr-2026 11:30', 'Draft accounting statements');

  // doc-3
  fileStmt.run(
    'doc-3', 'Substation_Rengali_Layout_Secret.docx', 'DOCX', 18500000, 'Technical', 'Transmission', 'SECRET',
    JSON.stringify(['grid', 'layout', 'security', 'rengali']), 'v1.0', 'published', 'Sasmita Dash', 10,
    1780219200000, 1780219200000, 'Sasmita Dash', 'f-6',
    'Rengali Hydro Power Project Switchyard Layout blueprint. High voltage transmission grid protection relay parameters.',
    allDepts,
    'SECRET - RESTRICTED CIRCULATION ONLY\n\nRengali Switchyard Grid Interlink Scheme...',
    'CiphertextBlockDoc3Hex', 'WrappedKeyDoc3Hex', 'SignatureDoc3Hex'
  );
  versionStmt.run('doc-3', 'v1.0', 'Sasmita Dash', '03-Jun-2026 10:15', 'Initial upload of system diagrams');

  // doc-4
  fileStmt.run(
    'doc-4', 'OHPC_Citizen_Charter_2026.pdf', 'PDF', 1200000, 'Regulatory', 'HR', 'PUBLIC',
    JSON.stringify(['public-charter', 'complaints', 'transparency']), 'v3.0', 'published', null, 99,
    1767225600000, 1770024000000, 'Sasmita Dash', 'root',
    'Odisha Hydro Power Corporation citizen service charter. Public grievance cells, application timings, hydro power safety zones awareness.',
    allDepts,
    'OHPC Citizen Charter - Serving Odisha with Clean Hydro Energy.',
    null, null, null
  );
  versionStmt.run('doc-4', 'v3.0', 'Sasmita Dash', '12-Feb-2026 11:20', 'Updated helpline contacts');

  // doc-expired
  fileStmt.run(
    'doc-expired', 'Balimela_Temporary_Tender_2015.docx', 'DOCX', 450000, 'Financial', 'Finance', 'RESTRICTED',
    JSON.stringify(['tender-expired', 'scrap', '2015']), 'v1.0', 'published', null, 5,
    1420070400000, 1420070400000, 'Sasmita Dash', 'f-4',
    'Old scrap disposal tender for Balimela station 2015. Temporary disposal guidelines, bidding forms, and auction details. Now expired.',
    allDepts,
    'Temporary Bidding Document 2015.',
    'CiphertextBlockDocExpiredHex', 'WrappedKeyDocExpiredHex', 'SignatureDocExpiredHex'
  );
  versionStmt.run('doc-expired', 'v1.0', 'Sasmita Dash', '01-Jan-2015 10:00', 'Initial tender upload');

  // doc-draft
  fileStmt.run(
    'doc-draft', 'Balimela_Solar_Hybrid_Feasibility.docx', 'DOCX', 6700000, 'Technical', 'Generation', 'RESTRICTED',
    JSON.stringify(['solar', 'feasibility', 'hybrid']), 'v1.0', 'pending', null, 10,
    1780718400000, 1780718400000, 'Sasmita Dash', 'f-1',
    'Feasibility study report for setting up a floating solar hybrid system at Balimela reservoir. Estimated MW capacity.',
    allDepts,
    'OHPC Balimela Reservoir Floating Solar Project Draft Feasibility.',
    'CiphertextBlockDocDraftHex', 'WrappedKeyDocDraftHex', 'SignatureDocDraftHex'
  );
  versionStmt.run('doc-draft', 'v1.0', 'Sasmita Dash', '06-Jun-2026 10:40', 'Submitted for approval');

  // 4. Seed Audit Logs
  const auditStmt = db.prepare(`
    INSERT INTO audit_logs (id, timestamp, user, role, action, resource, status, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  auditStmt.run('aud-1', '07-Jun-2026 15:42:12', 'admin@ohpc.gov.in', 'SYSTEM_ADMIN', 'Upload Document', 'Substation_Rengali_Layout_Secret.docx', 'Success', '10.45.101.4');
  auditStmt.run('aud-2', '07-Jun-2026 16:10:44', 'sasmita.d@ohpc.gov.in', 'OFFICIAL', 'View Document', 'Balimela_Unit3_Overhaul_Manual.pdf', 'Success', '10.45.112.5');
  auditStmt.run('aud-3', '07-Jun-2026 18:22:01', 'sasmita.d@ohpc.gov.in', 'OFFICIAL', 'Approve Document', 'Balimela_Unit3_Overhaul_Manual.pdf', 'Success', '10.45.98.2');
  auditStmt.run('aud-4', '07-Jun-2026 19:15:30', 'anonymous', 'ANONYMOUS', 'Download Document', 'OHPC_Citizen_Charter_2026.pdf', 'Success', '192.168.1.102');

  // 5. Seed Webhook Config
  const webStmt = db.prepare(`
    INSERT INTO webhook_config (id, url, event)
    VALUES (?, ?, ?)
  `);
  webStmt.run('default', 'https://plant-sync.ohpc.gov.in/hooks/docshield', 'document.published');

  console.log('Database Seeding Completed Successfully.');
}
