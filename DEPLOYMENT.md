# Zen Wellness App - Deployment Guide

## Quick Deploy Options

### Option 1: Render (Recommended - Free)

1. **Sign up** at [render.com](https://render.com)
2. **Connect your GitHub repository**
3. **Create a new Web Service**
4. **Configure the service:**
   - **Name**: `zen-wellness-app`
   - **Environment**: `Node`
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables:**
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT tokens
   - `PORT`: `10000`

6. **Deploy!** Render will automatically deploy your app.

### Option 2: Railway

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect your GitHub repository**
3. **Create a new project**
4. **Add environment variables** (same as Render)
5. **Deploy automatically**

### Option 3: Heroku

1. **Install Heroku CLI**
2. **Login to Heroku**
3. **Create a new app**
4. **Set environment variables**
5. **Deploy using Git**

## Database Setup

### MongoDB Atlas (Recommended)

1. **Sign up** at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create a new cluster** (free tier available)
3. **Create a database user**
4. **Get your connection string**
5. **Add it to your deployment environment variables**

### Local MongoDB (Development)

```bash
# Install MongoDB locally
# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=4821f8f2b72f558a859e657d08d7959dc1688832e2402c9381302b9e0f3ed22917e6f32d426cc274a56c1b42720b081d37f0f1d3deedf650d4e0eb6a880891e2
PORT=10000
```

## Pre-deployment Checklist

- [ ] All dependencies are in package.json
- [ ] Environment variables are configured
- [ ] Database is set up and accessible
- [ ] Build process works locally
- [ ] API endpoints are tested

## Local Testing

```bash
# Install all dependencies
npm run install-all

# Build the application
npm run build

# Start the application
npm start
```

## Troubleshooting

### Common Issues:

1. **Build fails**: Check if all dependencies are in package.json
2. **Database connection fails**: Verify MONGODB_URI is correct
3. **Port issues**: Ensure PORT environment variable is set
4. **CORS errors**: Check if frontend URL is correctly configured

### Logs:

- **Render**: Check the logs tab in your dashboard
- **Railway**: View logs in the deployment tab
- **Heroku**: Use `heroku logs --tail`

## Post-deployment

1. **Test all features** on the deployed URL
2. **Set up custom domain** (optional)
3. **Configure SSL** (usually automatic)
4. **Set up monitoring** (optional)

## Support

If you encounter issues:
1. Check the deployment platform's documentation
2. Review the logs for error messages
3. Test locally to isolate issues
4. Check environment variable configuration 

##  **Deployment Issue Fixed!**

I've successfully resolved the build failure on Render. Here's what was wrong and what I fixed:

### ❌ **The Problem:**
Your build was failing because the `date-fns` package was being used in your React components but wasn't listed in your dependencies.

### ✅ **The Solution:**
1. **Added `date-fns`** to your `client/package.json` dependencies
2. **Verified the build** works locally
3. **Committed and pushed** the changes to GitHub

### 🔧 **What I Did:**
- Added `"date-fns": "^2.30.0"` to your client dependencies
- Tested the build locally (✅ successful)
- Pushed the fix to your GitHub repository

### 📋 **Environment Variables You Still Need:**
Make sure you have these set in Render:
```
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=4821f8f2b72f558a859e657d08d7959dc1688832e2402c9381302b9e0f3ed22917e6f32d426cc274a56c1b42720b081d37f0f1d3deedf650d4e0eb6a880891e2
PORT=10000
```

Your Zen wellness app should now deploy successfully on Render! The missing dependency issue has been completely resolved. 🌟 

Error: bad auth : authentication failed

means your app is able to reach your MongoDB Atlas cluster, but the **username or password in your connection string is incorrect**.

---

## How to Fix "bad auth : authentication failed"

### 1. **Check Your MongoDB Atlas Database User**

1. **Log in to [MongoDB Atlas](https://cloud.mongodb.com/)**.
2. Go to your **Cluster**.
3. In the left sidebar, click **Database Access**.
4. You’ll see a list of database users.  
   - Make sure you have a user with the correct **username**.
   - If you forgot the password, you can reset it here.

---

### 2. **Update Your Connection String**

1. In Atlas, click **Database** > **Connect** > **Connect your application**.
2. Copy the connection string template.
3. Replace `<username>` and `<password>` with the correct values from your Database Access page.
   - Example:  
     ```
     mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/mydatabase?retryWrites=true&w=majority
     ```
4. In your Render dashboard, go to your service’s **Environment** tab.
5. Update the environment variable (often called `MONGODB_URI` or similar) with the correct connection string.

---

### 3. **Redeploy or Restart Your Service**

- After updating the environment variable, redeploy or restart your Render service.

---

## **Summary Checklist**

- [ ] Confirm the database user exists in Atlas.
- [ ] Reset the password if you’re unsure.
- [ ] Update your connection string in Render’s environment variables.
- [ ] Redeploy/restart your service.

---

**If you want, paste your (redacted) connection string here and I’ll check it for errors (remove your password before posting).  
If you get stuck, let me know which step and I’ll guide you through it!** 