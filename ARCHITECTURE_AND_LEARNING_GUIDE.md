# DEVMEET-2: Technical Architecture, Scaling Blueprint & Engineering Study Guide

> **Target:** Launch-Ready, Horizontally Scalable Collaborative Developer Platform  
> **Core Subsystems:** Code Studio IDE, Cloud Sandboxed Terminal, GitHub Sync, SFU Video Conferencing, Collaborative Whiteboard, Distributed Socket Gateway

---

## 1. Executive System Topology: From Monolith to Distributed Engine

To build and launch **DEVMEET** so it doesn't crash when hundreds of developers open rooms simultaneously, we must transition from a single-node in-memory prototype to an **event-driven, decoupled micro-subsystem architecture**.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT (Next.js 16 / React 19)                                │
│                                                                                                 │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────┐ ┌──────────────────┐ │
│  │   CodeStudio (IDE)    │ │  Conferencing Engine  │ │ Whiteboard Canvas │ │   Chat Drawer    │ │
│  │  • Monaco + Yjs CRDT  │ │  • LiveKit SFU Client │ │ • Vector strokes  │ │ • Rate limited   │ │
│  │  • xterm.js Terminal  │ │  • Persistent Audio   │ │ • Dot-grid engine │ │ • User presence  │ │
│  │  • Multi-file tabs    │ │  • Screen share track │ │ • State snapshot  │ │ • Unread badges  │ │
│  └───────────┬───────────┘ └───────────┬───────────┘ └─────────┬─────────┘ └────────┬─────────┘ │
└──────────────┼─────────────────────────┼───────────────────────┼────────────────────┼───────────┘
               │ (Yjs / Binary WSS)       │ (WebRTC Media)        │ (Socket.io)        │ (Socket.io)
               │                         │                       │                    │
┌──────────────▼─────────────────────────▼───────────────────────▼────────────────────▼───────────┐
│                                 INFRASTRUCTURE & SERVICE MESH                                   │
│                                                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────────────┐ │
│  │    LiveKit SFU Server   │  │   Socket.io Cluster     │  │   Isolated Execution Runner      │ │
│  │   (Audio/Video Router)  │  │ (Express 5 + Redis Pub) │  │  (Docker / Piston Container)     │ │
│  │  • 1 upload / N down    │  │ • Sticky sessions       │  │  • node-pty ephemeral terminal   │ │
│  │  • Adaptive bitrate     │  │ • Room state sync       │  │  • Read-only rootfs + cgroups    │ │
│  │  • Integrated TURN/STUN │  │ • Yjs CRDT coordinator  │  │  • Zero host-system access       │ │
│  └─────────────────────────┘  └────────────┬────────────┘  └──────────────────────────────────┘ │
│                                            │                                                    │
│                               ┌────────────▼────────────┐                                       │
│                               │   Redis Cluster / Valkey│                                       │
│                               │  • Socket adapter pub/sub│                                      │
│                               │  • Room presence cache  │                                       │
│                               │  • Active Y.Doc buffers │                                       │
│                               └────────────┬────────────┘                                       │
│                                            │ (Debounced batch writes)                           │
│                               ┌────────────▼────────────┐                                       │
│                               │      MongoDB Atlas      │                                       │
│                               │  • Users, Orgs, Rooms   │                                       │
│                               │  • Chat & Code files    │                                       │
│                               └─────────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Deep Dive: The Subsystems & How to Build Them Right

---

### Subsystem A: Pair Programming IDE (Monaco + Yjs + Multi-File Awareness)

#### 1. How Real-Time Collaborative Coding Actually Works

In a collaborative IDE, two engineers must be able to type on the exact same line at the exact same millisecond without losing keystrokes or clobbering each other's code.

- **Why raw strings fail:** If User A sends the whole file text and User B sends the whole file text at the same time, the slower network packet overwrites the faster one.
- **The CRDT Solution (Conflict-free Replicated Data Type):**
  - Yjs splits text into mathematical character trees where each character has a unique ID: `(clientID, clock)`.
  - When you type a letter, Yjs emits an **incremental binary delta** (a few bytes).
  - Regardless of network latency or packet reordering, all connected clients converge to the exact same text mathematically without requiring a centralized lock.

#### 2. Clean Architecture for the Code Studio Subsystem

Deconstruct the code editor into focused modules:

```
frontend/src/modules/workspace/ide/
├── CodeStudio.jsx                 # IDE layout container (Editor + Explorer + Terminal)
├── FileExplorer.jsx               # File sidebar, rename, create, delete, language badges
├── EditorTabBar.jsx               # Tabs with peer collaborator avatar pills
├── CollaborativeMonacoEditor.jsx  # Monaco mount + Y.Doc + y-monaco + awareness cursors
├── TerminalDrawer.jsx             # Collapsible terminal runner drawer
└── hooks/
    ├── useEditorShortcuts.js      # Cmd+S, Cmd+Enter (run), Cmd+B (toggle explorer)
    └── useCollaborativePresence.js# Peer selection ranges & remote caret tooltips
```

#### 3. Solving Multi-File Collaboration Without Tab Hijacking

- **The Problem:** In naive implementations, switching a tab syncs `activeFileIndex` over the socket, forcing everyone else's screen to switch files against their will!
- **The Solution:**
  1. A single shared `Y.Doc` contains multiple `Y.Text` instances: `ydoc.getText("main.ts")`, `ydoc.getText("utils.py")`.
  2. Tab navigation is **strictly local client state**. User A can be looking at `main.ts` while User B is editing `utils.py`.
  3. Cursors are tracked per file using `awareness.setLocalStateField("user", { currentFile: "main.ts", cursor: { line, col } })`.
  4. On the tab bar and file tree, render little avatar dots showing _which file each collaborator is currently working on_.

---

### Subsystem B: Real Interactive Terminal (xterm.js + node-pty + Sandboxed Containers)

#### 1. Why `child_process.execFile` on Host is Fatal

Your current backend code runs `child_process.execFile` on the host machine. If someone types:

```python
import os; os.system("rm -rf /") # or reading process.env
```

They can delete your entire server, dump all MongoDB secrets, or turn your server into a crypto-mining bot.

#### 2. The Production Terminal Architecture (Like Replit & CodeSandbox)

```
┌─────────────────┐             WebSocket Binary Stream              ┌───────────────────────────┐
│  Browser Window │ ◄──────────────────────────────────────────────► │    Backend Node Server    │
│  [xterm.js]     │   Keystrokes (stdin)    Terminal output (stdout)  │  (spawns node-pty bridge) │
└─────────────────┘                                                  └─────────────┬─────────────┘
                                                                                   │
                                                                   docker exec -it │ (or Docker API)
                                                                                   ▼
                                                                     ┌───────────────────────────┐
                                                                     │   Ephemeral Linux Sandbox │
                                                                     │   (Docker / Alpine Container)
                                                                     │   • CPU quota: 0.5 vCPU   │
                                                                     │   • RAM quota: 256 MB     │
                                                                     │   • Network: none/isolated│
                                                                     │   • User: non-root `guest`│
                                                                     │   • Mounted: /workspace   │
                                                                     └───────────────────────────┘
```

#### 3. Recommended Tools to Use (Don't Rebuild from Scratch!):

1. **Frontend Terminal UI:**
   - **`@xterm/xterm`**: The de-facto terminal emulator used by VS Code.
   - **`@xterm/addon-fit`**: Automatically resizes terminal columns/rows when the panel expands.
   - **`@xterm/addon-web-links`**: Makes URLs in terminal output clickable.
2. **Backend Pseudo-Terminal Bridge:**
   - **`node-pty`**: Spawns real interactive shells (bash, zsh, sh) with full ANSI colors, cursor positioning, and tab completion.
3. **Execution Sandbox Strategy:**
   - **Stage 1 (Launch MVP - Zero Infrastructure Ops):** Use the **Piston API** (open source by EngineerMan) or **Judge0**. It runs 50+ languages in secure, disposable cgroups with execution timeouts and memory caps.
   - **Stage 2 (Full Interactive Shell Scale):** Docker containers spawned dynamically per room with volume mounting:
     ```bash
     docker run -d --rm \
       --name devmeet_room_123 \
       --cpus="0.5" \
       --memory="256m" \
       --network=none \
       -v /tmp/rooms/123:/home/coder/workspace \
       devmeet-runner:latest
     ```

---

### Subsystem C: GitHub Repository Integration (Clone, Pull, Commit, Push)

How do modern cloud workspaces handle GitHub without storing user passwords?

#### 1. Authentication Architecture (OAuth App vs GitHub App)

- **GitHub OAuth App**: Grants access to the user's repositories via the `repo` scope.
- **The Token Flow:**
  1. User clicks **"Import GitHub Repo"** or **"Connect GitHub"**.
  2. Redirects to `https://github.com/login/oauth/authorize?scope=repo,read:user`.
  3. User approves; backend exchanges code for an encrypted GitHub Access Token (`gho_...`).
  4. Store the encrypted token in the user's database document.

#### 2. Two Implementation Approaches:

| Approach                                                           | When to Use                                                | How it Works                                                                                                                                                                                                               |
| :----------------------------------------------------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option 1: In-Container Git CLI (Recommended for Scale)**         | When you have a terminal sandbox                           | Inject an ephemeral GitHub Personal Access Token or SSH Deploy Key into the container environment. The user can simply type `git clone`, `git commit -m "..."`, and `git push` right in their terminal!                    |
| **Option 2: UI-Driven Git via `@octokit/rest` & `isomorphic-git`** | When you want visual GitHub buttons (Commit, Push, Branch) | The frontend shows a **Git Drawer** with "Changed Files", a commit message box, and a "Push to Main" button. Backend uses GitHub's Git Data API (trees, blobs, commits, refs) to commit files without touching local disk. |

---

### Subsystem D: Audio & Video Conferencing at Scale (WebRTC Mesh vs SFU)

#### 1. Why Mesh Fails at Scale

- **Current State in Devmeet:** Peer-to-Peer Mesh.
  - 2 people = 2 streams.
  - 4 people = 12 streams ($N \times (N-1)$).
  - 8 people = 56 streams!
  - **Result:** Client laptops freeze, fans roar, and audio chops.
- **The "Camera Off = Audio Cut-Off" Bug:**
  In [WorkspaceVideoSidebar.jsx](file:///c:/Users/siddh/OneDrive/Documents/Desktop/Devmeet2/frontend/src/components/workspace/WorkspaceVideoSidebar.jsx#L344), when a user toggles camera off, the `<video>` element unmounts, **cutting off their audio track**.
  - **The Fix:** Create an independent, persistent `<AudioStreamManager />` that keeps an invisible `<audio autoPlay playsInline />` element for every peer in the call, irrespective of UI layout!

#### 2. The Scalable Solution: Selective Forwarding Unit (SFU)

Instead of every user sending video to every other user, each user uploads **only ONE stream** to a central SFU server. The SFU forwards packets down to everyone else.

```
       PEER-TO-PEER MESH (Devmeet Current)               SELECTIVE FORWARDING UNIT (LiveKit)
         (Fails at >4 participants)                             (Scales to 50+ participants)

              [User A]                                                   [User A]
             ▲   │   ▲                                                      │ ▲
             │   │   │                                                 1 up │ │ 3 down
             │   ▼   │                                                      ▼ │
      [User B] ◄───► [User C]                                         ┌───────────┐
             ▲       ▲                                                │LiveKit SFU│
             │       │                                                └───────────┘
             ▼       ▼                                                      ▲ │
              [User D]                                                 1 up │ │ 3 down
        (12 Streams for 4 users)                                            │ ▼
                                                                         [User B]
```

#### 3. Recommended Library: **LiveKit**

- **Why LiveKit:** It is 100% open-source, written in Go, built on WebRTC, and provides first-class React components (`@livekit/components-react`).
- **Free Tier:** LiveKit Cloud offers 10,000 free minutes per month (perfect for launch). You can also self-host on a $5/mo VPS.
- **What you get out of the box:**
  - Adaptive bitrate and simulcast (switches to 360p if bandwidth drops).
  - Automatic screen sharing with audio.
  - Built-in TURN/STUN (bypasses all enterprise firewalls).
  - Dynamic audio ducking and noise suppression.

---

### Subsystem E: Socket & Room Scaling (Handling 10,000+ Concurrent Users)

#### 1. Single Node vs Clustered Backend

Currently, Socket.io runs in a single Node process:

```javascript
// Current in-memory bottleneck:
const roomDocs = new Map();
const roomWhiteboardHistory = new Map();
```

If you deploy 3 instances of your backend on AWS/Render/DigitalOcean behind a load balancer, User A connects to Instance 1, User B connects to Instance 2, and neither can see the other's room messages.

#### 2. The Scale Architecture Recipe:

1. **Redis Socket.io Adapter (`@socket.io/redis-adapter`):**
   - Whenever Instance 1 emits `io.to("room-123").emit(...)`, Redis broadcasts the event to Instance 2 and Instance 3 via Pub/Sub.
2. **Authoritative Yjs CRDT Room Coordinator:**
   - Store active room documents in a memory cache with an **LRU (Least Recently Used) eviction policy**.
   - When all users disconnect from a room, wait 15 minutes, flush the final Yjs state to MongoDB, and unload the doc from memory via [unloadRoomDoc](file:///c:/Users/siddh/OneDrive/Documents/Desktop/Devmeet2/backend/src/modules/editor/editor.crdt.js) to prevent RAM saturation.
3. **Debounced DB Writes:**
   - Never write to MongoDB on every keystroke.
   - Debounce database persistence by 2 to 3 seconds. The live keystrokes travel between peers via high-speed binary WebSockets; the DB is only a durable snapshot.

---

## 3. High-Yield Engineering Study Guide & Curated Resources

Here is a hand-picked, senior-engineer curated syllabus of articles, videos, books, and open-source repos to master these concepts:

### 1. Collaborative Editing & CRDTs

- **Article / Spec:** [How Yjs Works Internally (Yjs GitHub Wiki)](https://github.com/yjs/yjs) — Explains the Item structure, Lamport clocks, and delete sets.
- **Must-Watch Video:** _"CRDTs: The Hard Parts"_ by Martin Kleppmann (author of _Designing Data-Intensive Applications_) — Available on YouTube. The best 45-minute explanation of distributed state convergence.
- **Interactive Guide:** [crdt.tech](https://crdt.tech/) — Visual simulations of state vectors and merge algorithms.
- **Reference Code:** Look at `y-monaco` and `y-websocket` on GitHub.

### 2. Browser Terminals & Sandboxed Execution

- **xterm.js Guide:** [xterm.js Official Documentation](https://xtermjs.org/) — Terminal APIs, addons, styling, and keyboard input handling.
- **node-pty Repo:** [Microsoft node-pty](https://github.com/microsoft/node-pty) — How VS Code integrates pseudoterminals with Node.js.
- **Execution Engine:** [Piston API Documentation](https://github.com/engineer-man/piston) — Open-source code execution engine in Docker.
- **Deep Read:** _"How CodeSandbox Executes Untrusted Code"_ by Ives van Hoorne (CodeSandbox Engineering Blog).

### 3. WebRTC & Video Conferencing

- **The Bible:** [WebRTC for the Curious](https://webrtcforthecurious.com/) — Free, comprehensive open-source book covering SDP negotiation, ICE candidates, STUN, TURN, and SFU architectures.
- **SFU Library:** [LiveKit Documentation](https://docs.livekit.io/) & [LiveKit React Components](https://github.com/livekit/components-js).
- **Fireship Quick Primer:** _"WebRTC in 100 Seconds"_ + _"Build a Video Chat App with WebRTC"_ (YouTube).

### 4. Distributed Sockets & Scaling

- **Socket.io Guide:** [Socket.io Scale Out Guide with Redis](https://socket.io/docs/v4/using-multiple-nodes/) — Setting up the Redis adapter and sticky sessions.
- **System Design Book:** _Designing Data-Intensive Applications_ by Martin Kleppmann (Chapters 5 & 6: Replication and Partitioning).

---

## 4. Phase-by-Phase Roadmap to Launch

```
Phase 1: Stabilization & Modularity (Week 1–2)
├── Split frontend monolith into 4 clean subsystems: IDE, Conferencing, Whiteboard, Chat
├── Fix the "Camera-off kills audio" WebRTC bug using persistent <AudioStreamManager />
├── Add Coturn/Twilio TURN credentials to eliminate NAT traversal connection failures
└── Secure code runner with Piston API sandbox instead of raw host execFile

Phase 2: IDE & Cloud Terminal Polish (Week 3–4)
├── Integrate xterm.js + node-pty into a collapsible bottom terminal drawer
├── Multi-file tab switching with independent local views and peer presence flags
└── GitHub OAuth Connect & Repo Import flow

Phase 3: Video Calling Scale (Week 5–6)
├── Replace P2P WebRTC mesh with LiveKit SFU (1 upload stream, scalable to 50+ users)
├── Screen sharing with system audio & dynamic speaker highlighting
└── Picture-in-Picture floating video dock

Phase 4: Backend Distribution & Launch Prep (Week 7–8)
├── Connect Redis Adapter (@socket.io/redis-adapter) for multi-server horizontal scaling
├── LRU cache & debounced MongoDB persistence for idle room cleanup
├── Comprehensive E2E testing (Playwright for collaborative rooms)
└── Production Deployment (Docker + AWS ECS/Railway + MongoDB Atlas + Redis Cloud)
```
