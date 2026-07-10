# CodeMentor AI - Phase 1 MVP

CodeMentor AI is an AI-powered developer tool that explains complex code scripts using Nvidia's Nemotron-3 model and records explanation logs securely via Supabase.

---

## Architecture Overview

```
CodeMentor AI/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/              # API Route Handlers (explain, history, auth)
│   │   ├── core/             # Configuration & Auth Security
│   │   ├── models/           # Pydantic Request/Response validation models
│   │   ├── services/         # Integrations (Nemotron-3 Client & Supabase Python Client)
│   │   └── main.py           # FastAPI Entrypoint
│   ├── requirements.txt      # Python libraries
│   └── schema.sql            # Postgres SQL migration script
└── frontend/                 # React SPA (Vite + TypeScript)
    ├── src/
    │   ├── components/       # Reusable layout & input fields
    │   ├── context/          # Authentication state management
    │   ├── lib/              # Axios & Supabase API clients
    │   ├── pages/            # Login, Signup, Dashboard, History pages
    │   └── main.tsx          # React application mounting
    └── package.json          # Node libraries
```

---

## 1. Database and Authentication Setup (Supabase)

1. **Create a Supabase Project**: Go to [Supabase Console](https://supabase.com) and create a new project.
2. **Execute Database Schema**:
   * Navigate to the **SQL Editor** tab in your Supabase dashboard.
   * Click **New Query**.
   * Copy the SQL script inside [backend/schema.sql](file:///c:/Saravanakumar%20G/Projects/CodeMentor%20AI/backend/schema.sql) and paste it into the query editor.
   * Click **Run**. This will create the `profiles` table, `chat_history` table, enable Row-Level Security (RLS) policies, and register a Postgres database trigger to automatically map signed-up users to the public `profiles` table.

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
