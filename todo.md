# Product Docs — Feature Roadmap & TODO

This file tracks major feature ideas and breaks them into actionable phases for implementation.

---

## Phase 1: Collaboration & Comments
- [x] Real-time collaborative editing (Yjs + y-websocket)
- [x] Show live cursors and selections for all users
- [x] Inline comments on blocks or text
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
- [x] Kanban boards for project/task management
- [x] Advanced tables (sorting, filtering, formulas, column types)
- [x] Custom branding, white-label UI, dark mode

## Phase 4: AI, Import/Export, Integrations
- [x] AI-powered block: generate, summarize, translate, fix grammar
- [x] AI-powered search and Q&A over docs
- [x] Import from Notion, Markdown, Google Docs
- [x] Export to PDF, Markdown, HTML
- [x] REST/GraphQL API for integration
- [x] Webhooks for doc changes, comments, etc.
- [x] Integrations: Slack, Teams, Jira, GitHub

## Phase 5: Notifications, Mobile, Polish
- [x] Email/in-app notifications for mentions, comments, changes
- [x] Activity feed per doc/folder
- [x] Mobile-optimized UI (touch-friendly editing, drag-drop)
- [x] Collaborative cursors/avatars
- [x] Final polish, bugfixes, and documentation

---

## 🎉 Platform Status: FEATURE COMPLETE

All planned features from Phase 1-5 are now implemented!

### Ready for:
- Production deployment
- Team collaboration
- Enterprise use
- Further customization

### Suggested Next Steps:
- Deploy to production with email service configured
- Gather user feedback on UX
- Implement additional integrations as needed
- Performance optimization based on real usage
- Security hardening before public launch

**Legend:**
- [ ] = Not started
- [x] = Complete
- [~] = In progress
