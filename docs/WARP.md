# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

SwasthAI (GramSwasth) is a comprehensive healthcare platform built for rural healthcare access in India. It combines modern web technologies with AI-powered health insights, 3D medical visualizations, and location-based healthcare services.

**Core Mission**: Revolutionizing rural healthcare access through multilingual AI assistance, doctor discovery, and healthcare facility mapping.

## Technology Stack

- **Frontend**: Next.js 15.5.3, React 19, TypeScript, Tailwind CSS
- **Backend**: Flask (Python), aiXplain custom agents, Google Gemini Flash 2.0 API
- **Database & Auth**: Supabase (with Row-Level Security)
- **UI Components**: Radix UI, shadcn/ui, Framer Motion
- **3D Visualization**: Three.js, React Three Fiber, React Three Drei
- **Deployment**: Vercel (frontend), Railway (backend)
- **Maps & Location**: Google Maps API, Leaflet

## Common Development Commands

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Flask backend (separate terminal)
python backend.py
```

### Building & Testing
```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Test backend API
npm run test-api

# Test production API
npm run test-api-prod
```

### Deployment Commands
```bash
# Deploy to Vercel
npm run vercel-deploy

# Deploy to production on Vercel
npm run vercel-prod

# Deploy to Railway (backend)
railway up
```

### Running Individual Tests
```bash
# Test specific API endpoint
curl http://localhost:5000/ask -X POST -H "Content-Type: application/json" -d '{"question": "What are diabetes symptoms?"}'

# Test Gemini integration
curl http://localhost:3000/api/gemini -X POST -H "Content-Type: application/json" -d '{"question": "Health tips for diabetes"}'
```

## Architecture Overview

### Frontend Architecture (Next.js App Router)
The application uses Next.js 13+ App Router with the following structure:

- **`app/`**: Main application routes and pages
  - **`page.tsx`**: Landing page with multilingual support
  - **`hero/`**: Main application dashboard
  - **`dashboard/`**: User health dashboard
  - **`profile/`**: User profile management
  - **`family-vault/`**: Family health records management
  - **`health-records/`**: Medical records storage
  - **`find-doctor/`**: Doctor discovery service
  - **`g-map/`**: Healthcare facility mapping
  - **`3d-lab/`**: 3D medical visualizations
  - **`test-ai/`**: AI service testing interface
- **`components/`**: Reusable React components
  - Disease prediction forms (Diabetes, Heart Disease, Parkinson's)
  - 3D medical visualizations
  - UI components and layouts
- **`lib/`**: Utility functions and configurations
  - **`ml.ts`**: Machine learning inference utilities

### Backend Architecture (Flask)
- **`backend.py`**: Main Flask application with AI services
  - Health assistant using aiXplain agents
  - Doctor discovery service
  - Healthcare center locator
  - Health news aggregation
- **`backend/`**: Additional backend utilities
  - Health scheduling services

### AI Service Integration
The platform integrates multiple AI services with automatic fallback:

1. **Primary**: Google Gemini Flash 2.0 API
   - Fast, accurate health responses
   - Built-in medical safety filters
   - Multilingual support
2. **Fallback**: aiXplain Custom Agents
   - Custom models for health, doctor discovery, news
   - Specialized rural healthcare focus

### Database Architecture (Supabase)
- **Authentication**: Email/password with verification
- **Row-Level Security**: Users access only their data
- **Tables**: User profiles, family members, health records, documents
- **Storage**: Secure file uploads for medical documents

### 3D Visualization System
- **Three.js Integration**: Medical organ visualizations
- **Interactive Elements**: Clickable anatomical parts
- **Disease Animations**: Visual representation of conditions
- **Educational Purpose**: Enhanced health education through 3D models

## Key Environment Variables

### Frontend (.env.local)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# API Configuration
NEXT_PUBLIC_API_URL=/api

# Google Services
GOOGLE_MAPS_API_KEY=your_google_maps_key

# AI Services
GEMINI_API_KEY=your_gemini_key
```

### Backend (.env)
```bash
# aiXplain Configuration
TEAM_API_KEY=your_team_api_key
DOC_MODEL_ID=your_doc_model_id
SUMM_MODEL_ID=your_summ_model_id
NEWS_MODEL_ID=your_news_model_id
AGENT_MODEL_ID=your_agent_model_id

# Google Services
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Gemini AI
GEMINI_API_KEY=your_gemini_key

# Deployment
PORT=5000
```

## Development Guidelines

### Code Organization
- Use TypeScript for all new frontend code
- Follow Next.js App Router conventions
- Implement proper error boundaries and loading states
- Use shadcn/ui components for consistent design
- Maintain separate concerns between frontend/backend

### AI Service Implementation
- Always implement fallback mechanisms for AI services
- Include proper error handling for API failures
- Sanitize and validate AI responses
- Include medical disclaimers in health-related responses
- Support multilingual queries and responses

### Medical Content Guidelines
- Never provide diagnostic advice
- Always include disclaimers about consulting healthcare professionals
- Focus on educational and informational content
- Implement safety filters for inappropriate medical queries
- Maintain HIPAA-like privacy standards for user data

### 3D Visualization Standards
- Optimize 3D models for web performance
- Implement proper loading states for 3D content
- Use educational color coding for anatomical parts
- Ensure accessibility with keyboard navigation
- Provide fallback content for devices without WebGL support

### Testing Requirements
- Test AI service integrations with various query types
- Verify multilingual functionality
- Test responsive design across devices
- Validate database operations and security
- Test 3D visualizations across browsers

### Deployment Considerations
- Configure CORS for production domains
- Set up proper environment variables for each service
- Implement proper monitoring for AI service usage
- Ensure Supabase RLS policies are correctly configured
- Test end-to-end functionality after deployment

## Important File Patterns

### Component Structure
- **Form Components**: `*Form.js/jsx/tsx` for health prediction forms
- **3D Components**: In `components/three/` for medical visualizations
- **UI Components**: In `components/ui/` for reusable interface elements

### API Routes (Next.js)
- **`/api/ask`**: Primary health assistant endpoint
- **`/api/gemini`**: Direct Gemini API integration
- **`/api/predict/*`**: Machine learning prediction endpoints
- **`/api/health`**: Service health monitoring

### Backend Endpoints (Flask)
- **`/ask`**: Health question processing
- **`/doctors`**: Doctor discovery service
- **`/health-centers`**: Healthcare facility location
- **`/news`**: Health news aggregation

## Special Considerations

### Multilingual Support
- The platform supports major Indian languages (Hindi, Gujarati, Bengali, Marathi, Tamil)
- Language detection is automatic based on user input
- Responses are provided in the same language as the query

### Rural Healthcare Focus
- Optimize for low-bandwidth environments
- Provide offline-capable features where possible
- Focus on common rural health conditions
- Include guidance for emergency situations

### Privacy & Security
- Implement proper data encryption for medical records
- Follow healthcare data privacy guidelines
- Use secure authentication and authorization
- Implement audit trails for medical data access

### Performance Optimization
- Lazy load 3D components
- Implement proper caching for AI responses
- Optimize images and assets for rural internet speeds
- Use progressive web app features for better offline experience