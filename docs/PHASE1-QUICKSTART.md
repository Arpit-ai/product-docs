# Phase 1 Collaboration — Quick Start & Testing Guide

## 🚀 Start Development

```bash
# Terminal 1: This starts both Next.js and Yjs server
npm run dev

# The server output will show:
# - Next.js listening on http://localhost:3000
# - Yjs WebSocket server running on ws://localhost:1234
```

## 🧪 Test Real-Time Collaboration

### Single User
1. Navigate to `http://localhost:3000/login` and login
2. Go to Documents and create a new document
3. Start typing in the editor
4. Notice in the editor header: CollabToolbar shows your user
5. Toggle "Suggestion Mode: ON" button
6. See the suggestion panel appear on the right

### Multi-User (2 Tabs/Windows)
1. **Tab A**: Open document in first browser tab/window
2. **Tab B**: Open the **same** document in another tab
   - Both tabs connect to the same Yjs room (by document ID)
3. **Tab A**: Type text → **Tab B** sees it appear in real-time
4. **Tab B**: Type text → **Tab A** sees it immediately
5. Both tabs show both users in CollabToolbar

### Test Suggestion Mode
1. **Tab A**: Toggle "Suggestion Mode: ON"
2. Make edits in **Tab A**
3. **Tab A**: See suggestion panel on right with pending suggestions
4. **Tab B**: Also shows suggestions synced in real-time
5. Click "Accept" or "Reject" in either tab
6. Status updates across all tabs

### Test Presence/Disconnect
1. **Tab A & B**: Both editing document
2. Both users visible in CollabToolbar
3. **Close Tab B**: Browser tab closes
4. **Tab A**: User from Tab B disappears from CollabToolbar
5. Yjs room automatically cleaned up when all clients disconnect

## 📝 Comments (Framework Ready)

- Comment UI components visible (button on blocks)
- Click "💬" to open comment thread
- Add comments (UI functional)
- **Note**: Comment storage not yet connected to database
- Comments sync between tabs via Yjs, but lost on page refresh

## 🔧 Common Issues & Fixes

**WebSocket not connecting?**
```
Check browser console (F12 → Console)
If "ws://localhost:1234 refused"
→ Make sure npm run dev is running
→ Restart both services
```

**Edits not syncing?**
```
1. Verify both tabs have same document ID in URL
2. Hard refresh browser (Cmd+Shift+R on Mac)
3. Check Network tab → WS filter for WebSocket status
4. Both tabs should show ws://localhost:1234 as ESTABLISHED
```

**User doesn't disappear when tab closes?**
```
Reload the other tab to refresh presence list
(Automatic presence sync is in Phase 1.5)
```

**Suggestions not persisting after refresh?**
```
Expected behavior — suggestions stored in-memory only
Database persistence coming in Phase 2
```

## 📊 What's Working

| Feature | Status | Notes |
|---------|--------|-------|
| Real-time sync | ✅ | Yjs bidirectional sync working |
| User presence | ✅ | Shows connected users in toolbar |
| Suggestion mode | ✅ | UI fully functional |
| Accept/reject | ✅ | Status tracking works |
| Comments UI | ✅ | Components ready, no persistence |
| Multi-user editing | ✅ | Edits sync across tabs |

## 🎯 What's Coming (Phase 1.5+)

- [ ] Visual remote cursors on document
- [ ] Comments persistence to database
- [ ] Activity log for collaborative events
- [ ] Offline editing with sync queue
- [ ] Read-only mode for viewers
- [ ] Comment notifications

## 🧑‍💻 Dev Notes

### Architecture
- **Yjs**: Shared data structure (CRDT) for conflict-free sync
- **y-websocket**: Real-time sync transport
- **Awareness**: Built-in presence protocol (who's online)
- **EditorJS**: Blocks sync with Yjs Y.Text

### How It Works
1. Editor changes fire `onChange` callback
2. Content JSON serialized and pushed to `Yjs Y.Text`
3. Yjs broadcasts delta to all connected clients
4. Remote clients receive updates and re-render editor
5. Bidirectional: prevents infinite loops with ignore flags

### File Structure
```
src/
  collab/
    yjs-provider.ts      # Yjs + WebSocket setup
    awareness.ts         # User presence
    comments.ts          # Comments model
    useYjsDoc.ts         # React hook
  components/Editor/
    NotionEditor.tsx     # Integrated Yjs sync
    CollabToolbar.tsx    # User presence + modes
    Comments.tsx         # Comment thread UI
    SuggestionMode.tsx   # Suggestion panel UI
scripts/
  yjs-websocket-server.js  # WebSocket server
package.json             # Scripts with concurrently
```

## 📚 Resources

- [Yjs Documentation](https://docs.yjs.dev/)
- [y-websocket GitHub](https://github.com/yjs/y-websocket)
- [CRDT Explained](https://crdt.tech/)
- [Phase 1 Architecture](./ARCHITECTURE-collab-phase1.md)
- [Full Implementation Guide](./PHASE1-IMPLEMENTATION.md)
