#!/usr/bin/env python3
"""Validate static site metadata and local links."""

from __future__ import annotations

import json
import html
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
SITE_URL = "https://www.undergradtechlaw.org"
PUBLIC_EMAIL = "undergradtechlaw@outlook.com"

FORBIDDEN_TEXT = (
    "ip & " + "technology law at iu",
    "ip and " + "technology law at iu",
    "iptl" + "@indiana.edu",
    "this page will " + "fill with entries " + "as they are ready.",
)

REQUIRED_META_NAMES = (
    "description",
    "twitter:title",
    "twitter:description",
    "twitter:image",
)

REQUIRED_META_PROPERTIES = (
    "og:type",
    "og:title",
    "og:description",
    "og:url",
    "og:image",
    "og:image:alt",
)


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self.in_title = False
        self.meta_names: set[str] = set()
        self.meta_properties: set[str] = set()
        self.canonical = ""
        self.links: list[tuple[str, str]] = []
        self.json_ld: list[str] = []
        self.in_json_ld = False
        self._json_ld_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {name.lower(): value or "" for name, value in attrs}
        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            if attr.get("name"):
                self.meta_names.add(attr["name"])
            if attr.get("property"):
                self.meta_properties.add(attr["property"])
        elif tag == "link" and attr.get("rel") == "canonical":
            self.canonical = attr.get("href", "")

        for attr_name in ("href", "src", "action"):
            if attr.get(attr_name):
                self.links.append((attr_name, attr[attr_name]))

        if tag == "script" and attr.get("type") == "application/ld+json":
            self.in_json_ld = True
            self._json_ld_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
        elif tag == "script" and self.in_json_ld:
            self.in_json_ld = False
            self.json_ld.append("".join(self._json_ld_parts).strip())

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data
        if self.in_json_ld:
            self._json_ld_parts.append(data)


def is_external(value: str) -> bool:
    parsed = urlparse(value)
    return bool(parsed.scheme) and parsed.scheme not in {"", "file"}


def local_target(page: Path, value: str) -> Path | None:
    if not value or value.startswith("#") or is_external(value):
        return None
    parsed = urlparse(value)
    path_text = unquote(parsed.path)
    if not path_text:
        return None
    if path_text.startswith("/"):
        target = ROOT / path_text.lstrip("/")
    else:
        target = page.parent / path_text
    return target


def target_exists(path: Path) -> bool:
    if path.exists():
        return True
    return path.is_dir() and (path / "index.html").exists()


def validate_html(page: Path) -> list[str]:
    rel = page.relative_to(ROOT)
    html = page.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(html)
    errors: list[str] = []

    if not parser.title.strip():
        errors.append(f"{rel}: missing <title>.")
    if not parser.canonical:
        errors.append(f"{rel}: missing canonical link.")
    elif not parser.canonical.startswith(SITE_URL):
        errors.append(f"{rel}: canonical must start with {SITE_URL}.")

    for name in REQUIRED_META_NAMES:
        if name not in parser.meta_names:
            errors.append(f"{rel}: missing meta name={name}.")
    for prop in REQUIRED_META_PROPERTIES:
        if prop not in parser.meta_properties:
            errors.append(f"{rel}: missing meta property={prop}.")

    for attr_name, value in parser.links:
        target = local_target(page, value)
        if target is not None and not target_exists(target):
            errors.append(f"{rel}: {attr_name} target not found: {value}")

    for raw_json in parser.json_ld:
        try:
            json.loads(raw_json)
        except json.JSONDecodeError as exc:
            errors.append(f"{rel}: invalid JSON-LD: {exc}")

    return errors


def validate_feed() -> list[str]:
    path = ROOT / "feed.xml"
    text = path.read_text(encoding="utf-8")
    errors: list[str] = []
    if PUBLIC_EMAIL not in text:
        errors.append("feed.xml: missing public Outlook email.")
    try:
        ET.fromstring(text)
    except ET.ParseError as exc:
        errors.append(f"feed.xml: invalid XML: {exc}")
    return errors


def validate_forbidden_text() -> list[str]:
    errors: list[str] = []
    files = [*ROOT.rglob("*.html"), ROOT / "feed.xml", ROOT / "assets/site-mark.svg"]
    for path in files:
        if not path.exists():
            continue
        text = html.unescape(path.read_text(encoding="utf-8")).lower()
        for needle in FORBIDDEN_TEXT:
            if needle in text:
                errors.append(f"{path.relative_to(ROOT)}: forbidden text remains: {needle}")
    return errors


def main() -> int:
    errors: list[str] = []
    for page in sorted(ROOT.rglob("*.html")):
        if ".git" in page.parts:
            continue
        errors.extend(validate_html(page))
    errors.extend(validate_feed())
    errors.extend(validate_forbidden_text())

    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1
    print("Site validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
