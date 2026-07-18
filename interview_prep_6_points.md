# Interview Cheat Sheet: Resume Deep Dive

This document breaks down the 6 key bullet points from your resume. Use these explanations to confidently discuss the **What**, **Why**, and **How** of your technical decisions.

## 1. Aventiq: Software Engineer Intern

### Point 1: Management Portal & 300+ Calls
> *"Developed a comprehensive management portal for a voice agent platform, allowing users to configure and deploy customized AI assistants, successfully supporting up to 300+ simultaneous outbound calls."*

- **What it is:** A full-stack dashboard where customers can log in, write the prompt for their AI, configure voice settings, and launch mass call campaigns.
- **The Technical "How":** Handling 300+ simultaneous calls means the server is under heavy concurrent load. You achieved this using **asynchronous processing** and **message queues** (like Redis). Instead of the main thread trying to process 300 calls at once (which would block the event loop and crash), the system pushes call jobs to a queue, where background worker processes handle them concurrently.
- **What to say in an interview:** *"To support 300+ concurrent calls, I had to ensure our Node.js server wasn't blocked. I utilized a queue-based architecture where the main server offloads the heavy telephony and AI processing tasks to background workers."*

### Point 2: Multi-tenant Architecture & WebSockets
> *"Architected a multi-tenant infrastructure leveraging WebSockets and STT/TTS models for real-time conversational processing, supporting dynamic integration with 5+ external APIs."*

- **Multi-tenant Infrastructure:** Designed the database and backend so that multiple different companies use the exact same application, but their data (prompts, logs, API keys) is strictly isolated using tenant IDs.
- **WebSockets:** Unlike HTTP which is request/response, WebSockets keep a persistent, open, two-way connection. This is **mandatory** for streaming continuous live audio between the server and the phone provider (like Twilio).
- **STT (Speech-To-Text) & TTS (Text-To-Speech):** The pipeline: User speaks -> STT converts audio to text -> LLM generates text response -> TTS converts text back to audio -> sent over WebSocket.
- **What to say in an interview:** *"I built a multi-tenant system to isolate client data. For the real-time audio, I used WebSockets because standard HTTP is too slow for continuous streaming. The audio streams through STT to get text, hits the LLM, and goes back through TTS."*

### Point 3: Caching & Asynchronous Webhooks
> *"Optimized backend performance via caching and asynchronous webhooks, reducing AI response latency by 30% during concurrent voice interactions."*

- **Caching:** Instead of querying the database for the AI's system prompt every time a user speaks, you store that prompt in fast memory (like Redis). This skips the DB lookup entirely, instantly dropping latency.
- **Asynchronous Webhooks:** During a call, the AI might need to book a calendar slot via an external API. If you wait for that slow API to respond, the call has an awkward silence. Webhooks allow you to fire the request and say, *"Ping my server when you're done,"* letting your server continue handling the voice audio in the meantime.
- **What to say in an interview:** *"In voice AI, even a 500ms delay feels unnatural. By caching the AI context in memory and using webhooks for slow external APIs, we stopped the server from blocking. This shaved off that critical half-second of silence before the AI replied, reducing latency by 30%."*

---

## 2. Secure Virtual File System

### Point 4: C++, Qt, and SQLite
> *"Engineered a secure C++ file manager using the Qt framework and an SQLite database for local storage."*

- **Qt Framework (pronounced "Cute"):** A massive, industry-standard C++ framework used to build cross-platform Graphical User Interfaces (GUIs) for desktop applications.
- **SQLite Database:** A lightweight, serverless database that lives directly in a local file on the user's computer. 
- **The Technical "Why":** Scanning a hard drive for files is slow. By reading files once and saving their metadata (names, paths, sizes) into a local SQLite database, searching the file system becomes a blazing-fast SQL query (e.g., `SELECT * FROM files WHERE name = ...`).

### Point 5: zlib Compression
> *"Incorporated zlib compression, reducing the database storage footprint for text and log files by 30%."*

- **zlib:** A standard, highly optimized C/C++ library used for data compression (it powers formats like `.zip` and `.gz`).
- **The Technical "How":** Text and log files contain a lot of repeated characters and whitespace. Before saving them into the virtual system, you stream the raw bytes through zlib to compress them, significantly reducing the amount of disk space the application uses.
- **What to say in an interview:** *"Since text and log files are highly compressible, I integrated the zlib library into our C++ pipeline. By compressing the raw byte streams before writing to disk, I reduced the storage footprint by about 30%."*

### Point 6: Background Threads & UI Freezing
> *"Leveraged a background thread to prevent UI freezing when importing 100+ files."*

- **The Problem:** Desktop GUI applications have a single "Main Thread". If you execute a heavy task (like reading 100 large files) on this main thread, the app locks up, and the user sees a frozen screen (the "spinning wheel of death").
- **The Solution (Multithreading):** You spawned a separate **Background Worker Thread** (using `std::thread` in C++). 
- **What to say in an interview:** *"I encountered an issue where importing large batches of files caused the Qt UI to freeze. To fix this, I offloaded the file parsing logic to a background thread. This allowed the heavy disk I/O to happen concurrently, keeping the Main UI thread completely free and responsive to user input."*
