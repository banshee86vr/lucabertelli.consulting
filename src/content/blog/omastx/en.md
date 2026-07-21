---
title: "A self-hosted portal for Kubernetes version drift"
subtitle: "How to use Omastx to see how far your fleet has drifted from latest images and Helm charts"
category: "DevOps"
lang: "en"
date: "2026-07-26"
tags: ["kubernetes", "helm", "drift", "observability", "devsecops", "fleet-management"]
image: "/blog/omastx/omastx.webp"
---

## Why do we need it?

Running a single Kubernetes cluster already means juggling container images and Helm releases. Running a *fleet* multiplies the problem: every namespace ships its own workloads, charts pin their own versions, and "are we on latest?" becomes a question you answer by opening dashboards, registry UIs, and `helm list` one cluster at a time.

Platform teams feel this first. Security asks which clusters still run a deprecated Redis tag. Product asks whether prod-eu and prod-us are aligned. You know *something* is outdated, but there is no single place that answers: *How far has my fleet drifted?*

Commercial fleet tools exist, but they often pull write access, push agents into every cluster, or bury version gaps inside a broader ops product. Homegrown scripts scrape registries and dump CSVs that go stale by lunchtime.

**Bottom line:** no read-only, self-hosted view that continuously compares what is *running* against what is *latest* upstream, across images and Helm charts, with a navigable chart instead of a spreadsheet.

## Finding a solution: Omastx

[Omastx](https://github.com/banshee86vr/omastx) is an open-source, self-hosted web portal that scans your Kubernetes clusters, discovers container images and Helm releases, resolves the latest upstream versions, and shows the gap as drift classes you can navigate: Current, Patch, Minor, Major, Deprecated, and Unknown. It is read-only by design: you connect clusters with a kubeconfig that only needs get/list on workloads (and secrets if you want Helm release data). Omastx never mutates anything in your clusters.

![Fleet overview: 50% of workloads on latest, per-cluster drift bars, and status rail](/blog/omastx/fleet.webp)
*Fleet page: headline freshness percentage, stacked drift bars per cluster, and a rail for failures, last scans, and connection status.*

## What does the dashboard give you?

The **Fleet** page opens with a single number: the share of workloads still on latest across every connected cluster. Under that, each cluster is a horizontal lane of stacked drift segments. Click a segment and you land in the artifact ledger already filtered to that cluster and drift class. The right rail surfaces what needs attention (degraded clusters, failed scans), recent scan history, and connection health.

Open a cluster and the same chart language zooms to **namespace lanes**. You see schedule, API server, last scan, a drift breakdown, a short trend, and the mix of images versus Helm charts. Recent scans are clickable: each "View artifacts" link opens the ledger scoped to that scan's cluster.

![Cluster detail for prod-eu: namespace drift lanes, breakdown, and recent scans](/blog/omastx/cluster_drift.webp)
*Cluster detail: namespace-level drift bars, analytics cards, and scan history with one-click jump into the ledger.*

Not every cluster grants the same RBAC. If secrets access is missing, Omastx stays useful in **images-only** mode: Helm discovery is skipped, the cluster is marked DEGRADED, and you get a clear banner explaining what permission to add. Unknown drift appears when a registry cannot be resolved (for example a private host without credentials).

![Degraded cluster prod-us: images-only mode with unknown drift](/blog/omastx/cluster_degraded.webp)
*Degraded cluster: Helm access missing, images still scanned, Unknown segment when a registry cannot be resolved.*

The **Artifacts** ledger is the global, filterable list of every discovered image and chart, sorted by how far it has drifted. Filter by cluster, kind (image or chart), drift class, and namespace; search by name. Each row shows installed → latest and a drift badge.

![Artifact ledger across the fleet](/blog/omastx/artifacts.webp)
*Artifacts page: every image and Helm chart, sorted by drift, with cluster / kind / class filters.*

Click a row to open the **artifact detail** sheet: identity, registry or chart repo URL, match confidence for Helm, releases behind, history sparkline, and candidate versions when the tag channel allows a comparison.

![Filtered ledger and artifact detail for ingress-nginx major drift](/blog/omastx/artifact_detail.webp)
*Drill-down: filter to major drift in a namespace, then open the sheet for installed → latest, confidence, and metadata.*

![Ledger filtered to prod-eu / platform / major](/blog/omastx/artifacts_filtered.webp)
*Same ledger after narrowing to one cluster, one namespace, and major drift only.*

**Connect a cluster** is a guided flow: drop or paste a kubeconfig, pick contexts, review the permission matrix, set a name and cron schedule. The copy on the page is the product promise: read-only access only; Omastx never writes to your clusters.

![Connect cluster onboarding with kubeconfig drop zone](/blog/omastx/connect.webp)
*Connect flow: drop or paste a read-only kubeconfig; Omastx checks permissions before saving.*

Scans run on a per-cluster schedule (or on demand with **Scan now**) with live progress over SSE. Credentials for private registries can be attached when Unknown drift points at auth-required hosts. Export the ledger as CSV or JSON when you need to take the data elsewhere.

## Requirements

- Docker with the Compose plugin (quickest path), **or** Go 1.26+ and Node 20+ for native development
- PostgreSQL (bundled in Compose; external for typical Helm installs)
- A read-only kubeconfig per cluster (get/list on workloads; secrets for Helm release discovery)
- For production: a [GitHub OAuth App](https://github.com/settings/developers) and membership in the configured GitHub org (or your username for a solo install)

## Preparation steps

### 1. Clone the repository

```bash
git clone https://github.com/banshee86vr/omastx.git
cd omastx
```

### 2. Start locally with Docker Compose

```bash
make dev   # or: docker compose -f deploy/docker-compose.yml up --build
```

Open http://localhost:8080. In this mode you are signed in automatically (no credentials or `.env` file required).

### 3. (Optional) Native development with hot reload

For day-to-day coding, run Postgres in Docker and the API + Vite on the host:

```bash
make dev-local
```

Open http://localhost:5173. Vite proxies `/api` to the backend on `:8484` and signs you in automatically.

### 4. Connect a cluster and scan

In the UI, open **+ Connect cluster**, drop a read-only kubeconfig, select the contexts to import, confirm the permission check, and set a scan schedule. Click **Scan now** on the cluster page (or wait for the cron). When the scan finishes, the Fleet headline and drift lanes update; open **Artifacts** to walk the ledger.

### 5. (Optional) Seed demo data

To explore the UI without a real fleet, the repository includes a seed path used for the screenshots in this article (`make seed` / the article capture script under `docs/screenshots/article/`).

## Architecture (in short)

Frontend: React 18 + TypeScript with Vite, custom design tokens (no UI kit / Tailwind), and charts built for the drift lanes. Backend: Go service (chi, pgx, sqlc) that owns the API, session auth, scanner, and pluggable `ArtifactProvider` / `VersionResolver` interfaces so new package kinds can be added without rewriting the orchestrator. PostgreSQL stores clusters (kubeconfigs encrypted at rest), scan snapshots, observations, and cache. Discovery is read-only against the Kubernetes API; image tags resolve from OCI registries, Helm charts from repo indexes and Artifact Hub heuristics. Production auth is GitHub OAuth gated by organization membership; local Compose/dev mode uses passwordless sign-in.

## Docker Compose

The Compose stack under `deploy/docker-compose.yml` builds and runs Postgres, the Go API, and the nginx-fronted frontend. Images for releases are published to GitHub Container Registry: `ghcr.io/banshee86vr/omastx-backend` and `ghcr.io/banshee86vr/omastx-frontend`.

```bash
make dev          # build and start
# open http://localhost:8080
```

## Deploying to Kubernetes

Omastx ships a Helm chart in `deploy/chart/omastx`. Create a Secret with the master key, GitHub OAuth credentials, org gate, base URL, and database URL, then install with `existingSecret` (values never template secrets inline).

Register a GitHub OAuth App with callback `${OMASTX_BASE_URL}/api/auth/github/callback`. Only members of `OMASTX_GITHUB_ORG` can sign in.

```bash
kubectl create secret generic omastx \
  --from-literal=OMASTX_MASTER_KEY=$(openssl rand -hex 32) \
  --from-literal=OMASTX_GITHUB_CLIENT_ID=... \
  --from-literal=OMASTX_GITHUB_CLIENT_SECRET=... \
  --from-literal=OMASTX_GITHUB_ORG=your-org \
  --from-literal=OMASTX_BASE_URL=https://omastx.example.com \
  --from-literal=DATABASE_URL=postgres://user:pass@host:5432/omastx

helm install omastx deploy/chart/omastx --set existingSecret=omastx
```

For a throwaway test install with bundled Postgres:

```bash
helm install omastx deploy/chart/omastx \
  --set existingSecret=omastx --set postgres.internal.enabled=true
```

The chart runs non-root containers with hardened security contexts; the product itself never requests Kubernetes write permissions on the clusters it monitors.

## Bottom line

With `make dev` you get a portal that answers one question for your whole fleet: how far have we drifted from latest? Connect read-only kubeconfigs, scan on a schedule, navigate Current → Deprecated on the chart, and drill into every image and Helm chart in the ledger. Self-hosted, open-source, no write path into your clusters. For anyone running more than one Kubernetes environment, Omastx is the drift view that `kubectl` and `helm list` never aggregate for you.
