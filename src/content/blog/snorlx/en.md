---
title: "A self-hosted CI/CD dashboard for GitHub Actions"
subtitle: "How to use Snorlx to get centralized visibility, DORA metrics and real-time updates across all your repositories"
category: "DevOps"
lang: "en"
date: "2025-03-08"
tags: ["github-actions", "cicd", "devsecops", "kubernetes", "devops-metrics", "observability"]
image: "/blog/snorlx/snorlx.jpg"
---

## Why do we need it?

GitHub Actions has become the de facto standard for CI/CD automation in the cloud-native ecosystem. From simple lint checks to multi-environment deployments, most modern repositories rely on workflows to build, test, and release software. GitHub clearly shows how workflows run within a single repository: you click the Actions tab, scroll through runs, and check their status. Easy enough when you're dealing with a couple of repositories.

But what happens when your organization grows to 50, 100, or even more repositories, each packed with numerous workflows? Suddenly, you're managing hundreds of active pipelines. When a production deployment fails, the first question is likely: *where?* Which repository? Which workflow? What went wrong? The native GitHub interface doesn't provide cross-repository aggregation, forcing you to switch between repositories one by one, hoping to spot the red icon.

Beyond the operational pain, there's a strategic gap. The [DORA research program](https://dora.dev) has established four key metrics that evaluate software delivery performance: Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Mean Time to Recovery (MTTR). These metrics are the gold standard for engineering leadership conversations about velocity and reliability. Yet GitHub Actions provides no built-in way to compute them. Teams are left building ad-hoc scripts, exporting data to spreadsheets, or purchasing expensive SaaS platforms just to answer the question: *are we getting better or worse at shipping software?*

## So, what's the problem?

Let's break it down into the specific pain points that platform engineering teams face every day.

**No single pane of glass.** GitHub shows workflow runs per repository. There is no unified dashboard across the organization. If you want to see which workflows failed in the last hour across all your repos, you have to check each one individually.

**DORA metrics are invisible.** Deployment Frequency, Lead Time, Change Failure Rate, and MTTR must be computed externally. GitHub provides the raw data (workflow runs with timestamps and conclusions), but no tool to aggregate and rate them against industry benchmarks.

**Cost trasparency** GitHub Actions bills by the minute, but the billing dashboard provides only aggregate monthly totals. There is no per-workflow or per-repository cost breakdown, making it impossible to identify which pipelines are consuming the most budget. This problem has become even more urgent in light of the pricing saga that unfolded between December 2025 and March 2026. In mid-December 2025, GitHub [announced a restructuring of Actions pricing](https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/): GitHub-hosted runner prices were reduced by up to 39% starting January 1, 2026 (now in effect), but a new $0.002 per-minute "cloud platform charge" was also announced as a fee that would have applied even to self-hosted runners starting March 1, 2026. The reaction was immediate and without any hesitation. Within 24 hours, developers across Reddit, GitHub Discussions, and social media [revolted against the idea](https://github.com/orgs/community/discussions/182186) of paying per-minute fees for orchestration running on their own hardware. One user calculated an extra $3,500/month on their bill; research labs warned their publicly funded projects would become unaffordable; the community consensus was that the pricing model was fundamentally flawed for self-hosted use cases. GitHub [walked back the decision](https://github.com/orgs/community/discussions/182186) the very next day, admitting it "missed the mark" and postponing the self-hosted charge indefinitely. As of today, past the original March 1 deadline, the charge was never implemented, self-hosted runners remain free, and no new timeline has been announced. But GitHub was clear that the underlying economics haven't changed: the Actions control plane has real costs, and some form of monetization is likely coming. The bottom line? The pricing landscape for GitHub Actions is in a state of active uncertainty. Teams that lack per-workflow visibility into where their minutes are consumed will be unprepared when the next pricing change arrives and there *will* be a next one. A dashboard that breaks down runner usage by workflow and repository is no longer a nice-to-have, but it's a financial necessity.

Commercial solutions like Datadog CI Visibility, Harness, or Buildkite solve some of these problems, but they come with SaaS pricing, vendor lock-in, and data sovereignty concerns. For teams that want to keep their CI/CD telemetry in-house, the landscape is surprisingly thin.

## Finding a solution: Snorlx

[Snorlx](https://github.com/banshee86vr/snorlx) is an open-source, self-hosted CI/CD dashboard purpose-built for GitHub Actions. It aggregates all workflow runs across all repositories and organizations into a single interface, computes DORA metrics automatically, delivers real-time updates via WebSocket, and provides cost tracking per workflow and per repository.

![Dashboard](/blog/snorlx/dashboard.png)

The architecture follows a clean three-tier design:

**Frontend**: React 18 with TypeScript, TanStack Query for data fetching and caching, Recharts for metric visualizations, and Tailwind CSS v4 (using the new `@tailwindcss/vite` plugin, with the legacy `tailwind.config.js` and `postcss.config.js` removed) with full dark/light theming.

**Backend**: Go with the Chi router, providing a REST API, GitHub OAuth authentication, webhook event processing for real-time updates, and a WebSocket hub that broadcasts pipeline status changes to all connected clients instantly.

**Database**: PostgreSQL enhanced with TimescaleDB for time-series optimization. Workflow runs, and jobs are stored in hypertables partitioned by timestamp, with continuous aggregates that automatically pre-compute daily metrics (success rates, durations, percentiles) every hour. A retention policy keeps the database from growing unboundedly by purging data older than one year.

Setting `STORAGE_MODE=memory` gives you a fully functional dashboard with zero external dependencies, no database, and no setup. This is perfect for evaluation and development. When you're ready for production, switch to `STORAGE_MODE=database` and point it to PostgreSQL for persistent storage, taking advantage of all the TimescaleDB optimizations.

![Snorlx architecture](/blog/snorlx/architecture.jpg)

## Requirements

- Go 1.21+
- Node.js 20+
- pnpm (recommended) or npm
- A GitHub OAuth App ([create one here](https://github.com/settings/developers))
- PostgreSQL 14+ with TimescaleDB (only for database mode)

## Preparation steps

### 1. Clone the repository and install dependencies

```bash
git clone https://github.com/banshee86vr/snorlx.git
cd snorlx
pnpm install
```

### 2. Create a GitHub OAuth App

Go to [GitHub Developer Settings](https://github.com/settings/developers), click **OAuth Apps** → **New OAuth App**, and fill in:

- **Application name**: `Snorlx Dashboard`
- **Homepage URL**: `http://localhost:5173`
- **Authorization callback URL**: `http://localhost:8080/api/auth/callback`

Copy the **Client ID** and generate a **Client Secret**.

### 3. Configure the environment

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
# Development mode
DEV_MODE=true

# Storage Mode: memory for quick start, database for persistence
STORAGE_MODE=memory

# GitHub OAuth
GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret

# Session Security (generate with: openssl rand -base64 32)
SESSION_SECRET=your_random_32_character_secret_string

# URLs
PORT=8080
FRONTEND_URL=http://localhost:5173
```

### 4. Start the application

```bash
# From project root: starts both frontend and backend concurrently
pnpm run dev
```

The application will start on two ports: the frontend at `http://localhost:5173` and the backend API at `http://localhost:8080`. Log in with GitHub, and the dashboard will begin syncing your repositories, workflows, and runs.

### 5. (Optional) Enable database mode for persistent storage

If you want data to survive restarts, spin up a TimescaleDB instance:

```bash
docker run --name snorlx-postgres \
  -e POSTGRES_DB=snorlx \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d timescale/timescaledb:latest-pg16
```

Then update your `.env`:

```env
STORAGE_MODE=database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/snorlx?sslmode=disable
```

Restart the application: migrations run automatically on startup.

### 6. (Optional) Enable real-time webhooks

For instant updates without polling, configure a webhook in your GitHub repository or organization settings:

- **Payload URL**: `https://your-domain.com/api/webhooks/github`
- **Content type**: `application/json`
- **Secret**: Generate a secure secret and add it to `.env` as `GITHUB_WEBHOOK_SECRET`
- **Events**: Select `Workflow runs`, `Workflow jobs`, `Deployments`

## What does the dashboard give you?

Once running, the Snorlx dashboard provides several key views.

The **Dashboard** page shows summary cards for total repositories, workflows, and run statistics (success rate, in-progress count, comparisons to the previous period), area charts for success/failure trends over the last 30 days, a pie chart for outcome distribution, and a live section showing currently running and queued pipelines. The active pipelines section now uses a dedicated `/api/pipelines/active` endpoint that supports an optional `?refresh=true` parameter. When set, the backend pulls the latest workflow runs directly from GitHub for all known repositories before returning results, so newly triggered pipelines appear immediately without waiting for a full sync.

The **Metrics** page provides a deep dive into DORA metrics with configurable time periods (7 days, 30 days, 90 days). Each of the four metrics (Deployment Frequency, Lead Time, Change Failure Rate, MTTR) is displayed with its computed value and a color-coded rating badge (elite, high, medium, low) based on industry benchmarks. An area chart visualizes deployment trends over the selected period. The metrics computation was refined with a new deployment workflow tagging system: workflows can be explicitly marked as deployment workflows via a toggle (`is_deployment_workflow`), and a backfill endpoint retroactively marks historical runs so that DORA metrics are computed from the correct dataset. Lead Time calculations were also improved with a new `commit_timestamp` field that tracks the actual commit time for more accurate commit-to-production measurements.

![Metrics](/blog/snorlx/metrics.png)

The **Runs** page provides a filterable, paginated list of all workflow runs across all repositories, with filters for status, conclusion, branch, event type, and actor. The **Run Detail** page drills into the full job hierarchy with step-level status, duration timelines, error annotations, a YAML viewer for the workflow definition, and direct links to logs on GitHub. In the latest update, the **re-run** and **cancel** actions are now fully functional calling the GitHub API directly with proper error handling for conflict (409), forbidden (403), and not-found (404) scenarios, returning user-friendly messages when a re-run hasn't queued yet or a cancellation isn't allowed. After a re-run, a light per-repository sync (`POST /api/repositories/{id}/sync`) automatically pulls the new run so it appears in the dashboard without triggering a full organization sync. Job data can also be force-refreshed from GitHub via `?refresh=true` to avoid stale cached results.

![Workflows runs](/blog/snorlx/runs.png)


**Cost tracking** becomes particularly relevant given the current state of flux in GitHub's pricing model. The hosted runner price reduction is already in effect, but the self-hosted billing question remains unresolved. GitHub explicitly said the underlying economics haven't gone away, just the timeline. Snorlx provides per-workflow and per-repository cost analysis based on runner usage, so you can identify your most expensive pipelines, make informed decisions about runner allocation (self-hosted vs. GitHub-hosted now that hosted prices have dropped significantly), and model the impact of future pricing changes before they hit your bill. When GitHub does announce a revised self-hosted pricing model, teams using Snorlx will be able to run the numbers immediately rather than scrambling to understand their exposure.

## Deploying to Kubernetes

Snorlx ships with a Helm chart under `helm/snorlx/` that provisions separate deployments for the backend and frontend, an optional internal TimescaleDB StatefulSet, Kubernetes secrets, an Ingress resource with TLS support, and security contexts that enforce non-root execution with dropped capabilities.

```bash
helm install snorlx ./helm/snorlx \
  --set github.clientId=your_id \
  --set github.clientSecret=your_secret \
  --set session.secret=your_session_secret
```

The application follows the [12-Factor methodology](https://12factor.net/) end-to-end: environment-based configuration, stateless processes, graceful shutdown on SIGTERM, structured JSON logging, and automated migrations during startup.

## What do we bring at home?

Snorlx fills a genuine gap in the GitHub Actions ecosystem by providing the organizational visibility layer that GitHub's native interface lacks. With a single `pnpm run dev` command, you get a fully functional dashboard that aggregates all your workflow runs, computes DORA metrics, tracks costs, and delivers real-time updates: all self-hosted, all open-source, all under your control.

The timing couldn't be better. The GitHub Actions pricing saga of late 2025, when a 39% reduction on hosted runners that is now in effect, paired with a self-hosted platform charge that was announced, revolted against, and reversed within 24 hours, has demonstrated that the cost of CI/CD is no longer something organizations can afford to be reactive about. The original March 1, 2026 deadline passed without the charge being implemented, but GitHub made clear it's a matter of *when*, not *if*, some form of self-hosted monetization arrives. Teams that already have granular visibility into their runner usage per workflow and per repository will be able to absorb whatever comes next without scrambling. Snorlx provides exactly that visibility.

The dual storage mode means evaluation is frictionless: start with memory mode to see value in five minutes, then graduate to PostgreSQL with TimescaleDB when you're ready for production persistence. The Helm chart, Docker Compose configuration, and 12-Factor compliance ensure the application behaves predictably whether you deploy it on a laptop, a VM, or a Kubernetes cluster.

For any team running GitHub Actions across more than a handful of repositories, Snorlx transforms CI/CD observability from a per-repository chore into an organizational capability with measurable DORA outcomes and, in this new pricing era, measurable cost outcomes too.

Tags /

- [github-actions](/en/blog?tag=github-actions)
- [cicd](/en/blog?tag=cicd)
- [devsecops](/en/blog?tag=devsecops)
- [kubernetes](/en/blog?tag=kubernetes)
- [devops-metrics](/en/blog?tag=devops-metrics)
- [observability](/en/blog?tag=observability)