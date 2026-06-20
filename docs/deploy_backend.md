# College Placement Portal — EC2 Backend Deployment Guide

This guide details the step-by-step process of provisioning an Ubuntu EC2 instance, installing dependencies, configuring an Nginx reverse proxy, setting up Let's Encrypt SSL/TLS, and running the Node.js Express server under the PM2 process manager.

---

## 1. AWS Infrastructure Provisioning

### EC2 Instance Specifications
- **AMI**: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type.
- **Instance Type**: `t2.micro` or `t3.micro` (Free Tier eligible).
- **Storage**: General Purpose SSD (gp3) — 8 GB to 20 GB is sufficient.

### Security Group Configuration
Create a security group named `placement-portal-backend-sg` with the following inbound rules:

| Protocol | Port Range | Source | Description |
| :--- | :--- | :--- | :--- |
| **SSH** | 22 | `My IP` (Restricted) | Secure administrative terminal access |
| **HTTP** | 80 | `0.0.0.0/0` | Standard web traffic (automatically redirected to HTTPS) |
| **HTTPS** | 443 | `0.0.0.0/0` | Secure SSL encrypted web traffic |

### IAM Instance Role (S3 Permissions)
Do not hardcode AWS access keys on the server. Instead, create an IAM Role and attach it to the EC2 instance:
1. Open the IAM Console and create a role of type **AWS Service -> EC2**.
2. Attach a policy allowing access to your S3 bucket. You can use the narrow scope policy below:
   
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::your-s3-bucket-name/*"
       }
     ]
   }
   ```
3. Attach this IAM Role to your EC2 instance via **Actions -> Security -> Modify IAM Role**.

---

## 2. Server Installation Commands

SSH into your Ubuntu EC2 instance (`ssh -i your-key.pem ubuntu@your-ec2-ip`) and run the following setup commands:

```bash
# Update local packages
sudo apt update && sudo apt upgrade -y

# 1. Install Node.js LTS (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installations
node -v
npm -v

# 2. Install Git, Nginx, Certbot and python module
sudo apt install -y git nginx certbot python3-certbot-nginx

# 3. Install PM2 Process Manager globally
sudo npm install pm2 -g
```

---

## 3. Cloning and Application Setup

Run the following commands on the server to retrieve and configure the backend:

```bash
# 1. Prepare folder structure under /var/www/
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www

# 2. Clone the repository
git clone <YOUR_GIT_REPOSITORY_URL> /var/www/placement-portal
cd /var/www/placement-portal/backend

# 3. Configure environment variables
# Copy template and fill in MONGODB_URI, JWT_SECRET, S3_BUCKET, AWS_REGION, etc.
cp .env.example .env
nano .env

# 4. Make deployment automation scripts executable
chmod +x scripts/deploy.sh scripts/rollback.sh

# 5. Initialize the PM2 Application
# Runs in cluster mode, auto-detecting CPUs, using ecosystem configuration
pm2 start ecosystem.config.js --env production

# 6. Configure PM2 to restart automatically on system reboot
pm2 startup systemd
# !!! IMPORTANT !!! 
# Copy and execute the exact command outputted by the 'pm2 startup' terminal command.

# Save current PM2 processes list
pm2 save
```

---

## 4. Nginx Reverse Proxy Configuration

Nginx will intercept client requests on port 80/443 and route them to the local Express backend running on port 4000.

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/placement-portal
```

Paste the following configuration block (replace `api.yourdomain.com` with your actual domain or EC2 Public DNS address if domain is not configured yet):

```nginx
server {
    listen 80;
    server_name api.yourdomain.com; # Replace with your domain or EC2 Public DNS / IP

    client_max_body_size 6M; # Limit uploads to 5MB + boundary overhead

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Real IP headers for Express rate limiting
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and restart Nginx:

```bash
# Link available config to enabled directory
sudo ln -s /etc/nginx/sites-available/placement-portal /etc/nginx/sites-enabled/

# Remove default Nginx site to avoid conflicts
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx syntax
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 5. SSL/TLS Certificate Installation (Let's Encrypt)

If you mapped a domain name to your EC2 IP, run Certbot to configure secure HTTPS traffic. It will automatically download the certs and modify the Nginx config to serve TLS:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

- Follow the prompts to enter an email for security notices.
- Select the option to automatically redirect all HTTP traffic to HTTPS.
- Certbot will install a cron job to automatically renew certificates before they expire.

---

## 6. Daily Deployment & Maintenance

To deploy updates, SSH to the server and run the script:
```bash
cd /var/www/placement-portal/backend
./scripts/deploy.sh main
```

To rollback in case of an issue:
```bash
cd /var/www/placement-portal/backend
./scripts/rollback.sh
```
