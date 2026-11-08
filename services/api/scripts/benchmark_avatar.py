"""
Benchmarks the real avatar pipeline (MediaPipe on CPU) on three local photos.

Usage (from services/api):
    python scripts/benchmark_avatar.py FRONT.jpg BACK.jpg FACE.jpg [--runs 5] [--show-report]

Prints model load time and per-stage timings. Photos are read from disk only to
simulate uploads; nothing is written. Do not commit personal photos.
"""

from __future__ import annotations

import argparse
import statistics
import sys
import time
from pathlib import Path

API_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_ROOT))

from app.ai.avatar.landmarkers import get_detectors
from app.ai.avatar.pipeline import run_avatar_preprocessing
from app.config import get_settings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("front", type=Path)
    parser.add_argument("back", type=Path)
    parser.add_argument("face", type=Path)
    parser.add_argument("--runs", type=int, default=5)
    parser.add_argument("--show-report", action="store_true", help="print validation issues and key ratios")
    args = parser.parse_args()

    images = {"front": args.front.read_bytes(), "back": args.back.read_bytes(), "face": args.face.read_bytes()}
    upload_kb = sum(len(data) for data in images.values()) / 1024

    start = time.perf_counter()
    pose, face = get_detectors(get_settings().avatar_models_dir)
    print(f"model load (cold): {(time.perf_counter() - start) * 1000:.0f} ms · upload size {upload_kb:.0f} KB")

    totals: list[float] = []
    result = None
    for run in range(1, args.runs + 1):
        result = run_avatar_preprocessing(images, pose, face)
        t = result.timings
        totals.append(t.total_ms)
        print(
            f"run {run}: total {t.total_ms:7.1f} ms | decode {t.decode_ms:6.1f} quality {t.quality_ms:6.1f} "
            f"pose {t.pose_ms:6.1f} face {t.face_ms:6.1f} features {t.features_ms:6.1f} | passed={result.report.passed}"
        )

    print(f"median {statistics.median(totals):.1f} ms · max {max(totals):.1f} ms over {len(totals)} runs")

    if args.show_report and result is not None:
        for issue in result.report.issues:
            print(f"  [{issue.severity}] {issue.view}: {issue.code} — {issue.message}")
        if result.profile:
            print("  body ratios:", result.profile.body.landmark_ratios.model_dump())
            print("  torso:", result.profile.body.torso.model_dump())
            print("  face ratios:", result.profile.face.ratios.model_dump())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
