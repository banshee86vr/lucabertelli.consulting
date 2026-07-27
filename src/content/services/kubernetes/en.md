---
key: "kubernetes"
lang: "en"
title: "Kubernetes Consulting"
tagline: "Design, hardening and operation of production Kubernetes clusters, by a Certified Kubernetes Administrator."
seoTitle: "CKA Certified Kubernetes Consultant in Italy & EU | Luca Bertelli"
description: "Kubernetes consulting from a CKA certified consultant: cluster architecture, multi-tenancy, GitOps with Argo CD, security hardening and day-2 operations."
order: 4
keywords:
  - "Kubernetes consultant"
  - "Kubernetes consulting"
  - "Kubernetes Italy"
  - "CKA certified consultant"
  - "GitOps Argo CD"
  - "Kubernetes multi-tenancy"
relatedTags: ["kubernetes", "helm", "multi-tenancy", "vcluster", "fleet-management", "drift", "cicd", "platform-engineering"]
credentials: ["cka", "capa", "vmware_master", "kong-mesh"]
outcomes:
  - "Clusters designed for production rather than prototypes grown by inertia"
  - "Real isolation between teams and environments, with quotas and network policies enforced"
  - "Declarative GitOps deployments, with drift detected instead of endured"
  - "Documented day-2 operations: upgrades, backup, restore"
deliverables:
  - "Review of existing cluster architecture, with findings ordered by severity"
  - "Cluster provisioning in Terraform, reproducible across environments"
  - "Multi-tenancy model: namespaces, RBAC, quotas, network policies"
  - "GitOps continuous delivery with Argo CD and Helm or Kustomize"
  - "Security hardening and observability with Prometheus and Grafana"
faq:
  - question: "Are you Kubernetes certified?"
    answer: "Yes. I have been a Certified Kubernetes Administrator (CKA) since 2020 and a Certified Argo Project Associate (CAPA), as well as VMware Certified Master Specialist in Cloud Native. The credentials are verifiable through their public Credly badges, linked from the certifications section of this site."
  - question: "What are the most common mistakes in production Kubernetes clusters?"
    answer: "Three come up almost every time: missing resource requests and limits, which makes scheduling unpredictable and lets unrelated workloads contend for resources; no network policies, so every pod can talk to every other pod; and configuration applied by hand on the cluster, which makes it impossible to know whether the environment matches what the repository describes."
  - question: "Managed Kubernetes or self-managed?"
    answer: "In the large majority of cases, managed: EKS, AKS or GKE. Running your own control plane only makes sense with specific data sovereignty constraints, on-premise requirements or customisation needs that managed services do not cover. The value you build almost always sits above the control plane, not inside it."
  - question: "Can you work on clusters that are already in production?"
    answer: "Yes, and it is the most common scenario. We start from a review of the existing architecture and configuration, with findings ordered by severity, and work in verifiable steps without halting operations. Rewriting a working environment from scratch is rarely the right call."
  - question: "How do you handle test environments on Kubernetes?"
    answer: "With ephemeral virtual clusters created per pull request and destroyed on close. I have documented that approach in detail in a blog article based on vCluster and Argo Workflows: it gives every developer an isolated, realistic environment without multiplying the real clusters you have to maintain."
---

## The problem I usually find

Kubernetes almost always gets adopted in two stages. First someone builds a cluster for a pilot project, using configuration lifted from the docs and a few reasonable shortcuts to move fast. Then the pilot goes to production, other teams start relying on it, and those shortcuts become foundations.

The symptoms look remarkably similar from one client to the next. Nobody can say with confidence whether what runs in the cluster matches what is in the repository. A misbehaving workload degrades applications that have nothing to do with it. Version upgrades get postponed because nobody feels comfortable running them, and the cluster falls behind until upgrading becomes a project of its own.

## How I work

If the cluster already exists, we start with a structured review: architecture, configuration, security, observability and operational practice. The output is a list of findings ordered by severity and effort, not a generic best-practices document. The first three items usually account for most of the real risk.

On isolation, the work consists of making real what namespaces only imply. Namespaces, least-privilege RBAC, resource quotas, limit ranges and default-deny network policies: without these, multi-tenancy is a naming convention rather than a separation.

Delivery moves to GitOps with Argo CD. The benefit that matters is not automation as such, it is that desired state becomes readable in Git and every deviation is detected rather than discovered during an incident. From there we build day-2 operations: an upgrade strategy, backup and restore actually tested, and alerts that signal real problems instead of generating noise.

## Fleets and ephemeral environments

Once there is more than one cluster, the problems change shape. The question is no longer whether a cluster is well configured, but whether clusters are aligned with each other and how far behind they are on current image and chart versions. It is a topic I work on regularly and have written about publicly, alongside the use of ephemeral virtual clusters to give every pull request an isolated test environment without multiplying the infrastructure you have to maintain.
