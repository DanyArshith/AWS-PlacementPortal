# Phase 1 — REST API Specification (Overview)

This is a high-level API reference for Phase 1. Each endpoint includes method, path, auth requirement, request body (when applicable) and example response. Use JSON schema or OpenAPI later.

Auth

- POST /api/auth/register
  - Public
  - Body: { name, email, password }
  - Response: { token }
  - Errors: 400 (validation), 409 (email exists)

- POST /api/auth/login
  - Public
  - Body: { email, password }
  - Response: { token }
  - Errors: 401 (invalid credentials)

- POST /api/auth/admin/login
  - Public (admin creds)
  - Body: { username, password }
  - Response: { token }

Students (requires student JWT)

- GET /api/student/profile
  - Auth: Bearer token (student)
  - Response: student document (without password)

- PUT /api/student/profile
  - Auth: Bearer token (student)
  - Body: partial student fields (phone, branch, cgpa, skills)
  - Response: updated student

- POST /api/student/upload-resume
  - Auth: Bearer token (student)
  - Multipart: `resume` file (PDF)
  - Response: { url }

- POST /api/student/upload-photo
  - Auth: Bearer token (student)
  - Multipart: `photo` (jpeg/png)
  - Response: { url }

Jobs

- GET /api/jobs
  - Public
  - Query params: search, location, eligibility, page, limit, companyId
  - Response: [jobs] with pagination metadata

- GET /api/jobs/:id
  - Public
  - Response: job

- POST /api/jobs/apply
  - Auth: Bearer token (student)
  - Body: { jobId }
  - Response: application

- GET /api/jobs/applied
  - Auth: Bearer token (student)
  - Response: [applications with populated job and company info]

Admin (requires admin JWT)

- POST /api/admin/job
  - Auth: admin
  - Body: job payload (companyId, title, description...)
  - Response: job

- PUT /api/admin/job/:id
  - Auth: admin
  - Body: partial job payload
  - Response: updated job

- DELETE /api/admin/job/:id
  - Auth: admin
  - Response: { message }

- GET /api/admin/students
  - Auth: admin
  - Response: [students]

- GET /api/admin/applications
  - Auth: admin
  - Response: [applications]

Companies

- POST /api/company
  - Auth: admin
  - Multipart optional `logo`
  - Body: { companyName, description, website }
  - Response: company

- GET /api/company
  - Auth: admin (or public read-only route if desired)
  - Response: [companies]

- PUT /api/company/:id
  - Auth: admin
  - Response: updated company

- DELETE /api/company/:id
  - Auth: admin

Applications (admin/recruiter)

- GET /api/admin/applications
  - Auth: admin
  - Query: jobId, status, page, limit

- PUT /api/admin/application/:id/status
  - Auth: admin
  - Body: { status }

Misc

- GET /api/health
  - Public
  - Response: { status: 'ok' }

Errors and validation
- Use consistent error structure: { message, code, details? }
- Return 400 for validation errors, 401 for auth, 403 for forbidden, 404 for not found, 500 for server errors.

Notes
- Implement pagination meta: { total, page, limit }
- Use query sanitization for search params; avoid regex injection in text search.
