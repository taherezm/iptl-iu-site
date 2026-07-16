#!/usr/bin/env python3
"""Serve the static site locally with GitHub Pages-style clean URLs."""

from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CleanURLRequestHandler(SimpleHTTPRequestHandler):
    """Resolve paths such as /apply to their matching .html files."""

    def translate_path(self, path: str) -> str:
        translated = Path(super().translate_path(path))
        if translated.exists() or translated.suffix:
            return str(translated)

        html_candidate = translated.with_suffix(".html")
        if html_candidate.is_file():
            return str(html_candidate)

        return str(translated)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    handler = partial(CleanURLRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    print(f"Serving {ROOT} at http://localhost:{args.port}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
