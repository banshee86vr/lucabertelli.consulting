---
key: "kubernetes-consultant"
lang: "en"
title: "When you need a Kubernetes consultant"
subtitle: "What changes between a focused engagement and another YAML sprint"
seoTitle: "When you need a Kubernetes consultant | Luca Bertelli"
date: "2024-04-27"
updated: "2026-07-28"
image: "/insights/kubernetes-consultant/kubernetes-consultant.webp"
relatedServices: ["kubernetes", "training", "platform-engineering", "cloud"]
---

## The question that usually arrives too late

People rarely call because they "want Kubernetes". They call because Kubernetes is already there, workloads are running, and every release or incident still costs more than the team can explain. Someone inherited a cluster stood up in a hurry; someone else has three environments that should match and do not; security asks for evidence that nobody can produce without a week of manual work.

The useful question is not "do we need Kubernetes?". It is **when a [Kubernetes consultant](/en/services/kubernetes-consulting/) makes sense**, instead of another internal sprint of patches and charts.

## When internal effort is no longer enough

Not every cluster needs a consultant. If you have a single environment, for example, or a handful of services and a team that knows the perimeter, time and discipline are often enough. External help becomes economical when one of these patterns shows up.

### 1. Day-2 is eating day-1

The cluster is "up", but upgrading nodes, certificates, CSI, ingress or a critical chart is a project every time. There is no repeatable path: there is the person who last time "did everything".

### 2. Multi-tenancy in practice, governance in name only

Shared namespaces, missing or decorative ResourceQuotas, patchy NetworkPolicies, test environments that can touch staging secrets. The cluster hosts several teams without an explicit isolation model. That is when trivial incidents become organisational incidents.

### 3. Half-finished GitOps

A GitOps tool is installed but half of the changes still go through `kubectl` commands and tickets. Desired state is not the source of truth: it is a hope. In those conditions every audit and every disaster recovery starts from scratch.

### 4. Drift nobody measures

Images and charts advance at different speeds across clusters and namespaces. You know you are behind; you do not know by how much, where, or what is deprecated. That is a fleet problem, not a single-deployment problem.

### 5. CI that builds environments "almost like" production

Tests pass on an improvised cluster or temporary namespace without the same policies, ingress rules and limits. Differences then appear in production that CI never saw. Here you usually need a model for ephemeral environments or virtual clusters, not another ancillary pipeline to paper over environment differences.

## What a Kubernetes consultant does (and does not)

A good engagement does not replace the team: it **shrinks the surface where the team has to improvise**.

In practice my engagements develop across four planes, also described on the [Kubernetes consulting](/en/services/kubernetes-consulting/) page:

1. **Architecture and boundaries**: cluster vs namespace vs virtual cluster, networking, identity, limits.
2. **Day-2 operations**: upgrades, verified backup/restore, observability that helps during incidents.
3. **Delivery**: coherent GitOps, test environments that resemble production, pipelines that do not lie.
4. **Handover**: runbooks and documented decisions, so the value remains after the engagement.

What I do not do is "install an operator and leave". If three months later only I know why that NetworkPolicy exists, the engagement failed.

## Consultant, training or Platform Engineering?

Three different levers, often mixed up:

- **Kubernetes consulting** when the problem is the cluster (or the fleet) and you need design or remediation.
- **[DevOps and cloud-native training](/en/services/devops-cloud-native-training/)** when the team already has a clear direction but lacks shared practice and language.
- **[Platform Engineering](/en/services/platform-engineering-consulting/)** when the problem is not one cluster, but the fact that *every team* reinvents the same one.

If you recognise two or more signals above and the internal cost of incidents exceeds a few weeks of focused external work, it is worth talking. If you are still deciding whether to adopt Kubernetes at all, start with a [cloud adoption and migration](/en/services/cloud-migration-consulting/) assessment before buying complexity.

## How a typical engagement runs

1. **Short assessment**: real path from commit to production, privileges, drift, failure points.
2. **Motivated priorities**: not a tool wishlist; an impact/effort sequence.
3. **Incremental implementation**: stability and observability first, then automation, then self-service.
4. **Close with internal ownership**: decision docs and pairing, not dependency.

I work as a freelance consultant, mostly remotely, with clients in Italy and across the EU. Details, FAQ and scope live on the dedicated page: [Kubernetes consulting](/en/services/kubernetes-consulting/).

If you want a second opinion on your case with no commitment, [email me](mailto:info@lucabertelli.consulting) in a few lines: managed or self-managed, how many teams share the cluster, and which incident or constraint made you open this page.
