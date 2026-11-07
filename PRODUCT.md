# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Harvest Moon staff use the private quote builder to prepare event proposals for prospective customers.

## Product Purpose

The website presents Harvest Moon's DJ, music, and event services and helps prospective customers request a quote. Staff can create polished, accurate event proposals by entering event details and configurable service tiers, then generating a branded PDF.

## Positioning

No distinct competitive positioning has been established.

## Operating Context

The quote builder is a private, authenticated workflow. Quote drafts are edited in the browser and downloaded as PDFs; they are not saved to a database. Tier line items support internal pricing and can be hidden from the customer-facing PDF while still contributing to the total.

## Capabilities and Constraints

- The site and quote builder are in Spanish.
- Quote prices are entered and displayed in EUR.
- Quote access uses server environment credentials and a signed session; there is no database.
- The PDF uses Harvest Moon's company information and existing website imagery and branding.

## Brand Commitments

- The user describes the brand as energetic, personal, and polished.
- Avoid stiff, generic corporate quote software.

## Evidence on Hand

- Company identity and contact details are maintained in `content/site.json`.
- Service and event imagery is available under `public/media/`.
- Customer testimonial content exists under `content/testimonios/`.

## Product Principles

- Make it quick to build related service tiers without re-entering repeated details.
- Keep internal pricing accurate while controlling which details are customer-visible.
- Generate proposals that feel consistent with Harvest Moon's event-focused brand.

## Accessibility & Inclusion

Quote-builder controls and dialogs must be keyboard-operable, expose clear accessible labels, and show visible focus.
