This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploying to Vercel (quick checklist)

1. Push your repository to GitHub and create a Vercel project connected to that repo.

2. In Vercel Project Settings → Environment Variables, set the following (at minimum):

	- `DATABASE_URL` — your production Postgres connection string (e.g. `postgres://user:pass@host:5432/dbname`)
	- `NEXTAUTH_URL` — your site URL (e.g. `https://your-app.vercel.app`)
	- `NEXTAUTH_SECRET` — a long random string for NextAuth (generate with `openssl rand -base64 32`)
	- `EXERCISE_API_KEY` — (optional) API key for exercise provider (server-only)
	- `EXERCISE_API_BASE_URL` — (optional) provider base URL (e.g. `https://api.exerciseprovider.com`)

	Add variables for Production and Preview environments as needed.

3. Migrations and Prisma client

	- This repository includes a `postinstall` script that runs `prisma generate` during install.
	- In production, apply migrations non-interactively with:

	  ```bash
	  npx prisma migrate deploy
	  ```

	- You can run migrations manually (recommended the first time), or use the included GitHub Action to apply migrations automatically on pushes to `main`. The action expects a `DATABASE_URL` secret in GitHub Secrets.

4. Build & deploy

	- Vercel will run the normal install/build process (`npm ci` / `npm run build`). The site should be available at `https://<your-project>.vercel.app`.

5. Post-deploy checks

	- Verify authentication and any provider integrations.
	- Check function logs in Vercel if server routes (API) are failing.

If you'd like, I can add a `vercel.json` or more advanced GitHub Actions (e.g., run migrations only when specific files change). Let me know which automation you'd prefer.

## Continuous deployment via GitHub Actions → Vercel

If you prefer deploying via GitHub Actions (instead of connecting the repo to Vercel directly), this repo includes a workflow that triggers a Vercel deploy on pushes to `main`.

What you need to add in GitHub (Repository → Settings → Secrets):

- `VERCEL_TOKEN` — a Vercel token created in Vercel Dashboard > Settings > Tokens.
- `VERCEL_PROJECT_ID` — your Vercel project ID (found in project settings or the Vercel dashboard URL).
- `VERCEL_ORG_ID` — your Vercel organization ID.

Once those secrets are set, pushing to `main` will run the `.github/workflows/vercel-deploy.yml` workflow and deploy to Vercel.


