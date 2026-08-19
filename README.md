![alt text](image.png)

# Devmeet

Devmeet is a real-time collaborative workspace and meeting platform designed for software engineers and distributed technical teams. The platform combines WebRTC-based video/audio communication, conflict-free collaborative code editing powered by CRDTs, organization-level tenancy, and multi-provider authentication within a unified architecture.

---

## Architectural Overview

Devmeet operates as a decoupled client-server system with distinct channels for transactional HTTP APIs, bidirectional WebSocket state management, and peer-to-peer media transport.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Next.js Frontend                              │
│  ┌───────────────────────┬────────────────────┬──────────────────────┐ │
│  │   Monaco Editor +     │   WebRTC Video /   │  Redux Toolkit State │ │
│  │      Yjs CRDT         │   Audio Streams    │      Management      │ │
│  └───────────┬───────────┴──────────┬─────────┴──────────┬───────────┘ │
└──────────────┼──────────────────────┼────────────────────┼─────────────┘
               │ (CRDT Sync)          │ (Media Streams)    │ (REST / Auth)
               │                      │                    │
               │               ┌──────▼──────┐             │
               │               │ WebRTC Mesh │             │
               │               └─────────────┘             │
               │ (Signaling)                               │
        ┌──────▼───────────────────────────────────────────▼──────┐
        │                 Express.js Backend                      │
        │  ┌─────────────────────────────┬─────────────────────┐  │
        │  │    Socket.IO Signaling      │   REST API Routes   │  │
        │  │     & Room Coordinator      │   & Auth Middleware │  │
        │  └──────────────┬──────────────┴──────────┬──────────┘  │
        └─────────────────┼─────────────────────────┼─────────────┘
                          │                         │
                          └────────────┬────────────┘
                                       │
                                ┌──────▼──────┐
                                │   MongoDB   │
                                └─────────────┘
```

---

## Core Subsystems

### 1. Collaborative Code Workspace

- **Editor Engine**: Powered by Microsoft's Monaco Editor (`@monaco-editor/react`), providing syntax highlighting, IntelliSense, and multi-language support.
- **Concurrency Model**: Utilizes Conflict-free Replicated Data Types (CRDTs) via **Yjs** (`yjs`, `y-monaco`, `y-webrtc`). Multiple participants edit code simultaneously without central locking or merge conflicts.
- **Presence & Awareness**: Real-time cursor tracking, selection synchronization, and contributor labels rendered inline within the editor canvas.
- **Execution Layer**: Configurable remote code execution engine for live testing directly within collaborative sessions.

### 2. Media Transport & Real-Time Signaling

- **Video / Audio Architecture**: Peer-to-peer WebRTC mesh network providing low-latency audio/video streams between room participants.
- **Signaling Infrastructure**: Socket.IO server handling room lifecycle events, SDP offer/answer exchanges, and ICE candidate negotiation.
- **State Management**: Dynamic room participant tracking, mute/camera state synchronization, and connection state recovery.

### 3. Identity, Authentication & Security

- **Token Architecture**:
  - Short-lived JWT Access Tokens (`1d`) signed with HMAC-SHA256 for stateless API authorization.
  - Long-lived JWT Refresh Tokens (`10d`) persisted in MongoDB with `$unset` token invalidation on logout.
  - Secure transport via HTTP-only, `SameSite` protected cookies and Authorization headers.
- **Supported Authentication Providers**:
  - **Local Credentials**: Strong password complexity validation with salted `bcrypt` hashing (cost factor 10).
  - **Google OAuth2**: Token verification using Google's official `google-auth-library` with automatic user provisioning.
  - **GitHub OAuth**: Server-to-server OAuth token exchange and profile resolution via GitHub REST API.
- **Role-Based Access**: Middleware-level JWT verification (`verifyJWT`) protecting workspace, room, and organization endpoints.

### 4. Tenancy & Organization Management

- **Multi-Tenancy**: Support for individual developer accounts and organization-level workspaces.
- **Slug Management**: Automatic slug generation with collision-handling algorithms for team routing.
- **Role Hierarchies**: Admin, Moderator, and Member permission tiers for resource isolation.

---

## Project Structure

```
Devmeet2/
├── backend/                        # Express.js REST API & WebSocket Server
│   ├── src/
│   │   ├── config/                 # CORS and runtime configuration
│   │   ├── db/                     # MongoDB connection lifecycle management
│   │   ├── middlewares/            # JWT verification, CORS, error handling
│   │   ├── modules/
│   │   │   ├── chat/               # Room messaging and persistence
│   │   │   ├── editor/             # Collaborative editor session handlers
│   │   │   ├── organization/       # Organization schemas and controllers
│   │   │   ├── room/               # Room lifecycle and WebRTC signaling
│   │   │   └── user/               # Auth, profile, OAuth providers, test suites
│   │   ├── socket/                 # Socket.IO event router and signaling
│   │   └── utils/                  # ApiError, ApiResponse, asyncHandler, cookie helpers
│   ├── jest.config.js              # Native ES Module test configuration
│   ├── jest.setup.js               # Test environment bootstrapping
│   └── package.json
│
├── frontend/                       # Next.js (App Router) Client Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/             # Login, signup, and OAuth callback routes
│   │   │   ├── dashboard/          # Meeting hub, history, and settings
│   │   │   ├── onboarding/         # Role and organization setup
│   │   │   └── workspace/          # Integrated room, editor, and media canvas
│   │   ├── components/             # Reusable UI primitives, forms, and layout shells
│   │   ├── hooks/                  # Custom React hooks (WebRTC, socket, media)
│   │   ├── lib/                    # API client, utility functions
│   │   └── redux/                  # Redux Toolkit store, authSlice, roomSlice
│   ├── next.config.mjs
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── test.yml                # CI pipeline with containerized MongoDB
└── README.md
```

---

## Testing & Quality Assurance

The backend includes a comprehensive, multi-layer automated test suite using Jest and Supertest.

- **API & Controller Validation Tests** (`user.api.test.js`):
  - Strict validation checking (regex email verification, username character rules, password complexity enforcement).
  - Error boundary handling (400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict).
  - Authentication flows (Registration, Local Login, Google Login, GitHub Login, Token Refresh, Logout).
- **End-to-End Database Integration Tests** (`user.e2e.test.js`):
  - Executes transactions against an isolated test database (`devmeet_test_automation`).
  - Verifies physical `bcrypt` hash storage, unique constraint enforcement, and database token revocation.
  - Automated cleanup hooks ensuring zero test data leakage.
- **Continuous Integration**:
  - GitHub Actions workflow executes tests on every push and pull request against containerized `mongo:6.0` service instances.

---

## Technical Stack

| Layer                 | Technologies                                                    |
| --------------------- | --------------------------------------------------------------- |
| **Frontend**          | Next.js 16, React 19, Redux Toolkit, Tailwind CSS, Lucide Icons |
| **Editor & CRDT**     | Monaco Editor, Yjs, y-webrtc, y-monaco                          |
| **Real-Time & Media** | WebRTC, Socket.IO Client, Socket.IO Server                      |
| **Backend**           | Node.js (ES Modules), Express.js 5, Mongoose 9, Winston, Morgan |
| **Security & Auth**   | JSON Web Tokens, bcryptjs, google-auth-library, GitHub OAuth    |
| **Database**          | MongoDB (Atlas / Containerized Mongo for CI)                    |
| **Testing & CI**      | Jest 30, Supertest, GitHub Actions                              |
