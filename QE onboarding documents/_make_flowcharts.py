"""Generate simple box-and-arrow flowchart PNGs for each QE onboarding module.

Usage: python _make_flowcharts.py
Reads the FLOWS dict below and writes one PNG per module into screenshots/.
Each flowchart is a top-to-bottom sequence of steps grounded in the already
documented submodule flow for that module (no invented steps).
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from pathlib import Path

BASE = Path(__file__).parent
OUT_DIR = BASE / "screenshots"
OUT_DIR.mkdir(exist_ok=True)

BOX_FACE = "#EAF1FB"
BOX_EDGE = "#1F3864"
TEXT_COLOR = "#1F3864"
ARROW_COLOR = "#2E74B5"

FLOWS = {
    "01_pricing_flow": ("Module 1: Pricing — Flow", [
        "Define Price Code\n(Price Code Maintenance)",
        "Attach Price + Effective Date\nto an Item (Price List Maintenance)",
        "Change lands in\nUpdate Queue for review",
        "Reviewer confirms\nUser/Change Method/Date",
        "Price goes live —\nread by Order Entry, Invoicing,\nBuyer, Formula pricing",
    ]),
    "02_buyer_flow": ("Module 2: Buyer — Flow", [
        "Create Buyer Group\n(Buyer Group Maintenance)",
        "Set Buyer Group Defaults\n(discount template)",
        "Add Members\n(customer accounts) to the group",
        "Set item-level prices\n(Buyer Group Pricing)",
        "Order Entry checks Buyer Group\nmembership before falling back\nto standard Price List",
    ]),
    "03_rate_validation_flow": ("Module 3: Rate Validation — Flow", [
        "Finance defines Lower/Upper Limit\nper field, per source screen",
        "Price Exceptions / Buyer Group Pricing\nanalyst enters a discount value",
        "Value is validated against\nthe stored Lower/Upper bound",
        "Valid → value accepted\n  |  Invalid → rejected with message",
    ]),
    "04_master_code_flow": ("Module 4: Master Code Maintenance — Flow", [
        "New Type/Code combination\nintroduced on a source screen\n(Pricing, Buyer, Price Exceptions)",
        "Entry added to Master Code grid\n(PageName, Type, Code, Description)",
        "Explanation field refined/edited\nas needed",
        "Support/QE/Developers look up\nthe code's meaning when needed",
    ]),
    "05_code_xref_flow": ("Module 5: Code Cross Reference — Flow", [
        "Raw code captured on source screen\n(Buyer Group or Price Code Maintenance)",
        "Add New mapping via\nCodeXRefMasterNew popup\n(Type, Base Code, Xref Code)",
        "Mapping saved to\nCode Cross Reference grid",
        "Downstream systems resolve\nraw code -> canonical Xref Code\n(defined in Module 4)",
    ]),
    "06_order_entry_specials_flow": ("Module 6: Order Entry Specials — Flow", [
        "Create/Edit Special\n(Add/Edit Special form)",
        "Attach Items or Series\nto the Special (Item/Series Add/Edit)",
        "Exclude specific items\nif needed (Excluded Items)",
        "Special appears active\non main Specials grid",
        "Order placed against active Special\napplies the discount",
        "After end date, unresolved orders\nflow to Module 7 (Expired Specials)",
    ]),
    "07_expired_specials_flow": ("Module 7: Expired Specials — Flow", [
        "Special's Must Ship By date passes",
        "Order still holds the\nexpired discount",
        "Orders with Expired Specials screen\nidentifies the affected order",
        "Execute removes the stale discount\n  |  Defer List exempts the order",
        "Order proceeds with\ncorrect (non-expired) pricing",
    ]),
    "08_price_exceptions_flow": ("Module 8: Price Exceptions — Flow", [
        "Add New / Edit Exception\n(customer + item specific terms)",
        "Configure price, freight,\nwarehouse, discount/commission codes",
        "Exception appears on\nActive Price Exceptions grid",
        "Order To date passes →\nmoves to Inactive Price Exceptions",
        "Change All Dates / Excel Import\nsupport bulk maintenance",
    ]),
    "09_surcharge_flow": ("Module 9: Surcharge / Global Adjustment — Flow", [
        "Create Global Adjustment Header\n(Credit Code, scope, calc type)",
        "Add Detail rows\n(item classes, date window)",
        "Preview impact via\nAdjustment Calculator",
        "Publish the rule",
        "Adjustment Microservice applies rule\nat Order Entry / Invoicing / CM time\n(AS400 + system-to-system calls)",
        "Rule expires or is deactivated\nwhen cost pressure passes",
    ]),
}


def draw_flow(title: str, steps: list[str], out_path: Path):
    n = len(steps)
    box_h = 0.9
    gap = 0.5
    fig_h = n * (box_h + gap) + 1.2
    fig, ax = plt.subplots(figsize=(6.4, fig_h * 0.62))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, fig_h)
    ax.axis("off")

    ax.text(5, fig_h - 0.5, title, ha="center", va="center",
             fontsize=13, fontweight="bold", color=TEXT_COLOR)

    y = fig_h - 1.4
    centers = []
    for step in steps:
        box = FancyBboxPatch((1.0, y - box_h), 8.0, box_h,
                              boxstyle="round,pad=0.08,rounding_size=0.12",
                              linewidth=1.4, edgecolor=BOX_EDGE, facecolor=BOX_FACE)
        ax.add_patch(box)
        ax.text(5, y - box_h / 2, step, ha="center", va="center",
                 fontsize=9.5, color=TEXT_COLOR, wrap=True)
        centers.append(y - box_h)
        y -= (box_h + gap)

    for i in range(len(centers) - 1):
        top_y = centers[i]
        bottom_y = centers[i + 1] + box_h
        arrow = FancyArrowPatch((5, top_y), (5, bottom_y),
                                 arrowstyle="-|>", mutation_scale=16,
                                 linewidth=1.6, color=ARROW_COLOR)
        ax.add_patch(arrow)

    plt.tight_layout()
    fig.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"Saved {out_path}")


if __name__ == "__main__":
    for filename, (title, steps) in FLOWS.items():
        draw_flow(title, steps, OUT_DIR / f"{filename}.png")
