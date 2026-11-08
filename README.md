# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Photo storage (Cloudinary)

Guest photos are shrunk to 2560px in the browser and sent straight to Cloudinary's free plan.
`server/api/upload-ticket.post.ts` signs each upload so the API secret stays on the server, and
`server/api/guest-photos.get.ts` lists the photos for the gallery (cached for 30 seconds).

1. Copy `.env.example` to `.env` and fill in the three values from the Cloudinary dashboard.
2. On Vercel, add the same variables and set `NUXT_CLOUDINARY_FOLDER=together-album/production`
   so test uploads from your machine never show on the live site.
3. After the event, set `NUXT_UPLOADS_ENABLED=false` and redeploy to stop new uploads.

There is no delete button on the site. To remove a photo, delete it in the Cloudinary Console;
it leaves the gallery within about a minute.

## Setup

Install dependencies separately on each computer. Do not reuse `node_modules`
from macOS on Windows (or vice versa): Nuxt and Tailwind use native packages
specific to the operating system. This also applies when sharing the project
through iCloud Drive.

On Windows PowerShell, install and start with:

```powershell
npm.cmd ci
npm.cmd run dev
```

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
