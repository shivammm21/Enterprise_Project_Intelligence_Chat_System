# EC2 Deployment Setup Guide

This guide will help you deploy the AI Knowledge Assistant to an AWS EC2 instance using Docker (without ECR).

## Prerequisites

- AWS Account
- GitHub Account
- Domain name (optional, for HTTPS)

---

## Step 1: Launch EC2 Instance

### Instance Configuration:
- **AMI**: Ubuntu Server 22.04 LTS
- **Instance Type**: t3.medium or larger (minimum 4GB RAM)
- **Storage**: 30GB gp3
- **Security Group**: Open ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Launch Steps:
1. Go to AWS Console → EC2 → Launch Instance
2. Choose Ubuntu Server 22.04 LTS
3. Select instance type (t3.medium recommended)
4. Create or select a key pair (download the .pem file)
5. Configure security group:
   ```
   SSH (22)    - Your IP
   HTTP (80)   - 0.0.0.0/0
   HTTPS (443) - 0.0.0.0/0
   ```
6. Launch instance

---

## Step 2: Connect to EC2 and Install Dependencies

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group to take effect
exit
```

---

## Step 3: Setup Application Directory

```bash
# Connect again
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Create app directory structure
mkdir -p ~/knowledge-assistant/releases
cd ~/knowledge-assistant
```

---

## Step 4: Setup GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EC2_HOST` | `1.2.3.4` | Your EC2 public IP or domain |
| `EC2_PORT` | `22` | SSH port (default 22) |
| `EC2_USER` | `ubuntu` | EC2 username |
| `EC2_SSH_KEY` | Content of your .pem file | Private SSH key |
| `BACKEND_ENV` | Backend environment variables | See below |
| `FRONTEND_ENV` | Frontend environment variables (optional) | See below |

### BACKEND_ENV Content:

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@your-db-host:5432/knowledge_assistant

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI Provider
OPENAI_API_KEY=
GOOGLE_API_KEY=your-google-api-key

# ChromaDB
CHROMA_PERSIST_DIR=./chroma_db

# File uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Admin Account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password
ADMIN_NAME=Admin
```

### FRONTEND_ENV Content (Optional):

```env
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

---

## Step 5: Deploy

### Option 1: Automatic Deployment (via GitHub Actions)

1. Push code to `main` or `master` branch
2. GitHub Actions will automatically:
   - Validate code
   - Package release
   - Upload to EC2
   - Build Docker images
   - Deploy containers

### Option 2: Manual Deployment

```bash
# On your local machine
git push origin main

# Or trigger manually from GitHub
# Go to Actions → CI/CD → Run workflow
```

---

## Step 6: Setup Database (PostgreSQL)

### Option A: Use AWS RDS (Recommended for Production)

1. Go to AWS Console → RDS → Create Database
2. Choose PostgreSQL
3. Template: Free tier or Production
4. DB instance identifier: `knowledge-assistant-db`
5. Master username: `postgres`
6. Master password: (set a strong password)
7. DB instance class: db.t3.micro (free tier) or larger
8. Storage: 20GB
9. VPC: Same as EC2
10. Public access: Yes (or setup VPC peering)
11. Create database
12. Update `BACKEND_ENV` secret with RDS endpoint

### Option B: Use Docker PostgreSQL (Development)

Add to `docker-compose.yml` on EC2:

```yaml
  postgres:
    image: postgres:15-alpine
    container_name: knowledge-assistant-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: knowledge_assistant
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your-password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    ports:
      - "5432:5432"

volumes:
  postgres-data:
```

Update `DATABASE_URL`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:your-password@postgres:5432/knowledge_assistant
```

---

## Step 7: Verify Deployment

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check running containers
cd ~/knowledge-assistant/current
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

Open browser and go to `http://your-ec2-ip`

---

## Step 8: Setup HTTPS (Optional but Recommended)

### Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install -y certbot

# Stop containers temporarily
cd ~/knowledge-assistant/current
docker-compose down

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx.conf to use SSL
# Edit frontend/nginx.conf and add SSL configuration

# Restart containers
docker-compose up -d
```

---

## Useful Commands

### View logs:
```bash
cd ~/knowledge-assistant/current
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart services:
```bash
docker-compose restart
docker-compose restart backend
```

### Stop services:
```bash
docker-compose down
```

### Rebuild and restart:
```bash
docker-compose up -d --build
```

### Check running containers:
```bash
docker-compose ps
docker ps
```

### Clean up old images:
```bash
docker image prune -af
```

### View releases:
```bash
cd ~/knowledge-assistant/releases
ls -lt
```

---

## Troubleshooting

### Backend not starting:
```bash
docker-compose logs backend
# Check database connection
# Check environment variables
```

### Frontend not accessible:
```bash
docker-compose logs frontend
# Check if port 80 is open in security group
# Check nginx configuration
```

### Database connection issues:
```bash
# Test database connection from backend container
docker-compose exec backend python -c "from app.database import engine; import asyncio; print('Testing connection...'); asyncio.run(engine.connect()); print('Success!')"
```

### Deployment failed:
```bash
# Check GitHub Actions logs
# Verify SSH key is correct
# Verify EC2_HOST is accessible
# Check EC2 security group allows SSH from GitHub Actions IPs
```

---

## Monitoring

### Application Logs:

```bash
# View real-time logs
docker-compose logs -f --tail=100

# Save logs to file
docker-compose logs > app-logs.txt
```

### System Resources:

```bash
# Check disk space
df -h

# Check memory
free -h

# Check Docker disk usage
docker system df
```

---

## Backup Strategy

### Database Backup:

```bash
# Backup PostgreSQL (if using Docker)
docker exec knowledge-assistant-db pg_dump -U postgres knowledge_assistant > backup.sql

# Restore
docker exec -i knowledge-assistant-db psql -U postgres knowledge_assistant < backup.sql
```

### Uploads and ChromaDB Backup:

```bash
# Backup volumes
docker run --rm -v knowledge-assistant_backend-uploads:/data -v $(pwd):/backup ubuntu tar czf /backup/uploads-backup.tar.gz /data
docker run --rm -v knowledge-assistant_backend-chroma:/data -v $(pwd):/backup ubuntu tar czf /backup/chroma-backup.tar.gz /data
```

---

## Security Best Practices

1. ✅ Use strong passwords for database and admin account
2. ✅ Keep EC2 security group restrictive (only necessary ports)
3. ✅ Use HTTPS with valid SSL certificate
4. ✅ Regularly update Docker images
5. ✅ Keep SSH key secure and never commit to repository
6. ✅ Regular backups of database and volumes
7. ✅ Monitor application logs for suspicious activity
8. ✅ Keep system packages updated

---

## Cost Estimation (Monthly)

- **EC2 t3.medium**: ~$30
- **RDS db.t3.micro**: ~$15 (free tier eligible)
- **EBS Storage (30GB)**: ~$3
- **Data Transfer**: ~$5-10
- **Total**: ~$50-60/month

---

**Deployment Complete! 🚀**

Your AI Knowledge Assistant is now running on AWS EC2!

### Instance Configuration:
- **AMI**: Ubuntu Server 22.04 LTS
- **Instance Type**: t3.medium or larger (minimum 4GB RAM)
- **Storage**: 30GB gp3
- **Security Group**: Open ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Launch Steps:
1. Go to AWS Console → EC2 → Launch Instance
2. Choose Ubuntu Server 22.04 LTS
3. Select instance type (t3.medium recommended)
4. Create or select a key pair (download the .pem file)
5. Configure security group:
   ```
   SSH (22)    - Your IP
   HTTP (80)   - 0.0.0.0/0
   HTTPS (443) - 0.0.0.0/0
   ```
6. Launch instance

---

## Step 3: Connect to EC2 and Install Dependencies

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
sudo apt install -y awscli

# Logout and login again for docker group to take effect
exit
```

---

## Step 4: Configure AWS CLI on EC2

```bash
# Connect again
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Configure AWS CLI
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format: json
```

---

## Step 5: Setup Application Directory

```bash
# Create app directory
mkdir -p ~/app
cd ~/app

# Create .env file
nano .env
```

Add the following content to `.env`:

```env
# ECR Registry
ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@your-db-host:5432/knowledge_assistant

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI Provider
OPENAI_API_KEY=
GOOGLE_API_KEY=your-google-api-key

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Admin Account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password
ADMIN_NAME=Admin
```

Save and exit (Ctrl+X, Y, Enter)

---

## Step 6: Copy docker-compose.yml to EC2

```bash
# Still in ~/app directory
nano docker-compose.yml
```

Copy the content from the `docker-compose.yml` file in the repository and paste it here.

Save and exit.

---

## Step 7: Setup GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | IAM user with ECR and EC2 permissions |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | IAM user secret |
| `AWS_REGION` | `us-east-1` | Your AWS region |
| `EC2_HOST` | `1.2.3.4` | Your EC2 public IP |
| `EC2_USER` | `ubuntu` | EC2 username |
| `EC2_SSH_KEY` | Content of your .pem file | Private SSH key |

---

## Step 8: Create IAM User for GitHub Actions

1. Go to AWS Console → IAM → Users → Create User
2. User name: `github-actions-deploy`
3. Attach policies:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonEC2ReadOnlyAccess`
4. Create access key → Application running outside AWS
5. Save the Access Key ID and Secret Access Key

---

## Step 9: Deploy

### Option 1: Automatic Deployment (via GitHub Actions)

1. Push code to `main` branch
2. GitHub Actions will automatically:
   - Build Docker images
   - Push to ECR
   - Deploy to EC2

### Option 2: Manual Deployment

```bash
# On EC2
cd ~/app

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Pull images
docker pull 123456789.dkr.ecr.us-east-1.amazonaws.com/knowledge-assistant-backend:latest
docker pull 123456789.dkr.ecr.us-east-1.amazonaws.com/knowledge-assistant-frontend:latest

# Start containers
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## Step 10: Setup Database (PostgreSQL)

### Option A: Use AWS RDS (Recommended for Production)

1. Go to AWS Console → RDS → Create Database
2. Choose PostgreSQL
3. Template: Free tier or Production
4. DB instance identifier: `knowledge-assistant-db`
5. Master username: `postgres`
6. Master password: (set a strong password)
7. DB instance class: db.t3.micro (free tier) or larger
8. Storage: 20GB
9. VPC: Same as EC2
10. Public access: Yes (or setup VPC peering)
11. Create database
12. Update `DATABASE_URL` in EC2's `.env` file with RDS endpoint

### Option B: Use Docker PostgreSQL (Development)

Add to `docker-compose.yml`:

```yaml
  postgres:
    image: postgres:15-alpine
    container_name: knowledge-assistant-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: knowledge_assistant
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your-password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    ports:
      - "5432:5432"

volumes:
  postgres-data:
```

Update `DATABASE_URL`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:your-password@postgres:5432/knowledge_assistant
```

---

## Step 11: Setup HTTPS (Optional but Recommended)

### Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Stop containers temporarily
cd ~/app
docker-compose down

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx.conf to use SSL
# Add SSL configuration to frontend/nginx.conf

# Restart containers
docker-compose up -d
```

---

## Step 12: Verify Deployment

1. Open browser and go to `http://your-ec2-ip` or `https://your-domain.com`
2. You should see the login page
3. Login with admin credentials from `.env`
4. Test creating a project and uploading documents

---

## Useful Commands

### View logs:
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart services:
```bash
docker-compose restart
docker-compose restart backend
```

### Stop services:
```bash
docker-compose down
```

### Update application:
```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d
```

### Check running containers:
```bash
docker ps
```

### Clean up old images:
```bash
docker image prune -af
```

---

## Troubleshooting

### Backend not starting:
```bash
docker-compose logs backend
# Check database connection
# Check environment variables
```

### Frontend not accessible:
```bash
docker-compose logs frontend
# Check if port 80 is open in security group
# Check nginx configuration
```

### Database connection issues:
```bash
# Test database connection
docker exec -it knowledge-assistant-backend python -c "from app.database import engine; import asyncio; asyncio.run(engine.connect())"
```

### Out of disk space:
```bash
# Clean up Docker
docker system prune -af --volumes
```

---

## Monitoring

### Setup CloudWatch (Optional):

1. Install CloudWatch agent on EC2
2. Monitor CPU, Memory, Disk usage
3. Set up alarms for high resource usage

### Application Logs:

```bash
# View real-time logs
docker-compose logs -f --tail=100

# Save logs to file
docker-compose logs > app-logs.txt
```

---

## Backup Strategy

### Database Backup:

```bash
# Backup PostgreSQL
docker exec knowledge-assistant-db pg_dump -U postgres knowledge_assistant > backup.sql

# Restore
docker exec -i knowledge-assistant-db psql -U postgres knowledge_assistant < backup.sql
```

### Uploads and ChromaDB Backup:

```bash
# Backup volumes
docker run --rm -v app_backend-uploads:/data -v $(pwd):/backup ubuntu tar czf /backup/uploads-backup.tar.gz /data
docker run --rm -v app_backend-chroma:/data -v $(pwd):/backup ubuntu tar czf /backup/chroma-backup.tar.gz /data
```

---

## Security Best Practices

1. ✅ Use strong passwords for database and admin account
2. ✅ Keep EC2 security group restrictive (only necessary ports)
3. ✅ Use HTTPS with valid SSL certificate
4. ✅ Regularly update Docker images
5. ✅ Enable AWS CloudTrail for audit logging
6. ✅ Use AWS Secrets Manager for sensitive data
7. ✅ Enable EC2 instance monitoring
8. ✅ Regular backups of database and volumes
9. ✅ Use IAM roles instead of access keys when possible
10. ✅ Keep SSH key secure and never commit to repository

---

## Cost Estimation (Monthly)

- **EC2 t3.medium**: ~$30
- **RDS db.t3.micro**: ~$15 (free tier eligible)
- **EBS Storage (30GB)**: ~$3
- **Data Transfer**: ~$5-10
- **Total**: ~$50-60/month

---

## Support

For issues or questions:
1. Check application logs
2. Review this guide
3. Check GitHub repository issues
4. Contact support team

---

**Deployment Complete! 🚀**

Your AI Knowledge Assistant is now running on AWS EC2!
