# 🚀 Get Hired — Agent Context & Developer Reference

> **Last Updated:** April 2026  
> **Purpose:** This document is written for AI agents and developers to fully understand the project context, architecture, existing features, and all details needed to continue modifying and extending this application WITHOUT needing to re-read every source file.

---

## 1. Project Overview

**Name:** Get Hired (internally also called "JobSeg Portal")  
**Tagline:** India's #1 Job Aggregator for Engineers & Students  
**Type:** Full-stack MERN web application (MongoDB, Express, React, Node.js)  
**Goal:** Automatically scrape & aggregate jobs from 6+ external sources and present them with a premium, India-focused UI with search, filters, bookmarks, application tracking, and a full admin panel.

### What It Does
- Automatically fetches jobs every 6 hours from 6 sources (Adzuna, Remotive, Arbeitnow, The Muse, RemoteOK, JSearch via RapidAPI)
- Stores all jobs in MongoDB with de-duplication using fingerprints
- Serves jobs via a REST API to a React frontend
- Focuses on India (Bangalore, Mumbai, Delhi, Hyderabad, Pune, etc.) and FAANG/WITCH/startup listings
- Allows users to register, login (JWT), bookmark jobs, and track applications
- Admin panel for managing jobs, users, and scrapers

---

## 2. Tech Stack

### Backend
| Tech | Version | Purpose |
|---|---|---|
| Node.js | v24+ | Runtime |
| Express.js | ^4.18 | Web framework |
| Mongoose | ^8.1 | ODM for MongoDB |
| MongoDB | Local (27017) | Database |
| bcryptjs | ^3.0 | Password hashing |
| jsonwebtoken | ^9.0 | JWT auth |
| node-cron | ^3.0 | Scheduled sync |
| cheerio | ^1.0 | HTML scraping |
| axios | ^1.6 | HTTP client |
| winston | ^3.11 | Logging |
| express-rate-limit | ^7.1 | Rate limiting |
| joi | ^17.13 | Input validation |
| p-limit | ^3.1 | Concurrency control |

### Frontend
| Tech | Version | Purpose |
|---|---|---|
| React | ^19.2 | UI framework |
| Vite | ^7.3 | Dev server & bundler |
| React Router | ^7.13 | Client-side routing |
| Axios | ^1.13 | API calls |
| react-hot-toast | ^2.6 | Toast notifications |
| react-icons | ^5.5 | Icon set (HeroIcons) |
| recharts | ^3.7 | Charts in admin dashboard |
| react-helmet-async | ^2.0 | SEO meta tags |

### Styling
- **Pure CSS** via a single large `client/src/index.css` file (~40KB)
- CSS custom properties (variables) for theming
- Dark mode default; Light mode toggle supported
- Responsive design with mobile-friendly layouts

---

## 3. Running the Project

### Prerequisites
- Node.js v16+
- MongoDB running locally on `mongodb://localhost:27017/jobseg-portal`

### Start Commands
```bash
# Backend (from project root) — runs on port 5001
export PATH=$PATH:/usr/local/bin && npm run dev

# Frontend (from client/) — runs on port 3000
export PATH=$PATH:/usr/local/bin && npm run dev
```

> **IMPORTANT:** `npm` is at `/usr/local/bin/npm`, NOT in the default PATH. Always prepend `export PATH=$PATH:/usr/local/bin &&` before npm commands.

### URLs
- **Frontend (Dev):** http://localhost:3000
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/health
- **Jobs API:** http://localhost:5001/api/jobs
- **Admin API:** http://localhost:5001/api/admin

---

## 4. Credentials

### Admin Account (verified working)
```
Email:    admin@jobseg.com
Password: admin123
```

### Backup Admin
```
Email:    admin@test.com
Password: password123
```

> **Note:** Admin password was reset on April 22, 2026. The bcrypt hash in MongoDB is correct.  
> If login fails again, run: `node makeAdmin.js` from project root to recreate the admin@test.com account.

### How to Reset Passwords
Create a script in the project root and run it. Mongoose/bcrypt are installed. Example:
```js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function reset() {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
        email: String,
        password: { type: String, select: false },
        role: String,
        isActive: Boolean
    }));
    const user = await User.findOne({ email: 'admin@jobseg.com' });
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash('admin123', salt);
    await user.save();
    console.log('Done');
    process.exit(0);
}
reset();
```

---

## 5. Full Project File Structure

```
job-aggregator-ui-optimized-backup/
│
├── index.js                  # Main server entry point (Express app factory + standalone mode)
├── makeAdmin.js              # Utility: create/promote admin@test.com
├── package.json              # Backend dependencies & scripts
├── .env                      # Environment variables (see Section 6)
├── .env.example              # Template for .env
├── HANDOVER.md               # Original handover notes
├── PROGRESS.md               # Original progress tracking
├── AGENT_CONTEXT.md          # This file (agent context)
│
├── config/
│   ├── index.js              # All config from .env (port, scraper settings, scheduler cron, rate limits)
│   ├── database.js           # Mongoose connection logic
│   └── sources.js            # Scraper source configurations + default search queries
│
├── models/                   # Mongoose schemas
│   ├── User.js               # User schema (name, email, password, role, skills, preferences, isActive)
│   ├── Job.js                # Job schema (title, company, location, salary, skills, source, fingerprint, etc.)
│   ├── Application.js        # Application tracking schema (user, job, status, notes, timeline)
│   ├── Bookmark.js           # Bookmark schema (user, job, notes)
│   ├── Source.js             # Scraper source config schema (name, lastSyncAt, stats)
│   └── SyncLog.js            # Sync run history schema (source, status, counts, errors)
│
├── routes/
│   ├── authRoutes.js         # /api/auth: register, login, /me, profile update, password change
│   ├── jobRoutes.js          # /api/jobs: list, search, stats, filters, categories, locations, skills, /:id, /:id/similar
│   ├── bookmarkRoutes.js     # /api/bookmarks: CRUD, /check/:jobId, /ids
│   ├── applicationRoutes.js  # /api/applications: CRUD, status updates, timeline, stats
│   └── adminRoutes.js        # /api/admin: stats, analytics, jobs CRUD, bulk actions, users, sync, scheduler, logs
│
├── middleware/
│   ├── auth.js               # JWT: generateToken, authRequired, authOptional, adminRequired
│   ├── rateLimiter.js        # apiLimiter (100 req/15min), adminLimiter (1000 req/15min)
│   ├── errorHandler.js       # Global error handler + 404 handler
│   └── validator.js          # Joi validation schemas for jobSearch, jobId, syncSource
│
├── services/
│   ├── JobAggregator.js      # Main orchestrator: syncAll(), syncSource(), cleanupExpiredJobs(), getSyncStatus()
│   ├── Scheduler.js          # node-cron scheduler: Full sync every 6h, cleanup daily at 2AM IST
│   ├── DuplicateDetector.js  # Fingerprint-based dedup: filterDuplicates(), isDuplicate(), upsertJob()
│   ├── FilterService.js      # getStats(), getFilterOptions(), getCategories(), getLocations(), getTrendingSkills()
│   └── AnalyticsService.js   # getDashboardStats(): jobDistribution, locationStats, dailyGrowth, userGrowth (30 days)
│
├── scrapers/
│   ├── BaseScraper.js        # Abstract base class for all scrapers (common fetch logic)
│   ├── index.js              # Factory: createScraper(name), createAllScrapers()
│   ├── AdzunaScraper.js      # Adzuna API (needs API key in .env)
│   ├── RemotiveScraper.js    # Remotive API (free, no key needed)
│   ├── ArbeitnowScraper.js   # Arbeitnow API (free, no key needed)
│   ├── TheMuseScraper.js     # The Muse API (free, no key needed)
│   ├── RemoteOKScraper.js    # RemoteOK API (free, no key needed)
│   └── JSearchScraper.js     # JSearch via RapidAPI (needs API key in .env)
│
├── utils/
│   ├── constants.js          # JOB_TYPES, EXPERIENCE_LEVELS, JOB_CATEGORIES, TECH_SKILLS, CATEGORY_KEYWORDS
│   ├── helpers.js            # generateFingerprint(), normalizeJob(), extractSkills(), categorizeJob(), etc.
│   └── logger.js             # Winston logger (info, error, debug → logs/job-aggregator.log)
│
├── scripts/
│   ├── seedSources.js        # Seeds Source documents in MongoDB
│   └── manualSync.js         # Manually trigger a full sync from CLI
│
├── logs/                     # Auto-generated log files
│
└── client/                   # React Frontend (Vite)
    ├── vite.config.js         # Vite config. API proxy: /api → http://localhost:5001
    ├── index.html             # HTML entry point
    │
    └── src/
        ├── main.jsx           # React entry: mounts <App />
        ├── App.jsx            # Router config, layouts, all route definitions
        ├── index.css          # ALL styling (~40KB). CSS variables for theming, component styles
        │
        ├── context/
        │   ├── AuthContext.jsx    # Global auth: user, token, login(), logout(), register(), updateProfile()
        │   └── ThemeContext.jsx   # Dark/light theme: theme, toggleTheme(). Persisted in localStorage.
        │
        ├── components/
        │   ├── Navbar.jsx         # Top nav; user dropdown with Dashboard/Saved/Applications/Admin/Profile/Logout
        │   ├── Footer.jsx         # Simple site footer
        │   ├── AdminLayout.jsx    # Admin panel layout (sidebar nav, header). Guards: isAuthenticated + role==='admin'
        │   ├── JobCard.jsx        # Job listing card with bookmark toggle, apply link, skills, timeAgo
        │   ├── JobDetailModal.jsx # Full job detail modal (description, apply button, bookmark, track)
        │   ├── JobList.jsx        # Simple list wrapper for JobCards
        │   ├── SearchSection.jsx  # Search bar + filter dropdowns (jobType, experience, category, remote, postedWithin)
        │   ├── Sidebar.jsx        # Sidebar for jobs page (filter options)
        │   ├── StatsBar.jsx       # Stats summary bar (total jobs, companies, etc.)
        │   ├── SEO.jsx            # Helmet wrapper for dynamic meta tags (title, description, keywords, OG)
        │   ├── Skeleton.jsx       # Loading skeletons: SkeletonCard, SkeletonDetail, SkeletonStats
        │   └── ThemeToggle.jsx    # Dark/light mode toggle button
        │
        └── pages/
            ├── LandingPage.jsx      # Hero section, stats, featured jobs, category grid, sources section
            ├── JobsPage.jsx         # Main job board: search, filters, job list, pagination
            ├── JobDetailPage.jsx    # Full job detail view with sidebar (similar jobs, company info)
            ├── LoginPage.jsx        # Login form
            ├── RegisterPage.jsx     # Register form
            ├── DashboardPage.jsx    # User dashboard: stats cards + recent bookmarks + recent applications
            ├── SavedJobsPage.jsx    # All bookmarked jobs
            ├── ApplicationsPage.jsx # All tracked applications with status filter and status updater
            ├── ProfilePage.jsx      # Profile editor (name, bio, skills) + password change
            ├── NotFoundPage.jsx     # 404 page
            │
            └── admin/
                ├── AdminDashboard.jsx  # System overview: stats cards, Pie chart (jobs by source), Area chart (30-day trend), recent syncs table, cleanup button
                ├── AdminJobs.jsx       # Job content manager: search, add new job, edit/toggle/delete per row, bulk actions
                ├── AdminUsers.jsx      # User management: list all users, toggle role (user↔admin), ban/unban
                └── AdminSources.jsx    # Scraper control: source cards with last run info, Force Sync per source, Sync All, sync logs table with pagination
```

---

## 6. Environment Variables (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jobseg-portal
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET=jobseg_super_secret_key_2026_xK9mP2nQ
JWT_EXPIRE=30d

# Adzuna API (Optional — get free keys at developer.adzuna.com)
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
ADZUNA_COUNTRY=in

# JSearch / RapidAPI (Optional — get free key at rapidapi.com)
JSEARCH_API_KEY=

# Scraper Settings
SYNC_INTERVAL_HOURS=6
SYNC_ON_STARTUP=true
MAX_JOBS_PER_SOURCE=200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
```

---

## 7. All Frontend Routes

| Path | Component | Access | Description |
|---|---|---|---|
| `/` | LandingPage | Public | Hero, stats, featured jobs, category grid |
| `/jobs` | JobsPage | Public | Full job board with search & filters |
| `/jobs/:id` | JobDetailPage | Public | Full job details; bookmark/apply/track |
| `/login` | LoginPage | Public | Login form |
| `/register` | RegisterPage | Public | Registration form |
| `/dashboard` | DashboardPage | Auth required | User activity overview |
| `/saved` | SavedJobsPage | Auth required | Bookmarked jobs |
| `/applications` | ApplicationsPage | Auth required | Application tracker |
| `/profile` | ProfilePage | Auth required | Profile & password settings |
| `/admin` | AdminDashboard | Admin only | System overview & charts |
| `/admin/jobs` | AdminJobs | Admin only | Job content management |
| `/admin/users` | AdminUsers | Admin only | User management |
| `/admin/sources` | AdminSources | Admin only | Scraper control & logs |

---

## 8. All Backend API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | None | Register new user |
| POST | `/login` | None | Login → returns JWT token |
| GET | `/me` | Required | Get current user profile |
| PUT | `/profile` | Required | Update name, bio, skills, preferences, avatar |
| PUT | `/password` | Required | Change password |

### Job Routes (`/api/jobs`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | None | List active jobs (paginated, filtered) |
| GET | `/search` | None | Advanced search with all filter params |
| GET | `/stats` | None | Platform statistics |
| GET | `/filters` | None | Available filter options for dropdowns |
| GET | `/categories` | None | Job categories with counts |
| GET | `/locations` | None | Locations with counts |
| GET | `/skills` | None | Trending skills list |
| GET | `/:id` | None | Full job details |
| GET | `/:id/similar` | None | Similar jobs by category & skills |

**Job Search Query Params:**
`q`, `jobType`, `experienceLevel`, `category`, `location`, `remote`, `salaryMin`, `salaryMax`, `skills`, `postedWithin`, `company`, `isInternational`, `page`, `limit`, `sort` (newest/oldest/salary_high/salary_low/relevant/company)

### Bookmark Routes (`/api/bookmarks`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Required | Get all bookmarks (paginated) |
| POST | `/:jobId` | Required | Bookmark a job |
| DELETE | `/:jobId` | Required | Remove bookmark |
| GET | `/check/:jobId` | Required | Check if job is bookmarked |
| GET | `/ids` | Required | Get all bookmarked job IDs (for frontend state) |

### Application Routes (`/api/applications`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Required | Get user's applications with stats |
| POST | `/` | Required | Track new application (body: `{jobId, notes, coverLetter}`) |
| PUT | `/:id` | Required | Update status/notes; appends to timeline |
| DELETE | `/:id` | Required | Remove application tracking |

**Application Statuses:** `applied`, `interviewing`, `offered`, `rejected`, `withdrawn`, `accepted`

### Admin Routes (`/api/admin`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Dashboard: total jobs, active jobs, users, recent syncs |
| GET | `/analytics` | Admin | Advanced charts data (distribution, growth, location split) |
| GET | `/jobs` | Admin | All jobs (paginated, searchable) |
| POST | `/jobs` | Admin | Manually create a new job |
| PUT | `/jobs/:id` | Admin | Edit a job |
| DELETE | `/jobs/:id` | Admin | Delete a job |
| PUT | `/jobs/:id/toggle` | Admin | Toggle job isActive status |
| POST | `/jobs/bulk` | Admin | Bulk actions: `{action: 'delete'|'activate'|'deactivate', jobIds: [...]}` |
| DELETE | `/jobs/expired` | Admin | Deactivate all expired/old jobs |
| GET | `/sources` | Admin | List all scraper sources |
| POST | `/jobs/sync` | Admin | Trigger full sync of all sources |
| POST | `/jobs/sync/:source` | Admin | Trigger sync for one source |
| GET | `/jobs/sync/status` | Admin | Get current sync status & logs |
| POST | `/scheduler/start` | Admin | Start cron scheduler |
| POST | `/scheduler/stop` | Admin | Stop cron scheduler |
| GET | `/users` | Admin | List all users (no passwords) |
| PUT | `/users/:id/role` | Admin | Toggle user role (user ↔ admin) |
| PUT | `/users/:id/deactivate` | Admin | Toggle user isActive (ban/unban) |
| GET | `/logs` | Admin | Sync log history (paginated) |

> **IMPORTANT:** Admin routes currently use only `adminLimiter` (rate limit). They do NOT use the `authRequired` + `adminRequired` middleware. This means the admin API is rate-limited but NOT authentication-enforced on the backend. The frontend AdminLayout component handles the access guard (role check). If adding backend auth enforcement, add `authRequired, adminRequired` middleware to adminRoutes.

---

## 9. Data Models (Schemas)

### User
```js
{
    name: String,           // required, 2-50 chars
    email: String,          // required, unique, lowercase
    password: String,       // bcrypt hashed, select: false (not returned by default)
    role: 'user' | 'admin', // default: 'user'
    avatar: String,
    bio: String,            // max 300 chars
    skills: [String],
    preferences: {
        jobTypes: [String],
        locations: [String],
        experienceLevels: [String],
        categories: [String],
        remoteOnly: Boolean,
        salaryMin: Number
    },
    isActive: Boolean,      // false = banned
    lastLogin: Date,
    createdAt, updatedAt
}
```

### Job
```js
{
    title: String,
    company: { name, logo, website, verified },
    description: String,
    shortDescription: String,
    jobType: 'internship'|'full-time'|'part-time'|'contract'|'freelance',
    experienceLevel: 'fresher'|'junior'|'mid'|'senior'|'lead'|'executive',
    category: 'engineering'|'design'|'data-science'|'devops'|'marketing'|'sales'|'finance'|'hr'|'product'|'customer-support'|'writing'|'operations'|'other',
    location: { city, state, country, remote: Boolean, hybrid: Boolean },
    isInternational: Boolean,  // jobs NOT in India AND not remote
    salary: { min, max, currency: 'INR'|'USD'|'EUR'|'GBP', period: 'hourly'|'monthly'|'yearly' },
    source: { name, url, externalId, fetchedAt },
    skills: [String],
    education: String,
    experience: { min, max },   // years
    postedDate: Date,
    expiryDate: Date,
    tags: [String],
    slug: String,
    applyUrl: String,
    isActive: Boolean,
    fingerprint: String,        // unique; used for deduplication
    createdAt, updatedAt
}
// Virtual: salaryFormatted (returns "₹5L - ₹10L yearly")
// Static: findWithFilters(filters, options) — full search with all filters
// Full-text index on: title (weight 10), company.name (5), skills (3), tags (2), description (1)
```

### Application
```js
{
    user: ObjectId → User,
    job: ObjectId → Job,
    status: 'applied'|'interviewing'|'offered'|'rejected'|'withdrawn'|'accepted',
    appliedAt: Date,
    notes: String,
    resumeUrl: String,
    coverLetter: String,
    timeline: [{ status, date, note }],
    createdAt, updatedAt
}
// Unique index: { user, job } — one application per user per job
```

### Bookmark
```js
{
    user: ObjectId → User,
    job: ObjectId → Job,
    notes: String,
    createdAt
}
// Unique index: { user, job }
```

### Source
```js
{
    name: String,           // unique, lowercase (e.g. 'adzuna')
    displayName: String,    // (e.g. 'Adzuna')
    type: 'api'|'scraper',
    baseUrl: String,
    isActive: Boolean,
    lastSyncAt: Date,
    totalJobsFetched: Number,
    rateLimit: { maxRequests, perSeconds },
    stats: { successfulSyncs, failedSyncs, avgJobsPerSync, lastError },
    config: Mixed
}
```

### SyncLog
```js
{
    source: String,
    startedAt: Date,
    completedAt: Date,
    status: 'running'|'completed'|'failed'|'partial',
    jobsFetched: Number,
    jobsNew: Number,
    jobsUpdated: Number,
    jobsDuplicate: Number,
    errors: [String],
    metadata: Mixed
}
// TTL index: auto-deleted after 30 days
```

---

## 10. Job Scraper Sources

| Source | API Type | Auth Needed | Rate Limit | Focus |
|---|---|---|---|---|
| **Adzuna** | REST API | Yes (App ID + Key) | 250/day | India + global |
| **Remotive** | REST API | No | 100/hour | Remote jobs |
| **Arbeitnow** | REST API | No | 60/hour | EU + global |
| **The Muse** | REST API | No | 500/hour | Verified companies |
| **RemoteOK** | REST API | No | 60/hour | Remote-first |
| **JSearch** | RapidAPI | Yes (RapidAPI key) | 500/month | Global aggregation |

### Sync Search Queries (India-focused)
The system runs these searches to get India-specific results:
- **India cities:** "software developer india", "engineer bangalore", "developer mumbai", etc.
- **WITCH:** wipro, infosys, tcs, cognizant, hcl technologies
- **FAANG:** google, amazon, microsoft, apple, meta, netflix
- **Indian startups:** flipkart, swiggy, razorpay, zerodha, cred, phonepe, zomato, ola
- **Freshers:** "fresher software engineer", "entry level developer", "software intern", etc.

### India Detection Logic
`isIndiaLocation()` in `JobAggregator.js` detects India jobs using regex matching against 100+ city/state names. Non-India, non-remote jobs are flagged `isInternational: true` and hidden by default (toggle available in the UI).

### Deduplication
Jobs get a `fingerprint` hash based on title + company + location. The `DuplicateDetector` service checks this against existing DB records before inserting. `insertMany` with `ordered: false` handles any race-condition duplicates.

### Scheduler
- Uses `node-cron` with `Asia/Kolkata` timezone
- Full sync: `0 */6 * * *` (every 6 hours)
- Cleanup: `0 2 * * *` (daily at 2 AM IST)
- Cleanup deactivates jobs older than 60 days or past their `expiryDate`

---

## 11. Authentication & Authorization

### JWT Flow
1. User logs in → server returns `{user, token}` 
2. Frontend stores token as `gethired_token` in `localStorage`
3. Axios default header: `Authorization: Bearer <token>`
4. `authRequired` middleware verifies token and attaches `req.user`

### Roles
- `user` — Standard user (jobs, bookmarks, applications, profile)
- `admin` — Full access including admin panel

### Admin Guard (Frontend)
`AdminLayout.jsx` uses `useEffect` to check:
- `!isAuthenticated` → redirect to `/login`
- `user.role !== 'admin'` → redirect to `/dashboard`

### Backend Guard
**WARNING:** Admin API routes currently only have `adminLimiter` (rate limit). They do NOT enforce JWT auth on the backend. This is a known gap — the frontend handles role checking but the API itself is unprotected. To fix this, add `authRequired, adminRequired` middleware in `adminRoutes.js`.

---

## 12. Frontend State Management

### AuthContext (Global)
```js
{
    user,           // Current user object (null if not logged in)
    token,          // JWT token from localStorage
    loading,        // Initial auth check loading state
    isAuthenticated, // Boolean
    login(email, password),
    register(name, email, password, skills),
    logout(),
    updateProfile(data),
    fetchUser()
}
```

### ThemeContext (Global)
```js
{
    theme,           // 'dark' | 'light'
    toggleTheme()   // Toggles and saves to localStorage as 'app-theme'
}
```
Note: `ThemeContext` exists but is NOT currently wired as a Provider in `App.jsx`. The `ThemeToggle` component directly manipulates `document.documentElement` attributes and uses `localStorage` independently. Check this before adding new theme-sensitive features.

---

## 13. CSS Design System

All styles are in `client/src/index.css`. Key CSS variables:

```css
/* Colors */
--bg-primary        /* Main page background */
--bg-card           /* Card backgrounds */
--bg-secondary      /* Sidebar, secondary BG */
--bg-input          /* Input fields */
--text-primary      /* Main text */
--text-secondary    /* Muted text labels */
--text-heading      /* Headings */
--text-muted        /* Very muted text */
--border            /* Border color */
--accent            /* Primary accent (#6366f1 — indigo) */
--accent-light      /* Accent with opacity */
--success, --warning, --danger, --info
--success-light, --warning-light, --danger-light, --info-light

/* Typography */
font-family: 'Inter', system-ui, sans-serif

/* Key utility classes */
.container, .card, .btn, .btn-primary, .btn-ghost, .btn-sm
.badge, .badge-primary, .badge-skill, .badge-info, etc.
.skeleton, .skeleton-line, .skeleton-badge  (shimmer effect)
.form-input, .form-group, .form-label
.jobs-grid                          /* Responsive grid for job cards */
.admin-layout, .admin-sidebar, .admin-card, .admin-table, .admin-stat-card
```

---

## 14. Known Issues / Gaps

1. **Admin API not auth-protected on backend** — The `/api/admin/*` routes only apply `adminLimiter` but not `authRequired + adminRequired`. Anyone who knows the API endpoints can call them.

2. **PROGRESS.md shows incomplete tasks** — Profile Page (5.9), Admin Panel (5.10), skeleton loaders (6.1), and SEO (6.4) were marked incomplete, but they ARE implemented now. The PROGRESS.md is outdated.

3. **ThemeContext not connected** — `ThemeContext.jsx` exists but is not used as a Provider. `ThemeToggle.jsx` directly sets `data-theme` attribute on `document.documentElement`.

4. **Adzuna & JSearch need API keys** — Without `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, and `JSEARCH_API_KEY` in `.env`, those scrapers will return 0 jobs. The other 4 sources (Remotive, Arbeitnow, The Muse, RemoteOK) are free and work without any keys.

5. **Rate limit on admin routes is very permissive** — `adminLimiter` allows 1000 requests per 15 minutes.

6. **No email verification** — User registration doesn't require email verification.

7. **No file upload** — `resumeUrl` field exists in Application model but there's no file upload endpoint. It accepts a URL string only.

---

## 15. Key Design Decisions

- **India-first filtering:** By default, `isInternational: true` jobs are excluded from the main job feed. Users can toggle "International Jobs" to see them. This keeps the feed relevant for Indian users.
- **Fingerprint dedup:** Instead of checking title+company+location as separate fields, a single `fingerprint` hash is generated. This is stored as a unique index in MongoDB, preventing duplicate entries even under concurrent inserts.
- **Scraper concurrency via p-limit:** Not all scrapers run at once. Jobs are fetched with query iteration, and batch inserts of 100 are used to avoid overwhelming MongoDB.
- **Admin panel has no separate auth route** — Admins log in via the same `/api/auth/login` endpoint. Role is returned in the user object and the admin panel is shown conditionally in the navbar.
- **Local storage for JWT** — Token stored as `gethired_token`. This is standard but be aware it's vulnerable to XSS. For production, consider httpOnly cookies.

---

## 16. Quick Reference: Adding Features

### Adding a new scraper source
1. Create `scrapers/NewSourceScraper.js` extending `BaseScraper`
2. Register it in `scrapers/index.js` in the `createScraper()` factory
3. Add config to `config/sources.js`
4. Add a `Source` record to MongoDB (auto-seeded via `seedSources()` in `index.js`)

### Adding a new API endpoint
1. Create/modify a file in `routes/`
2. Register in `index.js` via `app.use('/api/newroute', ...)`

### Adding a new frontend page
1. Create file in `client/src/pages/`
2. Add a `<Route>` in `client/src/App.jsx`
3. Import and add a nav link in `Navbar.jsx` if needed

### Adding new admin features
1. Add endpoint in `routes/adminRoutes.js`
2. Add UI in the appropriate admin page (`client/src/pages/admin/`)
3. If it's a new section, add a new file and register route in `App.jsx` under `/admin`

---

*Document generated: April 23, 2026 — Covers complete project state as of this date.*
