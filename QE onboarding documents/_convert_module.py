"""Convert a Module markdown file (in this folder) into a .docx.

Usage: python _convert_module.py <ModuleFileNameWithoutExtension>
Reads   <name>.md
Writes  <name>.docx

Supports:
- '# ' / '## ' / '### ' headings
- '> **Callout:** ...' style blockquote lines -> shaded callout paragraph
- '![alt](relative/path.png)' -> embedded picture
- plain paragraphs
"""
import sys
import re
from pathlib import Path

from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = Path(__file__).parent

NAVY = RGBColor(0x1F, 0x38, 0x64)
ACCENT = RGBColor(0x2E, 0x74, 0xB5)
KNOWN_LABELS = [
    'What is this module?', 'What is it', 'What it is', 'How it works',
    'Purpose', 'Purpose — why this exists at all', 'Where it is used',
    'Why this whole module matters', 'Why this module matters',
    'Business rules and integration notes', 'Screen location', 'Route',
    'Routes', "What's explicitly NOT covered", 'Confirmed fields/controls',
    'Real fields observed on the live grid', 'Business impact if this module breaks',
    'Who relies on this module',
]
# Bold label form: **Label...:** rest   (label may have a trailing parenthetical)
BOLD_LABEL_RE = re.compile(r'^\*\*([^*]+?)\*\*:?\s*(.*)$')
# Plain label form: Label: rest
PLAIN_LABEL_RE = re.compile(r'^([A-Z][^:*]{2,60}?):\s+(.*)$')


def match_label_line(line):
    """Return (label, rest) if the line is a recognized structural label, else None."""
    m = BOLD_LABEL_RE.match(line)
    if m:
        label_raw, rest = m.group(1).rstrip(':').strip(), m.group(2).strip()
    else:
        m = PLAIN_LABEL_RE.match(line)
        if not m:
            return None
        label_raw, rest = m.group(1).strip(), m.group(2).strip()

    # Strip a trailing parenthetical, e.g. "Confirmed fields/controls (from ...)"
    base_label = re.sub(r'\s*\([^)]*\)\s*$', '', label_raw).strip()
    for known in KNOWN_LABELS:
        if base_label == known or base_label.startswith(known):
            return label_raw, rest
    return None


def shade_paragraph(paragraph, fill="F2F2F2"):
    pPr = paragraph._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill)
    pPr.append(shd)


def set_base_styles(doc: Document):
    """Set a consistent, presentable font/style scheme for the whole document."""
    normal = doc.styles['Normal']
    normal.font.name = 'Calibri'
    normal.font.size = Pt(11)
    normal.paragraph_format.space_after = Pt(8)
    normal.paragraph_format.line_spacing = 1.15
    rpr = normal.element.get_or_add_rPr()
    rFonts = rpr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = OxmlElement('w:rFonts')
        rpr.append(rFonts)
    rFonts.set(qn('w:eastAsia'), 'Calibri')

    heading_sizes = {1: 22, 2: 16, 3: 13}
    for level, size in heading_sizes.items():
        style = doc.styles[f'Heading {level}']
        style.font.name = 'Calibri'
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = NAVY
        style.paragraph_format.space_before = Pt(14 if level == 1 else 10)
        style.paragraph_format.space_after = Pt(6)
        if level == 1:
            style.paragraph_format.keep_with_next = True

    section = doc.sections[0]
    section.left_margin = Cm(2.2)
    section.right_margin = Cm(2.2)
    section.top_margin = Cm(2.0)
    section.bottom_margin = Cm(2.0)


def add_bottom_border(paragraph, color="1F3864"):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '8')
    bottom.set(qn('w:space'), '4')
    bottom.set(qn('w:color'), color)
    pBdr.append(bottom)
    pPr.append(pBdr)


def add_inline_runs(paragraph, text):
    """Render **bold** markers within a line as bold runs."""
    parts = re.split(r'(\*\*.*?\*\*)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**'):
            run = paragraph.add_run(part[2:-2])
            run.bold = True
        else:
            paragraph.add_run(part)


def add_label_paragraph(doc: Document, label: str, rest: str):
    """Highlight key structural labels (What is it / Purpose / How it works, etc.)."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(6)
    shade_paragraph(p, fill="EAF1FB")
    label_run = p.add_run(f"{label}:  ")
    label_run.bold = True
    label_run.font.color.rgb = ACCENT
    label_run.font.size = Pt(11)
    if rest:
        add_inline_runs(p, rest)
    return p


def convert(name: str):
    md_path = BASE / f"{name}.md"
    docx_path = BASE / f"{name}.docx"
    if not md_path.exists():
        raise SystemExit(f"Markdown file not found: {md_path}")

    doc = Document()
    set_base_styles(doc)
    lines = md_path.read_text(encoding="utf-8").splitlines()

    title_done = False

    for raw_line in lines:
        line = raw_line.rstrip()

        if not line.strip():
            continue

        # Images
        if line.startswith('!['):
            m = re.match(r'!\[(.*?)\]\((.*?)\)', line)
            if m:
                img_path = BASE / m.group(2)
                if img_path.exists():
                    doc.add_picture(str(img_path), width=Inches(6))
                    caption = doc.paragraphs[-1]
                    caption.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    cap = doc.add_paragraph()
                    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    cap_run = cap.add_run(m.group(1))
                    cap_run.italic = True
                    cap_run.font.size = Pt(9)
                    cap_run.font.color.rgb = RGBColor(0x59, 0x59, 0x59)
                continue

        # Callout / blockquote
        if line.startswith('>'):
            text = line.lstrip('>').strip()
            text = text.replace('**Callout:**', '').strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(8)
            run = p.add_run(f"Callout: {text}" if text else text)
            run.bold = True
            shade_paragraph(p, fill="FFF2CC")
            continue

        # Headings
        if line.startswith('### '):
            doc.add_heading(line[4:].strip(), level=3)
            continue
        if line.startswith('## '):
            doc.add_heading(line[3:].strip(), level=2)
            continue
        if line.startswith('# '):
            h = doc.add_heading(line[2:].strip(), level=1)
            add_bottom_border(h)
            title_done = True
            continue

        # Bullet list items
        if line.lstrip().startswith('- '):
            indent = len(line) - len(line.lstrip())
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.left_indent = Cm(0.6 + (indent / 2) * 0.5)
            p.paragraph_format.space_after = Pt(4)
            add_inline_runs(p, line.lstrip()[2:])
            continue

        # Structural labels -> highlighted paragraph
        m = match_label_line(line)
        if m:
            label, rest = m
            add_label_paragraph(doc, label, rest)
            continue

        # Plain paragraph
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_inline_runs(p, line)

    doc.save(str(docx_path))
    print(f"Saved {docx_path}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python _convert_module.py <ModuleFileNameWithoutExtension>")
    convert(sys.argv[1])
