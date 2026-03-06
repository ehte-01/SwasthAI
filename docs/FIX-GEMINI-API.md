# 🔧 Fix "Technical Difficulties" Error - Quick Solution

## 🚨 **Problem:** 
Getting "I'm experiencing technical difficulties with the AI service" error in the medical chatbot.

## ✅ **Solution:** 
The Gemini API key is not configured. Follow these steps:

### **Method 1: Automated Setup (Recommended)**

1. **Run the setup script**:
   ```bash
   node setup-gemini.js
   ```

2. **Follow the prompts**:
   - Get your API key from: https://aistudio.google.com/app/apikey
   - Paste it when prompted
   - The script will automatically update your `.env.local` file

3. **Restart your server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

### **Method 2: Manual Setup**

1. **Get your Gemini API key**:
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key (starts with `AIzaSy...`)

2. **Edit your `.env.local` file**:
   ```env
   # Add these lines (replace with your actual key):
   GEMINI_API_KEY=AIzaSyYour_Actual_API_Key_Here
   NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyYour_Actual_API_Key_Here
   ```

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

### **Method 3: Test & Diagnose**

1. **Visit the diagnostic endpoint**:
   - Go to: http://localhost:3000/api/debug-gemini
   - This will show you exactly what's missing

2. **Use the test component**:
   - Go to your app's hero page
   - Click "Test Gemini API Connection"
   - Follow the error messages for specific fixes

## 🧪 **Verify the Fix**

After setting up the API key:

1. **Check the status indicator**:
   - Should show "🟢 Gemini AI Online" instead of "🔴 AI Offline"

2. **Test the chatbot**:
   - Ask: "What are the symptoms of a common cold?"
   - Should get a detailed AI response instead of error message

3. **Run the API test**:
   - Use the "Test Gemini API Connection" button
   - Should show "✅ Connected" with sample response

## 🔍 **Still Having Issues?**

### **Common Problems:**

1. **"Invalid API key format"**
   - Make sure key starts with `AIzaSy`
   - Check for extra spaces or characters

2. **"API quota exceeded"**
   - Check your usage at: https://aistudio.google.com/app/apikey
   - Gemini has free tier limits

3. **"Environment variables not found"**
   - Make sure `.env.local` file exists in project root
   - Restart server after adding variables

### **Debug Commands:**

```bash
# Check if .env.local exists
ls -la .env.local

# View diagnostic info
curl http://localhost:3000/api/debug-gemini

# Test API directly
curl -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"question":"test","type":"symptoms"}'
```

## 🎉 **Success!**

Once fixed, your medical chatbot will:
- ✅ Show "Gemini AI Online" status
- ✅ Provide intelligent AI responses
- ✅ Handle medical queries professionally
- ✅ Include proper disclaimers and safety warnings

The error message will be replaced with helpful, AI-powered medical guidance!
