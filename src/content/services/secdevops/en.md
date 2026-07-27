---
key: "secdevops"
lang: "en"
title: "SecDevOps and CI/CD Consulting"
tagline: "Toolchains and pipelines that build security into the development flow instead of turning it into a bottleneck."
seoTitle: "SecDevOps, DevSecOps and CI/CD Consulting | Luca Bertelli"
description: "SecDevOps and CI/CD consulting across Italy and the EU: toolchain selection, secure pipelines, HashiCorp Vault secrets management, software supply chain security and NIS2 evidence."
order: 5
keywords:
  - "SecDevOps consulting"
  - "DevSecOps consulting"
  - "CI/CD consulting"
  - "secure CI/CD pipelines"
  - "software supply chain security"
  - "HashiCorp Vault"
  - "DevSecOps"
  - "SecDevOps"
relatedTags: ["devsecops", "cicd", "github-actions", "dependency-management", "renovate", "fintech", "insurtech"]
credentials: ["vault-professional", "vault-associate", "vault-chip", "gitlab-sa"]
outcomes:
  - "Vulnerabilities caught in the pipeline, while fixing them is still cheap"
  - "Centralised, rotating secrets kept out of repositories and environment variables"
  - "Traceable artifacts: you know what each release contains and where it came from"
  - "Compliance evidence produced by the process, not reconstructed before an audit"
deliverables:
  - "Assessment of the existing toolchain and a reasoned choice of what is missing"
  - "Security checks embedded in the pipeline: SAST, SCA, image scanning, IaC analysis"
  - "Secrets management with HashiCorp Vault and removal of static credentials"
  - "Automated dependency management with Renovate"
  - "Artifact signing and SBOM generation"
faq:
  - question: "What is the difference between DevSecOps and SecDevOps?"
    answer: "In practice they describe the same goal: integrating security into the development cycle rather than applying it at the end. I use SecDevOps because the word order better reflects the idea that security is a starting requirement, not a check added after the thing is built."
  - question: "Do security checks slow the pipeline down?"
    answer: "If they are all made blocking at the same point, yes, and that is exactly how teams learn to bypass them. The setup that works spreads the checks out: fast ones run on every commit and block, slow ones run asynchronously or nightly and raise findings. And you start by blocking only on severe vulnerabilities that have a fix available, otherwise the noise makes the signal unusable."
  - question: "How do you manage secrets in pipelines?"
    answer: "With HashiCorp Vault, where I hold the Operations Professional and Implementation Partner certifications. The goal is to eliminate static credentials in favour of short-lived dynamic secrets, generated on demand and individually revocable. Credentials that do not exist permanently cannot be exfiltrated from a repository or a log."
  - question: "What does NIS2 compliance mean technically?"
    answer: "On the delivery side it mostly means traceability: knowing what was released, who approved it, which third-party components it contains and how known vulnerabilities are handled. A pipeline that produces an SBOM, signs artifacts and retains approval logs generates that evidence as a normal by-product of running, instead of requiring a manual collection exercise before every audit."
  - question: "Which CI/CD tools do you work with?"
    answer: "Mainly GitLab CI and GitHub Actions, with Argo Workflows and Argo CD for orchestration and deployment on Kubernetes. On the security side I integrate SAST and SCA scanners, container image scanning and static analysis of Infrastructure as Code, chosen according to what the client already owns."
---

## The problem I usually find

Application security almost always arrives late in the lifecycle, and that determines its cost. An annual penetration test produces a report with thirty findings against code written six months earlier, by people who have since moved on to something else. Fixing them means stopping current work, and the discussion that follows is about which findings can be accepted rather than how to avoid them next time.

The second recurring theme is secrets. In most organisations I start working with, credentials live in pipeline configuration variables, in unversioned files on servers, occasionally in an old commit nobody purged from history. They are static, shared, and effectively unrotatable: changing them would require knowing who uses them, which is information nobody holds.

## How I work

The first step is mapping the existing toolchain before proposing any addition. Often the checks are already there but run at a point in the process where nobody reads the output, or they produce so many findings that they have been muted. Recovering what exists is almost always faster than introducing another tool.

Checks are then distributed along the pipeline according to their cost. Static analysis and dependency checks on every commit, because they are fast and the context is fresh. Container image scanning when the artifact is built. Infrastructure as Code analysis before apply. Slower verification stays off the blocking path.

The rule that makes the whole thing sustainable is the initial threshold: block only on severe vulnerabilities that have a fix available. A pipeline that halts on any finding gets routed around within a fortnight, and at that point you have made things worse rather than better.

## Secrets and supply chain

On secrets, the goal is moving from static credentials to short-lived ones generated on demand. Vault issues database access when the service needs it, valid for hours, and revokes it afterwards. This is not only about rotation: a credential that does not exist in permanent form cannot end up in a log or a repository.

On the supply chain the work is about traceability of what you ship. Artifact signing, SBOM generation on every build, automated dependency updates with Renovate. That last point has the most immediate return: most vulnerabilities found in production concern dependencies whose fix has existed for months and simply was not applied.
