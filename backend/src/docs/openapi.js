export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "DEVMEET-2 Core API Engine",
    version: "2.0.0",
    description: `
# 🚀 DEVMEET Real-Time Developer Collaboration Engine

Welcome to the **DEVMEET API Documentation**. This platform powers real-time technical hiring, pair programming workspaces, and developer conferencing.

### ✨ Highlights
- **Multi-tenant Auth**: Email OTP, Google OAuth2, GitHub OAuth, and Ephemeral Guest Access.
- **Collaborative Workspaces**: Real-time Monaco IDE with Yjs CRDTs, multi-file management, and sandboxed code execution.
- **Media & Communication**: WebRTC Audio/Video conferencing with device negotiation and persistent audio sinks.
- **Visual Whiteboard**: Real-time vector drawing canvas with stroke undo/redo and history sync.
    `,
    contact: {
      name: "DevMeet Core Engineering Team",
      url: "https://github.com/Sid0004/DEVMEET-2",
    },
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Local Development Server",
    },
  ],
  tags: [
    {
      name: "Authentication & Users",
      description: "User registration, email OTP verification, OAuth login, and profile management",
    },
    {
      name: "Rooms & Workspace",
      description: "Collaborative room lifecycle, guest access tokens, settings, and code execution",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Standard JWT Access Token issued upon login or guest join",
      },
      CookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description: "HttpOnly accessToken cookie automatically managed by the browser",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          data: { type: "object" },
          message: { type: "string", example: "Success" },
          success: { type: "boolean", example: true },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 400 },
          message: { type: "string", example: "Invalid request payload" },
          success: { type: "boolean", example: false },
          errors: { type: "array", items: { type: "string" } },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "66f4b1c2e4b0a1a2b3c4d5e6" },
          username: { type: "string", example: "alex_coder" },
          email: { type: "string", format: "email", example: "alex@example.com" },
          fullName: { type: "string", example: "Alex Mercer" },
          avatar: { type: "string", format: "uri", example: "https://api.dicebear.com/7.x/dylan/svg?seed=alex" },
          role: { type: "string", enum: ["user", "admin", "guest"], example: "user" },
          profession: { type: "string", example: "Software Engineer" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Room: {
        type: "object",
        properties: {
          _id: { type: "string", example: "66f4b2a3e4b0a1a2b3c4d5e7" },
          roomId: { type: "string", example: "devmeet-code-room-88" },
          roomName: { type: "string", example: "Frontend Systems Architecture Interview" },
          status: { type: "string", enum: ["active", "ended", "scheduled"], example: "active" },
          roomType: { type: "string", enum: ["public", "private", "interview", "team"], example: "interview" },
          host: { $ref: "#/components/schemas/User" },
          participants: {
            type: "array",
            items: { $ref: "#/components/schemas/User" },
          },
          files: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", example: "main.ts" },
                content: { type: "string", example: "console.log('Hello DevMeet');" },
                language: { type: "string", example: "typescript" },
              },
            },
          },
          roomSettings: {
            type: "object",
            properties: {
              isLocked: { type: "boolean", example: false },
              allowMic: { type: "boolean", example: true },
              allowCamera: { type: "boolean", example: true },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/v1/users/send-otp": {
      post: {
        tags: ["Authentication & Users"],
        summary: "Send Email Verification OTP",
        description: "Dispatches a 6-digit numeric verification code to the target email before user registration.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email", example: "developer@example.com" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "OTP sent successfully to inbox",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
          400: {
            description: "Invalid email or rate limit exceeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/register": {
      post: {
        tags: ["Authentication & Users"],
        summary: "Register New User Account",
        description: "Creates an account by validating username uniqueness, strong password hash, and the submitted email OTP.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "username", "fullName", "password", "otp"],
                properties: {
                  email: { type: "string", format: "email", example: "developer@example.com" },
                  username: { type: "string", example: "codeninja" },
                  fullName: { type: "string", example: "Alex Chen" },
                  password: { type: "string", format: "password", example: "SecurePass123!" },
                  otp: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
          400: {
            description: "Invalid OTP or missing fields",
          },
          409: {
            description: "User with this email or username already exists",
          },
        },
      },
    },
    "/api/v1/users/login": {
      post: {
        tags: ["Authentication & Users"],
        summary: "Login with Credentials",
        description: "Authenticates via email/username and password. Sets HTTP-only cookies and returns JWT tokens.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["password"],
                properties: {
                  email: { type: "string", format: "email", example: "developer@example.com" },
                  username: { type: "string", example: "codeninja" },
                  password: { type: "string", format: "password", example: "SecurePass123!" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Logged in successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
          },
        },
      },
    },
    "/api/v1/users/google-login": {
      post: {
        tags: ["Authentication & Users"],
        summary: "Google OAuth2 / One-Tap Authentication",
        description: "Verifies Google credential/token and logs in or provisions a new developer account.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token"],
                properties: {
                  token: { type: "string", example: "eyJhbGciOiJSUzI1NiIsImtpZCI6..." },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Google authentication successful" },
        },
      },
    },
    "/api/v1/users/github-login": {
      post: {
        tags: ["Authentication & Users"],
        summary: "GitHub OAuth Code Exchange",
        description: "Exchanges temporary GitHub authorization code for access token and authenticates user.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code"],
                properties: {
                  code: { type: "string", example: "39201f8d48a104bc" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "GitHub authentication successful" },
        },
      },
    },
    "/api/v1/users/current-user": {
      get: {
        tags: ["Authentication & Users"],
        summary: "Get Current Authenticated User",
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: {
          200: {
            description: "User profile data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/users/logout": {
      post: {
        tags: ["Authentication & Users"],
        summary: "Logout & Clear Session Cookies",
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: {
          200: { description: "Successfully logged out" },
        },
      },
    },
    "/api/v1/rooms/{roomId}/public-info": {
      get: {
        tags: ["Rooms & Workspace"],
        summary: "Get Public Room Preview",
        description: "Public endpoint for unauthenticated invitees to inspect room name, host details, and lock/ended status before joining.",
        parameters: [
          {
            name: "roomId",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "devmeet_room_123",
          },
        ],
        responses: {
          200: {
            description: "Public room preview details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    statusCode: { type: "integer", example: 200 },
                    data: {
                      type: "object",
                      properties: {
                        roomId: { type: "string", example: "devmeet_room_123" },
                        roomName: { type: "string", example: "Full Stack Live Coding" },
                        status: { type: "string", example: "active" },
                        isLocked: { type: "boolean", example: false },
                        host: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            username: { type: "string", example: "sarah_host" },
                            fullName: { type: "string", example: "Sarah Connor" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: "Room not found or expired" },
        },
      },
    },
    "/api/v1/rooms/{roomId}/guest-join": {
      post: {
        tags: ["Rooms & Workspace"],
        summary: "Join Workspace as a Guest",
        description: "Issues an ephemeral JWT access token bound specifically to this room for zero-friction candidate or guest access.",
        parameters: [
          {
            name: "roomId",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "devmeet_room_123",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Jordan Guest" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Ephemeral guest credentials issued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    statusCode: { type: "integer", example: 200 },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string" },
                        user: { $ref: "#/components/schemas/User" },
                        room: { $ref: "#/components/schemas/Room" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Name is required" },
          403: { description: "Room locked or session ended" },
          404: { description: "Room does not exist" },
        },
      },
    },
    "/api/v1/rooms/create": {
      post: {
        tags: ["Rooms & Workspace"],
        summary: "Create a New Workspace",
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["roomName"],
                properties: {
                  roomName: { type: "string", example: "Systems Engineering Room" },
                  description: { type: "string", example: "Technical interview on distributed caches" },
                  roomType: { type: "string", enum: ["public", "private", "interview", "team"], example: "interview" },
                  primaryLanguage: { type: "string", example: "TypeScript" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Room created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/rooms/{roomId}": {
      get: {
        tags: ["Rooms & Workspace"],
        summary: "Get Room Details & Code Files",
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        parameters: [
          {
            name: "roomId",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "devmeet_room_123",
          },
        ],
        responses: {
          200: {
            description: "Room details with files, host, and settings",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
          404: { description: "Room does not exist" },
        },
      },
    },
    "/api/v1/rooms/{roomId}/end": {
      post: {
        tags: ["Rooms & Workspace"],
        summary: "Host Ends Session",
        description: "Marks room status as ended, purges ephemeral messages, and broadcasts session conclusion to peers.",
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        parameters: [
          {
            name: "roomId",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "devmeet_room_123",
          },
        ],
        responses: {
          200: { description: "Session ended successfully" },
          403: { description: "Only the room host can end the session" },
        },
      },
    },
    "/api/v1/rooms/run": {
      post: {
        tags: ["Rooms & Workspace"],
        summary: "Run Code in Remote Sandbox",
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "language"],
                properties: {
                  code: { type: "string", example: "console.log(1 + 2);" },
                  language: { type: "string", example: "typescript" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Execution output from runner",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    statusCode: { type: "integer", example: 200 },
                    data: {
                      type: "object",
                      properties: {
                        output: { type: "string", example: "3\n" },
                        executionTime: { type: "string", example: "45ms" },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { description: "Code execution is disabled on this server" },
        },
      },
    },
  },
};
