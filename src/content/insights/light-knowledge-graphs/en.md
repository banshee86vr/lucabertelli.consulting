---
key: "light-knowledge-graphs"
lang: "en"
title: "When a light knowledge graph makes a platform migration possible"
subtitle: "People and AI agents need queryable facts. Without them, large CI/CD migrations stay tribal and stall."
seoTitle: "Knowledge graphs for agents and migrations | Luca Bertelli"
date: "2026-08-14"
image: "/insights/light-knowledge-graphs/light-knowledge-graphs.webp"
relatedServices: ["knowledge-graphs", "ai-engineering", "platform-engineering", "devops"]
---

## The migration that never starts

Migrating a legacy CI/CD platform almost always starts uphill, when it does not fail outright, if nobody can answer four questions without hours or days of work:

1. Which use cases do we actually cover, and with which technologies?
2. What does the target CI/CD platform and library already cover?
3. What is missing, and how often does it show up?
4. Which work units look alike enough to map onto a reusable model?

Even trying to migrate with an AI agent alone, without a base of queryable facts, the project tends to become inefficient and too expensive: you still need a reliable map, and without it both people and agents waste time on guesses and retries, which makes real planning and progress hard to estimate.

That is the point at which [knowledge graph consulting](/en/services/knowledge-graph-consulting/) stops being a research exercise and becomes the condition that makes the migration sustainable.

## Facts, not more context

You often start from hundreds, if not thousands, of files whose code has not been verified or maintained over time. In that setting AI agents hit a basic limit: prior knowledge is not in the prompt; it is spread across catalogues, inventories, repositories and the memory of a few people (often no longer around). Simply adding more files to the context does not increase coverage; it only produces more confident guesses.

A light knowledge graph flips the approach. Typed facts are extracted from the sources through a deterministic, repeatable process, without involving AI agents. You get a clear schema of nodes, directed relationships and a carefully maintained mapping, so two elements with different names can be recognised as the same intent or purpose. That puts people and AI agents in a position to navigate them, including through dedicated MCP servers.

The graph does not migrate anything. It tells you what is ready, what is blocked, and what would be unsafe to invent. Humans still decide. Agents stop filling holes with fiction.

## What "light" means

This is not an enterprise knowledge-graph programme. It is not Neo4j as a technology choice. It is not RDF (Resource Description Framework), where data is subject-predicate-object triples typical of the Semantic Web and formal ontologies. Here we mean a pragmatic, light approach, not a semantic framework. It is not a second wiki people are asked to keep in sync by hand either. Nodes, properties and relationships are defined ad hoc, fitted to the client's context and use cases.

Light means:

- the schema fits in a review;
- extractors read artefacts the organisation already owns;
- mapping is a file you can disagree with, not a model that infers meaning;
- refresh stays cheap in resources and does not need the heavy refresh cycles typical of RAG or graphRAG.

## The CI/CD case, without the folklore

Take a legacy CI/CD platform with years of pipelines, shared steps, credentials and one-off scripts. The destination has reusable pieces. On paper the move is obvious. In practice you cannot size it, because "what we have" and "what they cover" do not share a join key.

A capability mapping is that join. Primitives on the source side (a step, a task, a CLI) and providers on the target side (a reusable workflow, a template) meet on the same intent. Then coverage becomes a simple query. Gaps rank by how much work they block. Similar pipelines become models you can reduce to covered capabilities and use cases.

Without that, teams either freeze or, more often, rewrite everything from scratch. The rewrite feels like progress for a quarter, then you fall back into not knowing what is missing and how many cases were actually covered. Security follows the same cut. You cannot claim a safer target if you cannot list which credentials, which privileged commands and which unmapped paths would be copied blindly.

## What you need to start

[DevOps consulting](/en/services/devops-consulting/) helps you get solid delivery practice: pipelines that work, ownership that is not a single person. [Platform Engineering](/en/services/platform-engineering-consulting/) can arrive only once golden paths can be defined, after the routes worth extracting are identified. [AI agent governance](/en/services/ai-agent-governance/), when the move toward agents has happened or is underway, is essential to define and maintain policy, identity and cost.

The graph is the layer underneath when AI agents, mapping of what exists and migrations need the same operational truth. MCP without facts is another integration. A platform programme without an inventory risks becoming a portal that exists for its own sake.

## When it makes sense

If you can already answer the four questions above, you probably do not need this. If answering them means asking one specific colleague, a chain of greps and a meeting where three maps disagree, [email me](mailto:info@lucabertelli.consulting) so we can look together at the use case you want to analyse (how many work units, which catalogues exist, who or what holds the map today). The service page spells out scope, outcomes and FAQ: [knowledge graph consulting](/en/services/knowledge-graph-consulting/).
