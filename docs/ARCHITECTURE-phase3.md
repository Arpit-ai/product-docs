# Phase 3: Boards, Permissions, and Branding — Implementation Plan

## Overview
Phase 3 adds collaborative project management (Kanban boards), fine-grained access control (folder/document permissions), and visual customization (dark mode, branding).

## Features Breakdown

### 1. Kanban Boards
- Create board blocks (nested in documents)
- Drag-drop cards between columns
- Card templates with custom fields
- Collaborative updates via Yjs
- Multiple board views per document

### 2. Advanced Tables
- Sorting, filtering, search
- Formula support (sum, count, etc.)
- Inline cell editing
- Column customization (hide, reorder, type)
- Aggregate rows (totals, averages)

### 3. Fine-Grained Permissions
- Per-document/folder access levels: OWNER, EDITOR, COMMENTER, VIEWER
- Share with users or email (pending invite)
- Invite links with expiration
- Role-based block/content restrictions
- Activity log showing who changed what

### 4. Shareable Public Links
- Create time-limited public links
- View-only or comment permissions
- Password protection (optional)
- Link analytics (view count, visitors)
- Revoke anytime

### 5. Custom Branding & Dark Mode
- Dark/light mode toggle
- Custom color scheme
- Logo upload
- Accent color customization
- Font selection
- System theme detection

## Architecture Plan

### Permissions System
- **Database**: Extend Prisma schema
  - `DocumentAccess` model (user_id, doc_id, role, createdAt, expiresAt)
  - `FolderAccess` model (user_id, folder_id, role)
  - `SharedLink` model (id, resource_id, type, token, expires_at, password, view_count)
  - `Invitation` model (email, resource_id, role, accepted)
- **Service**: `src/lib/permissions.ts`
  - Check access level for user on doc/folder
  - Resolve cascading permissions (folder → document)
  - Generate secure share tokens
- **API**: `src/app/api/documents/[id]/access/route.ts`
  - List, grant, revoke access
  - Send invitations
  - Create/manage public links

### Kanban Board Block
- **Component**: `src/components/Editor/KanbanBlock.tsx`
  - Render columns and draggable cards
  - Yjs integration for board state
  - Card detail modal
- **Custom EditorJS Tool**: Kanban block type
  - Nested in document content
  - Serialize/deserialize board structure

### Advanced Tables
- **Enhanced Table Plugin**: Extend @editorjs/table
  - Add sorting, filtering, formulas
  - `src/components/Editor/AdvancedTable.tsx`
  - Cell type system (text, number, date, select, checkbox)

### Dark Mode & Branding
- **Settings Model**: `src/lib/settings.ts`
  - User preferences (theme, colors, font)
  - Workspace branding
- **Component**: `src/components/ThemeProvider.tsx`
  - Context-based theme management
  - CSS variable injection
- **UI**: Settings/preferences page at `/settings`

## Phase 3 File Structure

```
src/
  lib/
    ├─ permissions.ts        # Permission checking service
    └─ branding.ts           # Theme/branding utilities
  
  components/
    ├─ Editor/
    │  ├─ KanbanBlock.tsx    # Kanban board editor block
    │  └─ AdvancedTable.tsx  # Enhanced table with formulas
    ├─ Permissions/
    │  ├─ AccessControl.tsx  # Share & manage permissions UI
    │  └─ ShareModal.tsx     # Create public links
    ├─ Settings/
    │  └─ PreferencesPanel.tsx # Theme/branding UI
    └─ ThemeProvider.tsx     # Theme context
  
  app/
    └─ api/
       ├─ documents/[id]/
       │  └─ access/
       │     ├─ route.ts     # List/grant/revoke access
       │     └─ share/
       │        └─ route.ts  # Create/manage public links
       └─ settings/
          └─ route.ts        # Save user/workspace settings
```

## Database Schema Updates

```prisma
model DocumentAccess {
  id        String   @id @default(cuid())
  documentId String
  userId    String?
  email     String?  // For pending invitations
  role      AccessRole  // OWNER, EDITOR, COMMENTER, VIEWER
  createdAt DateTime @default(now())
  expiresAt DateTime?
  
  document  Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([documentId, userId])
  @@unique([documentId, email])
}

model FolderAccess {
  id       String   @id @default(cuid())
  folderId String
  userId   String
  role     AccessRole
  
  folder   Folder @relation(fields: [folderId], references: [id], onDelete: Cascade)
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([folderId, userId])
}

model SharedLink {
  id          String   @id @default(cuid())
  resourceType String  // "document" or "folder"
  resourceId  String
  token       String   @unique
  expiresAt   DateTime?
  password    String?
  viewCount   Int      @default(0)
  createdBy   String
  createdAt   DateTime @default(now())
  
  user        User    @relation(fields: [createdBy], references: [id])
  
  @@index([resourceId])
}

model Invitation {
  id       String   @id @default(cuid())
  email    String
  resourceType String // "document" or "folder"
  resourceId String
  role     AccessRole
  accepted Boolean  @default(false)
  
  @@unique([email, resourceId])
}

enum AccessRole {
  OWNER      // Create, read, write, delete, share, manage access
  EDITOR     // Create, read, write (can't delete or change permissions)
  COMMENTER  // Read, comment (can't write blocks)
  VIEWER     // Read-only
}
```

## Dependencies to Add

```json
{
  "uuid": "^9.0.0",           // Secure token generation
  "zod": "^3.25.56"          // Validation (already installed)
}
```

## Implementation Steps

### Step 1: Database Schema & Permissions Service
- [ ] Update Prisma schema with access models
- [ ] Run migration
- [ ] Create `src/lib/permissions.ts` service
- [ ] Implement permission checking logic

### Step 2: Permission APIs
- [ ] Create `/api/documents/[id]/access` routes
- [ ] Implement grant/revoke/list access
- [ ] Add share link creation and management
- [ ] Email invitation system (optional: SendGrid/Resend)

### Step 3: UI Components
- [ ] Create `AccessControl.tsx` for managing permissions
- [ ] Create `ShareModal.tsx` for public links
- [ ] Add share button to document header

### Step 4: Kanban Board
- [ ] Design board block structure (columns, cards)
- [ ] Create `KanbanBlock.tsx` component
- [ ] Implement drag-drop using react-beautiful-dnd or dnd-kit
- [ ] Yjs integration for real-time sync

### Step 5: Advanced Tables (Optional for Phase 3)
- [ ] Extend table block with sorting/filtering
- [ ] Add formula support
- [ ] Column customization UI

### Step 6: Dark Mode & Branding
- [ ] Create theme context and provider
- [ ] Add settings page
- [ ] Implement CSS variables for theming
- [ ] Dark/light mode toggle in header

### Step 7: Testing & Documentation
- [ ] Test permission inheritance and cascading
- [ ] Test share link expiration
- [ ] Test Kanban real-time sync
- [ ] Create Phase 3 documentation

## Success Criteria

✅ Permissions working: users can only access assigned docs/folders  
✅ Share links functioning with time limits  
✅ Kanban boards with drag-drop and real-time sync  
✅ Dark mode theme switching  
✅ Permission/access UI polished  
✅ Build passing, zero errors  

## Timeline

- Permissions: 1.5 days
- Kanban Boards: 2 days
- Advanced Tables: 1 day (optional)
- Dark Mode: 0.5 days
- **Total: 4-5 days**

## Priority

1. **Permissions** (foundational for security)
2. **Kanban Boards** (high user value)
3. **Share Links** (key for collaboration)
4. **Dark Mode** (polish)
5. **Advanced Tables** (optional, can defer)

## Next Phase (Phase 4)

After Phase 3 complete:
- AI-powered blocks (generate, summarize, translate)
- Import/export (Notion, Markdown, HTML)
- REST/GraphQL API
- Webhooks
- Integrations (Slack, Teams, Jira, GitHub, Zapier)
