# Family Expense Tracker API

REST API for the React family expense tracker frontend.

## Stack

- Node.js + Express.js
- Prisma ORM
- SQLite for local development (`DATABASE_URL="file:./dev.db"`)
- JWT authentication
- bcrypt password hashing
- Zod request validation
- CORS allowlist for local and Vercel frontend origins

## Setup

```bash
cd Backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

Seeded admin login:

```text
username: admin
password: admin
```

## Response Shape

All successful responses use:

```json
{
  "success": true,
  "data": {},
  "message": "optional message"
}
```

Errors use the same envelope with `success: false`.

## Endpoints

### Auth

- `POST /api/auth/login`

Body:

```json
{
  "username": "maya",
  "password": "admin123"
}
```

The login handler also accepts `identifier` for compatibility with the current frontend.

### Users

- `GET /api/users` admin only
- `GET /api/users/:id` authenticated users can view any profile
- `POST /api/users` admin only
- `PUT /api/users/:id` self or admin, no role changes
- `DELETE /api/users/:id` admin only

Password updates require:

```json
{
  "oldPassword": "current-password",
  "newPassword": "new-password"
}
```

### Expenses

- `GET /api/expenses`
- `GET /api/expenses/:id`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

Users can only access their own expenses. Admins can list all expenses with:

```text
GET /api/expenses?all=true
```

Filters:

- `startDate`
- `endDate`
- `category`
- `type`

Expense categories:

- `Food`
- `Transport`
- `Shopping`
- `Bills`
- `Entertainment`
- `Health`
- `Other`

Expense types:

- `CREDIT`
- `DEBIT`

Lowercase `credit` and `debit` are accepted and normalized.

### Analytics

- `GET /api/analytics/daily`
- `GET /api/analytics/monthly`
- `GET /api/analytics/summary`
- `GET /api/admin/analytics/all-users` admin only

## Frontend CORS

Set comma-separated allowed origins in `.env`:

```text
FRONTEND_ORIGIN="http://localhost:5173,https://your-frontend.vercel.app"
```
