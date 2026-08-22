# FlowBoard Pro

**Production-ready full-stack Kanban project management application.**

Built with **Angular 19**, **NestJS 11**, **Neon (Postgres)**, **Prisma**, and **Tailwind CSS**.

## Features

- JWT Authentication (register/login)
- Workspaces with roles
- Kanban Boards (columns + cards)
- Priorities, due dates, assignees, comments
- Modern Tailwind UI
- Swagger API docs at `/docs`

## Quick Start

### Prerequisites
- Node.js 20+
- Free Neon Postgres: https://neon.tech

### Setup

```bash
git clone https://github.com/Criscode2022/flowboard-pro.git
cd flowboard-pro

cd api && npm install
cp .env.example .env
# Edit .env with your Neon DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npx prisma generate
npm run start:dev

# New terminal
cd web && npm install && npm start
```

- Frontend: http://localhost:4200
- API: http://localhost:3000
- Swagger: http://localhost:3000/docs

Register an account → personal workspace + sample board is created automatically.

## Architecture

```
api/   NestJS 11 + Prisma 5 + JWT Auth
web/   Angular 19 standalone + Tailwind 3
```

## License
MIT
