# College Placement Portal - Master Project Specification

## Project Objective

Build a **production-ready College Placement Portal** that demonstrates Full Stack Development and AWS Cloud Deployment skills.

The application should be modular, scalable, secure, and follow industry best practices.

The final project should be suitable for portfolio presentation and technical interviews.

---

# Primary Goal

Create a system where:

* Students can register and apply for jobs.
* Placement Officers can manage companies and job postings.
* Companies can view applicants and update recruitment status.

The project should be designed as if it will be used by a real college.

---

# Technology Stack

## Frontend

* HTML5
* CSS3
* Tailwind CSS
* JavaScript (Vanilla)

## Backend

* Node.js
* Express.js

## Database

* MongoDB Atlas

## ODM

* Mongoose

## Authentication

* JWT
* bcrypt

## File Upload

* Multer
* AWS S3

---

# AWS Services

The project must use the following AWS services.

## 1. Amazon EC2

Purpose:

* Host the Node.js + Express backend.
* Run using PM2.
* Nginx acts as a reverse proxy.

EC2 should only contain backend code.

---

## 2. Amazon S3

Purpose:

* Store resumes.
* Store profile pictures.
* Store company logos.

Never store uploaded files inside EC2 or MongoDB.

Only store the generated S3 URL inside MongoDB.

---

## 3. IAM

Use IAM Roles attached to EC2.

Permissions:

* s3:GetObject
* s3:PutObject
* s3:DeleteObject

Never hardcode AWS credentials.

Never commit secrets to GitHub.

---

## 4. CloudWatch

Send backend logs to CloudWatch.

Monitor:

* Login attempts
* API requests
* Upload events
* Server errors
* Admin actions

---

## 5. VPC and Security Groups

Deploy EC2 inside a VPC.

Allow:

* SSH (22) only from my IP
* HTTP (80)
* HTTPS (443)

Block unnecessary ports.

---

# Database Collections

## Students

* name
* email
* password
* phone
* branch
* cgpa
* skills
* resumeUrl
* profileImage
* createdAt

## Companies

* companyName
* description
* website
* logo

## Jobs

* companyId
* title
* description
* salary
* location
* eligibility
* deadline
* createdAt

## Applications

* studentId
* jobId
* status
* appliedAt

## Admins

* username
* password

---

# User Roles

## Student

* Register
* Login
* Dashboard
* Edit Profile
* Upload Resume
* Upload Profile Image
* View Jobs
* Search Jobs
* Apply for Jobs
* Track Application Status

---

## Placement Officer

* Login
* Dashboard
* Manage Students
* Add Companies
* Manage Companies
* Create Jobs
* Update Jobs
* Delete Jobs
* View Applications
* Shortlist Candidates
* Reject Candidates
* Download Resumes

---

## Recruiter

* Login
* View Jobs
* View Applicants
* Update Candidate Status

---

# Project Folder Structure

placement-portal/

frontend/

css/

js/

assets/

components/

student/

admin/

recruiter/

backend/

config/

controllers/

middleware/

models/

routes/

services/

utils/

validations/

app.js

server.js

docs/

README.md

---

# Development Phases

## Phase 1

Project planning.

Create folder structure.

Design MongoDB schema.

Create API list.

Create UI wireframes.

Do not write backend logic yet.

---

## Phase 2

Develop complete frontend.

Build all pages using HTML, Tailwind CSS, and JavaScript.

Use dummy JSON data.

No backend integration.

Complete UI before moving ahead.

---

## Phase 3

Develop backend.

Create:

* Models
* Controllers
* Routes
* Middleware
* Services

Implement:

* JWT Authentication
* bcrypt password hashing
* Role middleware
* Global error handler

Test using Postman.

---

## Phase 4

Connect MongoDB Atlas.

Implement CRUD operations.

Implement:

* Student registration
* Login
* Job creation
* Job listing
* Job application

---

## Phase 5

Integrate frontend and backend.

Replace dummy data with Fetch API calls.

Ensure every page works correctly.

---

## Phase 6

Implement AWS S3 uploads.

Flow:

Student

↓

Frontend

↓

Backend

↓

AWS S3

↓

Receive URL

↓

Store URL in MongoDB

Never store files in MongoDB.

Never store files permanently on EC2.

---

## Phase 7

Deploy backend.

Launch Ubuntu EC2.

Install:

* Node.js
* PM2
* Nginx

Clone repository.

Configure environment variables.

Deploy Express application.

---

## Phase 8

Deploy frontend.

Host HTML, CSS, Tailwind, and JavaScript files using Amazon S3 Static Website Hosting.

Frontend communicates with backend through REST APIs.

---

## Phase 9

Configure IAM and CloudWatch.

Attach IAM Role to EC2.

Remove AWS Access Keys from code.

Enable CloudWatch logging.

Verify backend logs.

---

## Phase 10

Project polish.

Implement:

* Loading animations
* Toast notifications
* Search
* Filters
* Pagination
* Responsive design
* Better error handling

Create documentation.

Generate architecture diagram.

Create API documentation.

Write deployment guide.

Prepare GitHub repository.

---

# Request Flow

User

↓

Frontend (Amazon S3 Static Website)

↓

Fetch API

↓

Express Backend (Amazon EC2)

↓

MongoDB Atlas

File Upload

↓

Express Backend

↓

Amazon S3

↓

S3 URL

↓

MongoDB Atlas

---

# Coding Standards

Follow MVC architecture.

Keep controllers thin.

Move business logic into services.

Use reusable middleware.

Use async/await.

Centralize error handling.

Validate all requests.

Sanitize inputs.

Prevent NoSQL injection.

Hash passwords.

Never duplicate code.

Write modular and maintainable code.

---

# Future Enhancements

* Email notifications
* Password reset
* OTP verification
* Resume parser
* AI job recommendations
* Interview scheduling
* Real-time notifications
* Admin analytics
* CloudFront CDN
* GitHub Actions CI/CD
* Docker
* Kubernetes
* Redis caching

---

# AI Agent Instructions

Work phase by phase.

Do not generate the entire project at once.

Complete one phase fully before starting the next.

Before writing code:

* Explain the architecture.
* Explain the folder structure.
* Explain why the approach is chosen.

Generate production-quality code suitable for deployment and long-term maintenance.

Prioritize readability, scalability, security, and AWS compatibility over speed of implementation.
