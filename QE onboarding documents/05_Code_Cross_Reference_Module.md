# Module 5: Code Cross Reference — "The Translator"

## What is this module?
Code Cross Reference Master Maintenance maps one code used on a specific
source screen (`Type`, e.g. `Buyer Group Maintenance` or `Price Code
Maintenance`) to another code (`Xref Code`) that a different, shared lookup
recognizes — like translating a screen-specific "Base Code" into the
common `Xref Code` used elsewhere (e.g. mapping many different Buyer Group
codes down to a shared `Xref Code` such as `DNU`, `CUSSP`, `UNASN`,
`CONUSA`, `BUYGRP`, etc., which are the same `Xref Code` values you see as
`Code` entries in Module 4's Master Code dictionary).

It is a single confirmed maintenance surface with 15 total test
definitions.

## Purpose — why this exists at all
Many raw codes captured on individual screens (a Buyer Group ID like
`AAA`, `A20`, `501`; a Price Code like `TEST1`, `ZEBTI`, `65798`) need to be
normalized down to a smaller, shared set of canonical values (`DNU`,
`CUSSP`, `CONUSA`, `Land`, `Form`, `Unasn`, `Report`, `BUYGRP`, `BUYDWN`,
`CONINT`, `CONCAN`) so downstream logic doesn't need to know about every
possible raw code — it can just look at the normalized `Xref Code`. This
module is the single table that performs and maintains that many-to-one
translation.

## Where it is used
This is the shared backbone underneath **both** Module 1 (Pricing → Price
Code Maintenance) and Module 2 (Buyer → Buyer Group Maintenance): each row
here is stamped with a `Type` of either `Price Code Maintenance` or `Buyer
Group Maintenance`, tying a raw code from one of those two modules to a
canonical `Xref Code`. Those canonical Xref Code values (`DNU`, `CUSSP`,
`CONUSA`, `Land`, etc.) are the exact same `Code` values documented as
definitions in Module 4 (Master Code Maintenance) — so Module 5 is the
mapping layer that sits between the raw screen data (Modules 1 & 2) and the
dictionary of what the normalized codes mean (Module 4).

> 💡 **Example (real live Stage data):** Many different Buyer Group codes —
> `A20`, `A22`, `A27`, `AAA`, `454`, `503`, `506`, `510`, `511` — all map to
> the same Xref Code `CUSSP` (Customer Specific Code, per Module 4's
> dictionary). Meanwhile Price Code `65798` (the exact price code seen live
> in Module 1's Price Code Maintenance grid) maps to Xref Code `DNU` (Do
> Not Use) — showing this cross-reference table is what tells downstream
> systems "even though this is a distinct raw code, treat it as `DNU`."

## Module flow at a glance
![Module 5 flowchart](screenshots/05_code_xref_flow.png)

---

## Submodule 5.1: Code Cross Reference grid, filters, entry popup, Save/Cancel, and export (15 tests)

**Screen location:** Home → File Maintenance → Miscellaneous → Code Cross
Reference Master
(`https://stage.ashleynet.com/PriceMaintenance_Net/CodeXRefMaster.aspx`)

![Code Cross Reference Master grid](screenshots/05_code_xref_master_01.png)

**What it is:** The main `CodeXRefMaster.aspx` screen, plus its companion
entry popup `CodeXRefMasterNew.aspx` used to add a new cross-reference
mapping.

**Real fields observed on the live grid (Stage, Environment `ASHLEY
FURNITURE INDUSTRIES, LLC`, 100+ mapping rows):**
- **Environment** — dropdown scoping which company's mappings are shown,
  same pattern as Modules 1–4.
- **Base Code** — single free-text filter box plus a **Search** button, to
  jump directly to a known raw code's mapping.
- **Delete** — checkbox per row (all enabled/editable on this grid, unlike
  Module 4 where most Delete checkboxes were disabled).
- **Type** — the source screen the raw code belongs to; only two values
  observed live: `Buyer Group Maintenance` and `Price Code Maintenance`.
- **Base Code** (grid column) — the raw, screen-specific code (e.g.
  `ZEBTI`, `A20`, `65798`, `001`, `600`).
- **Xref Code** — the canonical/normalized code it maps to (e.g. `DNU`,
  `CUSSP`, `Land`, `Form`, `CONUSA`, `BUYGRP`, `Report`, `Unasn`) — these
  values line up directly with Module 4's Master Code dictionary entries.
- Toolbar: **Add New**, **Save**, **Cancel**, **Export To Excel**.

**Add New entry popup (`CodeXRefMasterNew.aspx`):**
- **Type** dropdown (`ddlType`) — pick the source screen.
- **Base Code** textbox (`txtBaseCode`).
- **Xref Code** textbox (`txtXrefCode`).
- **Save**/**Cancel** buttons.

**How it works:**
- Live-confirmed main grid on `CodeXRefMaster.aspx`.
- Base Code search lets you find existing mappings by their starting code.
- An Environment selector scopes which environment's mappings you're
  viewing.
- Save/Cancel controls on the main grid.
- An inner scrollable grid handles larger mapping lists (100+ rows
  observed live).
- Export capability when exposed, to pull the mapping list into Excel.
- The `CodeXRefMasterNew.aspx` entry popup is the confirmed "Add New"
  experience for creating a new code mapping.
- The implemented edit workflow appends a marker (a safe, reversible test
  change) and then uses Cancel — so testing doesn't actually persist
  changes to real mapping data.
- Blank-entry validation exists but is disabled unless explicitly enabled
  with approved test-data permission.

> ℹ️ **Note:** The safe test suite deliberately filters out any row
> containing `FOBARC` or `*` (see `safeRows` in the locators) before
> exercising the "edit" workflow — protecting a specific live production
> mapping from being touched even by a reversible test edit.

**What's explicitly NOT covered:** Persistent Code Cross Reference
creation, deletion, and updates are excluded from the safe suite. No
separate inactive, defaults, members/customer, pricing, Update Queue, or
upload route was confirmed for this module, so those are not tested or
claimed.

**Purpose:** Different systems (Ashley's internal system vs. an external
partner or a different internal application) sometimes use different codes
for the same real-world thing. This module is the translation table that
keeps them mapped to each other correctly, so data moving between systems
doesn't get misinterpreted.

---

## Why this module matters
Without an accurate cross-reference, a code meaning one thing internally
could be misread as something completely different by a partner system —
leading to wrong prices, wrong categories, or failed integrations. This
module is the safeguard against that kind of silent mismatch.

**Business impact if this module breaks:** A wrong or missing mapping
means a raw Buyer Group or Price Code won't normalize down to its intended
Xref Code (e.g. `DNU`, `CUSSP`), so any downstream logic relying on that
normalized value could treat an item as active when it should be
"Do Not Use," or fail to apply customer-specific pricing correctly.

**Who relies on this module:** Pricing/Buyer QE and support staff
(look up what a raw code from Module 1 or 2 actually normalizes to),
Developers (build logic against the small set of canonical Xref Codes
instead of the unbounded set of raw codes), and indirectly Module 4
(Master Code Maintenance), whose dictionary entries are exactly the target
Xref Code values used here.
