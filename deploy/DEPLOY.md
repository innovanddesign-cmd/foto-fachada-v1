# Deployment Guide - Foto Fachada
================================

## Prerequisites

- Node.js 20+
- PM2 (`npm install -g pm2`)
- Nginx
- SSL Certificate (Let's Encrypt)
- Domain configured with DNS

## Quick Deploy

### 1. Clone and Install

```bash
git clone https://github.com/your-org/foto-fachada.git
cd foto-fachada

# Install dependencies
npm install
cd server && npm install && cd ..
```

### 2. Configure Environment

```bash
# Copy environment files
cp server/.env.example server/.env

# Edit with your values
nano server/.env
```

Required variables:
```env
GEMINI_API_KEY=your_gemini_key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://app.fotofachada.com
FRONTEND_ORIGIN=https://app.fotofachada.com
NODE_ENV=production
```

### 3. Build Frontend

```bash
npm run build
```

### 4. Setup PM2

```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup startup script
pm2 startup
```

### 5. Configure Nginx

```bash
# Copy nginx config
sudo cp deploy/nginx.conf /etc/nginx/sites-available/fotofachada.com

# Create symlink
sudo ln -s /etc/nginx/sites-available/fotofachada.com /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 6. SSL Certificate

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d fotofachada.com -d www.fotofachada.com -d app.fotofachada.com
```

### 7. Setup Stripe Webhook

In Stripe Dashboard > Developers > Webhooks:
- Endpoint URL: `https://app.fotofachada.com/api/billing/webhook`
- Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

## Monitoring

```bash
# View logs
pm2 logs foto-fachada-api

# Monitor processes
pm2 monit

# Status
pm2 status
```

## Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install
cd server && npm install && cd ..

# Build frontend
npm run build

# Reload backend (zero-downtime)
pm2 reload ecosystem.config.js --env production
```

## Troubleshooting

### Check backend health
```bash
curl https://app.fotofachada.com/health
```

### View PM2 logs
```bash
pm2 logs foto-fachada-api --lines 100
```

### Restart everything
```bash
pm2 restart all
sudo systemctl restart nginx
```
