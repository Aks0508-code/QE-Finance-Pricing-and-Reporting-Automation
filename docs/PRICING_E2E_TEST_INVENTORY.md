# Application E2E Test Inventory

**System:** AshleyNET Pricing, Buyer, Rate Validation, Master Code, Code Cross Reference, Order Entry Specials, Expired Specials Maintenance, Price Exceptions, and Surcharge / Global Adjustment Maintenance  
**Inventory date:** 2026-09-11  
**Source:** Playwright test definitions in `tests/pricing`, `tests/Miscellaneous`, `tests/order-entry-specials`, `tests/expired specials`, `tests/Price Exceptions`, and `tests/surcharge`  
**Status:** Definition inventory; not a claim that every gated test has passed

## 1. Separate application totals

| Module | Total tests | Regression | Smoke | E2E | No. of automation |
|---|---:|---:|---:|---:|---:|
| Price Code Maintenance | 26 | 23 | 3 | 9 | 26 |
| Price List Maintenance | 24 | 23 | 1 | 11 | 24 |
| Price List Update Queue | 10 | 9 | 1 | 4 | 10 |
| **Pricing application total** | **60** | **55** | **5** | **24** | **60** |
| Buyer Group Maintenance | 10 | 8 | 2 | 1 | 10 |
| Buyer Group Members | 6 | 5 | 1 | 1 | 6 |
| Buyer Group Defaults | 6 | 5 | 1 | 1 | 6 |
| Inactive Buyer Groups | 6 | 5 | 1 | 2 | 6 |
| Add New Buyer Group | 4 | 3 | 1 | 1 | 4 |
| Add New Item / Buyer Group Price | 5 | 4 | 1 | 1 | 5 |
| Buyer Group Pricing | 11 | 10 | 1 | 6 | 11 |
| **Buyer application total** | **48** | **40** | **8** | **13** | **48** |
| Rate Validation Limits Maintenance | 16 | 14 | 2 | 3 | 16 |
| **Rate Validation application total** | **16** | **14** | **2** | **3** | **16** |
| Master Code Maintenance | 15 | 13 | 2 | 3 | 15 |
| **Master Code Maintenance application total** | **15** | **13** | **2** | **3** | **15** |
| Code Cross Reference Master Maintenance | 15 | 13 | 2 | 3 | 15 |
| **Code Cross Reference application total** | **15** | **13** | **2** | **3** | **15** |
| Order Entry Specials | 30 | 24 | 6 | 12 | 30 |
| **Order Entry Specials application total** | **30** | **24** | **6** | **12** | **30** |
| Expired Specials / Order Maintenance | 30 | 23 | 7 | 10 | 30 |
| **Expired Specials application total** | **30** | **23** | **7** | **10** | **30** |
| Price Exceptions | 40 | 32 | 8 | 13 | 40 |
| **Price Exceptions application total** | **40** | **32** | **8** | **13** | **40** |
| Surcharge / Global Adjustment Maintenance | 397 | 387 | 10 | 4 | 397 |
| **Surcharge application total** | **397** | **387** | **10** | **4** | **397** |
| **Combined repository inventory** | **651** | **601** | **50** | **85** | **651** |

The Update Queue is a separate module from the Price List Maintenance landing page.
Its confirmed route is `PriceList_UQ.aspx`; its live controls were inspected with
Playwright MCP on 2026-09-10.

Buyer Group Tiered Rebates are explicitly excluded. The Buyer Group Pricing suite
detects an Update Queue control when exposed, but does not invent a separate route
without confirmed application evidence. The existing Price List Update Queue remains
covered as its own module.

### Buyer Group submodule map

The Buyer Group application contains seven included submodule/surface areas. The
existing 48 Buyer Group test definitions cover these areas across dedicated
submodule specs. The allocation below matches the executable test files.

| Buyer Group submodule/surface | Coverage allocation |
|---|---:|
| Buyer Group Maintenance | 10 |
| Buyer Group Members | 6 |
| Buyer Group Pricing | 11 |
| Buyer Group Defaults | 6 |
| Inactive Buyer Groups | 6 |
| Add New Buyer Group | 4 |
| Add New Item / Buyer Group Price | 5 |
| **Buyer Group test definitions** | **48** |

Buyer Group Update Queue is an additional capability-gated surface when the control is
exposed by the environment. Its route is not counted as a separate module until the
application exposes a confirmed Buyer Group-specific route. Tiered Rebates remain
excluded by scope.

### Rate Validation module map

Rate Validation is a separate application module from both Pricing and Buyer. The
reference screen confirms one maintained surface: Rate Validation Limits Maintenance.
No additional linked Rate Validation submodule was confirmed in the supplied reference.

| Rate Validation module | Coverage allocation |
|---|---:|
| Rate Validation Limits Maintenance | 16 |
| **Rate Validation test definitions** | **16** |

### Master Code Maintenance module map

Master Code Maintenance is a separate application module. The supplied screenshot
and confirmed route expose one maintenance surface with these covered areas:

| Master Code submodule/surface | Coverage allocation |
|---|---:|
| Master Code Maintenance grid, filters, Add New, Save/Cancel, and Export | 15 |
| **Master Code test definitions** | **15** |

No separate Master Code inactive, defaults, members/customer, pricing, Update Queue,
upload, or linked popup route was confirmed. Those areas are explicitly excluded
until application evidence is provided.

## 2. Pricing application — 60 tests

The Pricing application is separate from the Buyer application and contains Price Code
Maintenance, Price List Maintenance, and Price List Update Queue only.

### 2.1 Price Code Maintenance — 26 tests

Coverage includes:

- Smoke page-load, core controls, and module breadcrumb checks
- Active-row editable fields
- Add New, Submit and Close, Submit and Add, and Cancel workflows
- Copy Price Code workflow
- Blank and invalid-value validation
- Item/category and category-only search
- Formula, Price List, and Customer navigation
- Unsaved edit cancellation
- Description, category, VAT, and Base Price save/restore mutations
- Archive Reason Code Cancel and Continue paths
- Archive → inactive → reactivate → active lifecycle
- Create → archive → inactive → reactivate → cleanup lifecycle
- Inactive Price Code view
- Grid scrolling and pagination/row display controls
- Excel export and upload-control coverage

### 2.2 Price List Maintenance — 24 tests

Coverage includes:

- Smoke page-load and core search controls
- Navigation from Price Code Maintenance and return navigation
- Item search control and matching result search
- Visible result rows
- Excel export
- Pagination, Show All Rows, and Delete/Save/Cancel controls when exposed
- Inactive/archived Price List view when exposed
- Upload Items workflow and upload controls
- Header-row checkbox
- Effective Date field and visible calendar opening
- Calendar selection and exact Effective Date validation
- Future-month Effective Date selection and validation
- Common Adjustment 1–4 controls
- Do Not Replace Open Orders
- Upload-without-file validation
- Not Uploaded List
- Upload completion summary
- Upload window close
- Approved spreadsheet upload with Effective Date retained through the flow

### 2.3 Price List Update Queue — 10 tests

Confirmed by live MCP inspection of `PriceList_UQ.aspx`:

- Smoke page load
- Save and Cancel controls
- Visible price rows
- Editable Price and Effective Date fields
- Item Search control
- Pagination and Show All Rows controls
- Cancel discards an unsaved Price edit
- Change Method, User Id, Change Date, and Change Time audit columns
- Approved Price change Save → verification → Restore flow
- Excel export

The Update Queue suite is data-gated by `PRICE_LIST_UQ_PRICE_CODE`. Mutation tests
also require explicit approved original/test prices and
`PRICE_LIST_UQ_MUTATION_ENABLED=true`.

## 3. Buyer application — 48 tests

The Buyer application is separate from the Pricing application. Its 48 test definitions
cover seven Buyer Group submodule/surface areas. The 40 regression cases exclude the
eight smoke cases.

### 3.1 Buyer Group Maintenance — 10 tests

Coverage includes:

- Smoke page load and core controls
- Editable active Buyer Group grid fields
- Inquiry and discount controls when available
- Item, customer, and category search execution
- Linked Buyer Group Pricing navigation
- Excel export

### 3.2 Buyer Group Members — 6 tests

Coverage includes:

- Members route availability and navigation
- Member/customer content or empty-state response
- Usable member controls
- Member grid detection
- Return navigation to Maintenance

### 3.3 Buyer Group Defaults — 6 tests

Coverage includes:

- Defaults route and heading
- Editable and selection controls
- Labeled default-setting fields
- Cancel/close behavior
- Return navigation to Maintenance

### 3.4 Inactive Buyer Groups — 6 tests

Coverage includes:

- Inactive route and heading
- Archive/status information
- Inactive rows
- Reactivation controls when available
- Archive metadata columns
- Return navigation to Maintenance

### 3.5 Add New Buyer Group — 4 tests

Coverage includes:

- Confirmed Add New route
- Code, description, and category fields
- Environment selection requirements
- Submit and Add, Submit and Close, and Cancel controls

### 3.6 Add New Item / Buyer Group Price — 5 tests

Coverage includes:

- Confirmed Add New Item route
- Item, price, and Effective Date fields
- Buying Group selection
- Required-field labels
- Save and Add, Save and Close, and Cancel controls

### 3.7 Buyer Group Pricing — 11 tests

Coverage includes:

- Confirmed Buyer Group Pricing route load
- Pricing heading and visible-row detection when exposed
- Editable Price and Effective Date fields
- Independent Effective Date coverage
- Adjustment fields and editability when exposed
- Save and Cancel controls
- Cancel discards an unsaved Buyer Group price edit
- Inactive pricing control when available
- Update Queue-control detection when exposed
- Excel export when exposed

Tiered Rebates and persistent Buyer Group pricing mutations are excluded from this
safe initial suite. The cancel test changes only an unsaved field value and does not
persist data.

## 4. Rate Validation Limits Maintenance — 16 tests

Coverage includes:

- Smoke route and core-control checks
- Environment selector and available options
- Editable Lower Limit and Upper Limit fields
- Grid row and paired-limit structure
- Numeric limit-value validation
- Save and Cancel controls
- Safe unsaved-edit cancellation
- Inline invalid-range message detection
- Optional invalid-range validation action when explicitly enabled
- Lower Limit and Upper Limit column headers
- Confirmed 12-row inventory split evenly between Price Exceptions and Buyer Group Pricing
- Confirmed field descriptions across both sections
- Lower Limit ≤ Upper Limit relationship validation for every displayed row
- Safe selection of the second exposed Environment option

The invalid-range action is disabled by default and requires
`RATE_VALIDATION_INVALID_TEST_ENABLED=true`. It is intended to verify the rejection
of an Upper Limit below the Lower Limit; it does not perform a valid persistent save.

## 5. Master Code Maintenance — 15 tests

Coverage includes:

- Smoke route and core-control checks
- Environment selector and exposed options
- Page Name and Type filter execution, including approved runtime-data search
- Confirmed grid headers, rows, Delete/Initial/PageName/Type/Code/InUse context
- Editable Description and Explanation fields
- Safe unsaved edit cancellation
- Save and Cancel controls
- Add New open-and-Cancel workflow when the form is exposed
- Blank Add New validation only when explicitly enabled
- Export To Excel download verification
- Optional pagination detection when exposed

Master Code does not currently have confirmed linked inactive, defaults,
members/customer, pricing, Update Queue, upload, or separate popup routes. These are
excluded rather than represented by locator-only or invented tests.

## 6. Code Cross Reference Master Maintenance — 15 tests

Code Cross Reference Master Maintenance is a separate application module. Live Stage
inspection confirmed the main `CodeXRefMaster.aspx` grid, Base Code search, Environment
selector, Save/Cancel controls, inner scrollable grid, export capability when exposed,
and the `CodeXRefMasterNew.aspx` entry popup.

| Code Cross Reference submodule/surface | Coverage allocation |
|---|---:|
| Code Cross Reference grid, filters, entry popup, Save/Cancel, and export | 15 |
| **Code Cross Reference test definitions** | **15** |

Persistent Code Cross Reference creation, deletion, and updates are excluded. The
implemented edit workflow appends a marker and uses Cancel. Blank-entry validation is
disabled unless explicitly enabled with approved test-data permission. No separate
inactive, defaults, members/customer, pricing, Update Queue, or upload route was
confirmed; those areas are excluded.

## 7. Order Entry Specials — 30 tests

Order Entry Specials is a separate application module and uses Stage only
(`stage.ashleynet.com`). The suite covers the confirmed UI routes:

- Order Entry Specials grid, environment, editable fields, Cancel, Detail navigation,
  Excluded Items navigation, and Excel export
- Add/Edit Special
- Specials Detail
- Specials Item/Series Add/Edit
- Specials Excluded Items and Add New

## 8. Expired Specials / Order Maintenance — 30 tests

Expired Specials is a separate application module under `tests/expired specials` and
uses Stage only (`stage.ashleynet.com`). It covers:

- Orders with Expired Specials / discount removal
- Expired Specials Defer List
- Add New Expired Specials Defer List

The suite validates the documented filters, date fields, grids, Update/Execute/Cancel
controls, navigation, and safe Cancel paths. Persistent removal and approved-record
updates are explicit mutation gates, not default browser-test writes.

The reference documents in `specials and expired` add business-flow expectations beyond
the UI: Placement versus non-Placement order handling, order-line discount verification,
daily processing, generated report/email verification, expired-discount Execute/Update/
Cancel behavior, and defer-list exceptions. These external Ashley Direct, scheduled-job,
email, API, and database assertions are documented as integration gates rather than
claimed as completed browser passes.

The expired-discount reference identifies the business rule that a discount becomes
expired when the requested date is later than the special's Must Ship By date. The
safe browser suite validates the screen controls and selection surfaces; persistent
Execute/Update removal requires approved test orders and explicit mutation enablement.

The Locked Order Special Reports route is excluded because live inspection returned
HTTP 500 for the missing `AshleyNet.Templates.MVC.dll-12` assembly.

## 9. Price Exceptions — 40 tests

Price Exceptions is a separate Customer Maintenance application module and uses Stage
only (`stage.ashleynet.com`). The 40 discovered definitions cover:

- Active Price Exceptions route, environment, item search, Reports selector, grid,
  editable fields, safe unsaved-edit cancellation, Delete All toggle, and Stage-host
  enforcement
- Add New/Edit Exception fields, discount and commission adjustments, warehouse,
  freight, reduction table, effective dates, calendar controls, actions, safe Cancel,
  and optional blank validation
- Change All Dates fields, calendar controls, safe Cancel, and optional validation
- Excel import file/column controls, supported-column selection, safe Cancel, and
  explicitly gated approved-file upload
- Inactive Price Exceptions route, search, environment, archived rows when available,
  and Return navigation

The module has **32 regression**, **8 smoke**, and **13 E2E-tagged** definitions.
Data-dependent active/inactive row checks are skipped without an approved item. Upload,
blank-validation, and persistent mutation paths require explicit runtime enablement.
The browser suite does not claim Ashley Direct, scheduled-job, email, API, or database
verification.

## 10. Surcharge / Global Adjustment Maintenance — 397 definitions / 265 AshleyNET UI tests

Surcharge is implemented as a separate application module under `tests/surcharge`.
The confirmed Stage entry route is:

`https://stage.ashleynet.com/AdjustmentMaintenance/GlobalAdjustmentHeader`

The 397 definitions cover the full confirmed AshleyNET UI surface and the documented
microservice contract:

- Global Adjustment Header: Environment, Add New, Save/Cancel controls, all confirmed
  columns, audit fields, active code, safe environment selection, read-only row and
  detail navigation
- Global Adjustment Detail: filters, active-record visibility, search, Save/Cancel,
  Upload List Excel, audit fields, date fields, calculation level/type/value, and
  confirmed Customer Inclusion, Customer Exclusion, Customer Override, Item Exclusion,
  Country Exclusion, and export actions
- New Global Adjustment Header: Credit Code, calculation level, charge, adjustment
  type, unit type, rounding, submit actions, option validation, blank validation gate,
  and safe Cancel
- Adjustment Calculator: environment, customer, ship-to and warehouse capabilities,
  order date, item, price, quantity, calculation, result, Stage enforcement, and
  non-persisting Cancel
- Microservice request contract: required customer/ship-to/order-date/item/price
  fields, optional order and warehouse/date fields, ISO-8601 dates, quantity
  defaulting, non-negative numeric validation, and multiple items
- Calculation contract: percentage and dollar formulas, unit-price derivation,
  upward rounding, quantity extension, zero-price and zero-quantity boundaries
- Microservice response contract: status `0/1/2`, no-detail behavior for statuses
  `0/1`, echoed order/item fields, adjustment totals, and detail metadata
- Explicitly gated Stage API probes for approved minimal, quantity, multi-item,
  status, total, and negative-request scenarios

The verified module split is **387 regression**, **10 smoke**, and **4 E2E-tagged**
definitions. Adjustment IDs `0` and `1` are explicitly read-only. No test saves,
deletes, deactivates, or changes those records. Deletion coverage is limited to an
explicitly approved disposable non-`0/1` header. New creation, deletion, upload, and
calculator execution are runtime-data gated and disabled by default. Stage API probes are also disabled
unless `SURCHARGE_API_TEST_ENABLED=true`, a Stage API URL, and approved runtime
data are supplied.

## 11. Cross-application counts

| Coverage area | Count |
|---|---:|
| Functional-tagged tests | 108 |
| Validation tests | 13 |
| Search tests | 12 |
| Navigation tests | 18 |
| Reporting/export tests | 8 |
| UI/UX-tagged tests | 2 |
| Calendar/Effective Date tests | 6 |
| Inactive-related tests | 12 |
| Upload-related tests | 15 |
| Update Queue edit/save/cancel tests | 4 |
| Export tests | 7 |

Rate Validation is a single confirmed maintenance surface. The live page exposes no
separate Add New, Add New Item, inactive, defaults, members/customer, Update Queue,
upload, export, pagination, sorting, or popup route. These are explicitly not counted.

Code Cross Reference is a separate confirmed maintenance surface. Its entry popup is
covered, but persistent create/delete/update flows and unconfirmed linked surfaces are
not counted.

## 12. Inactive coverage

| Inactive scope | Count |
|---|---:|
| Dedicated inactive Price Code view | 1 |
| Price Code archive/reactivate flows entering inactive state | 3 |
| Dedicated inactive Price List view | 1 |
| Inactive Update Queue tests | 0 |
| Inactive Buyer Group suite | 6 |
| Dedicated inactive Buyer Group pricing control | 1 |
| **Inactive-related total** | **12** |

## 13. Upload and export coverage

| Scope | Count |
|---|---:|
| Price Code Excel upload/import control | 1 |
| Price List Upload Items workflow | 14 |
| Update Queue upload tests | 0 |
| **Upload-related total** | **15** |
| Price Code export | 1 |
| Price List export | 1 |
| Update Queue export | 1 |
| Buyer Group Maintenance export | 1 |
| Buyer Group Pricing export | 1 |
| Master Code Export To Excel | 1 |
| Code Cross Reference export | 1 |
| **Export total** | **7** |

## 14. Execution and safety notes

- Counts are test definitions discovered in source, not pass counts.
- Runtime-data-gated tests are skipped unless approved data is supplied.
- Mutation tests require explicit enablement and cleanup-safe records.
- Upload tests require an approved spreadsheet file and upload enablement.
- Manual authentication uses `STAGE_MANUAL_AUTH=true`; credentials are not stored.
- A full browser result requires a successful authenticated Stage run.

## 15. Source files

- `tests/pricing/price-codes/price-code-maintenance.spec.ts`
- `tests/pricing/price-lists/price-list-maintenance.spec.ts`
- `tests/pricing/price-lists/price-list-update-queue.spec.ts`
- `tests/pricing/price-lists/buyer-group-maintenance.spec.ts`
- `tests/pricing/price-lists/buyer-group-members.spec.ts`
- `tests/pricing/price-lists/buyer-group-defaults.spec.ts`
- `tests/pricing/price-lists/buyer-group-inactive.spec.ts`
- `tests/pricing/price-lists/buyer-group-forms.spec.ts`
- `tests/pricing/price-lists/buyer-group-pricing.spec.ts`
- `tests/pricing/rate-validation-limits.spec.ts`
- `tests/Miscellaneous/master-code-maintenance.spec.ts`
- `tests/Miscellaneous/code-xref-master.spec.ts`
- `tests/order-entry-specials/order-entry-specials.spec.ts`
- `tests/expired specials/expired-specials.spec.ts`
- `tests/Price Exceptions/price-exceptions.spec.ts`
- `tests/surcharge/surcharge.spec.ts`
- `pages/pricing/price-lists/price-list-update-queue.page.ts`
- `pages/pricing/price-lists/buyer-group-maintenance.page.ts`
- `pages/pricing/price-lists/buyer-group-pricing.page.ts`
- `pages/pricing/rate-validation/rate-validation-limits.page.ts`
- `pages/master-code/master-code-maintenance.page.ts`
- `pages/code-xref-master/code-xref-master.page.ts`
- `locators/pricing/price-list-update-queue.locators.ts`
- `locators/pricing/buyer-groups.locators.ts`
- `locators/pricing/rate-validation-limits.locators.ts`
- `locators/master-code.locators.ts`
- `locators/code-xref-master.locators.ts`
- `fixtures/master-code.fixture.ts`
- `config/master-code-data.ts`
- `fixtures/code-xref-master.fixture.ts`
- `config/code-xref-master-data.ts`
- `config/order-entry-specials-data.ts`
- `fixtures/order-entry-specials.fixture.ts`
- `pages/order-entry-specials/order-entry-specials.page.ts`
- `locators/order-entry-specials.locators.ts`
- `config/expired-specials-data.ts`
- `fixtures/expired-specials.fixture.ts`
- `pages/expired-specials/expired-specials.page.ts`
- `locators/expired-specials.locators.ts`
- `config/price-exceptions-data.ts`
- `fixtures/price-exceptions.fixture.ts`
- `pages/price-exceptions/price-exceptions.page.ts`
- `locators/price-exceptions.locators.ts`
- `config/surcharge-data.ts`
- `fixtures/surcharge.fixture.ts`
- `pages/surcharge/surcharge.page.ts`
- `locators/surcharge.locators.ts`
