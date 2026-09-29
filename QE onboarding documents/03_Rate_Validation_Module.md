# Module 3: Rate Validation — "The Sanity Checker"

## What is this module?
Rate Validation makes sure prices/rates never drift outside a sane, expected
range. It's a safety net that stops typos or bad data entry from creating a
price that's wildly too high or too low.

It has 1 submodule (the module itself is a single maintenance surface) and
16 total test definitions (14 regression, 2 smoke, 3 E2E-tagged).

## Purpose — why this exists at all
Discount and commission fields in other modules (Price Exceptions' `Std
Disc`, `-Disc`, `COOP Add`, `DFI Disc`, `+Disc`, `Comsn`; Buyer Group
Pricing's equivalents) are free-form percentage/dollar inputs typed by
Finance analysts. Without a guardrail, a typo like `65.00` instead of
`0.65` in a Standard Discount field could silently apply a 6,500% discount.
Rate Validation Limits is the single, centralized table that defines the
acceptable Lower/Upper bound for each of those fields, per source screen —
so the actual data-entry screens (Price Exceptions, Buyer Group Pricing)
can validate against one shared, auditable source of truth instead of each
hard-coding its own limits.

## Where it is used
This module doesn't hold prices itself — it holds the *rules that constrain*
prices entered in Module 2 (Buyer Group Pricing) and Module 8 (Price
Exceptions). Any change here changes what counts as a "valid" discount/
commission value on those other screens the next time a value is validated.

> 💡 **Example (real live Stage data):** For `Price Exceptions`, `Std Disc`
> (Standard Discount) is bounded `0.0000`–`0.6500` and `Comsn` (Commission)
> is bounded `0.0000`–`15.0000`. For `Buyer Group Pricing`, the same `Std
> Disc` field is also bounded `0.0000`–`0.6500`, but `COOP Add` (CO OP Add)
> is bounded `67.0000`–`897.0000` — a much wider, dollar-like range than
> Price Exceptions' `COOP Add` of `0.0000`–`0.4000`. This shows the same
> field name can have a completely different valid range depending on
> which screen it's used from, which is exactly why this module keeps them
> as separate rows rather than one shared limit per field name.

## Module flow at a glance
![Module 3 flowchart](screenshots/03_rate_validation_flow.png)

---

## Submodule 3.1: Rate Validation Limits Maintenance (16 tests)

**Screen location:** Home → File Maintenance → Price Maintenance → Rate
Validation Limits
(`https://stage.ashleynet.com/PriceMaintenance_Net/RateValidationLimits.aspx`)

![Rate Validation Limits Maintenance grid](screenshots/03_rate_validation_limits_01.png)

**What it is:** A screen where you define a Lower Limit and an Upper Limit
for a rate — essentially "this value must fall between X and Y to be
valid" — one row per field, grouped by the screen that field belongs to.

**Real fields observed on the live grid (Stage, Environment `ASHLEY
FURNITURE INDUSTRIES, LLC`):**
- **Environment** — dropdown at the top (`ASHLEY FURNITURE INDUSTRIES,
  LLC` / `ASHLEY FURNITURE (SHANGHAI) CO LTD`), scoping which set of 12
  limit rows is shown, exactly like the Environment selector in Modules 1
  and 2.
- **PageName** — which screen this limit governs: `Price Exceptions` or
  `Buyer Group Pricing` (6 rows each, 12 total).
- **Display FieldName** — the short field code as it appears on that
  screen (e.g. `Std Disc`, `-Disc`, `COOP Add`, `DFI Disc`, `+Disc`,
  `Comsn`).
- **FieldName Description** — the human-readable name (e.g. `Standard
  Discount`, `Negative Discount`, `CO OP Add`, `DFI Discount`, `Plus
  Discount`, `Commission`).
- **LowerLimit** / **UpperLimit** — two editable textboxes per row holding
  the numeric bounds (e.g. Price Exceptions `Comsn`: `0.0000`–`15.0000`).
- Toolbar: **Save**, **Cancel**.

> 💡 **Example:** `Buyer Group Pricing` → `COOP Add` is bounded
> `67.0000`–`897.0000` — noticeably different from every other row on the
> grid, which mostly use small percentage-style ranges like `0.0000`–
> `0.6500`. If a QE test only spot-checked one row, it could easily miss
> that this field behaves differently and needs its own explicit test data.

> ℹ️ **Note:** The full row inventory is fixed at exactly 12 rows — 6 for
> `Price Exceptions`, 6 for `Buyer Group Pricing` — confirmed directly from
> the live grid. A new row appearing here means a new discount/commission
> field was added to one of those source screens and needs its own limit
> defined.

**How it works (test coverage):**
- Smoke route and core-control checks confirm the page loads correctly.
- The Environment selector's available options are exposed and a second
  option can be safely selected.
- Editable Lower Limit and Upper Limit fields per row; the grid shows a
  paired-limit structure — each row has both bounds together, not
  separately.
- Numeric limit-value validation ensures only valid numbers are accepted.
- Save and Cancel controls, with safe unsaved-edit cancellation (editing a
  limit and cancelling discards the change without saving).
- Inline invalid-range message detection: if someone tries to set an Upper
  Limit lower than the Lower Limit, the screen is expected to flag it via
  a message matched against `Upper Limit...greater than Lower Limit` /
  `Lower Limit...Upper Limit` / `invalid...limit`.
- An optional invalid-range validation action exists but is disabled by
  default (requires `RATE_VALIDATION_INVALID_TEST_ENABLED=true`) — it
  intentionally submits Lower `1.0000` / Upper `0.0000` on the first row to
  test rejection of a bad range without performing a real, persistent save.
- Every displayed row is checked so Lower Limit is always ≤ Upper Limit.

**Purpose:** Think of this as a guardrail bolted onto the pricing system. If
someone accidentally tries to set a rate range where the "maximum" is
actually lower than the "minimum," this module is designed to catch and
reject that mistake before it can cause downstream pricing errors in Price
Exceptions or Buyer Group Pricing.

---

## Why this module matters
A single bad rate range (e.g., min $500, max $5) could silently corrupt
pricing calculations elsewhere in the system. Rate Validation exists purely
to prevent that class of error at the source, before it can propagate.

**Business impact if this module breaks:** If a Lower/Upper Limit pair is
ever wrong or inverted (e.g. Upper < Lower) and goes unnoticed, the two
consumer screens (Price Exceptions, Buyer Group Pricing) either silently
accept an absurd discount/commission value or wrongly reject a legitimate
one — either way, Finance loses trust in those screens' validation.

**Who relies on this module:** Finance/Pricing analysts (define the
acceptable range for each discount/commission field), Price Exceptions and
Buyer Group Pricing screens (read these limits to validate their own
inputs at data-entry time), and QE (confirms the 12-row inventory and each
row's Lower ≤ Upper invariant stay intact release over release).
