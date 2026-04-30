# 📧 Dynamic Admin-Controlled "Application Acknowledgement Email" System

## 🚀 Context
This plan outlines the integration of a dynamic, admin-controlled email system for the **Get Hired** job portal. When a user applies for a job, they should receive an automated HTML acknowledgement email. 
Crucially, all email credentials (SMTP) and the email content (templates) must be managed dynamically from the **Admin Dashboard**, rather than being hardcoded in `.env`.

## 🎯 Target Architecture
1. **Database:** A `Settings` model to store email configurations.
2. **Backend API:** Admin routes to `GET` and `PUT` email settings.
3. **Service Layer:** A `nodemailer` service that reads settings from the DB to send emails.
4. **Integration:** Triggered from the "Apply" job endpoint.
5. **Frontend UI:** An "Email Settings" form inside the Admin Dashboard.

---

## 📋 Detailed Execution Plan & Checkpoints

### 🛠️ Phase 1: Backend Foundations (Database & APIs)
- [ ] **Checkpoint 1.1: Create `models/Settings.js`**
  - Create a Mongoose schema containing `emailEnabled` (Boolean), `smtpUser`, `smtpPass`, `emailSubject`, and `emailBodyTemplate`.
- [ ] **Checkpoint 1.2: Create Settings Controller & Routes**
  - Implement a `GET` API (to fetch settings) and a `PUT` API (to update settings).
- [ ] **Checkpoint 1.3: Mount Routes in Express**
  - Mount the newly created routes in the main `index.js` or `server.js` under `/api/settings` or `/api/admin/settings`. Verify the mount.

### 📧 Phase 2: Nodemailer Email Service
- [ ] **Checkpoint 2.1: Check Dependencies**
  - Verify if `nodemailer` is present in `package.json`. If not, install it.
- [ ] **Checkpoint 2.2: Create `services/emailService.js`**
  - Implement a dynamic nodemailer transport function. It should fetch SMTP credentials directly from the `Settings` model in the database.
- [ ] **Checkpoint 2.3: Template Processing Logic**
  - Add logic to replace placeholders (e.g., `{{userName}}`, `{{jobTitle}}`) in the HTML template with actual user and job data. Ensure robust error handling so the main application does not crash on email failure.

### 🔗 Phase 3: Application Route Integration
- [ ] **Checkpoint 3.1: Locate Apply Route**
  - Identify and review the existing "Apply for Job" API route.
- [ ] **Checkpoint 3.2: Inject Email Service**
  - Immediately after a successful job application (database entry), trigger `emailService.sendApplicationEmail()` in the background (non-blocking).

### 💻 Phase 4: Frontend Admin UI Integration
- [ ] **Checkpoint 4.1: Locate `AdminSettings.jsx`**
  - Check the structure of `client/src/pages/admin/AdminSettings.jsx`.
- [ ] **Checkpoint 4.2: Build Configuration Form**
  - Add UI components: Toggle Switch (Enable/Disable), Text Inputs (Email, Password, Subject), and a Textarea (Email HTML Template).
- [ ] **Checkpoint 4.3: Connect to Backend APIs**
  - Use `useEffect` to fetch current settings. Configure the "Save" button to send a `PUT` request to update the settings.
- [ ] **Checkpoint 4.4: Final E2E Test**
  - Test the complete flow from the Admin dashboard: enable the system, configure credentials, apply for a job as a user, and verify email reception.

---
**Status:** Ready to commence Phase 1.
