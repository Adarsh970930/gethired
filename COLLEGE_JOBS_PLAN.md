# 🎓 College Jobs & Mass Email Engine Execution Plan

## 🎯 Objectives
1. Introduce a "College Exclusive" job type managed manually by the Admin.
2. Implement a background Mass Email Blast engine that safely notifies all active students of new College Jobs.
3. Integrate a "College Exclusive" quick-filter into the User Dashboard for easy discovery.
4. Integrate dynamic Mass Email Controls & Job Posting toggles in the Admin Dashboard.
5. **Zero Harm Policy:** Ensure 100% compatibility with existing scraped jobs and data cleanup protocols.

---

## 📋 Strict Checkpoints & Progress Tracker

### 💾 Phase 1: Database Architecture Upgrades
- [x] **Job Model (`models/Job.js`)**: Add `isCollegeExclusive: { type: Boolean, default: false, index: true }`.
- [x] **Job Query Engine**: Update `jobSchema.statics.findWithFilters` to natively support the `isCollegeExclusive` boolean filter.
- [x] **Settings Model (`models/Settings.js`)**: Add new schema fields: `massEmailEnabled`, `massEmailSubject`, and `massEmailTemplate`.

### 📧 Phase 2: Non-Blocking Mass Email Engine
- [x] **EmailService (`services/emailService.js`)**: Implement `sendMassCollegeAlert(job)` static method.
- [x] **Batching/Non-blocking Loop**: Add logic to fetch all active users (`User.find({isActive: true})`) and send personalized emails without blocking the Node.js event loop or hitting standard SMTP timeout blocks.

### 🔌 Phase 3: Backend API Integration
- [x] **Admin Manual Job Post (`routes/adminRoutes.js`)**: Update `POST /api/admin/jobs` to accept and save the `isCollegeExclusive` flag.
- [x] **Trigger Automation**: Wire the route so that if `isCollegeExclusive` is true, it calls `EmailService.sendMassCollegeAlert(job)` in the background right after saving.
- [x] **Settings API Consistency**: Double-check that `PUT /api/admin/settings` smoothly handles the new mass email settings fields.

### 🖥️ Phase 4: Frontend Admin UX & Controls
- [x] **Admin Settings (`AdminSettings.jsx`)**: Add a new configuration block for "Mass Student Alerts (College Jobs)" right beneath the existing email acknowledgement section.
- [x] **Admin Job Posting Form**: Locate the manual job posting modal/page and add a visual toggle: `🎓 Mark as College-Exclusive Job`.

### 👨‍🎓 Phase 5: User Dashboard Filtering
- [x] **User Job Feed**: Add a sleek "🎓 College Exclusive" pill/tab next to existing filters (like Remote/International).
- [x] **API Integration**: Ensure selecting the tab dynamically passes `isCollegeExclusive=true` to the backend and fetches the real-time manual jobs.

---
*Note: I will update these checkboxes as I complete them to ensure a systematic, hallucination-free development process.*
