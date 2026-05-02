# TaskFlow — Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository with your code
- MongoDB Atlas account (for cloud MongoDB)

## Step 1: Create MongoDB Atlas Database

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user with a strong password
4. Get your connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
   ```
5. Save this for later

## Step 2: Deploy Backend to Railway

### Method 1: Using Railway Dashboard

1. Go to https://railway.app/dashboard
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Choose the `server` directory
5. Railway will auto-detect it's a Node.js app
6. Configure environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate with: `openssl rand -base64 32`
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: Your frontend URL (set later after frontend deployment)
7. Click "Deploy"
8. Wait for deployment to complete
9. Get your backend URL from Railway (e.g., `https://taskflow-api.up.railway.app`)

### Method 2: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# From root directory
cd server

# Initialize Railway
railway init

# Select "Create a new project"
# Name: taskflow-backend

# Add MongoDB plugin
railway add
# Select MongoDB

# Configure variables
railway variables

# Deploy
railway deploy

# Get your service URL
railway status
```

## Step 3: Deploy Frontend to Railway

### Method 1: Using Railway Dashboard

1. Go to https://railway.app/dashboard
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Choose root directory (not `/server`)
5. Configure build and start commands:
   - Build: `npm run build`
   - Start: `npm run build` (or configure static hosting)
6. Add environment variable:
   - `VITE_API_URL`: Your backend URL from Step 2
7. Click "Deploy"
8. Wait for deployment to complete
9. Get your frontend URL

### Method 2: Using Railway CLI

```bash
# From root directory
railway init

# Select "Create a new project" or "Add to existing"
# Name: taskflow-frontend

# Build the app
npm run build

# Configure environment
railway variables
# Set VITE_API_URL

# Deploy
railway deploy
```

## Step 4: Update Backend CORS Configuration

After frontend is deployed:

1. Go to backend project in Railway
2. Edit environment variables
3. Update `CORS_ORIGIN` to your frontend URL
4. Railway will auto-redeploy

## Step 5: Test Deployment

1. Visit your frontend URL
2. Test login with demo credentials:
   - Email: alice@demo.com
   - Password: demo123
3. Create a new project to verify backend connectivity
4. Check browser console for any API errors

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string has correct username and password
- Check MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0)
- Check network connectivity from Railway to MongoDB

### CORS Errors
- Verify `CORS_ORIGIN` includes your frontend URL
- Should be: `https://your-frontend.up.railway.app`
- Restart backend after changing

### API 404 Errors
- Verify `VITE_API_URL` is correct
- Should be: `https://your-backend.up.railway.app/api`
- Check frontend build includes correct URL

### Authentication Failures
- Verify `JWT_SECRET` is set in backend
- Check token expiration (24 hours)
- Clear browser localStorage and try again

## Monitoring

### View Logs
```bash
# Backend logs
railway logs -s backend

# Frontend logs
railway logs -s frontend
```

### Health Check
Visit: `https://your-backend.up.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-05-02T10:00:00.000Z"
}
```

## Scaling & Performance

- MongoDB Atlas free tier: Suitable for development
- Railway free tier: 5GB RAM, limited resources
- For production, upgrade to paid tier
- Enable auto-scaling if needed

## Security Checklist

- [ ] JWT_SECRET is random and strong
- [ ] MongoDB password is strong
- [ ] No credentials in code (use .env)
- [ ] CORS_ORIGIN is correct domain
- [ ] Email verification considered
- [ ] Rate limiting considered

## Additional Resources

- Railway Docs: https://docs.railway.app
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html
