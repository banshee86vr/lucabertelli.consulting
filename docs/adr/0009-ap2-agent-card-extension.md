# 0009: Declare AP2 on the agent card and refuse mandates

- Status: Accepted
- Date: 2026-10-26

## Context

Discovery checks look for an Agent Payments Protocol extension on the A2A Agent Card. The v0.1 extension specification requires the identifier `https://github.com/google-agentic-commerce/ap2/tree/v0.1` and at least one role: merchant, shopper, credentials-provider, or payment-processor. A merchant that expects clients to pay through AP2 should set `required` to true. Some checks compare the tag form `https://github.com/google-agentic-commerce/AP2/tree/v0.1.0` instead. This origin is a public consulting practice. It has no catalog, no payment handler, and no store for mandates or payment credentials. ACP checkout on this origin already refuses a session for the same reason.

## Decision

`capabilities.extensions` lists both identifiers. Each entry sets `params.roles` to `merchant` and `required` to false. The description says this practice does not take payment. `POST /a2a/v1` still answers a text `SendMessage` with the public documents. A data part whose keys start with `ap2.mandates.` returns the unsupported-operation error. The body is size-capped, discarded, and not copied into the reply.

## Alternatives considered

- `required: true`. A conforming client that does not implement AP2 would stop calling this agent. Public questions do not need a mandate.
- Shopper, credentials-provider, or payment-processor. Those roles spend money, hold payment instruments, or submit charges. This origin does none of that.
- The specification URI only. Checks that compare the v0.1.0 identifier would miss the card.
- The v0.1.0 URI only. The v0.1 specification says supporting agents must use the lowercase identifier.
- Signing cart and payment mandates. There is no catalog, no payment handler, and the privacy notice does not describe a mandate store.

## Consequences

Callers that only need discovery can read the extension on the agent card. Callers that send a mandate get an error and no echo of the payload. Text `SendMessage` stays available without the extension. The isitagentready scan of the live origin stays unchanged until this is deployed. Commerce checks stay neutral while the scanner does not treat this origin as a commerce site.
