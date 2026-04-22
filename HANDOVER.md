# 🚀 Get Hired - India's #1 Job Aggregator

**Get Hired** (formerly JobSeg) is a premium job aggregation platform tailored for Indian engineers and students. It fetches jobs from multiple sources, focusing on FAANG, WITCH companies, and Indian startups.

## ✨ Key Features
- **Active Job Board:** ~570+ active listings, updated every 6 hours.
- **India-First Search:** Prioritizes Bangalore, Mumbai, Delhi, Pune, Hyderabad, and Chennai.
- **Premium UI:** Dark-themed, responsive design with "shimmer" skeleton loaders.
- **User Dashboard:** Track applications, save favorite jobs, and manage profile.
- **Admin Panel:** Powerful tools to manage users, ban/delete jobs, and trigger manual syncs.
- **SEO Optimized:** Dynamic meta tags for every page (Job Titles, Companies, Locations).

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS (Custom), React Router, React Helmet Async
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or URI in `.env`)

### Installation
1.  **Clone/Navigate to directory:**
    ```bash
    cd job-aggregator
    ```
2.  **Install Backend Dependencies:**
    ```bash
    npm install
    ```
3.  **Install Frontend Dependencies:**
    ```bash
    cd client
    npm install
    cd ..
    ```

### Running the App
The project is set up to run both backend and frontend concurrently from the root:

```bash
# From the root directory
npm run dev
```
- **Frontend:** `http://localhost:5173` (Vite dev server)
- **Backend API:** `http://localhost:5001`
- **Full App (Production Mode):** `http://localhost:5001` (Serves built frontend)

To build for production:
```bash
cd client
npm run build
cd ..
npm start
```

## 🔐 Credentials

### Admin Account
Use this account to access the **Admin Panel** (`/admin`):
- **Email:** `admin@jobseg.com`
- **Password:** `admin123`

### User Account (Demo)
- **Email:** `demo@example.com`
- **Password:** `password123`

## 📂 Project Structure
- `/client` - React frontend
  - `/src/pages` - Application routes (Landing, Jobs, Profile, Admin, etc.)
  - `/src/components` - Reusable UI (JobCard, SEO, Skeleton)
  - `/src/context` - AuthContext
- `/services` - Backend logic
  - `JobAggregator.js` - Main class managing scrapers and database sync
  - `scrapers/` - Individual scraper modules (Adzuna, Remotive, etc.)
- `/routes` - API endpoints
  - `adminRoutes.js` - Sync triggers, user management
  - `authRoutes.js` - Login, register, profile updates

## 🔄 Job Syncing
The app automatically syncs jobs every 6 hours.
To trigger a manual sync:
1. Login as Admin.
2. Go to **Admin Panel** > **Sources**.
3. Click **Sync Now** next to any source (e.g., Remotive, Arbeitnow).

## 📝 Notes
- **API Limits:** Some sources (e.g., Adzuna) have strict rate limits. If fewer jobs appear, check the console for rate limit warnings.
- **SEO:** Meta tags are managed via `react-helmet-async` in `client/src/components/SEO.jsx`.

---
*Built with ❤️ for Indian Engineers.*
