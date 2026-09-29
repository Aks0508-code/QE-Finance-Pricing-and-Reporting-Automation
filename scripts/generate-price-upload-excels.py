"""
Generates Price List upload test Excel files from the 1-lakh item source CSV.

Source: C:\\Users\\ANarayanan\\Downloads\\1LakhItemsQuantityPriceChanges.csv
Output header matches the QA reference upload format: Item, Price, FRT, (blank), Dis1, (blank)

Produces, under pricing-playwright-automation/test-data/generated/:
  - valid-random-items.xlsx          : N random unique items, valid prices, no duplicates
  - duplicate-items.xlsx             : same item repeated multiple times (duplicate scenario)
  - adjustment-percent.xlsx          : valid items using percentage-style discount adjustment values
  - adjustment-flat.xlsx             : valid items using flat-amount adjustment values
  - valid-items-small-01..05.xlsx    : 5 small (5-item) valid upload files, a fresh unique sample
                                        each run, for attaching to a newly created Price Code
  - duplicate-check-01..05.xlsx      : 5 files that each repeat one item multiple times, to
                                        exercise the duplicate-item validation/"Not Uploaded List"
  - header-variant-01..05.xlsx       : 5 files with different header-row spellings/casing/spacing,
                                        to exercise the "header row" checkbox handling

Every run reseeds from the current time, so the generated small/duplicate/header-variant
files are different item samples each time the script runs.

Usage:
  python scripts/generate-price-upload-excels.py
"""
import csv
import random
import os
import time

SOURCE_CSV = r"C:\Users\ANarayanan\Downloads\1LakhItemsQuantityPriceChanges.csv"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "test-data", "generated")
HEADER = ["Item", "Price", "FRT", None, "Dis1", None]

# Header variants to exercise the "header row" checkbox / header-detection logic.
HEADER_VARIANTS = [
    ["Item", "Price", "FRT", None, "Dis1", None],          # canonical
    ["ITEM", "PRICE", "FRT", None, "DIS1", None],           # all caps
    ["item", "price", "frt", None, "dis1", None],           # all lowercase
    ["Item Number", "Unit Price", "Freight", None, "Discount 1", None],  # verbose labels
    [" Item ", " Price ", " FRT ", None, " Dis1 ", None],    # padded whitespace
]

random.seed(int(time.time()))


def load_items():
    with open(SOURCE_CSV, newline="", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        items = [row["item_id"].strip() for row in reader if row.get("item_id", "").strip()]
    # de-dup while preserving order for the "unique pool"
    seen = set()
    unique_items = []
    for item in items:
        if item not in seen:
            seen.add(item)
            unique_items.append(item)
    return unique_items


def write_workbook(path, rows, header=None):
    from openpyxl import Workbook
    wb = Workbook()
    ws = wb.active
    ws.append(header if header is not None else HEADER)
    for row in rows:
        ws.append(row)
    wb.save(path)
    print(f"Wrote {path} ({len(rows)} data rows)")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    pool = load_items()
    print(f"Loaded {len(pool)} unique items from source CSV.")

    # 1. Valid random items, no duplicates, realistic price/frt/discount values.
    sample_size = min(500, len(pool))
    valid_items = random.sample(pool, sample_size)
    valid_rows = [
        [item, round(random.uniform(10, 500), 2), 2, 2, round(random.uniform(0, 10), 2), 0]
        for item in valid_items
    ]
    write_workbook(os.path.join(OUT_DIR, "valid-random-items.xlsx"), valid_rows)

    # 2. Duplicate scenario: reuse a handful of items multiple times within the same file.
    dup_base = random.sample(pool, 10)
    dup_rows = []
    for item in dup_base:
        for _ in range(3):  # each item repeated 3x
            dup_rows.append([item, round(random.uniform(10, 500), 2), 2, 2, round(random.uniform(0, 10), 2), 0])
    write_workbook(os.path.join(OUT_DIR, "duplicate-items.xlsx"), dup_rows)

    # 3. Adjustment scenario A: percentage-style discount (Dis1 as % 0-30).
    adj_pct_items = random.sample(pool, 200)
    adj_pct_rows = [
        [item, round(random.uniform(10, 500), 2), 2, 2, round(random.uniform(0, 30), 2), 0]
        for item in adj_pct_items
    ]
    write_workbook(os.path.join(OUT_DIR, "adjustment-percent.xlsx"), adj_pct_rows)

    # 4. Adjustment scenario B: flat-amount adjustment (Dis1 as flat $ 1-25).
    adj_flat_items = random.sample(pool, 200)
    adj_flat_rows = [
        [item, round(random.uniform(10, 500), 2), 2, 2, round(random.uniform(1, 25), 2), 0]
        for item in adj_flat_items
    ]
    write_workbook(os.path.join(OUT_DIR, "adjustment-flat.xlsx"), adj_flat_rows)

    # 5. Five small valid-item upload files (5 items each) for attaching to a freshly
    #    created Price Code. Fresh random sample every run.
    for i in range(1, 6):
        items = random.sample(pool, 5)
        rows = [
            [item, round(random.uniform(10, 500), 2), 2, 2, round(random.uniform(0, 10), 2), 0]
            for item in items
        ]
        write_workbook(os.path.join(OUT_DIR, f"valid-items-small-{i:02d}.xlsx"), rows)

    # 6. Five duplicate-check files: each repeats one item multiple times in the same
    #    file to exercise duplicate-row validation / the "Not Uploaded List".
    for i in range(1, 6):
        item = random.choice(pool)
        rows = [
            [item, round(random.uniform(10, 500), 2), 2, 2, round(random.uniform(0, 10), 2), 0]
            for _ in range(4)
        ]
        write_workbook(os.path.join(OUT_DIR, f"duplicate-check-{i:02d}.xlsx"), rows)

    # 7. Five header-variant files: same valid data, different header-row spelling/casing,
    #    to exercise the header-row checkbox / header-detection handling.
    for i, header in enumerate(HEADER_VARIANTS, start=1):
        items = random.sample(pool, 5)
        rows = [
            [item, round(random.uniform(10, 500), 2), 2, 2, round(random.uniform(0, 10), 2), 0]
            for item in items
        ]
        write_workbook(os.path.join(OUT_DIR, f"header-variant-{i:02d}.xlsx"), rows, header=header)


if __name__ == "__main__":
    main()
