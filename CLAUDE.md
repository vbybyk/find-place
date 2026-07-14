# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

`find-place` is a **monorepo** for a property-listings marketplace (Philippines audience).

```
client/   Next.js 16 (App Router) + React 19 frontend + BFF   (source of truth today)
server/   FastAPI backend skeleton (Python 3.13, uv)          (being stood up)
```

Each app is self-contained (own deps, own Dockerfile). They are separate compose stacks at runtime. `infra/` (docker-compose + Caddy) is not created yet.

The frontend/backend contract will be REST: Next.js stays the frontend + BFF (SSR/SEO + server-side calls), FastAPI owns business logic and data. The current code still uses the older Next-server-actions + MongoDB path (below); migration to the FastAPI + Postgres/PostGIS backend is in progress.

## Commands

Run per app — there is no root `package.json`.

```bash
# client/ (Next.js)
npm run dev   --prefix client   # dev server on http://localhost:3050 (NOT 3000)
npm run build --prefix client   # production build
npm run lint  --prefix client   # eslint . (flat config)
client/node_modules/.bin/tsc --noEmit -p client/tsconfig.json   # typecheck

# server/ (FastAPI) — requires uv (https://docs.astral.sh/uv)
uv run --directory server uvicorn app.main:app --reload --port 8000   # /health, /docs
uv sync --project server        # install/refresh deps
```

No test runner is configured yet. When tests are added: **Vitest** (client) / **pytest** (server), with test files **colocated** next to source (`Foo.test.tsx`), never in a per-feature `tests/` folder.

## Client

Stack: Next.js 16, React 19.2, TypeScript 5.9, Tailwind CSS v4, `@base-ui-components/react`, `react-hook-form`, `geist` fonts. Path alias `@/*` → `client/src/*`.

### Structure conventions (follow these — they are deliberate)

- **`src/app/` is routing only** — `page`/`layout`/`loading`/`error`/`not-found` and `api/**/route.ts`. Nothing else lives here. Route files stay thin: read `params`/`searchParams`, fetch data, handle `notFound`/redirects, and **compose** feature components. Do not add a `<XPage>` wrapper component unless you need a server→client boundary.
- **`src/features/<domain>/` holds view layer only — JSX components + forms, flat.** e.g. `features/listings/ListingCard.tsx`, `features/listings/forms/CreateListingForm.tsx`, `features/search/FilterSelect.tsx`. No `api`/`types`/`hooks` inside features.
- **`src/components/ui/`** — shared, generic presentational primitives (`input`, `textarea`, `select`, `autocomplete`, `spinner`) built on **Base UI**. `src/components/` also holds shared non-primitive chrome (`header`).
- **Everything non-view is organized by kind, sliced per-domain by filename:**
  - API / server actions → `src/lib/actions/<domain>.ts`
  - Types → `src/types/<domain>.ts`
  - Constants → `src/constants/<domain>.ts`
  - Hooks → `src/hooks/<domain>.ts`
  - Utils → `src/utils/` (generic) or `src/utils/<domain>.ts`
  - Keep the `<domain>.ts` filename consistent across kinds so locations are predictable.
- **Do not create empty folders ahead of need** (no empty `hooks/`, no per-feature `tests/`).
- Decision rule: reused across features → `components/`; specific to one domain's view → `features/<domain>/`; non-view logic → the matching kind folder above.

### Data flow (current — Mongo-backed)

Two distinct backend paths — don't confuse them:

1. **Server Actions** (`src/lib/actions/listings.ts`, `"use server"`) — the primary way pages read/write MongoDB. `getListings`/`getListingById`/`createListing`/`updateListing` call Mongoose directly and `revalidatePath` after mutations. Server Components `await` them directly. Mongoose docs are serialized with `JSON.parse(JSON.stringify(...))` before crossing the server/client boundary.
2. **Route Handlers** (`src/app/api/listings/*`) — proxies to external services: `route.ts` → GeoNames city search (`GEONAMES_USERNAME` kept server-side); `upload-image/route.ts` → Cloudinary. Reached over HTTP via `BACKEND_URL` (see `searchListingCity`/`uploadImage`), not called directly. ⚠️ `BACKEND_URL` must match the dev port (`3050`).

`src/lib/database/index.ts` caches the Mongoose connection on `global`; always `await connectToDatabase()` in any action touching the DB. Connection string is assembled from `DB_USER`, `DB_USER_PASSWORD`, `DB_CLUSTER`, `DB_NAME`.

### Data model

`src/lib/database/models/listing.ts` defines the single `Listing` model (`models.Listing || model(...)` guard). Domain encoding used throughout:
- `type`: 1 = Rent, 2 = Sale
- `houseType`: 1 = Apartment, 2 = House

These id→label maps live once in **`src/constants/listings.ts`** (`ListingTypes`, `PropertyTypes`, `Countries`) — import them, never re-declare inline. Listing filtering in `listings/page.tsx` queries nested fields with dotted keys like `"location.city.label"`.

### Forms

`features/listings/forms/CreateListingForm.tsx` is a client component using `react-hook-form` + `Controller` around the `ui/` primitives. Serves create and edit via the `type` prop; edit hydrates via `setValue` in a `useEffect`. Form value types are in `src/types/listings.ts` (`IListingFormValues`, `ICityOption`) — `useForm<IListingFormValues>()` must be typed or `city: null` in `defaultValues` breaks hydration. Base UI's `Autocomplete` calls `onChange(value)` (single arg), not `(event, value)`.

## Server

FastAPI skeleton under `server/app/`, layered: **routes → services → repositories → db**. Boundary rule: nothing above the repository writes SQL; nothing below the service knows about HTTP. `config.py` is pydantic-settings; `db/session.py` is async SQLAlchemy. Targets Postgres/PostGIS via SQLAlchemy 2 (async) + Alembic. Managed by `uv` (auto-provisions Python ≥3.13). Runtime deps installed; `ruff` (dev) pending a re-sync.

## Conventions & gotchas

- **Builds ignore errors.** `client/next.config.mjs` sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` to `true`, so `npm run build` will NOT catch lint/type errors — run `lint` and `tsc --noEmit` explicitly.
- **ESLint is flat config** (`client/eslint.config.mjs`) spreading `eslint-config-next`'s native array. Custom rules (scoped to `**/*.ts,tsx`): `@typescript-eslint/no-explicit-any` off; unused vars/args prefixed `_` ignored.
- **Pinned-below-latest on purpose:** TypeScript stays on **5.9** (TS 7 crashes `typescript-eslint`); ESLint on **9** (ESLint 10 breaks `eslint-config-next` and needs Node 24). Base UI stays on `@base-ui-components/react` (renamed upstream to `@base-ui/react`; migration deferred — it touches the autocomplete/select APIs, and the autocomplete is being reworked for Google Places).
- **Tailwind v4** — CSS-first: `@import "tailwindcss"` + `@theme` in `globals.css`, `@tailwindcss/postcss` in `postcss.config.mjs`. No `tailwind.config.ts`.
- Secrets live in `client/.env` (Mongo, Cloudinary, GeoNames, `BACKEND_URL`) — committed but values must stay server-side; expose only via Route Handlers/Server Actions. `server/.env` is git-ignored (see `.env.example`).
- Cloudinary images: `res.cloudinary.com` is whitelisted via `images.remotePatterns` in `client/next.config.mjs`.

## Product direction (not yet built)

Headline feature is search: (1) manual address search → map with approximate-location markers; (2) AI chat search (Claude tool-use agent in FastAPI). Auth, owner listing management, and owner stats are in scope; user↔owner chat is deferred. Geo/address + maps will use **Google Maps Platform** (Places + Maps JS), replacing GeoNames. Backend runs in Docker on Hetzner alongside an existing service.
