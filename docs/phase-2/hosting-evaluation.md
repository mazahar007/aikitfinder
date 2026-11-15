# Phase 2 Step 1 — Hosting Evaluation

15 Nov 2026. An evaluation. No provider has been selected or purchased; the decision stays open.
Prices are approximate public list prices as I know them and must be re-checked on the
providers' sites before any decision.

## 1. What has to run

| Service               | Nature                       | Sensitive to                         |
| --------------------- | ---------------------------- | ------------------------------------ |
| FastAPI API           | Always on, small             | Latency to Supabase (Sydney)         |
| Redis                 | Always on, small, stateful   | Persistence, memory                  |
| Celery `ai` worker    | Network-bound                | Concurrency, not CPU                 |
| Celery `media` worker | CPU-bound (FFmpeg)           | CPU, temporary disk                  |
| Remotion renderer     | CPU and memory heavy, bursty | Cores, RAM (headless Chromium), disk |
| Media storage         | Large files                  | Egress cost                          |
| Future GPU work       | Occasional                   | Should be rented per job, not owned  |

Region: the database is in Sydney. The API and workers should be in or near the same region;
each query from another continent adds roughly 150–250 ms.

## 2. Sizing

Assumptions: early stage, up to about 100 active users, about 50 videos rendered per day, each
about 10 minutes at 1080p, render speed about one to three times real time on 4 cores (to be
measured), about 1 GB stored per finished project including sources.

| Service               | CPU      | RAM      | Disk                                                   | Instances at start           |
| --------------------- | -------- | -------- | ------------------------------------------------------ | ---------------------------- |
| API                   | 1 vCPU   | 1 GB     | —                                                      | 1 (2 for availability later) |
| Redis                 | 0.5 vCPU | 0.5–1 GB | 1 GB, persistent                                       | 1                            |
| Worker `ai`/`default` | 1 vCPU   | 1 GB     | —                                                      | 1                            |
| Worker `media`        | 2 vCPU   | 2–4 GB   | 20 GB temporary                                        | 1                            |
| Renderer              | 4 vCPU   | 8 GB     | 20 GB temporary                                        | 1; scale by queue length     |
| Storage               | —        | —        | ~50 GB per 50 projects; grows without a retention rule | Object storage               |

Total at start: about 8–9 vCPU and 13–15 GB RAM if everything is always on. The renderer is more
than half of that and is idle most of the day at this volume.

## 3. Options

|                           | Managed Docker hosting (Railway, Render, Fly.io and similar) | VPS (Hetzner, DigitalOcean and similar) with Docker Compose   |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| Setup effort              | Low: connect the repository, set variables                   | Higher: server hardening, Docker, reverse proxy, TLS, deploys |
| Ongoing operations        | Provider handles OS, restarts, TLS, logs                     | You handle patches, monitoring, backups, incident recovery    |
| Scaling                   | Per service, by slider or rule; scale-to-zero on some        | Resize the server or add servers by hand                      |
| Cost for always-on CPU    | Higher per core                                              | Lowest per core                                               |
| Cost for bursty rendering | Good if the renderer can stop when idle                      | You pay for idle capacity                                     |
| Redis                     | Add-on or managed service                                    | Self-run container; you own persistence                       |
| Region near Sydney        | Available on some, not all                                   | Available on some (not on the cheapest European ones)         |
| Failure of one service    | Isolated                                                     | One server down takes everything down                         |
| Lock-in                   | Low if everything is a Docker image                          | None                                                          |
| Suits                     | A small team without an operations person                    | A team comfortable running Linux servers                      |

## 4. Cost model (monthly, USD, approximate)

| Item                  | Managed Docker                          | VPS                                                                 |
| --------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| API                   | 7–20                                    | Included                                                            |
| Redis                 | 5–15                                    | Included                                                            |
| Workers               | 20–50                                   | Included                                                            |
| Renderer              | 30–120 (depends on idle shutdown)       | Included                                                            |
| Server(s)             | —                                       | 40–100 for 8 vCPU / 16 GB in an Asia-Pacific region; less in Europe |
| Object storage 100 GB | 2–5 plus egress (none on Cloudflare R2) | Same                                                                |
| Backups, monitoring   | Mostly included                         | 5–20                                                                |
| **Rough total**       | **65–210**                              | **50–125**, plus your time                                          |

Not included in either: Supabase plan, Vercel plan, AI provider usage (which will be the largest
variable cost by far), email provider, domain.

## 5. Scaling path

1. Start: one of each service.
2. First pressure point is rendering: add renderer instances driven by queue length.
3. Then `media` workers.
4. API scales last; add a second instance mainly for availability.
5. GPU: rent per job from a GPU provider through the provider layer; do not host GPUs.

## 6. Backup and recovery

| Data          | Backup                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| PostgreSQL    | Supabase's backups. The current plan's retention should be checked; point-in-time recovery needs a paid plan                 |
| Media         | Object storage versioning or lifecycle rules; a retention policy for source and intermediate files                           |
| Redis         | Append-only persistence. It holds queues, not records: the jobs table is the source of truth, so a lost Redis is recoverable |
| Configuration | In Git, except secrets, which live in the host's secret store and a password manager                                         |
| Recovery test | Restore to a scratch project once before launch                                                                              |

## 7. Recommendation (not a decision)

Managed Docker hosting to start, with object storage on Cloudflare R2 or Supabase Storage. The
reasons are the size of the team and the bursty renderer; the extra cost at this scale is small
compared with running servers yourself. Everything is packaged as Docker images, so moving to a
VPS later, when always-on usage makes the price difference matter, is a deployment change and not
a rewrite.

Decisions still needed: provider, region (close to Sydney, or move nothing and accept latency),
storage provider, and whether a staging environment is created.
