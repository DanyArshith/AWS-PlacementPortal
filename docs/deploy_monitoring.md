# College Placement Portal — IAM & CloudWatch Monitoring Guide

This guide details the steps to secure your EC2 backend deployment using IAM least-privilege roles, install the AWS CloudWatch Agent to ship application logs, set up Metric Filters to identify server errors/unauthorized access, and configure SNS Alarms for automated threshold alerting.

---

## 1. IAM Least-Privilege Policies

Do not hardcode AWS credentials anywhere. Instead, attach an IAM Role to your EC2 instance. This role requires two policies: one for uploading/downloading student resumes in S3, and one for streaming logs to CloudWatch.

### Policy A: S3 Least Privilege (`PlacementPortalS3Policy`)
Allows read, write, and delete operations restricted only to the designated S3 bucket.

Create an IAM Policy with the following JSON (replace `your-resume-bucket-name` with your actual bucket name):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BucketListMinimal",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::your-resume-bucket-name"
    },
    {
      "Sid": "ObjectReadWriteDelete",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-resume-bucket-name/*"
    }
  ]
}
```

### Policy B: CloudWatch Agent Server Policy
To allow the EC2 instance to stream logs, you can attach the AWS-managed policy **`CloudWatchAgentServerPolicy`** to the role, or create a custom role with the following permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

---

## 2. CloudWatch Agent Setup on EC2

The AWS CloudWatch Agent runs as a system daemon on the EC2 instance, tailing local logs and shipping them to CloudWatch Logs.

SSH into your Ubuntu server and run:

```bash
# 1. Download the unified CloudWatch Agent package
wget https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb

# 2. Install the package
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# 3. Apply our configuration file (already stored in the repo)
# The configuration parses:
#  - Nginx access & error logs
#  - Winston app & error logs
#  - PM2 stderr logs
# Set log retention to 14 days to manage costs.
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/var/www/placement-portal/backend/aws/amazon-cloudwatch-agent.json \
  -s

# 4. Check the agent status to verify it is running
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a status
```

---

## 3. CloudWatch Metric Filters

Metric filters scan the shipped log events for patterns (such as server error logs or unauthorized status codes) and count them to build metrics.

Create these filters in the **CloudWatch Console -> Logs -> Log groups**:

### Filter 1: High Server Error Rate
- **Target Log Group**: `placement-portal-backend-error`
- **Filter Pattern**: `{ $.level = "error" }`
  *(Matches any Winston logs outputted via `logger.error`)*
- **Metric Details**:
  - **Metric namespace**: `PlacementPortal/API`
  - **Metric name**: `AppErrors`
  - **Metric value**: `1`

*(Alternative Nginx HTTP 5xx Filter)*:
- **Target Log Group**: `placement-portal-nginx-access`
- **Filter Pattern**: `[ip, id, user, timestamp, request, status=5*, bytes]`
- **Metric namespace**: `PlacementPortal/Nginx`
- **Metric name**: `ServerErrorCount`
- **Metric value**: `1`

### Filter 2: Unauthorized Access Attempts
- **Target Log Group**: `placement-portal-backend-app`
- **Filter Pattern**: `{ $.status = 401 || $.status = 403 }`
  *(Matches unauthorized access or invalid token requests)*
- **Metric Details**:
  - **Metric namespace**: `PlacementPortal/API`
  - **Metric name**: `UnauthorizedAttempts`
  - **Metric value**: `1`

---

## 4. Alarms & Notifications (SNS)

Set up automated email alerts to ping team members when issues arise.

### Step A: Create an SNS Topic
1. Open the **Amazon SNS Console**.
2. Click **Topics** -> **Create topic**.
3. Select **Standard**, name it `placement-portal-ops-alerts`.
4. Click **Create topic**.
5. Inside the topic, click **Create subscription**.
6. Select Protocol: **Email**, and enter target email address.
7. Click **Create subscription**.
8. **CRITICAL**: Check your email inbox and click **Confirm subscription**.

### Step B: Create CloudWatch Alarms

#### Alarm 1: Alert on High Application Errors
1. Navigate to **CloudWatch Console -> Alarms -> All alarms -> Create alarm**.
2. Click **Select metric** -> search for `AppErrors` under namespace `PlacementPortal/API`.
3. Set **Statistic**: `Sum`, **Period**: `5 minutes`.
4. Define conditions:
   - **Threshold type**: Static
   - **Whenever AppErrors is...**: `Greater than or equal to 5`
5. Click **Next**.
6. Under **Notification**, select **In alarm** and choose your SNS Topic `placement-portal-ops-alerts`.
7. Name the alarm `placement-portal-high-error-rate` and click **Create alarm**.

#### Alarm 2: Alert on Potential Brute Force / Unauthorized Scanning
1. Create a second alarm on the `UnauthorizedAttempts` metric.
2. Set **Statistic**: `Sum`, **Period**: `5 minutes`.
3. Set condition to: `Greater than or equal to 10`.
4. Select the same SNS topic for alerts.
5. Name the alarm `placement-portal-unauthorized-access-warning` and save.

---

## 5. CloudWatch Monitoring Dashboard

Create a simple Dashboard to monitor health at a glance.

1. Navigate to **CloudWatch Console -> Dashboards -> Create dashboard**.
2. Name it `PlacementPortalDashboard`.
3. Select **Add widget** -> **Line** chart.
4. Select your metrics: `AppErrors` and `UnauthorizedAttempts`.
5. Add a second widget of type **Number** representing the aggregate count.

Below is the CloudWatch Dashboard JSON configuration:
```json
{
  "widgets": [
    {
      "type": "metric",
      "x": 0,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "PlacementPortal/API", "AppErrors", { "stat": "Sum" } ],
          [ "PlacementPortal/API", "UnauthorizedAttempts", { "stat": "Sum" } ]
        ],
        "period": 300,
        "region": "us-east-1",
        "title": "API Errors vs Unauthorized Attempts",
        "view": "timeSeries",
        "stacked": false
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "PlacementPortal/Nginx", "ServerErrorCount", { "stat": "Sum" } ]
        ],
        "period": 300,
        "region": "us-east-1",
        "title": "Nginx 5xx Server Errors",
        "view": "timeSeries"
      }
    }
  ]
}
```
You can import this JSON directly into your CloudWatch Dashboard console by clicking **Actions -> View/edit source**.
