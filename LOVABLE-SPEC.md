# AI Executive Coach — Lovable Build Spec

## What This App Is

An AI-powered executive coaching platform with two interfaces:

1. **Coach Dashboard** — where the coach manages clients, reviews AI conversations, monitors alerts, and uploads coaching frameworks
2. **Client Chat** — where coaching clients have text-based conversations with an AI that embodies the coach's methodology and knows their full context

The coach is the admin. Clients are end users. The AI coach is the product.

---

## Tech Stack (Lovable defaults)

- React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Supabase for auth, database, and storage
- Use Supabase Row Level Security (RLS) for data isolation between clients

---

## Authentication & Roles

Use **Supabase Auth** with email/password sign-up.

Two roles stored in a `profiles` table:
- `coach` — full access to all data and the dashboard
- `client` — access only to their own profile and chat

After sign-up, default role is `client`. The coach account is seeded or manually set via Supabase.

Protect routes:
- `/dashboard/*` — coach only
- `/chat` — client only
- `/profile` — client only (read-only view of their own data)
- `/sign-in`, `/sign-up` — public

---

## Database Schema (Supabase / PostgreSQL)

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK, references auth.users) | |
| email | text | |
| name | text | |
| role | text | `'coach'` or `'client'` |
| created_at | timestamptz | |

### `client_profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles.id, unique) | |
| title | text | Job title, e.g. "VP Engineering" |
| organization | text | |
| reporting_to | text | Who they report to |
| direct_reports | integer | Number of direct reports |
| org_context | text | Free-text organizational dynamics |
| coaching_mode | text | `'companion'` or `'standalone'`, default `'companion'` |
| assessments | jsonb | Flexible: `{ disc: {...}, eq_i: {...}, "360": {...} }` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `goals`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| client_profile_id | uuid (FK → client_profiles.id) | |
| title | text | e.g. "Improve delegation" |
| description | text | |
| status | text | `'active'`, `'completed'`, `'paused'` |
| target_date | date | nullable |
| created_at | timestamptz | |

### `coach_notes`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| client_profile_id | uuid (FK → client_profiles.id) | |
| content | text | |
| session_date | date | Date of the live coaching session |
| created_at | timestamptz | |

### `sessions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| client_profile_id | uuid (FK → client_profiles.id) | |
| title | text | Auto-generated or user-named |
| summary | text | AI-generated session summary |
| action_items | jsonb | Array of strings |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `messages`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| session_id | uuid (FK → sessions.id) | |
| role | text | `'user'` or `'assistant'` |
| content | text | |
| metadata | jsonb | Optional: RAG sources, confidence |
| created_at | timestamptz | |

### `alerts`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| client_profile_id | uuid (FK → client_profiles.id) | |
| session_id | uuid (FK → sessions.id, nullable) | |
| type | text | `'crisis'`, `'stuck'`, `'disengagement'`, `'frustration'`, `'high_stakes'` |
| status | text | `'active'`, `'acknowledged'`, `'resolved'` |
| title | text | |
| details | text | |
| created_at | timestamptz | |
| resolved_at | timestamptz | nullable |

### `knowledge_documents`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| title | text | |
| source | text | `'framework'`, `'transcript'`, `'blog'` |
| content | text | Full text content |
| chunk_count | integer | default 0 |
| created_at | timestamptz | |

### Row Level Security

- `client_profiles`: coach can read/write all; clients can read only their own
- `goals`, `coach_notes`: coach can read/write all; clients can read only goals linked to their profile
- `sessions`, `messages`: coach can read all; clients can read/write only their own sessions
- `alerts`: coach only
- `knowledge_documents`: coach only
- `profiles`: users can read their own; coach can read all

---

## Pages & UI

### 1. Sign In Page (`/sign-in`)
- Email + password form
- Link to sign up
- Clean, minimal design with the app name/logo centered
- After sign-in: redirect coach to `/dashboard`, client to `/chat`

### 2. Sign Up Page (`/sign-up`)
- Email, name, password
- Creates a profile with role `'client'` by default
- Redirect to `/chat` after sign-up

---

### 3. Coach Dashboard — Overview (`/dashboard`)
- **Top bar**: App name, coach avatar/name, sign-out button
- **Sidebar navigation** (persistent on all `/dashboard/*` pages):
  - Overview (home icon)
  - Clients (users icon)
  - Alerts (bell icon, with a red badge showing count of active alerts)
  - Knowledge Base (book icon)
- **Main content area** has three sections:

**Active Alerts Banner** (top)
- Show up to 3 most recent active alerts as dismissible colored banners
- Red for `crisis`, orange for `stuck`/`frustration`, yellow for `disengagement`/`high_stakes`
- Each shows: alert title, client name, time ago
- Click goes to `/dashboard/alerts`

**Client Cards Grid**
- Card for each client showing: name, title, organization, coaching mode badge, last interaction date, number of active goals, alert indicator if any active alerts
- Click a card → `/dashboard/clients/[clientId]`
- "Add Client" button that opens a dialog/drawer

**Recent Interactions Feed**
- Chronological list of recent AI-client conversations across all clients
- Each item: client name, session title or first message preview, timestamp
- Click → `/dashboard/clients/[clientId]` with sessions tab active

---

### 4. Coach Dashboard — Clients List (`/dashboard/clients`)
- Searchable table/list of all clients
- Columns: Name, Title, Organization, Coaching Mode, Goals (count), Last Active, Status
- Click row → client detail page
- "Add Client" button

**Add Client Dialog**
- Fields: Name, Email, Title, Organization, Reports To, Direct Reports, Org Context (textarea), Coaching Mode (dropdown: Companion / Standalone)
- On save: creates a `profiles` entry (role: client) and a `client_profiles` entry
- Note: for MVP, coach manually creates client accounts

---

### 5. Coach Dashboard — Client Detail (`/dashboard/clients/[clientId]`)
- **Header**: Client name, title @ organization, coaching mode badge, last active
- **Tabbed interface** with these tabs:

**Profile Tab**
- Editable form: title, organization, reporting_to, direct_reports, org_context, coaching_mode
- Assessment data section: JSON editor or structured form showing assessment data
- Save button

**Goals Tab**
- List of goals with title, description, status badge, target date
- Add goal button (inline form or dialog)
- Click to edit status (active → completed / paused)
- Drag to reorder would be nice but not required

**Coach Notes Tab**
- List of notes sorted by session_date descending
- Each note shows: session date, content preview
- "Add Note" button → dialog with date picker and rich text area
- Click to expand full note

**AI Sessions Tab**
- List of AI chat sessions for this client
- Each shows: title, date, message count, summary preview if available
- Click to expand and see full message history (read-only for coach)
- Messages displayed as a chat transcript: user messages on right, AI on left

---

### 6. Coach Dashboard — Alerts (`/dashboard/alerts`)
- Filterable list of all alerts
- Filters: status (Active / Acknowledged / Resolved), type, client
- Each alert card shows: type badge (color-coded), title, details, client name, session link, created date
- Actions: Acknowledge (changes status), Resolve (changes status, sets resolved_at)
- Active alerts at top, then acknowledged, then resolved

---

### 7. Coach Dashboard — Knowledge Base (`/dashboard/knowledge`)
- **Upload Section**
  - Title input, source dropdown (Framework / Transcript / Blog), large textarea for content
  - "Upload" button that saves to `knowledge_documents`
  - Note: this is text-only for MVP. No file upload parsing needed.

- **Documents List**
  - Table: Title, Source, Chunk Count, Created Date
  - Click to view/edit content
  - Delete button with confirmation

---

### 8. Client Chat Page (`/chat`)
- Full-screen chat interface, mobile-friendly
- **Top bar**: "AI Coach" title, session selector dropdown (past sessions + "New Session"), user menu with sign-out
- **Chat area**: scrollable message list
  - User messages: right-aligned, blue/indigo background
  - AI messages: left-aligned, gray/white background, rendered as markdown
  - Timestamps on each message
  - "AI is typing..." indicator when waiting for response
  - Auto-scroll to bottom on new messages
- **Input area** (bottom, sticky):
  - Multiline text input (auto-grows up to 4 lines)
  - Send button (arrow icon)
  - Send on Enter, Shift+Enter for newline
- **Session Summary Card**: when a session has a summary, show it as a special card at the end of the conversation with key takeaways and action items
- **Empty state** for new sessions: "Welcome back, [Name]. What's on your mind today?" with 3 suggested prompts:
  - "I need to prepare for a difficult conversation"
  - "Help me think through a strategic decision"
  - "I want to reflect on my week"

**Chat behavior (important):**
- For the MVP, the chat does NOT need to call a real AI API. Instead, create a mock response function that returns placeholder coaching responses after a 1-2 second delay. The responses should feel realistic:
  - "That's a great question. Before I share my perspective, help me understand — what's your instinct telling you about this situation?"
  - "I hear you. Let's break this down. What specifically feels most challenging about this conversation you need to have?"
  - "Based on what you've shared about your leadership style, I'd suggest approaching this with the SBI framework..."
  - Vary the mock responses based on keywords in the user's message
- Save all messages (both user and mock AI) to the `messages` table
- This mock will be replaced with a real Claude API integration later

---

### 9. Client Profile Page (`/profile`)
- Read-only view of the client's own profile
- Shows: name, title, organization, coaching mode
- Goals list with status
- Does NOT show: coach notes, alerts, assessment raw data

---

## Design System

- **Color palette**: Professional and calming. Primary: indigo/blue. Accents: warm amber for CTAs. Neutral grays for backgrounds.
- **Typography**: Clean sans-serif. Inter or system font stack.
- **Spacing**: Generous whitespace. The app should feel calm and focused, not cluttered.
- **Cards**: Rounded corners (lg), subtle shadow, white background
- **Chat bubbles**: Rounded, with a slight tail/arrow shape. User messages in indigo-600 with white text. AI messages in gray-100 with dark text.
- **Dark mode**: Not needed for MVP
- **Mobile**: The client chat page MUST be fully responsive and usable on mobile. The coach dashboard can be desktop-optimized.

Use shadcn/ui components: Button, Card, Dialog, Input, Textarea, Select, Badge, Table, Tabs, Avatar, DropdownMenu, Sheet (for mobile sidebar), ScrollArea.

---

## Key Interactions

1. **Coach creates a client** → fills out the add client dialog → client appears in the list
2. **Coach views a client** → sees profile, goals, notes, AI session history in tabs
3. **Coach adds a goal** → enters title, description, target date → goal appears in the goals tab
4. **Coach writes a note** → enters session date and content → note saved
5. **Coach uploads knowledge** → enters title, source, content text → document saved
6. **Coach reviews alerts** → sees active alerts, can acknowledge or resolve them
7. **Client opens chat** → sees past sessions or starts new one → types a message → gets a mock AI response → messages saved to DB
8. **Client views profile** → sees their own info and goals (read-only)

---

## What NOT to Build (will be added later outside Lovable)

- Real AI/LLM integration (Claude API) — use mock responses for now
- RAG pipeline / vector search / embeddings
- Voice interface
- File upload / PDF parsing
- Email notifications
- Proactive check-ins
- Analytics / reporting
- Payment / billing
- Response validation (guardrail checking)

---

## Supabase Edge Functions (Optional Enhancement)

If possible, create a Supabase Edge Function at `/functions/v1/chat` that:
1. Accepts `{ sessionId, message }`
2. Saves the user message to `messages`
3. Returns a mock AI response (random from a list of 10+ coaching-style responses)
4. Saves the AI response to `messages`
5. Returns the AI message to the client

This keeps the chat logic server-side and makes it easy to swap in real AI later.

---

## Summary

Build a two-sided app: a coach dashboard for managing clients/goals/notes/alerts/knowledge, and a client-facing chat interface with mock AI responses. Use Supabase for everything (auth, DB, RLS). Make the chat feel real and polished — it's the hero feature. The dashboard is functional but doesn't need to be flashy. Every piece of data should be persisted to the database. The mock AI will be replaced with Claude later.
