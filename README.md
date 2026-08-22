# FlowBoard Pro

**Production-ready full-stack Kanban project management application.**

Built with **Angular 19** · **NestJS 11** · **Neon Postgres** · **Prisma 5** · **Tailwind CSS 3**

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular)](https://angular.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)](https://nestjs.com)
[![Neon](https://img.shields.io/badge/Neon-Postgres-00E699)](https://neon.tech)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## Live problem it solves

Teams need a simple, fast Kanban tool that is:
- Self-hostable or deployable to free tiers
- Backed by real Postgres (not localStorage)
- Ready for real auth and multi-workspace collaboration

FlowBoard delivers that with a clean modern UI and a production NestJS API.

## Features

| Feature | Status |
|---------|--------|
| JWT register / login | ✅ |
| Personal workspace auto-created on signup | ✅ |
| Multi-workspace support | ✅ |
| Kanban boards with columns | ✅ |
| Cards with priority, due date, assignee | ✅ |
| Comments on cards | ✅ |
| Tailwind + Inter modern UI | ✅ |
| Swagger docs at `/docs` | ✅ |
| Prisma schema for Neon | ✅ |

## Architecture

```
flowboard-pro/
├── api/                     # NestJS 11 API
│   ├── prisma/schema.prisma
│   └── src/
│       ├── auth/            # JWT + bcrypt
│       ├── workspaces/
│       ├── boards/
│       ├── cards/
│       └── prisma/
└── web/                     # Angular 19 standalone
    └── src/app/
        ├── core/            # services, guards, interceptors
        └── features/        # auth, dashboard, board
```

## Quick start

### 1. Neon database

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the connection string

### 2. Backend

```bash
cd api
npm install
cp .env.example .env
# Edit .env → set DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npx prisma generate
npm run start:dev
# → http://localhost:3000
# → Swagger: http://localhost:3000/docs
```

### 3. Frontend

```bash
cd web
npm install
npm start
# → http://localhost:4200
```

### 4. Use it

1. Open http://localhost:4200
2. Register → a personal workspace + “Getting Started” board is created
3. Create boards, add cards, set priorities

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Login |
| GET | `/api/workspaces` | JWT | List workspaces |
| POST | `/api/workspaces` | JWT | Create workspace |
| GET | `/api/boards/:id` | JWT | Full board + columns + cards |
| POST | `/api/boards` | JWT | Create board |
| POST | `/api/cards` | JWT | Create card |
| PATCH | `/api/cards/:id` | JWT | Update card |
| POST | `/api/cards/:id/move` | JWT | Move card |
| DELETE | `/api/cards/:id` | JWT | Delete card |
| POST | `/api/cards/:id/comments` | JWT | Add comment |

## Deploy

**API** (Railway / Render / Fly.io):
- Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`
- `npm run build && npm run start:prod`
- `npx prisma migrate deploy`

**Web** (Vercel / Netlify / Cloudflare Pages):
- `cd web && npm run build`
- Deploy `dist/web/browser`
- Point `apiUrl` in production environment to your API (or use a reverse proxy)

## Tech choices

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Angular 19 standalone + signals | Modern, typed, excellent structure |
| Styling | Tailwind 3 | Fast, consistent design system |
| Backend | NestJS 11 | DI, modules, Swagger, enterprise patterns |
| ORM | Prisma 5 | Type-safe, excellent Neon support |
| DB | Neon Postgres | Serverless, free tier, branching |
| Auth | JWT + Passport + bcrypt | Stateless and secure |

## License

MIT

---

Built to be ambitious, useful, and production-oriented.
