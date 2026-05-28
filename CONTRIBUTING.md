# Contributing to Product Docs

Thank you for your interest in contributing. This project is licensed under the [GNU AGPL v3](LICENSE).

## Development setup

```bash
git clone <your-fork-url>
cd product-docs
cp .env.example .env
# Set JWT_SECRET in .env (openssl rand -base64 32)

npm install
npx prisma db push   # or: npx prisma migrate dev --name init
npm run dev
```

Use a project path **without spaces** if `npm install` fails on your machine.

## Before submitting a PR

1. Test login, document CRUD, and search locally.
2. Do not commit `.env`, database files, or `public/uploads/*` (only `.gitkeep`).
3. If you change the schema, include a Prisma migration or document `db push` steps in the PR.
4. AGPL: modifications used over a network must share corresponding source with users.

## Code style

- TypeScript, Next.js App Router conventions
- Match existing patterns in `src/lib/` and API routes
- Run `npm run lint` when available

## Questions

Open a GitHub issue for bugs and feature requests.
