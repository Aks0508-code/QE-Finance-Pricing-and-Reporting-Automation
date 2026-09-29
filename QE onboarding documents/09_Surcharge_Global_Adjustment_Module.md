# Module 9: Surcharge / Global Adjustment Maintenance — "The Big Recalculator"

## What is this module?
This is the largest module by far. It handles system-wide price adjustments
or surcharges — for example, a fuel surcharge or a material cost increase
applied broadly across many items/customers at once, instead of editing
every single price by hand.

It is implemented as a separate application module under `tests/surcharge`,
confirmed live at:
`https://stage.ashleynet.com/AdjustmentMaintenance/GlobalAdjustmentHeader`

It has 397 total test definitions (387 regression, 10 smoke, 4 E2E-tagged),
the largest of any module by a wide margin.

## Purpose — why this exists at all
Ashley's freight, import, and material costs fluctuate independently of
the base price catalog (e.g. an ocean-freight rate hike, a steel/foam
tariff, a fuel spike). Repricing every affected SKU one by one across every
customer would be slow and error-prone at Ashley's catalog scale. Surcharge
/ Global Adjustment exists to let Finance layer a **separate, additive or
credit-based rule** ("+4% on all ZEBR-class items shipped 03/12–05/31") on
top of the base price, instead of mutating the base price itself. This
keeps the base price list clean/stable while still letting cost pass-through
happen quickly and be turned off again just as easily (by expiring the
date range or deactivating the record) once the cost pressure passes.

## Where it is used — the two consumption paths
1. **UI / manual path (Submodules 9.1–9.4):** Finance/pricing analysts use
   the Global Adjustment Header + Detail screens to define new surcharge
   programs (Credit Code, item-class scope, calculation type, effective
   dates), and use the Adjustment Calculator to preview the effect before
   publishing it.
2. **System-to-system path (Submodules 9.5–9.6):** Once a rule is defined,
   it doesn't just sit in the UI — every order-processing system that
   needs to know "what does this order actually cost" calls the
   **Adjustment Microservice** (`/Adjustment/Orders`) at order entry,
   invoicing, or CM (credit memo) time. Per the SOP, this includes an
   **AS400-based order entry call path** (documented separately as
   "Common Procedure information for AS400 call of Pricing Adjustment
   Microservice"), meaning this module's rules flow all the way from a
   Stage/AshleyNET UI screen into Ashley's core AS400 order system without
   manual re-entry.

> 💡 **Example (real business scenario):** Ocean freight rates spike
> mid-quarter. Finance creates a new Header (`ISC` — Import Surcharge) via
> 9.3, adds Detail rows via 9.2 scoping it to the affected item classes and
> a date window, previews the dollar impact via the Calculator (9.4), then
> publishes it. From that point forward, **every order entered through
> AS400 or any other system calling the microservice automatically
> receives the surcharge** on qualifying items — no one has to touch
> individual item prices, and when the freight rate normalizes, the rule
> is simply date-bounded or deactivated to turn the surcharge back off.

> ℹ️ **Note:** The microservice has a system-wide **ON/OFF check switch**
> independent of individual rule configuration — when OFF, every item
> returns `status: 0` (API OFF) and `total_surcharge: 0` regardless of how
> many active rules exist. This is a kill-switch Finance/IT can use to
> instantly suspend all surcharging (e.g. during a system incident) without
> having to deactivate every Header/Detail record individually.

## Module flow at a glance
![Module 9 flowchart](screenshots/09_surcharge_flow.png)

## Submodule 9.1: Global Adjustment Header

**Screen location:** Home → File Maintenance → Adjustment Maintenance →
Global Adjustment Header
(`https://stage.ashleynet.com/AdjustmentMaintenance/GlobalAdjustmentHeader`)

![Global Adjustment Header screen](screenshots/09_global_adjustment_header_01.png)

**What it is:** The top-level definition of an adjustment — its identity and
who it applies to. Every surcharge in the system starts as one row on this
grid before any detail rules are added underneath it.

**How it works, field by field:**
- **Environment dropdown** — top of the screen, defaults to
  "ASHLEY FURNITURE INDUSTRIES, LLC" but can be switched to other legal
  entities (e.g. "ASHLEY FURNITURE (SHANGHAI) CO LTD"). This scopes which
  set of adjustment headers the grid displays.
- **Add New / Save / Cancel buttons** — sit directly above the grid.
  "Add New" opens the New Global Adjustment Header form (Submodule 9.3);
  Save/Cancel apply to inline edits made directly in the grid rows.
- **Grid columns** — Credit Code, Adjustment ID (a clickable link that
  drills into the Detail screen), Description, Primary Level, Secondary
  Level, Invoice Level, Commissionable, Taxable, Refundable, Charge,
  Adjustment Type, Unit Type, Rounding, Creation Date/Time, Creation User,
  Update Date/Time, Update User, Active Code.
- **Active Code toggle** — a per-row True/False dropdown that turns a
  surcharge on or off system-wide without deleting its configuration.

> 💡 **Example (real Stage data):**
> Row `Adjustment ID 0`, Credit Code `ISC` — "ISC IMPORT SURCHARGE."
> Primary Level = `ITEMCLASS`, Charge = `True`, Unit Type = `Price`,
> Rounding = `None`, Active Code = `True`. Compare this to `Adjustment ID
> 198`, Credit Code `SSC` — "SSC IMPORT SURCHARGE SALES," which uses
> Unit Type = `Cubes` and is currently `Active Code = False` (turned off).
> This shows how two surcharges with a similar name/purpose can be
> configured completely differently and independently toggled.

> ℹ️ **Note:** Adjustment IDs `0` and `1` are permanent, foundational
> records (ISC and SSC surcharges) — they are explicitly excluded from any
> destructive test automation (no save/delete) because production billing
> logic depends on them always existing.

**Purpose:** Where a new surcharge or global adjustment "campaign" is first
defined before its detailed rules are configured. Think of this as the
"cover page" of a surcharge — the detail screen (9.2) is where the fine
print lives.

## Submodule 9.2: Global Adjustment Detail

**Screen location:** Reached by clicking an Adjustment ID link on the
Header grid (e.g. `GlobalAdjustmentdetail?AdjustmentID=0&Calculation=ITEMCLASS`)

![Global Adjustment Detail screen](screenshots/09_global_adjustment_detail_01.png)

**What it is:** The detailed rules underneath a Header — this is where
"ISC IMPORT SURCHARGE" (Header row 0) is broken down into dozens of
individual item-class-level rules, each with its own value, date range,
and calculation type.

**How it works, field by field:**
- **Environment dropdown** and **Back to Global Adjustment Header** button
  — lets you jump between the summary (9.1) and this drill-down view.
- **Filters** — Level value textbox and Order Date To date picker, used
  to narrow down which detail rows display.
- **Show Active Records checkbox** — checked by default; unchecking it
  reveals inactive/expired detail rows too.
- **Search / Add New / Save / Cancel / Upload List Excel buttons** — Upload
  List Excel lets bulk detail rows be imported instead of entered one by
  one, which matters when a surcharge needs to apply to hundreds of item
  classes at once.
- **Action buttons per header** — Export to excel, Customer Inclusion,
  Customer Exclusion (seen disabled in some states), Customer Override,
  Item Exclusion, Country Exclusion. These branch into their own popups
  for scoping the adjustment further.
- **Grid columns** — ID, Detail ID, Calculation Level, Value, Calculation
  Type, Value, Order Date From/To, Invoice Date From/To, Retroactive Date,
  audit fields, Active Code.

> 💡 **Example (real Stage data, Header ID 0 — ISC Import Surcharge):**
> Detail ID `943`, item class `ZEBR`, Calculation Type = `PERCENT`,
> Value = `4.0000`, effective `03/12/2026`–`05/31/2026`. Compare this to
> Detail ID `947`, item class value `6`, Calculation Type = `DOLLAR`,
> Value = `4.0000`, effective `07/15/2026`–`07/24/2026`. This shows the
> same Header (ISC) applying a **percentage** surcharge to one item class
> and a **flat dollar** surcharge to another, each with independent date
> windows — proving one Header can carry many differently-calculated,
> differently-scheduled rules underneath it.

> ℹ️ **Note:** Some rows show an editable (non-disabled) `Order Date To` /
> `Invoice Date To` textbox (e.g. Detail ID `802`) while most others are
> fully disabled/read-only. This reflects record-level edit permissions —
> not every detail row is open for modification even when the screen
> overall allows adding new ones.

**Purpose:** Lets the business fine-tune exactly which customers, items,
item classes, or countries are affected (or protected/excluded) by a given
adjustment, and over what exact time window — the "fine print" beneath the
Header's "cover page."

## Submodule 9.3: New Global Adjustment Header

**Screen location:** Click "Add New" on the Global Adjustment Header grid
(9.1) — opens in a **new browser tab/window**:
`NewAdjustmentHeader?hlcp=1&hmt=1&hm=1&envSelected=AFI`

![Add New Adjustment Header form](screenshots/09_new_global_adjustment_header_01.png)

**What it is:** The creation form for a brand-new adjustment — a
deliberately short, focused form so that a new surcharge/adjustment
"campaign" can't be created with missing critical settings.

**How it works, field by field:**
- **Environment** — same dropdown as the main grid, scopes which legal
  entity this new header belongs to.
- **Credit Code** — free-text field; this becomes the short code shown on
  the Header grid (like `ISC`, `SSC`, `TSC`, `MSC`).
- **Calculation Level** — dropdown; only options are `Select` (blank/
  placeholder, forces a real choice) and `ITEMCLASS - NONE`. This decides
  what dimension the adjustment will be calculated against (by item class,
  in the current Stage configuration).
- **Charge** — True/False, whether this adjustment is billed as a charge.
- **Adjustment Type** — `All` or `Customer`, controls whether the
  surcharge applies universally or is scoped to specific customers
  (further refined later via Customer Inclusion/Exclusion on the Detail
  screen, 9.2).
- **Unit Type** — `Price`, `Cubes`, `Seats`, `Quantity` — the basis the
  surcharge value is calculated against.
- **Rounding** — `0.50`, `1.00`, or `None` — rounds the final calculated
  adjustment to the nearest chosen increment.
- **Submit and Close / Submit and Add / Cancel** — "Submit and Close"
  saves and returns; "Submit and Add" saves and keeps the form open for
  entering another header immediately (useful for bulk setup); Cancel
  discards without saving.

> 💡 **Example:** To create a brand-new "Holiday Peak Surcharge," you'd
> enter Credit Code = `HPS`, Calculation Level = `ITEMCLASS - NONE`,
> Charge = `True`, Adjustment Type = `All` (applies to every customer),
> Unit Type = `Price`, Rounding = `0.50`. Clicking **Submit and Add**
> immediately opens a fresh blank form so you could next add `HPS2` for a
> secondary tier — without re-navigating from the grid each time.

> ℹ️ **Note:** Calculation Level defaults to `Select` (a non-choice) —
> this is a required-field gate. Leaving it as `Select` and submitting
> will block the save, forcing every new header to explicitly declare how
> it calculates before it can exist in the system.

**Purpose:** The guided setup flow ensuring every new adjustment has all
the required configuration (code, calculation basis, charge behavior,
scope, unit, rounding) before it can be submitted — preventing incomplete
or ambiguous surcharge definitions from entering the system.

## Submodule 9.4: Adjustment Calculator

**Screen location:** `/AdjustmentMaintenance/AdjustmentCalculator`
(also reachable via Home → File Maintenance → Adjustment Maintenance →
Adjustment Calculator)

![Adjustment Calculator screen](screenshots/09_adjustment_calculator_01.png)

**What it is:** A "what-if" preview tool that computes the final adjusted
price before anything is committed to a real order — a sandbox for
validating a surcharge calculation using real customer/item inputs.

**How it works, field by field:**
- **Environment** — same two-option dropdown (AFI / Shanghai) as the rest
  of the module, scopes which entity's adjustment rules apply.
- **Customer** — free-text input paired with a **Search Ship To** button;
  typing/searching a customer populates the **Ship To** dropdown (defaults
  to `Select`) with that customer's valid ship-to locations.
- **Order Date** — date picker (`MM/DD/YYYY` with calendar icon) —
  determines which date-scoped detail rule (from Submodule 9.2) applies,
  since rules have effective date ranges.
- **Warehouse** — dropdown with dozens of real warehouse codes (`1`, `101`,
  `109`, `12`, `17A`, `AF`, `C35`, `ECR`, `IOR`, `TES`, etc.) — narrows the
  calculation to a specific distribution point, since some surcharges are
  warehouse/region specific (e.g. import surcharges tied to a port
  warehouse).
- **Item** — free-text item number to price.
- **Price** — the base unit price to run the surcharge formula against.
- **Quantity** — the number of units being priced.
- **Calculate / Cancel buttons** — Calculate submits the inputs and
  returns the computed adjustment result; Cancel clears the form without
  saving or persisting anything.

> 💡 **Example:** To verify the ISC Import Surcharge (Header 0, 4% on item
> class `ZEBR`) is computing correctly for an order placed inside its
> `03/12/2026`–`05/31/2026` window, a QE could enter Customer, Ship To,
> Order Date = `04/01/2026`, Warehouse, Item (`ZEBR` class), Price =
> `100.00`, Quantity = `1`, then click Calculate — the expected result is
> a `$4.00` surcharge (4% of $100), confirming the PERCENT calculation
> type from the Detail screen (9.2) is applied correctly.

> ℹ️ **Note:** This tool performs a **preview-only** calculation — nothing
> here writes to an actual order or invoice. It exists purely so Finance/QE
> can confirm "what would this order's surcharge be" without needing to
> place a real order end-to-end.

**Purpose:** Lets someone check "what would this order actually cost after
the surcharge?" without needing to place a real order — critical for
validating new or changed adjustment rules before they go live broadly.

## Submodule 9.5: Microservice request/response contract

**Endpoint (per Adjustment Microservice SOP):**
- Production: `https://adjustment-microservice.prod.finance.ashleyfurniture.com/Adjustment/Orders`
- Stage: `https://adjustment-microservice.stage.finance.ashleyfurniture.com/Adjustment/Orders`
- Method: `POST` (JSON body). Swagger (technical) reference:
  `https://aazeus-fnprwb01.ashleyfurniture.com/AdjustmentAPI/swagger/index.html`

**What it is:** The background service that performs these same
calculations (that the UI's Adjustment Calculator, 9.4, previews) for
*other systems* that call into it programmatically — e.g. Order Entry,
invoicing, or any downstream system that needs to know "what surcharge
applies to this order/item" without a human using the UI at all.

**Request shape — Order level (one entry per order; a call can carry
multiple orders):**
- `order_id` — Optional, String (echoed back; blank if omitted)
- `customer_id` — **Required**, String
- `ship_to` — **Required**, String (blank is a valid ship-to)
- `order_date` — **Required**, ISO-8601 (this is what's matched against
  the Detail screen's Order Date From/To range, per 9.2)
- `est_ship_date`, `invoice_date` — Optional, ISO-8601
- `warehouse_id` — Optional, String

**Request shape — Item level (one entry per item on the order; multiple
items per order supported):**
- `item_id` — **Required**, String
- `quantity` — Optional, Numeric (defaults to `1` if omitted)
- `price` — **Required**, Numeric — must be the **total price for the
  quantity given** (i.e. already extended), not always a unit price; if
  no quantity is given, it's treated as the price for 1 unit.

**Response shape:**
- Order level: echoes `order_id`, `customer_id`, `ship_to`, plus
  `total_surcharge` (sum of every item's adjustments on that order).
- Item level (`adjustments[]`): echoes `item_id`, `quantity`, `price`,
  plus a **`status`** code:
  - `0` = **API OFF** — the adjustment check switch is disabled system-wide
  - `1` = **NONE APPLIED** — no adjustment rule matched this item
  - `2` = **APPLIED** — one or more adjustments were calculated
  - When status is `0` or `1`, **no `adjustment_details` block is sent** —
    the absence of detail *is* the signal that nothing applied.
- Detail level (`adjustment_details[]`, only present when status = `2`):
  `credit_code`, `adjustment_name` (typically credit code + description,
  e.g. `"IMP IMPORT SURCHARGE"`), `adjustment_amount` (calculated dollar
  amount for the given quantity), `invoice_level` (`1`=line-item level,
  `2`=order level), `taxable` (Y/N), `commissionable` (`B`=Invoice & CM,
  `I`=Invoice only, `N`=Neither), `calculation_value`, `calculation_type`
  (e.g. `"PERCENT"`), `applied_level`/`applied_level_value` (e.g.
  `"ITEM CLASS"` / `"CLASS-A"`), and `charge` (`true`=increases invoice,
  `false`=a credit that decreases it).

> 💡 **Example (from the SOP):** Sending customer `8888300`, ship-to
> `480`, order date `2024-06-27`, item `ITEM-A`, quantity `1`, price
> `29.99` returns `total_surcharge: 5` and a detail row with
> `credit_code: "IMP"`, `calculation_type: "PERCENT"`,
> `calculation_value: 1` (i.e. 1%), `applied_level_value: "CLASS-A"`,
> `charge: true`, `status: "2"` — confirming a 1% import surcharge was
> matched and applied to that item's class.

> ℹ️ **Note:** `price` in the request is the **extended price for the
> quantity given**, not a fixed per-unit price. If a caller needs a
> per-unit surcharge, they should call with `quantity: 1` and pass the
> single-unit price; if they need the surcharge for an entire line, they
> pass the full quantity and the line's extended base price.

**Purpose:** Ensures other systems integrating with the surcharge engine
(Order Entry, invoicing, etc.) get consistent, correctly validated results
without duplicating the Header/Detail rule logic themselves — the
microservice is the single source of truth for "what does this order
actually get charged."

## Submodule 9.6: Calculation contract

**What it is:** The actual math rules behind an adjustment — how a
Header's `AdjustmentType`/`UnitType`/`Rounding` (9.1) combine with a
Detail row's `Calculation Type`/`Value` (9.2) to produce the
`adjustment_amount` returned by the microservice (9.5).

**How it works:**
- **PERCENT calculation type** — `adjustment_amount = price × (value / 100)`.
  Example from live Stage data (9.2): Detail ID `943`, item class `ZEBR`,
  `PERCENT` at `4.0000` → a $100 extended price yields a $4.00 surcharge.
- **DOLLAR calculation type** — a flat per-unit dollar amount, extended by
  quantity: `adjustment_amount = value × quantity`. Example: Detail ID
  `947`, `DOLLAR` at `4.0000` → quantity 3 yields a $12.00 surcharge
  regardless of price.
- **Unit Type basis** (from the Header, 9.1/9.3) — determines what
  "quantity" means for the calculation: `Price`, `Cubes`, `Seats`, or
  `Quantity`. A `Seats`-based adjustment (like SSC in the live grid) is
  extended by seat count rather than unit count.
- **Rounding** (Header-level, 9.1/9.3) — `0.50`, `1.00`, or `None`. After
  the raw calculation, the result is rounded up to the nearest configured
  increment before being returned — e.g. a raw $4.13 result with
  `Rounding = 0.50` becomes $4.50.
- **Zero-price / zero-quantity edge cases** — a `PERCENT` calculation
  against a $0 price correctly returns $0.00 (not an error); a `DOLLAR`
  calculation with quantity `0` likewise returns $0.00, since the
  microservice defaults missing/omitted quantity to `1` but an explicit
  `0` is honored as zero extension.

> 💡 **Example:** Comparing the two live Detail rows under Header `ISC`
> (9.2) shows both calculation types side by side on the *same* Header:
> Detail `943` (PERCENT, 4%, item class `ZEBR`) and Detail `947` (DOLLAR,
> $4.00, item class `6`) — proving the calculation *type* is set per
> Detail row, not per Header, so one surcharge program can mix flat-fee
> and percentage-based rules across different item classes.

> ℹ️ **Note:** Rounding is applied **after** the percent/dollar formula
> and **after** quantity extension — not per-unit before extension. This
> matters for QE test design: a rounding boundary case must be tested
> against the *final extended* amount, not the per-unit calculation.

**Purpose:** Confirms the surcharge math is correct and predictable across
edge cases (rounding boundaries, zero price/quantity, mixed calculation
types on one Header) — not just typical scenarios — since even a small
formula error here multiplies across every order that matches the rule.

## Safety notes
Adjustment IDs `0` and `1` are explicitly read-only — no test saves,
deletes, or deactivates those records. Deletion coverage is limited to an
explicitly approved disposable non-`0/1` header. New creation, deletion,
upload, and calculator execution are runtime-data gated and disabled by
default. Stage API probes require `SURCHARGE_API_TEST_ENABLED=true` plus an
approved Stage API URL and runtime data.

## Why this module matters
When costs change broadly, like a fuel or material price spike, this module
lets Ashley apply one consistent rule across many items/customers instantly,
instead of manually re-pricing thousands of records one at a time.

**Business impact if this module breaks:**
- A wrong `calculation_type`/`calculation_value` on a Detail row (9.2/9.6)
  under- or over-charges every single order that matches it — at Ashley's
  order volume, a small percentage error compounds into a large real-dollar
  discrepancy across thousands of invoices before anyone notices.
- If the microservice (9.5) returns the wrong `status` or drops
  `adjustment_details` when it shouldn't, downstream systems (AS400 order
  entry, invoicing) will silently under-bill or fail to apply a required
  surcharge — this is why QE treats status codes `0/1/2` and the
  detail-presence rule as first-class regression checks, not edge cases.
- Because Adjustment IDs `0`/`1` (ISC/SSC) are live production-linked
  surcharges already feeding real orders, this is also why they're treated
  as read-only in test automation (see Safety notes above) — any
  accidental mutation there would directly affect real customer invoicing,
  not just test data.

**Who relies on this module:** Finance/Pricing analysts (define and manage
rules via the UI), Order Entry/AS400 systems (consume the microservice at
order time), Invoicing/Credit Memo processes (consume calculated
adjustment amounts), and QE (validates both the UI configuration surface
and the API contract stay correct together, since a mismatch between what
the UI shows and what the microservice returns is itself a defect).
