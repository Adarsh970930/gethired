# 🛡️ UI/UX & State Persistence Execution Plan

## 🎯 Objectives
1. Fix the bug where `aiProvider` toggles (e.g., Gemini to Groq) revert to default upon page refresh.
2. Upgrade sensitive input fields (Gemini API Key, Groq API Key, SMTP App Password) with "Read-Only/Edit" and "Show/Hide Password" functionality.
3. Ensure **ZERO harm** to existing features (Data retention, sync intervals, job aggregator endpoints).

---

## 📋 Strict Checkpoints

### 💾 Phase 1: Backend State Investigation
- [ ] **Checkpoint 1.1: Verify `PUT /api/admin/settings`**
  - Read `routes/adminRoutes.js` to see how the `updates` object is merged into the Mongoose document.
  - Verify if `Object.assign()` correctly overwrites nested or new schema fields like `aiProvider`.
- [ ] **Checkpoint 1.2: Check Schema Defaults**
  - Ensure `models/Settings.js` schema defaults are not overriding the `PUT` request dynamically.

### 🎨 Phase 2: Frontend Logic (React State)
- [ ] **Checkpoint 2.1: Import Icons**
  - Add `HiOutlinePencil`, `HiOutlineEye`, and `HiOutlineEyeOff` from `react-icons/hi`.
- [ ] **Checkpoint 2.2: Add Security State Management**
  - Add `const [editMode, setEditMode] = useState({ gemini: false, groq: false, smtp: false });`
  - Add `const [showPass, setShowPass] = useState({ gemini: false, groq: false, smtp: false });`
  - Ensure existing `settings` state and `handleSave` remain completely untouched to protect previous logic.

### 🧩 Phase 3: UI Component Upgrades
- [ ] **Checkpoint 3.1: Upgrade Gemini API Key Field**
  - Wrap input in a flex container. 
  - Add `readOnly={!editMode.gemini}`.
  - Add toggle buttons for Edit & Eye.
- [ ] **Checkpoint 3.2: Upgrade Groq API Key Field**
  - Apply exact same logic for Groq.
- [ ] **Checkpoint 3.3: Upgrade SMTP App Password Field**
  - Apply exact same logic for SMTP.
- [ ] **Checkpoint 3.4: Auto-Lock on Save**
  - Inside `handleSave`, reset all `editMode` properties back to `false` upon a successful API call.

### 🚀 Phase 4: Compilation & Handover
- [ ] **Checkpoint 4.1: Production Build**
  - Run `npm run build` inside `/client` folder.
  - Ensure no syntax errors (like the previous JSX evaluation issue) occur during the Vite build.
- [ ] **Checkpoint 4.2: Final Sign-off**
  - Report back to the user to perform a hard refresh and test the toggles and API key edits.
