# ExecutiveAI – AI Resume Builder & ATS Analyzer

A fully client-side, no-backend resume builder with a live preview, an ATS
(Applicant Tracking System) score analyzer, and simulated AI writing
assistance — built with plain HTML5, CSS3 and vanilla JavaScript.

> Built as a college-level Web Development / Data Analytics & AI project.

---

## ✨ Features

- **Two-panel workspace** — form editor on the left, a live A4-style resume
  preview on the right (stacks vertically on tablet/mobile).
- **ATS Optimization widget** — a circular score (0–100%) that recalculates
  in real time from 12+ resume signals (contact info, summary, experience,
  skills, education, projects, certifications, keywords, etc.) with
  tiered feedback messages.
- **ATS Keyword Analyzer** — scans the whole resume for 20 common
  professional/technical keywords, reports **Keywords Found** and
  **Keyword Density**, and recommends missing keywords based on your
  professional title.
- **4 resume templates** — Executive, Modern, Minimal, Professional — all
  ATS-friendly (no tables, columns, icons or graphics inside the resume
  itself).
- **12 resume sections** — Essentials, Professional Summary, Work
  Experience, Projects, Skills, Education, Certifications, Achievements,
  Internships, Languages, Interests, and Extra-Curricular Activities — all
  repeatable where relevant (multiple jobs, projects, degrees, etc.).
- **Simulated AI features** (pure JavaScript, no API key / internet
  required):
  - **AI FIX** — rewrites your professional summary into a punchier,
    achievement-oriented paragraph using your title and top skills.
  - **AI BOOST** — rewrites experience/project bullet points from plain
    statements into stronger, achievement-oriented language.
  - **AI AUTO-TAG** — cleans, deduplicates and title-cases comma-separated
    skills, then renders them as tag chips in the preview.
  - **AI Resume Insights** — a live checklist (✓ / ⚠) of what's strong and
    what's missing in your resume.
- **Drag-and-drop section reordering** — change the order sections appear
  in the printed resume.
- **Resume completion meter** in the header.
- **Word/character counter** on the summary field.
- **Dark / light editor theme toggle** (the resume page itself always stays
  print-friendly white).
- **Save Draft / Load Draft / Clear Resume** using `localStorage` — your
  data is stored only in your own browser, nothing is uploaded anywhere.
- **Print Resume / Download PDF** — uses the browser's native print dialog
  (`window.print()`); dedicated print CSS hides the editor and prints only
  a clean A4 resume. Choose **"Save as PDF"** as the destination in the
  print dialog to download a PDF.
- Fully responsive, collapsible sections, toast notifications, smooth
  animations.

---

## 📁 File Structure

```
ExecutiveAI/
│
├── index.html      # App structure & markup
├── style.css        # All styling (layout, themes, templates, print CSS)
├── script.js        # All application logic (state, rendering, AI, ATS)
├── README.md         # This file
└── assets/            # Reserved for optional icons/images
```

---

## 🚀 Getting Started

No build step, no server, no dependencies to install.

1. Download/clone the `ExecutiveAI` folder.
2. Double-click **`index.html`** (or open it via `File → Open` in any
   modern browser — Chrome, Edge, Firefox, Safari).
3. Start typing in the **Essentials** section — the resume preview and ATS
   score update instantly on the right.

Font Awesome and Google Fonts are loaded from public CDNs, so an internet
connection is needed only for those (the app still functions offline,
just with fallback system fonts/icons).

---

## 🧠 How the "AI" Works

There is **no external AI API and no API key**. All "AI" features are
deterministic, rule-based JavaScript that:

- Detect passive/weak phrasing (e.g. "worked on", "responsible for") and
  replace it with strong action verbs (Spearheaded, Engineered, Delivered…).
- Append impact-oriented closing clauses to bullet points.
- Assemble a summary template from your job title and top listed skills.
- Normalize and deduplicate comma-separated skill lists.
- Score the resume and suggest missing keywords by matching your text
  against a curated list of common ATS keywords and role-based keyword
  sets.

This keeps the project fully offline-capable and free to run, while still
demonstrating "AI-style" text transformation logic for a course project.

---

## 🖨️ Printing / PDF Export

Click **Print Resume** or **Download PDF** (both open the browser's print
dialog). The print stylesheet:

- Hides the header, editor panel, ATS widget, and toasts.
- Shows only the resume preview.
- Forces A4 page size with resume-appropriate margins.

To save as a PDF file: in the print dialog, set **Destination** to
**"Save as PDF"**.

---

## 🎨 Design System

| Token            | Value                                   |
|------------------|------------------------------------------|
| Headings font     | Poppins (600–800 weight)                |
| Body font         | Inter (400–600 weight)                  |
| Sidebar/editor    | Dark navy (`#0b1020` → `#1e2743`)       |
| Resume paper      | Pure white with dark ink text            |
| AI accent         | Blue → Purple gradient (`#4f6bff` → `#8b5cf6`) |
| Corners           | Rounded (8–18px)                          |
| Shadows           | Soft, low-opacity                         |

The resume **content** itself intentionally avoids icons, progress bars,
multi-column layouts and heavy graphics — these are known to confuse many
real-world ATS parsers. All visual flourishes live in the app UI, not in
the exported resume.

---

## ⚙️ Data & Privacy

All resume data lives in memory and, optionally, in your browser's
`localStorage` (key: `executiveai_resume_draft_v1`) when you click
**Save Draft**. Nothing is sent to a server — this project has no backend.

---

## 🧩 Possible Extensions

- Export to `.docx` using a client-side library.
- More templates (two-column, timeline-style).
- A real LLM-backed "AI FIX"/"AI BOOST" via a secured backend proxy.
- Multi-resume management (save multiple named drafts).

---

Built with HTML5, CSS3 and vanilla JavaScript — no frameworks, no backend,
no API keys.
