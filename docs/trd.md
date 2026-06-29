# Technical Requirements Document (TRD) - Deep Dive

## 1. System Architecture Overview
The platform utilizes a highly scalable, service-oriented architecture:
- **Client App:** Next.js (React 18), deployed on Vercel/CDN.
- **API Gateway & REST Backend:** Node.js (Express) or Go, handling auth, billing, and CRUD operations.
- **Collaboration Server (CRDT):** Node.js WebSocket server running `Yjs` (`y-websocket`) for real-time document synchronization.
- **WebRTC SFU (Video/Audio):** LiveKit or Mediasoup server cluster.
- **Execution Engine:** A cluster of worker nodes running Docker daemon or AWS Firecracker for sandboxed code execution.
- **AI Microservice:** Python FastAPI service wrapping LLM APIs (OpenAI/Gemini) with a vector DB (Pinecone/Milvus) for RAG over codebase.

## 2. Real-Time Collaboration (Yjs/CRDTs)
- **Data Structure:** The Yjs document (`Y.Doc`) will contain:
  - `Y.Map('files')`: Key is file path, Value is a `Y.Text` representing the file content.
  - `Y.Map('project_state')`: E.g., currently active file, terminal layout.
- **Awareness Protocol:** `y-protocols/awareness` handles ephemeral state: cursors, text selections, and online status.
- **Persistence:** The `y-websocket` server periodically dumps the binary state vector of the `Y.Doc` to PostgreSQL (or LevelDB acting as a fast cache).

## 3. WebRTC & SFU Architecture (Video/Audio Conferencing)
To handle multiple users without melting client bandwidth, we will use a **Selective Forwarding Unit (SFU)** rather than a P2P Mesh.
- **Technology Choice:** **LiveKit** (Open source, highly scalable, excellent React SDK).
- **Topology:** Each client sends 1 upstream video/audio track to the LiveKit server. The LiveKit server forwards these tracks to other participants.
- **Simulcast:** Clients send multiple resolutions (e.g., 720p, 360p, 144p). The SFU dynamically routes the lowest required resolution to receivers based on their network strength and UI size (e.g., if video feeds are just small thumbnails, route the 144p stream).
- **Signaling:** LiveKit handles signaling over WebSockets automatically. Room creation happens via the Backend API generating a secure JWT for the client to connect to the LiveKit server.

## 4. Sandboxed Execution Engine
- **Containerization:** Ephemeral Docker containers for each active workspace.
- **Resource Limits:** 
  - CPU: `cpus="0.5"`
  - Memory: `memory="512m"`
  - Disk: `storage-opt size=2G`
- **Networking:** Containers run in a locked-down Docker network bridge. Outbound internet access is heavily restricted via iptables to prevent DDoS, crypto-mining, or accessing internal AWS metadata endpoints (`169.254.169.254`).
- **Terminal Integration (Xterm.js):** 
  - Frontend runs Xterm.js.
  - Backend uses `node-pty` to spawn a pseudo-terminal attached to `docker exec -it <container_id> /bin/bash`.
  - Data is piped back and forth via WebSockets.

## 5. AI Integration Pipeline (RAG & Code Understanding)
- **Problem:** LLMs cannot fit a 10,000-line project into a standard context window efficiently.
- **Solution (Project RAG):** 
  1. On save, file contents are chunked (e.g., by function/class using AST parsing via Tree-sitter).
  2. Embeddings are generated and stored in a Vector DB mapped to the `workspace_id`.
  3. When a user asks "Where is the auth logic?", the system vector-searches the DB, retrieves the top 5 relevant code chunks, and prepends them to the LLM prompt.
- **Streaming:** Responses use Server-Sent Events (SSE) directly to the client to render Markdown instantly.

## 6. Real-Time Event Payload Schemas (WebSocket)
Example payload for a custom event (outside of standard CRDT sync):
```json
// Event: Run Code
{
  "type": "EXEC_COMMAND",
  "payload": {
    "command": "npm run test",
    "cwd": "/app/src"
  },
  "meta": { "timestamp": 1700000000, "user_id": "uuid" }
}
```
