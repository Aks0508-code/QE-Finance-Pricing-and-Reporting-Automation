# Module 1: Pricing — "The Price Tag Machine"

## What is this module?
The Pricing module is where every item's actual dollar price gets created,
stored, changed, and approved. Imagine a furniture store where every item
needs a price tag — this module is the machine that prints, updates, and
double-checks those tags before they go on the shelf.

It has 3 submodules and 60 total test definitions (55 regression, 5 smoke,
24 E2E-tagged).

## Purpose — why this exists at all
Every item Ashley sells needs an actual dollar amount attached to it before
it can be ordered, invoiced, or shipped. But a raw "$123.00" number by
itself isn't enough — the business also needs to know *which pricing rule
family* that number belongs to (its Price Code), *when* that number takes
effect, and *who* approved the change before it goes live. This module is
the chain that turns a pricing decision into a live, auditable price: Price
Code Maintenance defines the reusable rule, Price List Maintenance attaches
an actual price + effective date to an actual item under that rule, and the
Update Queue is the checkpoint that reviews/audits the change before or as
it takes effect.

## Where it is used
Price Codes and Price Lists set here are what every order-entry, invoicing,
and customer-pricing screen reads from — including the Buyer module (which
looks at Customer/Price Code links) and Formula-based pricing (linked
directly from the Price Code grid via "Formulas"). A Price Code also
determines VAT/tax handling and currency, so international pricing (e.g.
`ASHLEY FURNITURE (SHANGHAI) CO LTD` environment, visible in the
Environment dropdown) depends on this module being configured correctly per
environment.

> 💡 **Example (real business scenario):** Finance needs to raise the price
> of item `B100-11` under Price Code `65798`. They go to Price List
> Maintenance, edit the `Price` cell from its current value to the new
> value, set a `Start Date`, and Save. Depending on configuration, that
> change either applies immediately or lands in the **Update Queue**
> (`PriceList_UQ.aspx`) first — where the row additionally shows
> `Effective Date`, `User Id`, `Change Method`, `Change Date`, and
> `Change Time`, so anyone reviewing it can see exactly who changed what
> and when before the price is confirmed live.

## Module flow at a glance
![Module 1 flowchart](screenshots/01_pricing_flow.png)

---

## Submodule 1.1: Price Code Maintenance (26 tests)

**Screen location:** Home → File Maintenance → Price Maintenance → Price
Codes (`https://stage.ashleynet.com/PriceMaintenance_Net/PriceCodes.aspx`)

![Price Code Maintenance grid](screenshots/01_price_code_maintenance_01.png)

**What it is:** A "Price Code" is like a recipe card that bundles together a
base price, category, VAT (tax) setting, and description — so instead of
typing a price from scratch every time, you reuse a Price Code across many
items.

**Real fields observed on the live grid (Stage):**
- **Code** — the Price Code identifier itself (e.g. `65798`, `ACEHAR`,
  `AMERIC`). A leading `*` on the code (e.g. `*ACEHAR`) means there is
  pricing with effectivity dates attached to that code.
- **Description** — free-text label (e.g. `ACE HARDWRE DROPSHIP`,
  `AMERICAN ACCT193300`).
- **Category Code** — a dropdown scoping the code's purpose: `CUSSP`,
  `DNU` (Do Not Use), `Form`, `Land`, `Stand`, `Temp`, `Unasn` (Unassigned).
- **Currency** — dropdown, e.g. `USD`.
- **Include VAT** — dropdown of tax rates: blank/`NO TAX - 0.00`,
  `VAT03 - 0.03` through `VAT17 - 0.17`.
- **Base Price checkbox** — "Only one currency type can be flagged as base
  price code per environment," enforcing a single base-price source of
  truth per currency.
- **Delete** — a checkbox per row, disabled on rows that can't be deleted
  (e.g. codes actively referenced elsewhere).
- Per-row navigation links: **Audit** (`DerivedAudit.aspx`), **Customers**
  (`CustomerListing.aspx`), **Formulas** (`Formulas.aspx` — shown as
  "Formulas+" when a formula already exists on that code).
- Top toolbar: **View Inactive**, **Copy Price Code**, **Add New**, **Save**,
  **Cancel**, **Export To Excel**, **Item Accruals**.
- Search bar: **Item**, **Currency**, **Category Code** filters + **Search**.

> 💡 **Example:** Code `65798` has Category `Unasn`, Currency `USD`, no VAT
> flagged, and no leading `*` — meaning no time-based effective pricing is
> attached yet. Code `ACEHAR` (Category `Land`) shows a leading `*`,
> meaning it already has dated Price List entries — clicking its link opens
> `PriceList.aspx?...&PriceCode=ACEHAR` directly.

> ℹ️ **Note:** The Environment selector at the top (`ASHLEY FURNITURE
> INDUSTRIES, LLC` vs `ASHLEY FURNITURE (SHANGHAI) CO LTD`) changes which
> company's Price Codes are shown — QE must confirm test data assertions
> are scoped to the correct Environment, since the same Code text can exist
> independently per environment.

**Purpose:** Keeps pricing "building blocks" standardized and reusable, with
a full safety net (validation, archive/reactivate) so prices aren't lost or
duplicated by mistake.

---

## Submodule 1.2: Price List Maintenance (24 tests)

**Screen location:** reached from a Price Code's row link, e.g.
`PriceList.aspx?envSelected=AFI&curr=USD&PriceCode=65798&basePrice=false`

![Price List Maintenance grid](screenshots/01_price_list_maintenance_01.png)

**What it is:** The big spreadsheet that says "this item costs this much,
starting this date." Where Price Code Maintenance manages reusable pricing
building blocks, Price List Maintenance applies actual prices to actual
items with an effective date.

**Real fields observed on the live grid (Stage, Price Code `65798`):**
- **Code** — the parent Price Code this row belongs to (`65798`).
- **Item Number** — the actual SKU (e.g. `B100-11`).
- **Class** — item class code (e.g. `AA`).
- **Price** — an editable textbox holding the dollar amount (e.g.
  `123.00`).
- **Comm Adj** — commission adjustment value (e.g. `1.00`).
- **Whse Oper%** — warehouse operating percentage (e.g. `0.00`).
- **Start Date** — the date the price becomes effective (e.g.
  `09/21/2026`).
- **Edit** link — per row, opens the row for editing
  (`javascript:EditRow("65798","B100-11","AFI","USD","1")`).
- **Delete All** checkbox + **Start Date on Updates** date field at the
  header level — lets you bulk-flag rows for deletion and set a common
  start date for a batch of updates in one action.
- Toolbar: **View Inactive**, **Add New**, **Save**, **Cancel**, **Upload
  List Excel**, **Export To Excel**, and an **Update Queue** link
  (`PriceList_UQ.aspx?...`) that jumps straight to the review queue for
  this same Price Code.
- **Item Search** with an **All Price Codes** checkbox to widen the search
  beyond the current code.

> 💡 **Example:** Item `B100-11` under Price Code `65798` is priced at
> `$123.00`, Class `AA`, with a `Start Date` of `09/21/2026`. Editing the
> `Price` field and clicking Save either updates it immediately or (per
> workflow config) queues it — the presence of the **Update Queue** link
> directly on this screen shows the two submodules are tightly coupled:
> every price edit here is one click away from its audit/review queue.

> ℹ️ **Note:** "Upload List Excel" lets Finance bulk-load many item/price
> rows at once instead of editing one row at a time — the upload flow
> validates a file was actually attached, shows a completion summary, and
> separately lists any rows that failed as a "Not Uploaded List," so a bulk
> load partially failing doesn't silently lose those specific rows.

**Purpose:** This is the actual "go live" mechanism for prices — controlling
not just *what* the new price is, but *when* it starts and whether
in-flight orders are protected from the change.

---

## Submodule 1.3: Price List Update Queue (10 tests)

**Screen location:** `PriceList_UQ.aspx?envSelected=AFI&curr=USD&PriceCode=65798&basePrice=false`

![Price List Update Queue grid](screenshots/01_price_list_update_queue_01.png)

**What it is:** A waiting room / review queue for price changes before they
become final.

**Real fields observed on the live grid (Stage, Price Code `65798`):**
- All the same base columns as Price List Maintenance (**Code**, **Item
  Number**, **Class**, **Price**, **Comm Adj**, **Whse Oper%**, **Start
  Date**), **plus** queue-specific audit columns:
- **Effective Date** — an editable textbox (e.g. `09/21/2026`) distinct
  from Start Date, representing when the queued change actually takes
  effect.
- **Reprice Order** — a checkbox controlling whether existing open orders
  get repriced when this change is applied.
- **User Id** — who made the change (e.g. `ANarayanan`).
- **Change Method** — how it was made (e.g. `PriceQueueUpload`, showing this
  specific row arrived via a bulk upload rather than a manual UI edit).
- **Change Date** / **Change Time** — precise audit timestamp (e.g.
  `09/21/2026`, `03:01:06`).
- Header-level **Effective Date on Updates** field to set a common
  effective date across a batch of queued rows at once.
- Toolbar: **Save**, **Cancel**, **Export To Excel**; a **Back To Price
  List** button to return to the parent screen.

> 💡 **Example:** The queued row for item `B100-11` shows `Change Method:
> PriceQueueUpload`, `User Id: ANarayanan`, `Change Date: 09/21/2026`,
> `Change Time: 03:01:06` — meaning QE can trace this exact price change
> back to a specific upload action by a specific user at a specific
> second, which is exactly the kind of forensic trail Finance needs if a
> price dispute comes up later.

> ℹ️ **Note:** This suite is data-gated — real mutation tests only run with
> `PRICE_LIST_UQ_PRICE_CODE` and `PRICE_LIST_UQ_MUTATION_ENABLED=true` set,
> so accidental changes to production-like data can't happen by default.

**Purpose:** Acts like a manager's final review station — a price change
doesn't silently go live; someone (or an automated gate) confirms it first,
and every change is fully audited.

---

## Why this whole module matters
Without Pricing, nobody in the company would have a single source of truth
for "what does this cost right now, and who approved that." It's the
foundation every other pricing-related module (Buyer, Surcharge, Price
Exceptions) builds on top of.

**Business impact if this module breaks:** A wrong Base Price or VAT flag
on a Price Code (1.1) propagates into every item priced under that code
(1.2), and a broken Update Queue (1.3) means price changes could go live
without review or without any audit trail of who approved them — directly
undermining Finance's ability to answer "why does this order show this
price" during a billing dispute.

**Who relies on this module:** Finance/Pricing analysts (create/maintain
Price Codes and Price Lists), Order Entry/Invoicing systems (read the live
price for a given item + effective date), Customer-specific pricing links
(via the Customers link on each Price Code), and QE (validates the full
chain from Price Code → Price List → Update Queue stays consistent and
auditable).
