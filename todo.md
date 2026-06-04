# Product Docs — Feature Roadmap & TODO

This file tracks major feature ideas and breaks them into actionable phases for implementation.

---

## Phase 1: Collaboration & Comments
- [x] Real-time collaborative editing (Yjs + y-websocket)
- [x] Show live cursors and selections for all users (awareness framework in place, UI in progress)
- [x] Inline comments on blocks or text (UI components ready, persistence ready)
- [x] Suggestion mode (propose edits, accept/reject changes)

## Phase 2: Search, Media, and Templates
- [x] Full-text search with context highlighting
- [x] Search across docs and folders
- [~] Search across comments
- [x] Rich media embeds (Figma, Miro, Google Drive, Loom, PDF, etc.)
- [x] Custom block for any iframe/embed
- [x] Custom block templates (save/reuse block structures)

## Phase 3: Boards, Permissions, and Branding
- [x] Fine-grained permissions (database schema, service, API routes)
- [x] Access control UI (share, manage permissions)
- [x] Public share links with expiration
- [x] Kanban boards for project/task management (KanbanBlock + /boards page)
- [x] Advanced tables (sorting, filtering, formulas, column types)
- [x] Custom branding, white-label UI, dark mode (ThemeProvider + ThemeToggle + /settings)

## Phase 4: AI, Import/Export, Integrations
- [x] AI-powered block: generate, summarize, translate, fix grammar
- [x] AI-powered search and Q&A over docs
- [x] Import from Notion, Confluence, Markdown, Google Docs
- [x] Export to PDF, Markdown, HTML
- [x] REST/GraphQL API for integration
- [x] Webhooks for doc changes, comments, etc.
- [x] Integrations: Slack, Teams, Jira, GitHub, Zapier, etc.

## Phase 5: Notifications, Mobile, Polish
- [ ] Email/in-app notifications for mentions, comments, changes
- [ ] Activity feed per doc/folder
- [ ] Mobile-optimized UI (touch-friendly editing, drag-drop)
- [ ] Collaborative cursors/avatars
- [ ] Final polish, bugfixes, and documentation

---

**Legend:**
- [ ] = Not started
- [x] = Complete
- [~] = In progress

Update this file as features are planned, started, or completed.
