# Amazon S3 Bucket Design Specification

This document details the configuration requirements for the College Placement Portal S3 bucket to ensure security, encryption, cost-efficiency, and proper CORS mapping.

---

## 1. Bucket Access Control (Security)

To comply with the security principle of least privilege:
- **Public Access Blocked**: Enable "Block all public access" on the bucket.
- **Access Control Lists (ACLs)**: Disabled. Use "Bucket Owner Enforced" to ensure all uploaded objects are owned by the AWS Account.
- **Bucket Policy**: Restrict access solely to the backend application role (the EC2 instance role).
  
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AllowAppInstanceRole",
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::ACCOUNT_ID:role/PlacementPortalBackendRole"
        },
        "Action": [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ],
        "Resource": "arn:aws:s3:::placement-portal-bucket-name/*"
      }
    ]
  }
  ```

---

## 2. CORS (Cross-Origin Resource Sharing) Policy

The frontend (hosted statically on S3 or accessed via localhost during testing) will require CORS permissions when executing direct S3 uploads (using presigned PUT URLs). 

Configure the following CORS policy on the bucket:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST"
    ],
    "AllowedOrigins": [
      "http://127.0.0.1:8080",
      "http://localhost:8080",
      "https://your-placement-portal-domain.s3-website-us-east-1.amazonaws.com"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 3. Server-Side Encryption (SSE)

Encrypt all uploaded files at rest:
- **Encryption Type**: SSE-S3 (Amazon S3-managed keys). This provides free, automatic encryption without KMS key management overhead.
- **Bucket Default Encryption**: Enable SSE-S3 default bucket encryption so any uploaded files are automatically encrypted even if client headers are omitted.

---

## 4. Lifecycle Policies

Implement S3 lifecycle rules to optimize storage costs:
- **Incomplete Multipart Uploads**: Delete incomplete multipart uploads after **7 days** to clean up failed upload fragments and prevent hidden costs.
- **Object Transitioning**: Transition old resumes or logos to **S3 Glacier Instant Retrieval** after **90 days** if student graduation batches are archived, while keeping them immediately accessible for recruiter audits.
