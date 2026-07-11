# CodeMentor AI - Adaptive Developer Practice Platform (V4)

CodeMentor AI is an AI-powered personal developer companion. It supports four core features:
1. **Explain Code (V1)**: Pedogogically breaks down complex code snippets using NVIDIA's Nemotron AI model.
2. **Code Review (V2)**: Generates static code analysis, grading readability, security, complexity, naming patterns, and SOLID compliance.
3. **Learning Path (V3)**: Constructs personalized knowledge-gap assessments and conceptual learning roadmaps.
4. **AI Practice Lab (V4)**: Provides a LeetCode-styled interactive split-pane coding workspace. Generates personalized exercises (Coding, MCQs, Output Prediction, Find the Bug, Fill in the Blank) based on past review metrics and learning gaps, complete with a progressive hint system, streak/accuracy statistics tracker, and in-depth performance evaluation drawers.

---

## Architecture Overview

```
CodeMentor AI/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/              # API Route Handlers (auth, explain, history, review, learning, practice)
│   │   ├── core/             # Configuration & Auth Security
│   │   ├── models/           # Pydantic validation schemas
│   │   ├── services/         # Integrations (Nemotron-3 Client & Supabase Python Client)
│   │   └── main.py           # FastAPI Entrypoint
│   ├── requirements.txt      # Python libraries
│   ├── schema.sql            # Core User & Chat Schema
│   ├── code_reviews_migration.sql       # Code Review Schema
│   ├── learning_history_migration.sql   # Learning Path Schema
│   └── practice_lab_migration.sql       # Practice Lab Schema
└── frontend/                 # React SPA (Vite + TypeScript + Tailwind CSS 4)
    ├── src/
    │   ├── components/       # Reusable layout, navigation, and visual editor widgets
    │   ├── context/          # Context states (Auth, Playground, Review, Learning, Practice)
    │   ├── lib/              # Axios & Supabase API clients
    │   ├── pages/            # Dashboard views (Login, Signup, CodeReview, LearningPath, Practice)
    │   └── main.tsx          # React application mounting
    └── package.json          # Node libraries
```

---

## 1. Database and Authentication Setup (Supabase)

1. **Create a Supabase Project**: Go to [Supabase Console](https://supabase.com) and create a new project.
2. **Execute Database Schemas**:
   * Navigate to the **SQL Editor** tab in your Supabase dashboard.
   * Click **New Query** and run the query files in sequence:
     1. [backend/schema.sql](file:///c:/Saravanakumar%2520G/Projects/CodeMentor%2520AI/backend/schema.sql): Sets up auth-profile syncing, base triggers, and chat histories.
     2. [backend/code_reviews_migration.sql](file:///c:/Saravanakumar%2520G/Projects/CodeMentor%2520AI/backend/code_reviews_migration.sql): Adds the `code_reviews` table.
     3. [backend/learning_history_migration.sql](file:///c:/Saravanakumar%2520G/Projects/CodeMentor%2520AI/backend/learning_history_migration.sql): Adds the `learning_history` table.
     4. [backend/practice_lab_migration.sql](file:///c:/Saravanakumar%2520G/Projects/CodeMentor%2520AI/backend/practice_lab_migration.sql): Adds the `practice_questions`, `practice_attempts`, and `practice_statistics` tables.
   * Make sure RLS policies are enabled and apply successfully for all tables.

---

## 2. Local Backend Configuration (FastAPI)

### Prerequisites
* Python 3.10 or higher installed.

### Setup Steps
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **Mac/Linux (Terminal)**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   * Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   * Open the `.env` file and fill in your keys:
      * **`AI_API_KEY`**: Obtain this key from your OpenRouter console.
      * **`AI_API_BASE_URL`**: Set to `https://openrouter.ai/api/v1`.
      * **`AI_MODEL_NAME`**: Set to `nvidia/nemotron-3-ultra-550b-a55b:free`.
      * **`SUPABASE_URL`**: Found in your Supabase Project Settings -> API -> Project URL.
      * **`SUPABASE_KEY`**: Found in Supabase Settings -> API -> Project API Keys (Use the `service_role` key so the backend can write to the database on behalf of users).
      * **`SUPABASE_JWT_SECRET`**: Found in Supabase Settings -> API -> JWT Settings -> JWT Secret (Used for secure token decoding).

5. Start the backend developer server:
   ```bash
   uvicorn app.main:app --reload
   ```
   * The server runs on [http://localhost:8000](http://localhost:8000).
   * Interactive OpenAPI docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 3. Local Frontend Configuration (React + Vite)

### Prerequisites
* Node.js v18 or higher installed.

### Setup Steps
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   * Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   * Open the `.env` file and insert the public API keys:
     * **`VITE_SUPABASE_URL`**: Found in Supabase Settings -> API -> Project URL.
     * **`VITE_SUPABASE_ANON_KEY`**: Found in Supabase Settings -> API -> Project API Keys -> `anon` public key.
     * **`VITE_API_URL`**: Set to `http://localhost:8000/api` for local development.

4. Start the frontend developer server:
   ```bash
   npm run dev
   ```
   * The React site will launch at [http://localhost:5173](http://localhost:5173).

---

## 4. Deployment Instructions

### Database: Supabase
The database configuration is completely handled in Step 1. Row Level Security guarantees data isolation between accounts.

### Backend: Render
1. Create a free account on [Render](https://render.com/).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository containing the CodeMentor AI codebase.
4. Fill in the following build options:
   * **Root Directory**: `backend`
   * **Runtime**: `Python`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Go to the **Environment** tab on Render and add the environment variables defined in your backend `.env` file:
    * `AI_API_KEY`
    * `AI_API_BASE_URL`
    * `AI_MODEL_NAME`
   * `SUPABASE_URL`
   * `SUPABASE_KEY`
   * `SUPABASE_JWT_SECRET`
6. Click **Deploy**. Copy the generated Render URL (e.g., `https://codementor-api.onrender.com`).

### Frontend: Vercel
1. Create a free account on [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure project settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Add the Environment Variables:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
   * `VITE_API_URL`: Set this to your live backend URL on Render (e.g., `https://codementor-api.onrender.com/api`).
6. Click **Deploy**.
