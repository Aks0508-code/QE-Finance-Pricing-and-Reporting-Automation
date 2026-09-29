# Price Code Regression Matrix

This is the complete initial Price Code test-design set for the Pricing regression project. The suite now contains 22 executable test definitions. The matrix below records only verified outcomes; mutation and runtime-data-gated cases are not marked as passed until executed with approved data.

| ID | Preconditions | Test steps | Expected result | Tags | Status |
|---|---|---|---|---|---|
| PM-PC-001 | Authorized Price Maintenance user | Open the Price Codes URL and authenticate if prompted | Price Code Maintenance page loads | `@price-code @smoke @pricing-regression` | Passed 2026-09-08 |
| PM-PC-002 | Price Codes page loaded | Check Environment, Currency, Category Code, Search, Add New, Save, and Cancel | All core controls are visible and available | `@price-code @smoke @functional` | Passed 2026-09-08 |
| PM-PC-003 | Approved category-code value supplied at runtime | Select Category Code; click Search | Category-code search completes and the selected category remains available | `@price-code @search @regression` | Runtime-data gated |
| PM-PC-004 | Authorized user and Price Codes page loaded | Confirm the stage page heading and breadcrumb identify Price Codes | Correct module and page are displayed, not a login or unrelated page | `@price-code @navigation @smoke` | Passed 2026-09-08 |
| PM-PC-005 | Approved active Price Code record | Open the Price Code maintenance view and inspect the active list | Active Price Code rows and editable controls are displayed | `@price-code @functional @regression` | Passed 2026-09-08 |
| PM-PC-006 | Inactive Price Code record exists | Select View Inactive | Inactive view navigation completes and the Price Code page remains available | `@price-code @archive @regression` | Passed 2026-09-08 |
| PM-PC-007 | Authorized user and approved create data | Click Add New and inspect the entry row/form | New Price Code entry controls are displayed | `@price-code @functional @regression` | Covered by PM-PC-021 |
| PM-PC-008 | Approved unique Price Code test data | Enter documented required fields and click Save | Record is created and documented confirmation appears | `@price-code @crud @regression` | Not executed: mutation gate |
| PM-PC-009 | New Price Code form displayed | Leave required fields blank and click Submit and Close | Form remains open and exposes browser/server validation without creating a record | `@price-code @validation @negative` | Passed 2026-09-08 |
| PM-PC-010 | New Price Code form displayed and approved invalid values supplied | Enter invalid Code/Description values, complete required form fields, then submit | Invalid-value validation is shown and the popup remains open without creating a record | `@price-code @validation @negative` | Runtime-data and mutation gated |
| PM-PC-011 | Approved category and existing editable Price Code | Change category on an existing approved record; save; restore | Saved category matches the approved value and the original category is restored | `@price-code @functional @regression` | Mutation gated |
| PM-PC-012 | VAT options and expected behavior documented | Set the approved VAT option; save; reload; restore | VAT state persists and the original VAT state is restored | `@price-code @functional @regression` | Not executed: mutation gate |
| PM-PC-013 | Base-price behavior documented | Check Base Price; save and verify; uncheck Base Price; save and verify; restore | Both checked and unchecked states persist, then the original state is restored | `@price-code @functional @regression` | Mutation gated |
| PM-PC-014 | Existing editable Price Code record | Change approved category and VAT; run the Base Price checked/unchecked cycle; restore | Only category, VAT, and Base Price are changed; all captured values are restored; currency is not asserted | `@price-code @crud @regression` | Mutation gated |
| PM-PC-015 | Existing record with effective-dated pricing | Apply a documented future-effective change | Current and future values follow documented effectivity behavior | `@price-code @effective-date @regression` | Not executed: effective-date control/rule not confirmed |
| PM-PC-016 | Existing Price Code with customer association | Open Customers from the selected record | Customer association page opens for the selected Price Code | `@price-code @functional @regression` | Passed 2026-09-08 |
| PM-PC-017 | Existing Price Code with formula information | Open Formulas and/or Audit from the selected record | Formula/audit information corresponds to the selected Price Code | `@price-code @audit @regression` | Navigation passed 2026-09-08; formula-data assertion pending |
| PM-PC-018 | Existing/approved duplicate Price Code and documented duplicate outcome | Submit the existing code from Add New | The documented reject or warning message is displayed and no unintended duplicate is accepted | `@price-code @validation @regression` | Mutation and duplicate-data gated |
| PM-PC-019 | Approved deletable Price Code record | Select the record for deletion and confirm documented action | Soft-delete/archive behavior occurs without unintended active loss | `@price-code @archive @regression` | Not executed: mutation gate |
| PM-PC-020 | Approved exportable Price Code dataset | Click Export To Excel and inspect the downloaded file name | Download succeeds with an Excel/CSV file extension | `@price-code @reporting @regression` | Passed 2026-09-08 |
| PM-PC-021 | Authorized user and Price Codes page loaded | Click Add New; inspect the separate New Price Code popup; cancel it | Popup exposes Code, Description, Category Code, Include VAT, Submit and Close, Submit and Add, and Cancel | `@price-code @create @functional` | Passed 2026-09-08 |
| PM-PC-022 | Approved unique create data and popup displayed | Fill a code different from existing/duplicate data, Description, Category Code, VAT, environment/currency; click Submit and Close | New Price Code is saved and the popup closes with the documented confirmation | `@price-code @create @crud` | Mutation gated |
| PM-PC-023 | New Price Code popup displayed | Click Cancel without submitting | Popup closes and no Price Code is created | `@price-code @create @cancel` | Passed 2026-09-08 |
| PM-PC-024 | Runtime item CSV/list and approved category-code values supplied | Randomly select an item; try configured category codes; if no rows appear, select another random item; click Search | Matching item results are displayed on Price List Maintenance within the bounded retry count | `@price-code @search @regression` | Skipped: item/category data not supplied |
| PM-PC-025 | Approved category-code value supplied at runtime | Select Category Code; click Search | Category results are displayed and the selected category remains available | `@price-code @search @regression` | Runtime-data gated |
| PM-PC-026 | Active grid contains a Formula link | Open Formulas from a Price Code row; navigate back | Formula page opens for the selected code and back navigation returns to Price Codes | `@price-code @navigation @audit` | Passed 2026-09-08 |
| PM-PC-027 | Active grid contains a Customers link | Open Customers from a Price Code row; navigate back | Customer page opens for the selected code and back navigation returns to Price Codes | `@price-code @navigation @customer` | Passed 2026-09-08 |
| PM-PC-028 | Approved existing Price Code and replacement description | Change Description; click Save; verify change; restore original Description; click Save | Description change persists, then original description is restored | `@price-code @update @restore` | Not executed: mutation gate |
| PM-PC-029 | Active editable Price Code row | Change Description without saving; click Cancel | Unsaved description is discarded and original value remains | `@price-code @cancel @negative` | Passed 2026-09-08 |
| PM-PC-030 | Active grid contains a visible code link | Open a Price Code from the grid; navigate back | Price List/code page opens and back navigation returns to Price Code Maintenance | `@price-code @navigation` | Passed 2026-09-08 |
| PM-PC-031 | Active grid contains multiple rows | Scroll to the bottom of the grid | Last loaded Price Code row becomes visible without layout or navigation failure | `@price-code @scrolling @functional` | Passed 2026-09-08 |
| PM-PC-032 | Approved unique create data and cleanup policy | Create a different Price Code; filter by its category; verify its code and description; count active matches; archive it | Newly created Price Code is present exactly once with the expected values and is cleaned up | `@price-code @create @verification @scrolling` | Mutation gated |
| PM-PC-033 | Approved disposable Price Code and mutation authorization | Open the archive Reason Codes page; click Cancel | The disposable Price Code remains active and is available for cleanup | `@price-code @archive @cancel` | Mutation gated |
| PM-PC-034 | Approved disposable Price Code and mutation authorization | Open the archive Reason Codes page; click Continue; open inactive records | The disposable Price Code is archived and is found in the inactive grid; cleanup is verified | `@price-code @archive @continue` | Mutation gated |
| PM-PC-035 | Authorized user and Price Codes page loaded | Click Copy Price Code; inspect the copy workflow; click Cancel | Copy workflow opens and can be cancelled without creating a record | `@price-code @copy @functional` | Added 2026-09-08 |

## Traceability

- The 2026-09-08 baseline run passed PM-PC-001, PM-PC-002, PM-PC-004 through PM-PC-007, PM-PC-009, PM-PC-016, PM-PC-020, PM-PC-021, PM-PC-023, PM-PC-026, PM-PC-027, and PM-PC-029 through PM-PC-031.
- PM-PC-003 and PM-PC-025 are now category-only tests; they require an approved `PRICE_CODE_TEST_CATEGORY` value.
- PM-PC-008, PM-PC-011 through PM-PC-014, PM-PC-019, PM-PC-022, PM-PC-028, and PM-PC-032 require explicit mutation approval and approved stage data.
- PM-PC-010 and PM-PC-018 are implemented with runtime-data gates for invalid values and duplicate behavior.
- PM-PC-033 and PM-PC-034 cover the Reason Codes Cancel and Continue archive paths using disposable records; PM-PC-034 verifies the archived record in the inactive grid.
- PM-PC-017 has verified navigation only; the required `Formulas+` data setup and persistence assertion remain pending.

## Safety gates

- No mutation test runs unless `PRICE_CODE_MUTATION_ENABLED=true` is explicitly set.
- Mutation tests must receive approved runtime test data through environment variables.
- Credentials must be supplied at runtime and must not be committed.
- No database or API assertions are included until their contracts and access are approved.