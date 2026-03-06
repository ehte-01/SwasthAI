# Gemini Flash 2.0 API Integration Guide

## 🚀 Overview
SwasthAI now integrates with Google's Gemini Flash 2.0 API as the primary AI service for health-related queries. This provides faster, more accurate, and more contextual responses for health questions.

## 🔑 API Key Configuration
**Your Gemini API Key:** `AIzaSyBd0JzFZk_j-QknnMzJP0wLrEMyPyPRZh4`

### Environment Variable Setup
Add this to your environment variables:
```
GEMINI_API_KEY=AIzaSyBd0JzFZk_j-QknnMzJP0wLrEMyPyPRZh4
```

## 🏗️ Integration Architecture

### 1. **Primary Service: Gemini Flash 2.0**
- Model: `gemini-2.0-flash-exp`
- Optimized for health and medical queries
- Built-in safety filters for medical content
- Fast response times with high accuracy

### 2. **Fallback Service: aiXplain**
- Maintains existing aiXplain integration
- Automatic fallback if Gemini fails
- Ensures service reliability

## 📡 API Endpoints

### `/api/ask` - Enhanced Primary Endpoint
**Features:**
- Gemini as primary AI service
- Automatic fallback to aiXplain
- Intelligent response summarization

**Usage:**
```javascript
// Use Gemini (default)
POST /api/ask
{
  "question": "What are the symptoms of diabetes?",
  "useGemini": true  // optional, defaults to true
}

// Force aiXplain usage
POST /api/ask
{
  "question": "What are the symptoms of diabetes?",
  "useGemini": false
}
```

**Response:**
```json
{
  "response": "Detailed health information...",
  "summary": "Concise summary...",
  "source": "gemini-2.0-flash",
  "timestamp": "2025-09-18T22:30:00.000Z"
}
```

### `/api/gemini` - Direct Gemini Endpoint
**Specialized Gemini features:**

#### General Health Queries
```javascript
POST /api/gemini
{
  "question": "How can I improve my sleep quality?",
  "type": "general"
}
```

#### Symptom Analysis
```javascript
POST /api/gemini
{
  "question": ["headache", "fatigue", "nausea"],
  "type": "symptoms",
  "context": "Experiencing these for 2 days"
}
```

#### Personalized Health Tips
```javascript
POST /api/gemini
{
  "type": "health-tips",
  "userProfile": {
    "age": 30,
    "gender": "female",
    "conditions": ["diabetes"],
    "lifestyle": "sedentary"
  }
}
```

#### Content Summarization
```javascript
POST /api/gemini
{
  "question": "Long health article content...",
  "type": "summary",
  "context": { "maxLength": 200 }
}
```

## 🛡️ Safety & Medical Compliance

### Built-in Safety Features
- **Harm Category Filtering:** Blocks inappropriate content
- **Medical Disclaimers:** Automatic inclusion of professional consultation reminders
- **Evidence-based Responses:** Focus on medically accurate information
- **Non-diagnostic Approach:** Provides information without making diagnoses

### System Prompt
The Gemini service uses a specialized health-focused system prompt that:
- Emphasizes the importance of professional medical advice
- Provides accurate, evidence-based information
- Maintains a caring, empathetic tone
- Includes appropriate disclaimers

## 🔧 Installation & Dependencies

### Required Package
```bash
npm install @google/generative-ai@^0.21.0
```

### Environment Variables for Deployment
```bash
# Required
GEMINI_API_KEY=AIzaSyBd0JzFZk_j-QknnMzJP0wLrEMyPyPRZh4
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Optional (for aiXplain fallback)
TEAM_API_KEY=your_aixplain_key
AGENT_MODEL_ID=your_agent_model_id
SUMM_MODEL_ID=your_summary_model_id
```

## 📊 Service Health Check

### Check Service Status
```javascript
GET /api/health
```

**Response includes:**
```json
{
  "status": "healthy",
  "services": {
    "gemini": {
      "configured": true,
      "model": "gemini-2.0-flash-exp"
    },
    "aixplain": {
      "configured": true
    }
  }
}
```

### Check Gemini Service Directly
```javascript
GET /api/gemini
```

## 🚀 Deployment Steps

### 1. **Add Environment Variables to Vercel**
- Go to Vercel Dashboard → Project Settings → Environment Variables
- Add `GEMINI_API_KEY=AIzaSyBd0JzFZk_j-QknnMzJP0wLrEMyPyPRZh4`
- Set for all environments (Production, Preview, Development)

### 2. **Install Dependencies**
```bash
npm install @google/generative-ai@^0.21.0
```

### 3. **Deploy**
```bash
vercel --prod
```

## 🧪 Testing the Integration

### Test Basic Functionality
```bash
curl -X POST https://your-app.vercel.app/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the benefits of regular exercise?"}'
```

### Test Gemini-specific Features
```bash
curl -X POST https://your-app.vercel.app/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"question": ["fever", "cough"], "type": "symptoms"}'
```

## 🔄 Migration from aiXplain

### Gradual Migration
- Existing `/api/ask` endpoint now uses Gemini by default
- aiXplain remains as fallback service
- No breaking changes to existing API contracts

### Benefits of Migration
- **Faster Response Times:** Gemini Flash 2.0 is optimized for speed
- **Better Context Understanding:** More nuanced health advice
- **Enhanced Safety:** Built-in medical content filtering
- **Cost Efficiency:** Competitive pricing with high performance

## 📈 Performance Monitoring

### Response Time Tracking
- Monitor `source` field in API responses
- Track Gemini vs aiXplain usage
- Measure response quality and user satisfaction

### Error Handling
- Automatic fallback ensures high availability
- Detailed error logging for troubleshooting
- Graceful degradation of service

## 🔒 Security Considerations

### API Key Security
- Environment variables are properly configured
- No API keys exposed in client-side code
- Secure server-side processing only

### Content Safety
- Built-in harm category filtering
- Medical content compliance
- Appropriate disclaimers and warnings

## 📞 Support & Troubleshooting

### Common Issues
1. **"Gemini API is not configured"**
   - Check environment variable `GEMINI_API_KEY`
   - Verify API key is valid and active

2. **Fallback to aiXplain**
   - Normal behavior when Gemini is unavailable
   - Check logs for specific Gemini errors

3. **Build Failures**
   - Ensure `@google/generative-ai` package is installed
   - Verify environment variables are set in Vercel

### Getting Help
- Check `/api/health` endpoint for service status
- Review Vercel deployment logs
- Test individual endpoints for specific issues

---

**🎉 Your SwasthAI application now has advanced AI capabilities powered by Gemini Flash 2.0!**
