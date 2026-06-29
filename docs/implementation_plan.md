# Implementation Plan & Tech Stack Roadmap

## Tech Stack Overview
- **Frontend:** Next.js 14 (App Router), TailwindCSS, Radix UI (Headless components), Monaco Editor.
- **Backend Services:** 
  - API: Node.js / Express or NestJS.
  - Sync Server: Node.js running `y-websocket`.
  - RTC Server: LiveKit.
- **Execution Engine:** AWS Firecracker (via Firebuild/Ignite) or locked-down Docker daemon on scalable EC2 instances.
- **AI Layer:** Python FastAPI, LangChain, Pinecone (Vector DB), OpenAI/Gemini APIs.
- **Database:** PostgreSQL (via Prisma ORM), Redis.

---

## Phase 1: Foundational Sync & Editor (Weeks 1-4)
**Focus:** Building the core collaborative text-editing experience.
1. **Repository Setup:** Monorepo setup using Turborepo (apps: `web`, `api`, `sync-server`).
2. **Frontend UI Shell:** Implement the dark-mode UI based on the Design Brief. Sidebar, Tab headers, Editor pane.
3. **Monaco & Yjs Integration:** 
   - Mount Monaco Editor in React.
   - Setup `y-websocket` server.
   - Bind Monaco to `Y.Text` using `y-monaco` binding. Verify multi-cursor support.
4. **Auth & Database:** Setup PostgreSQL + Prisma. Implement NextAuth (GitHub OAuth).

## Phase 2: Whole-Project Execution Engine (Weeks 5-8)
**Focus:** Moving from a text editor to a real IDE.
1. **Worker Nodes:** Provision a pool of VMs.
2. **Docker Orchestrator API:** Write a service that accepts a request, pulls a base image (e.g., Node 18 Alpine), and starts a container with restricted network/CPU.
3. **Terminal Integration:** 
   - Integrate `Xterm.js` on the frontend.
   - Backend: Use `node-pty` to bind the Docker container's TTY to a WebSocket stream.
4. **File System Sync:** Extend Yjs to manage a `Y.Map` of the file tree. Create a service that syncs the Yjs file map to the physical Docker container volume in real-time.

## Phase 3: WebRTC / SFU Video Integration (Weeks 9-11)
**Focus:** In-app communication.
1. **LiveKit Deployment:** Deploy LiveKit Server via Helm chart on Kubernetes.
2. **Frontend SDK Integration:** Use `@livekit/components-react` to build the video grid.
3. **Signaling Flow:** Backend generates secure tokens for authenticated users to join the LiveKit room associated with their `workspace_id`.
4. **Hardware Management:** Implement device selection (Mic/Camera toggles).

## Phase 4: Advanced AI Features & Interview Mode (Weeks 12-15)
**Focus:** AI context and role-based workflows.
1. **AI RAG Pipeline:** 
   - Python service listens to save events.
   - Chunks files and pushes embeddings to Pinecone.
2. **AI Chat UI:** Implement conversational UI. Stream LLM responses via SSE.
3. **Interview Roles:** 
   - Implement RBAC logic. If role == 'candidate', hide the "Hidden Test Cases" UI panel.
   - Build the Interviewer summary dashboard.

## Phase 5: Polish, Security & Load Testing (Weeks 16-18)
1. **Security Audits:** Penetration testing to ensure Docker containers cannot escape or access AWS metadata.
2. **Load Testing:** Simulate 1000 concurrent WebSocket connections to the Yjs server using Artillery/K6.
3. **UI Polish:** Implement the micro-interactions defined in the design brief (animations, hover states).
