# MentorDesk Backend

Express + PostgreSQL API for MentorDesk: students submit projects, mentors review them. Pairs with the Next.js frontend (`mentor-desk-frontend`).

## Tech stack

Node.js, Express 5, TypeScript, Prisma 7 (`@prisma/adapter-pg`) on PostgreSQL, zod, JWT access and refresh tokens in httpOnly cookies, bcryptjs, express-rate-limit.

## Prerequisites

- Node.js 20+
- pnpm
- A PostgreSQL database

## Setup

```bash
pnpm install
cp .env.example .env
# edit DATABASE_URL, JWT_SECRET and JWT_REFRESH_SECRET in .env
pnpm db:migrate
SEED_DEMO=true pnpm db:seed
pnpm dev
```

API runs on http://localhost:5001, base path `/api/v1`. Check it with `GET /api/v1/health`.

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | `production` turns on secure cookies and hides error stacks. |
| `PORT` | `5001` | HTTP port. |
| `DATABASE_URL` | required | PostgreSQL connection string. |
| `CLIENT_URL` | `http://localhost:3000` | Frontend origin allowed by CORS (with credentials). |
| `BCRYPT_SALT_ROUNDS` | `10` | Password hashing cost (4–15). |
| `JWT_SECRET` | required | Access token signing secret, at least 32 characters. |
| `JWT_EXPIRES_IN` | `15m` | Access token and cookie lifetime. |
| `JWT_REFRESH_SECRET` | required | Refresh token signing secret, at least 32 characters. |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token and cookie lifetime. |
| `SEED_MENTOR_NAME` | `Admin Mentor` | Seeded mentor's name. |
| `SEED_MENTOR_EMAIL` | none | Seeded mentor's email (required to run the seed). |
| `SEED_MENTOR_PASSWORD` | none | Seeded mentor's password, at least 8 characters (required to run the seed). |

The server validates these at startup and exits with a readable error if any are invalid.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start with hot reload (tsx watch) |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run the compiled server |
| `pnpm db:migrate` | Apply migrations (`prisma migrate dev`) |
| `pnpm db:generate` | Regenerate the Prisma client |
| `pnpm db:seed` | Seed the mentor account |
| `pnpm db:reset` | Drop, re-migrate and re-seed the database |

## Accounts

There is no mentor signup. `pnpm db:seed` creates (or promotes) the mentor from `SEED_MENTOR_EMAIL` / `SEED_MENTOR_PASSWORD`. With `.env.example` values that is `mentor@mentordesk.dev` / `Mentor12345`.

Run the seed with `SEED_DEMO=true` to also add demo data:
- Students `alice@mentordesk.dev` and `bob@mentordesk.dev`, password `Student123`
- Four submissions covering pending, approved and rejected

Students create their own accounts through `POST /auth/signup`.

## Authentication

Signup and login set two httpOnly cookies (`SameSite=Lax`, `Secure` in production): a short-lived `accessToken` and a long-lived `refreshToken`. When the access token expires, `POST /auth/refresh` issues a new pair from the refresh cookie. Clients send requests with credentials included. An `Authorization: Bearer <token>` header also works, which is handy for curl or Postman; the token is in the login response body.

## API

All paths are under `/api/v1`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | public | Service and database status |
| POST | `/auth/signup` | public | Create a student account and log in |
| POST | `/auth/login` | public | Log in (student or mentor) |
| POST | `/auth/refresh` | refresh cookie | Rotate access and refresh tokens |
| POST | `/auth/logout` | public | Clear the auth cookies |
| GET | `/auth/me` | logged in | Current user |
| POST | `/submissions` | student | Create a submission |
| GET | `/submissions/me` | student | Own submissions, newest first |
| PATCH | `/submissions/:id/resubmit` | student | Edit and resubmit a rejected submission (back to pending) |
| GET | `/submissions` | mentor | List all submissions with filters and pagination |
| GET | `/submissions/stats` | mentor | Counts: `total`, `pending`, `approved`, `rejected` |
| PATCH | `/submissions/:id/review` | mentor | Approve or reject, with feedback |

### Request rules

- **Signup:** `name` 2–50 characters; valid `email`; `password` at least 6 characters with a letter and a number.
- **Submission** (create and resubmit): `projectName` 3–100 characters; `repoUrl` must be `https://github.com/<owner>/<repo>`; `liveUrl` must be http(s); `description` 20–1000 characters. All values are trimmed.
- **Duplicates:** a repository can be submitted only once across all students (URL compared case-insensitively, ignoring `www.`, a trailing slash and `.git`). A student cannot have two projects with the same name (case-insensitive). Both return `409` with a field error.
- **Resubmit:** only the owner's `REJECTED` submissions; clears the previous review.
- **List query:** `status` = `ALL|PENDING|APPROVED|REJECTED` (default `ALL`), `page` ≥ 1, `limit` 1–50 (default 10), `search` matches project name or student email (case-insensitive). Rows include `student { id, name, email }` and `reviewedBy { id, name }`.
- **Review body:** `{ status: "APPROVED" | "REJECTED", feedback?: string }`. Feedback is at most 500 characters and required when rejecting. A decision can be changed later.

### Rate limits

| Routes | Limit |
|---|---|
| `POST /auth/signup`, `POST /auth/login` | 10 requests per 15 minutes per IP |
| `POST /submissions`, `PATCH /submissions/:id/resubmit` | 5 successful submissions per 15 minutes per student |

Exceeding a limit returns `429`.

### Response format

Success:

```json
{ "success": true, "message": "…", "data": {}, "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```

`meta` only appears on the paginated list.

Error:

```json
{ "success": false, "message": "Validation failed", "errors": { "repoUrl": "Must be a GitHub repo URL (https://github.com/owner/repo)" } }
```

`errors` maps field names to messages and appears on validation (`400`) and duplicate (`409`) errors. Other statuses: `401` not logged in or bad credentials, `403` wrong role, `404` not found, `429` rate limited.

## Project structure

```
src/
  server.ts                 starts the server, graceful shutdown
  app.ts                    Express app: CORS, JSON, cookies, routes, error handling
  app/
    config/                 env validation
    middlewares/            auth, validation, rate limits, not-found, error handler
    errors/                 AppError, zod and Prisma error mapping
    modules/
      auth/                 signup, login, refresh, logout, me
      submission/           create, list, stats, resubmit, review
      health/
    utils/                  jwt, password hashing, response helpers
  prisma/
    schema.prisma, model/   User, Submission, enums
    migrations/
    seed.ts
```
