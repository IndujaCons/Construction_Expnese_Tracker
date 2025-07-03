# 🚀 Complete Deployment Guide: buildbudget.in

This comprehensive guide documents the entire process of deploying the Construction Expense Tracker to buildbudget.in on Hostinger VPS.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [VPS Preparation](#vps-preparation)
3. [Node.js Installation](#nodejs-installation)
4. [Application Deployment](#application-deployment)
5. [DNS Configuration](#dns-configuration)
6. [Nginx Setup](#nginx-setup)
7. [SSL Certificate](#ssl-certificate)
8. [Environment Configuration](#environment-configuration)
9. [Testing & Verification](#testing--verification)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance](#maintenance)

## Prerequisites

### Required Resources
- **VPS:** Hostinger VPS (KVM 2 or higher)
- **Domain:** buildbudget.in (purchased from Hostinger)
- **Google OAuth:** Configured Google Cloud Console project
- **Existing Site:** indujafinadvisors.in (already running on same VPS)

### Initial VPS State
- **OS:** Ubuntu 22.04 LTS
- **Existing Applications:** indujafinadvisors.in on port 3000
- **IP Address:** 195.35.7.174
- **Access:** SSH root access

## VPS Preparation

### 1. Access VPS
```bash
ssh root@195.35.7.174
```

### 2. Check Current Resources
```bash
# Check available space and memory
df -h
free -h

# Check running processes
pm2 list
ps aux | grep node
```

## Node.js Installation

### Issue: Outdated Node.js
Initial Node.js version was 12.22.9, but Next.js 15 requires Node.js 18+.

### 1. Remove Old Node.js
```bash
# Remove conflicting packages
apt remove --purge nodejs npm libnode72 libnode-dev -y
apt autoremove -y
```

### 2. Install Node.js 18
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js 18
apt-get install nodejs -y

# Verify installation
node --version  # Should show v18.20.6
npm --version   # Should show 10.8.2
```

### 3. Install PM2 (Process Manager)
```bash
npm install -g pm2
```

## Application Deployment

### 1. Create Project Directory
```bash
mkdir -p /var/www/buildbudget
cd /var/www/buildbudget
```

### 2. Clone Repository
**Note:** Repository must be public or use personal access token

```bash
# Make repository public in GitHub or use token
git clone https://github.com/IndujaCons/construction-expense-tracker.git .
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
```bash
# Create production environment file
nano .env.local
```

**Environment Variables:**
```bash
DATABASE_URL="file:./buildbudget.db"
NEXTAUTH_URL="https://buildbudget.in"
NEXTAUTH_SECRET="your-nextauth-secret-here"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Critical:** Ensure GOOGLE_CLIENT_ID is on one line without line breaks!

### 5. Database Setup
```bash
# Generate Prisma client
DATABASE_URL="file:./buildbudget.db" npx prisma generate

# Create database
DATABASE_URL="file:./buildbudget.db" npx prisma db push
```

### 6. Build Application
```bash
npm run build
```

### 7. PM2 Configuration
Create ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'buildbudget',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/buildbudget',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
```

### 8. Start Application
```bash
# Start with environment variable
DATABASE_URL="file:./buildbudget.db" pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Verify running
pm2 list
```

## DNS Configuration

### 1. Access Hostinger DNS Panel
- Login to Hostinger
- Navigate to buildbudget.in → DNS records

### 2. Configure A Record
**Remove old A record** (84.32.84.32) and add:
- **Type:** A
- **Name:** @ (root domain)
- **Points to:** 195.35.7.174
- **TTL:** 14400

### 3. Configure CNAME Record
Already existed:
- **Type:** CNAME
- **Name:** www
- **Points to:** buildbudget.in

### 4. Verify DNS Propagation
```bash
# Check from different DNS servers
dig buildbudget.in A
dig www.buildbudget.in A
dig buildbudget.in A @8.8.8.8
```

**Expected result:** Only 195.35.7.174 (no multiple IPs)

## Nginx Setup

### 1. Create Nginx Configuration
```bash
nano /etc/nginx/sites-available/buildbudget.in
```

**Configuration:**
```nginx
server {
    listen 80;
    server_name buildbudget.in www.buildbudget.in;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name buildbudget.in www.buildbudget.in;
    
    ssl_certificate /etc/letsencrypt/live/buildbudget.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/buildbudget.in/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Enable Site
**Critical Issue:** Nginx expects `.conf` extension!

```bash
# Enable with correct extension
ln -s /etc/nginx/sites-available/buildbudget.in /etc/nginx/sites-enabled/buildbudget.conf

# Test configuration
nginx -t

# Reload nginx
systemctl reload nginx
```

## SSL Certificate

### 1. Create Challenge Directory
```bash
mkdir -p /var/www/html/.well-known/acme-challenge
chmod -R 755 /var/www/html
```

### 2. Install Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 3. Stop Conflicting Services
**Issue:** Docker was using port 80

```bash
# Check what's using port 80
ss -tlnp | grep :80

# Stop conflicting services (Docker in our case)
systemctl stop nginx  # Temporarily
```

### 4. Get SSL Certificate
```bash
# Use standalone method
certbot certonly --standalone -d buildbudget.in

# Or for both domains (after DNS is fully propagated)
certbot certonly --standalone -d buildbudget.in -d www.buildbudget.in
```

### 5. Auto-Renewal Setup
```bash
# Add to crontab
crontab -e

# Add line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Environment Configuration

### Google OAuth Setup

#### 1. Google Cloud Console Configuration
- **Authorized JavaScript origins:** `https://buildbudget.in`
- **Authorized redirect URIs:** `https://buildbudget.in/api/auth/callback/google`

#### 2. Environment Variables
Ensure `.env.local` has correct values without line breaks:
```bash
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Testing & Verification

### 1. Application Health Checks
```bash
# Check PM2 status
pm2 list
pm2 logs buildbudget

# Test local app
curl -I http://localhost:3001

# Test through nginx
curl -I https://buildbudget.in
```

### 2. Expected Results
```
HTTP/1.1 307 Temporary Redirect
Server: nginx
location: /login
X-Powered-By: Next.js
```

### 3. OAuth Testing
1. Visit https://buildbudget.in
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Create test project
5. Invite team member
6. Add expense with receipt

## Troubleshooting

### Common Issues and Solutions

#### 1. "next: command not found"
**Cause:** Old Node.js version or missing installation
**Solution:** Reinstall Node.js 18+ following the installation steps

#### 2. SSL Rate Limiting
**Error:** "too many failed authorizations"
**Solution:** Wait 1 hour, ensure DNS propagation, use standalone method

#### 3. Nginx "Configuration file not found"
**Cause:** Missing `.conf` extension in sites-enabled
**Solution:** Rename symlink to `.conf` extension

#### 4. "invalid_client" OAuth Error
**Cause:** Line breaks in GOOGLE_CLIENT_ID or incorrect domain
**Solution:** Fix environment file, update Google Console origins

#### 5. DNS Still Pointing to Old Server
**Cause:** Multiple A records or slow propagation
**Solution:** Remove old A records, wait for propagation, check with dig

#### 6. Port 80/443 Conflicts
**Cause:** Docker or other services using ports
**Solution:** Stop conflicting services temporarily for SSL setup

### Debug Commands
```bash
# Check nginx configuration
nginx -T | grep -A 20 "server_name.*buildbudget"

# Check SSL certificate
openssl x509 -in /etc/letsencrypt/live/buildbudget.in/fullchain.pem -text -noout

# Check DNS from multiple sources
dig buildbudget.in A @8.8.8.8
dig buildbudget.in A @1.1.1.1

# Check application logs
pm2 logs buildbudget --lines 50

# Check system resources
df -h
free -h
ps aux | grep node
```

## Maintenance

### Regular Tasks

#### 1. SSL Certificate Renewal
Automatic via cron, but verify:
```bash
certbot certificates
certbot renew --dry-run
```

#### 2. Application Updates
```bash
cd /var/www/buildbudget
git pull origin main
npm install
npm run build
pm2 restart buildbudget
```

#### 3. Database Backups
```bash
# Backup SQLite database
cp /var/www/buildbudget/buildbudget.db /backups/buildbudget-$(date +%Y%m%d).db

# Restore if needed
cp /backups/buildbudget-20250703.db /var/www/buildbudget/buildbudget.db
pm2 restart buildbudget
```

#### 4. Log Management
```bash
# PM2 log rotation
pm2 install pm2-logrotate

# Clear old logs
pm2 flush
```

### Monitoring

#### Key Metrics to Monitor
- Application uptime: `pm2 list`
- Memory usage: `free -h`
- Disk space: `df -h`
- SSL certificate expiry: `certbot certificates`
- Domain DNS health: `dig buildbudget.in A`

## Multi-Site Configuration

### Running Multiple Apps on Same VPS

**Current Setup:**
- **indujafinadvisors.in** → Port 3000
- **buildbudget.in** → Port 3001

**Nginx Configuration Pattern:**
Each domain gets its own server block with unique port forwarding.

**Resource Allocation:**
- Monitor combined memory usage
- Ensure sufficient disk space for both databases
- Consider load balancing if traffic increases

## Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to git
- Use strong NEXTAUTH_SECRET (32+ characters)
- Rotate secrets periodically

### 2. Database Security
- SQLite file permissions: 644
- Regular backups
- Consider encryption for sensitive data

### 3. SSL/TLS
- Use strong cipher suites
- Enable HTTP/2
- Consider HSTS headers

### 4. Application Security
- Keep Node.js updated
- Regular npm audit
- Monitor for security vulnerabilities

## Performance Optimization

### 1. Application Level
- Enable Next.js compression
- Optimize images
- Use CDN for static assets

### 2. Server Level
- Nginx gzip compression
- Proper caching headers
- Connection pooling

### 3. Database
- Regular VACUUM for SQLite
- Index optimization
- Consider migration to PostgreSQL for scale

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ **Domain Resolution:** buildbudget.in → 195.35.7.174  
✅ **HTTPS Access:** https://buildbudget.in loads with valid SSL  
✅ **Application Response:** Redirects to /login with Next.js headers  
✅ **OAuth Login:** Google authentication works  
✅ **Core Features:** Project creation, member invitation, expense tracking  
✅ **File Uploads:** Receipt upload functionality works  
✅ **Multi-Site:** Both indujafinadvisors.in and buildbudget.in work independently  

**Final Test URL:** https://buildbudget.in

---

*This guide documents the complete deployment process from a clean VPS to a fully functional production application. Save this for future deployments and team onboarding.*