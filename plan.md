## DevMeet Roadmap

Build in small slices. Keep the current Next.js frontend and Express/Mongoose backend, then add auth, collaboration, realtime, and UI wiring in order.

## Tech Stack

| Area | Tech | Why |
| --- | --- | --- |
| Frontend | Next.js App Router, React 19, TypeScript | Existing app structure and typed UI |
| Styling  | CSS modules, global CSS variables, Tailwind v4, shadcn/Radix | Keep the current visual system |
| Backend  | Node.js, Express 5 | Simple API layer for auth and rooms |
| Database | MongoDB + Mongoose | Fits users, rooms, messages, activity |
| Auth     | JWT in httpOnly cookies | Browser sessions and protected routes |
| Realtime | Socket.IO | Presence, chat, typing, signaling |
| Media    | WebRTC or LiveKit | Audio/video transport |
| Editor   | Monaco Editor | Collaborative code editing |
| Code ed  | Judge0 or Piston | Sandboxed code runs |
| Validn   | Zod | Shared request and form checks |
| Datafetch| TanStack Query | Cached server state |
| Testing  | Supertest, Vitest or Jest, Playwright | API and end-to-end tests |
| External | UI Avatars, optional S3/R2 later | Avatars now, storage later |
assets 

## What To Do Next

### 1. Stabilize the base
-✅ Set backend and frontend environment variables.
- ✅Remove hardcoded local URLs.
- ✅Fix auth cookies for local and production.
- ✅Add consistent API response shapes.
- ✅Add request validation.

### 2. Finish auth
- Make register, login, logout, and refresh flow work.
- Add protected user and session endpoints.
- Replace direct fetch calls with a shared API helper.
- Keep custom JWT auth for the MVP.

### 3. Build the data model
- Create `Room`, `Message`, `VideoSession`, and `Activity` models.
- Add room create, join, leave, and history APIs.
- Add membership and access control checks.
- Add indexes and pagination.

### 4. Add realtime sync
- Add Socket.IO for presence, chat, typing, and signaling.
- Use WebRTC or LiveKit for audio and video.
- Keep the backend as the source of truth for access control.

### 5. Implement the workspace
- Use Monaco Editor for the editor area.
- Add file tree state, run output, and collaboration cursors.
- Connect code execution to Judge0 or Piston.
- Add AI assistance later as a separate layer.

### 6. Connect the frontend to live data
- Replace dashboard and workspace mock data with API data.
- Wire login, signup, dashboard, and room pages to backend flows.
- Use typed DTOs and TanStack Query.

### 7. Harden and ship
- Add backend tests for auth, rooms, and realtime.
- Add frontend integration and end-to-end tests.
- Add rate limiting, logging, and error handling.
- Document setup, env vars, and deployment steps.

## Files To Touch

- `backend/index.js` and `backend/app.js` for bootstrap, CORS, middleware, and routes.
- `backend/src/db/index.js` for MongoDB connection setup.
- `backend/src/controllers/user.controller.js` and `backend/src/routes/user.routes.js` for auth.
- `backend/src/models/user.model.js`, `backend/src/models/room.model.js`, and `backend/src/models/video.model.js` for domain models.
- `backend/src/middlewares/auth.middleware.js` for protected routes.
- `client/src/components/login-form.tsx` and `client/src/app/signup/page.tsx` for API wiring.
- `client/src/app/dashboard/page.tsx` and `client/src/app/workspace/page.tsx` for live collaboration UI.
- `landing-page/src/app/globals.css`, `landing-page/src/app/page.tsx`, and `landing-page/src/app/page.module.css` for landing page styling.
- `landing-page/src/app/components/CubeScene.tsx` if the cube hero stays.

## Decisions

- Keep Express + Mongoose for now.
- Use MongoDB for users, rooms, sessions, messages, and activity.
- Use Socket.IO for realtime events.
- Use WebRTC or LiveKit for media.
- Use Monaco Editor for the workspace.
- Use Judge0 or Piston for code execution.
- Use Zod and TanStack Query.
- Use Playwright plus Supertest and Vitest or Jest.

## Verification

- Run backend tests for auth, room creation, room join, and protected routes.
- Run frontend lint and build after API wiring.
- Check cookie auth on local HTTP and production-like HTTPS.
- Test Socket.IO room join, presence, and chat events.
- Confirm the workspace renders real room, chat, and activity data.

## Notes

1. Choose binary storage only if uploads become part of scope. S3/R2 is the simplest later option.
2. Decide early whether frontend, API, and realtime services deploy together or separately.
3. Keep or simplify the cube hero based on performance and brand direction.