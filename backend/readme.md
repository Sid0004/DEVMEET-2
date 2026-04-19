# Backend Feature Implementation Plan

You are absolutely right. Since the core of "Devmeet2" is its meeting functionality, we need a robust real-time backend before fully moving to UI integration. Here is the updated plan focusing exclusively on building out the backend architecture.

## User Review Required

> [!IMPORTANT]  
> Please review these backend steps. Let me know if you also want to include **recording models** (like the `video.model.js` we briefly looked at earlier), text chat during meetings, or any specific settings for the rooms (like passwords, waiting rooms, etc.).

## Proposed Changes

### 1. WebSockets & Real-Time Communication
We need to introduce WebSockets to handle real-time signaling for video calls.
- **Dependency:** Install `socket.io`.
- **Setup:** Refactor `backend/index.js` and `backend/app.js` to attach a `socket.io` server to the Express HTTP Server.
- **WebRTC Signaling:** Set up namespace and event handlers for passing WebRTC signals (`join-room`, `offer`, `answer`, `ice-candidate`, `user-disconnected`).

### 2. Room Data Modeling & Business Logic

#### [MODIFY] `backend/src/models/room.model.js`
- Define the Mongoose schema for a room, mapping attributes like:
  - `roomId` (unique identifier)
  - `host` (Ref: User, who created the meeting)
  - `participants` (Array of Refs to Users)
  - `status` (active, ended, scheduled)
  - `roomSettings` (microphone/camera locks, waiting room flags)

#### [NEW] `backend/src/controllers/room.controller.js`
Create these four controller functions. Make sure to wrap them in `asyncHandler`.
- **`createRoom(req, res)`:**
  - Generate a unique 8-10 character `roomId`.
  - Create a new room in MongoDB mapping the logged-in user (`req.user._id`) as the `host`.
  - Add the `host` to the `participants` array. 
  - Send response with the created room details (status 201).
- **`joinRoom(req, res)`:**
  - Expect `roomId` in `req.params`. Validate if the room exists and `status !== 'ended'`.
  - Check if the room `status !== 'ended'`, if so throw a 403 API Error.
  - If the user isn't in the `participants` array, push `req.user._id` to it and `save()`.
  - Send response to grant access (status 200).
- **`leaveRoom(req, res)`:**
  - Expect `roomId` in `req.params`. Find the room.
  - Filter out `req.user._id` from the room's `participants` array and `save()`.
  - Send response confirming the user left (status 200).
- **`endRoom(req, res)`:**
  - Expect `roomId` in `req.params`. Find the room.
  - Ensure `req.user._id.toString() === room.host.toString()` (only hosts can end the room).
  - Change room `status` to `'ended'` and `save()`.
  - Send response (status 200).

#### [NEW] `backend/src/routes/room.routes.js`
Hook up your controllers to the following routes, and protect them all using the `verifyJWT` middleware.
- `POST /api/v1/rooms/create` -> calls `createRoom`
- `POST /api/v1/rooms/:roomId/join` -> calls `joinRoom`
- `POST /api/v1/rooms/:roomId/leave` -> calls `leaveRoom`
- `POST /api/v1/rooms/:roomId/end` -> calls `endRoom`

### 3. (Optional / Future) Video Settings
- If we need to track recordings of meetings, we can finalize the `video.model.js` and connect it with Cloudinary for temporary/permanent hosting.

## Open Questions

> [!WARNING]  
> **Question 1:** For room connectivity, should anyone with the link be able to join, or do they *must* be registered and logged-in users?
> **Question 2:** Do you want me to set up a standard chat infrastructure (using WebSockets) for the meeting rooms as well?

## Verification Plan

### Automated/Manual Verification
- Install `socket.io` and start the backend using `npm run dev`.
- Ensure Express API server and Socket.io endpoints are accessible and returning 200 without DB connection errors.
- Test endpoint functionality with mock JSON requests (via Postman or a quick Next.js frontend fetch) to verify Room creation / joining logic.
