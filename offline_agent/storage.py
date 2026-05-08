import csv
import json
from pathlib import Path
from typing import Dict, List

from .models import Cluster, EnrichedDocument


def ensure_output_dir(base: str = "output") -> Path:
    p = Path(base)
    p.mkdir(parents=True, exist_ok=True)
    return p


def save_json(path: Path, data: Dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def save_markdown(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def save_docs_csv(path: Path, docs: List[EnrichedDocument]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["doc_id", "title", "region", "industry", "sentiment", "risk", "topic"])
        for d in docs:
            writer.writerow(
                [d.doc_id, d.title, d.region, d.industry, d.sentiment_label, d.risk_level, "|".join(d.topics)]
            )


def save_clusters_csv(path: Path, clusters: List[Cluster]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["cluster_id", "topic", "region", "industry", "sentiment", "risk", "momentum"])
        for c in clusters:
            writer.writerow([c.cluster_id, c.topic, c.region, c.industry, c.sentiment, c.risk_level, c.momentum_score])

