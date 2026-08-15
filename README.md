# ⚡ MockForge — Enterprise AI Mock Interview & 1v1 Multiplayer Code Clash Platform

> **MockForge** is an advanced, production-grade AI technical interview preparation and multiplayer code competition platform. Built for software engineers, developers, and tech leads, MockForge simulates real-world technical rounds with adaptive AI question scaling, hands-free voice dictation, real-time proctoring, multi-language code execution, and 1v1 head-to-head multiplayer code battles.

---

## 🌟 Key Features

### 🧠 1. Adaptive AI Technical Interviewer & SWOT Engine
* **Dynamic Depth Scaling**: Evaluates candidate answer depth in real-time (*Foundational*, *Intermediate*, *Advanced*, *Mastery*) and dynamically adjusts subsequent question difficulty.
* **Role-Specific Evaluation Rubrics**: Customizable evaluation criteria tailored across 5 specialized technical tracks:
  * ⚙️ **Backend Engineer** (APIs, Database Locking, Concurrency, Security)
  * 🎨 **Frontend Engineer** (State, Performance, CSS/DOM, Accessibility)
  * 📊 **Data Science & ML** (Pipelines, Model Tuning, Feature Engineering, Math)
  * ☁️ **DevOps & Cloud** (CI/CD, Infrastructure Resilience, Containers, Security)
  * 💻 **Full Stack Engineer** (End-to-End Systems, Architecture, Scalability)
* **4-Quadrant SWOT Report Card**: Computes personalized **Strengths**, **Weaknesses**, **Opportunities**, and **Threats** alongside role rubric scores (0–100%).

---

### ⚔️ 2. Real-Time 1v1 Multiplayer Code Clash
* **Multiplayer Modes**: Head-to-head **`1v1 Code`** (coding challenges) and **`Interview`** (technical Q&A) rounds via persistent WebSockets (`Socket.io`).
* **Customizable Question Count**: Flexible match setups with **1, 2, 3, 4, 5, 7, or 10 questions**.
* **Live Progress Synchronization**: Displays real-time opponent progress (`"Opponent on Q2/3"`, `"Opponent Submitted"`).
* **Parallel AI Evaluation**: When both candidates submit, the backend executes `Promise.all` parallel AI evaluation, computing technical accuracy, time & space complexity, and communication depth simultaneously.
* **Comparative Radar Charts**: Visualizes score comparisons between candidate and opponent across Technical Depth, Communication, and Solution Clarity.
* **Graceful Exit Controls**: Includes `End Challenge` buttons and glassmorphic abort confirmation modals.

---

### 💻 3. In-Browser Multi-Language Compiler Sandbox
* **Multi-Language Execution Engine**: AST parsing and execution support for:
  * **JavaScript (ES6)** — Native isolated V8 execution sandbox
  * **Python 3.11** — AST parser and dynamic evaluation engine
  * **Java 21 (OpenJDK)** — `javac` AST & `System.out.println` expression evaluator
  * **C++ 20 (GCC)** — `g++` stream parser & `cout <<` pipeline
* **Custom Input (stdin) Tab**: Dedicated `Custom Input (stdin)` input box allowing candidates to enter custom test inputs before executing code.
* **Automated Test Case Engine**: Evaluates solutions against both visible sample test cases and hidden test cases.
* **Complexity Analysis**: Computes Big-O **Time Complexity** (e.g. `O(N log N)`) and **Space Complexity** (e.g. `O(1)`).

---

### 🛡️ 4. FORGE GUARD AI Proctoring System
* **Web Audio API FFT Noise Analyzer**:
  * **Speech Band Frequency Isolation (300 Hz – 3400 Hz)**: Filters out low-frequency background hums and high-frequency clicks.
  * **Adaptive Ambient Noise Calibration**: Calibrates rolling 40th percentile baseline (`AudioNoiseAnalyzer`) during the first 2.5 seconds to measure room ambient noise floor dynamically.
  * **Smart Dictation Bypass**: Automatically suppresses audio warnings while the candidate is actively dictating their interview response.
* **Luminance & Gaze Pixel Analysis**: Detects overexposure/bleaching, camera coverage, missing face, multi-face presence, and gaze deviation via canvas pixel buffer analysis.
* **W3C Page Visibility & Focus Guard**: Tracks tab switching (`document.visibilitychange`), window blur (`window.onblur`), and large clipboard paste events (`> 50 characters`).
* **Movable & Draggable Camera Preview Widget**: Floating camera preview (`280px × 185px`) with a drag handle (`⋮⋮ FORGE GUARD (DRAG TO MOVE)`), allowing candidates to reposition the webcam frame anywhere on screen.

---

### 🎙️ 5. Hands-Free AI Voice Dictation & Text-to-Speech
* **Web Speech Recognition (STT)**: Enables hands-free answer dictation with built-in confidence filtering (`confidence >= 0.45`) to filter out microphone clicks and ambient noise artifacts.
* **Web Speech Synthesis (TTS)**: Reads interview questions aloud with selectable voice pitch, speech rate, and accent support (US English, UK English, Google Natural Voices).

---

### 📊 6. Candidate Analytics & Evaluation Engine
* **Sum-of-Marks Scoring**: Computes overall interview scores strictly as the exact sum of individual question evaluations (awarding 0 marks for skipped or blank answers).
* **Delivery Metrics**: Analyzes speaking pace (Words Per Minute), filler word breakdown (*um*, *uh*, *like*, *basically*), and confidence trends over time.

---

## 🛠️ Technology Stack

### **Frontend**
* **Framework**: React 19, Vite
* **Styling**: Vanilla CSS with Design System Tokens & Sleek Ambient Mesh Backgrounds, Tailwind CSS v4
* **Icons & Motion**: Lucide React, Framer Motion
* **Real-time Engine**: Socket.io Client
* **Authentication**: Firebase Authentication (Email/Password & Google Sign-In)

### **Backend**
* **Runtime**: Node.js (ES Modules)
* **API Framework**: Express 5
* **WebSockets**: Socket.io Server
* **Database**: PostgreSQL / Supabase (`pg`)
* **AI Provider**: NVIDIA NIM API (`meta/llama-3.1-70b-instruct`)
* **Auth Verification**: Firebase Admin SDK

---

## 📁 Project Structure

```
MockForge/
├── client/                      # React 19 Frontend (Vite)
│   ├── public/                  # Static assets & icons
│   ├── src/
│   │   ├── components/          # Reusable UI components & modals
│   │   │   ├── compiler/        # CodeCompilerSandbox & stdin input frame
│   │   │   ├── proctoring/      # ProctoringOverlay & draggable webcam
│   │   │   ├── voice/           # VoiceInterviewerControls (STT/TTS)
│   │   │   └── NavBar.jsx       # Top navigation & theme toggle
│   │   ├── context/             # AuthContext (Firebase authentication)
│   │   ├── hooks/               # useProctoring hook & state guards
│   │   ├── pages/               # Application page routes
│   │   │   ├── auth/            # LoginPage
│   │   │   ├── clash/           # ClashLobby, ClashWaitingRoom, ClashMatch, ClashResult
│   │   │   ├── dashboard/       # DashboardPage & AnalyticsDashboardPage
│   │   │   ├── interviews/      # CreateInterview, InterviewDetails, AdaptiveInterviewPage
│   │   │   ├── results/         # ResultPage
│   │   │   └── HomePage.jsx     # Hero page & interactive demo tabs
│   │   ├── routes/              # AppRoutes & ProtectedRoute wrapper
│   │   ├── services/            # Axios API instance & clashSocket client
│   │   ├── utils/               # AudioNoiseAnalyzer & speechAnalytics
│   │   ├── index.css            # Ambient lighting mesh background & global CSS tokens
│   │   └── main.jsx             # React root entry point
│   ├── package.json
│   └── vite.config.js
│
└── server/                      # Node.js Express & Socket.io Backend
    ├── src/
    │   ├── config/              # PostgreSQL Pool & Supabase configuration
    │   ├── controllers/         # Interview, Clash, and Coding controllers
    │   ├── middleware/          # Firebase Auth Token Middleware
    │   ├── repositories/        # Database repositories (PostgreSQL queries)
    │   ├── routes/              # Express API endpoints
    │   ├── services/            # aiService.js (NVIDIA NIM), clashSocketService, clashEvaluationService
    │   └── server.js            # Express server entry point & Socket.io initialization
    ├── package.json
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **PostgreSQL / Supabase Database**: Active database instance
* **Firebase Project**: Firebase Auth enabled
* **NVIDIA NIM API Key**: Free key from [NVIDIA Build](https://build.nvidia.com/)

---

### Local Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Dhyanesh2603/MockForge.git
   cd MockForge
   ```

2. **Setup Backend (`server/`)**:
   ```bash
   cd server
   npm install
   ```

   Create a `.env` file inside `server/`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
   NVIDIA_API_KEY=nvapi-your-nvidia-nim-api-key
   NVIDIA_MODEL=meta/llama-3.1-70b-instruct
   FIREBASE_PROJECT_ID=your-firebase-project-id
   ```

   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend (`client/`)**:
   ```bash
   cd ../client
   npm install
   ```

   Create a `.env` file inside `client/`:
   ```env
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

   Start the frontend dev server:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open `http://localhost:5173/` in your browser.

---

## 🌐 Deployment Architecture

* **Frontend Deployment**: Deploys seamlessly to **Vercel** or **Netlify** (Vite React SPA).
* **Backend Deployment**: Deploys to **Render**, **Railway**, or **AWS EC2** (Requires a persistent Node.js environment to support WebSockets for 1v1 Clash).

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

<p align="center">
  Crafted with ❤️ by <b>MockForge Team</b>
</p>
