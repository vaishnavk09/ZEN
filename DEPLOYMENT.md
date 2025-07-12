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
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zen-app
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3001
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