---
key: "cloud"
lang: "en"
title: "Cloud Consulting and Migration"
tagline: "Cloud adoption and migration of applications and infrastructure, with costs under control and without rewriting everything on day one."
seoTitle: "Cloud Consultant and Migration Services | Luca Bertelli"
description: "Cloud consulting across Italy and the EU: adoption strategy, migration of applications and infrastructure to AWS, Azure and Google Cloud, governance and cost control."
order: 2
keywords:
  - "cloud consultant"
  - "cloud consulting"
  - "cloud migration"
  - "cloud adoption"
  - "cloud consultant Italy"
  - "cloud cost governance"
relatedTags: ["kubernetes", "observability", "fleet-management", "helm"]
credentials: ["vmware_master", "terraform_associate", "cka", "vault-professional"]
outcomes:
  - "A migration strategy ordered by risk and value rather than a big bang"
  - "Cloud environments that are consistent with each other and rebuildable from code"
  - "Predictable cloud spend, attributed to the teams and projects that generate it"
  - "No accidental lock-in: binding choices are explicit and justified"
deliverables:
  - "Assessment of the application portfolio and workload classification"
  - "Wave-based migration plan with exit criteria for each wave"
  - "Landing zone and account/subscription structure in Terraform"
  - "Governance model: naming, tagging, budgets and spend alerts"
  - "Assisted migration of the first workloads, as a reference for the rest"
faq:
  - question: "Where does a cloud migration start?"
    answer: "With an honest inventory of what you already have. Before choosing a provider or an architecture you need to know which applications exist, how they are coupled, what data they handle and which regulatory constraints apply. Only then does it make sense to decide what moves as-is, what gets reworked, and what is better left where it is."
  - question: "Is it always worth migrating everything to the cloud?"
    answer: "No, and saying so is part of the job. Some workloads have a steady, predictable usage profile that simply costs more in public cloud. Others are tied to hardware or licences that make migration disproportionate to the benefit. A credible plan also states what stays put."
  - question: "Which cloud providers do you work with?"
    answer: "AWS, Microsoft Azure and Google Cloud, along with hybrid and on-premise scenarios built on Kubernetes. The approach is to keep automation as portable as possible using Terraform and CNCF tooling, and to make every provider-specific dependency explicit."
  - question: "How do you keep cloud costs from running away?"
    answer: "By making them visible before they become a problem. That means a tagging convention applied from day one, budgets and alerts per environment, resource sizing reviewed periodically, and automatic shutdown of non-production environments. Most of the waste I encounter does not come from bad choices but from resources nobody can attribute to an owner any more."
  - question: "How long does a cloud migration take?"
    answer: "The first waves of non-critical workloads typically complete within weeks once the landing zone is ready. A large application portfolio takes several months. Working in waves exists precisely to deliver value continuously instead of waiting for one large project to end."
---

## The problem I usually find

Cloud rarely arrives as a single decision. In most organisations I work with it crept in piecemeal: a team that opened an account for a prototype, a vendor that brought its own infrastructure, a partial migration abandoned halfway. The result is an unplanned hybrid environment, with accounts nobody governs and spend that grows without anyone knowing who produces it.

The opposite variant is just as common: the "lift and shift" that completed but never really finished. Virtual machines were moved, the architecture stayed exactly as before, and now you pay for the same resources plus the provider's margin. Cloud is perceived as a failure when in fact it was never adopted, only rented.

## How I work

The starting point is workload classification. Each application is assessed on how tightly it is coupled to the underlying infrastructure, what data it handles, which regulatory constraints apply and how variable its usage profile is. That grid makes it reasonably clear what should move as-is, what should be reworked during migration, and what is better left where it is.

Before anything moves, the landing zone gets prepared: account structure, networking, identity and permissions, secrets management, naming and tagging conventions. All described in Terraform, because a cloud environment built by hand reproduces within two years exactly the mess it was meant to escape.

Migration then proceeds in waves, starting with low-risk workloads that validate the automation. Each wave has explicit exit criteria, and the first ones are executed together with the internal team so they become the template for the rest.

## Cost governance, from day one

Controlling spend is not a final optimisation phase, it is a property you build in from the start. If tagging is consistent from the first deployment, attributing cost to a team or a project is immediate; introduce it later and it becomes reconstruction across resources whose history is lost.

In practice that means budgets and alerts per environment, periodic sizing reviews, automatic shutdown of what is not needed outside working hours, and one simple rule: every resource must have an identifiable owner.
