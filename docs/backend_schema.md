# Backend Schema & API Design

## 1. Database Schema (PostgreSQL)
We will use an ORM like Prisma or Drizzle to manage these schemas.

### Table: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email |
| `name` | VARCHAR(255) | NOT NULL | Display name |
| `password_hash`| VARCHAR(255) | NULL | Null if OAuth used |
| `avatar_url` | TEXT | NULL | Profile image URL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

### Table: `workspaces`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Project name |
| `owner_id` | UUID | FOREIGN KEY(users.id) | Creator of workspace |
| `type` | ENUM | NOT NULL | 'interview', 'collaborative' |
| `docker_container_id`| VARCHAR(64) | NULL | ID of active sandbox |
| `is_active` | BOOLEAN | DEFAULT TRUE | |

### Table: `workspace_files`
*(Note: Used for persistent storage when session is asleep. When active, Yjs/Redis holds state).*
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | |
| `workspace_id` | UUID | FOREIGN KEY(workspaces.id)| CASCADE delete |
| `file_path` | TEXT | NOT NULL | e.g. `/src/index.js` |
| `content` | TEXT | NOT NULL | File content |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | |

### Table: `interviews`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | |
| `workspace_id` | UUID | FOREIGN KEY(workspaces.id)| Unique link to workspace |
| `interviewer_id` | UUID | FOREIGN KEY(users.id) | |
| `candidate_id` | UUID | FOREIGN KEY(users.id), NULL| Can be null if anonymous |
| `status` | ENUM | NOT NULL | 'scheduled', 'ongoing', 'completed' |
| `score` | INT | NULL | 1-100 score |
| `feedback` | TEXT | NULL | Review notes |

## 2. API Routes (RESTful)

### Auth & Users
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Authenticate, return JWT
- `GET /api/v1/users/me` - Get current user profile

### Workspaces
- `POST /api/v1/workspaces` - Create new workspace (provisions Docker container asynchronously).
  - *Payload:* `{ "name": "React Test", "template": "nextjs" }`
- `GET /api/v1/workspaces` - List user's workspaces.
- `GET /api/v1/workspaces/:id` - Get workspace details and connection tokens.
- `POST /api/v1/workspaces/:id/invite` - Generate a shareable join link.

### Execution Engine (Proxy via Gateway)
- `POST /api/v1/workspaces/:id/execute` - Send a one-off command (if not using WebSocket).
- `POST /api/v1/workspaces/:id/restart` - Force reboot the Docker container.

### WebRTC / SFU (LiveKit Integration)
- `POST /api/v1/rtc/token` - Request a LiveKit connection token.
  - *Payload:* `{ "workspace_id": "uuid", "user_name": "John" }`
  - *Response:* `{ "token": "eyJh... (JWT valid for LiveKit Server)" }`

### AI Assistant
- `POST /api/v1/ai/chat` - Send prompt to LLM.
  - *Payload:* `{ "workspace_id": "uuid", "prompt": "Fix this function", "file_context": "..." }`
  - *Response:* Streamed via SSE (Server Sent Events).
