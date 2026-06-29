# UI/UX Design Brief & Design System

## 1. Global Theme & Color Tokens (Dark Mode Default)
The UI takes inspiration from modern developer tools (Vscode, Linear, Vercel). It relies on subtle gradients, glassmorphism, and high-contrast text for legibility.

### 1.1. Color Palette (Hex Codes)
- **Backgrounds (Surfaces):**
  - App Background (Level 0): `#0D1117` (Deep almost black)
  - Sidebar/Panels (Level 1): `#161B22` (Slightly lighter)
  - Floating Elements/Modals (Level 2): `#21262D`
- **Borders & Dividers:**
  - Standard Border: `#30363D`
  - Active/Focus Border: `#58A6FF`
- **Typography:**
  - Primary Text: `#C9D1D9`
  - Secondary Text (Muted): `#8B949E`
- **Brand & Accents:**
  - Primary Brand (Blue): `#58A6FF`
  - Hover State (Blue): `#3182CE`
- **Semantic/Feedback Colors:**
  - Success (Green): `#238636`
  - Warning (Yellow): `#D29922`
  - Error (Red): `#F85149`
- **Collaborative Cursor Colors:**
  - User 1: `#FF7B72` (Coral)
  - User 2: `#79C0FF` (Light Blue)
  - User 3: `#D2A8FF` (Lavender)
  - User 4: `#56D364` (Mint)

### 1.2. Typography Scale
- **Font Families:**
  - UI Text: `Inter`, `Geist`, or system sans-serif.
  - Code/Monospace: `JetBrains Mono`, `Fira Code`.
- **Scale (Tailwind Equivalents):**
  - `text-xs`: 12px / 16px line-height (File tree, tooltips)
  - `text-sm`: 14px / 20px line-height (Standard UI text, sidebar items)
  - `text-base`: 16px / 24px line-height (Editor font size, chat messages)
  - `text-lg`: 18px / 28px line-height (Panel headers)
  - `text-2xl`: 24px / 32px line-height (Page titles, empty states)

## 2. Spacing & Grid System
Based on a 4px/8px baseline grid.
- `space-1`: 4px
- `space-2`: 8px
- `space-4`: 16px (Standard padding inside panels)
- `space-6`: 24px
- **Layout Dimensions:**
  - Left Activity Bar (Icons): 48px width
  - Left Sidebar (File Explorer): 240px - 300px (Resizable)
  - Bottom Panel (Terminal): 250px height (Resizable)
  - Right Sidebar (Video/SFU Feeds): 280px width

## 3. Page & Component Breakdown

### 3.1. Dashboard Page
- **Header:** Logo, Search bar, Profile Dropdown.
- **Hero Section:** "Create New Workspace" large primary button.
- **Recent Workspaces Grid:** Cards showing project name, last edited time, and avatars of collaborators.
- **Interview Templates:** Quick-start buttons (e.g., "React Assessment", "Python Data Structures").

### 3.2. The Workspace (IDE Interface)
- **Top Navigation:** 
  - Left: Project Name (editable), Save State indicator.
  - Center: Tabbed files (like VS Code).
  - Right: "Share" button, Live Video avatars (WebRTC), "End Session" button.
- **Left Panel (File Explorer):** 
  - Nested tree view. 
  - Hover actions: Add File, Add Folder, Delete.
- **Main Area (Monaco Editor):**
  - Line numbers, minimap, syntax highlighting mapping to the color tokens above.
  - Cursors have a tooltip showing the user's name.
- **Right Panel (AI & Video):**
  - Top half: Video grid (LiveKit feeds). When speaking, avatar gets a glowing `#58A6FF` border.
  - Bottom half: AI Chat. Bubbles for user prompts, markdown-rendered blocks for AI responses with "Copy" and "Insert at Cursor" buttons.

### 3.3. Modals & Dialogs
- **Invite Modal:** Input field for email/username, role selector (Editor vs Viewer), and a "Copy Link" button.
- **Interview Settings:** Toggles for "Allow Internet", "Hide Test Cases", "Enable AI Assistant". Uses standard iOS-style toggle switches (`#238636` when active).

## 4. Micro-Interactions & Animations
- **Panel Resizing:** Immediate, no lag. A blue highlight line appears on the resizer drag handle.
- **AI Generating State:** A shimmering skeleton loader or a pulsing brand-color dot indicates the LLM is typing.
- **Real-time Sync Indicator:** A subtle pulse animation on the file name tab when another user is actively modifying a file that you do not have open.
