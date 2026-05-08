# Elasticsearch Index Mapping

## Indices

- `intel-documents-v1`: normalized and enriched document-level records
- `intel-clusters-v1`: topic/event cluster records
- `intel-reports-v1`: generated report metadata and sections

## 1) `intel-documents-v1`

### Settings (recommended)

```json
{
  "settings": {
    "number_of_shards": 6,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "default_text": {
          "type": "standard"
        }
      }
    }
  }
}
```

### Mapping

```json
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "doc_id": { "type": "keyword" },
      "source_id": { "type": "keyword" },
      "source_type": { "type": "keyword" },
      "source_url": { "type": "keyword", "index": false },
      "published_at": { "type": "date" },
      "ingested_at": { "type": "date" },
      "language_original": { "type": "keyword" },
      "language_pivot": { "type": "keyword" },
      "title": {
        "type": "text",
        "fields": {
          "raw": { "type": "keyword", "ignore_above": 512 }
        }
      },
      "content": { "type": "text", "analyzer": "default_text" },
      "translated_content": { "type": "text", "analyzer": "default_text" },
      "summary_short": { "type": "text" },
      "summary_long": { "type": "text" },
      "sentiment_label": { "type": "keyword" },
      "sentiment_score": { "type": "float" },
      "risk_level": { "type": "keyword" },
      "risk_tags": { "type": "keyword" },
      "topics": { "type": "keyword" },
      "entities": {
        "type": "nested",
        "properties": {
          "type": { "type": "keyword" },
          "name": { "type": "keyword" },
          "confidence": { "type": "float" }
        }
      },
      "geo_country": { "type": "keyword" },
      "geo_region": { "type": "keyword" },
      "fingerprint": { "type": "keyword" },
      "cluster_id": { "type": "keyword" },
      "engagement_score": { "type": "float" },
      "quality_score": { "type": "float" },
      "token_cost": { "type": "integer" },
      "trace_id": { "type": "keyword" }
    }
  }
}
```

## 2) `intel-clusters-v1`

```json
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "cluster_id": { "type": "keyword" },
      "window_start": { "type": "date" },
      "window_end": { "type": "date" },
      "topic": { "type": "keyword" },
      "keywords": { "type": "keyword" },
      "doc_count": { "type": "integer" },
      "source_diversity": { "type": "float" },
      "sentiment_distribution": {
        "properties": {
          "positive": { "type": "float" },
          "neutral": { "type": "float" },
          "negative": { "type": "float" }
        }
      },
      "trend_score": { "type": "float" },
      "risk_score": { "type": "float" },
      "representative_doc_ids": { "type": "keyword" },
      "updated_at": { "type": "date" }
    }
  }
}
```

## 3) `intel-reports-v1`

```json
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "report_id": { "type": "keyword" },
      "report_date": { "type": "date" },
      "region_scope": { "type": "keyword" },
      "industry_scope": { "type": "keyword" },
      "status": { "type": "keyword" },
      "generated_at": { "type": "date" },
      "duration_seconds": { "type": "integer" },
      "top_cluster_ids": { "type": "keyword" },
      "risk_alert_count": { "type": "integer" },
      "quality_metrics": {
        "properties": {
          "summary_accuracy": { "type": "float" },
          "coverage_rate": { "type": "float" }
        }
      },
      "artifact_paths": { "type": "keyword" }
    }
  }
}
```

## Query Patterns

- Time range + region + risk filter for dashboards.
- Terms aggregation on `topics` and `geo_country`.
- Trend query based on `cluster_id` over rolling windows.
