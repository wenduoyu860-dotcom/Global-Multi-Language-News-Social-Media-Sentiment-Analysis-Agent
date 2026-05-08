# Architecture Blueprint

## 1) Data Flow

1. `source-connectors` pulls from 50+ news and social sources.
2. `ingest-router` standardizes source payloads and publishes events to Kafka.
3. `text-preprocessor` performs deduplication, language detection, and enrichment.
4. `ai-pipeline` runs translation, summary, sentiment, and risk extraction.
5. `topic-clustering` groups similar items into events and trend clusters.
6. `rag-orchestrator` fetches evidence from Elasticsearch/vector index for deeper synthesis.
7. `report-generator` composes daily outputs in JSON, Excel, and PDF.
8. `alert-engine` emits high-risk and anomaly notifications in near real-time.

## 2) Service Boundaries

- `api-gateway`
  - Query trend data, reports, and risk alerts.
  - Trigger backfill/report jobs.
- `source-connectors`
  - Connector plugin model: RSS, site crawl, X/Twitter, Reddit, Weibo, WeChat.
  - Source-level throttling, retries, and quality scoring.
- `text-preprocessor`
  - SimHash/MinHash dedup.
  - NER for country/org/person and topic hints.
  - Doc quality filters (spam, too-short, low-signal).
- `ai-pipeline`
  - Task routing by value tier (low/medium/high).
  - Lightweight model for first-pass summary, premium model for high-impact clusters.
  - Multilingual translation normalization to pivot language (`en`) while preserving originals.
- `topic-clustering`
  - Sliding-window clustering and trend deltas.
  - Hotspot score computed from volume + sentiment velocity + source diversity.
- `token-cost-guard`
  - Semantic cache hit detection.
  - Incremental updates only for changed clusters.
  - Token budget policy per industry/region/report.

## 3) Storage Model

- Raw payload archive: object storage (`s3://...` or equivalent).
- Search index: Elasticsearch (full text + filters + aggregations).
- Cache: Redis (summary cache, translation cache, prompt cache, lock/queue metadata).
- Optional vector retrieval: ES dense vector or dedicated vector DB.

## 4) Reliability and SLO

- Ingestion throughput target: >= 1,000,000 docs/day.
- Report generation SLA: < 30 minutes after window close.
- Pipeline processing latency SLO (P95): < 10 minutes from ingest to insight-ready.
- Error budget:
  - Source fetch success >= 98%.
  - AI task retry success >= 99%.

## 5) Deployment Guidance

- Runtime: Kubernetes with autoscaling for `source-connectors`, `ai-pipeline`, and `topic-clustering`.
- Scheduling: Temporal or Airflow for daily windows, replay, and backfills.
- Observability:
  - Metrics: Prometheus
  - Dashboards: Grafana
  - Traces/logs: OpenTelemetry + centralized logging

## 6) Security and Governance

- PII masking before long-term storage.
- Source compliance controls and per-platform terms enforcement.
- Full report lineage: every conclusion references source document IDs.
