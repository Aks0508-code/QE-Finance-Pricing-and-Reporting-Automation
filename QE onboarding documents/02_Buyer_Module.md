# Module 2: Buyer — "Special Club Pricing"

## What is this module?
Some customers (buyers) belong to groups that get their own negotiated
prices, like a wholesale club membership. The Buyer module manages these
groups, their members, and the special prices tied to them.

It has 7 submodules and 48 total test definitions (40 regression, 8 smoke,
13 E2E-tagged).

## Purpose — why this exists at all
Not every customer pays the standard Price List rate (Module 1). Large
accounts — big-box retailers, rental chains, national buying groups — often
negotiate their own discount structure across an entire class of items
rather than one item at a time. The Buyer module is what turns "we made a
deal with this customer" into an enforceable, auditable set of rules: a
Buyer Group is the container for the deal, Buyer Group Members is the exact
list of customer accounts that deal applies to, Buyer Group Defaults is the
discount template new members inherit automatically, and Buyer Group
Pricing is where item-level special prices under that group are actually
set and edited.

## Where it is used
Order Entry and invoicing check whether a customer belongs to an active
Buyer Group before falling back to the standard Price Code/Price List
chain — so a mistake here (wrong member list, wrong default discount, wrong
item price) silently overcharges or undercharges a real customer on every
order they place. Buyer Group Pricing links directly back to Price Codes/
Price Lists from Module 1, and the Environment selector (`ASHLEY FURNITURE
INDUSTRIES, LLC` vs `ASHLEY FURNITURE (SHANGHAI) CO LTD`) scopes groups per
legal entity exactly as it does in Module 1.

> 💡 **Example (real live Stage data):** Buyer Group `RAC` (Environment
> `AFI`) has member customers `1256500` and `2083400` (both "RENT-A-CENTER")
> and `2418300` ("GET IT NOW, LLC"), all added `01/29/2018` with no end
> date. Buyer Group Defaults for `AFI` includes a default row for group
> `004` with a `Cmsn Rate` of `2.4000` and a `Freight` discount of `0.0000`,
> active `04/19/2026`–`05/30/2026` — a new member added to group `004`
> during that window automatically inherits those numbers without anyone
> re-typing them.

## Module flow at a glance
![Module 2 flowchart](screenshots/02_buyer_flow.png)

---

## Submodule 2.1: Buyer Group Maintenance (10 tests)

**Screen location:** Home → File Maintenance → Price Maintenance → Buyer
Groups (`https://stage.ashleynet.com/PriceMaintenance_Net/BuyerGroups.aspx`)

![Buyer Group Maintenance grid](screenshots/02_buyer_group_maintenance_01.png)

**What it is:** The master list of buyer groups ("clubs") and their
settings — the entry point for everything else in this module.

**Real fields/controls observed on the live grid (Stage):**
- **Environment** selector — scopes which legal entity's Buyer Groups are
  shown (e.g. `ASHLEY FURNITURE INDUSTRIES, LLC`).
- **Item Search / Customer Search / Category Search** — three independent
  filter boxes plus a **Search** button, so you can find a group by any of
  item, customer, or category.
- Grid rows show each group's **Code**, **Description**, and **Category
  Code** (editable inline), plus checkboxes for **Show on Inquiry** and
  **Use Discount** where applicable.
- Per-row links: to **Buyer Group Members** (`BuyerGroupMembers.aspx`) and
  to **Buyer Group Pricing** (`BuyerGroupPricing.aspx`) for that group.
- Toolbar: **Add New Item**, **View Inactive**, **Add New**, **Save**,
  **Cancel**, **Export To Excel**, and a **Defaults** link
  (`BuyerGroupDefaults.aspx`).

> ℹ️ **Note:** "Add New" creates a brand-new Buyer Group (Submodule 2.5);
> "Add New Item" creates a new item-level price under an existing group
> (Submodule 2.6) — the two buttons look similar but open completely
> different forms, which is a common source of tester confusion.

**Purpose:** The starting point to see and manage every buyer group that
exists, and the hub that links out to Members, Pricing, and Defaults.

---

## Submodule 2.2: Buyer Group Members (6 tests)

**Screen location:** reached from a Buyer Group's row link, e.g.
`BuyerGroupMembers.aspx?envSelected=AFI&Code=RAC`

![Buyer Group Members grid — group with members](screenshots/02_buyer_group_members_02.png)

**What it is:** Who belongs to which buyer group/club — the exact roster of
customer accounts that receive that group's special pricing.

**Real fields observed on the live grid (Stage, group `RAC`):**
- **Customer** — the customer account number (e.g. `1256500`, `2083400`,
  `2418300`).
- **Category Code** — shown as `Report` for these rows.
- **Ship to** — ship-to location code, if the membership is scoped to a
  specific ship-to rather than the whole account.
- **Name** — customer name (e.g. `RENT-A-CENTER`, `GET IT NOW, LLC`).
- **Start Date / End Date** — membership window (e.g. `01/29/2018` start,
  blank end date meaning the membership never expires).
- **Customer** search box + **All Buy Groups** checkbox — search across a
  single group or every group's members at once.
- Toolbar: **Back to Buy Groups**, **Add New**, **Save**, **Export To
  Excel**.

![Buyer Group Members — empty state](screenshots/02_buyer_group_members_01.png)

> ℹ️ **Note (real empty-state behavior):** Group `001` (Environment `AFI`)
> returns **"No records found"** instead of a grid — this is a legitimate
> state, not an error, and QE test cases must handle it as such rather than
> assuming every group has members.

> 💡 **Example:** Group `RAC` has 3 active members with no end date, all
> added on the same day (`01/29/2018`) — suggesting they were bulk-loaded
> together when the RAC buying-group deal was first set up.

**Purpose:** Keeps membership rosters accurate so the right customers — and
only the right customers — get the group's special pricing.

---

## Submodule 2.3: Buyer Group Defaults (6 tests)

**Screen location:** `BuyerGroupDefaults.aspx?envSelected=AFI&Code=RAC`
(also reachable via the **Defaults** link on Buyer Group Maintenance)

![Buyer Group Defaults grid](screenshots/02_buyer_group_defaults_01.png)

**What it is:** The default discount/rules a brand-new group member gets
automatically, without manual setup — one row per warehouse (`Whse`) code.

**Real fields observed on the live grid (Stage, Environment `AFI`):**
- **Group** — the Buyer Group code this default row belongs to (e.g. `001`,
  `004`, `008`, `020`...`UOH`).
- **Whse** — warehouse code dropdown scoping the default (e.g. `55`, blank,
  `CNW`, `C`, `335`).
- **Std Disc**, **- Disc**, **Misc Disc 1**, **Coop Ad**, **Misc Disc 2**,
  **DFI Disc**, **+ Disc**, **Freight** — a stack of independent discount
  percentage fields (e.g. group `008`: `Std Disc 0.1500`, `Misc Disc 1
  0.0500`, `+ Disc 0.0400`, `Freight 0.2100`). Some fields (like `Std Disc`)
  are shown **disabled/read-only** on certain rows, meaning they're
  system-derived rather than manually editable there.
- **Start Date / End Date** — the window this default set is valid for
  (e.g. group `020`: `03/01/2026`–`12/31/2026`).
- **Cmsn Rate** — commission rate applied for that default (e.g. `2.4000`
  for several groups).
- **Use Reduct** — `Y`/`N` dropdown controlling whether a reduction rule
  applies.
- **Delete** checkbox per row.
- Per-row **Edit** link opens `BuyGroupDefaultAddEdit('AFI','<Group>')`.
- Toolbar: **Add New Default**, **Export to Excel**, **Save**, **Cancel**,
  **Back to Buy Groups**.

> 💡 **Example:** Group `004` has `Std Disc` disabled at `0.1500`, `Cmsn
> Rate 2.4000`, `Use Reduct = N`, active `04/19/2026`–`05/30/2026`. A brand
> new customer added to group `004` during that date window inherits this
> exact discount/commission stack instead of a Finance analyst re-entering
> eight separate percentages by hand.

> ℹ️ **Note:** This is a long, densely-packed grid (dozens of Group/Whse
> combinations per Environment) — QE assertions should target a specific
> known Group row rather than assuming row order or total row count, since
> new defaults can be added over time.

**Purpose:** Saves time and prevents entry errors — new members don't start
from a blank slate, they inherit a pre-approved discount template.

---

## Submodule 2.4: Inactive Buyer Groups (6 tests)
**Screen location:** reached via **View Inactive** on Buyer Group
Maintenance (`BuyerGroupsInActive.aspx`)

**What it is:** The "closed clubs" list — groups no longer in active use,
kept for history/audit purposes rather than being permanently deleted.

**Real behavior observed:**
- Confirmed route and an **Inactive Buyer Group Maintenance** heading,
  distinct from the active `Buyer Group Maintenance` heading.
- Inactive rows carry archive/status metadata and, when the environment
  exposes it, a **Reactivate** control per row that flips a group back to
  active status.
- **Back to Buy Groups** returns to the main active list.

> ℹ️ **Note:** Test coverage explicitly checks for the presence of
> reactivation controls "when available" — some environments/permission
> levels may render this screen read-only for a given user.

**Purpose:** Nothing is permanently deleted — retired groups (e.g. an
expired customer deal) remain visible for history and can be reactivated if
the deal is renewed, instead of re-creating the group from scratch.

---

## Submodule 2.5: Add New Buyer Group (4 tests)

**Screen location:** `BuyerGroupsNew.aspx`, opened via **Add New** on Buyer
Group Maintenance

**What it is:** The form used to create a brand-new buyer group from
scratch, before any members or pricing exist for it.

**Real fields (per locator definitions):**
- **Code** — the new Buyer Group's unique identifier textbox.
- **Description** — free-text label for the group.
- **Category Code** — combobox scoping the group.
- **Show on Inquiry** — checkbox controlling whether the group appears in
  inquiry screens.
- **Environment** checkboxes (e.g. `ASHLEY FURNITURE` entities) — a group
  can be flagged for one or more legal entities at creation time.
- **Submit and Close** / **Submit and Add** — save-and-exit vs. save-and-
  keep-the-form-open-for-another-entry.
- **Cancel** — discards the new group without saving.

**Purpose:** Lets the business onboard a new special-pricing club the
moment a new customer deal is negotiated, without touching existing groups.

---

## Submodule 2.6: Add New Item / Buyer Group Price (5 tests)

**Screen location:** `BuyerGroupPriceNew.aspx`, opened via **Add New Item**
on Buyer Group Maintenance

**What it is:** Adding one specific item's special price for one specific
buyer group — the fine-grained counterpart to creating the group itself.

**Real fields (per locator definitions):**
- **Item Number** — required textbox for the SKU getting a special price.
- **Price** — the negotiated dollar amount for that item under this group.
- Date fields (e.g. an Effective Date) controlling when the special price
  starts.
- Adjustment fields (discount/commission-style inputs) alongside the base
  price, mirroring the adjustment fields seen on Buyer Group Pricing
  itself.
- **Save & Add** / **Save & Close** — save-and-continue vs. save-and-exit.
- **Cancel** — closes without persisting the new price row.

**Purpose:** The precise step where an individual item's club price is set
— this is what actually makes a buyer group's discount real at the SKU
level, rather than just a description of a deal.

---

## Submodule 2.7: Buyer Group Pricing (11 tests)

**Screen location:** reached from a Buyer Group's row link, e.g.
`BuyerGroupPricing.aspx?envSelected=AFI&Code=<group>`

**What it is:** Where you view and edit the actual special prices a club
gets, item by item — the "shop floor" of the Buyer module, and the screen
sales/order-entry teams check most often.

**Real behavior/fields observed:**
- A **Buyer Group Pricing** heading and a pricing grid whose rows carry
  **Price** and **Effective Date** fields — both independently editable.
- Additional discount/commission **Adjustment** fields alongside price,
  editable when the environment exposes them.
- **Save** and **Cancel** controls — Cancel discards an unsaved price edit
  without persisting it, which QE relies on to safely probe editability
  without corrupting live-like Stage data.
- An **Inactive pricing** control and an **Update Queue** link are exposed
  in some configurations, mirroring the review-queue pattern from Module 1
  (Price List Update Queue).
- **Export To Excel** when exposed.

> ℹ️ **Note (explicit exclusion):** Tiered Rebates and any persistent Buyer
> Group pricing mutation are explicitly excluded from this safe test
> suite — those actions can permanently alter real customer pricing data,
> so only non-destructive checks (page load, field editability, Cancel
> behavior) are automated here.

**Purpose:** The central screen buyers/sales teams use daily to confirm
exactly what a specific club is being charged for a specific item, right
now.

---

## Why this whole module matters
Large or loyal customers often negotiate their own pricing outside the
standard price list. Without the Buyer module, those deals would live
scattered across emails and spreadsheets instead of one governed system —
risking inconsistent pricing and lost agreements.

**Business impact if this module breaks:** A wrong or missing entry in
Buyer Group Members (2.2) means a negotiated customer gets charged standard
price (or worse, the wrong group's price); a broken Buyer Group Defaults
(2.3) means new members don't inherit the agreed discount stack and Finance
has to manually re-key it; and an editable-but-not-saving Buyer Group
Pricing screen (2.7) means sales quotes a price that never actually applies
at invoicing.

**Who relies on this module:** Finance/Pricing analysts (negotiate and
maintain group discount terms), Sales/Order Entry (confirm what a specific
customer is charged before quoting), Customer-facing account teams (verify
membership when a customer disputes their price), and QE (validates the
Maintenance → Members/Defaults → Pricing chain stays consistent across
Buyer Groups).
