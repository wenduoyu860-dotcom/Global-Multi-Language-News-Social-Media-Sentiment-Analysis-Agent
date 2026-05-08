# Global-Multi-Language-News-Social-Media-Sentiment-Analysis-Agent
An AI Agent that crawls global news, social media, and blogs daily, processing >1M entries. Uses GPT, RAG, multi-language translation, sentiment analysis, and topic clustering to generate trend summaries, risk alerts, and reports. Optimized caching reduces token usage by ~30%, producing accurate, scalable insights.

# Global Multilingual News & Social Intelligence Agent

Production-oriented blueprint for an AI Agent system that ingests global news and social signals, processes multilingual content, and generates daily trend reports.

## Service Layout

```text
global-intel-agent/
├─ services/
│  ├─ api-gateway/                 # Unified API entry, auth, rate limiting
│  ├─ source-connectors/           # News/social connectors and crawlers
│  ├─ ingest-router/               # Source normalization + Kafka producer
│  ├─ text-preprocessor/           # Lang detect, dedup, cleaning, entity extraction
│  ├─ ai-pipeline/                 # Translation, summarization, sentiment, risk tagging
│  ├─ topic-clustering/            # Event grouping and trend detection
│  ├─ rag-orchestrator/            # Retrieval + prompt assembly + model routing
│  ├─ report-generator/            # Daily report composition (JSON/Excel/PDF)
│  ├─ alert-engine/                # Threshold alerts and anomaly notifications
│  ├─ token-cost-guard/            # Cost policies, semantic cache, fallback routing
│  └─ scheduler-worker/            # Batch cron, replay, reprocessing tasks
├─ libs/
│  ├─ common-models/               # Shared DTOs and event contracts
│  ├─ common-observability/        # Logging, metrics, tracing wrappers
│  └─ common-llm/                  # Prompt templates, model adapters, cache helpers
├─ infra/
│  ├─ docker/                      # Local compose stack
│  ├─ terraform/                   # Cloud infra modules
│  ├─ k8s/                         # Deployments, HPA, cronjobs, secrets refs
│  └─ elasticsearch/               # Index templates and lifecycle policies
├─ docs/
│  ├─ architecture.md              # End-to-end architecture and service boundaries
│  ├─ kafka-topics.md              # Topic design and consumer groups
│  └─ elasticsearch-mapping.md     # Search and analytics index schema
├─ schemas/
│  └─ daily-report.schema.json     # Report output schema
└─ templates/
   └─ daily-report.template.md     # Human-readable report template
```

## First Milestones

1. Build `source-connectors`, `ingest-router`, and `text-preprocessor` for reliable ingest.
2. Enable `ai-pipeline` with multilingual summary and sentiment baseline.
3. Deploy `report-generator` with JSON output validated by `schemas/daily-report.schema.json`.
4. Add Excel/PDF rendering and dashboard sync in phase two.

## Offline Code Version (No External Dependencies)

This repository now includes a fully offline runnable implementation:

- `main.py`: runs the full pipeline and writes artifacts to `output/`
- `offline_agent/`: end-to-end processing code (mock ingest -> preprocess -> AI enrich -> clustering -> report)
- `api_server.py`: local API (`/health`, `/report`, `/ui`) using Python standard library
- `ui-demo/`: interactive dashboard page with dynamic refresh and filters

Run locally:

```bash
python main.py
python api_server.py
```

Then open `ui-demo/index.html` in browser (or serve it locally) to view the dashboard.

## Added Full Upgrade Code

### 1) FastAPI + WebSocket realtime API

- `backend_realtime/app.py`
- `backend_realtime/services/pipeline_runner.py`
- `run_realtime.py`

Endpoints:

- `GET /health`
- `GET /report`
- `GET /ui`
- `POST /pipeline/run?size=5000`
- `WS /ws/ui`

### 2) React + ECharts dashboard

- `ui/package.json`
- `ui/vite.config.js`
- `ui/index.html`
- `ui/src/App.jsx`
- `ui/src/components/TrendChart.jsx`
- `ui/src/styles.css`

### 3) Pluggable multi-agent architecture

- `agents/base.py`
- `agents/registry.py`
- `agents/roles.py`
- `agents/orchestrator.py`
- `agents/executor.py` (retry, stage execution, logs)
- `run_multi_agent.py`

### 4) Offline report export (xlsx/pdf)

- `offline_agent/exporters.py`
- pipeline now writes:
  - `output/latest_report.xlsx`
  - `output/latest_report.pdf`
  - `output/agent_execution.log`

### Quick run commands

```bash
python main.py
python run_realtime.py
python run_multi_agent.py
```

<img width="1669" height="956" alt="屏幕截图 2026-05-08 150146" src="https://github.com/user-attachments/assets/97336391-fef0-468b-b3ea-59e84d88a02e" />
<img width="1653" height="953" alt="屏幕截图 2026-05-08 150212" src="https://github.com/user-attachments/assets/c7a304c7-3af6-4f27-a343-98828228ba2e" />
