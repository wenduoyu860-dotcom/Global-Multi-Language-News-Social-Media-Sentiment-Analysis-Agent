# Kafka Topic Design

## Design Principles

- Use append-only immutable events.
- Keep each stage independently replayable.
- Include source and language metadata on every message.
- Use document fingerprint for dedup consistency across services.

## Topics

### `raw.content.v1`
- Producer: `source-connectors`
- Consumers: `ingest-router`, `raw-archive-writer`
- Purpose: raw payload from each source before normalization
- Partition key: `source_id`
- Retention: 3 days

### `normalized.content.v1`
- Producer: `ingest-router`
- Consumers: `text-preprocessor`
- Purpose: normalized canonical document records
- Partition key: `doc_id`
- Retention: 7 days

### `preprocessed.content.v1`
- Producer: `text-preprocessor`
- Consumers: `ai-pipeline`, `dedup-audit`
- Purpose: cleaned, deduped, enriched text payload
- Partition key: `doc_id`
- Retention: 7 days

### `ai.tasks.v1`
- Producer: `text-preprocessor`, `topic-clustering`
- Consumers: `ai-pipeline`
- Purpose: async AI job requests (translate/summarize/sentiment/risk)
- Partition key: `task_id`
- Retention: 3 days

### `ai.results.v1`
- Producer: `ai-pipeline`
- Consumers: `topic-clustering`, `rag-orchestrator`, `report-generator`
- Purpose: completed AI outputs
- Partition key: `doc_id`
- Retention: 14 days

### `clusters.events.v1`
- Producer: `topic-clustering`
- Consumers: `report-generator`, `alert-engine`
- Purpose: event clusters and trend scores
- Partition key: `cluster_id`
- Retention: 14 days

### `alerts.risk.v1`
- Producer: `alert-engine`
- Consumers: `api-gateway`, notification workers
- Purpose: high-risk anomaly notifications
- Partition key: `alert_id`
- Retention: 30 days

### `reports.daily.request.v1`
- Producer: `scheduler-worker`
- Consumers: `report-generator`
- Purpose: trigger daily report generation by region/industry
- Partition key: `report_date`
- Retention: 7 days

### `reports.daily.ready.v1`
- Producer: `report-generator`
- Consumers: `api-gateway`, export workers
- Purpose: report completion events
- Partition key: `report_id`
- Retention: 30 days

## Consumer Groups

- `cg-preprocessor-v1` for preprocessing workers
- `cg-ai-pipeline-v1` for AI task executors
- `cg-cluster-v1` for trend clustering
- `cg-report-v1` for report generation
- `cg-alert-v1` for risk alerts

## Event Envelope (Recommended)

```json
{
  "event_id": "uuid",
  "event_type": "preprocessed.content.created",
  "event_version": "v1",
  "occurred_at": "2026-05-08T00:00:00Z",
  "producer": "text-preprocessor",
  "trace_id": "trace-123",
  "tenant_id": "global-default",
  "payload": {}
}
```

## Operational Settings

- Producer `acks=all`, idempotence enabled.
- Dead-letter topic per critical stage:
  - `dlq.preprocessed.content.v1`
  - `dlq.ai.tasks.v1`
  - `dlq.reports.daily.request.v1`
- Retry strategy: exponential backoff with max-attempt counter in headers.
