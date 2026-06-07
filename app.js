/**
 * DocShield - Odisha Hydro Power Corporation DMS
 * Core Client-Side Application Script
 */

// ==========================================
// 1. SYSTEM INITIAL STATE & SEED DATA
// ==========================================

const DEFAULT_USERS = {
  anonymous: { name: "Public Visitor", role: "ANONYMOUS", dept: "Public", avatar: "PV" },
  viewer: { name: "Ranjan Pattnaik", email: "ranjan.p@ohpc.gov.in", role: "VIEWER", dept: "Finance", avatar: "RP" },
  editor: { name: "Sasmita Dash", email: "sasmita.d@ohpc.gov.in", role: "EDITOR", dept: "Generation", avatar: "SD" },
  approver: { name: "Director Operations", email: "director.ops@ohpc.gov.in", role: "APPROVER", dept: "Generation", avatar: "DO" },
  "dept-admin": { name: "Manoj Mishra", email: "manoj.m@ohpc.gov.in", role: "DEPT_ADMIN", dept: "Transmission", avatar: "MM" },
  "sys-admin": { name: "System Administrator", email: "admin@ohpc.gov.in", role: "SYSTEM_ADMIN", dept: "IT", avatar: "SA" }
};

const DEFAULT_ANNOUNCEMENTS = [
  { id: 1, date: "07-Jun-2026", title: "New Encryption Guidelines v4.2 Enforced", desc: "All drawings related to Balimela Hydro Project must be classified under CONFIDENTIAL and encrypted.", dept: "IT" },
  { id: 2, date: "02-Jun-2026", title: "Rengali Hydel Station Annual Maintenance Schedule", desc: "Annual technical overhaul schedules for Unit 3 and 4 have been published for vendor audit reviews.", dept: "Generation" },
  { id: 3, date: "28-May-2026", title: "Retention Schedule Update for Procurement Tenders", desc: "Procurement documents are now moved to a 5-year retention period prior to secure purge cycles.", dept: "Legal" }
];

const SEED_FOLDERS = [
  { id: "f-1", name: "Balimela Hydel Station", parentId: "root" },
  { id: "f-2", name: "Turbine Mechanical Logs", parentId: "f-1" },
  { id: "f-3", name: "Annual Financial Audits", parentId: "root" },
  { id: "f-4", name: "Procurement & Contracts", parentId: "root" },
  { id: "f-5", name: "Human Resource Policies", parentId: "root" },
  { id: "f-6", name: "Substation Designs", parentId: "f-1" }
];

const SEED_FILES = [
  {
    id: "doc-1",
    name: "Balimela_Unit3_Overhaul_Manual.pdf",
    type: "PDF",
    size: 14500000, // 13.8MB
    category: "Technical",
    department: "Generation",
    classification: "RESTRICTED",
    tags: ["turbine", "overhaul", "balimela"],
    version: "v2.0",
    status: "published",
    lockedBy: null,
    retentionYears: 10,
    createdTime: 1775640000000, // May 2026
    modifiedTime: 1780824000000, // June 2026
    author: "Sasmita Dash",
    parentId: "f-2",
    ocrText: "Balimela Power House Unit 3 mechanical logbooks. Servicing of turbine runner assembly, checking seal rings, shaft alignment, and governor settings. Operational clearance granted with limits.",
    content: "Balimela Hydel Project Unit-3 Mechanical Overhaul Report.\n\nSummary:\nThe turbine unit was taken out of grid synchronisation for a 12-day scheduled repair. Cavitation damage of runner blades was repaired using welding overlays. Alignments checked within 0.02mm tolerances. Governor response lag resolved. Ready for test run.",
    versions: [
      { version: "v2.0", author: "Sasmita Dash", timestamp: "02-Jun-2026 14:30", changeReason: "Adjusted alignment tolerances in Section 4.2", content: "..." },
      { version: "v1.0", author: "Sasmita Dash", timestamp: "15-May-2026 09:12", changeReason: "Initial Draft Submission", content: "..." }
    ]
  },
  {
    id: "doc-2",
    name: "FY2025-26_Q4_Audited_Accounts.xlsx",
    type: "XLSX",
    size: 2800000,
    category: "Financial",
    department: "Finance",
    classification: "CONFIDENTIAL",
    tags: ["audit", "financials", "quarterly"],
    version: "v1.1",
    status: "published",
    lockedBy: null,
    retentionYears: 5,
    createdTime: 1744012800000, // Apr 2025
    modifiedTime: 1778144400000, // May 2026
    author: "Ranjan Pattnaik",
    parentId: "f-3",
    ocrText: "Odisha Hydro Power Corporation balance sheets Q4 FY25. Asset valuation, capital expenditure for hydel capacity additions, revenue audits, and tariff subsidisation calculations.",
    content: "<table><tr><th>Metric</th><th>Q4 FY25-26 (INR Cr)</th><th>Q3 FY25-26 (INR Cr)</th></tr><tr><td>Gross Revenue</td><td>342.50</td><td>310.20</td></tr><tr><td>Operating Cost</td><td>185.10</td><td>178.60</td></tr><tr><td>Net Surplus</td><td>157.40</td><td>131.60</td></tr><tr><td>Capital Outlay</td><td>82.00</td><td>45.00</td></tr></table>",
    versions: [
      { version: "v1.1", author: "Ranjan Pattnaik", timestamp: "11-May-2026 16:45", changeReason: "Recalculated depreciation parameters", content: "..." },
      { version: "v1.0", author: "Ranjan Pattnaik", timestamp: "20-Apr-2026 11:30", changeReason: "Draft accounting statements", content: "..." }
    ]
  },
  {
    id: "doc-3",
    name: "Substation_Rengali_Layout_Secret.docx",
    type: "DOCX",
    size: 18500000,
    category: "Technical",
    department: "Transmission",
    classification: "SECRET",
    tags: ["grid", "layout", "security", "rengali"],
    version: "v1.0",
    status: "published",
    lockedBy: "Manoj Mishra",
    retentionYears: 10,
    createdTime: 1780219200000, // Jun 2026
    modifiedTime: 1780219200000,
    author: "Manoj Mishra",
    parentId: "f-6",
    ocrText: "Rengali Hydro Power Project Switchyard Layout blueprint. High voltage transmission grid protection relay parameters, security perimeters, and active relay interlocking configurations.",
    content: "SECRET - RESTRICTED CIRCULATION ONLY\n\nRengali Switchyard Grid Interlink Scheme:\nDetailed layout of 220KV lines exiting Rengali station. Interlocking details of Busbars. Security zones A, B, and C definitions. Do not copy without written consent of Chief Security Officer.",
    versions: [
      { version: "v1.0", author: "Manoj Mishra", timestamp: "03-Jun-2026 10:15", changeReason: "Initial upload of system diagrams", content: "..." }
    ]
  },
  {
    id: "doc-4",
    name: "OHPC_Citizen_Charter_2026.pdf",
    type: "PDF",
    size: 1200000,
    category: "Regulatory",
    department: "HR",
    classification: "PUBLIC",
    tags: ["public-charter", "complaints", "transparency"],
    version: "v3.0",
    status: "published",
    lockedBy: null,
    retentionYears: 99, // Permanent
    createdTime: 1767225600000, // Jan 2026
    modifiedTime: 1770024000000, // Feb 2026
    author: "Manoj Mishra",
    parentId: "root",
    ocrText: "Odisha Hydro Power Corporation citizen service charter. Public grievance cells, application timings, hydro power safety zones awareness guide for locals living around reservoirs.",
    content: "OHPC Citizen Charter - Serving Odisha with Clean Hydro Energy.\n\nOur Commitments:\n1. Open access to public water reservoir release schedules.\n2. Grievance redressal within 15 working days.\n3. Implementation of clean energy targets under State policies.",
    versions: [
      { version: "v3.0", author: "Manoj Mishra", timestamp: "12-Feb-2026 11:20", changeReason: "Updated helpline contacts", content: "..." }
    ]
  },
  // Document pre-expired for testing lifecycle purge!
  {
    id: "doc-expired",
    name: "Balimela_Temporary_Tender_2015.docx",
    type: "DOCX",
    size: 450000,
    category: "Financial",
    department: "Finance",
    classification: "RESTRICTED",
    tags: ["tender-expired", "scrap", "2015"],
    version: "v1.0",
    status: "published",
    lockedBy: null,
    retentionYears: 5, // Expired: Created in 2015, active until 2020!
    createdTime: 1420070400000, // Jan 2015
    modifiedTime: 1420070400000,
    author: "Ranjan Pattnaik",
    parentId: "f-4",
    ocrText: "Old scrap disposal tender for Balimela station 2015. Temporary disposal guidelines, bidding forms, and auction details. Now expired.",
    content: "Temporary Bidding Document 2015.\n\nDescription:\nAuctioning of decommissioned transformer casing and scrap copper wiring. Bid closed on March 2015. Retained for archiving and contract liability.",
    versions: [
      { version: "v1.0", author: "Ranjan Pattnaik", timestamp: "01-Jan-2015 10:00", changeReason: "Initial tender upload", content: "..." }
    ]
  },
  {
    id: "doc-draft",
    name: "Balimela_Solar_Hybrid_Feasibility.docx",
    type: "DOCX",
    size: 6700000,
    category: "Technical",
    department: "Generation",
    classification: "RESTRICTED",
    tags: ["solar", "feasibility", "hybrid"],
    version: "v1.0",
    status: "pending", // submitted for review, shows in workflow queue!
    lockedBy: null,
    retentionYears: 10,
    createdTime: 1780718400000, // Jun 2026
    modifiedTime: 1780718400000,
    author: "Sasmita Dash",
    parentId: "f-1",
    ocrText: "Feasibility study report for setting up a floating solar hybrid system at Balimela reservoir. Estimated MW capacity, grid connection sub-station details, and ecological impact studies.",
    content: "OHPC Balimela Reservoir Floating Solar Project Draft Feasibility.\n\nTechnical Proposal:\nProposing 50MW floatovoltaics linked directly to the hydro power house substation. Ensures grid stability through hybrid hydro-solar load balancing. Expected completion cost: 240 Crores.",
    versions: [
      { version: "v1.0", author: "Sasmita Dash", timestamp: "06-Jun-2026 10:40", changeReason: "Submitted for approval", content: "..." }
    ]
  }
];

const SEED_AUDITS = [
  { id: "aud-1", timestamp: "07-Jun-2026 15:42:12", user: "admin@ohpc.gov.in", role: "SYSTEM_ADMIN", action: "Upload Document", resource: "Substation_Rengali_Layout_Secret.docx", status: "Success", ip: "10.45.101.4" },
  { id: "aud-2", timestamp: "07-Jun-2026 16:10:44", user: "sasmita.d@ohpc.gov.in", role: "EDITOR", action: "View Document", resource: "Balimela_Unit3_Overhaul_Manual.pdf", status: "Success", ip: "10.45.112.5" },
  { id: "aud-3", timestamp: "07-Jun-2026 18:22:01", user: "director.ops@ohpc.gov.in", role: "APPROVER", action: "Approve Document", resource: "Balimela_Unit3_Overhaul_Manual.pdf", status: "Success", ip: "10.45.98.2" },
  { id: "aud-4", timestamp: "07-Jun-2026 19:15:30", user: "anonymous", role: "ANONYMOUS", action: "Download Document", resource: "OHPC_Citizen_Charter_2026.pdf", status: "Success", ip: "192.168.1.102" }
];

// ==========================================
// 2. STATE CONTROLLER (LOCAL STORAGE LOAD/SAVE)
// ==========================================

class DocShieldState {
  constructor() {
    this.currentUser = null;
    this.folders = [];
    this.files = [];
    this.auditLogs = [];
    this.currentFolderId = "root";
    this.selectedFileIds = new Set();
    this.apiToken = "ohpc_live_token_8a3f9e2d1c7b";
    this.webhookUrl = "https://plant-sync.ohpc.gov.in/hooks/docshield";
    this.webhookEvent = "document.published";

    this.loadState();
  }

  loadState() {
    try {
      const storedFolders = localStorage.getItem("docshield_folders");
      const storedFiles = localStorage.getItem("docshield_files");
      const storedAudits = localStorage.getItem("docshield_audits");
      const storedUser = localStorage.getItem("docshield_user");
      const storedToken = localStorage.getItem("docshield_api_token");
      const storedWebhook = localStorage.getItem("docshield_webhook");

      this.folders = storedFolders ? JSON.parse(storedFolders) : [...SEED_FOLDERS];
      this.files = storedFiles ? JSON.parse(storedFiles) : [...SEED_FILES];
      this.auditLogs = storedAudits ? JSON.parse(storedAudits) : [...SEED_AUDITS];
      this.currentUser = storedUser ? JSON.parse(storedUser) : DEFAULT_USERS.anonymous;
      
      if (storedToken) this.apiToken = storedToken;
      if (storedWebhook) {
        const wh = JSON.parse(storedWebhook);
        this.webhookUrl = wh.url;
        this.webhookEvent = wh.event;
      }
    } catch (e) {
      console.error("Error reading localStorage, using defaults", e);
      this.folders = [...SEED_FOLDERS];
      this.files = [...SEED_FILES];
      this.auditLogs = [...SEED_AUDITS];
      this.currentUser = DEFAULT_USERS.anonymous;
    }

    // Ensure allowedDepts is initialized on all folders/files
    const allDepts = ["Generation", "Transmission", "Finance", "HR", "IT", "Legal"];
    this.folders.forEach(f => {
      if (!f.allowedDepts) f.allowedDepts = [...allDepts];
    });
    this.files.forEach(f => {
      if (!f.allowedDepts) f.allowedDepts = [...allDepts];
    });
  }

  saveState() {
    try {
      localStorage.setItem("docshield_folders", JSON.stringify(this.folders));
      localStorage.setItem("docshield_files", JSON.stringify(this.files));
      localStorage.setItem("docshield_audits", JSON.stringify(this.auditLogs));
      localStorage.setItem("docshield_user", JSON.stringify(this.currentUser));
      localStorage.setItem("docshield_api_token", this.apiToken);
      localStorage.setItem("docshield_webhook", JSON.stringify({ url: this.webhookUrl, event: this.webhookEvent }));
    } catch (e) {
      console.error("Error saving state to localStorage", e);
    }
  }

  resetState() {
    localStorage.removeItem("docshield_folders");
    localStorage.removeItem("docshield_files");
    localStorage.removeItem("docshield_audits");
    localStorage.removeItem("docshield_user");
    localStorage.removeItem("docshield_api_token");
    localStorage.removeItem("docshield_webhook");
    this.loadState();
    this.currentFolderId = "root";
    this.selectedFileIds.clear();
    this.logAction("Reset State", "System Environment Re-seeded", "Success");
    this.saveState();
  }

  logAction(action, resource, status = "Success", userEmail = null) {
    const userStr = userEmail || (this.currentUser ? (this.currentUser.email || this.currentUser.name) : "anonymous");
    const roleStr = this.currentUser ? this.currentUser.role : "ANONYMOUS";
    const now = new Date();
    
    // Formatting date as "DD-MMM-YYYY HH:MM:SS"
    const day = String(now.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    
    const timestamp = `${day}-${month}-${year} ${hrs}:${mins}:${secs}`;
    const ip = this.currentUser && this.currentUser.role === "ANONYMOUS" ? "192.168.1.102" : "10.45.101.4";

    const entry = {
      id: "aud-" + Math.random().toString(36).substr(2, 9),
      timestamp,
      user: userStr,
      role: roleStr,
      action,
      resource,
      status,
      ip
    };

    this.auditLogs.unshift(entry);
    this.saveState();
  }
}

const state = new DocShieldState();

// ==========================================
// 3. ROUTER & LAYOUT CONTROLLER
// ==========================================

const PUBLIC_ROUTES = ["home", "public-documents", "document-viewer", "departments", "about", "contact", "login"];
const INTERNAL_ROUTES = ["dashboard", "repository", "search", "workflows", "security", "audit", "administration", "profile"];

function handleRouting() {
  const hash = window.location.hash.substring(1) || "home";
  
  // Parse params if any (e.g. document-viewer?id=doc-1)
  const parts = hash.split("?");
  const route = parts[0];
  const queryParams = {};
  
  if (parts[1]) {
    parts[1].split("&").forEach(pair => {
      const p = pair.split("=");
      queryParams[p[0]] = p[1];
    });
  }

  // Auth Guard
  const isLoggedIn = state.currentUser && state.currentUser.role !== "ANONYMOUS";
  
  if (INTERNAL_ROUTES.includes(route) && !isLoggedIn) {
    showToast("Authentication Required. Redirecting to login...", "warning");
    window.location.hash = "#login";
    return;
  }

  // Toggle Layouts
  if (PUBLIC_ROUTES.includes(route)) {
    document.getElementById("public-layout").classList.remove("hidden");
    document.getElementById("internal-layout").classList.add("hidden");
    
    // Hide all public views
    document.querySelectorAll(".public-view").forEach(v => v.classList.add("hidden"));
    
    // Show active public view
    const viewEl = document.getElementById(`view-${route}`);
    if (viewEl) viewEl.classList.remove("hidden");

    // Update active nav links
    document.querySelectorAll(".public-menu .menu-link").forEach(l => {
      l.classList.toggle("active", l.getAttribute("data-route") === route);
    });

    // Handle public view specific initializations
    if (route === "home") {
      renderPublicHome();
    } else if (route === "public-documents") {
      renderPublicDocuments();
    } else if (route === "document-viewer" && queryParams.id) {
      renderDocumentViewer(queryParams.id);
    } else if (route === "departments") {
      renderPublicDepartments();
    }
  } else if (INTERNAL_ROUTES.includes(route)) {
    document.getElementById("public-layout").classList.add("hidden");
    document.getElementById("internal-layout").classList.remove("hidden");

    // Hide all internal views
    document.querySelectorAll(".internal-view").forEach(v => v.classList.add("hidden"));

    // Show active internal view
    const viewEl = document.getElementById(`view-${route}`);
    if (viewEl) viewEl.classList.remove("hidden");

    // Update active sidebar link
    document.querySelectorAll(".sidebar-link").forEach(l => {
      l.classList.toggle("active", l.getAttribute("data-tab") === route);
    });

    // Update Internal Header Page Title
    const routeTitles = {
      dashboard: "System Operations Dashboard",
      repository: "Secure Document Vault Explorer",
      search: "Advanced Cryptographic Search",
      workflows: "Compliance & Approval Review Queue",
      security: "Cryptographic Scrambling Pipeline",
      audit: "Immutable Ledger Compliance Log",
      administration: "Lifecycle Policies & Integrations Hub",
      profile: "Internal Security Profile"
    };
    document.getElementById("internal-page-title").textContent = routeTitles[route] || "Secure Portal";

    // Handle internal view specific initializations
    if (route === "dashboard") {
      renderDashboard();
    } else if (route === "repository") {
      renderRepository();
    } else if (route === "search") {
      renderSearchConsole();
    } else if (route === "workflows") {
      renderWorkflows();
    } else if (route === "audit") {
      renderAuditLogs();
    } else if (route === "administration") {
      renderAdministration();
    } else if (route === "profile") {
      renderProfileSettings();
    }
  } else {
    // 404 handler
    window.location.hash = "#home";
  }

  // Sync internal header user details
  syncHeaderUser();
}

window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", () => {
  handleRouting();
  setupEventListeners();
  // Clear any existing security console logs from static files
  const consoleLog = document.getElementById("security-console-log");
  if (consoleLog) {
    consoleLog.innerHTML = `<div class="console-line header">[DocShield Cryptographic Subsystem Initialized]</div>
    <div class="console-line info">[System Ready] Choose a document from the Repository and trigger 'Inspect Security Wrapper' to test the decrypt pipelines, or upload new files to execute full block scrambling.</div>`;
  }
});

// ==========================================
// 4. AUTHENTICATION & HEADERS
// ==========================================

function syncHeaderUser() {
  const user = state.currentUser;
  const isLoggedIn = user && user.role !== "ANONYMOUS";
  
  // Update nav bar login button
  const navLoginBtn = document.querySelector(".btn-login-nav");
  if (navLoginBtn) {
    if (isLoggedIn) {
      navLoginBtn.textContent = "Go To Workspace";
      navLoginBtn.href = "#dashboard";
    } else {
      navLoginBtn.textContent = "Sign In";
      navLoginBtn.href = "#login";
    }
  }

  // Update internal page header profile details
  const headerAvatar = document.getElementById("header-user-avatar");
  const headerName = document.getElementById("header-user-name");
  const headerRole = document.getElementById("header-user-role");
  const roleSelect = document.getElementById("quick-role-select");

  if (headerAvatar) headerAvatar.textContent = user.avatar || "PV";
  if (headerName) headerName.textContent = user.name || "Public Visitor";
  if (headerRole) headerRole.textContent = user.role.replace("_", " ");
  
  if (roleSelect) {
    // Map internal role strings to dropdown option tags
    const roleMap = {
      ANONYMOUS: "anonymous",
      VIEWER: "viewer",
      EDITOR: "editor",
      APPROVER: "approver",
      DEPT_ADMIN: "dept-admin",
      SYSTEM_ADMIN: "sys-admin"
    };
    roleSelect.value = roleMap[user.role] || "anonymous";
  }

  // Show/Hide Role-specific menu entries in sidebar
  const workflowsLink = document.getElementById("tab-workflows-link");
  const auditLink = document.getElementById("tab-audit-link");
  const adminLink = document.getElementById("tab-admin-link");

  if (workflowsLink) {
    // Workflows visible to Editors, Approvers, Admins
    const visible = ["EDITOR", "APPROVER", "DEPT_ADMIN", "SYSTEM_ADMIN"].includes(user.role);
    workflowsLink.classList.toggle("hidden", !visible);
  }
  if (auditLink) {
    // Audit log visible to Admins
    const visible = ["DEPT_ADMIN", "SYSTEM_ADMIN"].includes(user.role);
    auditLink.classList.toggle("hidden", !visible);
  }
  if (adminLink) {
    // Administration visible to Admins
    const visible = ["DEPT_ADMIN", "SYSTEM_ADMIN"].includes(user.role);
    adminLink.classList.toggle("hidden", !visible);
  }
}

// Perform simulated login
function handleLogin(roleKey) {
  const user = DEFAULT_USERS[roleKey];
  if (!user) return;

  state.currentUser = user;
  state.logAction("Sign In", `Authenticated as ${user.role}`, "Success");
  state.saveState();
  
  showToast(`Welcome back, ${user.name}! Role: ${user.role.replace("_", " ")}`, "success");
  
  if (user.role === "ANONYMOUS") {
    window.location.hash = "#home";
  } else {
    window.location.hash = "#dashboard";
  }
}

// ==========================================
// 5. PUBLIC VIEW CONTROLLERS
// ==========================================

function renderPublicHome() {
  const recentDocsTable = document.getElementById("home-recent-docs-table");
  const announcementsList = document.getElementById("home-announcements-list");
  
  // Public doc count
  const publicDocsCount = state.files.filter(f => f.classification === "PUBLIC" && f.status === "published").length;
  const countEl = document.getElementById("stat-public-docs");
  if (countEl) countEl.textContent = publicDocsCount;

  // Render recent public releases (last 4 files)
  const publicDocs = state.files
    .filter(f => f.classification === "PUBLIC" && f.status === "published")
    .sort((a, b) => b.modifiedTime - a.modifiedTime)
    .slice(0, 4);

  if (recentDocsTable) {
    recentDocsTable.innerHTML = "";
    if (publicDocs.length === 0) {
      recentDocsTable.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No public documents currently published.</td></tr>`;
    } else {
      publicDocs.forEach(doc => {
        const row = document.createElement("tr");
        const formattedDate = new Date(doc.modifiedTime).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
        row.innerHTML = `
          <td>
            <div class="doc-name-cell">
              ${getFileIcon(doc.type)}
              <span>${doc.name}</span>
            </div>
          </td>
          <td><span style="font-weight: 600; font-size: 0.8rem; color: var(--navy);">${doc.department}</span></td>
          <td>${formattedDate}</td>
          <td>
            <div style="display: flex; gap: 0.5rem;">
              <a href="#document-viewer?id=${doc.id}" class="btn-text-action">View</a>
              <button class="btn-text-action" onclick="downloadPublicFile('${doc.id}')" style="background: none; border: none; cursor: pointer;">Download</button>
            </div>
          </td>
        `;
        recentDocsTable.appendChild(row);
      });
    }
  }

  // Render announcements
  if (announcementsList) {
    announcementsList.innerHTML = "";
    DEFAULT_ANNOUNCEMENTS.forEach(ann => {
      const item = document.createElement("div");
      item.className = "announcement-item";
      item.innerHTML = `
        <div class="announcement-meta">
          <span>${ann.date}</span>
          <span>&bull;</span>
          <span style="font-weight: 600; color: var(--primary-blue);">${ann.dept}</span>
        </div>
        <div class="announcement-title">${ann.title}</div>
        <div class="announcement-desc">${ann.desc}</div>
      `;
      announcementsList.appendChild(item);
    });
  }
}

function renderPublicDocuments() {
  const grid = document.getElementById("public-docs-grid");
  const deptSelect = document.getElementById("filter-public-dept");
  const typeSelect = document.getElementById("filter-public-type");
  const yearSelect = document.getElementById("filter-public-year");
  const searchInput = document.getElementById("search-public-input");
  
  if (!grid) return;

  // Selected categories
  const categories = [];
  document.querySelectorAll("#filter-public-category-list input:checked").forEach(cb => {
    categories.push(cb.value);
  });

  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const dept = deptSelect ? deptSelect.value : "ALL";
  const type = typeSelect ? typeSelect.value : "ALL";
  const year = yearSelect ? yearSelect.value : "ALL";

  // Filter list
  const filtered = state.files.filter(doc => {
    // Only published public documents visible to anonymous
    if (doc.classification !== "PUBLIC" || doc.status !== "published") return false;
    
    // Department Filter
    if (dept !== "ALL" && doc.department !== dept) return false;
    // Type Filter
    if (type !== "ALL" && doc.type !== type) return false;
    // Category Filter
    if (categories.length > 0 && !categories.includes(doc.category)) return false;
    
    // Year filter
    if (year !== "ALL") {
      const docYear = new Date(doc.modifiedTime).getFullYear().toString();
      if (docYear !== year) return false;
    }

    // Search query match
    if (query) {
      const titleMatch = doc.name.toLowerCase().includes(query);
      const tagMatch = doc.tags.some(t => t.toLowerCase().includes(query));
      const textMatch = doc.ocrText.toLowerCase().includes(query);
      return titleMatch || tagMatch || textMatch;
    }

    return true;
  });

  grid.innerHTML = "";
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: span 3; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="2" style="margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      <p style="font-weight: 600;">No matching public records found</p>
    </div>`;
    return;
  }

  filtered.forEach(doc => {
    const card = document.createElement("div");
    card.className = "doc-card";
    const formattedDate = new Date(doc.modifiedTime).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    
    card.innerHTML = `
      <div>
        <div class="doc-card-header">
          <span class="badge-classification public">Public</span>
          <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">${doc.type} (${formatBytes(doc.size)})</span>
        </div>
        <h4 class="doc-card-title">${doc.name}</h4>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div class="doc-card-info">
          <div class="doc-card-info-item">
            <strong>Dept:</strong> <span>${doc.department}</span>
          </div>
          <div class="doc-card-info-item">
            <strong>Date:</strong> <span>${formattedDate}</span>
          </div>
        </div>
        <div class="metadata-tags">
          ${doc.tags.map(t => `<span class="metadata-tag">${t}</span>`).join("")}
        </div>
      </div>

      <div class="doc-card-actions">
        <a href="#document-viewer?id=${doc.id}" class="btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.85rem; display: flex; align-items: center; gap: 0.25rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View Record
        </a>
        <button class="btn-primary" onclick="downloadPublicFile('${doc.id}')" style="font-size: 0.8rem; padding: 0.4rem 0.85rem; display: flex; align-items: center; gap: 0.25rem; background: none; color: var(--primary-blue); border: 1px solid var(--primary-blue); box-shadow: none;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderPublicDepartments() {
  const container = document.getElementById("dept-cards-grid");
  if (!container) return;

  const depts = [
    { name: "Generation", desc: "Manages all state hydro power houses (Balimela, Rengali, Upper Indravati, Machhkund, Hirakud). Directs mechanical and electrical overhaul programs.", icon: "zap" },
    { name: "Transmission", desc: "Orchestrates power evacuation layout maps, sub-station schematics, switchyard interconnect blueprints, and load telemetry logs.", icon: "shuffle" },
    { name: "Finance & Accounts", desc: "Coordinates capital asset valuations, power tariff calculations, operations billing, state treasury audits, and fiscal budgets.", icon: "dollar-sign" },
    { name: "Human Resources", desc: "Directs plant security personnel alignments, staff recruitment logs, labor compliance rules, and employee safety manuals.", icon: "users" },
    { name: "IT Infrastructure", desc: "Maintains grid telemetry servers, plant security access matrices, REST API webhook integrations, and crypt systems keys security.", icon: "cpu" },
    { name: "Legal & Contracts", desc: "Drafts inter-state power distribution pacts, land acquirement audits, environmental tribunals, and public tender schedules.", icon: "briefcase" }
  ];

  container.innerHTML = "";
  depts.forEach(d => {
    const card = document.createElement("div");
    card.className = "section-card";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.gap = "1rem";
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div class="stat-icon" style="background: rgba(8, 59, 138, 0.08); color: var(--navy);">
          ${getIconMarkup(d.icon)}
        </div>
        <h4 style="font-weight: 700; color: var(--navy); font-size: 1.15rem;">${d.name}</h4>
      </div>
      <p style="font-size: 0.9rem; color: var(--text-muted); flex-grow: 1; line-height: 1.5;">${d.desc}</p>
      <a href="#public-documents" onclick="document.getElementById('filter-public-dept').value='${d.name}';" class="btn-text-action" style="font-size: 0.85rem;">View Department Documents &rarr;</a>
    `;
    container.appendChild(card);
  });
}

function renderDocumentViewer(docId) {
  const doc = state.files.find(f => f.id === docId);
  if (!doc) {
    showToast("Document not found.", "error");
    window.location.hash = "#home";
    return;
  }

  // Permissions check - Anon can only view Public. Logged in can view based on role
  const isPublic = doc.classification === "PUBLIC";
  const isLoggedIn = state.currentUser && state.currentUser.role !== "ANONYMOUS";
  
  if (!isPublic && !isLoggedIn) {
    showToast("Unauthorized. You must log in to view restricted records.", "error");
    window.location.hash = "#login";
    return;
  }

  // Enforce department access check for internal records
  if (!isPublic && state.currentUser.role !== "SYSTEM_ADMIN" && doc.author !== state.currentUser.name) {
    const allowed = doc.allowedDepts || ["Generation", "Transmission", "Finance", "HR", "IT", "Legal"];
    if (!allowed.includes(state.currentUser.dept)) {
      showToast("Access Denied: Your department does not have access permissions for this document.", "error");
      state.logAction("View Document", doc.name, "Failure: Department Access Restrained");
      window.location.hash = "#dashboard";
      return;
    }
  }

  // Populate metadata fields
  document.getElementById("viewer-doc-title").innerHTML = `
    ${getFileIcon(doc.type)}
    <span>${doc.name}</span>
  `;
  document.getElementById("viewer-classification").innerHTML = `
    <span class="badge-classification ${doc.classification.toLowerCase()}">${doc.classification}</span>
  `;
  document.getElementById("viewer-dept").textContent = doc.department;
  document.getElementById("viewer-pub-date").textContent = new Date(doc.modifiedTime).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
  document.getElementById("viewer-version-badge").textContent = doc.version;

  const tagsContainer = document.getElementById("viewer-tags");
  tagsContainer.innerHTML = "";
  doc.tags.forEach(t => {
    const span = document.createElement("span");
    span.className = "metadata-tag";
    span.textContent = t;
    tagsContainer.appendChild(span);
  });

  // Render watermark
  const watermark = document.getElementById("viewer-watermark");
  watermark.textContent = doc.classification;
  watermark.className = `viewer-mock-watermark ${doc.classification.toLowerCase()}`;
  watermark.style.color = doc.classification === "PUBLIC" ? "rgba(22, 163, 74, 0.03)" :
                        doc.classification === "RESTRICTED" ? "rgba(59, 130, 246, 0.04)" :
                        doc.classification === "CONFIDENTIAL" ? "rgba(217, 119, 6, 0.04)" : "rgba(220, 38, 38, 0.05)";

  // Render body mockup based on format
  const contentPane = document.getElementById("viewer-mock-content");
  if (doc.type === "XLSX") {
    contentPane.innerHTML = `
      <h2 style="font-family: var(--font-sans); color: var(--navy); font-size: 1.1rem; margin-bottom: 1rem;">Asset & Financial Analysis Sheet</h2>
      <div class="table-wrapper">
        ${doc.content}
      </div>
    `;
  } else {
    contentPane.innerHTML = `
      <h2 style="font-family: var(--font-sans); color: var(--navy); font-size: 1.1rem; margin-bottom: 1rem;">${doc.name.replace(/\.[^/.]+$/, "")}</h2>
      <p style="font-size: 0.95rem; line-height: 1.6; color: #2D3748; white-space: pre-line;">${doc.content}</p>
    `;
  }

  // Bind Actions (Print / Download buttons)
  document.getElementById("btn-viewer-download").onclick = () => {
    downloadFileFlow(doc.id);
  };
  document.getElementById("btn-viewer-print").onclick = () => {
    state.logAction("Print Document", doc.name, "Success");
    window.print();
  };

  // Render version history entries
  const versionsList = document.getElementById("viewer-version-list");
  versionsList.innerHTML = "";
  
  if (doc.versions && doc.versions.length > 0) {
    doc.versions.forEach((ver, index) => {
      const item = document.createElement("div");
      item.className = `version-item ${ver.version === doc.version ? "active" : ""}`;
      
      const showRestore = ver.version !== doc.version && ["EDITOR", "DEPT_ADMIN", "SYSTEM_ADMIN"].includes(state.currentUser.role);
      const restoreBtnHtml = showRestore ? `<button class="btn-text-action" onclick="restoreFileVersion('${doc.id}', '${ver.version}')" style="font-size: 0.75rem;">Restore Version</button>` : "";
      
      item.innerHTML = `
        <div class="version-meta-row">
          <span class="version-num">${ver.version} ${ver.version === doc.version ? "(Current)" : ""}</span>
          <span class="version-date">${ver.timestamp}</span>
        </div>
        <div class="version-author">Author: ${ver.author}</div>
        <div class="version-desc">${ver.changeReason}</div>
        ${restoreBtnHtml ? `<div class="version-actions-row">${restoreBtnHtml}</div>` : ""}
      `;
      versionsList.appendChild(item);
    });
  }

  // Audit view log entry
  state.logAction("View Document", doc.name, "Success");
}

// Download action with access control
function downloadPublicFile(docId) {
  const doc = state.files.find(f => f.id === docId);
  if (!doc) return;

  state.logAction("Download Document", doc.name, "Success");
  
  // Create simulated binary file download link
  const blob = new Blob([doc.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast(`Simulated download initialized for ${doc.name}`, "success");
}

function downloadFileFlow(docId) {
  const doc = state.files.find(f => f.id === docId);
  if (!doc) return;

  const role = state.currentUser.role;
  const isPublic = doc.classification === "PUBLIC";

  // Check Permissions: Anonymous can download public only
  if (role === "ANONYMOUS" && !isPublic) {
    showToast("Access Denied: Visitors cannot download internal files.", "error");
    state.logAction("Download Document", doc.name, "Failure: Unauthorized", "anonymous");
    return;
  }

  // Viewer role check: Viewers can download Restricted but NOT Confidential/Secret!
  if (role === "VIEWER" && ["CONFIDENTIAL", "SECRET"].includes(doc.classification)) {
    showToast(`Access Denied: ${role.replace("_", " ")} cannot download ${doc.classification} documents.`, "error");
    state.logAction("Download Document", doc.name, "Failure: Security Class Blocked");
    return;
  }

  // Standard download
  downloadPublicFile(docId);
}

// ==========================================
// 6. INTERNAL VIEW CONTROLLERS
// ==========================================

function renderDashboard() {
  // Sync core counts
  const totalFiles = state.files.length;
  const encryptedCount = state.files.filter(f => f.classification !== "PUBLIC").length;
  const pendingCount = state.files.filter(f => f.status === "pending").length;
  const secretCount = state.files.filter(f => f.classification === "SECRET").length;

  document.getElementById("dash-stat-total-files").textContent = totalFiles;
  document.getElementById("dash-stat-encrypted-files").textContent = encryptedCount;
  document.getElementById("dash-stat-pending-reviews").textContent = pendingCount;
  document.getElementById("dash-stat-secret-files").textContent = secretCount;

  // Render classification chart bars
  const counts = { PUBLIC: 0, RESTRICTED: 0, CONFIDENTIAL: 0, SECRET: 0 };
  state.files.forEach(f => {
    if (counts[f.classification] !== undefined) counts[f.classification]++;
  });

  const classChart = document.getElementById("dash-classification-chart");
  if (classChart) {
    const maxVal = Math.max(...Object.values(counts), 1);
    classChart.innerHTML = Object.entries(counts).map(([label, val]) => {
      const heightPercent = Math.max((val / maxVal) * 80, 5); // caps at 80% to fit tags
      const color = label === "PUBLIC" ? "var(--color-public)" :
                    label === "RESTRICTED" ? "var(--color-restricted)" :
                    label === "CONFIDENTIAL" ? "var(--color-confidential)" : "var(--color-secret)";
      return `
        <div class="bar-item">
          <div class="bar-graphic" style="background: ${color}; height: ${heightPercent}%;" data-value="${val}"></div>
          <span class="bar-label">${label}</span>
        </div>
      `;
    }).join("");
  }

  // Render department distributions
  const deptCounts = {};
  state.files.forEach(f => {
    deptCounts[f.department] = (deptCounts[f.department] || 0) + 1;
  });

  const deptChart = document.getElementById("dash-department-chart");
  if (deptChart) {
    deptChart.innerHTML = "";
    Object.entries(deptCounts).forEach(([dept, val]) => {
      const maxDeptVal = Math.max(...Object.values(deptCounts), 1);
      const widthPercent = (val / maxDeptVal) * 100;
      
      const row = document.createElement("div");
      row.style.width = "100%";
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "0.75rem";
      row.style.fontSize = "0.8rem";
      
      row.innerHTML = `
        <span style="font-weight:600; width:90px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; text-align:right;">${dept}</span>
        <div style="flex-grow:1; height:8px; background:var(--border-color); border-radius:4px; overflow:hidden;">
          <div style="height:100%; width:${widthPercent}%; background:var(--primary-blue); border-radius:4px;"></div>
        </div>
        <span style="font-weight:700; width:20px;">${val}</span>
      `;
      deptChart.appendChild(row);
    });
  }

  // Recent Ops Table (displays last 5 logs)
  const opsTable = document.getElementById("dash-recent-ops-table");
  if (opsTable) {
    opsTable.innerHTML = "";
    const recentLogs = state.auditLogs.slice(0, 5);
    recentLogs.forEach(log => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${log.action}</strong></td>
        <td><span style="color:var(--primary-blue); font-weight:500;">${log.resource}</span></td>
        <td>${log.user}</td>
        <td><span class="badge-status ${log.status.toLowerCase().startsWith('success') ? 'published' : 'draft'}">${log.status}</span></td>
        <td style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">${log.timestamp}</td>
      `;
      opsTable.appendChild(row);
    });
  }
}

function renderRepository() {
  const foldersGrid = document.getElementById("repo-folders-container");
  const filesBody = document.getElementById("repo-files-table-body");
  const breadcrumbs = document.getElementById("repo-breadcrumbs-container");
  const emptyState = document.getElementById("repo-empty-state");

  // Render breadcrumbs
  if (breadcrumbs) {
    breadcrumbs.innerHTML = "";
    
    // Find active ancestors
    const trail = [];
    let currId = state.currentFolderId;
    while (currId && currId !== "root") {
      const folder = state.folders.find(f => f.id === currId);
      if (folder) {
        trail.unshift(folder);
        currId = folder.parentId;
      } else {
        break;
      }
    }
    
    // Always start with Root
    const rootSpan = document.createElement("span");
    rootSpan.className = state.currentFolderId === "root" ? "breadcrumb-active" : "breadcrumb-link";
    rootSpan.textContent = "Root Vault";
    rootSpan.onclick = () => {
      state.currentFolderId = "root";
      state.selectedFileIds.clear();
      renderRepository();
    };
    breadcrumbs.appendChild(rootSpan);

    trail.forEach((folder, idx) => {
      const sep = document.createElement("span");
      sep.className = "breadcrumb-separator";
      sep.textContent = "/";
      breadcrumbs.appendChild(sep);

      const span = document.createElement("span");
      span.className = idx === trail.length - 1 ? "breadcrumb-active" : "breadcrumb-link";
      span.textContent = folder.name;
      span.onclick = () => {
        state.currentFolderId = folder.id;
        state.selectedFileIds.clear();
        renderRepository();
      };
      breadcrumbs.appendChild(span);
    });
  }

  // Filter child folders with department access control
  const currentFolders = state.folders.filter(f => {
    if (f.parentId !== state.currentFolderId) return false;
    if (state.currentUser.role === "SYSTEM_ADMIN") return true;
    const allowed = f.allowedDepts || ["Generation", "Transmission", "Finance", "HR", "IT", "Legal"];
    return allowed.includes(state.currentUser.dept);
  });

  if (foldersGrid) {
    foldersGrid.innerHTML = "";
    currentFolders.forEach(folder => {
      // count elements inside
      const fileCount = state.files.filter(fi => fi.parentId === folder.id).length;
      const card = document.createElement("div");
      card.className = "folder-card";
      
      const canManagePerms = ["DEPT_ADMIN", "SYSTEM_ADMIN"].includes(state.currentUser.role);
      
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
          <div class="folder-icon">${getIconMarkup("folder")}</div>
          ${canManagePerms ? `<button class="btn-icon folder-perm-btn" title="Manage Permissions" style="padding: 2px; color: var(--text-muted); cursor: pointer;">${getIconMarkup("key")}</button>` : ""}
        </div>
        <div class="folder-name" style="margin-top: 0.5rem; font-weight: 600;">${folder.name}</div>
        <div class="folder-count">${fileCount} files</div>
      `;
      card.onclick = () => {
        state.currentFolderId = folder.id;
        state.selectedFileIds.clear();
        renderRepository();
      };
      foldersGrid.appendChild(card);

      const permBtn = card.querySelector(".folder-perm-btn");
      if (permBtn) {
        permBtn.onclick = (e) => {
          e.stopPropagation();
          openPermissionsDialog(folder.id, 'folder');
        };
      }
    });
  }

  // Filter files in this folder with department access control
  const currentFiles = state.files.filter(f => {
    if (f.parentId !== state.currentFolderId) return false;
    if (f.classification === "PUBLIC") return true;
    if (f.author === state.currentUser.name) return true;
    if (state.currentUser.role === "SYSTEM_ADMIN") return true;
    const allowed = f.allowedDepts || ["Generation", "Transmission", "Finance", "HR", "IT", "Legal"];
    return allowed.includes(state.currentUser.dept);
  });
  
  if (filesBody) {
    filesBody.innerHTML = "";
    
    // Toggle empty state visibility
    const isFolderEmpty = currentFolders.length === 0 && currentFiles.length === 0;
    if (emptyState) emptyState.classList.toggle("hidden", !isFolderEmpty);

    currentFiles.forEach(doc => {
      const row = document.createElement("tr");
      const formattedDate = new Date(doc.modifiedTime).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
      
      const isSelected = state.selectedFileIds.has(doc.id);
      
      // Determine file edit capabilities based on role
      const canEdit = ["EDITOR", "DEPT_ADMIN", "SYSTEM_ADMIN"].includes(state.currentUser.role);
      const isLocked = doc.lockedBy !== null;
      const isLockedByMe = isLocked && doc.lockedBy === state.currentUser.name;
      
      let lockActionHtml = "";
      if (canEdit) {
        if (isLocked) {
          if (isLockedByMe) {
            lockActionHtml = `<button class="btn-icon" title="Unlock Document" onclick="toggleFileLock('${doc.id}')">${getIconMarkup("lock-unlocked")}</button>`;
          } else {
            lockActionHtml = `<span style="font-size:0.75rem; color:var(--error);" title="Locked by ${doc.lockedBy}">${getIconMarkup("lock-locked")}</span>`;
          }
        } else {
          lockActionHtml = `<button class="btn-icon" title="Lock Document" onclick="toggleFileLock('${doc.id}')">${getIconMarkup("lock-unlocked")}</button>`;
        }
      }

      // Metadata edit / Delete
      const showEdit = canEdit && (!isLocked || isLockedByMe);
      const editBtn = showEdit ? `<button class="btn-icon" title="Edit Metadata" onclick="openEditMetadataDialog('${doc.id}')">${getIconMarkup("edit")}</button>` : "";
      const deleteBtn = canEdit && (!isLocked || isLockedByMe) ? `<button class="btn-icon" title="Delete" onclick="deleteFile('${doc.id}')" style="color:var(--error);">${getIconMarkup("trash")}</button>` : "";
      
      // Manage Permissions trigger
      const canManagePerms = ["DEPT_ADMIN", "SYSTEM_ADMIN"].includes(state.currentUser.role);
      const permBtn = canManagePerms ? `<button class="btn-icon" title="Manage Permissions" onclick="openPermissionsDialog('${doc.id}', 'file')">${getIconMarkup("key")}</button>` : "";

      // Crypt inspection check
      const inspectBtn = doc.classification !== "PUBLIC" ? `<button class="btn-icon" title="Inspect Security Wrapper" onclick="inspectFileSecurity('${doc.id}')" style="color:var(--accent-blue);">${getIconMarkup("shield")}</button>` : "";

      row.innerHTML = `
        <td><input type="checkbox" class="file-select-checkbox" data-id="${doc.id}" ${isSelected ? "checked" : ""}></td>
        <td>
          <div class="doc-name-cell">
            ${getFileIcon(doc.type)}
            <a href="#document-viewer?id=${doc.id}" style="font-weight: 600; color: var(--navy);">${doc.name}</a>
          </div>
        </td>
        <td><span class="badge-classification ${doc.classification.toLowerCase()}">${doc.classification}</span></td>
        <td><span style="font-weight:600; font-size:0.8rem; color:var(--text-muted);">${doc.department}</span></td>
        <td><span class="badge-status ${doc.status}">${doc.status}</span></td>
        <td><span style="font-size:0.8rem; font-weight:500;">${doc.lockedBy || "-"}</span></td>
        <td>${formattedDate}</td>
        <td>
          <div style="display: flex; gap: 0.25rem; align-items: center;">
            ${inspectBtn}
            ${lockActionHtml}
            ${permBtn}
            ${editBtn}
            ${deleteBtn}
          </div>
        </td>
      `;
      filesBody.appendChild(row);
    });

    // Wire individual checkboxes
    document.querySelectorAll(".file-select-checkbox").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const id = e.target.getAttribute("data-id");
        if (e.target.checked) {
          state.selectedFileIds.add(id);
        } else {
          state.selectedFileIds.delete(id);
        }
        updateBulkBar();
      });
    });
  }

  // Update header actions availability based on roles
  const canUpload = ["EDITOR", "DEPT_ADMIN", "SYSTEM_ADMIN"].includes(state.currentUser.role);
  const btnUpload = document.getElementById("btn-repo-upload");
  const btnNewFolder = document.getElementById("btn-repo-new-folder");

  if (btnUpload) btnUpload.style.display = canUpload ? "flex" : "none";
  if (btnNewFolder) btnNewFolder.style.display = canUpload ? "flex" : "none";
}

function updateBulkBar() {
  const bar = document.getElementById("repo-bulk-bar");
  const text = document.getElementById("repo-bulk-selected-txt");
  
  if (!bar) return;
  
  const count = state.selectedFileIds.size;
  if (count > 0) {
    bar.classList.remove("hidden");
    text.textContent = `${count} item${count > 1 ? "s" : ""} selected`;
  } else {
    bar.classList.add("hidden");
  }
}

// File checkouts (Lock/Unlock)
function toggleFileLock(docId) {
  const doc = state.files.find(f => f.id === docId);
  if (!doc) return;

  const currentUserName = state.currentUser.name;
  if (doc.lockedBy) {
    // Unlock
    if (doc.lockedBy !== currentUserName && state.currentUser.role !== "SYSTEM_ADMIN") {
      showToast("Access Denied: You cannot unlock a document checked out by another editor.", "error");
      return;
    }
    doc.lockedBy = null;
    state.logAction("Unlock Document", doc.name, "Success");
    showToast(`${doc.name} successfully unlocked/checked in.`, "success");
  } else {
    // Lock
    doc.lockedBy = currentUserName;
    state.logAction("Lock Document", doc.name, "Success");
    showToast(`${doc.name} checked out. Other users cannot edit until it is checked in.`, "success");
  }
  state.saveState();
  renderRepository();
}

function deleteFile(docId) {
  const doc = state.files.find(f => f.id === docId);
  if (!doc) return;

  if (confirm(`Are you sure you want to permanently delete ${doc.name}? This action is immutable.`)) {
    state.files = state.files.filter(f => f.id !== docId);
    state.logAction("Delete Document", doc.name, "Success");
    state.saveState();
    showToast(`${doc.name} permanently removed.`, "success");
    renderRepository();
  }
}

// Inspect security details for encrypted files
function inspectFileSecurity(docId) {
  // Save search parameters and navigate
  window.location.hash = "#security";
  setTimeout(() => {
    triggerCryptoAnimation(docId);
  }, 100);
}

// ==========================================
// 7. SECURITY ENCRYPTION PIPELINE SANDBOX
// ==========================================

function triggerCryptoAnimation(docId) {
  const doc = state.files.find(f => f.id === docId);
  if (!doc) return;

  const consoleLog = document.getElementById("security-console-log");
  if (!consoleLog) return;

  // Clear previous outputs
  consoleLog.innerHTML = `<div class="console-line header">[DocShield Cryptographic Subsystem Activated]</div>
  <div class="console-line info">[Loading Secure Wrapper for Resource ID: ${doc.id}] File: ${doc.name}</div>`;

  // Reset node classes
  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById(`step-node-${i}`);
    const conn = document.getElementById(`step-conn-${i}`);
    if (node) node.className = "pipeline-step";
    if (conn) conn.className = "pipeline-connector";
  }

  // Steps pipeline delay sequence
  const steps = [
    {
      num: 1,
      log: () => {
        const hash = sha256Mock(doc.name + doc.size);
        appendConsoleLine(`[SHA-256 Hash Computation]`, "header");
        appendConsoleLine(`Reading file blocks... Size: ${doc.size} bytes`, "info");
        appendConsoleLine(`Computed Checksum: SHA256:${hash}`, "success");
      }
    },
    {
      num: 2,
      log: () => {
        appendConsoleLine(`[Bit Scrambler Transposition]`, "header");
        appendConsoleLine(`Executing matrix transposition table shuffle...`, "info");
        appendConsoleLine(`Rearranging data blocks using FIPS-compliant key distribution vectors.`, "info");
        appendConsoleLine(`Payload Obfuscation Completed. Raw bytes scrambled.`, "success");
      }
    },
    {
      num: 3,
      log: () => {
        const key = sha256Mock("aes-key-" + doc.id).substring(0, 32);
        appendConsoleLine(`[AES-256-GCM Symmetric Cipher]`, "header");
        appendConsoleLine(`Initializing cipher context... Key Size: 256 bits`, "info");
        appendConsoleLine(`Generated IV: 12-byte random parameter`, "info");
        appendConsoleLine(`Symmetric Key Generated: 0x${key}`, "info");
        appendConsoleLine(`Encrypted Payload Ciphertext Block written to vault storage.`, "success");
      }
    },
    {
      num: 4,
      log: () => {
        appendConsoleLine(`[RSA Key Wrapping]`, "header");
        appendConsoleLine(`Querying OHPC master HSM public certificates...`, "info");
        appendConsoleLine(`Encrypting 256-bit AES key with OHPC Master RSA-4096 Public Key.`, "info");
        appendConsoleLine(`Ciphertext wrapped key securely appended to document header.`, "success");
      }
    },
    {
      num: 5,
      log: () => {
        const sig = sha256Mock("sig-" + doc.name).substring(0, 48);
        appendConsoleLine(`[RSASSA-PSS Digital Signature]`, "header");
        appendConsoleLine(`Hashing encrypted envelop header blocks...`, "info");
        appendConsoleLine(`Signing checksum using author's private key credential...`, "info");
        appendConsoleLine(`Digital Signature Generated: 0x${sig}`, "success");
        appendConsoleLine(`Digital Envelope validated and locked. System clearance verified.`, "success");
        
        // Log to global audit
        state.logAction("Verify Cryptographic Envelope", doc.name, "Success");

        // Display the visual certificate of encryption after a small delay
        setTimeout(() => {
          showEncryptionCertificate(doc, sig);
        }, 1200);
      }
    }
  ];

  let currentStepIndex = 0;

  function runNextStep() {
    if (currentStepIndex >= steps.length) {
      showToast("Security decryption pipeline successfully verified.", "success");
      return;
    }

    const step = steps[currentStepIndex];
    const node = document.getElementById(`step-node-${step.num}`);
    
    // Set active
    if (node) node.className = "pipeline-step active";
    
    // Run log details
    step.log();
    
    // Scroll terminal
    consoleLog.scrollTop = consoleLog.scrollHeight;

    setTimeout(() => {
      // Mark as success
      if (node) node.className = "pipeline-step success";
      
      // Fill connector
      const conn = document.getElementById(`step-conn-${step.num}`);
      if (conn) conn.className = "pipeline-connector success";

      currentStepIndex++;
      runNextStep();
    }, 1200);
  }

  runNextStep();
}

function appendConsoleLine(text, type = "info") {
  const consoleLog = document.getElementById("security-console-log");
  if (!consoleLog) return;
  const line = document.createElement("div");
  line.className = `console-line ${type}`;
  line.textContent = text;
  consoleLog.appendChild(line);
}

// Simple mock checksum generator
function sha256Mock(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0') + 
         Math.abs(hash * 31).toString(16).toUpperCase().padStart(8, '0') + 
         Math.abs(hash * 17).toString(16).toUpperCase().padStart(8, '0');
}

// ==========================================
// 8. ADVANCED SEARCH CONSOLE
// ==========================================

function renderSearchConsole() {
  const queryInput = document.getElementById("internal-search-input");
  const classFilter = document.getElementById("search-filter-classification");
  const catFilter = document.getElementById("search-filter-category");
  const deptFilter = document.getElementById("search-filter-dept");
  const typeFilter = document.getElementById("search-filter-type");
  const resultsTable = document.getElementById("internal-search-results-table");
  const emptyState = document.getElementById("search-empty-state");
  const resultsTitle = document.getElementById("search-results-count-title");

  if (!resultsTable) return;

  const query = queryInput ? queryInput.value.trim() : "";
  const classification = classFilter ? classFilter.value : "ALL";
  const category = catFilter ? catFilter.value : "ALL";
  const dept = deptFilter ? deptFilter.value : "ALL";
  const type = typeFilter ? typeFilter.value : "ALL";

  // Filter list with department checks
  const filtered = state.files.filter(doc => {
    // Role filters - Viewers can't see SECRET unless they are editors/admins
    if (doc.classification === "SECRET" && !["DEPT_ADMIN", "SYSTEM_ADMIN", "APPROVER"].includes(state.currentUser.role) && doc.author !== state.currentUser.name) {
      return false;
    }

    // Enforce department access control for internal files
    if (doc.classification !== "PUBLIC" && state.currentUser.role !== "SYSTEM_ADMIN" && doc.author !== state.currentUser.name) {
      const allowed = doc.allowedDepts || ["Generation", "Transmission", "Finance", "HR", "IT", "Legal"];
      if (!allowed.includes(state.currentUser.dept)) {
        return false;
      }
    }

    if (classification !== "ALL" && doc.classification !== classification) return false;
    if (category !== "ALL" && doc.category !== category) return false;
    if (dept !== "ALL" && doc.department !== dept) return false;
    if (type !== "ALL" && doc.type !== type) return false;

    if (query) {
      return executeBooleanSearch(query, doc);
    }
    return true;
  });

  // Render Table
  resultsTable.innerHTML = "";
  if (resultsTitle) resultsTitle.textContent = `Query Results (${filtered.length} matching entries)`;
  if (emptyState) emptyState.classList.toggle("hidden", filtered.length !== 0);

  filtered.forEach(doc => {
    const row = document.createElement("tr");
    const formattedDate = new Date(doc.modifiedTime).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    
    // OCR Highlight
    let snippet = "...";
    if (query) {
      const terms = query.replace(/(AND|OR|NOT)/g, "").replace(/[*]/g, "").split(/\s+/).filter(t => t.trim().length > 2);
      let foundText = doc.ocrText;
      terms.forEach(term => {
        const idx = foundText.toLowerCase().indexOf(term.toLowerCase());
        if (idx !== -1) {
          snippet = foundText.substring(Math.max(0, idx - 40), Math.min(foundText.length, idx + 80));
          snippet = snippet.replace(new RegExp(term, "gi"), match => `<mark style="background:rgba(235,190,60,0.4); font-weight:700;">${match}</mark>`);
          snippet = "..." + snippet.trim() + "...";
        }
      });
    } else {
      snippet = doc.ocrText.substring(0, 90) + "...";
    }

    row.innerHTML = `
      <td>
        <div class="doc-name-cell">
          ${getFileIcon(doc.type)}
          <a href="#document-viewer?id=${doc.id}" style="font-weight:600; color:var(--navy);">${doc.name}</a>
        </div>
      </td>
      <td><span class="badge-classification ${doc.classification.toLowerCase()}">${doc.classification}</span></td>
      <td><span style="font-weight:600; font-size:0.8rem; color:var(--text-muted);">${doc.department}</span></td>
      <td><div style="max-width:320px; font-size:0.75rem; color:var(--text-muted); line-height:1.4;">${snippet}</div></td>
      <td>${formattedDate}</td>
      <td>
        <a href="#document-viewer?id=${doc.id}" class="btn-text-action">View Record</a>
      </td>
    `;
    resultsTable.appendChild(row);
  });
}

// Execute Boolean and Wildcard Search
function executeBooleanSearch(query, doc) {
  // Convert query into lower case
  let q = query.toLowerCase();
  
  // OCR searchable content block
  const searchContent = `${doc.name} ${doc.category} ${doc.department} ${doc.ocrText} ${doc.tags.join(" ")}`.toLowerCase();

  // Basic check for wildcard *
  if (q.includes("*")) {
    const parts = q.split("*");
    let regexStr = parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
    const rx = new RegExp(regexStr);
    return rx.test(searchContent);
  }

  // Process simple boolean query
  // Handled keywords: AND, OR, NOT
  if (q.includes(" and ") || q.includes(" or ") || q.includes(" not ") || q.startsWith("not ")) {
    // Convert logic into javascript evaluatable string
    // e.g. "turb AND overhaul" -> "content.includes('turb') && content.includes('overhaul')"
    let evalStr = q;
    
    // Replace terms with searchContent.includes checks
    const wordRegex = /[a-z0-9]+/g;
    let match;
    const replacements = [];
    
    while ((match = wordRegex.exec(q)) !== null) {
      const word = match[0];
      if (word !== "and" && word !== "or" && word !== "not") {
        replacements.push({
          word,
          start: match.index,
          end: match.index + word.length
        });
      }
    }

    // Replace from end of string to maintain index positioning
    replacements.sort((a, b) => b.start - a.start).forEach(rep => {
      const check = `searchContent.includes('${rep.word}')`;
      evalStr = evalStr.substring(0, rep.start) + check + evalStr.substring(rep.end);
    });

    // Replace operators
    evalStr = evalStr.replace(/\band\b/g, "&&")
                     .replace(/\bor\b/g, "||")
                     .replace(/\bnot\b/g, "&& !");
                     
    // Clean up double operators and leading operators
    evalStr = evalStr.replace(/&&\s*&&/g, "&&")
                     .replace(/\|\|\s*&&/g, "||")
                     .replace(/^\s*&&\s*/g, "");

    try {
      // Securely evaluate since we generated it from alphanumeric words only
      const fn = new Function("searchContent", `return (${evalStr});`);
      return fn(searchContent);
    } catch (e) {
      console.error("Boolean parser failed, fallback to basic index checks", e);
      return searchContent.includes(q.replace(/(and|or|not)/g, "").trim());
    }
  }

  // Standard multi-term contains (OR logic fallback)
  const terms = q.split(/\s+/);
  return terms.some(term => searchContent.includes(term));
}

// ==========================================
// 9. COMPLIANCE & WORKFLOWS
// ==========================================

function renderWorkflows() {
  const tableBody = document.getElementById("workflow-approval-table-body");
  const emptyState = document.getElementById("workflow-empty-state");

  if (!tableBody) return;

  // Render documents in "pending" status
  const pendingDocs = state.files.filter(f => f.status === "pending");
  tableBody.innerHTML = "";
  
  if (emptyState) emptyState.classList.toggle("hidden", pendingDocs.length !== 0);

  pendingDocs.forEach(doc => {
    const row = document.createElement("tr");
    const formattedDate = new Date(doc.createdTime).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    
    const isApprover = ["APPROVER", "DEPT_ADMIN", "SYSTEM_ADMIN"].includes(state.currentUser.role);
    const actionsHtml = isApprover ? `
      <div style="display:flex; gap:0.5rem;">
        <button class="btn-primary" onclick="approveWorkflow('${doc.id}', true)" style="font-size:0.75rem; padding:0.35rem 0.75rem; background:var(--success);">Approve</button>
        <button class="btn-secondary" onclick="approveWorkflow('${doc.id}', false)" style="font-size:0.75rem; padding:0.35rem 0.75rem; color:var(--error); border-color:var(--error); box-shadow:none;">Reject</button>
      </div>
    ` : `<span style="font-size:0.8rem; color:var(--text-muted); font-weight:500;">Review Access Restrict</span>`;

    row.innerHTML = `
      <td>
        <div class="doc-name-cell">
          ${getFileIcon(doc.type)}
          <a href="#document-viewer?id=${doc.id}" style="font-weight:600; color:var(--navy);">${doc.name}</a>
        </div>
      </td>
      <td><span style="font-weight:600; font-size:0.8rem; color:var(--text-muted);">${doc.department}</span></td>
      <td>${doc.author}</td>
      <td><span class="badge-classification ${doc.classification.toLowerCase()}">${doc.classification}</span></td>
      <td>${formattedDate}</td>
      <td><span class="badge-status pending">${doc.status}</span></td>
      <td>${actionsHtml}</td>
    `;
    tableBody.appendChild(row);
  });
}

function approveWorkflow(docId, approve) {
  const doc = state.files.find(f => f.id === docId);
  if (!doc) return;

  if (approve) {
    doc.status = "published";
    state.logAction("Approve Document", doc.name, "Success");
    showToast(`Published: ${doc.name} is now active.`, "success");
    
    // Simulate webhook dispatch
    triggerWebhookSim("document.published", doc);
  } else {
    doc.status = "draft";
    state.logAction("Reject Document Submission", doc.name, "Success");
    showToast(`Rejected: ${doc.name} returned to Editor draft queue.`, "warning");
  }

  state.saveState();
  renderWorkflows();
}

// ==========================================
// 10. AUDIT LEDGER LOGGING & EXPORTS
// ==========================================

function renderAuditLogs() {
  const filter = document.getElementById("audit-filter-action").value;
  const body = document.getElementById("audit-logs-table-body");
  if (!body) return;

  const filteredLogs = state.auditLogs.filter(log => {
    if (filter !== "ALL" && log.action !== filter) return false;
    return true;
  });

  body.innerHTML = "";
  filteredLogs.forEach(log => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="font-family:var(--font-mono); font-size:0.8rem;">${log.timestamp}</td>
      <td style="font-weight:600;">${log.user}</td>
      <td><span class="badge-classification ${log.role === 'SYSTEM_ADMIN' || log.role === 'DEPT_ADMIN' ? 'secret' : log.role === 'EDITOR' ? 'restricted' : 'public'}">${log.role.replace("_", " ")}</span></td>
      <td><strong>${log.action}</strong></td>
      <td><span style="color:var(--primary-blue); font-weight:500;">${log.resource}</span></td>
      <td><span class="badge-status ${log.status.toLowerCase().startsWith('success') ? 'published' : 'draft'}">${log.status}</span></td>
      <td style="font-family:var(--font-mono); font-size:0.8rem; color:var(--text-muted);">${log.ip}</td>
    `;
    body.appendChild(row);
  });
}

function exportAuditLogsCSV() {
  let csv = "Timestamp,User,Security Role,Action,Resource Context,Status,IP Address\r\n";
  state.auditLogs.forEach(log => {
    csv += `"${log.timestamp}","${log.user}","${log.role}","${log.action}","${log.resource}","${log.status}","${log.ip}"\r\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `DocShield_Audit_Ledger_${new Date().toISOString().substring(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  state.logAction("Export Audit Logs", "Audit ledger CSV download", "Success");
  showToast("Audit ledger successfully exported to CSV.", "success");
}

// ==========================================
// 11. LIFECYCLE MANAGEMENT & DEVELOPER HUB
// ==========================================

function renderAdministration() {
  const purgeQueue = document.getElementById("admin-purge-queue-body");
  const purgeEmpty = document.getElementById("purge-queue-empty");
  const apiTokenInput = document.getElementById("admin-api-token");
  const webhookUrlInput = document.getElementById("admin-webhook-url");

  // Update category retention counts
  const counts = { Technical: 0, Administrative: 0, Financial: 0, Regulatory: 0, Legal: 0 };
  state.files.forEach(f => {
    if (counts[f.category] !== undefined) counts[f.category]++;
  });

  document.getElementById("admin-ret-count-tech").textContent = counts.Technical;
  document.getElementById("admin-ret-count-admin").textContent = counts.Administrative;
  document.getElementById("admin-ret-count-fin").textContent = counts.Financial;
  document.getElementById("admin-ret-count-reg").textContent = counts.Regulatory;
  document.getElementById("admin-ret-count-legal").textContent = counts.Legal;

  // Check for expired files
  if (purgeQueue) {
    purgeQueue.innerHTML = "";
    const now = new Date().getTime();
    
    // An item is expired if createdTime + retentionYears > now
    const expiredFiles = state.files.filter(doc => {
      if (doc.retentionYears === 99) return false; // permanent archive
      const retentionMs = doc.retentionYears * 365.25 * 24 * 60 * 60 * 1000;
      return (doc.createdTime + retentionMs) < now;
    });

    if (purgeEmpty) purgeEmpty.classList.toggle("hidden", expiredFiles.length !== 0);

    expiredFiles.forEach(doc => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div class="doc-name-cell" style="font-size: 0.8rem;">
            ${getFileIcon(doc.type)}
            <span>${doc.name}</span>
          </div>
        </td>
        <td>
          <button class="btn-primary" onclick="purgeExpiredDocument('${doc.id}')" style="font-size:0.75rem; padding:0.25rem 0.5rem; background:var(--error);">Purge / Shred</button>
        </td>
      `;
      purgeQueue.appendChild(row);
    });
  }

  // APIs state loading
  if (apiTokenInput) apiTokenInput.value = state.apiToken;
  if (webhookUrlInput) webhookUrlInput.value = state.webhookUrl;
}

function purgeExpiredDocument(docId) {
  const doc = state.files.find(f => f.id === docId);
  if (!doc) return;

  if (confirm(`CRITICAL COMPLIANCE NOTICE: Purging ${doc.name} will shred all ciphertext and signature blocks. Confirm?`)) {
    const hash = sha256Mock(doc.name + doc.size);
    state.files = state.files.filter(f => f.id !== docId);
    state.logAction("Secure Purge (Certificate of Destruction)", `${doc.name} (SHA256:${hash} Shredded)`, "Success");
    state.saveState();
    
    showToast(`${doc.name} securely purged and shredded.`, "success");
    
    // Webhook alert dispatch
    triggerWebhookSim("document.purged", { name: doc.name, id: doc.id });

    renderAdministration();
  }
}

// API and Webhook Simulations
function regenerateAPIToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "ohpc_live_token_";
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  state.apiToken = token;
  state.logAction("Regenerate API Token", "Access tokens regenerated", "Success");
  state.saveState();
  
  const input = document.getElementById("admin-api-token");
  if (input) input.value = token;
  showToast("New API client authorization token successfully written.", "success");
}

function triggerWebhookSim(event, details) {
  const webhookUrl = state.webhookUrl;
  console.log(`Dispatching webhook event "${event}" to ${webhookUrl}`, details);
  
  showToast(`Webhook event [${event}] dispatched...`, "info");
}

function testWebhookIntegration() {
  const url = document.getElementById("admin-webhook-url").value;
  const event = document.getElementById("admin-webhook-event").value;

  if (!url) {
    showToast("Please enter a valid target Webhook URL", "error");
    return;
  }

  state.webhookUrl = url;
  state.webhookEvent = event;
  state.saveState();

  showToast("Dispatching mock webhook trigger...", "info");
  
  // Show a simulated JSON payload modal output after 800ms
  setTimeout(() => {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      triggeredBy: state.currentUser.email || "system",
      environment: "OHPC_DocShield_Live",
      document: {
        id: "doc-sample-hook",
        name: "Mock_System_Tender_Notification.pdf",
        classification: "RESTRICTED",
        checksum: "SHA256:E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855"
      }
    };
    
    // Log hook dispatch
    state.logAction("Test Webhook Integration", `Dispatched ${event} event`, "Success");
    
    alert(`Webhook delivered successfully!\nStatus: 200 OK\nPayload:\n${JSON.stringify(payload, null, 2)}`);
    showToast("Webhook test payload confirmed by remote listener.", "success");
  }, 1000);
}

// ==========================================
// 12. PROFILE & SETTINGS
// ==========================================

function renderProfileSettings() {
  const avatar = document.getElementById("profile-avatar");
  const name = document.getElementById("profile-name");
  const badge = document.getElementById("profile-role-badge");
  const email = document.getElementById("profile-email");
  const dept = document.getElementById("profile-dept");

  const user = state.currentUser;
  if (avatar) avatar.textContent = user.avatar;
  if (name) name.textContent = user.name;
  if (email) email.textContent = user.email || "None (Anonymous Visitor)";
  if (dept) dept.textContent = user.dept;

  if (badge) {
    const classMap = {
      SYSTEM_ADMIN: "secret",
      DEPT_ADMIN: "secret",
      APPROVER: "confidential",
      EDITOR: "restricted",
      VIEWER: "restricted",
      ANONYMOUS: "public"
    };
    badge.innerHTML = `<span class="badge-classification ${classMap[user.role]}">${user.role.replace("_", " ")}</span>`;
  }

  // Update checkmarks matrix
  const perms = {
    browse: ["VIEWER", "EDITOR", "APPROVER", "DEPT_ADMIN", "SYSTEM_ADMIN"].includes(user.role),
    view: ["VIEWER", "EDITOR", "APPROVER", "DEPT_ADMIN", "SYSTEM_ADMIN"].includes(user.role),
    upload: ["EDITOR", "DEPT_ADMIN", "SYSTEM_ADMIN"].includes(user.role),
    edit: ["EDITOR", "DEPT_ADMIN", "SYSTEM_ADMIN"].includes(user.role),
    workflow: ["APPROVER", "DEPT_ADMIN", "SYSTEM_ADMIN"].includes(user.role),
    perms: ["DEPT_ADMIN", "SYSTEM_ADMIN"].includes(user.role),
    audit: ["DEPT_ADMIN", "SYSTEM_ADMIN"].includes(user.role),
    admin: ["DEPT_ADMIN", "SYSTEM_ADMIN"].includes(user.role)
  };

  Object.entries(perms).forEach(([key, allowed]) => {
    const el = document.getElementById(`profile-perm-check-${key}`);
    if (el) {
      if (allowed) {
        el.innerHTML = `&check; ${el.textContent.substring(2)}`;
        el.style.color = "var(--success)";
      } else {
        el.innerHTML = `&times; ${el.textContent.substring(2)}`;
        el.style.color = "var(--error)";
      }
    }
  });
}

// ==========================================
// 13. FILE UPLOADER & METADATA FLOW
// ==========================================

let uploadedFilesQueue = [];

function handleFilePicker(files) {
  if (files.length === 0) return;
  
  uploadedFilesQueue = Array.from(files);
  
  // Show metadata details configuration form
  const panel = document.getElementById("upload-meta-form-panel");
  const filesList = document.getElementById("upload-selected-files-list");
  const titleInput = document.getElementById("upload-meta-title");

  if (panel) panel.classList.remove("hidden");
  if (filesList) {
    filesList.innerHTML = uploadedFilesQueue.map(f => `<div>&bull; ${f.name} (${formatBytes(f.size)})</div>`).join("");
  }
  if (titleInput && uploadedFilesQueue.length === 1) {
    titleInput.value = uploadedFilesQueue[0].name.replace(/\.[^/.]+$/, "");
  }
}

function processDocumentUpload() {
  if (uploadedFilesQueue.length === 0) return;

  const titleVal = document.getElementById("upload-meta-title").value.trim();
  const category = document.getElementById("upload-meta-category").value;
  const department = document.getElementById("upload-meta-dept").value;
  const classification = document.getElementById("upload-meta-classification").value;
  const tagsVal = document.getElementById("upload-meta-tags").value.trim();
  const retention = parseInt(document.getElementById("upload-meta-retention").value);
  const desc = document.getElementById("upload-meta-desc").value.trim();

  const tags = tagsVal ? tagsVal.split(",").map(t => t.trim().toLowerCase()) : [];

  uploadedFilesQueue.forEach((file, index) => {
    const docName = file.name;
    const fileType = docName.split(".").pop().toUpperCase();
    const docId = "doc-" + Math.random().toString(36).substr(2, 9);
    
    // High-fidelity dynamic OCR text simulation based on metadata
    let ocrText = "";
    if (department === "Generation") {
      ocrText = `OHPC Hydro Generating Station Operations. Balimela & Hirakud Power Plants, Unit overhaul specifications. Mechanical alignment logs, cooling water loop flow telemetry, turbine runner blade repairs, and electrical governor setting schedules. Desc: ${desc || 'None'}`;
    } else if (department === "Transmission") {
      ocrText = `Substation Grid Evacuation Map. Interlink blueprints for 220KV switchyard busbars. Relay protection parameter specifications, grid load balancing telemetry, electrical line diagrams, and grid safety matrices. Desc: ${desc || 'None'}`;
    } else if (department === "Finance") {
      ocrText = `OHPC Corporate Accounts Ledger. Capital asset valuations, power purchase agreements (PPA) pricing structures, tariff subsidisation calculations, quarterly revenue audit worksheets, and state treasury balance sheets. Desc: ${desc || 'None'}`;
    } else if (department === "HR") {
      ocrText = `Human Resources Employee Charter. Staff alignment charts, reservoir safety awareness campaigns, plant gate security access protocol registers, corporate health rules, and employee complaints files. Desc: ${desc || 'None'}`;
    } else if (department === "IT") {
      ocrText = `DMS Server Telemetry & Cryptography Setup. Security access authorization matrices, REST API endpoints documentation, active webhook payload sync structures, and HSM certificate parameters. Desc: ${desc || 'None'}`;
    } else {
      ocrText = `OHPC Corporate Record. Document Title: ${titleVal}. Under legal retention schedule of ${retention} years. Checksum signatures verified. Category: ${category}. Department: ${department}. Desc: ${desc || 'None'}`;
    }

    const allDepts = ["Generation", "Transmission", "Finance", "HR", "IT", "Legal"];

    const newDoc = {
      id: docId,
      name: docName,
      type: fileType,
      size: file.size,
      category,
      department,
      classification,
      tags,
      version: "v1.0",
      status: classification === "PUBLIC" ? "published" : "pending", // encrypted files require workflow approval!
      lockedBy: null,
      retentionYears: retention,
      createdTime: new Date().getTime(),
      modifiedTime: new Date().getTime(),
      author: state.currentUser.name,
      parentId: state.currentFolderId,
      ocrText,
      allowedDepts: [...allDepts],
      content: desc || `OHPC system document ${titleVal} payload. Under security classification: ${classification}.`,
      versions: [
        { version: "v1.0", author: state.currentUser.name, timestamp: "07-Jun-2026 21:40", changeReason: "Initial upload block initialization", content: "..." }
      ]
    };

    state.files.push(newDoc);
    state.logAction("Upload Document", newDoc.name, "Success");
  });

  state.saveState();
  showToast(`${uploadedFilesQueue.length} files successfully staged.`, "success");

  // Reset Queue & Form
  uploadedFilesQueue = [];
  document.getElementById("doc-upload-meta-form").reset();
  document.getElementById("upload-meta-form-panel").classList.add("hidden");

  // If encrypted, navigate to security pipeline tab to watch it compile visually!
  if (classification !== "PUBLIC") {
    showToast("Cryptographic encryption pipeline activated for internal files.", "info");
    window.location.hash = "#security";
    setTimeout(() => {
      triggerCryptoAnimation(state.files[state.files.length - 1].id);
    }, 200);
  } else {
    window.location.hash = "#repository";
  }
}

// Edit Single Document Properties
function openEditMetadataDialog(docId) {
  const doc = state.files.find(f => f.id === docId);
  if (!doc) return;

  // Set modal fields
  document.getElementById("edit-meta-doc-id").value = doc.id;
  document.getElementById("edit-meta-title").value = doc.name;
  document.getElementById("edit-meta-classification").value = doc.classification;
  document.getElementById("edit-meta-category").value = doc.category;
  document.getElementById("edit-meta-tags").value = doc.tags.join(", ");
  document.getElementById("edit-meta-retention").value = doc.retentionYears !== undefined ? doc.retentionYears.toString() : "5";
  document.getElementById("edit-meta-change-reason").value = "";

  openDialog("modal-edit-meta");
}

function processMetadataEdit() {
  const docId = document.getElementById("edit-meta-doc-id").value;
  const doc = state.files.find(f => f.id === docId);
  if (!doc) return;

  const newTitle = document.getElementById("edit-meta-title").value.trim();
  const classification = document.getElementById("edit-meta-classification").value;
  const category = document.getElementById("edit-meta-category").value;
  const tagsVal = document.getElementById("edit-meta-tags").value.trim();
  const retention = parseInt(document.getElementById("edit-meta-retention").value);
  const reason = document.getElementById("edit-meta-change-reason").value.trim();

  // Create version increment
  const match = doc.version.match(/v(\d+)\.(\d+)/);
  let nextVer = "v2.0";
  if (match) {
    const major = parseInt(match[1]) + 1;
    nextVer = `v${major}.0`;
  }

  doc.name = newTitle;
  doc.classification = classification;
  doc.category = category;
  doc.tags = tagsVal ? tagsVal.split(",").map(t => t.trim().toLowerCase()) : [];
  doc.retentionYears = retention;
  doc.version = nextVer;
  doc.modifiedTime = new Date().getTime();

  // Prepend new version segment
  const now = new Date();
  const formattedVerDate = `${String(now.getDate()).padStart(2, '0')}-${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][now.getMonth()]}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  doc.versions.unshift({
    version: nextVer,
    author: state.currentUser.name,
    timestamp: formattedVerDate,
    changeReason: reason || "Metadata modifications applied"
  });

  state.logAction("Save Revision", `${doc.name} updated to ${nextVer}`, "Success");
  state.saveState();
  
  closeDialog("modal-edit-meta");
  showToast(`${doc.name} updated to version ${nextVer}`, "success");
  
  renderRepository();
}

function restoreFileVersion(docId, verNum) {
  const doc = state.files.find(f => f.id === docId);
  if (!doc) return;

  const selectedVer = doc.versions.find(v => v.version === verNum);
  if (!selectedVer) return;

  // Increment version to restore (e.g. if current is v2.0, restoring v1.0 creates a new v3.0)
  const match = doc.version.match(/v(\d+)\.(\d+)/);
  let nextVer = "v3.0";
  if (match) {
    const major = parseInt(match[1]) + 1;
    nextVer = `v${major}.0`;
  }

  doc.version = nextVer;
  doc.modifiedTime = new Date().getTime();

  const now = new Date();
  const formattedVerDate = `${String(now.getDate()).padStart(2, '0')}-${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][now.getMonth()]}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  doc.versions.unshift({
    version: nextVer,
    author: state.currentUser.name,
    timestamp: formattedVerDate,
    changeReason: `Restored back to properties of version ${verNum}`
  });

  state.logAction("Restore Version", `${doc.name} reverted to ${verNum} properties as ${nextVer}`, "Success");
  state.saveState();
  showToast(`Successfully reverted ${doc.name} to ${verNum}`, "success");
  
  // Reload document viewer
  renderDocumentViewer(docId);
}

// ==========================================
// 14. COMPONENT UTILITIES (ICONS, DIALOGS, TOASTS)
// ==========================================

function getFileIcon(type) {
  let color = "#3B82F6"; // blue standard
  if (type === "PDF") color = "#EF4444"; // red
  if (type === "DOCX") color = "#2563EB"; // dark blue
  if (type === "XLSX") color = "#10B981"; // green
  if (type === "IMAGE") color = "#8B5CF6"; // purple

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
    </svg>
  `;
}

function getIconMarkup(name) {
  const icons = {
    folder: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    zap: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    shuffle: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>`,
    "dollar-sign": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    cpu: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>`,
    briefcase: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    "lock-locked": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    "lock-unlocked": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    key: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`
  };
  return icons[name] || "";
}

// Dialog management helpers
function openDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog) dialog.showModal();
}

function closeDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog) dialog.close();
}

// Toast notification trigger
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  let iconHtml = ``;
  if (type === "success") iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  if (type === "warning") iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/><circle cx="12" cy="12" r="10"/></svg>`;
  if (type === "error") iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/><circle cx="12" cy="12" r="10"/></svg>`;
  if (type === "info") iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

  toast.innerHTML = `
    ${iconHtml}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after 3s
  setTimeout(() => {
    toast.classList.add("fade-out");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 3000);
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ==========================================
// 15. EVENENT BINDINGS & HANDLERS
// ==========================================

function setupEventListeners() {
  
  // Public Login actions
  document.querySelectorAll(".btn-demo-login").forEach(btn => {
    btn.onclick = () => {
      const role = btn.getAttribute("data-role");
      handleLogin(role);
    };
  });

  // Custom standard login form submit
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value.trim().toLowerCase();
      
      if (username.startsWith("viewer")) handleLogin("viewer");
      else if (username.startsWith("editor")) handleLogin("editor");
      else if (username.startsWith("approver")) handleLogin("approver");
      else if (username.startsWith("dept-admin")) handleLogin("dept-admin");
      else if (username.startsWith("admin")) handleLogin("sys-admin");
      else {
        // Fallback random assignment to viewer
        handleLogin("viewer");
      }
    };
  }

  // Quick Role Picker in internal header
  const roleSelect = document.getElementById("quick-role-select");
  if (roleSelect) {
    roleSelect.onchange = (e) => {
      const role = e.target.value;
      handleLogin(role);
      
      // Force reload page to bind visual states
      handleRouting();
    };
  }

  // Sidebar Logout button
  const logoutBtn = document.getElementById("btn-sidebar-logout");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      state.currentUser = DEFAULT_USERS.anonymous;
      state.logAction("Sign Out", "Session Terminated", "Success");
      state.saveState();
      
      showToast("Signed out successfully. Returning to Home...", "success");
      window.location.hash = "#home";
    };
  }

  // Public portal document search click
  const publicSearchBtn = document.getElementById("btn-public-search");
  if (publicSearchBtn) {
    publicSearchBtn.onclick = () => renderPublicDocuments();
  }

  // Public categories checkbox change bindings
  document.querySelectorAll("#filter-public-category-list input").forEach(cb => {
    cb.onchange = () => renderPublicDocuments();
  });

  // Dynamic filter lists binding
  ["filter-public-dept", "filter-public-type", "filter-public-year"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.onchange = () => renderPublicDocuments();
  });

  // Reset System State (Danger Zone)
  const resetBtn = document.getElementById("btn-reset-demo-state");
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm("Are you sure you want to restore DocShield to its fresh seeded environment? All custom folders, logs and files will be cleared.")) {
        state.resetState();
        showToast("System State Reset completed successfully.", "success");
        window.location.hash = "#dashboard";
        handleRouting();
      }
    };
  }

  // API Token regenerate action
  const regApiBtn = document.getElementById("btn-admin-generate-api");
  if (regApiBtn) {
    regApiBtn.onclick = regenerateAPIToken;
  }

  // Webhook integration check trigger
  const testHookBtn = document.getElementById("btn-admin-test-webhook");
  if (testHookBtn) {
    testHookBtn.onclick = testWebhookIntegration;
  }

  // Create Folder modal trigger
  const newFolderBtn = document.getElementById("btn-repo-new-folder");
  if (newFolderBtn) {
    newFolderBtn.onclick = () => openDialog("modal-new-folder");
  }

  // Create Folder form submit
  const folderForm = document.getElementById("form-new-folder");
  if (folderForm) {
    folderForm.onsubmit = (e) => {
      const folderName = document.getElementById("new-folder-name").value.trim();
      const folderId = "f-" + Math.random().toString(36).substr(2, 9);
      
      state.folders.push({
        id: folderId,
        name: folderName,
        parentId: state.currentFolderId
      });
      state.logAction("Create Folder", folderName, "Success");
      state.saveState();
      
      closeDialog("modal-new-folder");
      showToast(`Folder "${folderName}" successfully created.`, "success");
      renderRepository();
    };
  }

  // Clear security vault logs
  const clearLogsBtn = document.getElementById("btn-clear-security-logs");
  if (clearLogsBtn) {
    clearLogsBtn.onclick = () => {
      const consoleLog = document.getElementById("security-console-log");
      if (consoleLog) {
        consoleLog.innerHTML = `<div class="console-line header">[DocShield Cryptographic Subsystem Purged]</div>
        <div class="console-line info">[Logs Cleared] Select another document to inspect decrypt structures.</div>`;
      }
    };
  }

  // Advanced search parameters change event
  const executeQueryBtn = document.getElementById("btn-internal-search-execute");
  if (executeQueryBtn) {
    executeQueryBtn.onclick = renderSearchConsole;
  }

  ["search-filter-classification", "search-filter-category", "search-filter-dept", "search-filter-type"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.onchange = renderSearchConsole;
  });

  // Audit Logs Filter selector
  const auditFilter = document.getElementById("audit-filter-action");
  if (auditFilter) {
    auditFilter.onchange = renderAuditLogs;
  }

  // CSV Audit exporter click
  const exportCsvBtn = document.getElementById("btn-export-audit-csv");
  if (exportCsvBtn) {
    exportCsvBtn.onclick = exportAuditLogsCSV;
  }

  // Repository files table select-all checkbox
  const selectAllCb = document.getElementById("repo-select-all-checkbox");
  if (selectAllCb) {
    selectAllCb.onchange = (e) => {
      const currentFiles = state.files.filter(f => f.parentId === state.currentFolderId);
      currentFiles.forEach(doc => {
        if (e.target.checked) {
          state.selectedFileIds.add(doc.id);
        } else {
          state.selectedFileIds.delete(doc.id);
        }
      });
      
      // Update rows UI
      document.querySelectorAll(".file-select-checkbox").forEach(cb => {
        cb.checked = e.target.checked;
      });
      
      updateBulkBar();
    };
  }

  // Bulk operation: Delete selected
  const bulkDeleteBtn = document.getElementById("btn-bulk-delete");
  if (bulkDeleteBtn) {
    bulkDeleteBtn.onclick = () => {
      const count = state.selectedFileIds.size;
      if (count === 0) return;

      if (confirm(`Are you sure you want to permanently delete the ${count} selected documents?`)) {
        state.files = state.files.filter(f => !state.selectedFileIds.has(f.id));
        state.logAction("Bulk Delete Documents", `${count} files purged`, "Success");
        state.selectedFileIds.clear();
        state.saveState();
        
        showToast(`${count} items successfully deleted.`, "success");
        renderRepository();
        updateBulkBar();
      }
    };
  }

  // Bulk operation: Change Tags modal trigger
  const bulkTagsBtn = document.getElementById("btn-bulk-tag");
  if (bulkTagsBtn) {
    bulkTagsBtn.onclick = () => openDialog("modal-bulk-tags");
  }

  // Bulk operation: Change Tags form submit
  const bulkTagsForm = document.getElementById("form-bulk-tags");
  if (bulkTagsForm) {
    bulkTagsForm.onsubmit = (e) => {
      const tagsVal = document.getElementById("bulk-tags-input").value.trim();
      const newTags = tagsVal ? tagsVal.split(",").map(t => t.trim().toLowerCase()) : [];

      state.files.forEach(doc => {
        if (state.selectedFileIds.has(doc.id)) {
          doc.tags = [...new Set([...doc.tags, ...newTags])];
        }
      });

      state.logAction("Bulk Add Tags", `${state.selectedFileIds.size} files tagged`, "Success");
      state.selectedFileIds.clear();
      state.saveState();

      closeDialog("modal-bulk-tags");
      showToast("Tags successfully applied to selected documents.", "success");
      renderRepository();
      updateBulkBar();
    };
  }

  // Bulk operation: Move to Folder modal trigger
  const bulkMoveBtn = document.getElementById("btn-bulk-move");
  if (bulkMoveBtn) {
    bulkMoveBtn.onclick = () => {
      const select = document.getElementById("bulk-move-folder-select");
      if (!select) return;

      // Populate folders list
      select.innerHTML = `<option value="root">Root Vault</option>` + 
        state.folders.map(f => `<option value="${f.id}">${f.name}</option>`).join("");

      openDialog("modal-bulk-move");
    };
  }

  // Bulk operation: Move to Folder form submit
  const bulkMoveForm = document.getElementById("form-bulk-move");
  if (bulkMoveForm) {
    bulkMoveForm.onsubmit = (e) => {
      const targetFolderId = document.getElementById("bulk-move-folder-select").value;
      const targetFolder = state.folders.find(f => f.id === targetFolderId);
      const folderName = targetFolder ? targetFolder.name : "Root Vault";

      state.files.forEach(doc => {
        if (state.selectedFileIds.has(doc.id)) {
          doc.parentId = targetFolderId;
        }
      });

      state.logAction("Bulk Move Documents", `Moved ${state.selectedFileIds.size} files to ${folderName}`, "Success");
      state.selectedFileIds.clear();
      state.saveState();

      closeDialog("modal-bulk-move");
      showToast(`Selected documents successfully moved to ${folderName}.`, "success");
      renderRepository();
      updateBulkBar();
    };
  }

  // Edit Single Metadata form submit
  const editMetaForm = document.getElementById("form-edit-meta");
  if (editMetaForm) {
    editMetaForm.onsubmit = (e) => {
      e.preventDefault();
      processMetadataEdit();
    };
  }

  // Permissions form submit
  const permForm = document.getElementById("form-permissions");
  if (permForm) {
    permForm.onsubmit = (e) => {
      const id = document.getElementById("perm-resource-id").value;
      const type = document.getElementById("perm-resource-type").value;
      
      const resource = type === 'folder' 
        ? state.folders.find(f => f.id === id)
        : state.files.find(f => f.id === id);
        
      if (!resource) return;

      const checkedDepts = [];
      document.querySelectorAll(".perm-dept-checkbox:checked").forEach(cb => {
        checkedDepts.push(cb.value);
      });

      if (checkedDepts.length === 0) {
        alert("Error: At least one department must have access permissions.");
        return;
      }

      resource.allowedDepts = checkedDepts;
      state.logAction("Manage Permissions", `Updated access controls for ${type === 'folder' ? 'folder' : 'document'} "${resource.name}"`, "Success");
      state.saveState();

      closeDialog("modal-permissions");
      showToast(`Permissions successfully updated for ${resource.name}.`, "success");
      renderRepository();
    };
  }

  // Wire dialog close button anchors
  document.querySelectorAll("[data-dialog-close]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-dialog-close");
      closeDialog(id);
    };
  });

  // DRAG & DROP ZONE BINDINGS
  const dropZone = document.getElementById("file-drop-zone");
  const filePicker = document.getElementById("file-picker-input");

  if (dropZone) {
    dropZone.onclick = () => {
      if (filePicker) filePicker.click();
    };

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });

    ["dragleave", "dragend"].forEach(evName => {
      dropZone.addEventListener(evName, () => {
        dropZone.classList.remove("dragover");
      });
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files.length > 0) {
        handleFilePicker(e.dataTransfer.files);
      }
    });
  }

  if (filePicker) {
    filePicker.onchange = (e) => {
      handleFilePicker(e.target.files);
    };
  }

  // Internal document upload form submit
  const uploadForm = document.getElementById("doc-upload-meta-form");
  if (uploadForm) {
    uploadForm.onsubmit = (e) => {
      e.preventDefault();
      processDocumentUpload();
    };
  }

  const cancelUploadBtn = document.getElementById("btn-upload-cancel");
  if (cancelUploadBtn) {
    cancelUploadBtn.onclick = () => {
      uploadedFilesQueue = [];
      document.getElementById("doc-upload-meta-form").reset();
      document.getElementById("upload-meta-form-panel").classList.add("hidden");
      showToast("Staged uploads cancelled.", "info");
    };
  }

  // Public Contact Form Submit
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.onsubmit = (e) => {
      e.preventDefault();
      showToast("Thank you for contacting OHPC Support. We will review your inquiry shortly.", "success");
      contactForm.reset();
    };
  }
}

// ==========================================
// 16. PERMISSIONS & CRYPTOGRAPHIC CERTIFICATES
// ==========================================

function openPermissionsDialog(id, type) {
  const resource = type === 'folder' 
    ? state.folders.find(f => f.id === id)
    : state.files.find(f => f.id === id);
    
  if (!resource) return;

  document.getElementById("perm-resource-id").value = id;
  document.getElementById("perm-resource-type").value = type;
  document.getElementById("modal-perm-title").textContent = `Manage ${type === 'folder' ? 'Folder' : 'Document'} Permissions`;
  document.getElementById("perm-resource-info").innerHTML = `
    Set access permissions for <strong>${resource.name}</strong>. Only users in checked departments will be allowed to view or download this resource.
  `;

  // Render department checkboxes
  const container = document.getElementById("permissions-dept-rows-container");
  const depts = [
    { key: "Generation", name: "Generation" },
    { key: "Transmission", name: "Transmission" },
    { key: "Finance", name: "Finance & Accounts" },
    { key: "HR", name: "Human Resources" },
    { key: "IT", name: "IT Infrastructure" },
    { key: "Legal", name: "Legal & Contracts" }
  ];

  // Initialize allowedDepts if not present
  if (!resource.allowedDepts) {
    resource.allowedDepts = depts.map(d => d.key);
  }

  container.innerHTML = depts.map(d => {
    const isChecked = resource.allowedDepts.includes(d.key);
    return `
      <label class="checkbox-label" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 500; cursor: pointer;">
        <input type="checkbox" class="perm-dept-checkbox" value="${d.key}" ${isChecked ? "checked" : ""}>
        <span>${d.name}</span>
      </label>
    `;
  }).join("");

  openDialog("modal-permissions");
}

function showEncryptionCertificate(doc, sig) {
  const container = document.getElementById("encryption-cert-content");
  if (!container) return;

  const checksum = sha256Mock(doc.name + doc.size);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) + " " + now.toLocaleTimeString();

  container.innerHTML = `
    <div class="encryption-certificate" style="border: 2px double var(--navy); border-radius: 12px; padding: 1.5rem; background: #070D19; color: #E2E8F0; font-family: var(--font-sans); position: relative; overflow: hidden; box-shadow: var(--shadow-lg);">
      <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <div style="font-size: 0.7rem; font-weight: 700; color: var(--accent-blue); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 0.25rem;">ODISHA HYDRO POWER CORP LTD.</div>
        <div style="font-size: 1.15rem; font-weight: 800; color: #FFFFFF; font-family: var(--font-sans);">CRYPTOGRAPHIC ENVELOPE RECORD</div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.8rem; line-height: 1.6;">
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem;">
          <span style="color: var(--text-muted); font-weight: 600;">Resource:</span>
          <strong style="color: #FFFFFF; font-family: var(--font-mono); font-size: 0.75rem; word-break: break-all;">${doc.name}</strong>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem;">
          <span style="color: var(--text-muted); font-weight: 600;">Resource ID:</span>
          <span style="font-family: var(--font-mono);">${doc.id}</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem;">
          <span style="color: var(--text-muted); font-weight: 600;">Security Level:</span>
          <span class="badge-classification ${doc.classification.toLowerCase()}" style="font-size: 0.65rem; padding: 0.1rem 0.4rem; display: inline-block; width: fit-content; text-align: center;">${doc.classification}</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem;">
          <span style="color: var(--text-muted); font-weight: 600;">Cipher Suite:</span>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #34D399;">AES-256-GCM / RSA-4096 / RSASSA-PSS</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem;">
          <span style="color: var(--text-muted); font-weight: 600;">SHA256 Checksum:</span>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: #60A5FA; word-break: break-all;">SHA256:${checksum}</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem;">
          <span style="color: var(--text-muted); font-weight: 600;">Wrapped Key:</span>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: #F59E0B; word-break: break-all;">0x${sha256Mock("aes-key-" + doc.id).substring(0, 32)}...</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.75rem;">
          <span style="color: var(--text-muted); font-weight: 600;">Digital Signature:</span>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: #10B981; word-break: break-all;">0x${sig}</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem; font-size: 0.75rem;">
          <span style="color: var(--text-muted); font-weight: 600;">Signed By:</span>
          <span>${doc.author} (${state.currentUser.role.replace("_", " ")})</span>
        </div>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem; font-size: 0.75rem;">
          <span style="color: var(--text-muted); font-weight: 600;">Signed Time:</span>
          <span>${dateStr}</span>
        </div>
      </div>
      <div style="position: absolute; right: 10px; bottom: 10px; opacity: 0.04; transform: rotate(-15deg); color: #FFFFFF;">
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
    </div>
  `;

  openDialog("modal-encryption-cert");
}
