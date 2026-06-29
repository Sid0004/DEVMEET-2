# Product Requirements Document (PRD) - Deep Dive

## 1. Product Vision & Value Proposition
To build a state-of-the-art, web-based collaborative IDE that seamlessly blends real-time pair programming, technical interviewing, and advanced AI assistance. 
**Core Value Proposition:** Replacing brittle single-file interview platforms (like standard HackerRank/CoderPad) with a true "Whole Project" environment, evaluating how developers interact with real-world architectures, while augmenting the experience with AI.

## 2. Deep User Personas

### 2.1. The Engineering Hiring Manager (Sarah)
- **Goal:** Assess candidate's ability to navigate a real Next.js or Node/Express codebase, rather than just solving leetcode algorithms.
- **Pain Points:** Current tools only allow single-file execution. Unable to test candidates on routing, component state, or database connections.
- **Desired Features:** Multi-file support, Dockerized sandboxes, AI assessment summaries, hidden test suites.

### 2.2. The Senior Developer / Mentor (David)
- **Goal:** Pair program with junior developers remotely to debug complex issues.
- **Pain Points:** Zoom screen sharing is laggy and non-interactive. VS Code Live Share requires complicated setups and matching extensions.
- **Desired Features:** Frictionless URL-based joining, zero-setup environments, integrated WebRTC audio/video, CRDT-based real-time typing.

### 2.3. The Candidate (Alex)
- **Goal:** Perform well in an interview without fighting the editor.
- **Pain Points:** Interview environments lack autocomplete, terminal access, and feel restrictive. 
- **Desired Features:** Familiar Monaco Editor experience, access to a real bash terminal, AI hints (if allowed by interviewer).

## 3. Core Capabilities & Detailed Scope

### 3.1. "Whole Project" Code Editor Extent
- **File System:** Support for complete directory structures. Users can create, rename, drag-and-drop, and delete folders/files.
- **Execution:** Spin up frameworks like React, Vue, Express, or Django. A live preview pane renders the output of `localhost:3000` securely proxied over the web.

### 3.2. Advanced AI Integration (RAG-Backed)
- **AI Co-Pilot:** Inline ghost-text completion.
- **Contextual Understanding:** The AI parses the *entire* workspace using Tree-Sitter and Vector Embeddings, so asking "How does the auth component work?" retrieves context from multiple files.
- **AI Interviewer/Assessor:** After an interview, the AI generates a detailed scorecard:
  - Code Complexity (Big O analysis).
  - Code Cleanliness (Linter checks).
  - Problem Solving Speed (Time to first execution).

### 3.3. Collaboration & SFU Video
- **Multiplayer:** 10+ concurrent users typing simultaneously without conflict, backed by Yjs.
- **Video:** LiveKit-powered SFU ensuring HD video/audio without consuming heavy client CPU, rendering directly in the IDE UI.

## 4. Success Metrics & KPIs
- **Technical KPIs:**
  - P99 Latency of CRDT text sync < 50ms.
  - Docker sandbox cold start time < 3.5 seconds.
  - Video stream jitter < 30ms.
- **Product KPIs:**
  - Session completion rate (Interviews that end without technical disconnects) > 99%.
  - AI Assistant Acceptance Rate > 40%.
