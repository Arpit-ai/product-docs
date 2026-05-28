# Phase 1: Real-Time Collaboration & Comments — Architecture Plan

## 1. Real-Time Collaborative Editing
- Use **Yjs** (https://yjs.dev/) for CRDT-based real-time sync
- Integrate with EditorJS via [yjs/y-websocket](https://github.com/yjs/y-websocket)
- Add a WebSocket server (Node.js, can run as a separate service or in-process)
- Each document gets a Yjs room (doc ID)
- Sync document content, block order, and block data

## 2. Live Cursors & Selections
- Use Yjs awareness protocol to broadcast user presence
- Show colored cursors/avatars for each connected user
- Show selection highlights for text/blocks

## 3. Inline Comments
- Add a Yjs-shared comments map per document
- UI: Add comment button to each block (or text selection)
- Store comment thread (text, author, timestamp, resolved state)
- Render comment threads in sidebar or as popovers

## 4. Suggestion Mode
- Toggle suggestion mode (UI button)
- Edits are tracked as suggestions (Yjs sub-doc or metadata)
- Accept/reject suggestions (merge or discard changes)

## 5. Auth & Permissions
- Use existing JWT auth for user identity
- Only authenticated users can edit/comment
- Viewer role: can see live updates, but not edit

## 6. Dependencies
- `yjs`, `y-websocket`, `y-protocols`
- `@editorjs/editorjs` (already present)
- (Optional) `react-yjs` or custom hooks for Yjs state

## 7. File/Module Plan
- `collab/` — new folder for Yjs logic
  - `collab/yjs-provider.ts` — Yjs WebSocket provider setup
  - `collab/useYjsDoc.ts` — React hook for Yjs doc state
  - `collab/awareness.ts` — user presence/cursor logic
  - `collab/comments.ts` — shared comments model
- `components/Editor/CollabToolbar.tsx` — UI for presence, suggestion mode, etc.
- Update `NotionEditor.tsx` to support collaborative mode

## 8. Rollout Steps
1. Add Yjs and WebSocket server
2. Integrate Yjs with EditorJS (block sync)
3. Add awareness (cursors, avatars)
4. Add inline comments (UI + Yjs map)
5. Add suggestion mode (UI + Yjs sub-doc)
6. Permissions: restrict editing to allowed users
7. Polish UI, test with multiple users

---

**Next:** I will scaffold the collab/ folder, add dependencies, and start with Yjs provider and WebSocket server setup.