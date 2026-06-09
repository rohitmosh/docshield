import { db } from '../config/db';
import { encryptDocument } from '../utils/cryptoUtils';

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

  // Document mock content definitions
  
  // 1. doc-1 (RESTRICTED)
  const doc1Content = `Balimela Hydel Project Unit-3 Mechanical Overhaul Report.
Summary of Maintenance:
- Turbine Runner assembly inspected for cavitation and pitting.
- Seal rings replaced and clearance tolerances verified.
- Shaft vertical alignment checked: deviation within 0.02mm.
- Governor settings calibrated and tested.
All tests conform to standard operating procedure guidelines.`;
  const doc1Enc = encryptDocument(doc1Content, 'Sasmita Dash');

  fileStmt.run(
    'doc-1', 'Balimela_Unit3_Overhaul_Manual.pdf', 'PDF', 14500000, 'Technical', 'Generation', 'RESTRICTED',
    JSON.stringify(['turbine', 'overhaul', 'balimela']), 'v2.0', 'published', null, 10,
    1775640000000, 1780824000000, 'Sasmita Dash', 'f-2',
    'Balimela Power House Unit 3 mechanical logbooks. Servicing of turbine runner assembly, checking seal rings, shaft alignment, and governor settings.',
    allDepts,
    doc1Content,
    doc1Enc.ciphertext, doc1Enc.wrappedKey, doc1Enc.signature
  );
  versionStmt.run('doc-1', 'v2.0', 'Sasmita Dash', '02-Jun-2026 14:30', 'Adjusted alignment tolerances in Section 4.2');
  versionStmt.run('doc-1', 'v1.0', 'Sasmita Dash', '15-May-2026 09:12', 'Initial Draft Submission');

  // 2. doc-2 (CONFIDENTIAL)
  const doc2Content = `Odisha Hydro Power Corporation - Balance Sheets Q4 FY25.
Key Highlights:
- Hydro power generation revenue: INR 142.5 Crores.
- Maintenance & Overhaul expenditure: INR 18.2 Crores.
- Asset valuation (Balimela & Rengali Reservoirs): INR 1,250 Crores.
- Net profit after tax adjustments: INR 34.6 Crores.
Approved for board presentation.`;
  const doc2Enc = encryptDocument(doc2Content, 'Sasmita Dash');

  fileStmt.run(
    'doc-2', 'FY2025-26_Q4_Audited_Accounts.xlsx', 'XLSX', 2800000, 'Financial', 'Finance', 'CONFIDENTIAL',
    JSON.stringify(['audit', 'financials', 'quarterly']), 'v1.1', 'published', null, 5,
    1744012800000, 1778144400000, 'Sasmita Dash', 'f-3',
    'Odisha Hydro Power Corporation balance sheets Q4 FY25. Asset valuation, capital expenditure for hydel capacity additions, revenue audits.',
    allDepts,
    doc2Content,
    doc2Enc.ciphertext, doc2Enc.wrappedKey, doc2Enc.signature
  );
  versionStmt.run('doc-2', 'v1.1', 'Sasmita Dash', '11-May-2026 16:45', 'Recalculated depreciation parameters');
  versionStmt.run('doc-2', 'v1.0', 'Sasmita Dash', '20-Apr-2026 11:30', 'Draft accounting statements');

  // 3. doc-3 (SECRET)
  const doc3Content = `SECRET CIRCULATION ONLY - Security Layout of Rengali Hydel Substation.
Grid Protection Systems:
- Main transformer protection relay settings: Overcurrent relay set at 120% load limit.
- Switchyard configuration: Double bus bar with bypass coupler.
- Physical Security: CCTV coverage at all perimeter grid fencing.
- Emergency shutoff valve response time: 4.2 seconds.`;
  const doc3Enc = encryptDocument(doc3Content, 'Sasmita Dash');

  fileStmt.run(
    'doc-3', 'Substation_Rengali_Layout_Secret.docx', 'DOCX', 18500000, 'Technical', 'Transmission', 'SECRET',
    JSON.stringify(['grid', 'layout', 'security', 'rengali']), 'v1.0', 'published', 'Sasmita Dash', 10,
    1780219200000, 1780219200000, 'Sasmita Dash', 'f-6',
    'Rengali Hydro Power Project Switchyard Layout blueprint. High voltage transmission grid protection relay parameters.',
    allDepts,
    doc3Content,
    doc3Enc.ciphertext, doc3Enc.wrappedKey, doc3Enc.signature
  );
  versionStmt.run('doc-3', 'v1.0', 'Sasmita Dash', '03-Jun-2026 10:15', 'Initial upload of system diagrams');

  // 4. doc-4 (PUBLIC)
  const doc4Content = `OHPC Citizen Charter 2026.
Serving the state of Odisha with reliable, clean hydro power.
Public Redressal Cell contact details:
- Helpline: 1800-345-6789
- Timing: 10:00 AM to 5:00 PM on all working days.
- Location: OHPC Corporate Office, Bhubaneswar.`;

  fileStmt.run(
    'doc-4', 'OHPC_Citizen_Charter_2026.pdf', 'PDF', 1200000, 'Regulatory', 'HR', 'PUBLIC',
    JSON.stringify(['public-charter', 'complaints', 'transparency']), 'v3.0', 'published', null, 99,
    1767225600000, 1770024000000, 'Sasmita Dash', 'root',
    'Odisha Hydro Power Corporation citizen service charter. Public grievance cells, application timings, hydro power safety zones awareness.',
    allDepts,
    doc4Content,
    null, null, null
  );
  versionStmt.run('doc-4', 'v3.0', 'Sasmita Dash', '12-Feb-2026 11:20', 'Updated helpline contacts');

  // 5. doc-5 (PUBLIC) - NEW
  const doc5Content = `OHPC Hydro Power Operations & Safety Guidelines 2026.
Standard safety practices:
1. Wear mandatory high-voltage protective gear in turbine galleries.
2. Conduct daily reservoir level checks during monsoon peak discharge.
3. Lock-out Tag-out (LOTO) verification before any penstock valve inspection.`;

  fileStmt.run(
    'doc-5', 'Hydro_Power_Safety_Guidelines_2026.pdf', 'PDF', 980000, 'Technical', 'Generation', 'PUBLIC',
    JSON.stringify(['safety', 'guidelines', 'operations']), 'v1.0', 'published', null, 99,
    1767225600000, 1770024000000, 'System Administrator', 'root',
    'Standard electrical and physical safety guidelines for hydro electric power house operators at OHPC plants.',
    allDepts,
    doc5Content,
    null, null, null
  );
  versionStmt.run('doc-5', 'v1.0', 'System Administrator', '01-Jan-2026 09:00', 'Initial safety guidelines publication');

  // 6. doc-6 (RESTRICTED) - NEW
  const doc6Content = `IT Security Incident Response Plan - Corporate IT Infrastructure.
Procedures:
1. Detection: Report anomalous login activities to CSIRT.
2. Containment: Isolate compromised servers from internal subnets.
3. Recovery: Restore server images from encrypted daily backup archives.`;
  const doc6Enc = encryptDocument(doc6Content, 'System Administrator');

  fileStmt.run(
    'doc-6', 'IT_Security_Incident_Response_Plan.docx', 'DOCX', 3200000, 'Regulatory', 'IT', 'RESTRICTED',
    JSON.stringify(['security', 'incident', 'compliance']), 'v1.0', 'published', null, 5,
    1767225600000, 1770024000000, 'System Administrator', 'root',
    'Incident response procedures, escalation contact matrices, and recovery protocols for OHPC internal software assets.',
    allDepts,
    doc6Content,
    doc6Enc.ciphertext, doc6Enc.wrappedKey, doc6Enc.signature
  );
  versionStmt.run('doc-6', 'v1.0', 'System Administrator', '15-Jan-2026 11:00', 'Published standard IR guidelines');

  // 7. doc-7 (RESTRICTED) - NEW
  const doc7Content = `Legal Draft: Power Purchase Agreement (PPA) for Hydro Energy Allocation.
- Parties: Odisha Hydro Power Corporation (OHPC) & Gridco Limited.
- Allocation: 100% of Generation Output from Balimela Unit-3.
- Rate Tariff: Base cost of INR 2.10 per kWh with standard indexing.`;
  const doc7Enc = encryptDocument(doc7Content, 'Sasmita Dash');

  fileStmt.run(
    'doc-7', 'Legal_Draft_Power_Purchase_Agreement.docx', 'DOCX', 5400000, 'Legal', 'Legal', 'RESTRICTED',
    JSON.stringify(['agreement', 'tariff', 'purchase']), 'v1.0', 'published', null, 15,
    1767225600000, 1770024000000, 'Sasmita Dash', 'f-4',
    'Legal power allocation contract draft between OHPC generation houses and regional distribution grid entities.',
    allDepts,
    doc7Content,
    doc7Enc.ciphertext, doc7Enc.wrappedKey, doc7Enc.signature
  );
  versionStmt.run('doc-7', 'v1.0', 'Sasmita Dash', '20-Feb-2026 14:00', 'Draft contract for grid allocation review');

  // 8. doc-8 (PUBLIC) - NEW
  const doc8Content = `Environmental Impact Assessment (EIA) for Reservoir Capacity Expansion.
Environmental Safeguards:
- Wildlife sanctuary buffer zone preservation.
- Pisciculture development in the reservoir basin.
- Compensatory afforestation across 450 hectares of adjoining area.`;

  fileStmt.run(
    'doc-8', 'OHPC_Environmental_Impact_Statement.pdf', 'PDF', 4500000, 'Regulatory', 'Generation', 'PUBLIC',
    JSON.stringify(['environmental', 'eia', 'reservoir']), 'v1.0', 'published', null, 99,
    1767225600000, 1770024000000, 'Sasmita Dash', 'root',
    'Reservoir ecosystem assessment and forest division clearances statement for the Balimela capacity enlargement works.',
    allDepts,
    doc8Content,
    null, null, null
  );
  versionStmt.run('doc-8', 'v1.0', 'Sasmita Dash', '05-Mar-2026 10:00', 'Published environmental clearance report');

  // 9. doc-9 (CONFIDENTIAL) - NEW
  const doc9Content = `Finance Department: Capacity Expansion Budget & Vendor Bids.
Estimated Costs:
- Penstock pipeline fabrication: INR 45.8 Crores.
- Turbine vendor bids: Siemens (INR 89.2 Cr), BHEL (INR 92.5 Cr).
- Civil engineering and excavation: INR 35.1 Crores.`;
  const doc9Enc = encryptDocument(doc9Content, 'System Administrator');

  fileStmt.run(
    'doc-9', 'Balimela_Expansion_Budget_Estimates.xlsx', 'XLSX', 1200000, 'Financial', 'Finance', 'CONFIDENTIAL',
    JSON.stringify(['budget', 'finance', 'expansion']), 'v1.0', 'published', null, 5,
    1767225600000, 1770024000000, 'System Administrator', 'f-3',
    'Capacity addition budgets, vendor evaluation spreadsheets, and civil cost estimates for the Balimela expansion.',
    allDepts,
    doc9Content,
    doc9Enc.ciphertext, doc9Enc.wrappedKey, doc9Enc.signature
  );
  versionStmt.run('doc-9', 'v1.0', 'System Administrator', '12-Mar-2026 15:45', 'Audited expansion budget estimates');

  // 10. doc-10 (SECRET) - NEW
  const doc10Content = `Transmission Grid Load Dispatch Log - High Voltage Line Security.
- Peak Demand Operations: Rengali dispatch peak at 250MW.
- Substation load shedding threshold alerts configured.
- Critical relay trigger settings logged under restricted access credentials.`;
  const doc10Enc = encryptDocument(doc10Content, 'System Administrator');

  fileStmt.run(
    'doc-10', 'Transmission_Grid_Load_Dispatch_Log.xlsx', 'XLSX', 1600000, 'Technical', 'Transmission', 'SECRET',
    JSON.stringify(['load-dispatch', 'relay', 'protection']), 'v1.0', 'published', null, 10,
    1767225600000, 1770024000000, 'System Administrator', 'f-6',
    'Active load schedules, relay configuration, and protection trigger levels for transmission grids.',
    allDepts,
    doc10Content,
    doc10Enc.ciphertext, doc10Enc.wrappedKey, doc10Enc.signature
  );
  versionStmt.run('doc-10', 'v1.0', 'System Administrator', '18-Mar-2026 13:00', 'Load dispatch parameters audit log');

  // doc-expired (RESTRICTED)
  const docExpiredContent = `Temporary Scrap Disposal Tender 2015 - Now Expired.
Auction of obsolete copper cables, turbine runners, and boiler scrap.
Minimum reserve price set at INR 15 Lakhs.`;
  const docExpiredEnc = encryptDocument(docExpiredContent, 'Sasmita Dash');

  fileStmt.run(
    'doc-expired', 'Balimela_Temporary_Tender_2015.docx', 'DOCX', 450000, 'Financial', 'Finance', 'RESTRICTED',
    JSON.stringify(['tender-expired', 'scrap', '2015']), 'v1.0', 'published', null, 5,
    1420070400000, 1420070400000, 'Sasmita Dash', 'f-4',
    'Old scrap disposal tender for Balimela station 2015. Temporary disposal guidelines, bidding forms, and auction details. Now expired.',
    allDepts,
    docExpiredContent,
    docExpiredEnc.ciphertext, docExpiredEnc.wrappedKey, docExpiredEnc.signature
  );
  versionStmt.run('doc-expired', 'v1.0', 'Sasmita Dash', '01-Jan-2015 10:00', 'Initial tender upload');

  // doc-draft (RESTRICTED)
  const docDraftContent = `Feasibility study for setting up Floating Solar Hybrid at Balimela.
- Proposed Solar Output: 50 MW peak.
- Reservoir Area Coverage: Less than 1.5% to minimize aquatic ecology disturbance.
- Grid connectivity through Balimela Switchyard line 2.`;
  const docDraftEnc = encryptDocument(docDraftContent, 'Sasmita Dash');

  fileStmt.run(
    'doc-draft', 'Balimela_Solar_Hybrid_Feasibility.docx', 'DOCX', 6700000, 'Technical', 'Generation', 'RESTRICTED',
    JSON.stringify(['solar', 'feasibility', 'hybrid']), 'v1.0', 'pending', null, 10,
    1780718400000, 1780718400000, 'Sasmita Dash', 'f-1',
    'Feasibility study report for setting up a floating solar hybrid system at Balimela reservoir. Estimated MW capacity.',
    allDepts,
    docDraftContent,
    docDraftEnc.ciphertext, docDraftEnc.wrappedKey, docDraftEnc.signature
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
