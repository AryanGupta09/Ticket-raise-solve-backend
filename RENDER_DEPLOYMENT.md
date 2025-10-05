# Render Deployment Guide for HelpDesk Mini Backend

## 🚀 Quick Deploy to Render

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Ensure all files are committed

### Step 2: Create Render Service
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository

### Step 3: Configure Service Settings

**Basic Settings:**
- **Name**: helpdesk-mini-backend
- **Environment**: Node
- **Region**: Choose closest to your users
- **Branch**: main (or your default branch)
- **Root Directory**: backend
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Environment Variables:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/helpdesk-mini?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters-long
NODE_ENV=production
PORT=10000
```

### Step 4: Advanced Settings
- **Health Check Path**: `/api/health`
- **Auto-Deploy**: Yes (for automatic deployments)
- **Pull Request Previews**: Optional

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-5 minutes)
3. Your backend will be available at: `https://helpdesk-mini-backend.onrender.com`

## 🔧 Environment Variables Setup

### Required Variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/helpdesk-mini?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters-long
NODE_ENV=production
PORT=10000
```

### Optional Variables:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🗄️ MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
- Visit [mongodb.com/atlas](https://mongodb.com/atlas)
- Create free account
- Create new cluster (M0 Sandbox - Free)

### 2. Configure Database Access
- Go to "Database Access"
- Add new database user
- Username: `helpdesk-admin`
- Password: Generate secure password
- Role: "Atlas Admin" or "Read and write to any database"

### 3. Configure Network Access
- Go to "Network Access"
- Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
- Or add Render's IP ranges

### 4. Get Connection String
- Go to "Database" → "Connect"
- Choose "Connect your application"
- Copy connection string
- Replace `<password>` with your actual password

## 🧪 Testing Your Deployment

### Health Check
```bash
curl https://your-app-name.onrender.com/api/health
```

### API Endpoints
```bash
# Test hackathon endpoint
curl https://your-app-name.onrender.com/.well-known/hackathon.json

# Test CORS
curl -H "Origin: https://your-frontend-domain.com" \
     https://your-app-name.onrender.com/api/health
```

## 🔒 Security Best Practices

### 1. Strong JWT Secret
- Minimum 32 characters
- Mix of letters, numbers, symbols
- Example: `helpdesk-mini-super-secure-jwt-secret-2024-production-key`

### 2. MongoDB Security
- Use strong passwords
- Whitelist specific IPs in production
- Enable MongoDB Atlas security features

### 3. Environment Variables
- Never commit `.env` files
- Use Render's environment variable system
- Rotate secrets regularly

## 📊 Monitoring & Logs

### Render Dashboard
- Monitor service health
- View logs in real-time
- Check resource usage

### Custom Monitoring
```javascript
// Add to server.js for production monitoring
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}
```

## 🚨 Troubleshooting

### Common Issues:

**1. Build Failures**
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Check build logs in Render dashboard

**2. Runtime Errors**
- Check environment variables are set
- Verify MongoDB connection string
- Check application logs

**3. CORS Issues**
- Update CORS configuration for your frontend domain
- Test with curl to verify CORS headers

**4. Database Connection Issues**
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has proper permissions

### Debug Commands:
```bash
# Check service logs
# Use Render dashboard → Logs tab

# Test database connection
curl https://your-app.onrender.com/api/health

# Test specific endpoint
curl https://your-app.onrender.com/.well-known/hackathon.json
```

## 🔄 Continuous Deployment

### Automatic Deployments
- Render automatically deploys on git push to main branch
- Pull request previews available
- Manual deployments possible

### Rollback Strategy
- Use Render dashboard to rollback to previous version
- Keep stable releases tagged in git
- Test deployments in staging environment first

## 💰 Cost Optimization

### Free Tier Limits
- 750 hours/month
- Sleeps after 15 minutes of inactivity
- Cold start takes ~30 seconds

### Upgrade Options
- Starter: $7/month (always on)
- Standard: $25/month (better performance)
- Pro: $85/month (production ready)

## 📈 Performance Tips

### 1. Optimize Dependencies
- Remove unused packages
- Use production builds
- Minimize bundle size

### 2. Database Optimization
- Use MongoDB Atlas indexes
- Optimize queries
- Use connection pooling

### 3. Caching
- Implement Redis for session storage
- Cache frequently accessed data
- Use CDN for static assets

---

## 🎯 Next Steps After Deployment

1. **Test all endpoints** with your deployed URL
2. **Update frontend** to use production backend URL
3. **Set up monitoring** and alerts
4. **Configure custom domain** (optional)
5. **Set up CI/CD** for automated deployments

Your HelpDesk Mini backend will be production-ready on Render! 🚀
