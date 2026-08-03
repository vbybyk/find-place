# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

`find-place` is a **monorepo** for a property-listings marketplace (Philippines audience).

```
client/   Next.js 16 (App Router) + React 19 — frontend + BFF (SSR/SEO, server-side API calls)
server/   FastAPI (Python 3.13, uv) — business logic + data (Postgres/PostGIS)
```

Each app is self-contained (own deps, own Dockerfile). They are separate compose stacks at runtime. `infra/` (docker-compose + Caddy) is not created yet.

The frontend/backend contract is REST: Next.js is the frontend + BFF (SSR/SEO + server-side calls), FastAPI owns business logic and data. **Listings are fully migrated** to FastAPI + Postgres/PostGIS — the old Next-server-actions + MongoDB path was removed and `mongoose` uninstalled. Other domains (auth, search, stats) are not built yet.

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

Test runners: **Vitest** (client, configured) / **pytest** (server, pending). Client tests live in a **`tests/` subfolder within each source folder** — e.g. `features/listings/tests/ListingCard.test.tsx`, `utils/tests/index.test.ts` — importing the unit under test via a relative `../` path. Run with `npm run test --prefix client` (CI) or `npm run test:watch`. Vitest config: `client/vitest.config.ts` (jsdom, `@/` alias, setup in `vitest.setup.ts`); glob is `src/**/*.{test,spec}.{ts,tsx}`.

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
- **Do not create empty folders ahead of need** (no empty `hooks/`). A `tests/` subfolder is expected wherever tested source lives (see Commands).
- Decision rule: reused across features → `components/`; specific to one domain's view → `features/<domain>/`; non-view logic → the matching kind folder above.

### Data flow

Two distinct backend paths — don't confuse them:

1. **BFF actions → FastAPI** (`src/lib/actions/listings.ts`, `"use server"`) — the primary data path. `getListings`/`getListingById`/`createListing`/`updateListing` `fetch` the FastAPI REST API at **`API_URL`** (`http://127.0.0.1:8000` — 127.0.0.1 not `localhost`, because Docker squats IPv6 `:8000`). Server Components `await` them directly; mutations `revalidatePath`. Responses are plain JSON matching the API shape (no Mongoose serialization). The Mongoose connection and `src/lib/database/` were deleted in the migration.
2. **Route Handlers** (`src/app/api/listings/*`) — proxies to external services: `route.ts` → GeoNames city search (`GEONAMES_USERNAME` kept server-side); `upload-image/route.ts` → Cloudinary. Reached over HTTP via `BACKEND_URL` (Next's own origin), not called directly. ⚠️ `BACKEND_URL` must match the dev port (`3050`).

### Data model

Listings are owned by the server: `server/app/db/models/listing.py` (SQLAlchemy) is the table; the client mirrors the API response as `IListing` in `src/types/listings.ts` — **snake_case, flat** (`city_label`, `rooms_number`, `house_type`, `latitude`/`longitude`), not the old nested `location` shape. Domain encoding used throughout:
- `type`: 1 = Rent, 2 = Sale
- `house_type`: 1 = Apartment, 2 = House

These id→label maps live once in **`src/constants/listings.ts`** (`ListingTypes`, `PropertyTypes`, `Countries`) — import them, never re-declare inline. The listings page filters via **query params** (`type`/`houseType`/`city`/`userId`) passed to `getListings`, which maps them to the API's `type`/`house_type`/`city`/`user_id` filters.

### Forms

`features/listings/forms/CreateListingForm.tsx` is a client component using `react-hook-form` + `Controller` around the `ui/` primitives. Serves create and edit via the `type` prop; edit hydrates via `setValue` in a `useEffect`. Its **internal** form shape stays nested (`IListingFormValues`/`ICityOption` in `src/types/listings.ts`, kept because the city autocomplete works with `ICityOption`); on submit it is flattened to the API's snake_case `IListingPayload`, and edit hydrates from the flat `IListing`. `useForm<IListingFormValues>()` must be typed or `city: null` in `defaultValues` breaks hydration. Base UI's `Autocomplete` calls `onChange(value)` (single arg), not `(event, value)`.

## Server

FastAPI under `server/app/`, layered: **routes → services → repositories → db**. Boundary rule: nothing above the repository writes SQL; nothing below the service knows about HTTP. `config.py` is pydantic-settings; `db/session.py` is async SQLAlchemy; ORM models in `db/models/`, Pydantic schemas in `schemas/`. Postgres/PostGIS via SQLAlchemy 2 (async) + Alembic (`geoalchemy2` for geometry). Managed by `uv` (auto-provisions Python ≥3.13).

**Listings** is the first full feature slice (`app/{repositories,services,api/routes}/listings.py`): `GET /listings` (filters `type`/`house_type`/`user_id`/`city` + `limit`/`offset`), `GET /{id}`, `POST` (201), `PATCH` (partial via `exclude_unset`), `DELETE` (204). The `geom geometry(Point,4326)` column is built from lat/lng in the repository (shapely `from_shape`); `latitude`/`longitude` are read-only `@property`s. Local DB is native arm64 **pg17 + PostGIS** (port per `server/.env` `DATABASE_URL`, currently `5434` to dodge a Docker/pg16 clash on 5432–5433). Migrations: `uv run alembic upgrade head` / `--autogenerate`.

## Conventions & gotchas

- **ESLint is flat config** (`client/eslint.config.mjs`) spreading `eslint-config-next`'s native array. Custom rules (scoped to `**/*.ts,tsx`): `@typescript-eslint/no-explicit-any` off; unused vars/args prefixed `_` ignored.
- **Pinned-below-latest on purpose:** TypeScript stays on **5.9** (TS 7 crashes `typescript-eslint`); ESLint on **9** (ESLint 10 breaks `eslint-config-next` and needs Node 24). Base UI stays on `@base-ui-components/react` (renamed upstream to `@base-ui/react`; migration deferred — it touches the autocomplete/select APIs, and the autocomplete is being reworked for Google Places).
- **Tailwind v4** — CSS-first: `@import "tailwindcss"` + `@theme` in `globals.css`, `@tailwindcss/postcss` in `postcss.config.mjs`. No `tailwind.config.ts`.
- Secrets live in `client/.env` (Cloudinary, GeoNames, `BACKEND_URL`, `API_URL`) — committed but values must stay server-side; expose only via Route Handlers/BFF actions. `server/.env` is git-ignored (`DATABASE_URL`; see `.env.example`).
- Cloudinary images: `res.cloudinary.com` is whitelisted via `images.remotePatterns` in `client/next.config.mjs`.

## Product direction (not yet built)

Headline feature is search: (1) manual address search → map with approximate-location markers; (2) AI chat search (Claude tool-use agent in FastAPI). Auth, owner listing management, and owner stats are in scope; user↔owner chat is deferred. Geo/address + maps will use **Google Maps Platform** (Places + Maps JS), replacing GeoNames. Backend runs in Docker on Hetzner alongside an existing service.
