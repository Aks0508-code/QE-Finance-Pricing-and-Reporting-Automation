# Module 8: Price Exceptions — "The Custom Deal Maker"

## What is this module?
Price Exceptions handles individual customers who need a one-off,
non-standard price — an "exception" to the normal price list. It's a
separate Customer Maintenance application module and uses Stage only
(`stage.ashleynet.com`).

It has 40 total test definitions: 32 regression, 8 smoke, 13 E2E-tagged.

## Module flow at a glance
![Module 8 flowchart](screenshots/08_price_exceptions_flow.png)

## Submodule 8.1: Active Price Exceptions
What it is: The main working list of currently active price exceptions for
customers (`CustomerMaintenance/PriceExceptions.aspx`).
How it works: Covers the route, Environment selector (e.g. `ASHLEY FURNITURE
INDUSTRIES, LLC` vs `ASHLEY FURNITURE (SHANGHAI) CO LTD`), a "Find an Item"
search box with Search Now, a Reports category dropdown (A - Casegoods, B -
Bedding, C - Signature Bedding, D - Signature Casegoods, E - Signature
Accessory, K - Signature Motion, L - Motion, O - Signature Outdoor, P -
Outdoor, U - Stationary, V - Signature Stationary, X - Unclassified, Z -
Other), the results grid, a Delete All checkbox, and the action buttons:
View Inactive, Add New, Save, Change All Dates, Upload List from Excel,
Export To Excel, Cancel. It also enforces that this only runs against the
Stage host (never production). Data-dependent active/inactive row checks
are skipped automatically when there's no approved item to test against.
Purpose: Where the team reviews and manages every customer-specific price
override currently in effect.

![Active Price Exceptions grid](screenshots/08_price_exceptions_active_01.png)

## Submodule 8.2: Add New/Edit Exception
What it is: The form to create or modify a specific customer's price
exception (`CustomerMaintenance/PriceExceptionsEdit.aspx`), titled
"Exception and Commission Adjustment Maintenance".
How it works: Covers the Item Number field, DFI Disc, Warehouse dropdown
(full warehouse list, e.g. `55 - 3RD PARTY WAREHOUSE`, `1 - ARCADIA`, `C -
CONTAINER DIRECT`), +Disc, Price, Freight charge? (Yes/No), read-only Std
Disc and COOP Add fields, Order From / Order To date fields with calendar
Submit buttons (defaulting to today's date through year-end), -Disc, Misc
Discount (appears twice — one general, one tied to Use Reduction Table),
Comsn, C. Base Adj (disabled), and Use Reduction Table (Yes/No). Below the
main form are two adjustment panels: "View Commission Adjustments" (Code
dropdown — CAC-COOP ACCRUAL, FRT-FREIGHT, IMP-IMPORT FREIGHT, MAR-MARKUP,
XHF-ASHLEY EXPRESS HANDLING FEE, XPS-ASHLEY EXPRESS FREIGHT — with an
Amount field) and "View Discount Adjustments" split into Standard
Adjustment (Adj Code dropdown — VOL-FOB/VOLUME, NPS-NEW PLACEMENT
SPECIALS, MSC-MISCELLANEOUS, QTP-QUARTERLY PROMO, SSP-SHOW SPECIALS,
HOT-HOT BUYS DISCOUNT, VPF-VP FUND SPECIAL, ACF-ACCRUAL FUND SPECIAL,
PDD-PRICE DECREASE DISCOUNT, with a Percent field) and Coop Ad Adjustment
(Adj Code dropdown — PLP-POOL ACCRUAL, PLN-HOMESTORE NATIONAL ADV,
PLS-SPECIALS PROMO ACCRUAL, PLM-MARK-UP ACCRUAL, PLV-VOLUME DISCOUNT
ACCRUAL, PLD-DFI DISCOUNT ACCRUAL, PLA-ADVERTISING ACCRUAL, PLR-GROWTH
REBATE SPECIAL, PLE-ADVERTISING EXTRA, with a Percent field). The available
actions are Save and New, Save and Close, Save, and Cancel — with safe
Cancel and optional blank-field validation only run when explicitly
enabled.
Purpose: The detailed configuration screen where all the terms of one
customer's special pricing deal are set — not just the price, but who pays
freight, what warehouse ships it, what commission/discount adjustment
codes apply, and when it starts and ends.

![Add/Edit Price Exception form](screenshots/08_price_exceptions_add_edit_01.png)

## Submodule 8.3: Change All Dates
What it is: A bulk tool to update the effective dates across multiple price
exceptions at once, instead of editing them one by one.
How it works: Date fields, calendar controls, safe Cancel, and optional
validation.
Purpose: Saves time when a business change (e.g., a new fiscal quarter)
requires shifting many customers' exception dates together.

## Submodule 8.4: Excel import
What it is: A bulk upload path for price exceptions via spreadsheet.
How it works: File and column controls, supported-column selection, safe
Cancel, and an explicitly gated approved-file upload (only runs with
permission, to avoid unintended bulk writes).
Purpose: Lets large batches of custom pricing deals be loaded at once
rather than entered manually.

## Submodule 8.5: Inactive Price Exceptions
What it is: The historical/archived view of price exceptions no longer in
effect (`CustomerMaintenance/InActivePriceExceptions.aspx`).
How it works: Its own route, a "Find an Item" search with Search Now, the
same Environment selector (AFI / Shanghai), archived rows when available,
and a "Back To Price Exceptions" button to return to the active list.
Purpose: Keeps a record of past customer-specific deals for audit purposes
without cluttering the active list.

## Purpose
Price Exceptions is the customer-specific override layer of pricing: it
lets the business grant an individual customer a non-standard price,
discount, commission, freight, or warehouse arrangement without changing
the standard price list, Buyer Group, or Special that everyone else sees.

## Where it is used
Price Exceptions sits alongside — not on top of — Modules 1-3 (Price
Codes, Buyer Groups, Order Entry Specials): a customer can have a standard
price code AND a personal exception layered on top of it. When an
exception's Order To date passes, it moves from Active (8.1) into
Inactive (8.5), the same lifecycle pattern used by Module 7 (Expired
Specials) for specials.

> **Callout:** The Add/Edit form (8.2) exposes two independent adjustment
> mechanisms at once — Commission Adjustments (e.g. `FRT-FREIGHT`,
> `XPS-ASHLEY EXPRESS FREIGHT`) and Discount Adjustments split into
> Standard (`VOL-FOB/VOLUME`, `HOT-HOT BUYS DISCOUNT`, etc.) and Coop Ad
> (`PLP-POOL ACCRUAL`, `PLV-VOLUME DISCOUNT ACCRUAL`, etc.) — so one
> exception record can simultaneously alter price, freight, and coop
> accrual for that single customer/item pair.

## Why this whole module matters
Not every customer deal fits neatly into a standard price list or even a
Buyer Group. Price Exceptions is the safety valve for those one-off,
manually negotiated arrangements — while still keeping them tracked,
dated, and auditable rather than handled informally. Business impact:
sales and pricing teams rely on this to honor negotiated customer deals
precisely (correct freight terms, correct warehouse, correct discount
codes) without corrupting the shared price list that every other customer
uses. Stakeholders: Pricing/Customer Maintenance team, Sales, Finance
(commission and coop accrual accuracy), and QE (regression coverage across
40 test definitions: 32 regression, 8 smoke, 13 E2E-tagged).
