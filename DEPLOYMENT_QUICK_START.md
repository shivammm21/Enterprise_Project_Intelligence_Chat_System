# Deployment Quick Start Guide

## Prerequisites on EC2

1. **Install Docker and Docker Compose**:
```bash
# Update system
sudo yum update -y  # Amazon Linux
# or
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

2. **Install Git**:
```bash
sudo yum install git -y  # Amazon Linux
# or
sudo apt install git -y  # Ubuntu
```

3. **Create application directory**:
```bash
mkdir -p ~/knowledge-assistant/releases
```

## GitHub Secrets Setup

Go to your repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

### Required Secrets

1. **EC2_HOST**: Your EC2 instance public IP or hostname
   ```
   ec2-xx-xxx-xxx-xxx.compute-1.amazonaws.com
   ```

2. **EC2_USER**: SSH username (usually `ec2-user` or `ubuntu`)
   ```
   ec2-user
   ```

3. **EC2_SSH_KEY**: Your private SSH key
   ```
   -----BEGIN RSA PRIVATE KEY-----
   MIIEpAIBAAKCAQEA...
   -----END RSA PRIVATE KEY-----
   ```

4. **BACKEND_ENV**: Contents of your backend/.env file
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/knowledge_assistant
   SECRET_KEY=your-secret-key-here
   OPENAI_API_KEY=sk-...
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your-admin-password
   ```

### Optional Secrets

5. **FRONTEND_ENV**: Contents of your frontend/.env file (if needed)
   ```
   VITE_API_URL=https://your-domain.com
   VITE_GITHUB_CLIENT_ID=your_github_client_id
   ```

6. **EC2_PORT**: SSH port (default: 22, only add if different)

## GitHub OAuth Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App

2. Fill in:
   - **Application name**: AI Knowledge Assistant
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-domain.com/github/callback`

3. After creating, copy:
   - **Client ID** → Add to `BACKEND_ENV` and `FRONTEND_ENV` secrets
   - **Client Secret** → Add to `BACKEND_ENV` secret

## Database Setup on EC2

The docker-compose.yml includes PostgreSQL, but you can use external database:

### Option 1: Use Docker PostgreSQL (Included)
No additional setup needed. Database runs in Docker container.

### Option 2: Use External Database
Update `DATABASE_URL` in `BACKEND_ENV` secret:
```
DATABASE_URL=postgresql+asyncpg://user:pass@external-host:5432/dbname
```

## Deploy

1. **Push to main branch**:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. **Monitor deployment**:
   - Go to GitHub → Actions tab
   - Watch the workflow run
   - Check for any errors

3. **Verify on EC2**:
```bash
ssh ec2-user@your-ec2-host

# Check running containers
cd ~/knowledge-assistant/current
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check if services are responding
curl http://localhost:8000/docs  # Backend API docs
curl http://localhost:80  # Frontend
```

## Troubleshooting

### Docker build fails with memory error
- Increase EC2 instance size (t3.medium or larger recommended)
- Or add swap space:
```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database connection - verify DATABASE_URL
# 2. Missing API keys - verify OPENAI_API_KEY or GOOGLE_API_KEY
# 3. Port already in use - check if another service uses port 8000
```

### Frontend won't start
```bash
# Check logs
docker-compose logs frontend

# Common issues:
# 1. Backend not accessible - verify VITE_API_URL
# 2. Port already in use - check if another service uses port 80
```

### GitHub OAuth not working
1. Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in backend/.env
2. Check callback URL matches in GitHub OAuth app settings
3. Verify `VITE_GITHUB_CLIENT_ID` in frontend/.env
4. Check browser console for errors

### Can't access from browser
1. **Check Security Group**: EC2 instance must allow inbound traffic on ports 80 and 443
2. **Check nginx**: Frontend container should be running and listening on port 80
3. **Check DNS**: If using domain, verify DNS points to EC2 IP

## Accessing the Application

### Local Development
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Production (EC2)
- Frontend: http://your-ec2-ip or https://your-domain.com
- Backend API: http://your-ec2-ip:8000 or https://your-domain.com/api
- API Docs: http://your-ec2-ip:8000/docs

## Default Admin Account

After first deployment, login with:
- **Email**: Value from `ADMIN_EMAIL` in backend/.env
- **Password**: Value from `ADMIN_PASSWORD` in backend/.env

**Important**: Change these credentials after first login!

## Updating the Application

Just push to main branch:
```bash
git add .
git commit -m "Update feature X"
git push origin main
```

GitHub Actions will automatically:
1. Run validation (type-check, lint)
2. Package the release
3. Upload to EC2
4. Build Docker images
5. Deploy containers
6. Clean up old releases (keeps last 5)

## Manual Deployment (if needed)

SSH into EC2 and run:
```bash
cd ~/knowledge-assistant/current
git pull origin main
docker-compose build
docker-compose up -d
```

## Monitoring

### Check application health
```bash
# Backend health
curl http://localhost:8000/docs

# Frontend health
curl http://localhost:80

# Database health
docker-compose exec db psql -U postgres -d knowledge_assistant -c "SELECT 1;"
```

### View logs
```bash
cd ~/knowledge-assistant/current

# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Restart services
```bash
cd ~/knowledge-assistant/current

# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

## Backup Database

```bash
# Backup
docker-compose exec db pg_dump -U postgres knowledge_assistant > backup.sql

# Restore
docker-compose exec -T db psql -U postgres knowledge_assistant < backup.sql
```

## SSL/HTTPS Setup (Optional)

For production, use Let's Encrypt with Certbot:

1. Install Certbot on EC2
2. Get certificate for your domain
3. Update nginx.conf to use SSL
4. Update docker-compose.yml to mount certificates

See `EC2_SETUP_GUIDE.md` for detailed SSL setup instructions.
