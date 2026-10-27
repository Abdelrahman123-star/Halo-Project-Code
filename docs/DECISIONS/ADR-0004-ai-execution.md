# ADR-0004: AI execution location and async processing

- **Status:** Proposed
- **Context:** CV models need Python and several hundred MB of RAM; mobile devices vary.
  Free tiers rarely fit ML workloads.
- **Decision:** Run inference in FastAPI (CPU, pretrained models). Async via persisted
  `status` column + FastAPI `BackgroundTasks`; client polls. No Celery/Redis.
  Development/demo backend runs locally (or small free host if models fit).
- **Alternatives:** on-device inference (model packaging complexity, per-platform);
  external AI APIs (privacy/consent/cost); job queue (extra infra, YAGNI).
- **Consequences:** Jobs lost if the process restarts mid-run → on startup, items stuck
  in `processing` older than N minutes are marked `failed` with a retry action.
  Revisit if concurrency or runtime requires a queue.
