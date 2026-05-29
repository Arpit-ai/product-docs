# Phase 1 Implementation: Real-Time Collaboration & Comments

## Overview
Phase 1 introduces real-time collaborative editing, live user presence, inline comments, and suggestion mode for editing workflows. Built on Yjs (CRDT) and y-websocket for seamless multi-user sync.

## Components & Architecture

### 1. **Yjs Integration** (`src/collab/`)
- **yjs-provider.ts**: Sets up Yjs WebSocket provider for document synchronization
- **awareness.ts**: Manages user presence (cursors, names, colors)
- **comments.ts**: Shared comments model using Yjs Map
- **useYjsDoc.ts**: React hook for managing Yjs document lifecycle

### 2. **UI Components** (`src/components/Editor/`)
- **CollabToolbar.tsx**: Shows active users, suggestion mode toggle
- **Comments.tsx**: Inline comment threads with reply/resolve/delete
- **SuggestionMode.tsx**: Panel for pending, accepted, and rejected suggestions

### 3. **Editor Integration** (`src/components/Editor/NotionEditor.tsx`)
- Yjs provider initialized on mount
- Auto-sync between EditorJS and Yjs Y.Text
- CollabToolbar displays user presence
- SuggestionPanel shown when suggestion mode is active

### 4. **WebSocket Server** (`scripts/yjs-websocket-server.js`)
- Minimal in-memory WebSocket server for development
- Routes connections by document ID (room-based)
- Broadcasts all messages to connected clients in same room

## How It Works

### Real-Time Sync
1. User edits in NotionEditor
2. EditorJS onChange fires
3. Content serialized to JSON and pushed to Yjs Y.Text
4. Yjs broadcasts to all connected clients in the room
5. Remote clients receive Yjs updates and re-render editor

### User Presence
1. Each user connected to WebSocket broadcasts awareness state
2. Awareness includes: user ID, name, color
3. CollabToolbar reads awareness states and displays connected users
4. Users are automatically removed when disconnected

### Comments (Framework)
- Comments stored in Yjs Map (`ydoc.getMap('comments')`)
- Each document gets a comments map
- Comments include: author, timestamp, text, resolved state
- Comments component renders thread UI with add/resolve/delete

### Suggestion Mode
- Toggle via CollabToolbar
- When ON: All edits tracked as suggestions
- Each suggestion has: type (insert/delete/modify), author, original/proposed text
- Accept/Reject UI shows pending, accepted, rejected suggestions
- Pending suggestions counted in footer

## Development Setup

### Start Development Server with Yjs WebSocket
```bash
npm run dev
```
This concurrently starts:
- Next.js dev server on `http://localhost:3000`
- Yjs WebSocket server on `ws://localhost:1234`

### Start Services Separately
```bash
npm run dev:next    # Just Next.js
npm run dev:yjs     # Just Yjs server
npm run yjs-server  # Yjs server only
```

### Environment Variables
```
NEXT_PUBLIC_YJS_WS_URL=ws://localhost:1234    # WebSocket URL for client
YJS_WS_PORT=1234                               # WebSocket server port
```

## Testing Collaboration

1. **Single User**: Load `/documents/[id]` in browser
   - See CollabToolbar with own user
   - Edit document normally
   - Toggle suggestion mode to see SuggestionPanel

2. **Multiple Users**: Open same document in 2 browser tabs/windows
   - See both users in CollabToolbar
   - Edits in Tab A appear in Tab B in real-time
   - Suggestion mode works across both tabs
   - Comments sync between tabs (framework ready)

3. **Disconnection**: Close browser tab/window
   - User disappears from CollabToolbar in other tabs
   - Yjs room destroyed when all clients disconnect

## What's Implemented

✅ **Core Collab Infrastructure**
- Yjs provider with WebSocket
- User presence/awareness
- Real-time sync between EditorJS and Yjs

✅ **UI Components**
- CollabToolbar (presence, suggestion mode toggle)
- Comments (add/resolve/delete UI)
- SuggestionMode (pending/accepted/rejected UI)

✅ **Suggestion Mode**
- Toggle on/off
- Track suggestions (insert/delete/modify)
- Accept/reject UI with status tracking

⚠️ **Comments (Partial)**
- Comment UI components ready
- Yjs map scaffolding in place
- Need: API integration, persistence to database

⚠️ **Cursors/Selection (Not Yet)**
- Awareness framework ready
- UI components needed for visual cursor/selection indicators

## Next Steps (Phase 1.5 - Polish)

1. **Persist Comments**: Add API endpoints for saving/loading comments
2. **Visual Cursors**: Render remote user cursors on document
3. **Activity Log**: Track who edited what and when
4. **Conflict Resolution**: Handle simultaneous edits gracefully
5. **Offline Support**: Queue changes when disconnected, sync on reconnect

## Known Limitations

- **In-Memory Rooms**: Yjs data lost on server restart (dev only)
- **No Persistence**: Suggestions/comments not saved to database yet
- **No Access Control**: All connected users can edit/comment
- **No History**: Suggestions/comments not persisted between sessions

## Files Modified/Created

**New:**
- `src/collab/yjs-provider.ts`
- `src/collab/useYjsDoc.ts`
- `src/collab/awareness.ts`
- `src/collab/comments.ts`
- `src/components/Editor/CollabToolbar.tsx`
- `src/components/Editor/Comments.tsx`
- `src/components/Editor/SuggestionMode.tsx`
- `scripts/yjs-websocket-server.js`
- `docs/ARCHITECTURE-collab-phase1.md`

**Modified:**
- `src/components/Editor/NotionEditor.tsx` (Yjs integration, CollabToolbar, SuggestionPanel)
- `src/app/(dashboard)/documents/[id]/page.tsx` (pass docId, user to editor)
- `package.json` (Yjs dependencies, dev script with concurrently)
- `.env.local.example` (Yjs WebSocket URL)

## Troubleshooting

**Q: WebSocket connection fails**
A: Ensure Yjs server is running (`npm run dev` starts it automatically). Check `NEXT_PUBLIC_YJS_WS_URL` env var.

**Q: Edits not syncing between tabs**
A: Check browser console for errors. Verify both tabs are on same document ID. Try hard-refresh.

**Q: Comments panel shows but no sync**
A: Comments UI is ready but backend not integrated yet. See "Next Steps" above.

**Q: Suggestion mode doesn't persist**
A: Suggestions stored in memory only. Restart to clear. Integration with database pending.
