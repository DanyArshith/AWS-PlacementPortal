# College Placement Portal — Frontend Deployment Guide

This guide details the step-by-step process of packaging and hosting the frontend on Amazon S3 Static Website Hosting, configuring a CloudFront CDN distribution for SSL/TLS encryption and edge caching, mapping custom DNS domains with Route53, and applying optimal Cache-Control policies.

---

## 1. Local Production Compilation

Before uploading assets to AWS, compile the production assets using the automated build script. This optimizes and bundles Tailwind CSS and packages all HTML/JS files into a single self-contained directory.

From the `frontend/` directory, run:
```bash
# Install dependencies (if not already done)
npm install

# Run the build pipeline
npm run build
```

This cleans and generates a `./dist` folder with the following structure:
- `dist/index.html` (and all other `.html` files)
- `dist/css/style.css` (combined minified Tailwind utility classes and custom stylesheets)
- `dist/js/` (modular client-side API, auth, and dashboard logic)
- `dist/fixtures/` (mock student, job, and application JSON data used for demo testing)

---

## 2. Amazon S3 Configuration

Amazon S3 hosts the compiled static pages and assets.

### Step A: Create the S3 Bucket
1. Open the **Amazon S3 Console**.
2. Click **Create bucket**.
3. **Bucket name**: Set a globally unique name (e.g., `placement-portal-frontend` or your domain like `placementportal.yourdomain.com`).
4. **Region**: Select the same AWS Region as your EC2 backend (e.g., `us-east-1` or `us-west-2`).
5. **Object Ownership**: Choose **ACLs disabled (recommended)**.

### Step B: Disable "Block Public Access"
Since this bucket acts as a public web server, you must allow public read access:
1. Under **Block Public Access settings for this bucket**, uncheck **Block *all* public access**.
2. Acknowledge the warning that the bucket and its objects will become public.
3. Click **Create bucket**.

### Step C: Enable Static Website Hosting
1. Go into your newly created bucket, and click the **Properties** tab.
2. Scroll to the bottom and find **Static website hosting**, then click **Edit**.
3. Set **Static website hosting** to **Enable**.
4. **Hosting type**: Choose **Host a static website**.
5. **Index document**: Enter `index.html`.
6. **Error document**: Enter `index.html` (or `index.html` if you want client-side routing to handle fallbacks).
7. Click **Save changes**.
8. Note the generated **Bucket website endpoint** (e.g., `http://placement-portal-frontend.s3-website-us-east-1.amazonaws.com`). This is the unencrypted public web URL of your S3 bucket.

### Step D: Attach Bucket Policy
To allow the public to read the files, you must add a bucket policy:
1. Click the **Permissions** tab.
2. Scroll down to **Bucket policy** and click **Edit**.
3. Paste the following JSON policy (replace `your-s3-bucket-name` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-s3-bucket-name/*"
    }
  ]
}
```
4. Click **Save changes**.

---

## 3. CORS & Backend Configuration

When clients load the frontend from S3/CloudFront and attempt to fetch the EC2 API, modern browsers block cross-origin requests unless the backend Express API allows them.

### S3 CORS Configuration
If your frontend needs to upload resumes directly from S3 (e.g. for uploads to a separate upload bucket), add the following CORS policy to the S3 bucket:
1. Under your bucket's **Permissions** tab, scroll to **Cross-origin resource sharing (CORS)** and click **Edit**.
2. Paste the CORS configuration allowing your endpoints:
```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedOrigins": [
      "*"
    ],
    "ExposeHeaders": []
  }
]
```
3. Click **Save changes**.

### Express Backend CORS
The Express backend in `backend/app.js` is already configured with `cors({ origin: true })` which automatically matches the requester's origin, making integration seamless.

---

## 4. Deploying Assets with Optimized Caching

To ensure users always see the latest version of the app without old HTML cached in their browser, apply strict caching metadata headers during S3 deployment.

### Optimal Cache-Control Policy
- **HTML files (`*.html`)**: Cached with `no-cache, no-store, must-revalidate`. The browser is forced to check S3/CloudFront for updates on every page load.
- **Static Assets (`css/*.css`, `js/**/*.js`, fixtures)**: Cached with a long duration (`max-age=31536000` / 1 year). This speeds up website loads drastically by serving local browser copies.

### Deployment CLI Script
If you have the **AWS CLI** configured on your deployment machine, you can automate upload and synchronization of assets with correct headers:

```bash
# Change to frontend directory
cd /path/to/placement-portal/frontend

# 1. First, sync all non-HTML files with long-term cache headers
aws s3 sync dist/ s3://your-s3-bucket-name --exclude "*.html" --cache-control "max-age=31536000, public" --delete

# 2. Next, sync only HTML files with no-cache headers
aws s3 sync dist/ s3://your-s3-bucket-name --exclude "*" --include "*.html" --cache-control "no-cache, no-store, must-revalidate"
```

---

## 5. Amazon CloudFront CDN Distribution

To serve the site securely via HTTPS (which is required by browsers for many modern APIs and local storage operations) and globally distribute cached assets, front the S3 bucket with Amazon CloudFront.

### Step A: Create a CloudFront Distribution
1. Navigate to the **CloudFront Console**.
2. Click **Create distribution**.
3. **Origin Domain**: **CRITICAL** — Do NOT select the bucket name from the dropdown. Instead, copy and paste the S3 static website hosting endpoint URL from Section 2, Step C (exclude the `http://` prefix, e.g., `placement-portal-frontend.s3-website-us-east-1.amazonaws.com`).
   * *Why?* Selecting the default S3 bucket dropdown configures CloudFront to query S3 via REST API. This breaks default index.html resolution in subfolders and custom 404 redirections.
4. **Viewer Protocol Policy**: Select **Redirect HTTP to HTTPS**.
5. **Allowed HTTP Methods**: Choose **GET, HEAD, OPTIONS** (or **GET, HEAD** if you don't require OPTIONS routing at the CDN level).
6. **Cache Key and Origin Requests**: Keep **Cache methods optimized** (default).

### Step B: Configure SSL/TLS and Custom Domain (Optional)
If you have a registered domain (e.g. `yourdomain.com`):
1. **Alternate Domain Names (CNAME)**: Add `yourdomain.com` and `www.yourdomain.com`.
2. **Custom SSL Certificate**: Request or select an ACM SSL/TLS certificate (certificates must be requested in the `us-east-1` N. Virginia region to work with CloudFront).
3. Click **Create distribution**.

The distribution status will switch to `Enabled`. Copy the **Distribution Domain Name** (e.g. `d111111abcdef8.cloudfront.net`).

### Step C: Cache Invalidation
Whenever you release a code update, execute a CloudFront invalidation to purge the CDN cache and serve the new code instantly:
1. Open the distribution in the CloudFront console.
2. Select the **Invalidations** tab.
3. Click **Create invalidation**.
4. Enter `/*` as the object path.
5. Click **Create**.

---

## 6. Route 53 DNS Configuration

If you manage your domain using AWS Route53, map the custom domain to your CloudFront CDN distribution.

1. Navigate to the **Route 53 Console**.
2. Select **Hosted zones** and click on your domain name.
3. Click **Create record**.
4. **Record Name**: Leave blank for root domain (e.g., `yourdomain.com`) or enter `www` for subdomain.
5. **Record Type**: **A — Routes traffic to an IPv4 address and some AWS resources**.
6. Toggle **Alias** to **Enabled**.
7. **Route traffic to**:
   - Choose **Alias to CloudFront distribution**.
   - Select your CloudFront distribution domain name from the list (or paste it).
8. Click **Create records**.

Your website will now resolve securely at `https://yourdomain.com` and `https://www.yourdomain.com`, pulling cached static files directly from CloudFront's global edge network, and making API queries to your EC2 backend!
