# find-place server

FastAPI backend for find-place. Postgres/PostGIS via SQLAlchemy 2 (async) + Alembic.
Managed with [uv](https://docs.astral.sh/uv/).

## Layout

```
app/
  main.py            # FastAPI app + middleware; registers routers
  config.py          # pydantic-settings (env-driven)
  api/routes/        # HTTP layer — thin; validates + delegates to services
  services/          # business logic + authorization
  repositories/      # data access — the only place that touches the DB
  db/session.py      # async engine + session dependency
```

Boundary rule: routes → services → repositories → DB. Nothing above the
repository writes SQL; nothing below the service knows about HTTP.

## Local dev

Requires **uv** (installs and manages Python 3.13 itself):

```bash
# one-time: install uv — https://docs.astral.sh/uv/getting-started/installation/
curl -LsSf https://astral.sh/uv/install.sh | sh

cd server
cp .env.example .env
uv sync                 # creates .venv, fetches Python 3.13, installs deps
uv run uvicorn app.main:app --reload --port 8000
```

Health check: http://localhost:8000/health → `{"status": "ok"}`
API docs: http://localhost:8000/docs

## Docker

```bash
docker build -t find-place-server .
docker run -p 8000:8000 --env-file .env find-place-server
```
