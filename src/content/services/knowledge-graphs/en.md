---
key: "knowledge-graphs"
lang: "en"
title: "Temporal Knowledge Graph Consulting"
tagline: "Small, deterministic graphs of how your systems actually work, and temporal graphs of how they change, so people and agents query facts, including facts about the past, instead of trying to deduce them."
seoTitle: "Temporal Knowledge Graph Consulting | Luca Bertelli"
description: "Knowledge graph and temporal knowledge graph consulting in Italy and the EU: operational facts, time-aware memory for AI agents, and MCP access."
order: 8
keywords:
  - "knowledge graph consulting"
  - "temporal knowledge graph"
  - "temporal knowledge graph consulting"
  - "operational knowledge graph"
  - "knowledge graph for AI agents"
  - "AI agent memory"
  - "MCP knowledge graph"
  - "CI/CD platform migration"
relatedTags: ["mcp", "cicd", "observability"]
credentials: ["cka", "terraform_associate"]
outcomes:
  - "A queryable inventory of how systems actually work, not a slide of how they should"
  - "Humans and AI agents reading the same facts, instead of grepping and guessing"
  - "Coverage and gaps visible before a large platform migration starts"
  - "Facts with a timeline: what was true, when it changed, and what an agent can safely recall"
  - "A graph the internal team can rebuild, not a one-off consultancy artefact"
deliverables:
  - "Scope: which sources matter, which questions the graph must answer, what stays out"
  - "Typed schema: node and relationship kinds small enough to keep honest"
  - "Extractors from the catalogues, inventories and APIs you already run"
  - "Curated mapping layer so primitives join on capabilities, not on names"
  - "Temporal check where history may have changed: validity intervals, point-in-time queries, incremental updates"
  - "Query surface for people (explorer) and for agents (MCP), plus a repeatable refresh"
faq:
  - question: "What is a pragmatic knowledge graph?"
    answer: "A small, typed graph of operational facts extracted from systems you already have: catalogues, inventories, repositories, APIs. Nodes and directed relationships are explicit, the mapping layer is curated, and a rebuild produces the same result. It is not an enterprise ontology, not a graph-database product, and not a project that starts by modelling the whole company."
  - question: "How is this different from a graph database or a data-catalogue knowledge graph?"
    answer: "Those approaches assume you already know what to put in the graph and that the hard part is storage, search or governance at scale. Here the hard part is choosing a schema small enough to stay true, wiring extractors to sources that already exist, and exposing the same facts to people and to agents. The store is an implementation detail; an embeddable database is usually enough."
  - question: "When is a knowledge graph worth building?"
    answer: "When the answers you need live in thousands of files, several tools, and a few people's heads, and when guessing is expensive. Typical signals: a platform migration nobody can size, AI agents that sketch the inventory without certainty, or the same question answered differently depending on who you ask."
  - question: "What is a temporal knowledge graph?"
    answer: "A knowledge graph where facts carry their own temporal data: when they became true, when they stopped being true, and when the system learned them. New information does not overwrite; it invalidates the fact it contradicts. Questions can then be answered at a precise instant in time: what did the platform look like in March, what changed since the last audit, which owner was responsible when the incident happened."
  - question: "How does a temporal knowledge graph give AI agents memory?"
    answer: "Agents keep re-deriving the state of the world in every session because nothing persists between calls. With a temporal graph, new observations are ingested incrementally as episodes, contradictions invalidate old facts instead of deleting them, and an agent can retrieve what is true now, what was true at a given moment, and how it evolved. Memory becomes a set of queryable facts with provenance, not a transcript injected into the prompt."
  - question: "How do AI agents use the graph?"
    answer: "Through MCP, so any compatible IDE, CLI or assistant queries the same facts the explorer shows. Agents stop grepping repositories and stop filling gaps with plausible fiction. The graph remains read-oriented for them: they look up coverage, blockers and similar work units; changes to source catalogues still go through the team's normal review."
  - question: "Why do large CI/CD platform migrations stall so often without one?"
    answer: "Because the work is not writing the pipelines. It is knowing what already exists, what the target platform already covers, what is missing, and which work units look alike. Without that, teams either freeze or rewrite everything from scratch. Migrations that looked impossible on a file count alone become a sequenced plan once coverage and gaps are queryable. In those cases, a knowledge graph stops being optional."
  - question: "What do we keep after the engagement?"
    answer: "The schema, the extractors, the mapping, the query surface and the refresh path. The internal team should be able to rebuild the graph from sources without further consulting. If the graph only exists while we are collaborating, the engagement failed."
---

## The problem I usually find

The map of how a platform actually works lives in the wrong places: a few people's heads, an outdated wiki, and thousands of files nobody wants to review again. When a team asks "what do we run, what is already covered, what would block a move", the honest answer is days of manual reconstruction and three conflicting opinions.

AI agents make the gap louder. Given a repository they reconstruct by intuition a picture of what exists that reads well and is wrong in the places that matter. More context in the prompt does not fix that. They need facts they can query, with types and relationships that do not change meaning between calls.

## How I work

We start from the questions the graph must answer, not from a vocabulary of the business. Which sources already exist (catalogues, inventories, APIs, repositories). Which node and relationship kinds are enough. What we refuse to model, because a graph that pretends to cover everything becomes a second wiki.

Then extractors, not people filling forms. Facts come from artefacts the organisation already maintains. A curated mapping layer joins those primitives on capabilities: the same intent under different names becomes comparable. The store stays small and rebuildable. If you cannot regenerate the graph from sources, you do not have a graph; you have a snapshot.

People get an explorer. Agents get the same facts over MCP. One source of truth, two interfaces. Refresh is a pipeline you re-run, not a committee that tends an ontology.

## When the graph needs a clock

Some questions are not about what is true but about what was true, and when it stopped being. Which team owned this service when the incident happened. What the platform looked like before the last reorganisation. What an agent already learned about a customer in previous sessions. A snapshot graph, however honest, cannot answer them: every rebuild throws the past away.

A temporal knowledge graph keeps it. Each fact carries its validity intervals: when it became true, when it ceased to be, and separately when the system learned it. New observations arrive incrementally as episodes; when they contradict an existing fact, they invalidate it instead of deleting it. The result is a graph you can query at a point in time, and a memory AI agents can actually use: recall what held, see how it changed, and stop re-deriving the world from scratch in every session.

I add this layer only where the domain needs it. Inventories and coverage maps stay rebuildable snapshots; the additional temporal layer is for conversations, ownership, incidents and anything where history carries decisive weight. Same discipline as the rest: a typed schema, explicit relationships, and no product lock-in dictating the model.

## When it stops being optional

A large migration of a legacy CI/CD platform is the case I keep seeing. The target is not the problem; the unknown surface is. Without a graph of work units, coverage and gaps, the project is either frozen or rewritten from zero, which is how you spend a year moving and still cannot say what is left.

With the graph, coverage is a query. Gaps are ranked. Similar pipelines become templates instead of folklore. Efficiency, security and calendar time stop being slogans because you can point at what is ready, what is blocked, and what would be unsafe to invent. I do not claim every migration needs this. I do claim that past a certain size, many of them are unthinkable without it.

## A pragmatic scope

Pragmatic means no enterprise knowledge-graph suite, no RDF programme, and no six-month ontology workshop. The result is a typed schema you can hold in your head, extractors you can read, a mapping file you can disagree with in a review, and a refresh that finishes before the sources have moved again.
