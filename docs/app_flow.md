# Application Flow & State Machine

## 1. Global User Journey & Authentication
1. **Unauthenticated State:** User arrives at `devmeet.com`.
   - Action: Clicks "Sign In".
   - Flow: Redirected to OAuth provider (GitHub). Callback returns to `/auth/callback`.
   - System: Creates JWT, stores in HttpOnly Cookie. Redirects to `/dashboard`.
2. **Authenticated State (Dashboard):**
   - User sees recent workspaces and active invites.
   - Action: Clicks "Create Interview".

## 2. Session Initialization Flow (The Cold Start)
When a workspace is created, the system must spin up resources.
1. **Frontend Request:** `POST /api/v1/workspaces { type: "interview", template: "node" }`.
2. **Backend Orchestration:**
   - DB Record created (`status: provisioning`).
   - Request sent to Worker Node via RabbitMQ/gRPC to start a Docker container.
   - LiveKit Server creates a new video room.
3. **Frontend Loading State:** Shows "Waking up environment...".
4. **Worker Response:** Container is ready. DB updated (`status: active`).
5. **Frontend Redirect:** Navigates to `/workspace/:id`.

## 3. Real-Time Workspace Connection Flow
Once inside `/workspace/:id`:
1. **WebSocket (CRDT) Connection:** Frontend connects to `wss://sync.devmeet.com/doc/:id`. Yjs synchronizes the file tree and editor states.
2. **Terminal Connection:** Frontend connects to `wss://exec.devmeet.com/pty/:id`. Bash prompt appears.
3. **WebRTC Connection:** Frontend requests LiveKit token from backend, then connects to `wss://rtc.devmeet.com`. Video/Audio tracks are published.

## 4. Interview Mode Specific States

### 4.1. The Waiting Room (Lobby)
- Candidate clicks invite link.
- State: Candidate is placed in a "Lobby" UI. They can test their mic/camera.
- Interviewer sees "Candidate John is waiting" and clicks "Admit".

### 4.2. Active Interview
- **UI Adjustments:**
  - Interviewer: Sees a private "Notes" panel and "Test Cases" panel.
  - Candidate: Sees only the editor and the problem description.
- **Events:**
  - Interviewer runs hidden tests. The execution engine runs the tests inside the container, but the results are streamed *only* to the Interviewer's WebSocket channel.
  - Candidate asks AI for a hint. The AI checks the Interviewer's settings ("Are hints allowed?"). If yes, it provides a subtle nudge.

### 4.3. Session Termination & Review
1. Interviewer clicks "End Interview".
2. **System Actions:**
   - WebSockets are immediately disconnected.
   - Docker container is frozen, code is zipped and saved to AWS S3.
   - Database `status` set to `completed`.
3. **Redirect:** Both users sent to `/workspace/:id/summary`.
4. **Summary View (Interviewer):**
   - AI automatically generates a summary of the candidate's performance based on code diffs, run times, and AI interactions.
   - Interviewer submits final score.

## 5. Error & Edge Case Flows
- **Network Disconnect:** Client shows "Reconnecting..." banner. Yjs queues local changes. Upon reconnection, CRDTs merge automatically without conflict.
- **Container OOM (Out of Memory):** If the user writes an infinite loop that crashes the Docker container.
  - Execution engine detects crash.
  - Backend emits `CONTAINER_CRASHED` via WebSocket.
  - UI shows modal: "Environment ran out of memory. [Restart Container]".
  - On restart, files are re-injected from the Yjs state.
