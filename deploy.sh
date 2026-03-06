#!/bin/bash

# SwasthAI Vercel Full-Stack Deployment Script
echo "🚀 Starting SwasthAI Vercel Deployment..."

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

echo "🔍 Checking required tools..."
check_tool "npm"
check_tool "git"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🏗️  Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "🎉 Project is ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Run: vercel login"
echo "2. Run: vercel (for preview) or vercel --prod (for production)"
echo "3. Configure environment variables in Vercel dashboard"
echo "4. Your app will be live at the provided Vercel URL"
echo ""
echo "📖 See VERCEL-DEPLOYMENT.md for detailed instructions"
echo ""
echo "🔗 API Endpoints will be available at:"
echo "   - /api/ask (Health Assistant)"
echo "   - /api/doctors (Doctor Discovery)"
echo "   - /api/health-centers (Health Centers)"
echo "   - /api/news (Health News)"
echo "   - /api/health (Health Check)"
