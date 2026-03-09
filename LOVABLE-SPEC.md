# AI Executive Coach — Full Product Spec

> This document serves two purposes:
> 1. **Part 1 (Lovable Build Spec)** — paste this into Lovable to build the MVP
> 2. **Part 2 (Future Roadmap)** — reference for all features to add after the initial build

---

# PART 1: LOVABLE BUILD SPEC (MVP)

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

## Supabase Edge Functions (Optional Enhancement)

If possible, create a Supabase Edge Function at `/functions/v1/chat` that:
1. Accepts `{ sessionId, message }`
2. Saves the user message to `messages`
3. Returns a mock AI response (random from a list of 10+ coaching-style responses)
4. Saves the AI response to `messages`
5. Returns the AI message to the client

This keeps the chat logic server-side and makes it easy to swap in real AI later.

---

## MVP Summary

Build a two-sided app: a coach dashboard for managing clients/goals/notes/alerts/knowledge, and a client-facing chat interface with mock AI responses. Use Supabase for everything (auth, DB, RLS). Make the chat feel real and polished — it's the hero feature. The dashboard is functional but doesn't need to be flashy. Every piece of data should be persisted to the database. The mock AI will be replaced with Claude later.

---
---

# PART 2: FUTURE ROADMAP (Post-Lovable)

Everything below describes features to build after the MVP is working. These will be implemented outside Lovable, likely by migrating to a Next.js codebase or extending the Lovable app with custom code.

---

## Phase 2: Live AI Integration (Replace Mock with Claude)

### Coaching Engine
The core AI system that composes prompts and orchestrates responses. Replaces the mock response function.

**System prompt structure** (assembled dynamically per request):

```
[IDENTITY BLOCK]
You are the AI coaching companion for [Coach Name]. You embody their
methodology, voice, and approach. You are NOT the human coach — you are
their AI extension.

[VOICE BLOCK]
Communication style: warm, direct, action-oriented...
(Loaded from a config or DB — the coach calibrates this)

[CLIENT CONTEXT BLOCK]
Client: {name}, {title} at {organization}
Reports to: {reportingTo}. Has {directReports} direct reports.
Coaching mode: {companion|standalone}
Current goals: {goals list}
Assessment highlights: {key assessment data points}
Recent coach notes: {last 2-3 coach notes}
Recent conversation themes: {summary of last few sessions}

[KNOWLEDGE BLOCK]
The following frameworks and content from [Coach Name]'s methodology
are relevant to this conversation:
---
{RAG retrieved chunks, each with source attribution}
---
Reference these frameworks by name. Do not invent frameworks.

[GUARDRAILS BLOCK]
- NEVER fabricate advice, statistics, or research
- If unsure, say "I'm not sure about that"
- NEVER provide legal, financial, HR, or clinical advice
- If the client expresses acute distress or crisis, respond with empathy
  and provide: 988 Suicide & Crisis Lifeline, Crisis Text Line
- Clearly identify yourself as an AI coaching companion
- For complex topics, suggest discussing with [Coach Name] in their
  next session

[INSTRUCTION BLOCK]
Ask one powerful question before offering advice. Balance support with
challenge. Keep responses concise (2-4 paragraphs max unless the client
asks for more). End with a clear next step or reflection question.
```

### Chat API Flow
1. Validate input
2. Load client profile + goals + recent coach notes from DB
3. Query vector DB for relevant knowledge chunks using the user's message
4. Compose the system prompt (coach voice + client context + retrieved knowledge + guardrails)
5. Call Claude via streaming API with the full message history
6. Save the user message and AI response to the database on stream completion
7. Run response validator asynchronously on the completed response
8. If the validator flags something, create an Alert record

### Recommended Stack for AI Integration
- **Claude API** (`@anthropic-ai/sdk`) — all reasoning and coaching responses
- **Vercel AI SDK** (`ai` package) — `useChat` hook for streaming UI, `streamText` for server-side streaming. Massively accelerates chat implementation.
- **Supabase Edge Functions** or **Next.js API routes** — host the chat endpoint

---

## Phase 3: RAG Pipeline (Knowledge Grounding)

Ground all AI responses in the coach's actual frameworks and content. This is the anti-hallucination backbone.

### Ingestion Pipeline
1. Coach uploads a document (markdown or plain text) via the Knowledge Base page
2. Chunk the document into ~500 token segments with ~50 token overlap
3. Generate embeddings via OpenAI `text-embedding-3-small` ($0.02/1M tokens, 1536 dimensions)
4. Upsert to a vector database (Pinecone) with metadata: `{ documentId, chunkIndex, source, title }`
5. Update the `knowledge_documents` record with chunk count

### Search
1. Embed the user's query
2. Query Pinecone with `topK: 5` and a relevance threshold (score > 0.75)
3. Return text chunks with source metadata
4. Inject into the system prompt's KNOWLEDGE BLOCK

### Recommended Stack
- **Pinecone** (`@pinecone-database/pinecone`) — managed vector DB with metadata filtering
- **OpenAI** (just for `text-embedding-3-small`) — embedding generation only, all reasoning stays on Claude
- Alternative: **pgvector** (Supabase extension) to keep everything in one DB. Simpler but less performant for large knowledge bases. The search abstraction makes this a one-file swap.

---

## Phase 4: Response Validation & Guardrails

### Response Validator
A secondary, cheaper AI call (Claude Haiku) that runs after each coaching response to check for:
- Claims not grounded in the knowledge base or client data
- Legal, financial, HR, or clinical advice
- Crisis language in the user's message
- Hallucinated frameworks, statistics, or research

Returns structured JSON: `{ hallucination: bool, outOfScope: bool, crisisDetected: bool, details: string }`

If any flag is true → create an Alert record for the coach.

### Escalation Detection
Automated detection of patterns that need coach attention:
- **Crisis**: acute distress, suicidal ideation → immediate crisis resources + coach alert
- **Stuck**: client repeating the same issue across 2+ sessions without progress
- **Disengagement**: significant drop in usage frequency or message length
- **Frustration**: client expresses frustration with the AI
- **High stakes**: client facing a major decision (board presentation, firing, resignation)

---

## Phase 5: Session Summaries

After a chat session ends (or on demand), generate an AI summary:
- Key themes discussed
- Action items and commitments
- Emotional tone / energy level
- Suggested follow-up topics

Store in the `sessions.summary` and `sessions.action_items` fields. Show as a card in the chat UI and on the coach dashboard.

---

## Phase 6: Voice Interface

### Architecture
- **Speech-to-Text**: Deepgram or OpenAI Whisper (real-time transcription)
- **LLM Processing**: Same coaching engine as text chat
- **Text-to-Speech**: ElevenLabs or PlayHT (warm, professional voice)
- **Alternative**: OpenAI Realtime API or Gemini Live for end-to-end lower latency

### UX
- Push-to-talk and hands-free modes
- Visual indicators for listening / thinking / speaking states
- "Coach is thinking..." indicator during processing
- Automatic transcription of all voice sessions for history and review
- Seamless switch between text and voice within a session
- Target latency: < 500ms response time

### UI Additions
- Microphone button in the chat input area
- Voice mode toggle in session settings
- Waveform visualization during recording
- Replay and bookmark key moments in voice sessions

---

## Phase 7: Proactive Check-ins & Accountability

The AI initiates conversations based on:
- Commitments made in previous sessions ("You committed to having the delegation conversation with Jamie by Friday. How did it go?")
- Goal deadlines approaching
- Detected patterns of avoidance or disengagement
- Configurable frequency per client (daily, twice-weekly, weekly)

### Implementation
- Scheduled Supabase Edge Function or cron job
- Checks client commitments and schedules against current date
- Generates a check-in message and creates a new session
- Sends notification (email or push) to the client

---

## Phase 8: Standalone Mode & Onboarding

Full self-service coaching for clients without a live coaching engagement.

### Onboarding Flow
1. Subscriber signs up, selects plan
2. Intake assessment: role, goals, challenges, leadership context (15-20 min guided form)
3. AI generates initial development plan based on coach's methodology
4. First coaching conversation on highest-priority goal
5. Weekly cadence established with proactive check-ins

### Features
- Structured onboarding wizard (multi-step form)
- AI-generated development plan (stored in client profile)
- Milestone reviews that mimic the cadence of a live engagement
- Upgrade path to live coaching clearly available
- Lighter coach oversight (summary dashboards, not per-interaction review)

---

## Phase 9: Coach Calibration & Review Tools

### AI Response Review
- Coach can review AI responses and mark: "sounds like me" vs. "doesn't sound like me"
- Feedback stored and used to refine system prompts
- Track voice fidelity score over time (target: 85%+ "sounds like me")

### Style Calibration
- Coach adjusts voice parameters: warmth, directness, question-to-advice ratio
- A/B comparison: "Which response sounds more like you?"
- Signature phrases and metaphors captured from transcripts

### Session Prep View
- Pre-session brief for the coach before a live session
- AI interaction summary since last live session
- Mood/energy trends across conversations
- Commitments tracker (made vs. kept)
- Suggested topics for the upcoming session

---

## Phase 10: Client-Facing Progress Portal

Clients see their own progress dashboard:
- Goals with status and history
- Session timeline (AI and live sessions)
- Action items tracker
- Development trajectory visualization
- Key insights and breakthroughs highlighted

---

## Phase 11: Analytics & Reporting

### Coach Analytics
- Usage metrics: sessions per client per week, message counts, session duration
- Engagement trends: which clients are active, declining, or churning
- Goal completion rates
- Common coaching topics (topic clustering across conversations)
- Hallucination rate tracking (target: < 1% of responses)
- Escalation accuracy (were alerts actionable? track false positive rate)

### Enterprise Reporting
- Aggregate engagement metrics across a cohort
- ROI indicators: goal progress, behavioral change markers
- Anonymized theme analysis (what are leaders struggling with?)

---

## Phase 12: Roleplay Mode

AI plays specific characters for client practice:
- Skeptical board member for presentation prep
- Difficult direct report for feedback conversations
- Demanding stakeholder for negotiation practice
- New team member for onboarding conversations

### Implementation
- Mode selector in chat: "Practice with a character"
- Character configuration: role, personality traits, difficulty level
- AI switches persona while maintaining coaching awareness
- Debrief after roleplay: "Here's what I noticed about your approach..."

---

## Phase 13: Enterprise & Platform Features

- **SSO**: SAML/OIDC integration for enterprise customers
- **Admin dashboard**: Organization-level view for HR/L&D teams
- **Bulk licensing**: Manage cohorts of coaching clients
- **Data export**: Compliance-ready data export for enterprise
- **Multi-coach platform**: Support multiple coaches, each with their own voice, knowledge base, and client roster
- **Mobile app**: React Native or native iOS/Android for push notifications and on-the-go coaching

---

## Phase 14: Payments & Billing

### Pricing Tiers
| Tier | Price | Audience |
|------|-------|----------|
| Bundled | Included in coaching fee | Active engagement clients |
| Alumni | $149-299/mo | Post-engagement clients |
| Standalone | $99-199/mo | No live engagement |
| Enterprise | Custom | Corporate cohorts |

### Implementation
- Stripe integration for subscription billing
- Plan management in Supabase (plan tier on client profile)
- Usage limits per tier if needed
- Upgrade/downgrade flows

---

## Anti-Hallucination Strategy (5 Layers)

This is the product's most critical differentiator. All layers should be implemented by the end of Phase 4.

| Layer | Description | Phase |
|-------|-------------|-------|
| 1. RAG Grounding | All responses generated with retrieved context from the coach's knowledge base | Phase 3 |
| 2. Client-Context Grounding | Responses reference specific, verifiable client information (assessments, goals, history) | Phase 2 |
| 3. Response Validation | Post-generation check via secondary AI call for ungrounded claims | Phase 4 |
| 4. Behavioral Guardrails | System prompt instructions to cite sources, say "I don't know", stay in lane | Phase 2 |
| 5. Continuous Improvement | Coach reviews flagged responses, corrections feed back into prompts and knowledge base | Phase 9 |

---

## Success Metrics

| Metric | Target | When to Measure |
|--------|--------|-----------------|
| Client Engagement | 3+ AI interactions per week | Phase 2+ |
| Goal Progress | 70% of goals show measurable progress | Phase 5+ |
| Voice Fidelity | 85%+ coach-reviewed responses rated "sounds like me" | Phase 9+ |
| Hallucination Rate | < 1% of responses contain ungrounded claims | Phase 4+ |
| Client Satisfaction | NPS > 60 | Phase 8+ |
| Retention | 80%+ monthly for standalone subscribers | Phase 8+ |
| Escalation Accuracy | 90%+ of alerts are actionable | Phase 4+ |

---

## Coach Voice Specification (To Be Completed)

| Attribute | Description |
|-----------|-------------|
| Tone | Warm + direct. Empathetic but action-oriented. |
| Language | Conversational, not academic. Uses "you" frequently. Asks powerful questions before giving advice. |
| Signature Phrases | *To be documented from transcripts* |
| Feedback Style | Honest, specific, caring. Balances affirmation with challenge. |
| Pacing | Doesn't rush. Allows space for reflection. But also pushes when client is avoiding. |
| Boundaries | Will say "that's outside my lane" clearly and warmly. Will say "I don't know" without hedging. |

---

## Framework Library Template

Each framework in the coach's methodology should be documented in this format for ingestion into the knowledge base:

| Field | Content |
|-------|---------|
| Name | Framework name |
| Purpose | When to use it / what problem it solves |
| Steps | Step-by-step process |
| Key Questions | Coaching questions associated with this framework |
| Common Pitfalls | What clients typically get wrong |
| Success Indicators | How to know it's working |
| Related Frameworks | Connections to other tools in the methodology |
