#!/bin/bash

echo "🚀 Zen Wellness App Deployment Script"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string-here
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3001
EOF
    echo "📝 Please update the .env file with your actual values"
fi

echo "🎉 Deployment preparation completed!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with real values"
echo "2. Choose a deployment platform:"
echo "   - Render (recommended): https://render.com"
echo "   - Railway: https://railway.app"
echo "   - Heroku: https://heroku.com"
echo "3. Follow the instructions in DEPLOYMENT.md"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md" 