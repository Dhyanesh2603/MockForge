# MockForge

An enterprise-grade AI technical interview simulation and real-time multiplayer code competition platform.

---

## Overview

MockForge is a full-stack technical assessment platform designed to simulate realistic software engineering interviews. The platform combines adaptive large language model evaluation, hands-free voice dictation, real-time proctoring telemetry, multi-language code compilation, and head-to-head multiplayer coding battles via persistent WebSockets.

---

## Core Capabilities

### 1. Adaptive AI Technical Interviewer and SWOT Engine
* **Dynamic Depth Scaling**: Analyzes candidate response depth across foundational, intermediate, advanced, and mastery tiers to dynamically adapt subsequent question difficulty.
* **Role-Specific Evaluation Rubrics**: Tailors evaluation criteria across five specialized engineering disciplines:
  * Backend Engineering (APIs, Database Locking, Concurrency, Security)
  * Frontend Engineering (State Architecture, Performance, DOM/CSS, Accessibility)
  * Data Science and Machine Learning (Pipelines, Model Tuning, Feature Engineering, Applied Math)
  * DevOps and Cloud Infrastructure (CI/CD, System Resilience, Containerization, Security)
  * Full Stack Engineering (End-to-End System Architecture, Scalability, Integration)
* **Four-Quadrant SWOT Assessment**: Generates structured feedback covering Strengths, Weaknesses, Opportunities, and Threats, alongside quantitative category scores (0 to 100).

### 2. Real-Time 1v1 Multiplayer Code Clash
* **Dual Competition Modes**: Supports dedicated 1v1 Code Challenges and Technical Interview Rounds.
* **Configurable Question Sets**: Matches can be configured for 1, 2, 3, 4, 5, 7, or 10 questions.
* **Live Telemetry Synchronization**: Synchronizes candidate progress, submission states, and active question indices in real time via Socket.io.
* **Parallel Evaluation Engine**: Executes concurrent evaluation for both participants upon match completion, analyzing algorithmic accuracy, time complexity, and communication clarity.
* **Comparative Visual Analytics**: Renders comparative radar charts and structured score breakdowns to determine the match winner.
* **Session Controls**: Includes challenge abort and early submission dialogs with confirmation guards.

### 3. In-Browser Multi-Language Compiler Sandbox
* **Supported Languages**:
  * JavaScript (ECMAScript 6) via isolated browser sandbox execution
  * Python 3.11 via abstract syntax tree parsing and dynamic interpretation
  * Java 21 (OpenJDK) via javac syntax parsing and stream evaluation
  * C++ 20 (GCC) via stream parsing and standard I/O pipelines
* **Custom Input (stdin) Pipeline**: Dedicated tab allowing candidates to provide custom test input to verify runtime execution before submission.
* **Automated Test Validation**: Evaluates candidate implementations against both sample test cases and hidden evaluation test cases.
* **Complexity Profiling**: Computes asymptotic Time Complexity and Space Complexity metrics upon solution submission.

### 4. FORGE GUARD Proctoring and Integrity Engine
* **Web Audio API Frequency Analysis**:
  * Isolates human vocal frequencies (300 Hz to 3400 Hz) using Fast Fourier Transform (FFT) spectrum binning.
  * Measures ambient noise baseline during initial calibration frames to detect transient noise bursts versus sustained background speech.
  * Automatically suppresses audio anomaly warnings while candidate voice dictation is active.
* **Visual Integrity Monitoring**: Evaluates luminance histograms and pixel variance to detect camera occlusion, missing faces, multi-face presence, and excessive overexposure.
* **Focus and Clipboard Monitoring**: Tracks tab visibility changes via the W3C Page Visibility API, window blur events, and external paste events exceeding character thresholds.
* **Movable Camera Viewport**: Provides a 280px by 185px draggable webcam overlay that can be repositioned across the viewport to avoid obstructing code editors or problem descriptions.

### 5. Hands-Free Voice Dictation and Speech Analytics
* **Speech-to-Text (STT)**: Utilizes the Web Speech Recognition API with confidence filtering (confidence >= 0.45) to exclude ambient microphone noise.
* **Text-to-Speech (TTS)**: Synthesizes spoken interview questions with selectable speech rates, pitches, and natural voice profiles.
* **Delivery Metrics**: Analyzes speaking pace (Words Per Minute), filler word frequency, and structural clarity.

### 6. Scoring Methodology
* **Exact Sum-of-Marks Scoring**: Computes overall performance strictly as the sum of evaluated marks across individual questions. Skipped or blank answers are scored zero.

---

## Technology Stack

### Frontend
* **Core Framework**: React 19, Vite
* **Routing**: React Router 7
* **Styling**: Vanilla CSS Design Tokens, Tailwind CSS v4
* **UI and Motion**: Lucide React, Framer Motion
* **Real-Time Client**: Socket.io Client
* **Authentication**: Firebase Authentication (Email/Password and Google OAuth)

### Backend
* **Runtime**: Node.js (ES Modules)
* **Web Framework**: Express 5
* **WebSockets**: Socket.io Server
* **Database Driver**: PostgreSQL Client (`pg`)
* **AI Inference**: NVIDIA NIM API (`meta/llama-3.1-70b-instruct`)
* **Auth Validation**: Firebase Admin SDK

---

## Directory Structure

```
MockForge/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── compiler/          # Multi-language sandbox and stdin frame
│   │   │   ├── proctoring/        # Proctoring overlay and draggable camera
│   │   │   ├── voice/             # Speech recognition and synthesis controls
│   │   │   └── NavBar.jsx         # Navigation bar and theme toggle
│   │   ├── context/               # Authentication context and user state
│   │   ├── hooks/                 # Proctoring telemetry and lifecycle hooks
│   │   ├── pages/
│   │   │   ├── auth/              # Authentication routes
│   │   │   ├── clash/             # 1v1 lobby, waiting room, match, and results
│   │   │   ├── dashboard/         # User dashboard and analytics history
│   │   │   ├── interviews/        # Interview setup and adaptive practice loop
│   │   │   ├── results/           # Single-interview evaluation report
│   │   │   └── HomePage.jsx       # Landing page and feature demonstrations
│   │   ├── routes/                # Application route definitions and guards
│   │   ├── services/              # Axios API client and Socket.io service
│   │   ├── utils/                 # Audio noise analyzer and speech analytics
│   │   ├── index.css              # Global design system and theme variables
│   │   └── main.jsx               # Client application entry point
│   ├── package.json
│   ├── vercel.json                # Single-page application routing configuration
│   └── vite.config.js
│
└── server/
    ├── src/
    │   ├── config/                # PostgreSQL connection pool configuration
    │   ├── controllers/           # Interview, clash, and coding route handlers
    │   ├── middleware/            # Firebase token verification middleware
    │   ├── repositories/          # Database query execution layers
    │   ├── routes/                # Express API route declarations
    │   ├── services/              # AI service, Socket service, clash evaluation
    │   └── server.js              # Server entry point and HTTP/WS initialization
    ├── package.json
    └── .env.example
```

---

## Installation and Local Setup

### Prerequisites
* Node.js version 18.0.0 or higher
* npm version 9.0.0 or higher
* PostgreSQL database instance (local or hosted via Supabase/Neon)
* Firebase project with Authentication enabled
* NVIDIA NIM API key

### 1. Repository Setup
```bash
git clone https://github.com/Dhyanesh2603/MockForge.git
cd MockForge
```

### 2. Backend Configuration
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@host:5432/database
NVIDIA_API_KEY=your_nvidia_nim_api_key
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
FIREBASE_PROJECT_ID=your_firebase_project_id
```

Start the backend server in development mode:
```bash
npm run dev
```

### 3. Frontend Configuration
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the client development server:
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Deployment Architecture

### Frontend Deployment (Vercel)
The client is a Single Page Application built with Vite and includes a preconfigured `vercel.json` rewrite file to ensure client-side routing functions correctly on page reloads.

1. Connect the repository to Vercel.
2. Set the Root Directory to `client`.
3. Set the Framework Preset to `Vite`.
4. Configure the environment variables (`VITE_API_URL`, Firebase keys).
5. Add your production Vercel domain to the Firebase Console Authorized Domains list.

### Backend Deployment (Koyeb / Railway / Persistent Container)
The backend requires a persistent Node.js runtime environment to support bidirectional WebSockets (`Socket.io`) for real-time 1v1 matches.

1. Create a Web Service on Koyeb, Railway, or Render with the Root Directory set to `server`.
2. Set the build command to `npm install` and start command to `node src/server.js`.
3. Configure the backend environment variables (`DATABASE_URL`, `NVIDIA_API_KEY`, `NVIDIA_MODEL`, `FIREBASE_PROJECT_ID`).
4. Ensure the service port is mapped to port 5000 or the assigned `PORT` variable.

---

## License

This project is licensed under the ISC License. See the LICENSE file for details.
