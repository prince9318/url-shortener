# TinyLink

TinyLink is a minimal, self-hostable link shortener built with Next.js and a Postgres-compatible database (Neon-compatible). It focuses on fast, unobtrusive link creation with optional custom codes and click counts.

This repository includes a small API (`/api/link`) and a client dashboard to create, list, and delete short links.

## Features

- Create short links with optional custom codes
- Track total clicks and last-click timestamp
- Simple dashboard UI for managing links
- Works with a Postgres-compatible DB (Neon recommended)
- Development in-memory fallback for quick frontend work without a database

## Quickstart

Prerequisites:

- Node.js 18+ (or the version recommended by Next.js)
- A Postgres-compatible database (optional during development)

1. Install dependencies

```bash
npm install
```

2. Configure environment

Copy the example env file and fill in the values:

```bash
cp .env.local.example .env.local
# Edit .env.local and set DATABASE_URL (and optionally NEXT_PUBLIC_BASE_URL)
```

- `DATABASE_URL` should be a Postgres-compatible connection string, e.g.

```
DATABASE_URL=postgres://username:password@host:5432/database
```

If you do not set `DATABASE_URL` during development, the app will use an in-memory fallback so the UI and API remain usable (note: data is not persisted).

3. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` and the dashboard will load. The dashboard fetches links from `GET /api/link`.

## API

- `GET /api/link` — returns an array of links
- `POST /api/link` — create a new link; JSON body: `{ targetUrl: string, code?: string }`
- `GET /api/link/:code` — fetch a single link by code
- `DELETE /api/link/:code` — delete a link

Responses are JSON and follow typical HTTP status codes (`200` on success, `4xx`/`5xx` on error).

## Database

The project uses a Postgres-compatible database. When `DATABASE_URL` is set, the app will attempt to create the `links` table automatically on first run. The schema is:

# TinyLink

TinyLink is a minimal, self-hostable link shortener built with Next.js and a Postgres-compatible database (Neon-compatible). It focuses on fast, unobtrusive link creation with optional custom codes and click counts.

This repository includes a small API (`/api/link`) and a client dashboard to create, list, and delete short links.

## Features

- Create short links with optional custom codes
- Track total clicks and last-click timestamp
- Simple dashboard UI for managing links
- Works with a Postgres-compatible DB (Neon recommended)
- Development in-memory fallback for quick frontend work without a database

## Quickstart

Prerequisites:

- Node.js 18+ (or the version recommended by Next.js)
- A Postgres-compatible database (optional during development)

1. Install dependencies

```bash
npm install
```

2. Configure environment

Copy the example env file and fill in the values:

```bash
cp .env.local.example .env.local
# Edit .env.local and set DATABASE_URL (and optionally NEXT_PUBLIC_BASE_URL)
```

- `DATABASE_URL` should be a Postgres-compatible connection string, e.g.

```
DATABASE_URL=postgres://username:password@host:5432/database
```

If you do not set `DATABASE_URL` during development, the app will use an in-memory fallback so the UI and API remain usable (note: data is not persisted).

3. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` and the dashboard will load. The dashboard fetches links from `GET /api/link`.

## API

- `GET /api/link` — returns an array of links
- `POST /api/link` — create a new link; JSON body: `{ targetUrl: string, code?: string }`
- `GET /api/link/:code` — fetch a single link by code
- `DELETE /api/link/:code` — delete a link

Responses are JSON and follow typical HTTP status codes (`200` on success, `4xx`/`5xx` on error).

## Database

The project uses a Postgres-compatible database. When `DATABASE_URL` is set, the app will attempt to create the `links` table automatically on first run. The schema is:

```
CREATE TABLE IF NOT EXISTS links (
  code TEXT PRIMARY KEY,
  target_url TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_clicked TIMESTAMPTZ
)
```

If the database authentication fails (for example: `password authentication failed for user 'neondb_owner'`), ensure the `DATABASE_URL` contains the correct username and password, and that the database accepts connections from your environment.

## Development fallback

For a smooth local developer experience, the app provides an in-memory DB fallback when running in `NODE_ENV=development` and `DATABASE_URL` is not set. This keeps the dashboard usable without configuring a real database. The fallback is intentionally minimal — records live only in memory and are lost when the dev server restarts.

To use the real DB instead, set `DATABASE_URL` in `.env.local` and restart the dev server.

## Tailwind & CSS

This project uses Tailwind CSS. If you encounter CSS build errors complaining about invalid utility names, check `app/globals.css` for any malformed utilities like `bg-(--primary)` or `ffocus:`; valid arbitrary values use square brackets, for example `bg-[var(--primary)]` and `focus:ring-[var(--primary)]`.

## Contributing

Contributions are welcome. Open issues or PRs for bug fixes, tests, or improvements.

## License

This project is provided as-is. No license specified.
