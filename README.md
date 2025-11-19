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
## Public base URL

To make your short links copy/share as a public URL (not `localhost`), set a base URL in environment variables.

1. Create a `.env.local` file in the project root.
2. Add one of the following:

```
NEXT_PUBLIC_BASE_URL=https://your-domain.com
# Optional server-side canonical base
BASE_URL=https://your-domain.com
```

For testing without deploying, you can use a tunnel service (e.g., ngrok) and set `NEXT_PUBLIC_BASE_URL` to the provided HTTPS URL.

The app will use `NEXT_PUBLIC_BASE_URL` when copying short URLs in the UI and `BASE_URL`/`NEXT_PUBLIC_BASE_URL` for Open Graph/Twitter metadata.

## Timezone Display

By default, times are shown in the viewer’s local timezone using 24‑hour format. To force a specific timezone for display (still 24‑hour):

1. Create or update `.env.local`:

```
# Examples: Asia/Kolkata, UTC, America/New_York, Europe/Berlin
NEXT_PUBLIC_TIME_ZONE=Asia/Kolkata
```

When set, the dashboard and stats page will render timestamps using this timezone with `hour12: false`.
