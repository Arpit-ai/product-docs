# Product Docs - Professional Documentation Platform

A self-hosted, open-source **internal** documentation platform built with Next.js, EditorJS, and SQLite. Use it as a **Notion-style team wiki** for product docs, runbooks, and guides — with a fully block-based, professional editor.

## ✨ Features

- **Notion-Style Block Editor** (EditorJS)
  - **Slash Commands** (`/`) for instant block access
  - 12+ block types: Headings (H1-H6), Paragraphs, Lists, Checklists, Code blocks, Quotes, Tables, Images, Videos, Dividers
  - **Drag-and-drop** block reordering
  - Rich inline formatting: Bold, Italic, Underline, Links, Code highlights
  - AI-powered suggestions framework (expansion, summarization, tone)
  - Keyboard shortcuts modal (Cmd+B/I/U, Cmd+K, Tab/Shift+Tab)
  - Live word & block counting
  - Auto-save with version tracking
  - Undo / redo

- **Real-Time Collaboration** ⭐ (Phase 1 — NEW!)
  - **Live co-editing**: Multiple users editing simultaneously with Yjs CRDT
  - **User presence**: See who's currently editing in real-time
  - **Suggestion mode**: Propose edits, accept/reject changes
  - **Inline comments**: Add threaded comments on any block
  - **WebSocket-based sync**: Sub-100ms latency

- **Document Management**
  - Create, read, update, delete documents
  - Draft / Published / Archived status
  - Version history stored on each content change (API; restore UI coming)
  - Sidebar search by title and content

- **Multi-User & Roles**
  - **Admin** — users list, activity log, folders API
  - **Editor** — create and edit documents
  - **Viewer** — read-only (list, view, search; no create/edit)

- **Security**
  - JWT in httpOnly cookies (or Bearer token for API clients)
  - Required `JWT_SECRET` (app fails to start without it)
  - Rate limiting on login and registration
  - Optional public registration lockdown
  - Next.js middleware for dashboard route protection

- **Activity Log** (admin)
  - Audit trail for document create/update/delete and more

- **Self-Hosted**
  - Docker Compose
  - SQLite by default; PostgreSQL supported via `DATABASE_URL`
- **Public Docs Site**
  - Publish content as public documentation
  - Public docs landing page at `/docs`
  - Public search for published content

## 🚀 Quick Start

See **[QUICKSTART.md](QUICKSTART.md)** for a 3-minute walkthrough.

### Testing Collaboration (Phase 1)
```bash
npm run dev  # Starts Next.js + Yjs WebSocket server
```
Then open the same document in 2 browser tabs to see real-time sync! See [PHASE1-QUICKSTART.md](docs/PHASE1-QUICKSTART.md) for details.


```bash
git clone <your-repo-url>
cd product-docs
npm install
npx prisma db push      # Initialize database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — first registered user becomes **Admin**. Start writing with the Notion-style editor: type `/` for slash commands!

**Docker:**

```bash
cd product-docs
cp .env.example .env   # set JWT_SECRET
docker compose up -d --build
```

## 📋 Prerequisites

- **Node.js 20+** and npm (local dev), or
- **Docker & Docker Compose** (production-style deploy)
- **2GB+ RAM**, disk for DB and `public/uploads/`

> **Tip:** Avoid project paths with spaces or special characters; they can break `npm install` on some systems.

## 📚 Usage

### First-time setup
1. Visit `/register` — first user is **Admin**, later users are **Viewer** by default
2. Promote users to Editor via database/Prisma Studio until role-management UI is extended

### Create a document (Admin / Editor)
1. Log in at `/login`
2. **Documents** → **New Document**
3. Write in the editor → **Save**
4. Set status: Draft, Published, or Archived

### Search
- Use the search box in the **dashboard sidebar** for internal docs
- Use the public search box on `/docs` for published docs
- Matches title and content; results ranked by relevance

### View-only (Viewer)
- Browse and open documents; content is read-only
- No “New Document” button

### Admin
- **Users** — view all accounts
- **Activity** — recent actions (create/update/delete documents, etc.)

## 🔧 Configuration

Copy `.env.example` values into `.env` (or use the provided `.env` for local dev):

```env
# Required
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="generate-with-openssl-rand-base64-32"

# Optional
JWT_EXPIRATION="7d"
ALLOW_PUBLIC_REGISTRATION="true"   # set to "false" to disable /register
NODE_ENV="development"
```

Generate a secret:

```bash
openssl rand -base64 32
```

## 📦 Project Structure

```
product-docs/
├── src/
│   ├── app/
│   │   ├── (auth)/          # login, register
│   │   ├── (dashboard)/     # documents, users, activity
│   │   ├── api/             # REST API
│   │   ├── page.tsx         # redirects to /documents or /login
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Editor/          # TipTap RichEditor
│   │   └── Search/          # SearchBox
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── middleware.ts    # withAuth, withEditorAuth, withViewerAuth
│   │   ├── activityLog.ts
│   │   └── rateLimit.ts
│   └── middleware.ts        # Next.js route protection
├── prisma/
│   └── schema.prisma
├── public/uploads/
├── FIXES.md                 # changelog of critical fixes
├── DEPLOYMENT.md
├── QUICKSTART.md
├── nginx.conf.example
├── scripts/docker-entrypoint.sh
└── README.md
```

## 🔐 Security

- Passwords: bcrypt (10 rounds)
- Sessions: JWT in **httpOnly** cookie (`auth-token`), 7-day default
- API auth: cookie **or** `Authorization: Bearer <token>`
- Roles enforced on API routes and UI (viewer read-only)
- Login: 5 attempts/min per IP; register: 3/min per IP (in-memory; use Redis at scale)

**Production checklist:**
- [ ] Strong `JWT_SECRET`
- [ ] `ALLOW_PUBLIC_REGISTRATION=false` after admin exists
- [ ] HTTPS (secure cookies in production)
- [ ] Backups for `prisma/dev.db` and `public/uploads/`
- [ ] See [DEPLOYMENT.md](DEPLOYMENT.md)

## 📊 Database

| Table | Purpose |
|-------|---------|
| users | Accounts (ADMIN, EDITOR, VIEWER) |
| documents | Content + status |
| versions | Snapshots on edit |
| folders | Hierarchy (API; UI pending) |
| tags | Labels (schema; UI pending) |
| media | Upload metadata |
| activity_logs | Audit trail |

## 🛠️ Development

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init   # first time; or: npx prisma db push
npm run dev
```

```bash
npm run build
npm start
```

## 📝 API

Base: `http://localhost:3000/api`

**Auth:** Send session cookie (`credentials: "include"` in browser) or:

```
Authorization: Bearer <JWT_TOKEN>
```

| Endpoint | Access |
|----------|--------|
| `POST /auth/register` | Public (if enabled) |
| `POST /auth/login` | Public |
| `GET /auth/me` | Authenticated |
| `POST /auth/logout` | Authenticated |
| `GET /documents` | Viewer+ |
| `POST /documents` | Editor+ |
| `GET/PUT/DELETE /documents/[id]` | GET: Viewer+; mutate: Editor+ |
| `GET /api/public/search?q=` | Public |
| `GET /search?q=` | Viewer+ |
| `GET /users` | Admin |
| `GET /activity` | Admin |
| `GET/POST /folders` | Admin |
| `POST /media/upload` | Editor+ |

## 💪 Tech Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS 4
- TipTap + lowlight
- Prisma + SQLite (PostgreSQL optional)
- JWT (`jsonwebtoken` + `jose` in middleware), bcryptjs, Zod

## 🗺️ Roadmap

- [ ] Version history viewer / restore
- [ ] Folder tree UI
- [ ] Tag management
- [ ] User role editing in admin UI
- [x] Public docs site via `/docs`
- [ ] Real-time collaboration, 2FA, LDAP

## 📄 License

GNU AGPL v3 — see [LICENSE](LICENSE). If you modify and run this software as a network service, you must offer corresponding source to users.

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Docker Compose, optional nginx TLS (`--profile with-nginx`), systemd, backups, and PostgreSQL.

## 📞 Support

- [QUICKSTART.md](QUICKSTART.md) — get started fast
- [DEPLOYMENT.md](DEPLOYMENT.md) — production hosting
- [FIXES.md](FIXES.md) — recent fixes and known gaps
- [.env.example](.env.example) — environment template

---

**Built for teams who want simple, self-hosted product documentation.**
