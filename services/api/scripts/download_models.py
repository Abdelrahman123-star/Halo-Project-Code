"""
Downloads the MediaPipe avatar models into services/api/models/ (git-ignored).

Usage (from services/api):  python scripts/download_models.py
Existing files are kept; pass --force to download again.
"""

from __future__ import annotations

import argparse
import sys
import urllib.request
from pathlib import Path

API_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_ROOT))

from app.ai.avatar.landmarkers import MODEL_URLS

MODELS_DIR = API_ROOT / "models"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="re-download existing files")
    args = parser.parse_args()

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    for filename, url in MODEL_URLS.items():
        target = MODELS_DIR / filename
        if target.is_file() and not args.force:
            print(f"keep      {filename} ({target.stat().st_size / 1_048_576:.1f} MB)")
            continue
        partial = target.with_suffix(".part")
        print(f"download  {filename} ...")
        urllib.request.urlretrieve(url, partial)
        partial.replace(target)
        print(f"saved     {filename} ({target.stat().st_size / 1_048_576:.1f} MB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
