# Smart Bookmark App

## Overview
A modern, full-stack bookmark manager built with Next.js, Supabase, and Tailwind CSS. Features include analytics, reminders, import/export, AI summarization, collaborative folders, custom tags, archiving, and quick search.

---

## Architecture Diagram

```
+-------------------+      +-------------------+      +-------------------+
|   Next.js Frontend|<---->|   Supabase Backend|<---->|   PostgreSQL DB   |
+-------------------+      +-------------------+      +-------------------+
        |                        |                        |
        |  Auth, Realtime, CRUD  |  RLS, Triggers, Pub    |
        |----------------------->|----------------------->|
        |                        |                        |
        |  REST/Realtime/GraphQL |                        |
        |<-----------------------|                        |
```

---

## Technology Stack
- **Frontend:** Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **Backend:** Supabase (Auth, Realtime, PostgreSQL, RLS)
- **UI:** Tailwind CSS, Framer Motion, Lucide React, Sonner, date-fns
- **AI:** Summarization via OpenAI API (example endpoint)

---

## Setup & Connection

### 1. Supabase
- Created project at [supabase.io](https://supabase.io)
- Enabled Google OAuth for authentication
- Created tables: `folders`, `bookmarks`, `reminders`, `bookmark_archive`
- Enabled RLS (Row Level Security) for user data isolation
- Enabled Realtime for `bookmarks` and `folders` tables
- Set up triggers for `updated_at` and analytics

### 2. Next.js
- Scaffolded with `npx create-next-app@latest` (16.1.6)
- Added Tailwind CSS v4, Framer Motion, Lucide React, Sonner, date-fns
- Connected to Supabase using environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Implemented singleton Supabase client for browser

### 3. Features Implemented
- **Analytics:** Visit count, last accessed, tag stats
- **Reminders:** Set, notify, display reminders
- **Import/Export:** CSV/JSON, browser file import
- **AI Summarize:** Button, modal, API integration
- **Collaborative Folders:** Share, invite, display
- **Custom Tags & Suggestions:** Color picker, tag suggestions
- **Archiving:** Archive/unarchive bookmarks
- **Quick Search & Shortcuts:** Fuzzy search, Ctrl+K modal

---

## Detailed Process

### Database Schema
- Designed schema in `supabase/schema.sql`:
  - `folders`: supports sharing, color, icon
  - `bookmarks`: analytics, reminders, archiving, tags
  - `reminders`: scheduled notifications
  - `bookmark_archive`: audit/history
- Enabled RLS and triggers for security and analytics

### Frontend Implementation
- **App Router:** Used Next.js App Router for modular pages
- **Dashboard:** Real-time sync, polling fallback, analytics, quick search
- **BookmarkCard:** CRUD, reminders, AI summarize, archiving, tag color
- **Sidebar:** Folder CRUD, sharing, theme toggle
- **Add/Edit Modals:** Tag suggestions, color picker, reminders
- **Import/Export:** CSV/JSON logic, file reader
- **Quick Search:** Modal, fuzzy search, keyboard shortcuts

### Backend Integration
- **Supabase Client:** Singleton pattern for browser
- **Realtime:** Subscribed to changes, fallback to polling
- **Auth:** Google OAuth, session management
- **AI Summarize:** Example API endpoint `/api/summarize` (OpenAI)

---

## Tools Used
- **Next.js**: Frontend framework
- **Supabase**: Backend, database, auth, realtime
- **Tailwind CSS v4**: Styling
- **Framer Motion**: Animations
- **Lucide React**: Icons
- **Sonner**: Toast notifications
- **date-fns**: Date formatting
- **OpenAI API**: Summarization

---

## How Everything Connects
- **Frontend** calls Supabase for CRUD, auth, and realtime
- **Supabase** manages data, triggers, and RLS
- **Realtime** updates bookmarks/folders instantly
- **AI Summarize** fetches summaries via API
- **Import/Export** allows data portability
- **Collaborative Folders** enable sharing
- **Custom Tags** improve organization
- **Archiving** keeps bookmarks tidy
- **Quick Search** boosts productivity

---

## Example Workflow
1. User logs in via Google OAuth
2. Dashboard loads bookmarks and folders
3. User adds bookmarks, sets reminders, tags, and colors
4. Bookmarks update in real-time or via polling
5. User can export/import bookmarks, archive, share folders
6. AI summarize button fetches page summary
7. Quick search modal (Ctrl+K) filters bookmarks

---

## Diagram

```
[User]
   |
   |---[Next.js Frontend]---|
   |                        |
   |---[Supabase Backend]---|
   |                        |
   |---[PostgreSQL DB]------|
   |                        |
   |---[OpenAI API]---------|
```

---

## Security & Best Practices
- RLS ensures users only access their own data
- Triggers keep analytics up to date
- Singleton client prevents duplicate subscriptions
- Polling fallback ensures reliability

---

## Customization
- Easily extend with new features (e.g., bookmark screenshot, more AI tools)
- Theming via CSS variables
- Modular codebase for rapid iteration

---

## Contact & Credits
Built with GitHub Copilot (GPT-4.1) and modern web tools.
