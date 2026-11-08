# ADR-0006: Avatar preprocessing runs synchronously; photos are not retained

- **Status:** Accepted (2026-11-08, product owner decision + benchmark)
- **Context:** ADR-0004 proposed background jobs (`BackgroundTasks` + status polling) for AI
  work. Avatar preprocessing (OpenCV + MediaPipe Pose/Face Landmarker on a 512 px image)
  turned out to be light. Benchmark on the dev PC (Windows, CPU, Python 3.14, MediaPipe 1.2.2),
  `scripts/benchmark_avatar.py` with Google's public MediaPipe test images, 5 runs:
  median **198 ms**, max 251 ms per request; cold model load 0.35–0.7 s (once per process).
- **Decision:**
  1. `POST /v1/avatar/preprocess` processes the three photos **synchronously** and returns the
     saved profile in the same response (client timeout 60 s).
  2. Photos are processed **in memory and discarded**; only the derived profile
     (`avatars.generated_params`) and the validation report (`body_scans`) are stored. Starlette's
     upload spool threshold is raised so uploads are not written to a temp file.
- **Alternatives:** background job + polling (more states, more code, no benefit at ~0.2 s);
  storing photos in a private bucket for re-processing (rejected by the product owner: no retention).
- **Consequences:** Simple client flow (one request). Re-running a newer pipeline version needs new
  photos. Revisit (switch to ADR-0004's job model) if the median exceeds ~5 s on the deployment host,
  if requests time out on mobile networks, or if a heavier model (e.g. 3D fitting) is added.
- **Not yet measured:** benchmark with real phone photos of a standing person, and on the eventual
  deployment host.
