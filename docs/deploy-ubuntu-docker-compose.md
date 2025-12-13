# Ubuntu VPS deployment (Docker Compose, no Coolify)

This setup runs:
- **PostgreSQL** in Docker (fresh DB)
- **Next.js app** as a Docker container (standalone build)
- **Caddy** as reverse proxy + automatic HTTPS (Let's Encrypt)

## 1) Prereqs
- DNS `A` record for `mehmetkucuk.nl` (and optionally `www`) must point to this VPS IP.
- Ports **80** and **443** must be open.

## 2) First-time setup
1. SSH into the VPS.
2. Clone the repo and `cd` into it.
3. Create `.env`:
   - Copy `env.production.example` to `.env`
   - Fill in at least `ADMIN_JWT_SECRET`, `POSTGRES_PASSWORD`, `ADMIN_PASSWORD`
4. Run:
   - `bash deploy.sh`

`deploy.sh` will:
- Install Docker + Compose plugin if missing
- Create persistent upload directory under `APP_DATA_DIR` (default `/opt/mk-news/uploads`)
- Run Prisma migrations + seed via the `migrate` container
- Start `db`, `app`, `caddy`

## 3) Update / redeploy
- `docker compose --env-file .env -f docker-compose.prod.yml up -d --build`

## 4) Logs
- App: `docker compose --env-file .env -f docker-compose.prod.yml logs -f app`
- Caddy: `docker compose --env-file .env -f docker-compose.prod.yml logs -f caddy`
- DB: `docker compose --env-file .env -f docker-compose.prod.yml logs -f db`

## 5) Branding uploads persistence
Branding uploads are written to `/app/public/uploads` inside the container.
This is bind-mounted to `${APP_DATA_DIR}/uploads` on the host, so uploads survive restarts and redeploys.
