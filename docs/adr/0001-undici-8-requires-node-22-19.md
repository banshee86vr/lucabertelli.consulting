# 0001: Raise Node to 22.19+ for undici 8

- Status: Accepted
- Date: 2026-08-27

## Context

Dependabot and Renovate push undici toward major 8. Patched undici 8.x
releases require Node >= 22.19.0. The previous override pinned undici to
7.29.x so the repo engines floor of >= 22.12.0 stayed valid, but that
blocked the undici 8 upgrade path and left Renovate opening conflicting
PRs.

## Decision

Set `pnpm.overrides.undici` to `>=8.9.0` (earliest patched 8.x line) and
raise `engines.node` (and README prerequisites) to `>=22.19.0`.

## Alternatives considered

- Stay on undici 7.29.x: keeps Node 22.12+, but fights Renovate and leaves
  the tree on an older major while wrangler/miniflare already prefer 8.x.
- Override `>=7.29.0 <9.0.0` as Renovate proposed: still allows vulnerable
  undici 8.0 through 8.8.

## Consequences

Local and Cloudflare Workers Builds must use Node 22.19 or newer.
undici resolves to a single 8.10.x (or newer patched 8.x) in the lockfile.
