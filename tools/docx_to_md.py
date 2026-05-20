import argparse
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{%s}" % NS["w"]


def text_of_run(run: ET.Element) -> str:
    parts = []
    for child in run:
        if child.tag == f"{W}t":
            parts.append(child.text or "")
        elif child.tag == f"{W}tab":
            parts.append("\t")
        elif child.tag in {f"{W}br", f"{W}cr"}:
            parts.append("\n")
    text = "".join(parts)
    if not text:
        return ""

    rpr = run.find("w:rPr", NS)
    if rpr is None:
        return text

    is_bold = rpr.find("w:b", NS) is not None
    is_italic = rpr.find("w:i", NS) is not None

    escaped = text.replace("*", r"\*").replace("_", r"\_")
    if is_bold and is_italic:
        return f"***{escaped}***"
    if is_bold:
        return f"**{escaped}**"
    if is_italic:
        return f"*{escaped}*"
    return escaped


def text_of_paragraph(paragraph: ET.Element) -> str:
    pieces = []
    for child in paragraph:
        if child.tag == f"{W}r":
            pieces.append(text_of_run(child))
        elif child.tag == f"{W}hyperlink":
            hyperlink_text = "".join(text_of_run(run) for run in child.findall("w:r", NS))
            if hyperlink_text:
                pieces.append(hyperlink_text)
    text = "".join(pieces)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "<br>", text)
    return text.strip()


def paragraph_style(paragraph: ET.Element) -> str:
    style = paragraph.find("./w:pPr/w:pStyle", NS)
    return style.attrib.get(f"{W}val", "") if style is not None else ""


def is_list_paragraph(paragraph: ET.Element) -> bool:
    return paragraph.find("./w:pPr/w:numPr", NS) is not None


def heading_level(style: str, text: str, index: int) -> int | None:
    style_lower = style.lower()
    text_lower = text.lower()
    if "heading1" in style_lower:
        return 1
    if "heading2" in style_lower:
        return 2
    if "heading3" in style_lower:
        return 3
    if index == 0:
        return 1
    if index == 1:
        return 2
    if "evaluación parcial" in text_lower or "evaluaci" in text_lower and "parcial" in text_lower:
        return 3
    if text.upper() == text and len(text) <= 90:
        if len(text.split()) <= 10:
            return 2
    return None


def convert_docx_to_markdown(input_path: Path, output_path: Path) -> None:
    with zipfile.ZipFile(input_path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))

    body = root.find("w:body", NS)
    if body is None:
        raise ValueError("El documento no contiene cuerpo legible.")

    lines: list[str] = []
    for index, paragraph in enumerate(body.findall("w:p", NS)):
        text = text_of_paragraph(paragraph)
        if not text:
            if lines and lines[-1] != "":
                lines.append("")
            continue

        style = paragraph_style(paragraph)
        level = heading_level(style, text, index)
        if level is not None:
            if lines and lines[-1] != "":
                lines.append("")
            lines.append(f"{'#' * level} {text}")
            lines.append("")
            continue

        if is_list_paragraph(paragraph):
            lines.append(f"- {text}")
            continue

        lines.append(text)
        lines.append("")

    while lines and lines[-1] == "":
        lines.pop()

    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Convierte un archivo DOCX a Markdown.")
    parser.add_argument("input", type=Path, help="Ruta del archivo .docx")
    parser.add_argument("output", type=Path, nargs="?", help="Ruta del archivo .md de salida")
    args = parser.parse_args()

    input_path = args.input.resolve()
    output_path = args.output.resolve() if args.output else Path.cwd() / f"{input_path.stem}.md"
    convert_docx_to_markdown(input_path, output_path)
    print(output_path)


if __name__ == "__main__":
    main()
