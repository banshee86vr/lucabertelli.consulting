---
key: "ai-engineering"
lang: "en"
title: "AI Agent Governance and Adoption"
tagline: "Adopting AI agents in the enterprise with clear rules, controlled risk and predictable spend."
seoTitle: "AI Agent Governance and Adoption Consulting | Luca Bertelli"
description: "Consulting on AI agent governance and adoption across Italy and the EU: usage policy, security hardening, Model Context Protocol integration and inference cost control."
order: 7
keywords:
  - "AI agent governance"
  - "AI agent adoption"
  - "AI agent consulting"
  - "enterprise AI governance"
  - "AI agent security"
  - "AI engineering"
  - "Model Context Protocol"
  - "AI inference cost"
relatedTags: ["mcp", "devsecops", "observability", "kubernetes"]
credentials: ["cka", "vault-professional", "terraform_associate"]
outcomes:
  - "Agents in production with a defined and auditable scope of action"
  - "Inference spend attributed per team and use case, with enforced limits"
  - "Agent access managed as an identity rather than a shared key"
  - "Explicit criteria for deciding where AI genuinely helps and where it does not"
deliverables:
  - "Use case assessment, ordered by expected value and risk"
  - "Usage policy: permitted data, allowed actions, human approval points"
  - "Integration architecture, including MCP servers and internal system access"
  - "Hardening: execution isolation, secrets management, action auditing"
  - "Budget model and token consumption monitoring"
faq:
  - question: "What does AI Engineering consulting cover?"
    answer: "The lifecycle of AI agents in an enterprise context: selecting the use cases that justify the investment, governance and usage policy, integration architecture with internal systems, security hardening and cost control. It is not model consulting, it is consulting on the infrastructure and the rules that make an agent usable in production."
  - question: "What security risks are specific to AI agents?"
    answer: "The two I treat as priorities are indirect prompt injection, where an agent reading external content can be induced to take unintended actions, and excessive permission scope, because agents are routinely granted credentials far broader than their task requires. Both are addressed with the same least-privilege principle applied to services, plus complete auditing of the actions taken."
  - question: "What is the Model Context Protocol and when is it worth using?"
    answer: "MCP is an open standard for exposing data and tools to AI agents through a uniform interface. It pays off when several agents or clients need access to the same internal systems: instead of writing a dedicated integration for each, you expose an MCP server that centralises access, permissions and auditing. I have published an article on a concrete application of it to Kubernetes fleet monitoring."
  - question: "How do you keep inference costs under control?"
    answer: "By attributing them before they grow. Every use case has a budget, token consumption is tracked per team and per feature, and limits are enforced automatically. The cost that most often escapes notice is not the occasional expensive prompt, it is an agent stuck in a retry loop that nobody capped."
  - question: "Do we need a self-hosted model or is a managed service enough?"
    answer: "In most cases a managed service is adequate. Self-hosting makes sense with genuine data confidentiality constraints or sovereignty requirements, and should be assessed including the operational cost it carries. The decision follows the actual constraints, not the impression that running things in-house is automatically safer."
  - question: "When does AI agent governance consulting make sense?"
    answer: "When agents are already entering the company without a shared perimeter, or when you want to adopt them deliberately before they proliferate. Typical signals are shared API keys, no inventory of use cases, no spend limits, and the question 'who authorised this agent to read that data?' with no clear answer."
---

## The problem I usually find

AI agents enter companies from the bottom up. A developer tries an assistant, a team automates a support flow, someone wires a model to an internal system for a prototype. Within a few months there are several integrations nobody has inventoried, with shared API keys and no clear picture of which data is crossing which service.

The second problem is financial and follows shortly after. Inference spend does not have the predictable profile of a virtual machine: it depends on how much the agent is used and how much context it drags along on each call. Without attribution per use case, the monthly invoice becomes a single number nobody can decompose and therefore nobody can reduce.

## How I work

We start with use case selection, which is mostly an exercise in exclusion. Many tasks proposed for AI automation are cheaper and more reliable solved with ordinary code. The criterion I use is error tolerance: where an approximate answer is cheap and verification is quick, an agent adds value; where deterministic exactness is required, almost never.

For the tasks that pass the filter, we define the operating scope. Which data the agent may read, which actions it may take on its own, which require human approval. It looks like a formality and is instead the part that determines whether the system stays manageable: without explicit limits you discover the real scope only when something goes wrong.

## Security and integration

Technically an agent should be treated as a service with its own identity, not as a tool inheriting the credentials of whoever invokes it. That means minimal and specific permissions, secrets managed through Vault rather than static keys, isolated execution for any generated code, and a complete record of the actions taken.

Indirect prompt injection deserves particular attention because it has no direct equivalent in traditional security models: an agent processing externally sourced content can be induced to perform actions no user requested. The practical mitigation is the same one that applies to any untrusted component, namely reducing what it is able to do rather than hoping it interprets correctly what it reads.

On integration, when several agents need access to the same internal systems it is worth exposing an MCP server instead of multiplying bespoke integrations. It centralises access, permissions and auditing in one place, which is also the only realistic way to keep them consistent over time.

MCP still needs something true to query. If the inventory of how systems actually work lives in thousands of files and a few people's heads, agents fill the gaps with guesses. That is a [light knowledge graph](/en/services/knowledge-graph-consulting/) problem, not a model problem.
