---
key: "cyber-resilience-act"
lang: "en"
title: "Cyber Resilience Act: where things stand and what to do first"
subtitle: "Reporting is live, harmonised standards are not, and December 2027 is closer than the release calendar suggests"
seoTitle: "Cyber Resilience Act guide for software teams | Luca Bertelli"
date: "2026-09-28"
image: "/insights/cyber-resilience-act/cyber-resilience-act.webp"
relatedServices: ["cyber-resilience-act", "secdevops", "devops", "kubernetes"]
---

## Where things stand, September 2026

The Cyber Resilience Act, Regulation (EU) 2024/2847, has been in force since 10 December 2024, and the first obligation with teeth arrived on **11 September 2026**: Article 14 reporting. Since that date a manufacturer that becomes aware of an actively exploited vulnerability in one of its products, or of a severe incident affecting its security, must send an early warning within 24 hours, a notification within 72 hours and a final report, through the **Single Reporting Platform** that ENISA opened the same day. The duty covers every in-scope product already on the market, not only the ones placed after 2027 (Article 69(3)). What it does not cover is exploitation you already knew about before 11 September; the clock starts on fresh awareness.

Around that date a few pieces fell into place:

- **Commission guidance** (C(2026) 5252, 27 July 2026): 84 pages and 67 worked examples on scope, remote data processing, open source, substantial modification, support periods and reporting. Non-binding, but it is what market surveillance authorities will read. It says nothing about SBOM format.
- **Implementing Regulation (EU) 2025/2392** (28 November 2025): the technical descriptions of the important (class I and II) and critical product categories. It is the document that tells you whether your product needs a notified body.
- **Delegated Regulation (EU) 2026/881**: when a CSIRT may delay passing your notification on to others. It does not move your deadlines.
- In Italy, **Law 36/2026** designates the Agenzia per la Cybersicurezza Nazionale as both notifying and market surveillance authority, with CSIRT Italia as the coordinator that receives notifications. The legislative decree that sets the national penalty scale is still pending.

Two things have not fallen into place. **No harmonised standard has been cited in the Official Journal.** The horizontal EN 40000 series (vocabulary, principles, vulnerability handling, generic security requirements) is partly under approval and partly still being drafted, the Commission has proposed pushing the standardisation deadlines back, and first citations are not expected before 2027. Until then there is no presumption of conformity for anyone, and class I products cannot use the self-assessment route. And the **Digital Omnibus**, which proposes a single entry point for incident reporting across NIS2, CRA, GDPR and DORA built on top of ENISA's platform, is still in the Council. It does not change any CRA date.

## What the regulation asks, briefly

Annex I has two parts. **Part I** is about the product: thirteen properties, from "no known exploitable vulnerabilities at release" and secure-by-default configuration to encryption, integrity, data minimisation, attack surface reduction, security logging and secure deletion, each applied according to a documented risk assessment. **Part II** is about the manufacturer's process: eight duties, including the SBOM, fixing vulnerabilities without delay, regular testing, public disclosure of fixed vulnerabilities, a coordinated vulnerability disclosure policy, a contact address for reports, secure update distribution and free security updates with an advisory.

Around them: user information (Annex II, including the support end date and where to report vulnerabilities), technical documentation (Annex VII, including the SBOM and the reasoning behind the support period), a support period of at least five years, and security updates that must stay available for ten years after release. Penalties go up to EUR 15 million or 2.5% of worldwide turnover.

## Three misunderstandings I keep meeting

**"We are SaaS, so we are out."** The service itself is NIS2 territory, but the edge agent, the mobile app, the on-premise connector and the firmware in the gateway are products with digital elements. Remote data processing without which the product cannot work is also in scope. Most SaaS companies I talk to have three or four in-scope products they had not counted.

**"The SBOM is the deliverable."** It is one point out of twenty-one, and on its own it produces a long list of vulnerabilities in code the product never executes. The Commission guidance is explicit that a vulnerable component whose code is not reachable does not make the product's vulnerability actively exploited. What turns the list into evidence is the judgement recorded per finding (VEX) and the report assembled from those judgements (VDR), together with a process that keeps producing them for every supported release.

**"We will deal with it in 2027."** Article 14 applies today. The class decision determines whether you need a notified body, and there are very few of them so far; Article 35 asks Member States to ensure enough capacity by 11 December 2026, which tells you how tight the queue will be. And the support period is at least five years from the day you ship, so the process that handles vulnerabilities on that release has to exist on that day.

## How to sequence the work

There is no single right order, but this one has held up in regulated environments and it follows what is already enforceable:

1. **Inventory and classification.** Every product with digital elements, including firmware, agents, connectors and embedded third-party components, mapped to default, important class I or II, or critical. This decides the calendar.
2. **Reporting readiness.** A single point of contact users can find, a coordinated vulnerability disclosure policy, registration on the Single Reporting Platform, a written criterion for what "becoming aware" means and where it is recorded, a runbook for the 24-hour, 72-hour and 14-day steps, and one rehearsal.
3. **Supply chain evidence.** SBOM per artifact from the build, signed artifacts with provenance, VEX and VDR per supported release, continuous monitoring against new vulnerability data. This is the [SecDevOps](/en/services/secdevops-cicd-consulting/) work with the CRA's retention and disclosure duties added.
4. **Product requirements.** The Part I properties that are design decisions, worked through with the product team and recorded in the risk assessment. Security updates shipped separately from features where feasible.
5. **Technical documentation and conformity route.** Annex VII assembled from the outputs above, then the self-assessment or notified body decision taken with legal counsel.

The [Cyber Resilience Act compliance](/en/services/cyber-resilience-act-compliance/) page describes what each of these steps produces and what I do and do not cover.

## What to ask a consultant or a vendor

1. Which release does this SBOM describe, and how do you prove it?
2. If a researcher emails a vulnerability tonight, where does it land and who reads it?
3. What happens in your organisation in the first 24 hours after you learn a vulnerability is being exploited?
4. Which of your releases in the last twelve months would have counted as a substantial modification?
5. After the engagement, who on the internal team keeps this running for the next five years?

If the answers are vague, you are buying a document, not compliance. If you want a concrete view on where your product stands, [email info@lucabertelli.consulting](mailto:info@lucabertelli.consulting). The product, the current pipeline and the customer base are enough to start.
