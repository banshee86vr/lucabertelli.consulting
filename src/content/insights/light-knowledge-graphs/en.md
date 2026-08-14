---
key: "light-knowledge-graphs"
lang: "en"
title: "When a light knowledge graph makes a platform migration possible"
subtitle: "People and agents need queryable facts. Without them, large CI/CD platform moves stay tribal and stall."
seoTitle: "Knowledge graphs for agents and migrations | Luca Bertelli"
date: "2026-08-14"
image: "/insights/light-knowledge-graphs/light-knowledge-graphs.webp"
relatedServices: ["knowledge-graphs", "ai-engineering", "platform-engineering", "devops"]
---

## The migration that never starts

A large move off a legacy CI/CD platform rarely dies in the YAML. It dies earlier, when nobody can answer four questions without a week of archaeology:

1. What do we actually run?
2. What does the target already cover?
3. What is missing, and how often does it show up?
4. Which work units look alike enough to reuse a pattern?

Until those answers are queryable, the project stays tribal. A few people hold the map. Everyone else greps. Agents, given a repository, invent an inventory that reads well and is wrong where it would hurt. Efficiency, security and calendar time are discussed as goals; they cannot be measured as a plan.

That is the point at which a [light knowledge graph](/en/services/knowledge-graph-consulting/) stops being a research toy and becomes the condition that makes the migration thinkable.

## Facts, not more context

Coding agents fail on this class of work for a boring reason: the facts are not in the prompt. They are spread across catalogues, inventories, repositories and a handful of heads. Dumping more files into context does not produce coverage. It produces confident guesses.

A light knowledge graph is the opposite move. Extract typed facts from sources you already maintain. Keep a small schema: nodes, directed relationships, a curated mapping so the same intent under different names can be compared. Rebuild it as a pipeline. Let people browse it. Let agents query the same facts over MCP.

The graph does not migrate anything. It tells you what is ready, what is blocked, and what would be unsafe to invent. Humans still decide. Agents stop filling holes with fiction.

## What "light" rules out

This is not an enterprise knowledge-graph programme. It is not Neo4j as a product decision. It is not RDF, not a six-month ontology workshop, and not a second wiki that people are asked to keep in sync by hand.

Light means:

- the schema fits in a review;
- extractors read artefacts the organisation already owns;
- mapping is a file you can disagree with, not a model that infers meaning;
- refresh finishes before the sources have moved again.

If one person still holds a handful of systems in their head, a spreadsheet is cheaper. The graph earns its keep when the file count, the tool count and the cost of being wrong all go up together.

## The CI/CD case, without the folklore

Take a legacy CI/CD platform with years of pipelines, shared steps, credentials and one-off scripts. The destination platform has reusable pieces. On paper the move is obvious. In practice you cannot size it, because "what we have" and "what they cover" do not share a join key.

A capability mapping is that join. Primitives on the source side (a step, a task, a CLI) and providers on the target side (a reusable, a template) meet on the same intent. Then coverage is a query, not a workshop. Gaps rank by how much work they block. Similar pipelines become templates instead of folklore.

Without that, teams either freeze or rewrite everything from scratch. I have watched both. The rewrite feels like progress for a quarter and then you still cannot say what is left. The freeze feels responsible and quietly burns a year. A queryable graph is how you avoid choosing between those two failures.

Security follows the same cut. You cannot claim a safer target if you cannot list which credentials, which privileged commands and which unmapped paths would be copied blindly. Time follows it too: sequenced work beats a heroic cut-over that nobody can estimate.

## How this sits next to the other work

[DevOps consulting](/en/services/devops-consulting/) still owns delivery practice: pipelines that work, ownership that is not a single person. [Platform Engineering](/en/services/platform-engineering-consulting/) still owns golden paths once you know which paths are worth extracting. [AI agent governance](/en/services/ai-agent-governance/) still owns policy, identity and spend.

The graph is the layer underneath when agents and migrations need the same operational truth. MCP without facts is another integration. A platform programme without an inventory is a portal on top of folklore.

## When to call

If you can answer the four questions above from a system, you do not need this. If answering them takes a hero, a grep marathon and a meeting where three maps disagree, [email info@lucabertelli.consulting](mailto:info@lucabertelli.consulting) with the surface you are trying to move (how many work units, which catalogues exist, who today is the map). Three precise sentences beat a slide deck. The service page spells out scope, outcomes and FAQ: [light knowledge graph consulting](/en/services/knowledge-graph-consulting/).
