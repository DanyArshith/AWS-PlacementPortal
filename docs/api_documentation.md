# College Placement Portal — REST API Documentation

This document provides a comprehensive reference of all API endpoints, routes, query parameters, request schemas, and responses for the College Placement Portal.

---

## 1. General API Information

### Base URL
By default, the backend API is served at:
`http://localhost:4000` (or the configured `PORT` in `.env`).
* All routes except for `/health` are prefixed with `/api`.
* API Base Endpoint: `http://localhost:4000/api`

### Authentication & Authorization
The API uses **JWT (JSON Web Tokens)** for securing endpoints.
* To access protected routes, client requests must include the JWT token in the `Authorization` header as a Bearer token:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
* **Roles**:
  * **Student**: Access to profile, uploads, job search, and job applications.
  * **Admin**: Complete access to create/update/delete companies, jobs, student profiles, and update application statuses.

### Rate Limiting
Authentication-related endpoints under `/api/auth/*` are protected by a sliding-window rate limiter:
* **Limit**: Maximum `15 requests` per `15 minutes` window per IP address.
* **Failure Response**: HTTP Status `429 Too Many Requests`
  ```json
  {
    "message": "Too many requests. Please try again later."
  }
  ```

### File Upload Constraints
All file uploads use `multipart/form-data` mediated through Multer and are uploaded to AWS S3 (or mock fallback storage).
* **Allowed MIME types**: `application/pdf`, `image/jpeg`, `image/png`
* **File Size Limit**: Max `5 MB`
* **Failure Response**: HTTP Status `500 Server error` (e.g. `{"message": "Invalid file type"}`)

---

## 2. Global System Endpoints

### Get Server Health
Verify that the backend server is running and check current mode/phase parameters.
* **Route**: `/health` (Not prefixed by `/api`)
* **Method**: `GET`
* **Auth Requirement**: Public
* **Success Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "phase": 3,
    "mode": "mock-backend"
  }
  ```

---

## 3. Auth Management (`/api/auth`)

### Student Registration
Register a new student account in the portal. On success, returns the generated token and student object.
* **Route**: `/api/auth/register`
* **Method**: `POST`
* **Auth Requirement**: Public (Rate-limited)
* **Request Body (JSON)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `name` | String | Yes | Student's full name. |
  | `email` | String | Yes | Must be a valid email format. Unique. |
  | `password` | String | Yes | Password (minimum 6 characters). |

  *Example Request Body:*
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "johnpassword"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "student_x1y2z3",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "",
      "branch": "",
      "cgpa": null,
      "skills": [],
      "resumeUrl": "",
      "profileImage": "",
      "createdAt": "2026-07-13T11:22:56.000Z"
    }
  }
  ```
* **Error Responses**:
  * **400 Bad Request** (Validation Error):
    ```json
    {
      "errors": [
        { "type": "field", "value": "123", "msg": "Invalid value", "path": "password", "location": "body" }
      ]
    }
    ```
  * **400 Bad Request** (Email Exists):
    ```json
    {
      "message": "Email already registered"
    }
    ```

### Student Login
Authenticate a registered student and receive a JWT.
* **Route**: `/api/auth/login`
* **Method**: `POST`
* **Auth Requirement**: Public (Rate-limited)
* **Request Body (JSON)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | Must be a valid email format. |
  | `password` | String | Yes | Student's password. |

  *Example Request Body:*
  ```json
  {
    "email": "alice@example.com",
    "password": "student123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "student_1",
      "name": "Alice Student",
      "email": "alice@example.com",
      "phone": "9876543210",
      "branch": "Computer Science",
      "cgpa": 8.7,
      "skills": ["JavaScript", "Node.js", "React"],
      "resumeUrl": "",
      "profileImage": "",
      "createdAt": "2026-07-13T05:54:19.000Z"
    }
  }
  ```
* **Error Responses**:
  * **401 Unauthorized** (Invalid Credentials):
    ```json
    {
      "message": "Invalid credentials"
    }
    ```

### Admin Login
Authenticate an administrative/placement-officer user.
* **Route**: `/api/auth/admin/login`
* **Method**: `POST`
* **Auth Requirement**: Public (Rate-limited)
* **Request Body (JSON)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `username` | String | Yes | Admin username. |
  | `password` | String | Yes | Admin password. |

  *Example Request Body:*
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "admin_1",
      "username": "admin",
      "role": "placement-officer"
    }
  }
  ```
* **Error Responses**:
  * **401 Unauthorized**:
    ```json
    {
      "message": "Invalid credentials"
    }
    ```

---

## 4. Student Management (`/api/student`)

### Get Current Student Profile
Retrieve details of the authenticated student.
* **Route**: `/api/student/profile`
* **Method**: `GET`
* **Auth Requirement**: Student Bearer Token
* **Success Response (200 OK)**:
  ```json
  {
    "id": "student_1",
    "name": "Alice Student",
    "email": "alice@example.com",
    "phone": "9876543210",
    "branch": "Computer Science",
    "cgpa": 8.7,
    "skills": ["JavaScript", "Node.js", "React"],
    "resumeUrl": "",
    "profileImage": "",
    "createdAt": "2026-07-13T05:54:19.000Z"
  }
  ```

### Update Student Profile
Update partial fields of the authenticated student's profile.
* **Route**: `/api/student/profile`
* **Method**: `PUT`
* **Auth Requirement**: Student Bearer Token
* **Request Body (JSON)**: Optional keys.
  | Field | Type | Description |
  | :--- | :--- | :--- |
  | `phone` | String | Contact number. |
  | `branch` | String | Field of study/branch. |
  | `cgpa` | Number | Grade point average. |
  | `skills` | Array of Strings | Technical/soft skills list. |

  *Example Request Body:*
  ```json
  {
    "phone": "9999988888",
    "branch": "Information Technology",
    "cgpa": 9.1,
    "skills": ["Node.js", "Docker", "AWS"]
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "id": "student_1",
    "name": "Alice Student",
    "email": "alice@example.com",
    "phone": "9999988888",
    "branch": "Information Technology",
    "cgpa": 9.1,
    "skills": ["Node.js", "Docker", "AWS"],
    "resumeUrl": "",
    "profileImage": "",
    "createdAt": "2026-07-13T05:54:19.000Z"
  }
  ```

### Upload Resume
Upload a resume PDF to S3. Scans the file for malware during processing and saves the key to the profile.
* **Route**: `/api/student/upload-resume`
* **Method**: `POST`
* **Auth Requirement**: Student Bearer Token
* **Request Body**: `multipart/form-data`
  * Form Field Name: `resume` (Binary PDF File)
* **Success Response (200 OK)**:
  ```json
  {
    "url": "https://s3.us-east-1.amazonaws.com/mock-bucket/resumes/1715560000_resume.pdf"
  }
  ```

### Upload Profile Photo
Upload a student portrait image to S3.
* **Route**: `/api/student/upload-photo`
* **Method**: `POST`
* **Auth Requirement**: Student Bearer Token
* **Request Body**: `multipart/form-data`
  * Form Field Name: `photo` (Binary JPEG/PNG File)
* **Success Response (200 OK)**:
  ```json
  {
    "url": "https://s3.us-east-1.amazonaws.com/mock-bucket/photos/1715560000_photo.png"
  }
  ```

---

## 5. Job Operations (`/api/jobs`)

### Get All Jobs (With Search/Pagination)
Get a list of jobs matching filters. Each job includes nested Company details.
* **Route**: `/api/jobs`
* **Method**: `GET`
* **Auth Requirement**: Public
* **Query Parameters**:
  * `search` (String, Optional): Filter by job title, location, or description.
  * `page` (Integer, Optional, Default: `1`): Page index.
  * `limit` (Integer, Optional, Default: `10`): Jobs per page.
* **Success Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "job_1",
        "companyId": "company_1",
        "title": "Junior Backend Engineer",
        "description": "Build and maintain REST APIs.",
        "salary": "4 LPA",
        "location": "Remote",
        "eligibility": "CS, IT",
        "deadline": "2026-07-31T00:00:00.000Z",
        "createdAt": "2026-07-13T05:54:19.000Z",
        "company": {
          "id": "company_1",
          "companyName": "Acme Corp",
          "description": "Engineering and manufacturing",
          "website": "https://acme.example.com",
          "logo": "",
          "createdAt": "2026-07-13T05:54:19.000Z"
        }
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 5
    }
  }
  ```

### Get Job By ID
Get full details of a specific job by ID.
* **Route**: `/api/jobs/:id`
* **Method**: `GET`
* **Auth Requirement**: Public
* **Success Response (200 OK)**:
  ```json
  {
    "id": "job_1",
    "companyId": "company_1",
    "title": "Junior Backend Engineer",
    "description": "Build and maintain REST APIs.",
    "salary": "4 LPA",
    "location": "Remote",
    "eligibility": "CS, IT",
    "deadline": "2026-07-31T00:00:00.000Z",
    "createdAt": "2026-07-13T05:54:19.000Z",
    "company": {
      "id": "company_1",
      "companyName": "Acme Corp",
      "description": "Engineering and manufacturing",
      "website": "https://acme.example.com",
      "logo": "",
      "createdAt": "2026-07-13T05:54:19.000Z"
    }
  }
  ```
* **Error Responses**:
  * **404 Not Found**:
    ```json
    {
      "message": "Not found"
    }
    ```

### Apply for Job
Submit an application for a placement job opening.
* **Route**: `/api/jobs/apply`
* **Method**: `POST`
* **Auth Requirement**: Student Bearer Token
* **Request Body (JSON)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `jobId` | String | Yes | ID of the job to apply to. |

  *Example Request Body:*
  ```json
  {
    "jobId": "job_2"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "id": "app_2",
    "studentId": "student_1",
    "jobId": "job_2",
    "status": "applied",
    "notes": "",
    "appliedAt": "2026-07-13T11:22:56.000Z"
  }
  ```
* **Error Responses**:
  * **400 Bad Request** (Already Applied):
    ```json
    {
      "message": "Already applied"
    }
    ```
  * **404 Not Found** (Job not found):
    ```json
    {
      "message": "Job not found"
    }
    ```

### Get Applied Jobs
List all job applications submitted by the authenticated student.
* **Route**: `/api/jobs/applied`
* **Method**: `GET`
* **Auth Requirement**: Student Bearer Token
* **Success Response (200 OK)**:
  ```json
  {
    "id": "app_1",
    "studentId": "student_1",
    "jobId": "job_1",
    "status": "applied",
    "notes": "",
    "appliedAt": "2026-07-13T05:54:19.000Z",
    "job": {
      "id": "job_1",
      "companyId": "company_1",
      "title": "Junior Backend Engineer",
      "description": "Build and maintain REST APIs.",
      "salary": "4 LPA",
      "location": "Remote",
      "eligibility": "CS, IT",
      "deadline": "2026-07-31T00:00:00.000Z",
      "createdAt": "2026-07-13T05:54:19.000Z"
    },
    "company": {
      "id": "company_1",
      "companyName": "Acme Corp",
      "description": "Engineering and manufacturing",
      "website": "https://acme.example.com",
      "logo": "",
      "createdAt": "2026-07-13T05:54:19.000Z"
    }
  }
  ```

---

## 6. Company Management (`/api/company`)

### Create Company
Register a new recruitment company.
* **Route**: `/api/company`
* **Method**: `POST`
* **Auth Requirement**: Admin Bearer Token
* **Request Body**: `multipart/form-data`
  * `companyName` (String, Required): Name of the organization.
  * `description` (String, Optional): Corporate description.
  * `website` (String, Optional): URL of corporate website.
  * `logo` (File, Optional): Binary Logo File.
* **Success Response (201 Created)**:
  ```json
  {
    "id": "company_3",
    "companyName": "Global Tech Services",
    "description": "A global software solutions provider.",
    "website": "https://globaltech.example.com",
    "logo": "https://s3.us-east-1.amazonaws.com/mock-bucket/logos/1715560000_logo.png",
    "createdAt": "2026-07-13T11:22:56.000Z"
  }
  ```

### Get All Companies
List all registered companies.
* **Route**: `/api/company`
* **Method**: `GET`
* **Auth Requirement**: Admin Bearer Token
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "company_1",
      "companyName": "Acme Corp",
      "description": "Engineering and manufacturing",
      "website": "https://acme.example.com",
      "logo": "",
      "createdAt": "2026-07-13T05:54:19.000Z"
    }
  ]
  ```

### Update Company
Update details of a company.
* **Route**: `/api/company/:id`
* **Method**: `PUT`
* **Auth Requirement**: Admin Bearer Token
* **Request Body (JSON)**: Partial updates are accepted.
  ```json
  {
    "description": "An updated description for Acme Corp."
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "id": "company_1",
    "companyName": "Acme Corp",
    "description": "An updated description for Acme Corp.",
    "website": "https://acme.example.com",
    "logo": "",
    "createdAt": "2026-07-13T05:54:19.000Z"
  }
  ```

### Delete Company
Remove a company from the portal.
* **Route**: `/api/company/:id`
* **Method**: `DELETE`
* **Auth Requirement**: Admin Bearer Token
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Deleted"
  }
  ```

---

## 7. Admin Management (`/api/admin`)

### Create Placement Job
Post a new job opening for students to apply.
* **Route**: `/api/admin/job`
* **Method**: `POST`
* **Auth Requirement**: Admin Bearer Token
* **Request Body (JSON)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `companyId` | String | Yes | ID of registered company hosting the job. |
  | `title` | String | Yes | Job designation. |
  | `description` | String | No | Detailed roles & responsibilities. |
  | `salary` | String | No | e.g. "8 LPA" or "$80,000". |
  | `location` | String | No | e.g. "Hybrid", "Remote", "Onsite". |
  | `eligibility` | String | No | Qualification requirements (e.g. "CS, IT, ECE"). |
  | `deadline` | Date | No | Application deadline timestamp. |

  *Example Request Body:*
  ```json
  {
    "companyId": "company_1",
    "title": "Senior QA Automation Engineer",
    "description": "Create test automation framework for backend API.",
    "salary": "8 LPA",
    "location": "Hybrid",
    "eligibility": "CS, IT, ECE",
    "deadline": "2026-09-30T00:00:00.000Z"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "id": "job_3",
    "companyId": "company_1",
    "title": "Senior QA Automation Engineer",
    "description": "Create test automation framework for backend API.",
    "salary": "8 LPA",
    "location": "Hybrid",
    "eligibility": "CS, IT, ECE",
    "deadline": "2026-09-30T00:00:00.000Z",
    "createdAt": "2026-07-13T11:22:56.000Z"
  }
  ```
* **Error Responses**:
  * **400 Bad Request** (Invalid companyId):
    ```json
    {
      "message": "Invalid companyId"
    }
    ```

### Update Placement Job
Edit details of a posted job.
* **Route**: `/api/admin/job/:id`
* **Method**: `PUT`
* **Auth Requirement**: Admin Bearer Token
* **Request Body (JSON)**: Partial updates are accepted.
  ```json
  {
    "salary": "6 LPA"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "id": "job_1",
    "companyId": "company_1",
    "title": "Junior Backend Engineer",
    "description": "Build and maintain REST APIs.",
    "salary": "6 LPA",
    "location": "Remote",
    "eligibility": "CS, IT",
    "deadline": "2026-07-31T00:00:00.000Z",
    "createdAt": "2026-07-13T05:54:19.000Z"
  }
  ```

### Delete Placement Job
Remove a posted job.
* **Route**: `/api/admin/job/:id`
* **Method**: `DELETE`
* **Auth Requirement**: Admin Bearer Token
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Deleted"
  }
  ```

### List All Students
View details of all registered students.
* **Route**: `/api/admin/students`
* **Method**: `GET`
* **Auth Requirement**: Admin Bearer Token
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "student_1",
      "name": "Alice Student",
      "email": "alice@example.com",
      "phone": "9876543210",
      "branch": "Computer Science",
      "cgpa": 8.7,
      "skills": ["JavaScript", "Node.js", "React"],
      "resumeUrl": "",
      "profileImage": "",
      "createdAt": "2026-07-13T05:54:19.000Z"
    }
  ]
  ```

### Update Student Profile (Administrative Override)
Allows an administrator to modify student info (e.g., verifying CGPA, corrected profiles).
* **Route**: `/api/admin/student/:id`
* **Method**: `PUT`
* **Auth Requirement**: Admin Bearer Token
* **Request Body (JSON)**: Same fields as PUT `/api/student/profile`.
* **Success Response (200 OK)**:
  ```json
  {
    "id": "student_1",
    "name": "Alice Student Override",
    "email": "alice@example.com",
    "phone": "9876543210",
    "branch": "Computer Science",
    "cgpa": 9.0,
    "skills": ["JavaScript", "Node.js", "React"],
    "resumeUrl": "",
    "profileImage": "",
    "createdAt": "2026-07-13T05:54:19.000Z"
  }
  ```

### Delete Student
Remove a student's record and account from the system.
* **Route**: `/api/admin/student/:id`
* **Method**: `DELETE`
* **Auth Requirement**: Admin Bearer Token
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Deleted"
  }
  ```

### List All Applications
List all job applications in the portal, populated with student and job information.
* **Route**: `/api/admin/applications`
* **Method**: `GET`
* **Auth Requirement**: Admin Bearer Token
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "app_1",
      "studentId": "student_1",
      "jobId": "job_1",
      "status": "applied",
      "appliedAt": "2026-07-13T05:54:19.000Z",
      "student": {
        "id": "student_1",
        "name": "Alice Student",
        "email": "alice@example.com",
        "phone": "9876543210",
        "branch": "Computer Science",
        "cgpa": 8.7,
        "skills": ["JavaScript", "Node.js", "React"],
        "resumeUrl": "",
        "profileImage": "",
        "createdAt": "2026-07-13T05:54:19.000Z"
      },
      "job": {
        "id": "job_1",
        "companyId": "company_1",
        "title": "Junior Backend Engineer",
        "description": "Build and maintain REST APIs.",
        "salary": "4 LPA",
        "location": "Remote",
        "eligibility": "CS, IT",
        "deadline": "2026-07-31T00:00:00.000Z",
        "createdAt": "2026-07-13T05:54:19.000Z"
      },
      "company": {
        "id": "company_1",
        "companyName": "Acme Corp",
        "description": "Engineering and manufacturing",
        "website": "https://acme.example.com",
        "logo": "",
        "createdAt": "2026-07-13T05:54:19.000Z"
      }
    }
  ]
  ```

### Update Application Status
Accept, reject, or shortlist an application.
* **Route**: `/api/admin/application/:id/status`
* **Method**: `PUT`
* **Auth Requirement**: Admin Bearer Token
* **Request Body (JSON)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `status` | String | Yes | Must be one of: `applied`, `shortlisted`, `rejected`, `accepted`. |

  *Example Request Body:*
  ```json
  {
    "status": "shortlisted"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "id": "app_1",
    "studentId": "student_1",
    "jobId": "job_1",
    "status": "shortlisted",
    "notes": "",
    "appliedAt": "2026-07-13T05:54:19.000Z"
  }
  ```
* **Error Responses**:
  * **400 Bad Request** (Invalid status values):
    ```json
    {
      "message": "Invalid status"
    }
    ```
  * **404 Not Found**:
    ```json
    {
      "message": "Application not found"
    }
    ```
