# 🩺 SwasthAI — AI-Powered Healthcare Platform

<div align="center">


[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel)](https://swasth-ai-jc2f.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**🌐 Live Demo → [swasth-ai-jc2f.vercel.app](https://swasth-ai-jc2f.vercel.app)**

*Transforming healthcare through AI-powered diagnosis, 3D medical visualization, and intelligent doctor discovery.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [Author](#-author)

---

## 🧬 Overview

**SwasthAI** is a full-stack AI-powered healthcare platform built with **Next.js 15** and **Supabase**. It combines machine learning-based disease prediction, interactive 3D medical visualization, real-time doctor discovery via OpenStreetMap, and a comprehensive family health management system — all in one seamless web application.

> Built by a **Java Full Stack Developer** exploring the intersection of AI, healthcare, and modern web technologies.

---

## ✨ Features

### 🤖 AI Health Check
- **Heart Disease Prediction** — ML model analyzing 13 cardiovascular parameters
- **Diabetes Risk Assessment** — AI-powered risk scoring with anatomical visualization
- **Parkinson's Detection** — Voice-based disease detection system
- Real-time inference via Python Flask backend

### 🧬 3D Medical Laboratory
- Interactive **3D heart visualization** with Three.js / React Three Fiber
- **Blood vessel simulation** — Normal vs Hypertensive conditions
- **3D anatomical models** with real-time parameter changes
- Smooth animations powered by Framer Motion

### 🗺️ Find Doctor (Real Map)
- **Live GPS location** detection
- Real nearby hospitals & clinics via **OpenStreetMap + Overpass API**
- Interactive **Leaflet map** with custom markers
- Filter by facility type (Govt / Clinic / All)
- Mock doctor cards with specialty tabs, ratings, and booking

### 👨‍👩‍👧‍👦 Family Health Wallet
- Add & manage up to 5 family members
- Auto-populates logged-in user as first "Self" member
- Health plan subscription tracking
- Persistent storage via localStorage + Supabase sync

### 👤 Health Profile
- Complete medical profile — personal, address, medical history
- **Cloud sync** with Supabase `user_profiles` table
- Profile completeness tracker
- Emergency contact management

### 🧠 Mental Health & News
- Mental health assessment tools
- Health news & help center
- AI medical chatbot (Gemini API)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 15.5 | React framework, App Router, SSR |
| **TypeScript** | 5.0 | Type safety |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **Framer Motion** | latest | Animations & transitions |
| **shadcn/ui + Radix UI** | latest | Accessible UI components |
| **Lucide React** | 0.454 | Icon library |

### 3D & Visualization
| Technology | Version | Purpose |
|---|---|---|
| **Three.js** | 0.170 | 3D rendering engine |
| **@react-three/fiber** | 9.0 | React renderer for Three.js |
| **@react-three/drei** | 10.0 | Three.js helpers & abstractions |
| **Recharts** | 3.3 | Medical data charts |
| **Chart.js** | 4.5 | Additional charting |

### Maps & Location
| Technology | Version | Purpose |
|---|---|---|
| **Leaflet** | latest | Interactive maps |
| **React Leaflet** | latest | React bindings for Leaflet |
| **OpenStreetMap** | — | Free map tiles (no API key needed) |
| **Overpass API** | — | Real nearby hospital/clinic data |

### Backend & Database
| Technology | Version | Purpose |
|---|---|---|
| **Supabase** | 2.57 | PostgreSQL DB, Auth, Realtime |
| **@supabase/ssr** | 0.7 | Server-side auth helpers |
| **Next.js API Routes** | — | Serverless backend endpoints |
| **Google Gemini AI** | 0.21 | AI chatbot & health insights |
| **Axios** | 1.13 | HTTP client for ML backend |

### Forms & Validation
| Technology | Purpose |
|---|---|
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |

---

## 📁 Project Structure

```
SwasthAI/
├── frontend/
│   ├── app/
│   │   ├── 3d-lab/          # 3D Medical Laboratory
│   │   ├── find-doctor/     # Doctor discovery + real map
│   │   ├── health-check/    # AI disease prediction
│   │   ├── mental-health/   # Mental health tools
│   │   ├── simple-profile/  # Health profile + family wallet
│   │   ├── dashboard/       # User dashboard
│   │   ├── auth/            # Login / Signup
│   │   └── ...
│   ├── components/
│   │   ├── three/           # 3D visualization components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── navbar.tsx       # Global navigation
│   │   ├── footer.tsx       # Global footer
│   │   ├── family-wallet.tsx
│   │   ├── DiabetesWithAnatomy.jsx
│   │   ├── HeartDiseaseWithVisualization.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   └── ml.ts            # ML inference helpers
│   └── public/
│       └── models/          # 3D GLB model files
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/ehte-01/SwasthAI.git
cd SwasthAI/frontend

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase credentials (see below)

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI (for chatbot)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# ML Backend (optional - for AI predictions)
NEXT_PUBLIC_ML_API_URL=http://localhost:5000
```

### Supabase Tables Required

```sql
-- User profiles
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  emergency_contact TEXT,
  medical_conditions TEXT,
  allergies TEXT,
  medications TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 👨‍💻 Author

**Mohammad Ehtesham** — Java Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-ehte--01-181717?style=flat-square&logo=github)](https://github.com/ehte-01)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for healthcare innovation**

*SwasthAI — Empowering patients and professionals with AI*

</div>