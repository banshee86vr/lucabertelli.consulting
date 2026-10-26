# 0003: Publish one Agent Skill for reading the practice

- Status: Accepted
- Date: 2026-10-26

## Context

Agents look for skills at `/.well-known/agent-skills/index.json`, as defined by the Agent Skills Discovery RFC v0.2.0. This origin already publishes an A2A card whose skills are the nine services. Those entries describe the practice. They are not Agent Skills artifacts, and they have no `SKILL.md` bytes to hash. The site is public and read-only: it does not ship scripts, reference files, or a task runner.

## Decision

The Worker serves an Agent Skills discovery index at `/.well-known/agent-skills/index.json`, and the same JSON is written into the build. `$schema` is `https://schemas.agentskills.io/discovery/0.2.0/schema.json`. The index lists one skill, `consulting-practice`, with type `skill-md`. The artifact is `/.well-known/agent-skills/consulting-practice/SKILL.md`, served as `text/markdown`. The index `description` is the frontmatter `description`. The `digest` is `sha256:` plus the SHA-256 of that file's raw bytes. The `url` is path-absolute and resolves against the index URL. `GET` and `HEAD` return 200. `POST` returns 405. Responses allow any origin to read them, because the documents are already public. Both paths are in `run_worker_first`, and `_headers` sets the same content types for the asset path. The index is not an HTML route and is not in the sitemap. The skill tells an agent to read `llms.txt`, `auth.md`, and the agent card. It does not repeat the service pages.

## Alternatives considered

- An empty `skills` array. The document would parse and would not tell an agent how to read this origin.
- One `SKILL.md` per service. That copies the A2A card and the service pages. A title edit would change the digest even though `llms.txt` already publishes that title.
- An archive. The skill has no scripts or reference files. The RFC uses `skill-md` for a single `SKILL.md`.
- Static files only. The asset host would choose the content type for `SKILL.md`. The Worker already sets the type for the other discovery documents and answers `HEAD`.

## Consequences

A client fetches the index, fetches the one skill, and checks the digest before using the text. Adding a service does not require an edit here, because the skill sends the agent to `llms.txt`. Changing the skill text changes the digest in the same build, and the discovery check fails if the served bytes and the digest diverge. The isitagentready scan of the live origin stays unchanged until this is deployed.
