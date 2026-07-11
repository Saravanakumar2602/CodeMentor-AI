# CodeMentor AI - React Client Frontend (V4)

The React client frontend for CodeMentor AI is built using **Vite**, **TypeScript**, and **Tailwind CSS v4.0**.

---

## Workspace Structure

The frontend code resides in the `src/` directory and is structured as follows:

- **`src/components/`**: Core reusable visual elements.
  - `Layout.tsx`: Full-bleed sidebar dashboard layout with desktop and mobile responsive navigations.
  - `CodeArea.tsx`: Styled scrollable monospaced view component.
  - `PrivateRoute.tsx`: Client-side route protection verification wrapper.
- **`src/context/`**: Global react contexts handling states and asynchronous API operations.
  - `AuthContext.tsx`: Supabase session, token refresh, login, signup, and signout flows.
  - `PlaygroundContext.tsx`: Manages code inputs and code explanation requests.
  - `ReviewContext.tsx`: Code review analysis results and logs state management.
  - `LearningContext.tsx`: Conceptual path planner context.
  - `PracticeContext.tsx`: AI Practice Lab timer, unlocked progressive hints, statistics summary, and attempt logs.
- **`src/lib/`**: Network wrapper connections.
  - `api.ts`: Central Axios client configured with JWT interceptors.
  - `supabase.ts`: Supabase browser client wrapper.
- **`src/pages/`**: Primary page view layouts.
  - `Login.tsx` / `Signup.tsx`: Authentication screen forms.
  - `Dashboard.tsx`: Explain Code workspace.
  - `CodeReview.tsx`: Visual dashboard representing code reviews (scores, logic reviews, refactored blocks, and tips).
  - `LearningPath.tsx`: Tree-roadmap compiler page showing concepts, roadmaps, recommended steps, resources.
  - `Practice.tsx`: Split-pane LeetCode styled challenge workspace with independent scrolling, hint managers, text code-editors, and graded result drawers.
  - `History.tsx`: History audit logs selector.

---

## Local Configuration and Dev Setup

### Prerequisites
- Node.js v18 or higher installed on your local computer.

### Setup Instructions
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Set up environment configuration:
   - Create a `.env` file in the root of `frontend` (reference `.env.example`):
     ```env
     VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
     VITE_SUPABASE_ANON_KEY=ey...
     VITE_API_URL=http://localhost:8000/api
     ```
4. Start the Vite developer server:
   ```bash
   npm run dev
   ```
   - The dev build will launch at [http://localhost:5173](http://localhost:5173).

---

## Production Build & Linting

### Compile for Production
```bash
npm run build
```
- This compiles TypeScript verification (`tsc -b`) and bundles output files directly into the local `dist/` workspace folder using Rolldown/Vite.

### Linting
```bash
npm run lint
```
- Runs ESLint validation rules matching typescript-eslint rules configuration.
