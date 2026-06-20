# Phase 1 — Database Schema

This document describes the planned MongoDB collections, fields, validation notes and indexes for Phase 1. Use Mongoose for schemas and validation in Phase 4.

Collections

1) `students`
- Fields
  - `_id` : ObjectId
  - `name` : String (required)
  - `email` : String (required, unique, lowercase)
  - `password` : String (hashed, select: false)
  - `phone` : String
  - `branch` : String
  - `cgpa` : Number (0.0 - 10.0)
  - `skills` : [String]
  - `resumeUrl` : String (S3 URL)
  - `profileImage` : String (S3 URL)
  - `createdAt` / `updatedAt` : Date
- Indexes
  - unique index on `email`
  - index on `skills` (text or array index) for search
- Validation notes
  - enforce email format, minimum password length at api-level, sanitize strings

2) `companies`
- Fields
  - `_id` : ObjectId
  - `companyName` : String (required)
  - `description` : String
  - `website` : String
  - `logo` : String (S3 URL)
  - `createdAt` / `updatedAt` : Date
- Indexes
  - text index on `companyName` and `description` for search

3) `jobs`
- Fields
  - `_id` : ObjectId
  - `companyId` : ObjectId ref `companies` (required)
  - `title` : String (required)
  - `description` : String
  - `salary` : String
  - `location` : String
  - `eligibility` : String (or structure like minCgpa, branchesAllowed)
  - `deadline` : Date
  - `createdAt` / `updatedAt` : Date
- Indexes
  - index on `companyId`
  - text index on `title` and `description`

4) `applications`
- Fields
  - `_id` : ObjectId
  - `studentId` : ObjectId ref `students` (required)
  - `jobId` : ObjectId ref `jobs` (required)
  - `status` : String enum ["applied","shortlisted","rejected","accepted"] default `applied`
  - `appliedAt` : Date
  - `notes` : String (admin/recruiter remarks)
- Indexes
  - compound unique index on (`studentId`, `jobId`) to prevent duplicate applications
  - index on `jobId` for querying applicants

5) `admins`
- Fields
  - `_id` : ObjectId
  - `username` : String (required, unique)
  - `password` : String (hashed, select: false)
  - `role` : String (e.g., `placement-officer`) optional
  - `createdAt` / `updatedAt` : Date
- Indexes
  - unique index on `username`

General notes
- Use `timestamps: true` on schemas to get `createdAt`/`updatedAt`.
- Prefer storing only S3 URLs in documents; do not store binary data in MongoDB.
- Limit field sizes: e.g., `description` 10k chars, `resumeUrl` 2048 chars.
- Consider using text indexes for global search and partial indexes for performance.

Security & validation
- Sanitize inputs (`express-mongo-sanitize`, `xss-clean`) before database writes.
- Use parameterized queries where possible; Mongoose by default protects from injection if used properly.
- Validate ObjectId inputs at API layer to return 400 early.
