# CalTrack

Lightweight full‑stack calorie & exercise tracking app built with Next.js, Prisma, and PostgreSQL (Neon). Includes authentication (NextAuth), integrations with USDA FoodData Central and an exercise API, and is deployed on Render.

## Getting started (developer)

1. Clone and install

```bash
git clone <repo-url>
cd caltrack
npm ci
```

2. Local development

Create a local `.env` file (see Required environment variables) then run:

```bash
npm run dev
```

Open http://localhost:3000 in your browser. Edit `app/page.tsx` or components under `src/` — the page auto-updates during development.

3. Build for production locally

```bash
npm run build
npm run start
```

## Required environment variables

Create a `.env` (do not commit) and also add these in Render (or your chosen host) as service environment variables:

- `DATABASE_URL` — Postgres connection string (Neon/Postgres)
- `NEXTAUTH_URL` — site URL (e.g. `https://caltrack.example.com`)
- `NEXTAUTH_SECRET` — long random string (generate with `openssl rand -base64 32`)
- `FDC_API_KEY` — USDA FoodData Central API key
- `EXERCISE_API_KEY` — exercise provider API key
- `EXERCISE_API_BASE_URL` — optional provider base URL

Note: NextAuth requires the exact env names `NEXTAUTH_URL` and `NEXTAUTH_SECRET`. Using `AUTH_URL` or `AUTH_SECRET` will cause auth failures (403).

## Prisma / Database

- Generate the Prisma client after installing dependencies:

```bash
npx prisma generate
```

- Create & run migrations (development):

```bash
npx prisma migrate dev --name init
```

- Apply migrations in production (Render deploy command or CI):

```bash
npx prisma migrate deploy
```

- Seed (if available): run the seed script in `prisma/` (check `package.json` scripts).

## Deploying to Render (quick checklist)

This project is configured to deploy to Render. Use the steps below as a minimal checklist.

1. Push your repository to GitHub (or connect Git provider to Render).

2. Create a new Web Service on Render and connect the repo.

3. Set environment variables in the Render service (the same list as Required environment variables).

4. Set the Build Command and Start Command (Render uses these during deploy):

Build Command:

```bash
npm ci && npm run build
```

Start Command:

```bash
npm run start
```

5. Post-deploy checks

- Verify authentication and sign-in flows.
- Inspect service logs in Render for any runtime errors (missing env vars, API 403s).
- If migrations are needed during deploy, add a Pre-Deploy command (or use a separate job) to run `npx prisma migrate deploy`.

## CI / Continuous deployment

If you prefer deploying via GitHub Actions or Render's native deploys, ensure your pipeline sets the `DATABASE_URL` secret and runs `npx prisma migrate deploy` before starting the service.

## Troubleshooting — common issues

- 403 Forbidden in production:
	- Confirm `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set in your host's environment (not `AUTH_URL`/`AUTH_SECRET`).
	- Verify API keys (`FDC_API_KEY`, `EXERCISE_API_KEY`) are valid and set.
	- Check logs in Render to see which request is failing.

- Database connection errors:
	- Ensure `DATABASE_URL` has correct credentials and the database allows connections from Render.
	- Run `npx prisma migrate deploy` and check migration errors.

- Missing Prisma client:
	- Run `npx prisma generate` or reinstall dependencies (`npm ci`) which runs `postinstall` scripts.

## Tests, linting, formatting

- Run tests (if present):

```bash
npm test
```

- Lint:

```bash
npm run lint
```

- Format:

```bash
npm run format
```

## Contributing

- Fork → branch from `main` → open a PR with a clear description and tests.
- Run tests and linters locally before creating a PR.

## Maintainer notes

- Keep secrets only in your hosting provider (Render/GitHub Secrets).
- Rotate API keys if exposed.
- Consider adding a `render.yaml` for infrastructure-as-code or a small deploy script that runs migrations during deploy.

---

If you want, I can also:

- add a `render.yaml` and Pre-Deploy commands to run migrations automatically,
- add a short `CONTRIBUTING.md` with PR checklist,
- or update `package.json` scripts to include a `deploy` script that runs migrations then starts the server.


