/* ===================================================
   Aarti TalentForge — AI Resume Intelligence
   Client-side, department-aware resume scoring engine.
   =================================================== */

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/* ===================================================
   DEPARTMENT PROFILES
   Each department is scored against the work that
   actually happens there:
     core   — primary domain skills (highest weight)
     tools  — software / equipment / systems
     certs  — qualifications & certifications
     titles — relevant job titles (role-fit bonus)
     fields — relevant education streams
   =================================================== */
const DEPARTMENTS = {
  rollingmill: {
    name: 'Rolling Mill', emoji: '🔩',
    blurb: 'Hot & cold rolling, bar/wire mills and mill operations.',
    hint: 'Looks for mill operation, rolling, reheating furnace, TMT/wire rod, pass schedule and roll-shop experience.',
    core: ['rolling mill','hot rolling','cold rolling','wire rod','tmt','bar mill','reheating furnace',
      'rolling','mill operation','pass schedule','roll change','finishing mill','rolling stand','roll shop',
      'tolerance','rolling speed','descaling','cooling bed','shearing','tundish'],
    tools: ['plc','scada','level 2 automation','caliper','micrometer','hmi'],
    certs: ['iso 9001','six sigma','diploma mechanical','b.tech metallurgy','b.tech mechanical'],
    titles: ['mill operator','rolling engineer','shift incharge','production engineer','mill manager'],
    fields: ['metallurgy','mechanical','production','industrial']
  },
  sms: {
    name: 'Steel Melting Shop (SMS)', emoji: '🔥',
    blurb: 'EAF/induction melting, ladle metallurgy & continuous casting.',
    hint: 'Looks for melting, EAF, induction furnace, ladle refining, continuous casting and tapping experience.',
    core: ['steel melting','melting shop','sms','electric arc furnace','eaf','induction furnace','ladle furnace',
      'continuous casting','ccm','tapping','deoxidation','ladle metallurgy','tundish','billet','bloom','slag',
      'refractory','tapping temperature','alloy addition','scrap charging'],
    tools: ['plc','scada','spectrometer','level 2 automation'],
    certs: ['iso 9001','b.tech metallurgy','diploma metallurgy','six sigma'],
    titles: ['furnace operator','sms engineer','melt shop incharge','caster operator'],
    fields: ['metallurgy','mechanical','production']
  },
  metallurgy: {
    name: 'Metallurgy & Quality (QA/QC)', emoji: '🔬',
    blurb: 'Metallurgical testing, quality control and material certification.',
    hint: 'Looks for metallurgy, spectrometer, UTM, microstructure, heat treatment, inspection and QMS.',
    core: ['metallurgy','quality control','quality assurance','qa','qc','inspection','spectrometer','utm',
      'tensile test','hardness test','microstructure','heat treatment','metallography','non destructive testing',
      'ndt','ultrasonic testing','material testing','calibration','iso 9001','spc','root cause analysis'],
    tools: ['minitab','spectrometer','utm','hardness tester','microscope'],
    certs: ['iso 9001','iso 17025','six sigma','asnt','b.tech metallurgy'],
    titles: ['quality engineer','metallurgist','qa engineer','lab incharge','quality manager'],
    fields: ['metallurgy','materials','chemistry','mechanical']
  },
  powerplant: {
    name: 'Power Plant', emoji: '⚡',
    blurb: 'Captive power, boilers, turbines and electrical generation.',
    hint: 'Looks for boiler, turbine, BOP, captive power, DCS operation and electrical/thermal background.',
    core: ['power plant','boiler','turbine','captive power','thermal power','generator','dcs','bop',
      'steam','condenser','cooling tower','switchyard','transformer','feed water','combustion','coal handling',
      'load management','power generation','electrical maintenance','boiler operation','co-generation'],
    tools: ['dcs','scada','plc','pms','sap pm'],
    certs: ['boiler operation engineer','boe','b.tech electrical','b.tech mechanical','diploma electrical'],
    titles: ['power plant engineer','boiler operator','turbine operator','shift charge engineer','electrical engineer'],
    fields: ['electrical','mechanical','power','thermal']
  },
  maintenance: {
    name: 'Maintenance & Engineering', emoji: '🛠️',
    blurb: 'Mechanical, electrical & instrumentation maintenance.',
    hint: 'Looks for preventive/breakdown maintenance, hydraulics, PLC, motors, drives and reliability work.',
    core: ['maintenance','preventive maintenance','breakdown maintenance','mechanical maintenance',
      'electrical maintenance','instrumentation','hydraulics','pneumatics','bearings','gearbox','motor',
      'vfd','drives','lubrication','vibration analysis','reliability','tpm','overhauling','alignment','welding'],
    tools: ['plc','scada','sap pm','cmms','autocad'],
    certs: ['b.tech mechanical','b.tech electrical','diploma mechanical','diploma electrical','tpm'],
    titles: ['maintenance engineer','mechanical engineer','electrical engineer','instrumentation engineer','maintenance manager'],
    fields: ['mechanical','electrical','instrumentation','mechatronics']
  },
  cybersecurity: {
    name: 'Cyber Security', emoji: '🛡️',
    blurb: 'OT/IT security, SOC, threat detection and compliance.',
    hint: 'Looks for SIEM, firewall, VAPT, SOC, ISO 27001, incident response and OT security.',
    core: ['cyber security','information security','network security','firewall','siem','soc','vapt',
      'penetration testing','vulnerability assessment','incident response','threat detection','endpoint security',
      'ids','ips','encryption','iso 27001','security audit','phishing','malware analysis','ot security','zero trust'],
    tools: ['splunk','wireshark','nessus','crowdstrike','palo alto','fortinet','kali linux','qualys'],
    certs: ['ceh','cissp','comptia security+','iso 27001','oscp','cisa'],
    titles: ['security analyst','soc analyst','cyber security engineer','infosec specialist','security architect'],
    fields: ['computer','information technology','cyber','electronics']
  },
  it: {
    name: 'Computer Science & Information Technology (CSE/IT)',
    emoji: '💻',
    blurb: 'Software development, AI/ML, web development, databases and cloud technologies.',
    hint: 'Looks for programming languages, frameworks, databases, developer tools and AI/ML skills.',
    core: [
      'c','c++','python','javascript','html','css','sql','react','node.js','django','mysql','mongodb','github','aws', 'numpy','pandas','matplotlib','scikit-learn','tensorflow','opencv'
    ],
    tools: [
      'visual studio code','figma','canva','vercel'
    ],
    certs: [
      'aws certified','azure certified','ccna','oracle certified', 'nptel'
    ],
    titles: [
      'software engineer','software developer','web developer','full stack developer','frontend developer','backend developer', 'python developer','ai engineer','machine learning engineer', 'data analyst','data scientist','AI-ML-engineer' 
    ],
    fields: [
      'computer science','information technology','software engineering','artificial intelligence','data science','b.tech cse','b.tech it','bca','mca'
    ]
  },
  sap: {
    name: 'SAP', emoji: '🧩',
    blurb: 'SAP ERP implementation, support and module configuration.',
    hint: 'Looks for SAP modules (MM/SD/PP/FICO/ABAP), S/4HANA, configuration and end-to-end implementation.',
    core: ['sap','sap mm','sap sd','sap pp','sap fico','sap fi','sap co','sap abap','sap basis','sap hana',
      's/4hana','sap qm','sap pm','sap implementation','configuration','end to end implementation','blueprint',
      'erp','functional consultant','idoc','user acceptance testing','gap analysis'],
    tools: ['sap gui','solution manager','fiori','lsmw','abap'],
    certs: ['sap certified','sap mm certification','sap fico certification','itil','mba'],
    titles: ['sap consultant','sap functional consultant','sap abap consultant','sap analyst','erp consultant'],
    fields: ['computer','information technology','commerce','engineering']
  },
  finance: {
    name: 'Account & Finance', emoji: '📈',
    blurb: 'Accounting, taxation, audit, costing and treasury.',
    hint: 'Looks for accounting, GST/TDS, finalisation, audit, costing, SAP FICO and CA/CMA/MBA finance.',
    core: ['accounting','finance','tally','gst','tds','taxation','audit','balance sheet','finalisation','costing',
      'budgeting','financial analysis','reconciliation','accounts payable','accounts receivable','payroll',
      'forecasting','compliance','cash flow','treasury','invoicing','ledger','statutory audit'],
    tools: ['tally','sap fico','ms excel','quickbooks','oracle financials','zoho books'],
    certs: ['ca','cma','cs','mba finance','m.com','icwa'],
    titles: ['accountant','finance executive','accounts manager','financial analyst','finance manager','auditor'],
    fields: ['commerce','finance','accounting','business']
  },
  procurement: {
    name: 'Procurement & Supply Chain', emoji: '🚚',
    blurb: 'Sourcing, purchase, inventory, dispatch and logistics.',
    hint: 'Looks for procurement, vendor management, inventory, SAP MM, negotiation and logistics planning.',
    core: ['procurement','purchase','supply chain','sourcing','vendor management','inventory','warehouse',
      'dispatch','logistics','negotiation','material planning','mrp','contract','rfq','purchase order',
      'cost reduction','freight','stock','import','export','vendor development'],
    tools: ['sap mm','erp','ms excel','ariba','oracle scm'],
    certs: ['cscp','cpm','mba operations','mba scm','diploma materials management'],
    titles: ['procurement engineer','purchase officer','supply chain executive','materials manager','logistics manager'],
    fields: ['mechanical','commerce','operations','business']
  },
  safety: {
    name: 'Safety & Environment (EHS)', emoji: '🦺',
    blurb: 'Industrial safety, environment, fire and statutory compliance.',
    hint: 'Looks for EHS, ISO 45001/14001, hazard analysis, risk assessment, fire safety and audits.',
    core: ['safety','health safety environment','ehs','industrial safety','hazard identification','risk assessment',
      'hira','iso 45001','iso 14001','fire safety','ppe','safety audit','incident investigation','permit to work',
      'environment','effluent','pollution control','first aid','toolbox talk','safety training','mock drill'],
    tools: ['ms excel','ehs software','iso documentation'],
    certs: ['nebosh','iosh','adis','pdis','iso 45001','b.tech'],
    titles: ['safety officer','ehs engineer','safety manager','environment officer','fire officer'],
    fields: ['safety','environment','mechanical','chemical']
  },
  ppc: {
    name: 'Production Planning (PPC)', emoji: '🗓️',
    blurb: 'Production scheduling, capacity planning and dispatch control.',
    hint: 'Looks for production planning, scheduling, MRP, capacity planning, ERP and coordination.',
    core: ['production planning','ppc','scheduling','capacity planning','mrp','demand planning','dispatch planning',
      'order management','inventory control','lean manufacturing','kaizen','5s','line balancing','forecasting',
      'shop floor coordination','oee','production control','master production schedule'],
    tools: ['sap pp','erp','ms excel','ms project'],
    certs: ['mba operations','six sigma','apics','b.tech production','diploma'],
    titles: ['ppc engineer','production planner','planning executive','ppc manager'],
    fields: ['production','industrial','mechanical','operations']
  },
  hr: {
    name: 'Human Resources', emoji: '🧑‍💼',
    blurb: 'Recruitment, payroll, IR, training and compliance.',
    hint: 'Looks for recruitment, payroll, HRMS, labour law, employee relations and statutory compliance.',
    core: ['recruitment','talent acquisition','onboarding','payroll','employee relations','industrial relations',
      'training','hrms','performance management','labour law','compensation','sourcing','interviewing','grievance',
      'attendance','statutory compliance','engagement','induction','hr policy','exit formalities','pf esi'],
    tools: ['hrms','sap hr','ms excel','naukri','linkedin recruiter','greythr'],
    certs: ['mba hr','pgdm hr','shrm','labour law certification'],
    titles: ['hr executive','hr manager','recruiter','hr business partner','ir manager'],
    fields: ['human resource','business','psychology','management']
  },
  sales: {
    name: 'Sales & Marketing', emoji: '📣',
    blurb: 'B2B steel sales, dealer network and business development.',
    hint: 'Looks for B2B sales, business development, CRM, dealer/channel management and negotiation.',
    core: ['sales','marketing','b2b','business development','crm','negotiation','client relationship',
      'lead generation','target achievement','channel sales','dealer management','distribution','market analysis',
      'export sales','key account','revenue growth','pricing','tender','steel sales'],
    tools: ['crm','salesforce','ms excel','zoho crm'],
    certs: ['mba marketing','pgdm','bba'],
    titles: ['sales executive','business development manager','area sales manager','marketing manager','key account manager'],
    fields: ['marketing','business','commerce','management']
  }
};

/* education / general banks */
const EDU = {
  doctorate: ['phd','ph.d','doctorate'],
  masters: ['master','m.tech','mtech','mba','m.com','msc','m.sc','mca','pgdm','me ','m.e.'],
  bachelors: ['bachelor','b.tech','btech','b.e','b.e.','be ','b.com','bsc','b.sc','bba','engineering','degree'],
  diploma: ['diploma','iti','polytechnic']
};
const ACTION_VERBS = ['managed','led','developed','implemented','increased','reduced','improved','achieved',
  'delivered','optimized','optimised','supervised','executed','coordinated','designed','maintained','operated',
  'commissioned','installed','reduced','streamlined','spearheaded','handled','monitored','trained'];
const METRIC_RE = /(\d{1,3}(?:[.,]\d+)?\s*%)|(₹\s?\d)|(rs\.?\s?\d)|(\d+\s*(?:mt|tonnes?|tons?|tpd|tph|crore|lakh|kw|mw|kg))/gi;
const CONTACT = {
  email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
  phone: /(\+?\d[\d\s-]{8,}\d)/,
  linkedin: /linkedin\.com\/[a-z0-9-]+/i
};

/* universe of all known skills/tools/certs across departments (for JD parsing) */
const ALL_SKILLS = [...new Set(Object.values(DEPARTMENTS)
  .flatMap(d => [...d.core, ...d.tools, ...d.certs]))];
const STOPWORDS = new Set(('the a an and or of to in for with on at by from as is are be will should must has have we you our your they their this that role job description responsibilities requirements candidate company team work working experience years year strong good excellent ability able knowledge skills skill etc plus preferred required must-have including include such per across using used use within into out over under more most than then also can may').split(/\s+/));

/* derive the important keywords from a pasted job description */
function extractJDKeywords(jd) {
  const lower = jd.toLowerCase();
  const keys = new Set();
  // 1) known multi-word skills present in the JD (most reliable)
  ALL_SKILLS.forEach(sk => { if (lower.includes(sk.toLowerCase())) keys.add(sk); });
  // 2) frequent significant single tokens from the JD
  const freq = {};
  (lower.match(/[a-z][a-z+#.]{2,}/g) || []).forEach(t => {
    if (STOPWORDS.has(t) || t.length < 4) return;
    freq[t] = (freq[t] || 0) + 1;
  });
  Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 16).forEach(([t]) => keys.add(t));
  return [...keys].slice(0, 28);
}

/* ===================================================
   BACKEND API (Django REST Framework)
   The candidate pool used to live only in localStorage.
   It now lives in the Django database at /api/candidates/ so the whole
   HR team shares one pool. `candidates` below is still a plain in-memory
   array (same as before) — it's just loaded from and synced to the API
   instead of localStorage, so every render*()/build*() function in this
   file that reads/writes `candidates` needed no changes at all.
   =================================================== */
const API_BASE = '/api/candidates/';

async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  let data = null;
  try { data = await res.json(); } catch { /* e.g. empty body on some DELETEs */ }
  if (!res.ok) {
    const err = new Error((data && data.detail) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
const apiGet = (url) => apiRequest(url);
const apiPost = (url, body) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) });
const apiPatch = (url, body) => apiRequest(url, { method: 'PATCH', body: JSON.stringify(body) });
const apiDelete = (url) => apiRequest(url, { method: 'DELETE' });

/* ---------- State ---------- */
const STAGES = ['New', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
const ACTIVE_STAGES = ['Shortlisted', 'Interview', 'Selected']; // counts as "in pipeline"
let candidates = [];
let currentAnalysis = null;
let resumeText = '';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* Load the pool from the backend once on startup, then re-render whatever
   is currently on screen. Called from the Init block near the bottom. */
async function loadCandidates() {
  try {
    candidates = await apiGet(API_BASE);
  } catch (err) {
    candidates = [];
    toast('Could not reach the server — showing an empty pool.');
    console.error(err);
  }
  updateHeroStats();
  const activePanel = document.querySelector('.tab-panel.active');
  if (activePanel && activePanel.id === 'pool') renderPool();
  if (activePanel && activePanel.id === 'analytics') renderAnalytics();
}

function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._tid); t._tid = setTimeout(() => t.classList.remove('show'), 2600);
}
function scoreColor(s) {
  if (s >= 80) return 'var(--green)';
  if (s >= 65) return 'var(--blue)';
  if (s >= 50) return 'var(--amber)';
  return 'var(--red)';
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/* ---------- Tabs ---------- */
function activateTab(id) {
  $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === id));
  $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.tab === id));
  $('#mainNav').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // ensure reveal items in the now-visible panel show even if observer missed them
  const panel = document.getElementById(id);
  if (panel) setTimeout(() => $$('.reveal', panel).forEach(e => e.classList.add('in')), 60);
  if (id === 'pool') renderPool();
  if (id === 'analytics') renderAnalytics();
}
document.addEventListener('click', e => {
  const link = e.target.closest('[data-tab]');
  if (link) { e.preventDefault(); activateTab(link.dataset.tab); }
  const goto = e.target.closest('[data-goto]');
  if (goto) { e.preventDefault(); activateTab(goto.dataset.goto); }
});
$('#navToggle').addEventListener('click', () => $('#mainNav').classList.toggle('open'));

/* ---------- Init departments ---------- */
function initDepartments() {
  const sel = $('#deptSelect'), filterSel = $('#filterDept'), grid = $('#deptGrid'), bulkSel = $('#bulkDept');
  Object.entries(DEPARTMENTS).forEach(([key, d]) => {
    sel.insertAdjacentHTML('beforeend', `<option value="${key}">${d.emoji} ${d.name}</option>`);
    filterSel.insertAdjacentHTML('beforeend', `<option value="${key}">${d.name}</option>`);
    if (bulkSel) bulkSel.insertAdjacentHTML('beforeend', `<option value="${key}">${d.emoji} ${d.name}</option>`);
    grid.insertAdjacentHTML('beforeend', `
      <div class="dept-tile reveal">
        <div class="dept-emoji">${d.emoji}</div>
        <h4>${d.name}</h4>
        <p>${d.blurb}</p>
      </div>`);
  });
  $('[data-stat="depts"]').textContent = Object.keys(DEPARTMENTS).length;
  updateDeptHint();
  sel.addEventListener('change', updateDeptHint);
}
function updateDeptHint() {
  const d = DEPARTMENTS[$('#deptSelect').value];
  $('#deptHint').textContent = d ? d.hint : '';
}

/* ===================================================
   ADVANCED SCORING ENGINE  (8 weighted dimensions)
   Core 30 · Tools 12 · Certs 8 · Experience 16 ·
   Education 14 · Achievements 8 · Contact 6 · Structure 6
   =================================================== */
function matchList(lower, list) {
  const found = [], missing = [];
  list.forEach(item => (lower.includes(item.toLowerCase()) ? found : missing).push(item));
  return { found, missing };
}

function analyzeResume(text, deptKey, minExp, jdText) {
  const lower = text.toLowerCase();
  const dept = DEPARTMENTS[deptKey];
  const wordCount = (text.match(/\b[\w.+#]+\b/g) || []).length;

  // 1 — Core domain skills (30), blended with a Job Description when provided
  const coreM = matchList(lower, dept.core);
  const deptRatio = coreM.found.length / dept.core.length;
  let jdMatched = [], jdRatio = 0, jdUsed = false;
  if (jdText && jdText.trim().length > 25) {
    jdUsed = true;
    const jdKeys = extractJDKeywords(jdText);
    const jdM = matchList(lower, jdKeys);
    jdMatched = jdM.found;
    jdRatio = jdKeys.length ? jdM.found.length / jdKeys.length : 0;
  }
  const blended = jdUsed ? (deptRatio * 0.5 + jdRatio * 0.5) : deptRatio;
  const coreScore = Math.round(blended * 30);

  // 2 — Tools / systems (12)
  const toolM = matchList(lower, dept.tools);
  const toolScore = Math.round((toolM.found.length / Math.max(1, dept.tools.length)) * 12);

  // 3 — Certifications (8)
  const certM = matchList(lower, dept.certs);
  const certScore = Math.min(8, certM.found.length * 3);

  // 4 — Experience (16)
  let years = 0;
  [...lower.matchAll(/(\d{1,2})\s*\+?\s*(?:years|yrs|year)/g)].forEach(m => { years = Math.max(years, +m[1]); });
  let expScore;
  if (minExp <= 0) expScore = years > 0 ? 16 : 9;
  else expScore = Math.min(16, Math.round((years / minExp) * 16));
  if (years === 0) expScore = Math.min(expScore, 6);

  // 5 — Education + field relevance (14)
  let eduScore = 0, eduLevel = 'Not detected';
  if (EDU.doctorate.some(k => lower.includes(k))) { eduScore = 11; eduLevel = 'Doctorate'; }
  else if (EDU.masters.some(k => lower.includes(k))) { eduScore = 10; eduLevel = "Master's"; }
  else if (EDU.bachelors.some(k => lower.includes(k))) { eduScore = 8; eduLevel = "Bachelor's"; }
  else if (EDU.diploma.some(k => lower.includes(k))) { eduScore = 5; eduLevel = 'Diploma/ITI'; }
  const fieldMatch = dept.fields.some(f => lower.includes(f));
  if (eduScore && fieldMatch) eduScore = Math.min(14, eduScore + 3);

  // 6 — Achievements / impact (8) — action verbs + quantified metrics
  const verbHits = ACTION_VERBS.filter(v => lower.includes(v)).length;
  const metricHits = (text.match(METRIC_RE) || []).length;
  let achScore = Math.min(4, verbHits) + Math.min(4, metricHits * 2);
  achScore = Math.min(8, achScore);

  // 7 — Contact completeness (6)
  let contactScore = 0; const contacts = [];
  if (CONTACT.email.test(text)) { contactScore += 3; contacts.push('email'); }
  if (CONTACT.phone.test(text)) { contactScore += 2; contacts.push('phone'); }
  if (CONTACT.linkedin.test(text)) { contactScore += 1; contacts.push('linkedin'); }

  // 8 — Structure / readability (6)
  const sectionWords = ['experience','education','skills','project','summary','objective','certification','achievement','responsibilities'];
  const sectionHits = sectionWords.filter(s => lower.includes(s)).length;
  let structScore = Math.min(3, Math.ceil(sectionHits / 2));
  if (wordCount >= 200 && wordCount <= 1400) structScore += 3;
  else if (wordCount > 80) structScore += 1;
  structScore = Math.min(6, structScore);

  const total = Math.min(100, coreScore + toolScore + certScore + expScore + eduScore + achScore + contactScore + structScore);

  let verdict, vcolor;
  if (total >= 80) { verdict = 'Excellent Fit'; vcolor = 'var(--green)'; }
  else if (total >= 65) { verdict = 'Strong Candidate'; vcolor = 'var(--blue)'; }
  else if (total >= 50) { verdict = 'Average — Review'; vcolor = 'var(--amber)'; }
  else { verdict = 'Below Threshold'; vcolor = 'var(--red)'; }

  // matched / missing display sets
  const matched = [...coreM.found, ...toolM.found, ...certM.found];
  const missing = [...coreM.missing.slice(0, 8), ...toolM.missing.slice(0, 3)];

  // AI insights
  const insights = buildInsights({ dept, coreM, toolM, certM, years, minExp, eduLevel, fieldMatch, metricHits, verbHits, contacts, total, jdUsed, jdMatched });

  return {
    total, verdict, vcolor, matched, missing, years, wordCount, contacts, eduLevel, fieldMatch,
    jdUsed, jdMatched,
    coreRatio: Math.round((coreM.found.length / dept.core.length) * 100),
    breakdown: [
      { label: 'Core Skills', score: coreScore, max: 30 },
      { label: 'Tools & Systems', score: toolScore, max: 12 },
      { label: 'Certifications', score: certScore, max: 8 },
      { label: 'Experience', score: expScore, max: 16 },
      { label: 'Education', score: eduScore, max: 14 },
      { label: 'Achievements / Impact', score: achScore, max: 8 },
      { label: 'Contact Info', score: contactScore, max: 6 },
      { label: 'Structure', score: structScore, max: 6 }
    ],
    insights
  };
}

function buildInsights(d) {
  const out = [];
  if (d.coreM.found.length >= d.dept.core.length * 0.5)
    out.push(['✅', `Strong domain alignment — matched ${d.coreM.found.length} core ${d.dept.name} skills.`]);
  else
    out.push(['⚠️', `Limited core skill coverage for ${d.dept.name}. Consider only if other strengths compensate.`]);

  if (d.years) out.push(['📅', `Detected ${d.years} yr(s) of experience${d.minExp ? ` against a ${d.minExp} yr requirement.` : '.'}`]);
  else out.push(['❓', 'No clear years-of-experience statement found in the resume.']);

  if (d.eduLevel !== 'Not detected')
    out.push([d.fieldMatch ? '🎓' : 'ℹ️', `${d.eduLevel} qualification${d.fieldMatch ? ' in a relevant field.' : ' (field relevance not detected).'}`]);
  else out.push(['⚠️', 'Education level could not be detected.']);

  if (d.certM.found.length) out.push(['🏅', `Relevant certifications found: ${d.certM.found.join(', ')}.`]);
  if (d.jdUsed) out.push([d.jdMatched.length >= 4 ? '🎯' : '⚠️', `Job-description match: ${d.jdMatched.length} key requirement(s) found in the resume.`]);
  if (d.metricHits) out.push(['📈', `Resume shows ${d.metricHits} quantified result(s) — good evidence of impact.`]);
  else out.push(['💡', 'Tip: candidate could strengthen the resume with measurable achievements.']);

  if (d.contacts.length < 2) out.push(['📞', 'Incomplete contact details — verify email/phone before shortlisting.']);
  return out;
}

/* ===================================================
   FILE HANDLING
   =================================================== */
async function extractText(file) {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let txt = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      txt += content.items.map(it => it.str).join(' ') + '\n';
    }
    return txt;
  }
  return await file.text();
}

async function handleFile(file) {
  const status = $('#fileStatus');
  status.classList.remove('err');
  status.textContent = `Reading "${file.name}"...`;
  try {
    const text = await extractText(file);
    if (!text || text.trim().length < 30) throw new Error('Could not read enough text (scanned image PDFs are not supported — use the paste option).');
    resumeText = text;
    $('#pasteArea').value = text.slice(0, 5000);
    status.textContent = `✓ Loaded "${file.name}" (${(text.match(/\b\w+\b/g) || []).length} words)`;
    $('#analyzeBtn').disabled = false;
    applyParsedInfo(text, file.name);
  } catch (err) {
    status.classList.add('err'); status.textContent = '✗ ' + err.message;
    resumeText = ''; $('#analyzeBtn').disabled = true;
  }
}

const dz = $('#dropzone'), fileInput = $('#fileInput');
dz.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
['dragover','dragenter'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('drag'); }));
['dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('drag'); }));
dz.addEventListener('drop', e => { if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
$('#pasteArea').addEventListener('input', e => {
  const v = e.target.value.trim();
  resumeText = v;
  $('#analyzeBtn').disabled = v.length <= 30;
});

/* auto-detect email/phone from the resume to save HR typing */
function prefillContacts(text) {
  const found = [];
  const em = text.match(CONTACT.email);
  const ph = text.match(CONTACT.phone);
  if (em && !$('#candEmail').value) { $('#candEmail').value = em[0]; found.push('email'); }
  if (ph && !$('#candPhone').value) { $('#candPhone').value = ph[0].trim(); found.push('phone'); }
  $('#contactPrefill').textContent = found.length ? `Auto-detected ${found.join(' & ')} from the resume — please verify.` : '';
}

/* ---------- Smarter parsing: name, contacts, experience ---------- */
function guessName(text, email, fileName) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0, 8);
  const bad = /resume|curriculum|vitae|profile|summary|objective|email|e-mail|phone|mobile|tel|contact|address|linkedin|github|@|http|www|\d{4}/i;
  for (const l of lines) {
    if (bad.test(l) || l.length > 40) continue;
    const words = l.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && words.every(w => /^[A-Za-z][A-Za-z.'-]*$/.test(w))) {
      return l.replace(/\b\w/g, c => c.toUpperCase());
    }
  }
  if (email) {
    const lp = email.split('@')[0].replace(/[._\d]+/g, ' ').trim();
    if (lp && lp.length > 2) return lp.replace(/\b\w/g, c => c.toUpperCase());
  }
  if (fileName) {
    const g = fileName.replace(/\.(pdf|txt)$/i, '').replace(/[_-]+/g, ' ').replace(/resume|cv|final|updated/gi, '').trim();
    if (g) return g.replace(/\b\w/g, c => c.toUpperCase());
  }
  return '';
}
function extractCandidateInfo(text, fileName) {
  const em = text.match(CONTACT.email);
  const ph = text.match(CONTACT.phone);
  let years = 0;
  [...text.toLowerCase().matchAll(/(\d{1,2})\s*\+?\s*(?:years|yrs|year)/g)].forEach(m => { years = Math.max(years, +m[1]); });
  return {
    name: guessName(text, em ? em[0] : '', fileName),
    email: em ? em[0] : '',
    phone: ph ? ph[0].trim() : '',
    years
  };
}
function applyParsedInfo(text, fileName) {
  const info = extractCandidateInfo(text, fileName);
  const found = [];
  if (info.name && !$('#candName').value) $('#candName').value = info.name;
  if (info.email && !$('#candEmail').value) { $('#candEmail').value = info.email; found.push('email'); }
  if (info.phone && !$('#candPhone').value) { $('#candPhone').value = info.phone; found.push('phone'); }
  $('#contactPrefill').textContent =
    (info.name ? `Detected name "${info.name}"` : 'Name not auto-detected') +
    (found.length ? ` · auto-filled ${found.join(' & ')}` : '') + ' — please verify.';
}

/* ===================================================
   ANALYZE + RENDER
   =================================================== */
$('#analyzeBtn').addEventListener('click', () => {
  if (!resumeText || resumeText.trim().length < 30) { toast('Please upload or paste a resume first.'); return; }
  const deptKey = $('#deptSelect').value;
  const minExp = parseInt($('#minExp').value, 10) || 0;
  const jdText = $('#jdText') ? $('#jdText').value : '';
  const btn = $('#analyzeBtn');
  const overlay = $('#scanOverlay');

  // brief live "scanning" pass for a processing feel
  btn.disabled = true; btn.textContent = 'Analyzing…';
  $('#resultEmpty').hidden = true;
  overlay.hidden = false;

  setTimeout(() => {
    try {
      currentAnalysis = analyzeResume(resumeText, deptKey, minExp, jdText);
      currentAnalysis.dept = deptKey;
      currentAnalysis.name = $('#candName').value.trim() || 'Unnamed Candidate';
      renderResult(currentAnalysis);
    } catch (err) {
      console.error('Analysis failed:', err);
      toast('Something went wrong while analyzing. Please try again.');
      $('#resultEmpty').hidden = false;
    } finally {
      overlay.hidden = true;
      btn.disabled = false; btn.textContent = 'Analyze Resume';
    }
  }, 950);
});

function renderResult(a) {
  $('#resultEmpty').hidden = true;
  $('#resultBody').hidden = false;

  const circ = 2 * Math.PI * 52;
  const ring = $('#ringFg');
  ring.style.stroke = a.vcolor;
  setTimeout(() => { ring.style.strokeDashoffset = circ * (1 - a.total / 100); }, 60);

  const numEl = $('#scoreNum');
  let n = 0; clearInterval(numEl._iv);
  numEl._iv = setInterval(() => { n += 2; if (n >= a.total) { n = a.total; clearInterval(numEl._iv); } numEl.textContent = n; }, 16);

  $('#verdict').innerHTML = `<span class="pill" style="background:${a.vcolor}">${a.verdict}</span>`;
  $('#metaLine').innerHTML =
    `${DEPARTMENTS[a.dept].emoji} ${DEPARTMENTS[a.dept].name} · ${a.coreRatio}% core match` +
    `${a.years ? ' · ' + a.years + ' yrs exp' : ''} · ${a.eduLevel}` +
    `${a.jdUsed ? ' <span class="jd-active-badge">JD matched · ' + a.jdMatched.length + ' terms</span>' : ''}`;

  $('#breakdown').innerHTML = a.breakdown.map(b => `
    <div class="bd-row">
      <div class="bd-head"><span>${b.label}</span><b>${b.score}/${b.max}</b></div>
      <div class="bd-bar"><div class="bd-fill" data-w="${(b.score / b.max) * 100}"></div></div>
    </div>`).join('');
  setTimeout(() => $$('.bd-fill').forEach(f => f.style.width = f.dataset.w + '%'), 80);

  $('#insights').innerHTML = '<h4>AI Insights</h4><ul>' +
    a.insights.map(([ic, txt]) => `<li data-ic="${ic}">${escapeHtml(txt)}</li>`).join('') + '</ul>';

  $('#matchedChips').innerHTML = a.matched.length
    ? a.matched.map(s => `<span class="chip">${s}</span>`).join('')
    : '<span class="chip">No direct keywords found</span>';
  $('#missingChips').innerHTML = a.missing.length
    ? a.missing.map(s => `<span class="chip">${s}</span>`).join('')
    : '<span class="chip">All key skills present</span>';

  $('#hlText').innerHTML = highlightText(resumeText, a.matched);
}

/* highlight matched keywords inside a resume excerpt */
function highlightText(text, terms) {
  const excerpt = text.slice(0, 3500);
  let html = escapeHtml(excerpt);
  const uniq = [...new Set(terms)].sort((a, b) => b.length - a.length);
  uniq.forEach(t => {
    if (!t) return;
    const re = new RegExp('(' + escapeReg(escapeHtml(t)) + ')', 'gi');
    html = html.replace(re, '<mark>$1</mark>');
  });
  if (text.length > 3500) html += ' …';
  return html;
}

$('#rescanBtn').addEventListener('click', () => {
  resumeText = ''; currentAnalysis = null;
  ['pasteArea','candName','candPosition','candEmail','candPhone','candNotes','jdText'].forEach(id => { const el = $('#' + id); if (el) el.value = ''; });
  $('#candSource').selectedIndex = 0;
  $('#contactPrefill').textContent = '';
  $('#fileStatus').textContent = ''; fileInput.value = '';
  $('#resultBody').hidden = true; $('#resultEmpty').hidden = false;
  $('#analyzeBtn').disabled = true;
});

/* build a candidate record from an analysis + extra fields */
function buildCandidate(a, extra) {
  return Object.assign({
    name: a.name, dept: a.dept, score: a.total, verdict: a.verdict,
    skills: a.matched.slice(0, 4),
    matchedAll: a.matched.slice(0, 20),
    gaps: a.missing.slice(0, 10),
    years: a.years, edu: a.eduLevel,
    position: '', email: '', phone: '', source: 'Other', notes: '',
    date: new Date().toISOString(),
    stage: a.total >= 65 ? 'Shortlisted' : 'New'
  }, extra || {});
}

/* Saves one candidate to the backend, with the same duplicate-by-email
   confirm() flow the app had with localStorage. Returns 'added' | 'duplicate' | 'error'. */
async function addCandidate(cand) {
  try {
    const saved = await apiPost(API_BASE, cand);
    candidates.push(saved);
    return 'added';
  } catch (err) {
    if (err.status === 409) {
      if (confirm(`A candidate with email "${cand.email}" already exists. Add anyway as a duplicate?`)) {
        try {
          const saved = await apiPost(API_BASE, Object.assign({}, cand, { force: true }));
          candidates.push(saved);
          return 'added';
        } catch (e2) { console.error(e2); return 'error'; }
      }
      return 'duplicate';
    }
    console.error(err);
    return 'error';
  }
}

$('#saveBtn').addEventListener('click', async () => {
  if (!currentAnalysis) return;
  const a = currentAnalysis;
  const cand = buildCandidate(a, {
    position: $('#candPosition').value.trim(),
    email: $('#candEmail').value.trim(),
    phone: $('#candPhone').value.trim(),
    source: $('#candSource').value,
    notes: $('#candNotes').value.trim()
  });
  const result = await addCandidate(cand);
  if (result === 'added') {
    toast(`Saved "${a.name}" to the candidate pool.`);
    updateHeroStats();
  } else if (result === 'error') {
    toast('Could not save candidate — check your connection and try again.');
  }
});

/* ===================================================
   CANDIDATE POOL
   =================================================== */
function renderPool() {
  const dept = $('#filterDept').value;
  const minScore = parseInt($('#filterScore').value, 10);
  const stage = $('#filterStatus').value;
  const q = $('#searchBox').value.trim().toLowerCase();

  const list = candidates
    .filter(c => !dept || c.dept === dept)
    .filter(c => c.score >= minScore)
    .filter(c => !stage || c.stage === stage)
    .filter(c => !q || c.name.toLowerCase().includes(q) || (c.skills || []).join(' ').toLowerCase().includes(q))
    .sort((a, b) => b.score - a.score);

  renderDashboard();

  const body = $('#poolBody');
  $('#poolEmpty').style.display = list.length ? 'none' : 'block';
  const blind = isBlind();
  body.innerHTML = list.map((c, i) => {
    const d = DEPARTMENTS[c.dept];
    const chips = (c.skills || []).map(s => `<span class="mini-chip">${s}</span>`).join('') || '—';
    const opts = STAGES.map(s => `<option value="${s}" ${c.stage === s ? 'selected' : ''}>${s}</option>`).join('');
    const checked = compareSel.has(c.id) ? 'checked' : '';
    const name = blind ? maskName(c) : escapeHtml(c.name);
    const contactRow = (!blind && c.email)
      ? `<div class="cand-sub">✉ ${escapeHtml(c.email)}${c.phone ? ' · ☎ ' + escapeHtml(c.phone) : ''}</div>` : '';
    return `
      <tr>
        <td data-label=""><input type="checkbox" class="row-check" data-id="${c.id}" ${checked} /></td>
        <td data-label="Rank"><span class="rank-badge ${i === 0 ? 'top' : ''}">${i + 1}</span></td>
        <td data-label="Candidate">
          <div class="cand-name">${name}</div>
          <div class="cand-sub">${c.position ? escapeHtml(c.position) + ' · ' : ''}${c.years ? c.years + ' yrs · ' : ''}${c.edu || ''}</div>
          ${contactRow}
        </td>
        <td data-label="Department"><span class="dept-tag">${d ? d.emoji + ' ' + d.name : c.dept}</span></td>
        <td data-label="Score"><span class="score-tag" style="background:${scoreColor(c.score)}">${c.score}</span></td>
        <td data-label="Skills"><div class="mini-chips">${chips}</div></td>
        <td data-label="Stage">
          <select class="stage-select stage-${c.stage}" data-act="stage" data-id="${c.id}">${opts}</select>
        </td>
        <td data-label="">
          <button class="icon-btn" data-act="del" data-id="${c.id}" title="Remove">🗑️</button>
        </td>
      </tr>`;
  }).join('');
  updateCompareBtn();
}

/* HR Insights dashboard */
function renderDashboard() {
  const dash = $('#hrDash');
  const total = candidates.length;
  if (!total) { dash.innerHTML = ''; return; }
  const inPipeline = candidates.filter(c => ACTIVE_STAGES.includes(c.stage)).length;
  const selected = candidates.filter(c => c.stage === 'Selected').length;
  const avg = Math.round(candidates.reduce((s, c) => s + c.score, 0) / total);

  const bands = [
    { label: 'Excellent', min: 80, color: 'var(--green)' },
    { label: 'Strong', min: 65, max: 79, color: 'var(--blue)' },
    { label: 'Average', min: 50, max: 64, color: 'var(--amber)' },
    { label: 'Below', min: 0, max: 49, color: 'var(--red)' }
  ];
  const distRows = bands.map(b => {
    const n = candidates.filter(c => c.score >= b.min && (b.max === undefined || c.score <= b.max)).length;
    const pct = Math.round((n / total) * 100);
    return `<div class="dist-row"><span class="dl">${b.label}</span>
      <div class="dist-track"><div class="dist-fill" style="background:${b.color};width:0" data-w="${pct}"></div></div>
      <span class="dn">${n}</span></div>`;
  }).join('');

  dash.innerHTML = `
    <div class="kpi"><div class="kpi-val">${total}</div><div class="kpi-label">Total Candidates</div></div>
    <div class="kpi blue"><div class="kpi-val">${inPipeline}</div><div class="kpi-label">In Pipeline</div></div>
    <div class="kpi green"><div class="kpi-val">${selected}</div><div class="kpi-label">Selected</div></div>
    <div class="kpi amber"><div class="kpi-val">${avg}</div><div class="kpi-label">Avg. Score</div></div>
    <div class="dist-card"><h4>Score Distribution</h4>${distRows}</div>`;
  setTimeout(() => $$('.dist-fill', dash).forEach(f => f.style.width = f.dataset.w + '%'), 60);
}

$('#poolBody').addEventListener('change', async e => {
  const sel = e.target.closest('select[data-act="stage"]');
  if (!sel) return;
  const c = candidates.find(x => x.id === Number(sel.dataset.id));
  if (!c) return;
  const prevStage = c.stage;
  c.stage = sel.value; // optimistic UI update
  renderPool();
  try {
    const updated = await apiPatch(`${API_BASE}${c.id}/`, { stage: sel.value });
    Object.assign(c, updated);
  } catch (err) {
    c.stage = prevStage; // roll back on failure
    toast('Could not update stage — check your connection.');
    console.error(err);
  }
  renderPool(); updateHeroStats();
});

$('#poolBody').addEventListener('click', async e => {
  const btn = e.target.closest('button[data-act="del"]'); if (!btn) return;
  const id = Number(btn.dataset.id);
  try {
    await apiDelete(`${API_BASE}${id}/`);
    candidates = candidates.filter(x => x.id !== id);
    renderPool(); updateHeroStats();
  } catch (err) {
    toast('Could not remove candidate — check your connection.');
    console.error(err);
  }
});
['filterDept','filterScore','filterStatus','searchBox'].forEach(id => $('#' + id).addEventListener('input', renderPool));

$('#clearBtn').addEventListener('click', async () => {
  if (!candidates.length) { toast('Pool is already empty.'); return; }
  if (confirm('Remove ALL candidates from the pool? This cannot be undone.')) {
    try {
      await apiDelete(`${API_BASE}clear/`);
      candidates = []; renderPool(); updateHeroStats(); toast('Candidate pool cleared.');
    } catch (err) {
      toast('Could not clear the pool — check your connection.');
      console.error(err);
    }
  }
});

$('#exportBtn').addEventListener('click', exportCSV);

function exportCSV() {
  if (!candidates.length) { toast('Nothing to export.'); return; }
  const rows = [['Name','Position','Department','Score','Verdict','Experience(yrs)','Education','Email','Phone','Source','Stage','TopSkills','Notes','Date']];
  candidates.slice().sort((a, b) => b.score - a.score).forEach(c => {
    const d = DEPARTMENTS[c.dept];
    rows.push([c.name, c.position || '', d ? d.name : c.dept, c.score, c.verdict, c.years, c.edu || '',
      c.email || '', c.phone || '', c.source || '', c.stage || '',
      (c.skills || []).join(' | '), c.notes || '', new Date(c.date).toLocaleDateString()]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'aarti_talentforge_candidates.csv'; a.click();
  URL.revokeObjectURL(url);
  toast('Exported to CSV — ready for Google Sheets / Excel.');
}

/* ---------- Hero stats (animated count-up) ---------- */
function countTo(el, target) {
  const start = parseInt(el.textContent, 10) || 0;
  if (start === target) { el.textContent = target; return; }
  const steps = 28; let i = 0;
  clearInterval(el._iv);
  el._iv = setInterval(() => {
    i++; const v = Math.round(start + (target - start) * (i / steps));
    el.textContent = v;
    if (i >= steps) { el.textContent = target; clearInterval(el._iv); }
  }, 22);
}
function updateHeroStats() {
  const total = candidates.length;
  const shortlisted = candidates.filter(c => ACTIVE_STAGES.includes(c.stage)).length;
  const avg = total ? Math.round(candidates.reduce((s, c) => s + c.score, 0) / total) : 0;
  countTo($('[data-stat="total"]'), total);
  countTo($('[data-stat="shortlisted"]'), shortlisted);
  countTo($('[data-stat="avg"]'), avg);
}

/* ---------- Rotating department ticker ---------- */
function startTicker() {
  const el = $('#rotateWord'); if (!el) return;
  const names = Object.values(DEPARTMENTS).map(d => d.name);
  let i = 0;
  setInterval(() => {
    i = (i + 1) % names.length;
    el.classList.add('swap');
    setTimeout(() => { el.textContent = names[i]; el.classList.remove('swap'); }, 350);
  }, 2400);
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  els.forEach(e => io.observe(e));
}

/* ---------- Hero talent-network background ---------- */
function initHeroNetwork() {
  const canvas = $('#netCanvas');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes, raf;
  const COUNT = 46, LINK = 130;

  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = r.width; h = canvas.height = r.height;
  }
  function build() {
    nodes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35
    }));
  }
  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK) {
          ctx.strokeStyle = `rgba(61,164,240,${(1 - dist / LINK) * 0.32})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = 'rgba(116,194,255,0.8)';
      ctx.beginPath(); ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(step);
  }
  resize(); build(); step();
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); build(); step(); });
}

/* ---------- Init ---------- */
initDepartments();
loadCandidates(); // fetches from the Django backend, then calls updateHeroStats()/renderPool()
startTicker();
initReveal();
initHeroNetwork();

/* ===================================================
   v3 FEATURES
   =================================================== */

/* ---------- Blind screening ---------- */
const BLIND_KEY = 'aarti_blind';
function isBlind() { return document.body.classList.contains('blind'); }
function maskName(c) { return 'Candidate ' + (c.id || 0).toString(36).slice(-4).toUpperCase(); }
function initBlind() {
  const on = localStorage.getItem(BLIND_KEY) === '1';
  const t = $('#blindToggle');
  document.body.classList.toggle('blind', on);
  if (t) {
    t.checked = on;
    t.addEventListener('change', () => {
      document.body.classList.toggle('blind', t.checked);
      localStorage.setItem(BLIND_KEY, t.checked ? '1' : '0');
      renderPool();
      if (t.checked) openBlindModal();
      else openBlindOffModal();
    });
  }
  // explainer modal controls
  $$('[data-blind-close]').forEach(el => el.addEventListener('click', closeBlindModal));
  const keep = $('[data-blind-keep]');
  if (keep) keep.addEventListener('click', closeBlindModal);
  const off = $('[data-blind-off]');
  if (off) off.addEventListener('click', () => {
    const tog = $('#blindToggle');
    if (tog) tog.checked = false;
    document.body.classList.remove('blind');
    localStorage.setItem(BLIND_KEY, '0');
    renderPool();
    closeBlindModal();
    openBlindOffModal();
  });
  // OFF modal controls
  $$('[data-blindoff-close]').forEach(el => el.addEventListener('click', closeBlindOffModal));
  const reon = $('[data-blind-reon]');
  if (reon) reon.addEventListener('click', () => {
    const tog = $('#blindToggle');
    if (tog) tog.checked = true;
    document.body.classList.add('blind');
    localStorage.setItem(BLIND_KEY, '1');
    renderPool();
    closeBlindOffModal();
    openBlindModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeBlindModal(); closeBlindOffModal(); } });
}
function openBlindModal() {
  const m = $('#blindModal');
  if (m) m.hidden = false;
}
function closeBlindModal() {
  const m = $('#blindModal');
  if (m) m.hidden = true;
}
function openBlindOffModal() {
  const m = $('#blindModalOff');
  if (m) m.hidden = false;
}
function closeBlindOffModal() {
  const m = $('#blindModalOff');
  if (m) m.hidden = true;
}

/* ---------- Side-by-side comparison ---------- */
const compareSel = new Set();
function updateCompareBtn() {
  const btn = $('#compareBtn'); if (!btn) return;
  btn.textContent = `Compare (${compareSel.size})`;
  btn.disabled = !(compareSel.size === 2 || compareSel.size === 3);
}
$('#poolBody').addEventListener('change', e => {
  const chk = e.target.closest('.row-check'); if (!chk) return;
  const id = Number(chk.dataset.id);
  if (chk.checked) {
    if (compareSel.size >= 3) { chk.checked = false; toast('Compare up to 3 candidates at a time.'); return; }
    compareSel.add(id);
  } else compareSel.delete(id);
  updateCompareBtn();
});
const selectAllEl = $('#selectAll');
if (selectAllEl) selectAllEl.addEventListener('change', () => {
  const checks = $$('#poolBody .row-check');
  compareSel.clear();
  checks.forEach(c => {
    if (selectAllEl.checked && compareSel.size < 3) { c.checked = true; compareSel.add(Number(c.dataset.id)); }
    else c.checked = false;
  });
  if (selectAllEl.checked && checks.length > 3) toast('Selected the first 3 (max for comparison).');
  updateCompareBtn();
});
$('#compareBtn').addEventListener('click', () => {
  const chosen = candidates.filter(c => compareSel.has(c.id));
  if (chosen.length < 2) return;
  renderComparison(chosen);
  openModal();
});
function renderComparison(list) {
  const blind = isBlind();
  const top = Math.max(...list.map(c => c.score));
  const head = list.map(c => `<th>${blind ? maskName(c) : escapeHtml(c.name)}</th>`).join('');
  const row = (label, fn) => `<tr><td class="cmp-rowlabel">${label}</td>${list.map(c => `<td>${fn(c)}</td>`).join('')}</tr>`;
  const chips = arr => (arr && arr.length) ? arr.map(s => `<span class="cmp-chip">${s}</span>`).join('') : '<span class="cmp-chip">—</span>';
  const gaps = arr => (arr && arr.length) ? arr.map(s => `<span class="cmp-chip gap">${s}</span>`).join('') : '<span class="cmp-chip">—</span>';

  $('#compareBody').innerHTML = `
    <table class="cmp-table">
      <thead><tr><th>Attribute</th>${head}</tr></thead>
      <tbody>
        ${row('Score', c => `<div class="cmp-score ${c.score === top ? 'cmp-winner' : ''}" style="color:${scoreColor(c.score)}">${c.score}</div>`)}
        ${row('Verdict', c => c.verdict || '—')}
        ${row('Department', c => DEPARTMENTS[c.dept] ? DEPARTMENTS[c.dept].name : c.dept)}
        ${row('Experience', c => c.years ? c.years + ' yrs' : '—')}
        ${row('Education', c => c.edu || '—')}
        ${row('Stage', c => c.stage || '—')}
        ${row('Source', c => c.source || '—')}
        ${row('Matched skills', c => chips(c.matchedAll || c.skills))}
        ${row('Gaps', c => gaps(c.gaps))}
      </tbody>
    </table>`;
}
function openModal() { $('#compareModal').hidden = false; }
function closeModal() { $('#compareModal').hidden = true; }
$$('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ---------- Bulk scanning ---------- */
let bulkResults = [];
const bulkDz = $('#bulkDropzone'), bulkInput = $('#bulkFileInput');
if (bulkDz) {
  bulkDz.addEventListener('click', () => bulkInput.click());
  bulkInput.addEventListener('change', e => processBulk([...e.target.files]));
  ['dragover', 'dragenter'].forEach(ev => bulkDz.addEventListener(ev, e => { e.preventDefault(); bulkDz.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(ev => bulkDz.addEventListener(ev, e => { e.preventDefault(); bulkDz.classList.remove('drag'); }));
  bulkDz.addEventListener('drop', e => { if (e.dataTransfer.files.length) processBulk([...e.dataTransfer.files]); });
}
async function processBulk(files) {
  if (!files.length) return;
  files = files.slice(0, 30);
  const deptKey = $('#bulkDept').value;
  const minExp = parseInt($('#bulkMinExp').value, 10) || 0;
  const source = $('#bulkSource').value;
  const status = $('#bulkStatus');
  bulkResults = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    status.classList.remove('err');
    status.textContent = `Processing ${i + 1} / ${files.length}: ${f.name}...`;
    try {
      const text = await extractText(f);
      if (!text || text.trim().length < 30) throw new Error('unreadable');
      const info = extractCandidateInfo(text, f.name);
      const a = analyzeResume(text, deptKey, minExp);
      a.dept = deptKey;
      a.name = info.name || 'Unnamed Candidate';
      const dup = info.email && candidates.some(c => (c.email || '').toLowerCase() === info.email.toLowerCase());
      bulkResults.push({ analysis: a, info, source, status: dup ? 'dup' : 'new' });
    } catch (err) {
      bulkResults.push({ info: { name: f.name }, error: true, status: 'err' });
    }
  }
  bulkResults.sort((x, y) => (y.analysis ? y.analysis.total : -1) - (x.analysis ? x.analysis.total : -1));
  status.textContent = `Done — ${bulkResults.filter(r => !r.error).length} scored, ${bulkResults.filter(r => r.status === 'dup').length} possible duplicate(s), ${bulkResults.filter(r => r.error).length} unreadable.`;
  renderBulk();
}
function renderBulk() {
  const wrap = $('#bulkResultWrap');
  wrap.hidden = bulkResults.length === 0;
  $('#bulkResultTitle').textContent = `Ranked Results (${bulkResults.filter(r => !r.error).length})`;
  const blind = isBlind();
  $('#bulkBody').innerHTML = bulkResults.map((r, i) => {
    if (r.error) {
      return `<tr><td>—</td><td data-label="Candidate">${escapeHtml(r.info.name)}</td><td colspan="3">Could not read text (scanned image?)</td><td><span class="bulk-badge err">Unreadable</span></td></tr>`;
    }
    const a = r.analysis;
    const name = blind ? 'Candidate ' + (i + 1) : escapeHtml(a.name);
    const chips = a.matched.slice(0, 4).map(s => `<span class="mini-chip">${s}</span>`).join('') || '—';
    const badge = r.status === 'dup' ? '<span class="bulk-badge dup">Duplicate?</span>' : '<span class="bulk-badge new">New</span>';
    return `
      <tr>
        <td data-label="Rank"><span class="rank-badge ${i === 0 ? 'top' : ''}">${i + 1}</span></td>
        <td data-label="Candidate"><div class="cand-name">${name}</div>${!blind && r.info.email ? `<div class="cand-sub">✉ ${escapeHtml(r.info.email)}</div>` : ''}</td>
        <td data-label="Score"><span class="score-tag" style="background:${scoreColor(a.total)}">${a.total}</span></td>
        <td data-label="Exp.">${a.years ? a.years + ' yrs' : '—'}</td>
        <td data-label="Skills"><div class="mini-chips">${chips}</div></td>
        <td data-label="Status">${badge}</td>
      </tr>`;
  }).join('');
}
$('#bulkAddAll').addEventListener('click', async () => {
  const toAdd = bulkResults
    .filter(r => !r.error)
    .map(r => buildCandidate(r.analysis, {
      email: r.info.email || '', phone: r.info.phone || '', source: r.source || 'Other'
    }));
  if (!toAdd.length) { toast('Nothing to add.'); return; }
  try {
    const result = await apiPost(`${API_BASE}bulk/`, { candidates: toAdd });
    candidates.push(...result.added);
    updateHeroStats();
    toast(`Added ${result.addedCount} candidate(s)${result.skipped ? `, skipped ${result.skipped} duplicate(s)` : ''}.`);
    // reflect "added" badges
    $$('#bulkBody .bulk-badge.new').forEach(b => { b.className = 'bulk-badge added'; b.textContent = 'Added'; });
  } catch (err) {
    toast('Could not add candidates — check your connection.');
    console.error(err);
  }
});
$('#bulkClear').addEventListener('click', () => {
  bulkResults = []; $('#bulkBody').innerHTML = ''; $('#bulkResultWrap').hidden = true;
  $('#bulkStatus').textContent = ''; if (bulkInput) bulkInput.value = '';
});

/* ---------- Hiring analytics ---------- */
function bar(label, value, max, cls) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return `<div class="an-row ${cls || ''}"><span class="al" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
    <div class="an-track"><div class="an-fill" style="width:0" data-w="${pct}"></div></div>
    <span class="av">${value}</span></div>`;
}
function renderAnalytics() {
  const total = candidates.length;
  $('#analyticsEmpty').style.display = total ? 'none' : 'block';
  $('#analyticsBody').hidden = !total;
  if (!total) return;

  const selected = candidates.filter(c => c.stage === 'Selected');
  const avgScore = Math.round(candidates.reduce((s, c) => s + c.score, 0) / total);
  // time-to-hire
  const tth = selected.filter(c => c.selectedAt && c.date)
    .map(c => (new Date(c.selectedAt) - new Date(c.date)) / 86400000);
  const avgTth = tth.length ? Math.round(tth.reduce((a, b) => a + b, 0) / tth.length) : null;

  $('#anKpis').innerHTML = `
    <div class="kpi"><div class="kpi-val">${total}</div><div class="kpi-label">Total Candidates</div></div>
    <div class="kpi green"><div class="kpi-val">${selected.length}</div><div class="kpi-label">Selected</div></div>
    <div class="kpi amber"><div class="kpi-val">${avgScore}</div><div class="kpi-label">Avg. Score</div></div>
    <div class="kpi blue"><div class="kpi-val">${avgTth === null ? '—' : avgTth + 'd'}</div><div class="kpi-label">Avg. Time-to-Hire</div></div>`;

  // funnel
  $('#anFunnel').innerHTML = STAGES.map(s =>
    bar(s, candidates.filter(c => c.stage === s).length, total, 'funnel-row')).join('');

  // department demand
  const deptCount = {};
  candidates.forEach(c => { deptCount[c.dept] = (deptCount[c.dept] || 0) + 1; });
  const deptArr = Object.entries(deptCount).sort((a, b) => b[1] - a[1]);
  const deptMax = deptArr.length ? deptArr[0][1] : 0;
  $('#anDept').innerHTML = deptArr.map(([k, n]) =>
    bar(DEPARTMENTS[k] ? DEPARTMENTS[k].name : k, n, deptMax)).join('');

  // source effectiveness (avg score per source)
  const src = {};
  candidates.forEach(c => {
    const s = c.source || 'Other';
    (src[s] = src[s] || { n: 0, sum: 0, sel: 0 });
    src[s].n++; src[s].sum += c.score; if (c.stage === 'Selected') src[s].sel++;
  });
  const srcArr = Object.entries(src).sort((a, b) => b[1].n - a[1].n);
  const srcMax = srcArr.length ? srcArr[0][1].n : 0;
  $('#anSource').innerHTML = srcArr.map(([k, v]) => {
    const avg = Math.round(v.sum / v.n);
    const pct = srcMax ? Math.round((v.n / srcMax) * 100) : 0;
    return `<div class="an-row"><span class="al" title="${escapeHtml(k)}">${escapeHtml(k)}</span>
      <div class="an-track"><div class="an-fill" style="width:0" data-w="${pct}"></div></div>
      <span class="av">${v.n} · ⌀${avg}</span></div>`;
  }).join('');

  setTimeout(() => $$('#analyticsBody .an-fill').forEach(f => f.style.width = f.dataset.w + '%'), 60);
}

/* ---------- Integrations ---------- */
$('#anExportSheets').addEventListener('click', exportCSV);
$('#anJobPost').addEventListener('click', () => {
  // pick the most-demanded department, else the first
  const deptCount = {};
  candidates.forEach(c => { deptCount[c.dept] = (deptCount[c.dept] || 0) + 1; });
  const key = Object.entries(deptCount).sort((a, b) => b[1] - a[1])[0]?.[0] || Object.keys(DEPARTMENTS)[0];
  const d = DEPARTMENTS[key];
  const skills = d.core.slice(0, 8).join(', ');
  const post =
`🚀 Aarti Steels Ltd is Hiring — ${d.name}

We are looking for talented professionals to join our ${d.name} function at our Ludhiana / Cuttack plants.

Key skills: ${skills}.

Apply with your updated resume. Be part of a fully integrated carbon & alloy steel manufacturer trusted since 1979.

#Hiring #Steel #${d.name.replace(/[^a-z]/gi, '')} #AartiSteels #NowHiring`;

  if (navigator.clipboard) navigator.clipboard.writeText(post).catch(() => {});
  toast('Job post copied to clipboard — paste it into LinkedIn / Naukri.');
  window.open('https://www.linkedin.com/feed/', '_blank', 'noopener');
});

/* ---------- PDF Scorecard (self-contained, printed via iframe) ---------- */
$('#scorecardBtn').addEventListener('click', () => {
  if (!currentAnalysis) { toast('Analyze a resume first.'); return; }
  printScorecard(currentAnalysis);
});
function printScorecard(a) {
  const blind = isBlind();
  const name = blind ? 'Confidential Candidate' : escapeHtml(a.name);
  const d = DEPARTMENTS[a.dept];
  const bd = a.breakdown.map(b => {
    const pct = Math.round((b.score / b.max) * 100);
    return `<div class="sc-bd"><span class="l">${b.label}</span>
      <span class="t"><i style="width:${pct}%"></i></span>
      <span class="v">${b.score} / ${b.max}</span></div>`;
  }).join('');
  const matched = a.matched.length ? a.matched.map(s => `<span>${escapeHtml(s)}</span>`).join('') : '<span>—</span>';
  const gaps = a.missing.length ? a.missing.map(s => `<span class="gap">${escapeHtml(s)}</span>`).join('') : '<span>—</span>';

  const doc = `<!doctype html><html><head><meta charset="utf-8"><title>Scorecard — ${name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; background: #fff; padding: 34px 38px; }
    .head { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #3da4f0; padding-bottom: 16px; margin-bottom: 22px; }
    .logo { border: 3px solid #3da4f0; padding: 5px 14px 7px; display: inline-flex; flex-direction: column; align-items: center; }
    .logo b { font-family: 'Brush Script MT', cursive; color: #3da4f0; font-size: 30px; line-height: 1; font-style: italic; }
    .logo i { display: block; width: 100%; height: 13px; background: #3da4f0; margin-top: 5px; }
    .title h1 { font-size: 24px; color: #14181d; }
    .title p { color: #666; font-size: 13px; margin-top: 3px; }
    .score { margin-left: auto; text-align: center; }
    .score b { font-size: 46px; color: #3da4f0; line-height: 1; }
    .score span { display: block; font-size: 12px; color: #555; margin-top: 4px; }
    .verdict { display: inline-block; margin-top: 4px; padding: 3px 12px; border-radius: 20px; color: #fff; font-size: 12px; font-weight: bold; }
    h2 { font-size: 14px; color: #14181d; border-left: 4px solid #3da4f0; padding-left: 9px; margin: 22px 0 10px; text-transform: uppercase; letter-spacing: .5px; }
    .meta { font-size: 14px; color: #333; }
    .meta strong { color: #14181d; }
    .sc-bd { display: flex; align-items: center; gap: 12px; font-size: 13px; padding: 5px 0; border-bottom: 1px solid #eee; }
    .sc-bd .l { width: 160px; color: #444; }
    .sc-bd .t { flex: 1; height: 8px; background: #eef1f4; border-radius: 5px; overflow: hidden; }
    .sc-bd .t i { display: block; height: 100%; background: #3da4f0; border-radius: 5px; }
    .sc-bd .v { width: 60px; text-align: right; color: #14181d; font-weight: bold; }
    .chips span { display: inline-block; font-size: 12px; background: #eaf4fd; color: #1c6fb0; border: 1px solid #c5e1f7; padding: 3px 10px; border-radius: 12px; margin: 3px 3px 0 0; }
    .chips span.gap { background: #fdecea; color: #c0392b; border-color: #f5c6c0; }
    .foot { margin-top: 28px; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 12px; }
  </style></head>
  <body>
    <div class="head">
      <div class="logo"><b>Aarti</b><i></i></div>
      <div class="title"><h1>Candidate Scorecard</h1><p>Aarti TalentForge · ${d ? d.name : a.dept}</p></div>
      <div class="score"><b>${a.total}</b><span>out of 100</span>
        <span class="verdict" style="background:${verdictHex(a.total)}">${a.verdict}</span></div>
    </div>
    <h2>Candidate</h2>
    <p class="meta"><strong>${name}</strong>${a.years ? ' · ' + a.years + ' yrs experience' : ''} · ${a.eduLevel}${a.jdUsed ? ' · scored against a job description' : ''}</p>
    <h2>Score Breakdown</h2>${bd}
    <h2>Matched Skills</h2><div class="chips">${matched}</div>
    <h2>Gaps / Recommended</h2><div class="chips">${gaps}</div>
    <div class="foot">Generated by Aarti TalentForge on ${new Date().toLocaleString()}. Heuristic scoring — for internal HR use as a decision aid alongside human review.</div>
  </body></html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const idoc = iframe.contentWindow.document;
  idoc.open(); idoc.write(doc); idoc.close();
  const fire = () => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
    catch (e) { console.error(e); toast('Could not open print dialog.'); }
    setTimeout(() => iframe.remove(), 1000);
  };
  // give the iframe a moment to render before printing
  if (idoc.readyState === 'complete') setTimeout(fire, 350);
  else iframe.onload = () => setTimeout(fire, 350);
}
function verdictHex(t) {
  if (t >= 80) return '#27ae60';
  if (t >= 65) return '#2f80c4';
  if (t >= 50) return '#e0a82e';
  return '#d8443c';
}

/* ---------- extra init ---------- */
initBlind();

/* ---------- Animated welcome splash ---------- */
function initWelcome() {
  const w = $('#welcome');
  if (!w) return;

  // personalised, time-aware greeting
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const g = $('#welcomeGreet');
  if (g) g.textContent = `${greet}, HR — let's find the right talent.`;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // rising forge sparks
  const sparks = $('#wcSparks');
  if (sparks && !reduce) {
    let html = '';
    for (let i = 0; i < 16; i++) {
      const left = Math.random() * 100;
      const dur = 3 + Math.random() * 3.5;
      const delay = Math.random() * 3;
      const size = 2 + Math.random() * 3;
      html += `<span class="wc-spark" style="left:${left}%;width:${size}px;height:${size}px;animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
    }
    sparks.innerHTML = html;
  }

  // constellation canvas
  const stopCanvas = (!reduce) ? startWelcomeCanvas() : null;

  // boot-sequence status messages
  const statusEl = $('#wcStatus');
  const stages = [
    [0, 'Initialising engine…'],
    [25, 'Loading 14 department profiles…'],
    [50, 'Calibrating AI scoring…'],
    [75, 'Preparing your dashboard…'],
    [100, 'Ready ✓']
  ];
  let stageIdx = -1;
  const setStatus = p => {
    let idx = 0;
    for (let i = 0; i < stages.length; i++) if (p >= stages[i][0]) idx = i;
    if (idx !== stageIdx && statusEl) {
      stageIdx = idx;
      statusEl.style.opacity = '0';
      setTimeout(() => { statusEl.textContent = stages[idx][1]; statusEl.style.opacity = '1'; }, 130);
    }
  };

  let done = false;
  const dismiss = () => {
    if (done) return; done = true;
    clearInterval(timer);
    if (stopCanvas) stopCanvas();
    const fillEl = $('.welcome-bar i'); if (fillEl) fillEl.style.width = '100%';
    const pctE = $('#wcPct'); if (pctE) pctE.textContent = '100%';
    setStatus(100);
    w.classList.add('done');
    setTimeout(() => w.remove(), 1000);
  };

  // live percentage + bar, then auto-reveal
  let pct = 0;
  const fill = $('.welcome-bar i');
  const pctEl = $('#wcPct');
  const total = reduce ? 1 : 2600;
  const tick = 40;
  const step = 100 / (total / tick);
  setStatus(0);
  const timer = setInterval(() => {
    pct = Math.min(100, pct + step);
    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    setStatus(pct);
    if (pct >= 100) { clearInterval(timer); setTimeout(dismiss, 450); }
  }, tick);

  w.addEventListener('click', dismiss);
}

/* constellation animation for the intro; returns a stop() */
function startWelcomeCanvas() {
  const canvas = $('#wcCanvas');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  let w, hgt, nodes, raf;
  const COUNT = 52, LINK = 150;
  function resize() { w = canvas.width = window.innerWidth; hgt = canvas.height = window.innerHeight; }
  function build() {
    nodes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w, y: Math.random() * hgt,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5
    }));
  }
  function step() {
    ctx.clearRect(0, 0, w, hgt);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > hgt) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK) {
          ctx.strokeStyle = `rgba(61,164,240,${(1 - dist / LINK) * 0.32})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = 'rgba(116,194,255,0.85)';
      ctx.beginPath(); ctx.arc(n.x, n.y, 1.7, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(step);
  }
  resize(); build(); step();
  const onResize = () => { resize(); build(); };
  window.addEventListener('resize', onResize);
  return function stop() { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
}
initWelcome();
