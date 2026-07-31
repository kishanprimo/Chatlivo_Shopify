# Shopify Chatlivo - Deployment Guide

## Overview

This project uses GitHub Actions for automated CI/CD deployment and PM2 for process management on the production server.

## CI/CD Pipeline Flow

```
Push to main branch
    ↓
GitHub Actions (deploy.yml)
    ↓
1. Checkout code
2. Setup Node.js environment
3. Install dependencies
4. SSH to production server
5. Pull latest code via rsync
6. Install dependencies
7. Run database migrations
8. Build application
9. Start/restart with PM2
    ↓
Deployment Complete
```

## Prerequisites

### Server Setup (One-time)

1. **SSH Access**: Ensure GitHub Actions can SSH to your server
   ```bash
   # Generate SSH key pair
   ssh-keygen -t rsa -b 4096 -f deploy_key
   
   # Add public key to server's authorized_keys
   cat deploy_key.pub >> ~/.ssh/authorized_keys
   ```

2. **GitHub Secrets** (Configure in repository settings):
   - `SERVER_HOST`: Your server IP or domain
   - `SERVER_USER`: SSH username (e.g., `deploy`)
   - `SERVER_SSH_KEY`: Private SSH key content

3. **Server Requirements**:
   - Node.js 20+ installed
   - npm installed
   - PM2 installed globally: `npm install -g pm2`
   - Sudo access (for PM2 startup)

### Environment Variables

Update `.env` on your production server:

```env
# Shopify Configuration
SHOPIFY_APP_URL=https://shopify.chatlivo.com
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,write_metaobjects,write_metaobject_definitions

# Backend Configuration
CHATLIVO_BACKEND_URL=https://api.chatlivo.com

# Application Configuration
NODE_ENV=production
```

## Automated Deployment (GitHub Actions)

### Trigger Deployment

Simply push to the `main` branch:

```bash
git add .
git commit -m "Your deployment message"
git push origin main
```

The GitHub Actions workflow will automatically:
1. Build the project
2. Deploy to production server
3. Start/restart the app with PM2
4. Display deployment status

### View Deployment Status

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select the workflow run to see detailed logs

## Manual Deployment

If you need to deploy manually:

```bash
# Option 1: Use deployment script
./deploy.sh

# Option 2: Manual steps
npm install
npm run setup      # Database migrations
npm run build
pm2 start ecosystem.config.js
pm2 save
```

## PM2 Management

### Available Commands

```bash
# View all processes
npm run pm2:status
pm2 status

# View real-time logs
npm run pm2:logs
pm2 logs shopify-chatlivo

# Restart the app
npm run pm2:restart
pm2 restart shopify-chatlivo

# Stop the app
npm run pm2:stop
pm2 stop shopify-chatlivo

# Start the app
npm run pm2:start
pm2 start ecosystem.config.js

# Delete from PM2
pm2 delete shopify-chatlivo

# Reload (zero-downtime)
pm2 reload shopify-chatlivo
```

### Enable Auto-Restart on Server Reboot

```bash
# Save the current PM2 process list
pm2 save

# Install startup script (run suggested commands)
pm2 startup

# Resurrect on next reboot
pm2 resurrect
```

## Monitoring

### Check Application Status

```bash
# On server
pm2 status
pm2 logs shopify-chatlivo

# View specific log file
tail -f logs/out.log
tail -f logs/error.log
```

### Health Check

App should be accessible at:
```
https://shopify.chatlivo.com:3005
http://localhost:3005
```

## Troubleshooting

### Deployment Failed

1. Check GitHub Actions logs:
   - Go to Actions tab → Select failed run
   - Look for error messages

2. Check server logs:
   ```bash
   pm2 logs shopify-chatlivo --err
   tail -f logs/error.log
   ```

3. Verify SSH connection:
   ```bash
   ssh -i deploy_key deploy@your-server-ip
   ```

### App Won't Start

```bash
# Check what's using port 3005
lsof -i :3005

# View PM2 error logs
pm2 logs shopify-chatlivo --err

# Rebuild and restart
npm run build
pm2 restart shopify-chatlivo

# Check database status
npm run setup
```

### Database Migration Issues

```bash
# Regenerate Prisma client
npm run prisma generate

# Run migrations manually
npm run setup

# Reset database (WARNING: Deletes data)
npm run prisma migrate reset
```

### Port Already in Use

```bash
# Find process using port 3005
sudo lsof -i :3005

# Kill the process
sudo kill -9 <PID>

# Restart PM2
pm2 restart shopify-chatlivo
```

## Deployment Checklist

Before deploying to production:

- [ ] Test changes locally: `npm run dev`
- [ ] Run type checking: `npm run typecheck`
- [ ] Run linting: `npm run lint`
- [ ] Build locally: `npm run build`
- [ ] Update `.env` with correct values
- [ ] Test database migrations: `npm run setup`
- [ ] Commit and push to main branch
- [ ] Monitor GitHub Actions deployment
- [ ] Verify app is running: `pm2 status`
- [ ] Test application endpoints
- [ ] Check logs for errors: `pm2 logs shopify-chatlivo`

## Configuration Files

### ecosystem.config.js
PM2 configuration for production deployment:
- App name: `shopify-chatlivo`
- Port: `3005`
- Max memory: `500M`
- Logs location: `logs/error.log`, `logs/out.log`

### .github/workflows/deploy.yml
GitHub Actions workflow for automated deployment

### .github/workflows/test.yml
GitHub Actions workflow for testing and linting

### deploy.sh
Bash script for manual deployment

## Production Server Details

- **Deployment Path**: `/var/www/shopify.chatlivo.com`
- **App Port**: `3005`
- **Process Manager**: PM2
- **Database**: SQLite (dev.sqlite) or configured DATABASE_URL
- **Node Version**: 20+

## Support

For deployment issues:
1. Check GitHub Actions logs
2. SSH to server and review PM2 logs
3. Verify environment variables are set correctly
4. Check server resources (disk space, memory)
5. Review application error logs

## References

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Shopify App Development](https://shopify.dev/docs/apps)
- [React Router Deploy Guide](https://reactrouter.com/start/framework/deployment)
