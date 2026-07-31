#!/bin/bash

# Shopify Chatlivo Deployment Script

echo "🚀 Starting Shopify Chatlivo deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the app
echo "🔨 Building the app..."
npm run build

# Setup database
echo "🗄️  Setting up database..."
npm run setup

# Stop existing PM2 process if running
echo "🛑 Stopping existing PM2 process..."
pm2 stop shopify-chatlivo || true
pm2 delete shopify-chatlivo || true

# Start with PM2
echo "▶️  Starting app with PM2..."
pm2 start ecosystem.config.cjs

# Save PM2 process list for auto-restart on reboot
echo "💾 Saving PM2 process list..."
pm2 save

# Display status
echo ""
echo "✅ Deployment complete!"
echo ""
pm2 status
echo ""
echo "📊 App running on port 3005"
echo "📋 View logs: pm2 logs shopify-chatlivo"
echo "🛑 Stop app: pm2 stop shopify-chatlivo"
echo "🔄 Restart app: pm2 restart shopify-chatlivo"
