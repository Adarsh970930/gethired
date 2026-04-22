# 🚀 Job Aggregator Module

A powerful, plug-and-play Node.js module that automatically scrapes and aggregates job listings from **6+ trusted sources** — designed to integrate seamlessly with your **MERN Stack Job Portal**.

---

## ✨ Features

- 🤖 **Auto-scraping** from 6 trusted job APIs (Adzuna, Remotive, Arbeitnow, The Muse, RemoteOK, JSearch)
- 🔄 **Scheduled syncing** with cron jobs (every 6 hours)
- 🧹 **Auto-cleanup** of expired/old jobs
- 🔍 **Advanced search** with full-text search and 10+ filter options
- 🎯 **Smart categorization** — auto-detects job type, experience level, category
- 💡 **Skill extraction** — extracts tech skills from job descriptions
- 🛡️ **Duplicate detection** — fingerprint-based dedup across sources
- 📊 **Dashboard stats** — job counts, trending skills, source stats
- ⚡ **MERN ready** — just plug into your existing Express app
- 💰 **Salary parsing** — supports LPA, K, Crore formats (Indian salary formats)

---

## 📦 Quick Start

### 1. Install Dependencies

```bash
cd job-aggregator
npm install
```

### 2. Configure API Keys

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

**Required API Keys (Free to get):**

| API | Sign Up Link | Free Tier |
|-----|-------------|-----------|
| **Adzuna** | [developer.adzuna.com](https://developer.adzuna.com/) | 250 requests/day |
| **JSearch** | [rapidapi.com/jsearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) | 500 requests/month |

> ⚠️ **Note:** Remotive, Arbeitnow, RemoteOK, and The Muse work **without any API keys!**

### 3. Run Standalone (Optional)

```bash
# Make sure MongoDB is running
npm run dev
```

Server will start at `http://localhost:5001`

### 4. Trigger First Sync

```bash
# Sync all sources
npm run sync

# Or sync a specific source (that doesn't need API keys)
node scripts/manualSync.js remotive
node scripts/manualSync.js remoteok
node scripts/manualSync.js arbeitnow
```

---

## 🔗 MERN Integration Guide

### Step 1: Copy the module

Copy the `job-aggregator` folder into your MERN project:

```
your-mern-app/
├── client/           (React frontend)
├── server/           (Express backend)
├── job-aggregator/   ← Copy here
└── package.json
```

### Step 2: Install dependencies in your main project

```bash
cd your-mern-app
npm install axios cheerio cors dotenv express-rate-limit joi mongoose node-cron p-limit winston
```

### Step 3: Add environment variables

Add these to your existing `.env`:

```env
# Job Aggregator
ADZUNA_APP_ID=your_id
ADZUNA_APP_KEY=your_key
JSEARCH_API_KEY=your_rapidapi_key
```

### Step 4: Integrate in your Express server

```javascript
// server.js or app.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Your existing middleware
app.use(express.json());
app.use(cors());

// ========== Job Aggregator Integration ==========
const jobAggregator = require('./job-aggregator');

// Mount job routes
app.use('/api/jobs', jobAggregator.jobRoutes);

// Mount admin routes (for sync management)
app.use('/api/admin', jobAggregator.createAdminRoutes(
  jobAggregator.aggregator,
  jobAggregator.scheduler
));

// Start the aggregator (after DB connection)
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('DB Connected');
  
  // Start job aggregator module
  await jobAggregator.start({
    startScheduler: true,   // Auto-sync every 6 hours
    runInitialSync: false,   // Set true for first run
  });
  
  app.listen(5000, () => console.log('Server running'));
});
```

**That's it! 🎉**

---

## 📡 API Endpoints

### Public Endpoints

#### List Jobs
```
GET /api/jobs?page=1&limit=20&sort=newest
```

#### Search & Filter
```
GET /api/jobs/search?q=react developer&jobType=full-time&experienceLevel=fresher&location=Mumbai&remote=true&salaryMin=500000&skills=react,nodejs&postedWithin=7&sort=newest
```

#### Get Job Detail
```
GET /api/jobs/:id
```

#### Get Similar Jobs
```
GET /api/jobs/:id/similar
```

#### Get Filter Options (for dropdowns)
```
GET /api/jobs/filters
```

#### Get Dashboard Stats
```
GET /api/jobs/stats
```

#### Get Categories
```
GET /api/jobs/categories
```

#### Get Locations
```
GET /api/jobs/locations
```

#### Get Trending Skills
```
GET /api/jobs/skills
```

### Admin Endpoints

#### Trigger Full Sync
```
POST /api/admin/jobs/sync
```

#### Sync Specific Source
```
POST /api/admin/jobs/sync/remotive
POST /api/admin/jobs/sync/adzuna
POST /api/admin/jobs/sync/remoteok
```

#### Check Sync Status
```
GET /api/admin/jobs/sync/status
```

#### Cleanup Expired Jobs
```
DELETE /api/admin/jobs/expired
```

#### Start/Stop Scheduler
```
POST /api/admin/scheduler/start
POST /api/admin/scheduler/stop
```

---

## 🔍 Filter Options

| Filter | Parameter | Example Values |
|--------|-----------|---------------|
| **Keyword** | `q` | react developer, python |
| **Job Type** | `jobType` | internship, full-time, part-time, contract, freelance |
| **Experience** | `experienceLevel` | fresher, junior, mid, senior, lead, executive |
| **Category** | `category` | engineering, design, marketing, data-science, devops |
| **Location** | `location` | Mumbai, Bangalore, USA |
| **Remote** | `remote` | true, false |
| **Min Salary** | `salaryMin` | 500000 (yearly in INR) |
| **Max Salary** | `salaryMax` | 1500000 |
| **Skills** | `skills` | react,nodejs,mongodb |
| **Posted Within** | `postedWithin` | 7 (days) |
| **Company** | `company` | Google, TCS |
| **Sort** | `sort` | newest, oldest, salary_high, salary_low, relevant |

---

## 🎯 Job Categories

| Category | Description |
|----------|------------|
| `engineering` | Software, Web, Mobile, Backend, Frontend |
| `design` | UI/UX, Graphic, Visual, Product Design |
| `data-science` | ML, AI, Data Engineering, Analytics |
| `devops` | Cloud, SRE, CI/CD, Infrastructure |
| `marketing` | Digital Marketing, SEO, Content |
| `sales` | Business Development, Account Management |
| `finance` | Accounting, Financial Analysis |
| `hr` | Human Resources, Recruitment |
| `product` | Product Management, Project Management |
| `customer-support` | Customer Service, Help Desk |
| `writing` | Content Writing, Technical Writing |
| `operations` | Operations, Logistics, Admin |
| `other` | Miscellaneous |

---

## 📊 React Frontend Examples

### Fetch Jobs with Filters
```javascript
// Using Axios in your React component
import axios from 'axios';

const fetchJobs = async (filters) => {
  const response = await axios.get('/api/jobs/search', { params: filters });
  return response.data;
};

// Usage
const jobs = await fetchJobs({
  jobType: 'internship',
  experienceLevel: 'fresher',
  category: 'engineering',
  location: 'Mumbai',
  sort: 'newest',
  page: 1,
  limit: 20,
});
```

### Load Filter Options
```javascript
const loadFilters = async () => {
  const response = await axios.get('/api/jobs/filters');
  const { jobTypes, experienceLevels, categories, locations, trendingSkills } = response.data.data;
  // Use these to populate filter dropdowns
};
```

### Get Dashboard Stats
```javascript
const loadStats = async () => {
  const response = await axios.get('/api/jobs/stats');
  return response.data.data;
  // { totalJobs, activeJobs, totalCompanies, recentJobs, remoteJobs, jobsByType, jobsBySource }
};
```

---

## 🏗️ Architecture

```
job-aggregator/
├── config/          # Configuration & DB setup
├── models/          # MongoDB schemas (Job, Source, SyncLog)
├── scrapers/        # Individual scrapers for each source
├── services/        # Business logic (Aggregator, Dedup, Filters, Scheduler)
├── routes/          # Express API routes
├── middleware/      # Rate limiter, validation, error handler
├── utils/           # Helpers, constants, logger
├── scripts/         # CLI tools (manual sync, seeding)
└── index.js         # Entry point & exports
```

---

## ❓ FAQ

**Q: Which sources work without API keys?**
A: Remotive, Arbeitnow, RemoteOK, and The Muse work without any API keys.

**Q: How often does it sync?**
A: By default every 6 hours. Configurable via `SYNC_CRON_FULL` in `.env`.

**Q: Will it duplicate jobs?**
A: No! Each job gets a fingerprint hash based on title+company+location. Duplicates are automatically detected and skipped.

**Q: Does it support Indian jobs?**
A: Yes! Adzuna and JSearch have excellent India coverage. Salary parsing supports LPA/Crore formats.

**Q: Can I add more sources?**
A: Yes! Create a new scraper by extending `BaseScraper`, add config in `config/sources.js`, and register it in `scrapers/index.js`.

---

## 📝 License

ISC
