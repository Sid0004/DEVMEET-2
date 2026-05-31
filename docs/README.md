# DevMeet Project Architecture

Welcome to the DevMeet project directory. This workspace is structured as follows:

```
devmeet/
├── landing-page/    # Next.js marketing page (runs on http://localhost:3000)
├── client/          # Next.js app for dashboard, workspace, auth (runs on http://localhost:3001)
├── backend/         # Node.js + Express API server (runs on http://localhost:8000)
└── docs/            # Project documentation and guides
```

## Running the Services Locally

To run the full stack locally:

### 1. Backend Server
Runs on `http://localhost:8000`.
```bash
cd backend
npm run dev
```

### 2. Client Application (App UI)
Runs on `http://localhost:3001`.
```bash
cd client
npm run dev
```

### 3. Landing Page
Runs on `http://localhost:3000`.
```bash
cd landing-page
npm run dev
```

## Configuration

### CORS on Backend
Ensure the `backend/.env` file allows both frontends in its `CORS_ORIGIN` configuration:
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### APIs & Redirection
- **Landing Page** uses the environment variable `NEXT_PUBLIC_CLIENT_URL` inside `landing-page/.env.local` to point user actions (e.g. Sign In, Sign Up) to the Client App UI.
- **Client App** communicates with the Backend API using `NEXT_PUBLIC_API_BASE_URL` inside `client/.env.local`.
