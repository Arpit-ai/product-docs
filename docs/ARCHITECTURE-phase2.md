# Phase 2: Search, Media, and Templates — Implementation Plan

## Overview
Phase 2 enhances the product docs platform with powerful search capabilities, rich media support, and reusable templates for faster content creation.

## Features Breakdown

### 1. Full-Text Search with Context Highlighting
- Search documents by title and content
- Return search results with highlighted context snippets
- Rank results by relevance
- Support for searching across documents, folders, and comments

### 2. Rich Media Embeds
- Support for multiple media sources: Figma, Miro, Google Drive, Loom, YouTube, Vimeo, etc.
- Custom embed block in EditorJS for any iframe/embed
- URL-based media detection (auto-detect provider)
- Responsive embed sizing
- Fallback for unsupported media

### 3. Block Templates
- Save block structures as reusable templates
- Template library per document/folder
- Quick insert templates from slash commands
- Template previews
- Template editing and deletion

## Architecture Plan

### Search Infrastructure
- **Service**: `src/lib/search.ts`
  - Full-text search algorithm (client-side or API-based)
  - Context highlighting
  - Search indexing (optional for performance)
- **API**: `src/app/api/search/route.ts` (already exists, enhance)
- **UI**: `src/components/Search/SearchResults.tsx`

### Media System
- **Block**: `@editorjs/embed` (already available)
- **Custom Embed Block**: `src/components/Editor/EmbedBlock.tsx`
- **Providers**: `src/lib/media/mediaProviders.ts`
  - Figma, Miro, Google Drive, Loom, YouTube, Vimeo, PDF
- **Component**: `src/components/Editor/MediaEmbed.tsx`

### Template System
- **Database**: Extend Prisma schema for templates
  - `Template` model with name, blocks[], folder, created_by
- **Service**: `src/lib/templates.ts`
- **API**: `src/app/api/templates/route.ts`
- **UI**: `src/components/Editor/TemplateLibrary.tsx`, `src/components/Editor/SaveTemplate.tsx`

## Phase 2 File Structure

```
src/
  lib/
    ├─ search.ts              # Full-text search service
    ├─ templates.ts           # Template management
    └─ media/
       └─ mediaProviders.ts   # Embed providers (Figma, Miro, etc.)
  
  components/
    ├─ Search/
    │  ├─ SearchBox.tsx       # Search input UI
    │  └─ SearchResults.tsx   # Results display with highlights
    ├─ Editor/
    │  ├─ EmbedBlock.tsx      # Custom embed block for EditorJS
    │  ├─ MediaEmbed.tsx      # Media embed component
    │  └─ TemplateLibrary.tsx # Template UI
  
  app/
    └─ api/
       ├─ search/ (enhance existing)
       └─ templates/
          ├─ route.ts         # List, create, delete templates
          └─ [id]/route.ts    # Get, update template
```

## Database Schema Updates

```prisma
model Template {
  id        String   @id @default(cuid())
  name      String
  blocks    Json     // EditorJS block structure
  folderId  String?  @db.String
  folder    Folder?  @relation(fields: [folderId], references: [id])
  createdBy String   @db.String
  user      User     @relation(fields: [createdBy], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Dependencies to Add

- No new major dependencies needed!
- Use existing `@editorjs/embed`
- Full-text search can be client-side or use existing API patterns

## Implementation Steps

### Step 1: Database Schema
- [ ] Add `Template` model to Prisma schema
- [ ] Run migration

### Step 2: Search Infrastructure
- [ ] Implement `src/lib/search.ts` with search algorithm
- [ ] Enhance `/api/search` endpoint
- [ ] Add context highlighting utility

### Step 3: Media System
- [ ] Create media provider detection
- [ ] Implement `src/components/Editor/EmbedBlock.tsx`
- [ ] Support multiple embed providers
- [ ] Add responsive sizing

### Step 4: Template System
- [ ] Create template API routes
- [ ] Implement `src/lib/templates.ts`
- [ ] Create `TemplateLibrary.tsx` component
- [ ] Integrate with NotionEditor slash commands
- [ ] Add save/manage/delete UIs

### Step 5: UI Integration
- [ ] Enhance SearchBox UI
- [ ] Display search results with highlights
- [ ] Add template picker to toolbar
- [ ] Add template management UI

### Step 6: Testing & Documentation
- [ ] Test search across multiple documents
- [ ] Test media embeds with different providers
- [ ] Test template save/use/delete
- [ ] Create Phase 2 documentation

## Success Criteria

✅ Full-text search working across docs/folders/comments  
✅ Media embeds supporting 5+ providers  
✅ Template system fully functional  
✅ All UIs responsive and user-friendly  
✅ Build passing, zero errors  
✅ Comprehensive documentation

## Timeline

- Search: 1 day
- Media: 1 day
- Templates: 1.5 days
- **Total: 3-4 days**

## Next Phase (Phase 3)

After Phase 2 complete:
- Kanban boards
- Advanced tables
- Permission system
- Public sharing links
