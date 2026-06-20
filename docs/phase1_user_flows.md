# Phase 1 — User Flows

This file describes user flows for each role. Use these flows to create wireframes and API tests.

1) Student
- Register -> Email verification (optional) -> Login
- Complete profile (upload resume, photo, skills, cgpa)
- Browse jobs (search, filter) -> View job details
- Apply to job -> View applied jobs and status updates
- Receive status updates (shortlisted/accepted/rejected)

2) Placement Officer (Admin)
- Login -> Dashboard
- Create company -> Add company details and logo
- Create job posting for company (title, description, eligibility, deadline)
- View applicants for a job -> Download resume (presigned URL)
- Update application status: shortlist/reject/accept
- Manage student records (view, edit, delete)

3) Recruiter
- Login (optional separate account type)
- View jobs posted by their company
- View applications -> update status / add notes

Cross-cutting flows
- File upload flow: frontend -> backend (or presigned PUT) -> S3 -> store URL in MongoDB
- Auth flow: login -> receive JWT -> store (localStorage or HttpOnly cookie) -> use for protected requests
- Admin actions should be audited (log entries for create/update/delete operations)
