# Expense Tracker

Full-stack family expense tracker with a React frontend and an Express/Prisma backend.

## Apps

- `Frontend`: Vite, React, TypeScript, Tailwind CSS
- `Backend`: Express, Prisma, SQLite, JWT auth

## Local Setup

```bash
cd Backend
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

```bash
cd Frontend
npm install
npm run dev
```

Seeded admin login:

```text
username: admin
password: admin
```
