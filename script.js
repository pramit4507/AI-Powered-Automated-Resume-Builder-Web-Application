/* ============================================================
   ExecutiveAI – AI Resume Builder & ATS Analyzer
   script.js
   All logic runs client-side. No backend, no API key required.
   ============================================================ */

/* ---------------------------------------------------------
   1. STATE
   The single source of truth for the whole resume.
--------------------------------------------------------- */
const STORAGE_KEY = "executiveai_resume_draft_v1";

let state = {
  essentials: { fullName: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
  summary: "",
  experience: [],
  projects: [],
  skills: { technical: "", languages: "", frameworks: "", databases: "", tools: "", soft: "" },
  education: [],
  certifications: [],
  achievements: [],
  internships: [],
  languages: [],
  interests: "",
  extracurricular: "",
  template: "executive",
  sectionOrder: ["summary","experience","projects","skills","education","certifications","achievements","internships","languages","interests","extracurricular"],
};

/* Human readable labels for the section-order list & preview headings */
const SECTION_LABELS = {
  summary: "Professional Summary",
  experience: "Work Experience",
  projects: "Projects",
  skills: "Skills",
  education: "Education",
  certifications: "Certifications",
  achievements: "Achievements",
  internships: "Internships",
  languages: "Languages",
  interests: "Interests",
  extracurricular: "Extra-Curricular Activities",
};

/* Keywords the ATS analyzer looks for inside the resume text */
const ATS_KEYWORDS = [
  "Java","Python","JavaScript","React","Node.js","SQL","HTML","CSS","AWS","Git","GitHub",
  "Machine Learning","Data Analysis","Communication","Leadership","Problem Solving","Teamwork",
  "Agile","API","Database"
];

/* Suggested keywords by common job-title families, used for "missing keyword" hints */
const ROLE_KEYWORDS = {
  "software": ["Git","API","Agile","Database","Problem Solving"],
  "developer": ["React","Node.js","JavaScript","Git","API"],
  "data": ["Python","SQL","Machine Learning","Data Analysis","Database"],
  "analyst": ["SQL","Data Analysis","Communication","Problem Solving"],
  "manager": ["Leadership","Communication","Agile","Teamwork"],
  "design": ["Communication","Problem Solving","Teamwork"],
  "marketing": ["Communication","Leadership","Data Analysis"],
  "default": ["Communication","Teamwork","Problem Solving","Git","API"]
};

let idCounter = 1;
function nextId(){ return "id" + (idCounter++) + "_" + Math.random().toString(36).slice(2,7); }

/* ---------------------------------------------------------
   2. INIT
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  tryAutoLoad();
  ensureAtLeastOneEntry();
  renderExperienceForm();
  renderProjectsForm();
  renderEducationForm();
  renderCertificationsForm();
  renderAchievementsForm();
  renderInternshipsForm();
  renderLanguagesForm();
  renderSectionOrderList();
  bindStaticFields();
  bindHeaderActions();
  bindSectionCollapse();
  bindTemplateSelector();
  setTemplateActive(state.template);
  fullRender();
});

/* If a draft exists in localStorage, silently restore it on load */
function tryAutoLoad(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return;
  try{
    const saved = JSON.parse(raw);
    state = Object.assign({}, state, saved);
  }catch(e){ console.warn("Could not parse saved draft", e); }
}

/* Give every repeatable section one empty starter row so the form isn't intimidating */
function ensureAtLeastOneEntry(){
  if(state.experience.length === 0) state.experience.push(emptyExperience());
  if(state.projects.length === 0) state.projects.push(emptyProject());
  if(state.education.length === 0) state.education.push(emptyEducation());
  if(state.certifications.length === 0) state.certifications.push(emptyCertification());
  if(state.achievements.length === 0) state.achievements.push(emptyAchievement());
  if(state.internships.length === 0) state.internships.push(emptyInternship());
  if(state.languages.length === 0) state.languages.push(emptyLanguage());
}

function emptyExperience(){ return { id: nextId(), company:"", jobTitle:"", location:"", startDate:"", endDate:"", description:"" }; }
function emptyProject(){ return { id: nextId(), name:"", tech:"", description:"", link:"" }; }
function emptyEducation(){ return { id: nextId(), degree:"", university:"", location:"", startYear:"", gradYear:"", cgpa:"" }; }
function emptyCertification(){ return { id: nextId(), name:"", org:"", year:"", url:"" }; }
function emptyAchievement(){ return { id: nextId(), title:"", description:"", year:"" }; }
function emptyInternship(){ return { id: nextId(), org:"", role:"", duration:"", description:"" }; }
function emptyLanguage(){ return { id: nextId(), language:"", proficiency:"Professional" }; }

/* ---------------------------------------------------------
   3. STATIC FIELD BINDINGS (essentials, summary, skills, misc)
--------------------------------------------------------- */
function bindStaticFields(){
  const map = {
    "ess-fullName":["essentials","fullName"], "ess-title":["essentials","title"],
    "ess-email":["essentials","email"], "ess-phone":["essentials","phone"],
    "ess-location":["essentials","location"], "ess-linkedin":["essentials","linkedin"],
    "ess-github":["essentials","github"], "ess-portfolio":["essentials","portfolio"],
    "skill-technical":["skills","technical"], "skill-languages":["skills","languages"],
    "skill-frameworks":["skills","frameworks"], "skill-databases":["skills","databases"],
    "skill-tools":["skills","tools"], "skill-soft":["skills","soft"],
  };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    const [group, key] = map[id];
    el.value = state[group][key] || "";
    el.addEventListener("input", () => { state[group][key] = el.value; fullRender(); });
  });

  const summaryEl = document.getElementById("summaryText");
  summaryEl.value = state.summary;
  summaryEl.addEventListener("input", () => {
    state.summary = summaryEl.value;
    updateSummaryCounter();
    fullRender();
  });
  updateSummaryCounter();

  const interestsEl = document.getElementById("interestsText");
  interestsEl.value = state.interests;
  interestsEl.addEventListener("input", () => { state.interests = interestsEl.value; fullRender(); });

  const extraEl = document.getElementById("extraText");
  extraEl.value = state.extracurricular;
  extraEl.addEventListener("input", () => { state.extracurricular = extraEl.value; fullRender(); });

  document.getElementById("aiFixBtn").addEventListener("click", aiFixSummary);
  document.getElementById("aiTagBtn").addEventListener("click", aiAutoTagSkills);

  document.getElementById("addExperienceBtn").addEventListener("click", () => { state.experience.push(emptyExperience()); renderExperienceForm(); fullRender(); });
  document.getElementById("addProjectBtn").addEventListener("click", () => { state.projects.push(emptyProject()); renderProjectsForm(); fullRender(); });
  document.getElementById("addEducationBtn").addEventListener("click", () => { state.education.push(emptyEducation()); renderEducationForm(); fullRender(); });
  document.getElementById("addCertificationBtn").addEventListener("click", () => { state.certifications.push(emptyCertification()); renderCertificationsForm(); fullRender(); });
  document.getElementById("addAchievementBtn").addEventListener("click", () => { state.achievements.push(emptyAchievement()); renderAchievementsForm(); fullRender(); });
  document.getElementById("addInternshipBtn").addEventListener("click", () => { state.internships.push(emptyInternship()); renderInternshipsForm(); fullRender(); });
  document.getElementById("addLanguageBtn").addEventListener("click", () => { state.languages.push(emptyLanguage()); renderLanguagesForm(); fullRender(); });
}

function updateSummaryCounter(){
  const words = state.summary.trim().length ? state.summary.trim().split(/\s+/).length : 0;
  document.getElementById("summaryCount").textContent = `${words} word${words===1?"":"s"}`;
}

/* ---------------------------------------------------------
   4. REPEATABLE SECTION RENDERERS
   Each function rebuilds its list's HTML from state and wires
   up input + remove-button listeners. Re-called on add/remove.
--------------------------------------------------------- */
function renderExperienceForm(){
  const wrap = document.getElementById("experienceList");
  wrap.innerHTML = "";
  state.experience.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-top">
        <span class="entry-title">Experience ${idx+1}</span>
        <button class="remove-entry-btn" data-remove="experience" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="entry-grid">
        <div class="field"><label>Company</label><input type="text" data-field="company" placeholder="TCS Ltd." value="${escAttr(item.company)}"/></div>
        <div class="field"><label>Job Title</label><input type="text" data-field="jobTitle" placeholder="Frontend Developer" value="${escAttr(item.jobTitle)}"/></div>
        <div class="field"><label>Location</label><input type="text" data-field="location" placeholder="Pune, India" value="${escAttr(item.location)}"/></div>
        <div class="field"><label>Start Date</label><input type="text" data-field="startDate" placeholder="Jun 2024" value="${escAttr(item.startDate)}"/></div>
        <div class="field"><label>End Date</label><input type="text" data-field="endDate" placeholder="Present" value="${escAttr(item.endDate)}"/></div>
      </div>
      <div class="field"><label>Description</label><textarea data-field="description" rows="3" placeholder="Worked on website development.">${escHtml(item.description)}</textarea></div>
      <div class="entry-boost-row"><button class="ai-btn small" data-boost="experience" data-id="${item.id}"><i class="fa-solid fa-bolt"></i> AI BOOST</button></div>
    `;
    wrap.appendChild(card);
    bindEntryInputs(card, "experience", item.id);
    card.querySelector("[data-boost]").addEventListener("click", () => aiBoostText("experience", item.id));
  });
  bindRemoveButtons(wrap, "experience", renderExperienceForm);
}

function renderProjectsForm(){
  const wrap = document.getElementById("projectsList");
  wrap.innerHTML = "";
  state.projects.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-top">
        <span class="entry-title">Project ${idx+1}</span>
        <button class="remove-entry-btn" data-remove="projects" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="entry-grid">
        <div class="field"><label>Project Name</label><input type="text" data-field="name" placeholder="ExecutiveAI Resume Builder" value="${escAttr(item.name)}"/></div>
        <div class="field"><label>Technologies</label><input type="text" data-field="tech" placeholder="HTML, CSS, JavaScript" value="${escAttr(item.tech)}"/></div>
      </div>
      <div class="field"><label>Description</label><textarea data-field="description" rows="3" placeholder="Built a tool that does X for Y.">${escHtml(item.description)}</textarea></div>
      <div class="field"><label>Project / GitHub Link</label><input type="text" data-field="link" placeholder="github.com/you/project" value="${escAttr(item.link)}"/></div>
      <div class="entry-boost-row"><button class="ai-btn small" data-boost="projects" data-id="${item.id}"><i class="fa-solid fa-bolt"></i> AI BOOST</button></div>
    `;
    wrap.appendChild(card);
    bindEntryInputs(card, "projects", item.id);
    card.querySelector("[data-boost]").addEventListener("click", () => aiBoostText("projects", item.id));
  });
  bindRemoveButtons(wrap, "projects", renderProjectsForm);
}

function renderEducationForm(){
  const wrap = document.getElementById("educationList");
  wrap.innerHTML = "";
  state.education.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-top">
        <span class="entry-title">Education ${idx+1}</span>
        <button class="remove-entry-btn" data-remove="education" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="entry-grid">
        <div class="field"><label>Degree</label><input type="text" data-field="degree" placeholder="B.Tech Computer Science" value="${escAttr(item.degree)}"/></div>
        <div class="field"><label>University / College</label><input type="text" data-field="university" placeholder="Savitribai Phule Pune University" value="${escAttr(item.university)}"/></div>
        <div class="field"><label>Location</label><input type="text" data-field="location" placeholder="Pune, India" value="${escAttr(item.location)}"/></div>
        <div class="field"><label>CGPA / Percentage</label><input type="text" data-field="cgpa" placeholder="8.7 CGPA" value="${escAttr(item.cgpa)}"/></div>
        <div class="field"><label>Start Year</label><input type="text" data-field="startYear" placeholder="2022" value="${escAttr(item.startYear)}"/></div>
        <div class="field"><label>Graduation Year</label><input type="text" data-field="gradYear" placeholder="2026" value="${escAttr(item.gradYear)}"/></div>
      </div>
    `;
    wrap.appendChild(card);
    bindEntryInputs(card, "education", item.id);
  });
  bindRemoveButtons(wrap, "education", renderEducationForm);
}

function renderCertificationsForm(){
  const wrap = document.getElementById("certificationsList");
  wrap.innerHTML = "";
  state.certifications.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-top">
        <span class="entry-title">Certification ${idx+1}</span>
        <button class="remove-entry-btn" data-remove="certifications" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="entry-grid">
        <div class="field"><label>Certification Name</label><input type="text" data-field="name" placeholder="AWS Cloud Practitioner" value="${escAttr(item.name)}"/></div>
        <div class="field"><label>Issuing Organization</label><input type="text" data-field="org" placeholder="Amazon Web Services" value="${escAttr(item.org)}"/></div>
        <div class="field"><label>Year</label><input type="text" data-field="year" placeholder="2025" value="${escAttr(item.year)}"/></div>
        <div class="field"><label>Certification URL</label><input type="text" data-field="url" placeholder="credential link" value="${escAttr(item.url)}"/></div>
      </div>
    `;
    wrap.appendChild(card);
    bindEntryInputs(card, "certifications", item.id);
  });
  bindRemoveButtons(wrap, "certifications", renderCertificationsForm);
}

function renderAchievementsForm(){
  const wrap = document.getElementById("achievementsList");
  wrap.innerHTML = "";
  state.achievements.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-top">
        <span class="entry-title">Achievement ${idx+1}</span>
        <button class="remove-entry-btn" data-remove="achievements" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="entry-grid">
        <div class="field"><label>Achievement Title</label><input type="text" data-field="title" placeholder="Winner - Smart India Hackathon" value="${escAttr(item.title)}"/></div>
        <div class="field"><label>Year</label><input type="text" data-field="year" placeholder="2025" value="${escAttr(item.year)}"/></div>
      </div>
      <div class="field"><label>Description</label><textarea data-field="description" rows="2" placeholder="Led a team of 4 to build a winning prototype.">${escHtml(item.description)}</textarea></div>
    `;
    wrap.appendChild(card);
    bindEntryInputs(card, "achievements", item.id);
  });
  bindRemoveButtons(wrap, "achievements", renderAchievementsForm);
}

function renderInternshipsForm(){
  const wrap = document.getElementById("internshipsList");
  wrap.innerHTML = "";
  state.internships.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-top">
        <span class="entry-title">Internship ${idx+1}</span>
        <button class="remove-entry-btn" data-remove="internships" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="entry-grid">
        <div class="field"><label>Organization</label><input type="text" data-field="org" placeholder="Infosys" value="${escAttr(item.org)}"/></div>
        <div class="field"><label>Role</label><input type="text" data-field="role" placeholder="Software Intern" value="${escAttr(item.role)}"/></div>
        <div class="field"><label>Duration</label><input type="text" data-field="duration" placeholder="Jun 2025 - Aug 2025" value="${escAttr(item.duration)}"/></div>
      </div>
      <div class="field"><label>Description</label><textarea data-field="description" rows="2" placeholder="Assisted in building internal tools.">${escHtml(item.description)}</textarea></div>
    `;
    wrap.appendChild(card);
    bindEntryInputs(card, "internships", item.id);
  });
  bindRemoveButtons(wrap, "internships", renderInternshipsForm);
}

function renderLanguagesForm(){
  const wrap = document.getElementById("languagesList");
  wrap.innerHTML = "";
  state.languages.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-top">
        <span class="entry-title">Language ${idx+1}</span>
        <button class="remove-entry-btn" data-remove="languages" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="entry-grid">
        <div class="field"><label>Language</label><input type="text" data-field="language" placeholder="English" value="${escAttr(item.language)}"/></div>
        <div class="field"><label>Proficiency</label>
          <select data-field="proficiency" class="proficiency-select">
            ${["Native","Professional","Conversational","Basic"].map(p => `<option value="${p}" ${item.proficiency===p?"selected":""}>${p}</option>`).join("")}
          </select>
        </div>
      </div>
    `;
    wrap.appendChild(card);
    bindEntryInputs(card, "languages", item.id);
  });
  bindRemoveButtons(wrap, "languages", renderLanguagesForm);
}

/* Generic input binder: wires every [data-field] element inside a card
   back to the matching object in state[collection] found by id. */
function bindEntryInputs(card, collection, id){
  card.querySelectorAll("[data-field]").forEach(input => {
    input.addEventListener("input", () => {
      const item = state[collection].find(x => x.id === id);
      if(item) item[input.dataset.field] = input.value;
      fullRender();
    });
    input.addEventListener("change", () => {
      const item = state[collection].find(x => x.id === id);
      if(item) item[input.dataset.field] = input.value;
      fullRender();
    });
  });
}

/* Generic remove-button binder */
function bindRemoveButtons(wrap, collection, rerenderFn){
  wrap.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      state[collection] = state[collection].filter(x => x.id !== id);
      rerenderFn();
      fullRender();
    });
  });
}

/* Escaping helpers to safely inject state text into innerHTML */
function escAttr(str){ return (str||"").replace(/"/g,"&quot;"); }
function escHtml(str){ return (str||"").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

/* ---------------------------------------------------------
   5. SECTION COLLAPSE / EXPAND
--------------------------------------------------------- */
function bindSectionCollapse(){
  document.querySelectorAll(".editor-section .section-header").forEach(header => {
    header.addEventListener("click", () => {
      header.closest(".editor-section").classList.toggle("collapsed");
    });
  });
}

/* ---------------------------------------------------------
   6. TEMPLATE SELECTOR
--------------------------------------------------------- */
function bindTemplateSelector(){
  document.querySelectorAll(".template-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      state.template = btn.dataset.template;
      setTemplateActive(state.template);
      renderPreview();
      showToast(`Switched to ${capitalize(state.template)} template`, "success");
    });
  });
}
function setTemplateActive(name){
  document.querySelectorAll(".template-chip").forEach(b => b.classList.toggle("active", b.dataset.template === name));
  document.getElementById("templateBadge").textContent = capitalize(name);
  const page = document.getElementById("resumePreview");
  page.className = "resume-page template-" + name;
}
function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

/* ---------------------------------------------------------
   7. SECTION ORDER (drag & drop)
--------------------------------------------------------- */
function renderSectionOrderList(){
  const list = document.getElementById("sectionOrderList");
  list.innerHTML = "";
  state.sectionOrder.forEach(key => {
    const li = document.createElement("li");
    li.draggable = true;
    li.dataset.key = key;
    li.innerHTML = `<i class="fa-solid fa-grip-lines"></i> ${SECTION_LABELS[key]}`;
    list.appendChild(li);
  });

  let draggedEl = null;
  list.querySelectorAll("li").forEach(li => {
    li.addEventListener("dragstart", () => { draggedEl = li; li.classList.add("dragging"); });
    li.addEventListener("dragend", () => { li.classList.remove("dragging"); draggedEl = null; syncOrderFromDOM(); });
    li.addEventListener("dragover", (e) => { e.preventDefault(); li.classList.add("drag-over"); });
    li.addEventListener("dragleave", () => li.classList.remove("drag-over"));
    li.addEventListener("drop", (e) => {
      e.preventDefault();
      li.classList.remove("drag-over");
      if(draggedEl && draggedEl !== li){
        const items = Array.from(list.children);
        const draggedIdx = items.indexOf(draggedEl);
        const targetIdx = items.indexOf(li);
        if(draggedIdx < targetIdx) li.after(draggedEl); else li.before(draggedEl);
      }
    });
  });
}
function syncOrderFromDOM(){
  const list = document.getElementById("sectionOrderList");
  state.sectionOrder = Array.from(list.children).map(li => li.dataset.key);
  renderPreview();
}

/* ---------------------------------------------------------
   8. HEADER ACTIONS: theme, save/load/clear, print/pdf
--------------------------------------------------------- */
function bindHeaderActions(){
  document.getElementById("themeToggle").addEventListener("click", () => {
    const body = document.body;
    const next = body.dataset.theme === "dark" ? "light" : "dark";
    body.dataset.theme = next;
    document.querySelector("#themeToggle i").className = next === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  });

  document.getElementById("saveDraftBtn").addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    showToast("Draft saved to this browser", "success");
  });

  document.getElementById("loadDraftBtn").addEventListener("click", () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){ showToast("No saved draft found", "error"); return; }
    try{
      state = Object.assign({}, state, JSON.parse(raw));
      ensureAtLeastOneEntry();
      renderExperienceForm(); renderProjectsForm(); renderEducationForm();
      renderCertificationsForm(); renderAchievementsForm(); renderInternshipsForm(); renderLanguagesForm();
      renderSectionOrderList();
      rehydrateStaticFields();
      setTemplateActive(state.template);
      fullRender();
      showToast("Draft loaded", "success");
    }catch(e){ showToast("Could not load draft", "error"); }
  });

  document.getElementById("clearResumeBtn").addEventListener("click", () => {
    if(!confirm("This will permanently clear all resume information from the editor. Continue?")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  document.getElementById("printBtn").addEventListener("click", () => window.print());
  document.getElementById("downloadPdfBtn").addEventListener("click", () => {
    showToast("In the print dialog, choose 'Save as PDF' as the destination", "success");
    setTimeout(() => window.print(), 400);
  });
}

/* Refresh every plain input/textarea from state (used after Load Draft) */
function rehydrateStaticFields(){
  document.getElementById("ess-fullName").value = state.essentials.fullName;
  document.getElementById("ess-title").value = state.essentials.title;
  document.getElementById("ess-email").value = state.essentials.email;
  document.getElementById("ess-phone").value = state.essentials.phone;
  document.getElementById("ess-location").value = state.essentials.location;
  document.getElementById("ess-linkedin").value = state.essentials.linkedin;
  document.getElementById("ess-github").value = state.essentials.github;
  document.getElementById("ess-portfolio").value = state.essentials.portfolio;
  document.getElementById("summaryText").value = state.summary;
  document.getElementById("skill-technical").value = state.skills.technical;
  document.getElementById("skill-languages").value = state.skills.languages;
  document.getElementById("skill-frameworks").value = state.skills.frameworks;
  document.getElementById("skill-databases").value = state.skills.databases;
  document.getElementById("skill-tools").value = state.skills.tools;
  document.getElementById("skill-soft").value = state.skills.soft;
  document.getElementById("interestsText").value = state.interests;
  document.getElementById("extraText").value = state.extracurricular;
  updateSummaryCounter();
}

/* ---------------------------------------------------------
   9. SIMULATED AI FEATURES (all client-side, no external API)
--------------------------------------------------------- */

/* AI FIX: rewrites the professional summary into a punchier,
   achievement-oriented statement using the title/skills already entered. */
function aiFixSummary(){
  const title = state.essentials.title || "professional";
  const topSkills = firstSkills(3);
  const yearsHint = state.experience.some(e => e.company) ? "hands-on experience" : "a strong academic foundation";

  let improved = `Results-driven ${title} with ${yearsHint} in ${topSkills.length ? topSkills.join(", ") : "core technical fundamentals"}. `;
  improved += `Skilled at translating requirements into reliable solutions, collaborating across teams, and delivering measurable impact. `;
  improved += `Seeking to leverage strong problem-solving and communication skills to drive results in a challenging ${title} role.`;

  state.summary = improved;
  document.getElementById("summaryText").value = improved;
  updateSummaryCounter();
  fullRender();
  showToast("Summary improved with AI FIX", "success");
}

function firstSkills(n){
  const all = [state.skills.technical, state.skills.languages, state.skills.frameworks]
    .join(",").split(",").map(s => s.trim()).filter(Boolean);
  return all.slice(0, n);
}

/* AI BOOST: turns a plain, passive description into a stronger,
   achievement-oriented bullet using simple rule-based rewriting. */
const BOOST_STARTERS = ["Spearheaded","Engineered","Delivered","Streamlined","Drove","Architected","Optimized","Accelerated"];
const BOOST_IMPACTS = [
  "resulting in improved efficiency and user satisfaction",
  "which strengthened team output and reduced turnaround time",
  "leading to measurable gains in performance and quality",
  "improving reliability and the overall user experience",
  "which contributed directly to project and team success"
];

function aiBoostText(collection, id){
  const item = state[collection].find(x => x.id === id);
  if(!item || !item.description || !item.description.trim()){
    showToast("Add a description first, then boost it", "error");
    return;
  }
  const lines = item.description.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const boosted = lines.map((line, i) => boostSentence(line, i));
  item.description = boosted.join("\n");

  // reflect the change back into the visible textarea
  const collectionListId = { experience:"experienceList", projects:"projectsList" }[collection];
  const wrap = document.getElementById(collectionListId);
  const cards = Array.from(wrap.children);
  const idx = state[collection].findIndex(x => x.id === id);
  if(cards[idx]){
    const ta = cards[idx].querySelector('[data-field="description"]');
    if(ta) ta.value = item.description;
  }
  fullRender();
  showToast("Bullet points boosted with AI BOOST", "success");
}

function boostSentence(sentence, i){
  let s = sentence.replace(/^[-•*]\s*/, "");
  s = s.replace(/^(worked on|helped with|responsible for|did|handled)\s*/i, "");
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if(/\.$/.test(s)) s = s.slice(0, -1);
  const starter = BOOST_STARTERS[i % BOOST_STARTERS.length];
  const impact = BOOST_IMPACTS[i % BOOST_IMPACTS.length];
  // Avoid double-starting if the sentence already begins with a strong verb
  const alreadyStrong = BOOST_STARTERS.some(w => s.toLowerCase().startsWith(w.toLowerCase()));
  const body = alreadyStrong ? s : `${starter} ${lowerFirstWordAfterVerb(s)}`;
  return `${body}, ${impact}.`;
}
function lowerFirstWordAfterVerb(s){
  // keep proper nouns/acronyms capitalised, just lower-case a leading generic word if it was capitalised only because it started the sentence
  const words = s.split(" ");
  if(words.length && words[0].length > 1 && words[0] === words[0].toUpperCase()) return s; // looks like an acronym, leave it
  words[0] = words[0].charAt(0).toLowerCase() + words[0].slice(1);
  return words.join(" ");
}

/* AI AUTO-TAG: cleans up comma-separated skill fields — trims whitespace,
   removes duplicates/empties, and title-cases each tag. */
function aiAutoTagSkills(){
  ["technical","languages","frameworks","databases","tools","soft"].forEach(key => {
    state.skills[key] = cleanTagList(state.skills[key]);
  });
  rehydrateStaticFields();
  fullRender();
  showToast("Skills cleaned up and tagged with AI AUTO-TAG", "success");
}
function cleanTagList(str){
  const seen = new Set();
  const out = [];
  (str||"").split(",").map(s => s.trim()).filter(Boolean).forEach(s => {
    const key = s.toLowerCase();
    if(!seen.has(key)){
      seen.add(key);
      out.push(smartCase(s));
    }
  });
  return out.join(", ");
}
function smartCase(s){
  // preserve all-caps acronyms (SQL, AWS, API) and known mixed-case tech names, else title-case
  const knownMixed = ["JavaScript","TypeScript","Node.js","GitHub","MySQL","MongoDB","PostgreSQL","GitLab"];
  const found = knownMixed.find(k => k.toLowerCase() === s.toLowerCase());
  if(found) return found;
  if(s === s.toUpperCase() && s.length <= 5) return s;
  return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/* ---------------------------------------------------------
   10. ATS SCORING + KEYWORD ANALYSIS
--------------------------------------------------------- */
function buildFullResumeText(){
  const parts = [];
  const e = state.essentials;
  parts.push(e.fullName, e.title, e.email, e.phone, e.location);
  parts.push(state.summary);
  state.experience.forEach(x => parts.push(x.company, x.jobTitle, x.description));
  state.projects.forEach(x => parts.push(x.name, x.tech, x.description));
  Object.values(state.skills).forEach(v => parts.push(v));
  state.education.forEach(x => parts.push(x.degree, x.university));
  state.certifications.forEach(x => parts.push(x.name, x.org));
  state.achievements.forEach(x => parts.push(x.title, x.description));
  state.internships.forEach(x => parts.push(x.org, x.role, x.description));
  parts.push(state.interests, state.extracurricular);
  return parts.filter(Boolean).join(" ");
}

function calculateATS(){
  const e = state.essentials;
  let score = 0;
  const weights = [
    [!!e.fullName, 6], [!!e.title, 6], [!!e.email, 5], [!!e.phone, 4], [!!e.location, 4],
    [state.summary.trim().length > 30, 10],
    [state.experience.some(x => x.company && x.description), 14],
    [hasAnySkills(), 12],
    [state.education.some(x => x.degree), 8],
    [state.projects.some(x => x.name), 8],
    [state.certifications.some(x => x.name), 5],
    [state.achievements.some(x => x.title), 6],
  ];
  weights.forEach(([met, w]) => { if(met) score += w; });

  const { count } = countKeywords();
  score += Math.min(12, count * 1.5); // keyword bonus, capped

  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}
function hasAnySkills(){
  return Object.values(state.skills).some(v => v && v.trim().length);
}

function countKeywords(){
  const text = buildFullResumeText().toLowerCase();
  const found = ATS_KEYWORDS.filter(k => text.includes(k.toLowerCase()));
  const totalWords = text.trim().length ? text.trim().split(/\s+/).length : 0;
  const density = totalWords ? ((found.length / totalWords) * 100) : 0;
  return { count: found.length, found, density };
}

function missingKeywordsForTitle(){
  const title = (state.essentials.title || "").toLowerCase();
  let bucket = ROLE_KEYWORDS.default;
  for(const key of Object.keys(ROLE_KEYWORDS)){
    if(key !== "default" && title.includes(key)){ bucket = ROLE_KEYWORDS[key]; break; }
  }
  const text = buildFullResumeText().toLowerCase();
  return bucket.filter(k => !text.includes(k.toLowerCase()));
}

function updateAtsWidget(){
  const score = calculateATS();
  document.getElementById("atsScoreValue").textContent = score;

  const circumference = 2 * Math.PI * 52;
  const ring = document.getElementById("atsRingFg");
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference - (score/100)*circumference;

  let status, feedback, color;
  if(score < 40){ status = "Needs Work"; feedback = "Start adding more resume information."; color = "#ef4444"; }
  else if(score < 60){ status = "Basic"; feedback = "Basic resume detected. Add experience and skills."; color = "#f59e0b"; }
  else if(score < 80){ status = "Good"; feedback = "Good resume. Improve keywords and achievements."; color = "#4f6bff"; }
  else { status = "Excellent"; feedback = "Excellent ATS-friendly resume!"; color = "#22c55e"; }

  document.getElementById("atsStatus").textContent = status;
  document.getElementById("atsStatus").style.color = color;
  document.getElementById("atsFeedback").textContent = feedback;
  ring.style.stroke = color;

  const { count, density } = countKeywords();
  document.getElementById("keywordsFoundNum").textContent = count;
  document.getElementById("keywordDensityNum").textContent = density.toFixed(1) + "%";
}

/* ---------------------------------------------------------
   11. AI RESUME INSIGHTS
--------------------------------------------------------- */
function updateInsights(){
  const list = document.getElementById("insightsList");
  const items = [];

  items.push(state.summary.trim().length > 30
    ? { ok:true, text:"Strong professional summary" }
    : { ok:false, text:"Add a fuller professional summary (2-3 sentences)" });

  items.push(hasAnySkills()
    ? { ok:true, text:"Skills section detected" }
    : { ok:false, text:"Add technical and soft skills" });

  items.push(state.projects.some(p => p.name)
    ? { ok:true, text:"Projects section detected" }
    : { ok:false, text:"Add at least one project" });

  items.push(state.experience.some(x => x.company && x.description)
    ? { ok:true, text:"Work experience detected" }
    : { ok:false, text:"Add work experience or an internship" });

  const hasNumbers = /\d/.test(state.experience.map(x=>x.description).join(" ") + state.achievements.map(a=>a.description).join(" "));
  items.push(hasNumbers
    ? { ok:true, text:"Measurable achievements detected" }
    : { ok:false, text:"Add measurable achievements (numbers, %, results)" });

  const missing = missingKeywordsForTitle();
  items.push(missing.length === 0
    ? { ok:true, text:"Great keyword coverage for your title" }
    : { ok:false, text:`Add more job-specific keywords: ${missing.slice(0,4).join(", ")}` });

  items.push(state.education.some(e => e.degree)
    ? { ok:true, text:"Education section detected" }
    : { ok:false, text:"Add your education details" });

  list.innerHTML = items.map(it => `
    <li class="${it.ok ? "ok" : "warn"}">
      <i class="fa-solid ${it.ok ? "fa-circle-check" : "fa-triangle-exclamation"}"></i>
      <span>${it.text}</span>
    </li>
  `).join("");
}

/* ---------------------------------------------------------
   12. COMPLETION PERCENTAGE
--------------------------------------------------------- */
function calculateCompletion(){
  const checks = [
    !!state.essentials.fullName, !!state.essentials.title, !!state.essentials.email,
    !!state.essentials.phone, !!state.essentials.location,
    state.summary.trim().length > 20,
    state.experience.some(x => x.company),
    state.projects.some(x => x.name),
    hasAnySkills(),
    state.education.some(x => x.degree),
    state.certifications.some(x => x.name),
    state.achievements.some(x => x.title),
    state.internships.some(x => x.org),
    state.languages.some(x => x.language),
    !!state.interests,
    !!state.extracurricular,
  ];
  const met = checks.filter(Boolean).length;
  return Math.round((met / checks.length) * 100);
}
function updateCompletion(){
  const pct = calculateCompletion();
  document.getElementById("completionFill").style.width = pct + "%";
  document.getElementById("completionLabel").textContent = pct + "% complete";
}

/* ---------------------------------------------------------
   13. RESUME PREVIEW RENDERING
--------------------------------------------------------- */
function renderPreview(){
  const page = document.getElementById("resumePreview");
  const e = state.essentials;

  const anyContent = e.fullName || e.title || state.summary || state.experience.some(x=>x.company)
    || state.projects.some(x=>x.name) || hasAnySkills() || state.education.some(x=>x.degree);

  if(!anyContent){
    page.innerHTML = `<div class="r-empty-hint"><i class="fa-solid fa-file-lines"></i>Your resume preview will appear here.<br>Start filling in the Essentials on the left.</div>`;
    return;
  }

  let html = "";

  // Header
  html += `<div class="r-header">`;
  html += `<div class="r-name">${escHtml(e.fullName) || "Your Name"}</div>`;
  if(e.title) html += `<div class="r-title">${escHtml(e.title)}</div>`;
  const contactBits = [e.email, e.phone, e.location].filter(Boolean);
  const linkBits = [e.linkedin, e.github, e.portfolio].filter(Boolean);
  if(contactBits.length) html += `<div class="r-contact">${contactBits.map(c=>`<span>${escHtml(c)}</span>`).join("")}</div>`;
  if(linkBits.length) html += `<div class="r-contact">${linkBits.map(c=>`<span>${escHtml(c)}</span>`).join("")}</div>`;
  html += `</div>`;

  // Ordered sections
  state.sectionOrder.forEach(key => { html += renderSectionByKey(key); });

  page.innerHTML = html;
}

function renderSectionByKey(key){
  switch(key){
    case "summary": return renderSummarySection();
    case "experience": return renderExperienceSection();
    case "projects": return renderProjectsSection();
    case "skills": return renderSkillsSection();
    case "education": return renderEducationSection();
    case "certifications": return renderCertificationsSection();
    case "achievements": return renderAchievementsSection();
    case "internships": return renderInternshipsSection();
    case "languages": return renderLanguagesSection();
    case "interests": return renderInterestsSection();
    case "extracurricular": return renderExtracurricularSection();
    default: return "";
  }
}

function renderSummarySection(){
  if(!state.summary.trim()) return "";
  return `<div class="r-section"><h2>Professional Summary</h2><div class="r-item-desc">${escHtml(state.summary)}</div></div>`;
}

function renderExperienceSection(){
  const rows = state.experience.filter(x => x.company || x.jobTitle);
  if(!rows.length) return "";
  const items = rows.map(x => `
    <div class="r-item">
      <div class="r-item-top"><span>${escHtml(x.jobTitle) || "Role"} ${x.company ? "· " + escHtml(x.company) : ""}</span>
        <span class="r-item-date">${[x.startDate, x.endDate].filter(Boolean).join(" – ")}</span></div>
      ${x.location ? `<div class="r-item-sub">${escHtml(x.location)}</div>` : ""}
      ${x.description ? `<div class="r-item-desc">${descriptionToBullets(x.description)}</div>` : ""}
    </div>`).join("");
  return `<div class="r-section"><h2>Work Experience</h2>${items}</div>`;
}

function renderProjectsSection(){
  const rows = state.projects.filter(x => x.name);
  if(!rows.length) return "";
  const items = rows.map(x => `
    <div class="r-item">
      <div class="r-item-top"><span>${escHtml(x.name)}</span>${x.link ? `<span class="r-item-date">${escHtml(x.link)}</span>` : ""}</div>
      ${x.tech ? `<div class="r-item-sub">${escHtml(x.tech)}</div>` : ""}
      ${x.description ? `<div class="r-item-desc">${descriptionToBullets(x.description)}</div>` : ""}
    </div>`).join("");
  return `<div class="r-section"><h2>Projects</h2>${items}</div>`;
}

function descriptionToBullets(desc){
  const lines = desc.split(/\n+/).map(l => l.trim()).filter(Boolean);
  if(lines.length <= 1) return escHtml(desc);
  return `<ul class="r-bullets">${lines.map(l => `<li>${escHtml(l)}</li>`).join("")}</ul>`;
}

function renderSkillsSection(){
  if(!hasAnySkills()) return "";
  const groups = [
    ["Technical", state.skills.technical], ["Languages", state.skills.languages],
    ["Frameworks", state.skills.frameworks], ["Databases", state.skills.databases],
    ["Tools", state.skills.tools], ["Soft Skills", state.skills.soft],
  ].filter(([,v]) => v && v.trim());

  const allTags = groups.flatMap(([,v]) => v.split(",").map(s=>s.trim()).filter(Boolean));
  const tagsHtml = `<div class="r-tags">${allTags.map(t => `<span class="r-tag">${escHtml(t)}</span>`).join("")}</div>`;
  return `<div class="r-section"><h2>Skills</h2>${tagsHtml}</div>`;
}

function renderEducationSection(){
  const rows = state.education.filter(x => x.degree || x.university);
  if(!rows.length) return "";
  const items = rows.map(x => `
    <div class="r-item">
      <div class="r-item-top"><span>${escHtml(x.degree) || "Degree"}</span>
        <span class="r-item-date">${[x.startYear, x.gradYear].filter(Boolean).join(" – ")}</span></div>
      <div class="r-item-sub">${[x.university, x.location].filter(Boolean).map(escHtml).join(", ")}${x.cgpa ? " · " + escHtml(x.cgpa) : ""}</div>
    </div>`).join("");
  return `<div class="r-section"><h2>Education</h2>${items}</div>`;
}

function renderCertificationsSection(){
  const rows = state.certifications.filter(x => x.name);
  if(!rows.length) return "";
  const items = rows.map(x => `
    <div class="r-item">
      <div class="r-item-top"><span>${escHtml(x.name)}</span><span class="r-item-date">${escHtml(x.year)}</span></div>
      <div class="r-item-sub">${[x.org, x.url].filter(Boolean).map(escHtml).join(" · ")}</div>
    </div>`).join("");
  return `<div class="r-section"><h2>Certifications</h2>${items}</div>`;
}

function renderAchievementsSection(){
  const rows = state.achievements.filter(x => x.title);
  if(!rows.length) return "";
  const items = `<ul class="r-bullets">${rows.map(x => `<li><strong>${escHtml(x.title)}</strong>${x.year ? " (" + escHtml(x.year) + ")" : ""}${x.description ? " — " + escHtml(x.description) : ""}</li>`).join("")}</ul>`;
  return `<div class="r-section"><h2>Achievements</h2>${items}</div>`;
}

function renderInternshipsSection(){
  const rows = state.internships.filter(x => x.org || x.role);
  if(!rows.length) return "";
  const items = rows.map(x => `
    <div class="r-item">
      <div class="r-item-top"><span>${escHtml(x.role) || "Intern"} ${x.org ? "· " + escHtml(x.org) : ""}</span>
        <span class="r-item-date">${escHtml(x.duration)}</span></div>
      ${x.description ? `<div class="r-item-desc">${descriptionToBullets(x.description)}</div>` : ""}
    </div>`).join("");
  return `<div class="r-section"><h2>Internships</h2>${items}</div>`;
}

function renderLanguagesSection(){
  const rows = state.languages.filter(x => x.language);
  if(!rows.length) return "";
  const items = rows.map(x => `<div class="r-lang-row"><span>${escHtml(x.language)}</span><span>${escHtml(x.proficiency)}</span></div>`).join("");
  return `<div class="r-section"><h2>Languages</h2>${items}</div>`;
}

function renderInterestsSection(){
  if(!state.interests.trim()) return "";
  const tags = state.interests.split(",").map(s=>s.trim()).filter(Boolean);
  const html = tags.length > 1
    ? `<div class="r-tags">${tags.map(t=>`<span class="r-tag">${escHtml(t)}</span>`).join("")}</div>`
    : `<div class="r-item-desc">${escHtml(state.interests)}</div>`;
  return `<div class="r-section"><h2>Interests</h2>${html}</div>`;
}

function renderExtracurricularSection(){
  if(!state.extracurricular.trim()) return "";
  return `<div class="r-section"><h2>Extra-Curricular Activities</h2><div class="r-item-desc">${descriptionToBullets(state.extracurricular)}</div></div>`;
}

/* ---------------------------------------------------------
   14. TOASTS
--------------------------------------------------------- */
function showToast(message, type="info"){
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  const icon = type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-exclamation" : "fa-circle-info";
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(30px)";
    toast.style.transition = "all .3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/* ---------------------------------------------------------
   15. MASTER RENDER
   Called after any state change so preview + ATS + insights +
   completion always stay in sync.
--------------------------------------------------------- */
function fullRender(){
  renderPreview();
  updateAtsWidget();
  updateInsights();
  updateCompletion();
}
