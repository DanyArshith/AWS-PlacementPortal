# College Placement Portal — Project Roadmap

This document records the 10-phase roadmap for the College Placement Portal project. Follow the phases in order; we are currently in Phase 1. Do not write any frontend or backend code until Phase 1 is complete and approved.

Each phase below includes:
- Objective — short goal for the phase.
- Deliverables — concrete artifacts to produce.
- Tasks & todos — actionable developer tasks.
- Functions / Components — system parts implemented in the phase.
- Acceptance criteria — what must work to consider the phase done.

---

### Phase 1 — Planning (CURRENT PHASE)

Objective
- Define the full design of the system before writing code.

Deliverables
- Logical database schema (collections + fields + indexes)
- Full REST API list (endpoints, verbs, request/response shapes)
- Project folder structure and naming conventions
- User flows for each role (Student, Admin, Recruiter)
- Low-fidelity UI wireframes for core pages

Tasks & todos
- [ ] Create ER-style schema for `students`, `companies`, `jobs`, `applications`, `admins` (include indexes and validation rules)
- [ ] Write complete API spec for auth, students, jobs, companies, admin, applications (include auth requirements and error responses)
- [ ] Define folder layout for `backend/` and `frontend/` with responsibilities
- [ ] Produce wireframes (desktop + mobile) for: login, register, dashboard, jobs list, job details, profile, admin panels
- [ ] Define non-functional requirements: security, scalability, backups, logging, retention, cost target

Functions / Components (design-time)
- Authentication (JWT, bcrypt)
- File storage (S3) design — upload, access, lifecycle
- Role-based authorization middleware
- Validation and sanitization layer
- Logging and monitoring hooks

Acceptance criteria
- Schemas and API spec reviewed and approved
- Wireframes cover happy-path and error states
- Folder structure agreed and documented

No code is to be written during Phase 1.

---

### Phase 2 — Frontend Only (Dummy Data)

Objective
- Build static UI implementing wireframes using Tailwind and vanilla JS. Use mocked JSON data only.

Deliverables
- Static HTML pages for all wireframes
- Tailwind-based responsive CSS
- JS modules to render dummy data and simulate API calls
- Accessibility checklist and basic performance checks

Tasks & todos
- [ ] Create static pages: `index`, `login`, `register`, `dashboard`, `jobs`, `job-detail`, `profile`, `admin`
- [ ] Implement responsive layout and components (sidebar, navbar, cards, forms)
- [ ] Create JSON fixtures for students, companies, jobs, applications
- [ ] Implement JS services that return fixture data (simulate latency and error cases)
- [ ] Add client-side validation and UI states (loading, empty, error)
- [ ] Prepare a build script for production-ready static assets

Functions / Components
- UI components: `Navbar`, `Sidebar`, `JobCard`, `ApplicationList`, `ProfileForm`
- Client data service (returns fixture JSON)
- Toasts and modal components

Acceptance criteria
- All pages render correctly across desktop and mobile
- Interactions (search, filter, apply simulation) work against fixtures
- No backend required to run the site locally

Constraints
- Do not implement real authentication or storage

---

### Phase 3 — Backend API Implementation (No DB)

Objective
- Implement Express backend: routes, controllers, and models structure. Use in-memory or mock persistence to test endpoints with Postman.

Deliverables
- Express app skeleton with modular routes and controllers
- Input validation and error handling middleware
- Auth endpoints (register/login) with JWT and bcrypt
- Mock services for data (in-memory arrays or JSON files)

Tasks & todos
- [ ] Scaffold `backend/` with `config/`, `controllers/`, `routes/`, `services/`, `models/`, `middleware/`
- [ ] Implement auth routes: `/api/auth/register`, `/api/auth/login`
- [ ] Implement student, job, company, application endpoints wired to mock services
- [ ] Add request validation `express-validator`
- [ ] Add rate limiting middleware for auth routes
- [ ] Write Postman collection covering core flows

Functions / Components
- Auth controller and token issuance
- Mock data service (CRUD in-memory)
- Error handler and logging middleware

Acceptance criteria
- All endpoints respond correctly in Postman
- JWT flows validate and protect routes
- No database required; mock persistence acceptable

---

### Phase 4 — Connect MongoDB Atlas

Objective
- Replace mock persistence with MongoDB Atlas using Mongoose models. Ensure data persistence and indexing.

Deliverables
- Mongoose models for all collections with validation and indexes
- Connection management and environment-driven configuration
- Migration notes (indexes, seed data for admin)
- Unit / integration tests for core DB interactions

Tasks & todos
- [ ] Create Mongoose schemas for `Student`, `Company`, `Job`, `Application`, `Admin`
- [ ] Add necessary indexes (email unique, job companyId index, application compound index)
- [ ] Implement DB connection pool and graceful shutdown
- [ ] Add seed script to create admin user (`scripts/seedAdmin.js`)
- [ ] Run Postman tests against the DB-backed API

Functions / Components
- Mongoose models and service layer
- Data access layer (services) abstracted from controllers

Acceptance criteria
- API persists and reads data from Atlas
- Indexes validate uniqueness and queries are performant

---

### Phase 5 — Frontend + Backend Integration

Objective
- Replace fixtures with real API calls; complete end-to-end flows.

Deliverables
- Frontend wired to backend with authentication and file upload flows
- Client-side token storage strategy defined (HttpOnly cookie vs localStorage)
- End-to-end test checklist and smoke tests

Tasks & todos
- [ ] Update `frontend/js/api.js` to call production/staging API base
- [ ] Implement login/register flows and token handling
- [ ] Implement resume & photo upload flows (using server-mediated or presigned uploads)
- [ ] Test apply, shortlist, accept/reject flows end-to-end
- [ ] Add client-side retry and error handling for failed uploads

Functions / Components
- API client module, auth module, file upload handler

Acceptance criteria
- Users can register, login, upload resume, view and apply to jobs
- Admin can create jobs and view applicants

---

### Phase 6 — Integrate AWS S3 (First AWS Service)

Objective
- Store files in S3 and save URLs in MongoDB. Decide direct browser uploads vs upload-through-backend.

Deliverables
- S3 bucket design and CORS policy
- S3 service module for server-side upload and presigned URLs
- File lifecycle policy and encryption settings

Tasks & todos
- [ ] Create `services/s3Service.js` that supports server uploads and presigned GET/PUT
- [ ] Make S3 objects private and return presigned GET URLs for download
- [ ] Implement file validation and scanning hooks (virus scan placeholder)
- [ ] Add S3 lifecycle rules and SSE configuration guidance

Functions / Components
- S3 upload service, presigner, and secure download helper

Acceptance criteria
- Resume/profile photo uploads are stored in S3 and accessible via short-lived presigned URLs

---

### Phase 7 — Deploy Backend to EC2

Objective
- Deploy the API to an Ubuntu EC2 instance with PM2 and Nginx as reverse proxy.

Deliverables
- `ecosystem.config.js` for PM2
- Nginx site config with TLS (Let's Encrypt) instructions
- Deployment and rollback script

Tasks & todos
- [ ] Create EC2 instance and attach IAM Role for S3 access
- [ ] Install Node, PM2, Nginx, Certbot and configure
- [ ] Deploy app, start with PM2, verify health checks
- [ ] Configure CloudWatch logging for application logs

Acceptance criteria
- API reachable via HTTPS and logs flow to CloudWatch

---

### Phase 8 — Deploy Frontend to S3 Static Website Hosting

Objective
- Host built frontend on S3 (optionally behind CloudFront) and configure CORS and DNS.

Deliverables
- Build pipeline for frontend (minified CSS, JS)
- S3 bucket with public website hosting or CloudFront distribution
- DNS configuration (Route53) guidance

Tasks & todos
- [ ] Add frontend build scripts (`npm run build`) and output `dist/`
- [ ] Upload `dist/` to S3 and set appropriate cache-control headers
- [ ] Optionally configure CloudFront and invalidation policy

Acceptance criteria
- Frontend served over HTTPS, assets cached, and API calls route to backend

---

### Phase 9 — Configure IAM and CloudWatch

Objective
- Harden permissions and enable monitoring/alerts.

Deliverables
- IAM policy for EC2 role with least privilege to S3
- CloudWatch log group and metric filters for errors and security events
- Alerts for high error rate and unauthorized access

Tasks & todos
- [ ] Create IAM role and attach to EC2
- [ ] Configure CloudWatch agent or use structured log shipping (winston-cloudwatch)
- [ ] Create alarms and dashboards

Acceptance criteria
- Logs available in CloudWatch and alarms trigger on defined thresholds

---

### Phase 10 — Documentation & Polish

Objective
- Finalize documentation, screenshots, architecture diagram, and README for portfolio.

Deliverables
- Detailed `README.md` with deployment steps, architecture diagram, API docs
- Screenshots and demo script
- Cost and operational guide

Tasks & todos
- [ ] Write deployment guide (EC2, S3, IAM, CloudWatch)
- [ ] Create architecture diagram and include in repo
- [ ] Produce API documentation (OpenAPI/Swagger) and Postman collection
- [ ] Prepare release notes and demo checklist

Acceptance criteria
- Project is demonstrable, documented, and ready for interviews

---

Follow the roadmap strictly. Pause for review and approval after Phase 1 deliverables (database schema, API list, folder structure, wireframes) before proceeding.
