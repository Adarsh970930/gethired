# Software Requirements Specification (SRS)
## Project Name: Get Hired (AI-Powered Job Aggregator & Career Intelligence Platform)

---

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to present a detailed description of the **"Get Hired"** platform. It explains the system's architecture, AI modules, features, and constraints. This platform aims to solve the inefficiencies of traditional job portals by introducing a fully automated aggregation pipeline and Generative AI-powered career analytics.

### 1.2 Scope
Unlike traditional job boards that rely on manual postings, **Get Hired** automatically ingests live job data from global APIs using background Cron jobs. The platform elevates the user experience by integrating **Large Language Models (LLMs)** to provide an intelligent ATS (Applicant Tracking System) Scanner and a dedicated AI Career Coach for candidates.

---

## 2. Overall Description
### 2.1 System Architecture
The application is built on a scalable **MERN Stack** (MongoDB, Express.js, React.js, Node.js).
*   **Frontend:** React.js paired with modern UI frameworks, emphasizing a responsive, dynamic (Glassmorphism), and premium user interface.
*   **Backend:** Node.js & Express.js. It implements advanced Design Patterns (like the Strategy Pattern) to manage external AI providers seamlessly.
*   **Database:** MongoDB. Highly optimized schemas for rapid CRUD operations, indexing text search, and scaling. Data cleanup happens autonomously.

### 2.2 User Classes and Characteristics
*   **Standard Users (Candidates):** Can browse jobs, use the ATS resume scanner, leverage the AI Career Coach, and track active applications.
*   **Platform Administrators:** Have exclusive access to the Admin Dashboard. They can control the database, toggle AI providers, monitor platform health, and adjust automated scraping algorithms.

---

## 3. Core System Features

### 3.1 🌐 Automated Job Aggregation Engine (Cron Scraper)
*   **Description:** A background Node.js process (using `node-cron`) consistently fetches live data from reliable external APIs (Adzuna, Remotive, TheMuse, RemoteOK, JSearch).
*   **Mechanism:** The system performs de-duplication, formats disparate data into a standardized unified schema, and pushes it to MongoDB autonomously.
*   **Admin Control:** Administrators can modify sync intervals dynamically via the dashboard without server restarts.

### 3.2 ✨ AI-Powered ATS Score Scanner
*   **Description:** An intelligent resume parsing algorithm that bridges the gap between candidate qualifications and exact Job Descriptions.
*   **Mechanism:** Candidates upload a PDF resume. The backend extracts raw text using highly efficient buffer parsing and queries the active LLM. The AI calculates an eligibility score (0-100) and displays *Matched Skills* and *Missing Keywords*.

### 3.3 🧠 Generative AI Career Coach
*   **Description:** A smart profiler integrated straight into the candidate's core dashboard.
*   **Mechanism:** By simply uploading a resume, the LLM determines the developer's exact proficiency tier (Junior/Mid/Senior). It predicts **three highly suitable job roles** and suggests an Upskill Growth Path. Furthermore, the backend cross-references these findings with the active MongoDB database to dynamically recommend real, currently hiring jobs on the portal.

### 3.4 🔄 Dynamic AI Engine & Fault Tolerance 
*   **Description:** Enterprise-grade system stability mechanisms.
*   **Mechanism:** Administrators can seamlessly hot-swap between multiple Generative AI providers—**Google Gemini (1.5 Flash)** or **Meta LLaMA-3 (via Groq)**.
*   **Heuristic Fallback:** If API limits are exceeded or external keys fail, the platform *never crashes*. It automatically gracefully degrades to a local NLP (Natural Language Processing) keyword-extraction Heuristic Fallback algorithm.

---

## 4. Non-Functional Requirements
### 4.1 Scalability
The MongoDB implementation utilizes Indexing (particularly `$text` indexes) ensuring that even with 10,000+ cached jobs, user search queries resolve in milliseconds.

### 4.2 Security
*   **Role-Based Access Control (RBAC):** Tight security through JSON Web Tokens (JWT). Admin endpoints possess strict verification middleware prohibiting standard users from bypassing UI restrictions.
*   **Robust Environment:** API keys, database URLs, and vital credentials are bound entirely within local environment variables or secured MongoDB Documents, preventing exposure.

### 4.3 Reliability & Availability
The incorporation of the **Strategy Design Pattern** guarantees that the third-party integrations (like AI calls) are loosely coupled with the core architecture. The platform guarantees 99.9% uptime for core operational browsing even in the absence of AI providers.

---
*Document formulated specifically for the final viva and technical review of the "Get Hired" project deployment.*
