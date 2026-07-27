---
key: "platform-engineering"
lang: "en"
title: "Platform Engineering"
tagline: "Internal Developer Platforms designed to reduce developer cognitive load instead of moving it somewhere else."
seoTitle: "Platform Engineering and Internal Developer Platform Consulting | Luca Bertelli"
description: "Platform Engineering consulting: Internal Developer Platform design, golden paths, self-service on Kubernetes, and measuring real adoption by product teams."
order: 3
keywords:
  - "platform engineering"
  - "platform engineering consulting"
  - "internal developer platform"
  - "IDP"
  - "golden path"
  - "developer experience"
relatedTags: ["kubernetes", "multi-tenancy", "cicd", "vcluster"]
credentials: ["cka", "capa", "terraform_associate", "kong-konnect"]
outcomes:
  - "A new developer reaches production in days rather than weeks"
  - "Standard paths that are the easiest route, so they get chosen willingly"
  - "The platform team stops being a ticket desk and goes back to building"
  - "Security and compliance standards applied by construction, not by review"
deliverables:
  - "Internal user research: where time is actually lost in the development cycle"
  - "Platform design and definition of the golden paths"
  - "Self-service templates for creating services, environments and pipelines"
  - "Developer portal and service catalogue"
  - "Adoption metrics and a feedback loop with consuming teams"
faq:
  - question: "What is Platform Engineering?"
    answer: "It is the discipline of treating internal infrastructure as a product whose real users are the company's own developers. Instead of asking every team to assemble Kubernetes, pipelines, secrets and observability by themselves, an internal platform offers ready and safe paths for recurring tasks, while keeping an escape hatch open when something unusual is needed."
  - question: "How is Platform Engineering different from DevOps?"
    answer: "DevOps describes a set of practices and a culture of collaboration between development and operations. Platform Engineering is an organisational answer to a problem DevOps created at scale: expecting every team to master the entire stack does not scale beyond a certain number of teams. The platform encapsulates that complexity behind stable interfaces."
  - question: "Does my company actually need an Internal Developer Platform?"
    answer: "Below three or four development teams, almost never: the cost of building and maintaining one outweighs the benefit. It starts to make sense when the same configuration is recreated slightly differently by several teams, when onboarding a service takes weeks, or when the infrastructure group spends most of its time answering repetitive requests."
  - question: "Do you use Backstage or similar tools?"
    answer: "Backstage is a reasonable choice for the catalogue and the portal, but it is only the visible part. The substance is in what the portal triggers: scaffolding templates, environment provisioning, policies applied automatically. I have also worked with Krateo PlatformOps, which I co-founded, and the tool choice always comes after the golden paths are defined."
  - question: "How do you measure whether the platform is working?"
    answer: "Through voluntary adoption, which is the only honest indicator: if teams use the standard paths without being forced to, the platform is solving a real problem. Alongside that I track the time from first commit to first production deployment for a new service, and the share of platform-team requests that have become self-service."
---

## The problem I usually find

Once an organisation passes three or four development teams, the promise that "every team owns its stack" starts to crack. Each team configured Kubernetes its own way, wrote its own pipelines, picked its own approach to secrets. None of those choices is wrong in isolation; the aggregate is unmanageable.

At that point one of two things happens. Either the infrastructure group becomes a ticket desk, buried under repetitive requests that consume it entirely, or developers work around it and the risk surface grows quietly. In both cases the time needed to get a new service into production is measured in weeks, and nobody can explain precisely why.

## How I work

The first phase is not technical. I talk to the developers who will use the platform and reconstruct what they actually do in a working week: which steps they repeat, where they wait on someone else, which configurations they copy between projects without fully understanding them. A platform built on assumptions rather than observation ends up automating the wrong problems.

From there we define the golden paths: standard routes for recurring tasks, from creating a new service to promoting between environments. What makes them effective is not enforcement, it is being the easiest option. If the standard path is also the most convenient one, it gets chosen without any policy.

It has to remain possible to step off it, though. Platforms that fail are almost always the ones that removed the developers' ability to do something unforeseen: the first legitimate case the model does not cover turns them from accelerator into obstacle.

## Building incrementally

I almost never recommend starting with a portal. The portal comes last, once there is something worth exposing. You start from the use case that wastes the most time for the most people, make it genuinely self-service, and ship it. Then the next one.

That approach has a useful side effect: it forces you to verify adoption at every step, instead of discovering after a year of work that the platform does not solve the problems teams actually have.
