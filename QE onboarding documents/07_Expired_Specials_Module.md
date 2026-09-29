# Module 7: Expired Specials / Order Maintenance — "Deal Cleanup Crew"

## What is this module?
Once a promotional special's deadline passes (its "Must Ship By" date), some
orders may still be holding onto that now-expired discount. This module
finds those orders and removes the expired discount, or defers/exempts
specific orders from that cleanup when there's a valid reason.

It is a separate application module under `tests/expired specials` and uses
Stage only (`stage.ashleynet.com`), with 30 total test definitions (23
regression, 7 smoke, 10 E2E-tagged).

## Module flow at a glance
![Module 7 flowchart](screenshots/07_expired_specials_flow.png)

## Submodule 7.1: Orders with Expired Specials / discount removal
What it is: The screen that identifies orders still carrying a discount
from a special that has already expired.
How it works: Filters, date fields, and grids let you find affected orders;
Update/Execute/Cancel controls let you remove the stale discount (Execute)
or back out safely (Cancel) without persisting a change during testing.
Purpose: The core cleanup mechanism — closes the gap between "promotion
ended" and "system still honoring the promotion's discount."

## Submodule 7.2: Expired Specials Defer List
What it is: A list of orders that are intentionally exempted (deferred)
from automatic expired-discount removal.
How it works: View the current defer list, its filters, and navigation
controls.
Purpose: Some orders legitimately need to keep an "expired" discount a bit
longer (e.g., due to a shipping delay that wasn't the customer's fault).
The defer list is the documented exception mechanism for those cases.

## Submodule 7.3: Add New Expired Specials Defer List
What it is: The form to add a new order to the defer/exception list.
How it works: Add New workflow with the relevant fields and save/cancel
actions.
Purpose: Lets an authorized user manually protect a specific order from the
standard expired-discount cleanup process.

## Business rules and integration notes
- A discount becomes "expired" specifically when the requested ship date is
  later than the special's Must Ship By date.
- The safe browser test suite validates screen controls and selection
  surfaces; persistent Execute/Update removal requires approved test orders
  and explicit mutation enablement — it does not casually delete real data.
- Beyond the UI, the business process also involves Ashley Direct
  integration, scheduled daily jobs, generated reports/emails, order-line
  discount verification, and database checks. These are documented as
  integration gates, not claimed as completed browser-test passes.
- The Locked Order Special Reports route is explicitly excluded because
  live inspection returned an HTTP 500 error (missing
  `AshleyNet.Templates.MVC.dll-12` assembly) — a known environment issue,
  not a test gap.

## Why this whole module matters
Without this cleanup process, expired promotions could keep silently
discounting orders indefinitely, costing the business money on deals that
were only supposed to be temporary. The defer list ensures the cleanup
isn't overly rigid — legitimate exceptions are still possible.
