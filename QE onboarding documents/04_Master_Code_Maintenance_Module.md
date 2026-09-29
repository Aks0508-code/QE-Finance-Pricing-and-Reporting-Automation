# Module 4: Master Code Maintenance — "The Dictionary"

## What is this module?
Master Code Maintenance manages short internal codes and what they mean —
essentially a lookup dictionary used across the whole application. Other
screens reference these codes as shorthand instead of repeating full text
everywhere.

It is a single maintenance surface with 15 total test definitions (13
regression, 2 smoke, 3 E2E-tagged).

## Purpose — why this exists at all
Nearly every screen in this whole pricing suite (Price Codes, Buyer Groups,
Price Lists, Price Exceptions, Formulas...) uses a short internal `Type`
code — like `Category`, `Delete`, `reactivate`, `repurpose` — to classify
rows without repeating a full sentence every time. Master Code Maintenance
is the single dictionary that defines what each `(PageName, Type, Code)`
combination actually means, in plain English, via its `Description` and
`Explanation` fields. Without it, developers and support staff would have
no authoritative place to look up "what does Type `reactivate` on page
`Inactive price code maint` actually mean."

## Where it is used
Each row is tagged with the exact screen (`PageName`) it belongs to — e.g.
`Buyer Group`, `Price code maint`, `Inactive price list maint`, `price
formula`, `Price Exceptions` — so this one grid documents codes used across
Modules 1 (Pricing), 2 (Buyer), and 8 (Price Exceptions) simultaneously.
The **InUse** column tells whoever is maintaining this dictionary whether a
given code is still actively referenced by its source screen before they
consider removing it.

> 💡 **Example (real live Stage data):** Page `Buyer Group`, Type
> `Category`, Code `BUYGRP` has Description `Buy Groups` and an editable
> Explanation of `Buy Groups`. Compare that to page `Inactive price code
> maint`, Type `reactivate`, Code `10`, Description `Deleted by mistake`,
> Explanation `the price code was deleted by mistake` — the same-looking
> `Type`/`Code` shape (`reactivate` / `10`) means something completely
> different depending on which `PageName` it's scoped to, which is exactly
> why `PageName` is part of the lookup key, not just `Code`.

## Module flow at a glance
![Module 4 flowchart](screenshots/04_master_code_flow.png)

---

## Submodule 4.1: Master Code Maintenance grid, filters, Add New, Save/Cancel, and Export (15 tests)

**Screen location:** Home → File Maintenance → Miscellaneous → Master Code
Maintenance
(`https://stage.ashleynet.com/PriceMaintenance_Net/MasterCode.aspx`)

![Master Code Maintenance grid](screenshots/04_master_code_maintenance_01.png)

**What it is:** One combined screen covering the full lifecycle of a
"Master Code" entry — its Page Name, Type, Code, Description, and
Explanation.

**Real fields observed on the live grid (Stage, Environment `ASHLEY
FURNITURE INDUSTRIES, LLC`):**
- **Environment** — dropdown scoping which company's codes are shown, same
  pattern as Modules 1–3.
- **Page name** / **Type** — two free-text filter boxes plus a **Search**
  button, letting you narrow the grid to one source screen and/or Type.
- **Delete** — checkbox per row; **disabled** on most rows (protected
  system codes) but enabled on at least one observed row (Page `Price
  Exceptions`, Type `Delete`, Code `10`), showing deletion eligibility
  varies row by row.
- **Initial** — the page identifier shorthand (e.g. `P9`, `P1`, `P10`,
  `P11`).
- **PageName** — the human-readable source screen (e.g. `Buyer Group`,
  `Price code maint`, `Inactive price list maint`, `price formula`, `price
  list and comm adj`).
- **Type** — the classification within that page (e.g. `Category`,
  `Delete`, `reactivate`, `repurpose`, `delete`).
- **Code** — disabled textbox holding the actual short code (e.g.
  `BUYDWN`, `CUSSP`, `DNU`, `Land`, `10`, `900`).
- **Description** — disabled textbox with a short label (e.g. `Buy Downs`,
  `Do not use`, `Deleted by mistake`).
- **Explanation** — the one field that **is editable** in every row (e.g.
  `Buy Downs`, `the price code was deleted by mistake`, `Item was
  repurposed by user`).
- **InUse** — `Y` on nearly every observed row, and blank on the one row
  with an enabled Delete checkbox (Page `Price Exceptions`, Code `10`) —
  suggesting `InUse = blank/N` is what actually unlocks the Delete
  checkbox.
- Toolbar: **Add New**, **Save**, **Cancel**, **Export To Excel**.

> ℹ️ **Note:** Only the **Explanation** column is directly editable on this
> grid — `Code` and `Description` are shown as disabled textboxes (visible
> but not typed into), so this screen is really meant for refining the
> long-form explanation of an existing code, not renaming the code itself.

**What's explicitly NOT covered:** Master Code does not have confirmed
linked inactive, defaults, members/customer, pricing, Update Queue,
upload, or separate popup routes — these are intentionally excluded rather
than guessed at or invented.

**Purpose:** Every code (like a page identifier or a category type) used
elsewhere in AshleyNET needs a definition somewhere — this is that
definition source. If this dictionary is wrong or has duplicate/unclear
entries, everything referencing those codes downstream becomes confusing or
inconsistent.

---

## Why this module matters
It's small but foundational — many other modules (Pricing, Buyer, Code
Cross Reference, Price Exceptions) rely on consistent codes. Keeping this
dictionary clean and correct prevents subtle bugs elsewhere in the system.

**Business impact if this module breaks:** A wrong or missing Explanation
means support staff and QE can't confidently tell what a given
`Type`/`Code` combination on another screen (e.g. why an item shows Type
`repurpose`) actually means — turning a two-second lookup into a
guessing game or an escalation.

**Who relies on this module:** Application support/QE (look up what an
unfamiliar Type/Code combination means), Developers (reference this as the
canonical code dictionary when building new features on top of existing
codes), and indirectly every module that displays a `Type`/`Code` pair
sourced from here (Buyer, Pricing, Price Exceptions).
