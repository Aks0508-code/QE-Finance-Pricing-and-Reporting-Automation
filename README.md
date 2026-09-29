# Pricing Playwright Automation

Fresh Playwright + TypeScript automation project for AshleyNET Pricing and Price Maintenance regression.

## Current scope

The repository contains nine separate application modules:

- **Pricing application** — 60 tests across Price Code Maintenance, Price List
  Maintenance, and Price List Update Queue.
- **Buyer application** — 48 tests across seven Buyer Group submodule/surface areas.
- **Rate Validation application** — 16 tests for Rate Validation Limits Maintenance.
- **Master Code Maintenance application** — 15 tests for the confirmed Master Code Maintenance surface.
- **Code Cross Reference application** — 15 tests for the confirmed Code Cross Reference Master Maintenance surface.
- **Order Entry Specials application** — 30 tests across Specials Maintenance, Detail, Item/Series, and Excluded Items.
- **Expired Specials / Order Maintenance application** — 30 tests across expired discount removal, the defer list, and Add New defer workflows.
- **Price Exceptions application** — 40 tests across active exceptions, Add New/Edit, Change All Dates, inactive exceptions, and Excel import.
- **Surcharge / Global Adjustment application** — 397 definitions, including **265 AshleyNET Global UI tests** across Global Header, Detail, Customer/Item/Country exception surfaces, New Header, Excel upload validation, calendar-picker coverage, deletion safety, and Adjustment Calculator; separate contract/API/matrix definitions are also retained.

The combined repository inventory is 651 test definitions.

Pricing application areas:

- **Price Code Maintenance**
- **Price List Maintenance**
- **Price List Maintenance - Update Queue**

Buyer application submodule/surface areas:

- **Buyer Group Maintenance**
- **Buyer Group Members**
- **Buyer Group Pricing**
- **Buyer Group Defaults**
- **Inactive Buyer Groups**
- **Add New Buyer Group**
- **Add New Item / Buyer Group Price**

Rate Validation application area:

- **Rate Validation Limits Maintenance**

Master Code Maintenance application area:

- **Master Code Maintenance**

Code Cross Reference application area:

- **Code Cross Reference Master Maintenance**

Order Entry Specials application areas:

- **Order Entry Specials grid and Add/Edit Special**
- **Specials Detail and Item/Series Add/Edit**
- **Specials Excluded Items and Add New**

Expired Specials / Order Maintenance application areas:

- **Orders with Expired Specials / discount removal**
- **Expired Specials Defer List**
- **Add New Expired Specials Defer List**

Price Exceptions application areas:

- **Active Price Exceptions maintenance**
- **Add New/Edit Price Exception**
- **Change All Dates**
- **Inactive Price Exceptions**
- **Excel import**

Surcharge / Global Adjustment application areas:

- **Global Adjustment Header**
- **Global Adjustment Detail**
- **Customer Inclusion, Customer Exclusion, and Customer Override**
- **Item Exclusion and Country Exclusion**
- **New Global Adjustment Header**
- **Adjustment Calculator**

The automation contains:

- Stage navigation using the confirmed Price Codes path
- Runtime-only authentication support
- Page Object and locator layers
- Core-control smoke coverage
- A safe category-code filter sample; currency is used only when the Add New form requires it
- A Price Code regression matrix with explicit contract/data gates
- Price List Upload Items and Effective Date calendar coverage
- Update Queue price/effective-date edit, Save/Cancel, audit, and export coverage
- Buyer Group search, editable grid, Add New, Add New Item, Defaults, inactive view,
  linked pricing/customer navigation, Save/Cancel, and export coverage
- Buyer Group Pricing route coverage, editable-control detection, export, and
  capability-gated Update Queue detection
- Rate Validation environment selection, the confirmed 12-row limits grid, both
  application sections, numeric bound validation, and safe Save/Cancel coverage
- Master Code Page Name/Type search execution, editable Description/Explanation
  fields, Environment selection, Add New/Cancel gating, safe edit cancellation,
  and Excel download coverage
- Code Cross Reference Base Code search, Environment selection, protected-row-aware
  editable grid coverage, safe edit cancellation, entry popup, and export coverage
- Order Entry Specials Stage-host navigation, Specials grid, Add/Edit, Detail, Item/Series,
  Excluded Items, safe Cancel paths, and export controls
- Expired Specials Stage-host navigation, discount filters/actions, Defer List, Add New,
  date fields, safe Cancel paths, and explicit mutation gates

Buyer Group Tiered Rebates, Exceptions, Specials, Special Discounts, Pricing Engine,
lifecycle mutations, reconciliation, and downstream integration suites remain separate
future areas.
See [`docs/PRICING_E2E_TEST_INVENTORY.md`](docs/PRICING_E2E_TEST_INVENTORY.md) for
the complete count and coverage inventory.

## Security

Set `STAGE_USERNAME` and `STAGE_PASSWORD` in the process or CI secret store. Never place values in this repository, test data, command arguments, screenshots, or reports. The project does not use saved Playwright authentication state.

## Commands

- `npm test` — all implemented tests
- `npm run test:smoke` — smoke tests
- `npm run test:price-code` — all Price Code tests
- `npm run test:price-code:regression` — Price Code tests with the regression tag
- `npm run test:price-list` — all Price List Maintenance tests
- `npm run test:price-list:regression` — Price List Maintenance regression tests
- `npm run test:update-queue` — all Update Queue tests
- `npm run test:update-queue:regression` — Update Queue regression tests
- `npm run test:buyer-group` — Buyer Group Maintenance entry-screen tests
- `npm run test:buyer-group:regression` — Buyer Group Maintenance regression tests
- `npm run test:buyer-group-pricing` — Buyer Group Pricing tests
- `npm run test:buyer-group-pricing:regression` — Buyer Group Pricing regression tests
- `npm run test:buyer` — all 48 Buyer application tests
- `npm run test:buyer-regression` — all 40 Buyer application regression tests, excluding smoke tests
- `npm run test:rate-validation` — all 16 Rate Validation Limits Maintenance tests
- `npm run test:rate-validation:regression` — 14 Rate Validation regression tests
- `npm run test:master-code` — all 15 Master Code Maintenance tests
- `npm run test:master-code:regression` — 13 Master Code Maintenance regression tests
- `npm run test:code-xref-master` — all 15 Code Cross Reference Master Maintenance tests
- `npm run test:code-xref-master:regression` — 13 Code Cross Reference regression tests
- `npm run test:order-entry-specials` — all 30 Order Entry Specials tests
- `npm run test:order-entry-specials:regression` — 24 Order Entry Specials regression tests
- `npm run test:order-entry-specials:smoke` — 6 Order Entry Specials smoke tests
- `npm run test:expired-specials` — all 30 Expired Specials tests
- `npm run test:expired-specials:regression` — 23 Expired Specials regression tests
- `npm run test:expired-specials:smoke` — 7 Expired Specials smoke tests
- `npm run test:price-exceptions` — all 40 Price Exceptions tests
- `npm run test:price-exceptions:regression` — 32 Price Exceptions regression tests
- `npm run test:price-exceptions:smoke` — 8 Price Exceptions smoke tests
- `npm run test:surcharge` — all 397 Surcharge / Global Adjustment definitions
- `npm run test:surcharge:ui` — 265 AshleyNET Global UI tests only
- `npm run test:surcharge:ui:regression` — 255 AshleyNET Global UI regression tests only
- `npm run test:surcharge:regression` — 387 Surcharge regression tests across all Surcharge files
- `npm run test:surcharge:smoke` — 10 Surcharge smoke tests
- `npm run test:surcharge:contract` — 43 local microservice contract and calculation tests
- `npm run test:surcharge:api` — explicitly gated Stage microservice probes
- `npm run test:surcharge:inventory` — discovers all Surcharge and AshleyNET UI tests and fails on count or duplicate qualified titles
- `npm run test:pricing-regression` — complete Pricing regression tag
- `npm run typecheck` — TypeScript validation
- `npm run report` — open the Playwright HTML report

Run one test with `npx playwright test tests/pricing/price-codes/price-code-maintenance.spec.ts -g PM-PC-001`.

For a visible browser without passing credentials to Playwright, set `STAGE_MANUAL_AUTH=true`, run `npx playwright test --grep "@price-code" --headed`, and complete the AshleyNET login in the Playwright browser. The test waits up to two minutes for login and does not save authentication state.

## Test data

Mutation cases require approved data supplied through runtime variables. Set `PRICE_CODE_MUTATION_ENABLED=true` only for an environment where the test records and cleanup policy are approved. The current implementation intentionally does not guess Price Code form selectors or write to shared stage data.

For category-code coverage, set `PRICE_CODE_TEST_CATEGORY` to an approved category code. Currency is not selected or asserted in existing-record update/filter tests; it remains required only when the Add New popup requires a currency choice. For combined Item Search coverage, set `PRICE_CODE_TEST_ITEMS_FILE` to one CSV path, or `PRICE_CODE_TEST_ITEMS_FILES` to semicolon-separated CSV paths, and set `PRICE_CODE_TEST_CATEGORIES` to a comma-separated list of approved category codes. Each run randomly selects an `item_id` across the supplied file(s), tries the configured category codes, and selects another random item when no matching combination is displayed. `PRICE_CODE_TEST_SEARCH_ATTEMPTS` limits retries and defaults to 5.

Add New and existing-record mutation cases also require approved runtime data. `PRICE_CODE_TEST_CREATE_CODE` must differ from any existing or duplicate code; when omitted, a disposable `TEST` identity is generated. Duplicate checks use `PRICE_CODE_TEST_DUPLICATE_CODE` or the approved existing `PRICE_CODE_TEST_CODE`, together with `PRICE_CODE_TEST_DUPLICATE_EXPECTATION=reject|warning`. Existing-record updates change category and VAT, save Base Price checked, save it unchecked, and restore the original category, VAT, and Base Price state in a `finally` cleanup path.

Rate Validation invalid-range submission is disabled by default. Enable
`RATE_VALIDATION_INVALID_TEST_ENABLED=true` only with explicit approval; it checks
validation for an Upper Limit below its Lower Limit and does not perform a valid
persistent save. The normal suite uses Cancel for unsaved edits.

Master Code filter tests use `MASTER_CODE_TEST_PAGE_NAME` and/or
`MASTER_CODE_TEST_TYPE` only when approved runtime values are supplied. Blank Add
New validation requires `MASTER_CODE_ADD_NEW_VALIDATION_ENABLED=true`; no valid
Master Code is created by the suite. The screenshot-confirmed Add New control is
tested with a capability-gated open-and-Cancel flow.

Code Cross Reference search tests use `CODE_XREF_MASTER_TEST_BASE_CODE` only when an
approved runtime value is supplied. Blank entry validation requires
`CODE_XREF_MASTER_ADD_NEW_VALIDATION_ENABLED=true`. The suite excludes `FOBARC` and
rows containing `*`, and normal edit coverage changes only an approved-looking row
in memory before Cancel; it does not persist Code Cross Reference data.

Order Entry Specials and Expired Specials use Stage only at
`https://stage.ashleynet.com`. The page object re-enters the intended Stage URL once
when AshleyNET redirects to another host, then fails rather than continuing against
production if the redirect persists.
Set `ORDER_ENTRY_SPECIALS_ENVIRONMENT` and `ORDER_ENTRY_SPECIALS_TEST_CODE` only to
approved values. Blank form validation is disabled unless
`ORDER_ENTRY_SPECIALS_BLANK_VALIDATION_ENABLED=true`; persistent mutation/removal is
disabled unless `ORDER_ENTRY_SPECIALS_MUTATION_ENABLED=true` and approved cleanup-safe
records are supplied.

Expired Specials uses `EXPIRED_SPECIALS_ENVIRONMENT` and an approved
`EXPIRED_SPECIALS_TEST_ORDER` only when the environment owner authorizes them. Update,
Execute, and defer-list edit coverage is disabled unless
`EXPIRED_SPECIALS_MUTATION_ENABLED=true`; blank Add New validation requires
`EXPIRED_SPECIALS_BLANK_VALIDATION_ENABLED=true`.

Price Exceptions uses Stage only at `https://stage.ashleynet.com`. The page object
re-enters the intended Stage URL if AshleyNET redirects to another host and fails
rather than continuing against production if the redirect persists. Active and
inactive row assertions require an approved `PRICE_EXCEPTIONS_TEST_ITEM`; upload
requires `PRICE_EXCEPTIONS_UPLOAD_FILE` and explicit
`PRICE_EXCEPTIONS_MUTATION_ENABLED=true`. Blank validation requires
`PRICE_EXCEPTIONS_BLANK_VALIDATION_ENABLED=true`.

Surcharge / Global Adjustment uses Stage only at
`https://stage.ashleynet.com/AdjustmentMaintenance/GlobalAdjustmentHeader`.
Adjustment IDs `0` and `1` are treated as production-sensitive read-only data: the
automation may inspect them, but never saves, deletes, deactivates, or changes them.
Deletion coverage is limited to an explicitly approved disposable non-`0/1` header
through `SURCHARGE_DELETE_ENABLED=true` and `SURCHARGE_DELETE_ADJUSTMENT_ID`.
New-record creation is disabled unless
`SURCHARGE_CREATE_ENABLED=true` and an approved disposable `SURCHARGE_TEST_CREDIT_CODE`
are supplied. Calculator execution requires approved runtime data through
`SURCHARGE_TEST_CUSTOMER`, `SURCHARGE_TEST_ITEM`, `SURCHARGE_TEST_ORDER_DATE`, and
`SURCHARGE_TEST_PRICE`. Contract tests run locally without Stage data. Stage API
probes additionally require `SURCHARGE_API_TEST_ENABLED=true`,
`SURCHARGE_API_BASE_URL` containing `stage.`, and approved runtime data. Negative
API probes require the separate `SURCHARGE_API_NEGATIVE_TEST_ENABLED=true` gate.

The reference documents in `specials and expired` describe Placement versus
non-Placement order processing, the requested-date versus Must Ship By expiry rule,
scheduled processing, report/email verification, Execute/Update/Cancel behavior, and
defer-list exceptions. Ashley Direct ordering, scheduled jobs, email delivery, APIs,
database stored procedures, and persistent expired-discount removal remain integration
gates and are not claimed as browser-test passes. Locked Order Special Reports remains
excluded because the environment returned HTTP 500 for a missing assembly.