# MockForge

An enterprise-grade AI technical interview simulation, dynamic compiler sandbox, and real-time multiplayer code competition platform.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Core Platform Capabilities](#core-platform-capabilities)
   * [Adaptive AI Interviewer and SWOT Engine](#1-adaptive-ai-interviewer-and-swot-engine)
   * [Real-Time 1v1 Multiplayer Code Clash](#2-real-time-1v1-multiplayer-code-clash)
   * [In-Browser Multi-Language Compiler Sandbox](#3-in-browser-multi-language-compiler-sandbox)
   * [Forge Guard Proctoring and Telemetry Engine](#4-forge-guard-proctoring-and-telemetry-engine)
   * [Voice Dictation and Speech Analytics](#5-voice-dictation-and-speech-analytics)
   * [Performance Analytics and Trend Tracking](#6-performance-analytics-and-trend-tracking)
4. [Technology Stack](#technology-stack)
5. [Database Architecture and Schemas](#database-architecture-and-schemas)
6. [API Specification](#api-specification)
7. [WebSocket Event Protocol](#websocket-event-protocol)
8. [Directory Structure](#directory-structure)
9. [Installation and Local Setup](#installation-and-local-setup)
10. [Production Deployment Architecture](#production-deployment-architecture)
11. [License](#license)

---

## Executive Summary

MockForge is an end-to-end technical assessment ecosystem designed to replicate the rigorous engineering hiring bars of top-tier technology companies. The platform integrates large language model inference (via NVIDIA NIM and Meta LLaMA 3.1), Web Audio API frequency analysis, computer vision telemetry, sandboxed multi-language code execution, and persistent WebSockets for live 1v1 multiplayer competitions.

Whether conducting single-candidate adaptive technical interviews, system design interrogations, or synchronized head-to-head Code Clashes, MockForge provides precise quantitative scoring, detailed qualitative critiques, and holistic candidate integrity auditing.

---

## System Architecture

```
                                  +---------------------------------------+
                                  |         Candidate Web Client          |
                                  |  (React 19, Vite, Tailwind, Web Audio)|
                                  +-------------------+-------------------+
                                                      |
                             +------------------------+------------------------+
                             | HTTPS / REST                            | WSS / WebSockets (/clash)
                             v                                                 v
              +-------------------------------+               +-------------------------------+
              |       Express 5 API Server    |               |    Socket.io Real-Time Engine |
              |  - Auth Token Middleware      |               |  - Room State Synchronization |
              |  - Interview Session Routing  |               |  - Live Progress Telemetry    |
              |  - AI Generation & Evaluation |               |  - Match Lifecycle Management |
              +---------------+---------------+               +---------------+---------------+
                              |                                               |
         +--------------------+--------------------+                          |
         |                                         |                          |
         v                                         v                          v
+------------------+                    +--------------------+     +--------------------+
|  PostgreSQL DB   |                    |   NVIDIA NIM API   |     |  Firebase Auth SDK |
|  - Interviews    |                    |  (LLaMA 3.1-70B)   |     |  - JWT Validation  |
|  - Clash Matches |                    |  - Adaptive Q&A    |     |  - User Identity   |
|  - Evaluations   |                    |  - Code Evaluation |     +--------------------+
+------------------+                    |  - SWOT Reports    |
                                        +--------------------+
```

---

## Core Platform Capabilities

### 1. Adaptive AI Interviewer and SWOT Engine

* **Dynamic Depth Scaling**: Evaluates candidate answer depth across four competency tiers (Foundational, Intermediate, Advanced, Mastery) in real time. If a candidate misses core mechanics, the system adapts with targeted clarifying probes. If a candidate demonstrates mastery, the system increases depth toward distributed architecture, race conditions, edge-case resilience, and trade-offs.
* **Specialized Engineering Rubrics**:
  * **Frontend Engineering**: Concurrent rendering, Fiber reconciler, Virtual DOM, Microtask vs. Macrotask event loops, Critical Rendering Path, Interaction to Next Paint (INP), Cumulative Layout Shift (CLS), CSS Containment, state management architectures (Zustand, Redux Toolkit).
  * **Backend Engineering**: Event Loop phases (Timers, Poll, Check), libuv thread pool, connection pooling, indexing structures (B-Tree, Hash, GIN), isolation levels (ACID), optimistic vs. pessimistic concurrency, distributed transactions (Saga, 2PC), message queues (Kafka, RabbitMQ, BullMQ).
  * **System Design**: Consistent hashing, rate limiters, distributed cache invalidation, write-heavy vs. read-heavy architectures, geo-replication, CRDTs, video transcode pipelines, geospatial indexing.
  * **DevOps & Cloud Infrastructure**: Linux cgroups and namespaces, Kubernetes controller lifecycle, zero-downtime deployment strategies (Canary, Blue/Green, Rolling), Infrastructure-as-Code state locking, OpenTelemetry vs. Prometheus metrics architectures.
* **Four-Quadrant SWOT Assessment**: Generates structured evaluation reports covering:
  * **Strengths**: Specific architectural and algorithmic concepts articulated accurately.
  * **Weaknesses**: Missing edge-case handling, ambiguous trade-offs, or incomplete technical explanations.
  * **Opportunities**: Tailored growth paths and learning targets.
  * **Threats**: Production risks or anti-patterns identified in candidate answers.
* **Quantitative Score Dimensionality**: Computes 0-100 scores across Technical Depth, Problem Solving, System Architecture, and Communication Clarity.
* **Exact Sum-of-Marks Scoring**: Overall session scores are computed strictly as the cumulative sum of verified marks across individual questions. Skipped or empty submissions receive zero marks.

### 2. Real-Time 1v1 Multiplayer Code Clash

* **Competition Modes**:
  * **Technical Interview Battles**: Alternating technical conceptual questions under timed rounds.
  * **Algorithmic Coding Battles**: Live parallel programming challenges evaluated against strict test cases.
* **Configurable Match Formats**: Match sessions can be configured for 1, 2, 3, 4, 5, 7, or 10 questions.
* **Automated Matchmaking and Room Code Invitations**: Users can host rooms with custom parameters (role, tech stack, difficulty, proctoring mode) or join via 6-character room codes.
* **Live Telemetry Synchronization**: Synchronizes participant connection status, ready state, live question progression index, and submission states via WebSockets.
* **Parallel Evaluation and Winner Resolution**:
  * Evaluates both submissions simultaneously upon match completion.
  * Measures solution correctness, asymptotic Time Complexity, Space Complexity, and code elegance.
  * Declares winners based on cumulative marks obtained across all problem sets, with tie-break metrics for execution efficiency.

### 3. In-Browser Multi-Language Compiler Sandbox

* **Supported Runtimes**:
  * **JavaScript (ECMAScript 6+)**: Isolated browser sandbox execution with custom output stream routing.
  * **Python 3.11**: Abstract syntax tree parsing, runtime variable mapping, and dynamic execution.
  * **Java 21 (OpenJDK)**: Class structure parsing, standard stream capture (`System.out.println`), and expression evaluation.
  * **C++ 20 (GCC)**: Stream pipeline parsing (`cout << ... << endl`), input mapping, and execution evaluation.
* **Dedicated Custom Input (`stdin`) Pipeline**: Interactive tab allowing candidates to provide arbitrary standard input to verify program logic against custom edge cases prior to submission.
* **Dual Test-Suite Validation**: Validates code solutions against public sample test cases as well as hidden evaluation test cases.
* **Complexity Profiling**: Computes asymptotic Big-O Time Complexity (e.g., $O(1)$, $O(N)$, $O(N \log N)$, $O(N^2)$) and Space Complexity ($O(1)$, $O(N)$) upon final submission.

### 4. Forge Guard Proctoring and Telemetry Engine

* **Web Audio API Frequency Spectrum Analysis**:
  * **FFT Spectrum Binning**: Computes Fast Fourier Transform frequency representations across a 512-point buffer.
  * **Human Speech Band Isolation**: Isolates the human vocal range (300 Hz to 3400 Hz) using dynamic frequency bin calculations based on the audio hardware sample rate.
  * **Adaptive Ambient Noise Calibration**: Computes a quiet baseline noise floor over an initial 25-frame calibration period using 40th percentile ranking.
  * **Transient Burst Detection**: Distinguishes between sudden acoustic spikes (>40 units over baseline) and sustained speech.
  * **Dictation Suppression Guard**: Automatically silences audio integrity warnings while the candidate's active voice dictation is engaged.
* **Computer Vision and Pixel Luminance Analysis**:
  * Analyzes video feed luminance histograms and pixel variance.
  * Detects camera occlusion, severe underexposure, overexposure, and sudden shifts in lighting.
* **Viewport and Clipboard Integrity**:
  * Tracks tab visibility changes via the W3C Page Visibility API (`visibilitychange`).
  * Intercepts window focus/blur events.
  * Monitors clipboard paste payloads exceeding character thresholds.
* **Draggable Camera Viewport**: Provides a 280px by 185px draggable webcam overlay that candidates can position freely across the screen without obstructing code editors or problem descriptions.
* **Pre-Interview Device Verification Modal**: Validates camera access, microphone input levels, and speaker audio playback before granting entry to proctored sessions.

### 5. Voice Dictation and Speech Analytics

* **Speech-to-Text (STT)**: Built on the Web Speech Recognition API with confidence filtering (confidence >= 0.45) to prevent background murmur capture.
* **Text-to-Speech (TTS)**: Built on the Web Speech Synthesis API with adjustable pitch, playback rate, and voice profile selection.
* **Delivery Metrics**: Measures speech rate in Words Per Minute (WPM), tracks filler word frequency ("um", "uh", "like", "actually"), and assesses structural clarity.

### 6. Performance Analytics and Trend Tracking

* Historical analytics dashboard tracking candidate progression across sessions.
* Visual metrics for WPM progression, filler word reduction, confidence scoring, visual focus tracking, and algorithmic test pass rates.
* Session archive with per-question critiques, skill gap identifications, and topic mastery lists.

---

## Technology Stack

### Frontend Architecture
* **Framework**: React 19, Vite
* **Routing**: React Router 7
* **Styling**: Tailwind CSS v4, Vanilla CSS Custom Property Design System
* **Iconography & Animation**: Lucide React, Framer Motion
* **Real-Time Client**: Socket.io Client
* **Authentication**: Firebase Authentication (Email/Password, Google OAuth)
* **Audio/Visual Processing**: Web Audio API (AnalyserNode, FFT), Web Speech API, HTML5 Canvas

### Backend Architecture
* **Runtime**: Node.js (ES Modules)
* **Web Framework**: Express 5
* **WebSocket Server**: Socket.io Server
* **Database Driver**: PostgreSQL Connection Pool (`pg`)
* **AI Inference Provider**: NVIDIA NIM API (`meta/llama-3.1-70b-instruct`, `meta/llama-3.1-8b-instruct`)
* **Auth Verification**: Firebase Admin SDK

---

## Database Architecture and Schemas

The platform utilizes a PostgreSQL relational database structured for interview lifecycle management and multiplayer session persistence.

```sql
-- Single Candidate Interviews
CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    tech_stack TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview Question Bank
CREATE TABLE IF NOT EXISTS interview_questions (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidate Answers
CREATE TABLE IF NOT EXISTS interview_answers (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(interview_id, question_id)
);

-- AI Evaluation and SWOT Reports
CREATE TABLE IF NOT EXISTS interview_results (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER UNIQUE NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    strengths TEXT,
    weaknesses TEXT,
    feedback TEXT,
    evaluation_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multiplayer Code Clash Rooms
CREATE TABLE IF NOT EXISTS clash_rooms (
    id BIGSERIAL PRIMARY KEY,
    room_code VARCHAR(20) UNIQUE NOT NULL,
    host_user_id VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    tech_stack VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    num_questions INT DEFAULT 3,
    proctored BOOLEAN DEFAULT true,
    match_type VARCHAR(50) DEFAULT 'interview',
    status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Clash Match Questions
CREATE TABLE IF NOT EXISTS clash_questions (
    id BIGSERIAL PRIMARY KEY,
    room_code VARCHAR(20) REFERENCES clash_rooms(room_code) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    order_index INT NOT NULL
);

-- Clash Match Participants
CREATE TABLE IF NOT EXISTS clash_participants (
    id BIGSERIAL PRIMARY KEY,
    room_code VARCHAR(20) REFERENCES clash_rooms(room_code) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_picture TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'joined', -- 'joined', 'ready', 'submitted'
    current_question_index INT DEFAULT 0,
    score INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(room_code, user_id)
);

-- Clash Participant Answers
CREATE TABLE IF NOT EXISTS clash_answers (
    id BIGSERIAL PRIMARY KEY,
    room_code VARCHAR(20) REFERENCES clash_rooms(room_code) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    question_id BIGINT NOT NULL,
    answer_text TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(room_code, user_id, question_id)
);

-- Clash Match Results & Comparative Analytics
CREATE TABLE IF NOT EXISTS clash_results (
    id BIGSERIAL PRIMARY KEY,
    room_code VARCHAR(20) UNIQUE REFERENCES clash_rooms(room_code) ON DELETE CASCADE,
    winner_user_id VARCHAR(100),
    evaluation_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Specification

### Authentication Middleware
All protected endpoints require an `Authorization: Bearer <FIREBASE_ID_TOKEN>` header.

### Interview Management Endpoints
* `POST /api/interviews` — Initializes a new interview session and generates role-specific question sets.
* `GET /api/interviews` — Retrieves the authenticated candidate's interview session history.
* `GET /api/interviews/:id` — Retrieves full session metadata, associated questions, and recorded answers.
* `POST /api/interviews/adaptive/next` — Analyzes answer depth and dynamically generates the next adaptive question.
* `POST /api/interviews/adaptive/evaluate` — Generates a comprehensive SWOT analysis and role rubric score report.
* `POST /api/interviews/coding/generate` — Dynamically generates algorithmic problem statements, test cases, and hidden assertions.
* `GET /api/interviews/analytics/history` — Fetches candidate speaking rate trends, filler word metrics, and coding pass rates.

### Answer & Evaluation Endpoints
* `POST /api/answers` — Submits or updates an answer for a specific interview question.
* `POST /api/results/evaluate/:interviewId` — Triggers automated AI evaluation and persists scores, strengths, weaknesses, and critiques.
* `GET /api/results/:interviewId` — Fetches evaluation reports and SWOT analytics for a completed session.

### Multiplayer Code Clash Endpoints
* `POST /api/clash/create` — Creates a new multiplayer room with specified difficulty, question count, and match type.
* `GET /api/clash/:roomCode` — Fetches current room state, participant rosters, and question data.
* `POST /api/clash/:roomCode/submit` — Submits candidate answers for multiplayer clash evaluation.
* `GET /api/clash/:roomCode/result` — Retrieves completed match results, winner determinations, and comparative critiques.

---

## WebSocket Event Protocol

The Code Clash engine operates over the `/clash` Socket.io namespace.

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join_room` | Client -> Server | `{ roomCode, userId, userName, userPicture }` | Joins a clash room and registers participant. |
| `room_updated` | Server -> Client | `{ room, participants, questions }` | Broadcasts updated participant list and room state. |
| `toggle_ready` | Client -> Server | `{ roomCode, userId, ready }` | Updates readiness status. Starts match when all are ready. |
| `match_started` | Server -> Client | `{ startTime, questions, durationSeconds }` | Triggers synchronized 3-second countdown and match timer. |
| `update_progress`| Client -> Server | `{ roomCode, userId, questionIndex }` | Sends local question index update. |
| `opponent_progress`| Server -> Client | `{ userId, questionIndex }` | Broadcasts opponent question progression. |
| `submit_answers` | Client -> Server | `{ roomCode, userId, answers }` | Submits candidate answers. Triggers AI evaluation if all submitted. |
| `participant_submitted`| Server -> Client | `{ userId, participants }` | Notifies room that a participant has completed submission. |
| `evaluating_match` | Server -> Client | `{ message }` | Indicates AI parallel evaluation is currently in progress. |
| `match_completed`| Server -> Client | `{ result }` | Delivers comparative evaluations, scores, and winner resolution. |

---

## Directory Structure

```
MockForge/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/                # Static brand assets and iconography
│   │   ├── components/
│   │   │   ├── common/            # Shared primitives (MotionIcon, BrandLogo)
│   │   │   ├── compiler/          # Sandbox runner and custom stdin pipeline
│   │   │   ├── interviews/        # Resume parser and question components
│   │   │   ├── proctoring/        # Proctoring overlay, draggable webcam, audit card
│   │   │   ├── voice/             # Speech recognition and voice synthesizer
│   │   │   └── NavBar.jsx         # Header navigation and theme toggle
│   │   ├── context/               # Authentication and Theme state providers
│   │   ├── hooks/                 # Telemetry hooks (useProctoring, useAdvancedProctoring)
│   │   ├── pages/
│   │   │   ├── auth/              # Authentication routes (Login, Signup)
│   │   │   ├── clash/             # 1v1 lobby, waiting room, match, and results
│   │   │   ├── coding/            # Coding arena and challenge creation pages
│   │   │   ├── dashboard/         # User dashboard and analytics history
│   │   │   ├── interviews/        # Adaptive interview practice workspace
│   │   │   ├── results/           # Single-interview evaluation report
│   │   │   └── HomePage.jsx       # Platform landing page and live interactive demos
│   │   ├── routes/                # Route definitions and authentication guards
│   │   ├── services/              # Axios API client and Socket.io service
│   │   ├── utils/                 # Audio frequency analyzer and speech metrics
│   │   ├── index.css              # Global design system tokens and theme definitions
│   │   ├── App.jsx                # Application root component
│   │   └── main.jsx               # Client entry point
│   ├── package.json
│   ├── vercel.json                # Single-Page Application routing rewrite rules
│   └── vite.config.js
│
└── server/
    ├── src/
    │   ├── config/                # PostgreSQL pool and Firebase Admin initialization
    │   ├── controllers/           # Route controller logic for interviews and clashes
    │   ├── middleware/            # Firebase Bearer token authentication middleware
    │   ├── repositories/          # Database query abstraction layers
    │   ├── routes/                # Express router declarations
    │   ├── services/              # AI service, Socket service, match evaluation
    │   ├── sql/                   # Database initialization and migration scripts
    │   ├── app.js                 # Express application configuration
    │   └── server.js              # HTTP server and WebSocket initialization entry point
    ├── package.json
    └── .env.example
```

---

## Installation and Local Setup

### Prerequisites
* Node.js version 18.0.0 or higher
* npm version 9.0.0 or higher
* PostgreSQL database instance (local or hosted via Supabase, Neon, or Railway)
* Firebase Project with Authentication enabled (Email/Password and Google OAuth)
* NVIDIA NIM API key (obtainable from [NVIDIA API Catalog](https://build.nvidia.com/))

### 1. Clone the Repository
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

Create a `.env` file inside the `server/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/mockforge
NVIDIA_API_KEY=your_nvidia_nim_api_key
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
FIREBASE_PROJECT_ID=your_firebase_project_id
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Configuration
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

Create a `.env` file inside the `client/` directory:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the frontend development server:
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Production Deployment Architecture

### Frontend Deployment (Vercel)
The client application is built as a Single Page Application using Vite. A preconfigured `vercel.json` file is included in the `client/` directory to route all navigation requests to `index.html`.

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

1. Connect the GitHub repository to Vercel.
2. Set the **Root Directory** to `client`.
3. Set the **Framework Preset** to `Vite`.
4. Configure all `VITE_*` environment variables in the Vercel Project Settings.
5. Add your production Vercel domain to the **Authorized Domains** list in the Firebase Console under **Authentication -> Settings**.

### Backend Deployment (Koyeb / Railway / Persistent Container)
Because the backend maintains persistent bidirectional WebSocket connections (`Socket.io`) for multiplayer Code Clash matches, it must be deployed in a persistent runtime container rather than a serverless function environment.

1. Deploy the `server/` directory to a persistent hosting provider (Koyeb, Railway, Fly.io, or Render Web Service).
2. Set the **Build Command** to `npm install`.
3. Set the **Start Command** to `node src/server.js`.
4. Configure backend environment variables (`DATABASE_URL`, `NVIDIA_API_KEY`, `NVIDIA_MODEL`, `FIREBASE_PROJECT_ID`, `PORT`).
5. Ensure inbound WebSocket connections are enabled in your host's network settings.

---

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

