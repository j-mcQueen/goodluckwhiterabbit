# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

GoodLuckWhiteRabbit (GLWR) is a photography/art business site with three surfaces: a public marketing/portfolio site, a password-protected client photo-delivery dashboard, and an admin dashboard for managing clients and uploading their photos. It's a two-package monorepo: `client/` (React + Vite + TypeScript) and `backend/` (Express + MongoDB + S3), developed and deployed independently of each other.

## Commands

Run these from within `client/` or `backend/` respectively — there is no root-level package.json or workspace tooling.

### client/
- `npm run dev` — start Vite dev server (expects backend running on `http://localhost:3000` when `VITE_ENV` is not `production`)
- `npm run build` — type-check (`tsc`) then production build (`vite build`)
- `npm run lint` — ESLint over `.ts`/`.tsx`, zero warnings allowed (`--max-warnings 0`)
- `npm run preview` — serve the production build locally

There is no client test runner configured.

### backend/
- `npm run devstart` — start with nodemon (auto-restart)
- `npm run serverstart` — devstart with `DEBUG=backend:*` logging
- `npm start` — start with plain node (`./bin/www`)
- `npm test` — runs `jest`, but no test files currently exist in the repo

Both packages need their own `.env` (see existing `.env` for required keys — not committed, do not print or commit secrets). Backend needs `MONGODB_URI`, `JWT_SECRET`, AWS credentials/region, and both S3 bucket names. Client needs `VITE_API_URL` and `VITE_ENV`.

## Architecture

### Backend: three route groups, one auth model

`backend/app.js` mounts three routers, each backed by its own controller:
- `/api` → `routes/global.js` → `controllers/global/global.js` — logout, presigned PUT URLs, portfolio image URLs, imageset counts. Shared by both admin and user flows.
- `/api/admin` → `routes/index.js` → `controllers/admin.js` — admin login, client CRUD, bulk upload, file management.
- `/api/user` → `routes/user.js` → `controllers/user/user.js` — client login (by `code`, not username/password), fetching own data, downloading files.

There are two Mongoose models: `models/admin.js` (username/password/role) and `models/user.js` (client record — name, email, login `code`, category, per-imageset file counts). Both share the JWT auth pattern below, but admins authenticate via Passport's `admin-local` `LocalStrategy` (bcrypt-compared password) while users authenticate by looking up a `code` field directly (see `login` in `controllers/user/user.js`) — there's no separate "user" Passport strategy.

**Auth pattern**: on successful login, both flows issue a short-lived `accessToken` (1h) and long-lived `refreshToken` (24h) JWT, both `httpOnly`/`sameSite: Strict`/`secure` cookies, signed with the same `JWT_SECRET`, payload is just `{ _id }`. Every protected controller calls `verifyTokens(req, res)` (`controllers/utils/verifyTokens.js`) at the top of the handler and checks its return value before proceeding — this isn't middleware, it's called explicitly inline in each handler. If the access token is expired but the refresh token is valid, `verifyTokens` silently mints a new access token and sets it on the response before returning; if both are invalid it 401s directly. When adding a new protected route, follow this same `const verified = await verifyTokens(req, res); if (verified) { ... }` shape rather than introducing route middleware.

### S3 file layout and image pipeline

Client photo delivery and the public portfolio both work by listing/filtering/sorting S3 objects by key convention, then generating presigned URLs — there's no image metadata stored in MongoDB. Client asset keys look like:

```
{userId}/{imageset}/{index}/{resized|original|og}/{size}/{filename}
```

Portfolio asset keys (separate bucket, `AWS_SECONDARY_BUCKET`) look like:

```
{category}/{sub}/{group}/{size}/..._{position}.{ext}
```

Handlers (`generateGetPresigned`, `generatePortfolioUrls`, `downloadAll`, etc.) list objects with `ListObjectsV2Command`, regex-match the index/group/position out of the `Key`, sort, slice into a batch (batches are capped at 10 presigned URLs per request), and sign each with `getSignedUrl` (600s expiry). `generatePutPresigned` issues two PUT URLs per uploaded file — one for a `resized/` copy and one for the `original/` copy — implying resizing happens client-side (see `components/admin/dashboard/utils/compress/`) before upload, not server-side via `sharp`. When touching this code, preserve the key-prefix convention — the client (`generateFileBatch.ts`, `generatePortfolioBatch.ts`, etc.) parses indices back out of URLs with the same regex patterns, so client and server must stay in sync on key shape.

Both admin and user "get" flows return a `skipped: string[]` array alongside `presigns` when individual presign generation fails for some keys, and the client is expected to handle partial batches gracefully rather than treating any skip as a full failure.

### Client: route surfaces mirror backend route groups

`App.tsx` defines all routing via `react-router-dom`'s `createBrowserRouter` (no nested layouts/loaders) with five top-level surfaces: `/` (landing), `/admin` + `/admin/dashboard` (admin login/dashboard), `/portal` + `/user/:id/dashboard` (client login/dashboard), and `/photo` `/art` `/design` (portfolio, all rendered by the same `Portfolio` component parameterized by route).

Source is organized by surface under `components/`: `admin/`, `user/`, `portfolio/`, `landing/`, `global/` (cross-surface shared pieces — header, error boundary, sound, host/viewport detection). Within each dashboard surface, code is further split into the component tree, `utils/handlers/` (event handler logic pulled out of components), and `types/` (colocated TS types, often per-handler, e.g. `types/handleAddTypes.ts`).

`determineHost.ts` is the single source of truth for the API base URL — it's `VITE_API_URL` in production and hardcoded to `http://localhost:3000/api` otherwise, keyed off `VITE_ENV`. Use it rather than hardcoding API URLs elsewhere.

Batch-loading images (the user dashboard gallery, the public portfolio, and the admin ordering grid) follows the same pattern: request a batch of presigned GET URLs for a `start`/`end` range from the backend, `fetch()` each URL client-side to get a `Blob`, then render from blobs. See `components/global/utils/generateFileBatch.ts` / `executeGenerationChain.ts` and their portfolio-specific counterparts in `components/portfolio/utils/`. `generateFileBatch`/`executeGenerationChain` are shared across all three surfaces — the admin ordering grid (`admin/dashboard/utils/handlers/ordering/handleLoad.ts`, `handleFirstLoad.tsx`) passes an optional `onItemLoaded(index, blob)` callback for its per-item progressive reveal, which the other callers omit. When changing these shared functions, verify the admin ordering grid still type-checks and renders correctly, not just the caller you're actively working on.

### Styling and conventions

Tailwind CSS (`tailwind.config.js`, `index.css`) is the styling approach; some components centralize class strings in a colocated `styles/styles.ts` (see `admin/dashboard/styles/styles.ts`) rather than inlining everything in JSX.

TypeScript is strict (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` all on) — code must satisfy these, not just compile.
