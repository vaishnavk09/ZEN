# 🚀 Quick Deploy Guide - Zen Wellness App

## ✅ Your app is ready for deployment!

The build was successful and all dependencies are installed.

## 🎯 Recommended: Deploy on Render (Free)

### Step 1: Set up MongoDB Atlas
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Get your connection string

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `zen-wellness-app`
   - **Environment**: `Node`
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables
In Render dashboard, add these environment variables:
```
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-random-secret-key
PORT=10000
```

### Step 4: Deploy!
Click "Create Web Service" and wait for deployment.

## 🔧 Alternative Platforms

### Railway
- Go to [railway.app](https://railway.app)
- Connect GitHub repo
- Add same environment variables
- Deploy automatically

### Heroku
- Install Heroku CLI
- Run: `heroku create zen-wellness-app`
- Set environment variables
- Deploy with: `git push heroku main`

## 📝 Environment Variables Explained

- **MONGODB_URI**: Your MongoDB Atlas connection string
- **JWT_SECRET**: Any random string for JWT token security
- **NODE_ENV**: Set to "production" for deployment
- **PORT**: Usually set automatically by the platform

## 🎉 After Deployment

1. Test your app at the provided URL
2. Check all features work (login, journal, mood tracker, etc.)
3. Set up a custom domain (optional)
4. Monitor your app's performance

## 🆘 Need Help?

- Check the logs in your deployment platform
- Verify environment variables are correct
- Test locally first: `npm start`
- See `DEPLOYMENT.md` for detailed troubleshooting

## 📊 Your App Features

✅ AI Chatbot for mental health support  
✅ Daily journal with mood tracking  
✅ Mood tracker with analytics  
✅ Guided breathing exercises  
✅ User authentication  
✅ Responsive design  

Your Zen wellness app is ready to help people with their mental health journey! 🌟 