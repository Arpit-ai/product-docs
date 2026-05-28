# Product Docs - Quick Start Guide

Get Product Docs running in a few minutes.

## 🚀 Start the App

### Option 1: Docker

```bash
cd product-docs
cp .env.example .env
# Edit .env — set JWT_SECRET (required)
docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000)

### Option 2: Local development (Node.js 20+)

```bash
cd product-docs
npm install
npx prisma generate
npx prisma migrate dev --name init   # or: npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> Use a folder path **without spaces** if `npm install` fails (e.g. `~/product-docs`).

## 👤 Create the First User (Admin)

1. Go to [http://localhost:3000/register](http://localhost:3000/register)
2. Fill in:
   - **Name:** `Admin`
   - **Email:** `admin@example.com`
   - **Password:** at least 8 characters
3. Click **Sign up**

The **first** account is automatically **Admin**. Everyone who registers after that is a **Viewer** (read-only) until you change their role in the database.

## 🔐 Environment (required)

Create or edit `.env` in the project root:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="paste-output-of-openssl-rand-base64-32"
JWT_EXPIRATION="7d"
ALLOW_PUBLIC_REGISTRATION="true"
```

Generate `JWT_SECRET`:

```bash
openssl rand -base64 32
```

Without `JWT_SECRET`, the app will not start.

To **disable** open registration after you have an admin:

```env
ALLOW_PUBLIC_REGISTRATION="false"
```

## 📝 Create Your First Document

1. You should land on **Documents** (or go to `/documents`)
2. Click **New Document** (Admin and Editor only)
3. Title: e.g. `Getting Started`
4. Click **Create Document**
5. Write in the editor; use the toolbar for formatting
6. Click **Save**
7. Change status to **Published** when ready

## 🔍 Search

- Use the **search box in the left sidebar**
- Type at least 2 characters
- Click a result to open that document

## 👥 Roles at a Glance

| Role | Can do |
|------|--------|
| **Admin** | Everything + Users + Activity log |
| **Editor** | Create, edit, delete documents |
| **Viewer** | Read documents and search only |

## 👤 Add Team Members

1. Share the app URL
2. Teammates register at `/register` (if `ALLOW_PUBLIC_REGISTRATION=true`)
3. New users default to **Viewer**
4. To make someone an Editor, update their role in Prisma Studio:

```bash
npx prisma studio
```

Open the `users` table → set `role` to `EDITOR` or `ADMIN`.

## 🎨 Editor Toolbar

- **B / I / S** — bold, italic, strikethrough
- **H1–H3** — headings
- **Lists** — bullet and numbered
- **<>** — code block (syntax highlighting)
- **Image / Link / YouTube** — prompts for URL
- **Quote / Divider** — blockquote, horizontal rule
- **Undo / Redo**

## 📊 Admin Pages

- **Users** (`/users`) — list all accounts
- **Activity** (`/activity`) — who did what and when

## ⚙️ Stop / Restart

**Docker:**

```bash
docker compose down      # stop
docker compose up -d     # start
docker compose logs -f   # logs
```

**Local:**

```bash
# Ctrl+C to stop, then:
npm run dev
```

## ✅ What's Working Now

| Area | Status |
|------|--------|
| Login / register (httpOnly cookies) | ✅ |
| Dashboard routes + middleware | ✅ |
| Document CRUD | ✅ |
| Viewer read-only mode | ✅ |
| Sidebar search | ✅ |
| User list (admin) | ✅ |
| Activity log (admin) | ✅ |
| Rate limiting (login/register) | ✅ |
| Version snapshots on save | ✅ (no restore UI yet) |
| Folder / tag UI | ⏳ API only |
| Public docs website | ❌ internal tool only |

## 🆘 Troubleshooting

**`npm install` fails**
- Move the project to a path without spaces (e.g. `~/product-docs`)

**Can't log in after register**
- Ensure `JWT_SECRET` is set in `.env`
- Enable cookies in the browser
- Try clearing site data for localhost

**Documents list empty / 401 errors**
- Log out and log in again
- Confirm `JWT_SECRET` matches what was used when the token was issued

**Viewer can't create documents**
- Expected — promote role to `EDITOR` in Prisma Studio

**Database issues after pull**

```bash
npx prisma migrate dev
```

## 📚 More Documentation

- **[README.md](README.md)** — full overview, API, configuration
- **[DEPLOYMENT.md](DEPLOYMENT.md)** — production, Docker, backups, HTTPS, nginx
- **[FIXES.md](FIXES.md)** — recent fixes and remaining TODOs
- **[.env.example](.env.example)** — environment template

## 🚀 You're Ready

Open [http://localhost:3000](http://localhost:3000), sign up as admin, and create your first document.

**Happy documenting!**
