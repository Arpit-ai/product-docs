# Deployment Guide — Product Docs

Self-hosted deployment for **internal team documentation** (private wiki) with a professional Notion-style editor. All routes require authentication except `/login` and `/register` (when enabled).

## Documentation index

| File | Purpose |
|------|---------|
| [README.md](README.md) | Features, API, development |
| [QUICKSTART.md](QUICKSTART.md) | Local setup in minutes |
| [FIXES.md](FIXES.md) | Recent fixes and known gaps |
| [.env.example](.env.example) | Environment template |

---

## Prerequisites

- **Docker:** Docker Engine 20+ and Docker Compose v2, **or**
- **Bare metal:** Node.js **20+**, npm 9+
- **Resources:** 2 GB RAM minimum; disk for SQLite DB and `public/uploads/`
- **Network:** Port **3000** (app) and optionally 80/443 (nginx)

> Avoid deploying from paths with spaces or backslashes; they can break Node/npm on some hosts.

---

## Environment variables

Copy the template and edit:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` (SQLite) or PostgreSQL URL |
| `JWT_SECRET` | Yes | Min 32 chars; `openssl rand -base64 32` |
| `JWT_EXPIRATION` | No | Default `7d` |
| `ALLOW_PUBLIC_REGISTRATION` | No | Default **on** unless set to `false` |
| `NODE_ENV` | No | `production` in deploy |

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="<generated-secret>"
JWT_EXPIRATION="7d"
ALLOW_PUBLIC_REGISTRATION="false"
NODE_ENV="production"
```

**Production:** Set `ALLOW_PUBLIC_REGISTRATION=false` after the admin account exists. The **first** registered user becomes **Admin**; later users are **Viewer** unless you change roles in the database.

---

## Option A — Docker Compose (recommended)

### 1. Prepare

```bash
cd product-docs
cp .env.example .env
# Edit .env — set JWT_SECRET (required; app will not start without it)
```

### 2. Start (app only)

```bash
docker compose up -d --build
```

App: [http://localhost:3000](http://localhost:3000)

The container runs `prisma db push` on startup if migrations are not present, then `npm start`.

### 3. First admin user

1. Open `/register`
2. Create the first account → **Admin**
3. Disable open registration in `.env`: `ALLOW_PUBLIC_REGISTRATION=false`
4. Restart: `docker compose restart app`

### 4. Logs and lifecycle

```bash
docker compose logs -f app
docker compose ps
docker compose restart app
docker compose down
```

### 5. Optional nginx reverse proxy

An example config is in [nginx.conf.example](nginx.conf.example). Enable the nginx service:

```bash
# Copy and edit nginx config + TLS certs into ./certs/
cp nginx.conf.example nginx.conf
docker compose --profile with-nginx up -d
```

---

## Option B — Traditional (Node.js)

### 1. Install and database

```bash
cd product-docs
cp .env.example .env
# Set JWT_SECRET in .env

npm install
npx prisma generate
npx prisma migrate dev --name init   # first time only
# Or if no migrations yet: npx prisma db push
```

### 2. Build and run

```bash
npm run build
npm start
```

Development:

```bash
npm run dev
```

### 3. Process manager (systemd)

Create `/etc/systemd/system/product-docs.service`:

```ini
[Unit]
Description=Product Docs
After=network.target

[Service]
Type=simple
User=docs
WorkingDirectory=/opt/product-docs
EnvironmentFile=/opt/product-docs/.env
ExecStartPre=/usr/bin/npx prisma migrate deploy
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable product-docs
sudo systemctl start product-docs
```

---

## Production security checklist

- [ ] Strong unique `JWT_SECRET` (never commit `.env`)
- [ ] `ALLOW_PUBLIC_REGISTRATION=false` after admin exists
- [ ] HTTPS in front of the app (nginx/Caddy/Traefik)
- [ ] Secure cookies: `NODE_ENV=production` (sets `secure` on auth cookie)
- [ ] Firewall: restrict access to VPN or internal network if possible
- [ ] Automated backups (DB + `public/uploads/`)
- [ ] Replace in-memory rate limiter with Redis for multi-instance setups

### Authentication model

- Sessions use **httpOnly** `auth-token` cookies (7-day JWT).
- API routes accept **cookie** or `Authorization: Bearer <token>`.
- Roles: **Admin** (users + activity), **Editor** (CRUD), **Viewer** (read-only).

### Rate limits (in-memory)

| Endpoint | Limit |
|----------|-------|
| Login | 5 / minute / IP |
| Register | 3 / minute / IP |

---

## Database

### SQLite (default)

- File: `prisma/dev.db` (bind-mounted in Docker)
- Suitable for small teams and &lt; ~10k documents
- Backup: copy the file while app is stopped or use SQLite backup tools

```bash
cp prisma/dev.db "prisma/backups/dev.db.$(date +%Y%m%d-%H%M%S)"
```

### PostgreSQL (scale)

1. Set `DATABASE_URL` to your Postgres connection string.
2. Change `provider` in `prisma/schema.prisma` to `postgresql` if needed.
3. Run:

```bash
npx prisma migrate deploy
```

### Migrations

If the repo has no `prisma/migrations` yet:

```bash
npx prisma migrate dev --name init
```

Commit the generated migration before production deploys.

---

## Backups

### What to back up

| Path | Contents |
|------|----------|
| `prisma/dev.db` | All users, documents, versions, activity |
| `public/uploads/` | Uploaded images |

### Docker backup script example

```bash
#!/bin/bash
BACKUP_DIR="/backups/product-docs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"

docker compose cp app:/app/prisma/dev.db "$BACKUP_DIR/dev.db.$TIMESTAMP"
tar -czf "$BACKUP_DIR/uploads.$TIMESTAMP.tar.gz" public/uploads 2>/dev/null || true

find "$BACKUP_DIR" -name "dev.db.*" -mtime +30 -delete
```

Cron: `0 2 * * * /path/to/backup.sh`

### Restore

```bash
docker compose down
cp /backups/product-docs/dev.db.TIMESTAMP prisma/dev.db
docker compose up -d
```

---

## Nginx reverse proxy

See [nginx.conf.example](nginx.conf.example). Important headers for Next.js behind a proxy:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
client_max_body_size 10M;
```

Upload limit in the app: **10 MB** per image (`/api/media/upload`).

---

## Performance and scaling

| Scale | Recommendation |
|-------|----------------|
| &lt; 100 docs | SQLite, single container |
| 100–10k docs | PostgreSQL, monitor disk |
| 10k+ docs | Postgres + FTS (Meilisearch/Postgres FTS), CDN for uploads, Redis for rate limits |

**Not implemented today:** document caching layer, CDN integration, horizontal app replicas with shared upload storage (plan before scaling out).

---

## Upgrading

```bash
# 1. Backup
cp prisma/dev.db prisma/dev.db.pre-upgrade

# 2. Pull and rebuild
git pull
docker compose down
docker compose up -d --build

# 3. Migrate
docker compose exec app npx prisma migrate deploy
```

Bare metal: `npm install && npm run build && npx prisma migrate deploy && npm start`

---

## Troubleshooting

### App exits immediately / won't start

- **Missing `JWT_SECRET`** — required; set in `.env` or compose `environment`.
- Check logs: `docker compose logs app`

### 401 on API calls after login

- Cookie auth requires `credentials: "include"` in browser (already wired in UI).
- Ensure same host/port for app and API (no mixed origins without CORS setup).

### `npm install` fails locally

- Move project to a path **without spaces** (e.g. `~/product-docs`).

### Port 3000 in use

```bash
lsof -i :3000
# Or change ports in docker-compose.yml: "3001:3000"
```

### Database schema out of date

```bash
npx prisma migrate deploy
# or
npx prisma db push
```

### nginx compose fails

- nginx is **optional** (`--profile with-nginx`). Default `docker compose up` runs **app only**.
- Provide `nginx.conf` from `nginx.conf.example` before enabling the profile.

### High memory / disk

- Archive old documents (status `ARCHIVED`)
- Check `du -sh prisma/dev.db public/uploads`

---

## Health checks

Docker healthcheck hits `http://localhost:3000`. Root `/` redirects to `/login` or `/documents` (302) — curl may need `-L` for a 200.

---

## Support

- Application logs: `docker compose logs -f app` or `journalctl -u product-docs`
- Database GUI: `npx prisma studio`
- Code changes log: [FIXES.md](FIXES.md)

---

**Last updated:** 2026-05-22
