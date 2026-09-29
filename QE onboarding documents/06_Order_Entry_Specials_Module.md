# Module 6: Order Entry Specials — "Limited-Time Deals"

## What is this module?
Order Entry Specials manages promotional discounts tied to specific orders —
think "Buy this sofa, get 10% off this month only." It is a separate
application module and uses Stage only (`stage.ashleynet.com`).

It has 30 total test definitions covering the confirmed UI routes below.

> ℹ️ **Note on screenshots:** Unlike Modules 1–5, no live screenshot could be
> captured for this module in this session — the current Stage account is
> denied access to `OrderEntrySpecials/*` routes (`AccessDenied_NET` /
> `403.14 Forbidden`), while it has confirmed access to
> `PriceMaintenance_Net/*` and `AdjustmentMaintenance/*`. All field names,
> IDs, and behavior below are grounded directly in the confirmed page
> object (`order-entry-specials.page.ts`), locators
> (`order-entry-specials.locators.ts`), and test spec
> (`order-entry-specials.spec.ts`) rather than a live capture.

## Purpose — why this exists at all
Sales/pricing teams need a controlled way to run time-boxed promotional
discounts on specific items or product series without touching the base
Price Codes (Module 1) or Buyer Group pricing (Module 2) that apply
year-round. This module is that controlled promotional layer, with its own
scoping, item/series targeting, and exclusion rules.

## Where it is used
Lives under its own IIS application root (`/OrderEntrySpecials/`, separate
from `/PriceMaintenance_Net/`), reached from the main grid
(`Specials.aspx`) and its child popups. It's consumed at order-entry time —
when an order is placed against an active special, and again later by
Module 7 (Expired Specials), which handles what happens to orders whose
special discount is still applied after the special's end date.

## Module flow at a glance
![Module 6 flowchart](screenshots/06_order_entry_specials_flow.png)

---

## Submodule 6.1: Order Entry Specials grid
**Route:** `/OrderEntrySpecials/Specials.aspx`

**What it is:** The landing grid (`#grvSpecials`) listing all current
specials.

**Confirmed fields/controls (from `order-entry-specials.locators.ts`):**
- **Environment** selector (`#lstEnvironment`) — same pattern as Modules 1–5.
- **Export To Excel** (`#btnExportToExcel`).
- **Add New** (`#btnAddNew`) — opens the Add/Edit Special popup.
- **Save** (`#btnSave`) / **Cancel** (`#btnCancel`) on the main grid.
- Grid rows (`specialsRows`) contain visible text inputs — the safe test
  suite edits the first editable input, appends `AUTOMATION_ONLY`, then
  clicks **Cancel** to verify the change reverts (a reversible test pattern
  consistent with Modules 1, 4, and 5).
- **Detail** links per row, navigating into Specials Detail.
- An **Excluded Items** link, navigating into the Excluded Items screen.

**Purpose:** The entry point for reviewing and managing every active
promotional special at a glance.

## Submodule 6.2: Add/Edit Special
**Route:** `/OrderEntrySpecials/SpecialsAddEdit.aspx`

**What it is:** The form used to create a new special or modify an existing
one, opened via **Add New** from the main grid.

**Confirmed fields/controls:**
- Form heading matching `Add/Edit Special` (or `Add New Specials`).
- Visible inputs/selects/textareas for defining the special's scope,
  discount terms, and dates.
- **Cancel** control confirmed present on the form.
- Blank-submission validation exists (`validationMessage` locator matches
  "required"/"must enter"/"please enter"/"invalid"/"error" text) but is
  **disabled by default** and only runs when explicitly enabled via the
  `isOrderEntrySpecialsBlankValidationEnabled()` flag.

**Purpose:** Where sales/pricing teams actually configure the terms of a
promotion before it goes live.

## Submodule 6.3: Specials Detail
**Route:** `/OrderEntrySpecials/SpecialsDetail.aspx`

**What it is:** A drill-down screen showing the full detail of one specific
special, reached either by clicking a **Detail** link on the main grid or
by direct navigation with `hm`, `hlcp`, `env`, and `code` (the special's
code) query parameters.

**Confirmed fields/controls:**
- Form heading matching `Specials Detail`.
- A detail grid/table filtered on `Item|Series|Special` text.
- Item/Series links (`itemLinks`) including an **Add New** option, which
  opens the Item/Series Add/Edit route.

**Purpose:** Gives full visibility into one promotion's exact terms without
cluttering the main list view.

## Submodule 6.4: Specials Item/Series Add/Edit
**Route:** `/OrderEntrySpecials/SpecialsItemAddEdit.aspx`

**What it is:** Manages which specific items or item series (product lines)
are included in a given special, reached from Specials Detail.

**Confirmed fields/controls:**
- Form heading matching `Specials Item` (shared regex with the other
  form headings).
- Visible inputs/selects for attaching an item or series to the special.
- A **Cancel** control is checked for presence, but the test explicitly
  skips itself if the current form exposes no Cancel control — meaning
  this control is not guaranteed to be there.

**Purpose:** Lets a promotion apply narrowly (one item) or broadly (a whole
series) depending on the deal being run.

## Submodule 6.5: Specials Excluded Items and Add New
**Routes:** `/OrderEntrySpecials/ExcludedItems.aspx` and
`/OrderEntrySpecials/ExcludedItemAddNew.aspx`

**What it is:** The list of items explicitly excluded from a special, even
if they'd otherwise qualify (e.g., a series-wide discount that excludes one
premium item), plus its Add New entry form.

**Confirmed fields/controls:**
- Excluded Items grid with a **Delete All** checkbox
  (`#grvExcludedItems_chkDeleteAll`) and a per-row **Is Series** checkbox
  (`chkIsSeries`) marking whether an excluded entry is a single item or an
  entire series.
- Add New form fields: **Item Number** (`#txtItemNumber`), **Is Series**
  checkbox (`#chkIsSeries`), **Save** (`#btnSave`), **Cancel**
  (`#btnCancel`).
- Blank-input validation on Add New exists but, like 6.2, is disabled by
  default and only runs when explicitly enabled.

**Purpose:** Prevents unintended discounts on items the business doesn't
want included in a promotion, giving fine control over deal boundaries.

---

## Why this whole module matters
Promotions and sales events are core to how furniture is sold. Without a
governed system for creating, scoping, and excluding items from specials,
promotions could accidentally apply too broadly (losing money) or too
narrowly (missing intended sales), and there would be no reliable record of
what deal was active when.

**Business impact if this module breaks:** A broken Add/Edit Special or
Excluded Items flow means a promotion could go live with the wrong items,
wrong series, or wrong dates — directly affecting revenue and customer
pricing at the point of sale.

**Who relies on this module:** Sales/Pricing teams (configure and launch
promotions), Order Entry (applies the special discount at the point of
sale), and Module 7 (Expired Specials), which depends on this module's
special codes and dates to identify orders whose promotional discount has
expired.
