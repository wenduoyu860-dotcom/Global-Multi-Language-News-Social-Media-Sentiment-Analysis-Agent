from dataclasses import dataclass, field
from datetime import datetime
from typing import List


@dataclass
class RawDocument:
    source_id: str
    source_type: str
    title: str
    content: str
    language: str
    region: str
    industry: str
    published_at: datetime


@dataclass
class EnrichedDocument:
    doc_id: str
    source_id: str
    source_type: str
    title: str
    content: str
    language_original: str
    language_pivot: str
    translated_content: str
    summary: str
    sentiment_label: str
    sentiment_score: float
    topics: List[str]
    risk_level: str
    region: str
    industry: str
    published_at: datetime
    fingerprint: str


@dataclass
class Cluster:
    cluster_id: str
    topic: str
    region: str
    industry: str
    sentiment: str
    risk_level: str
    momentum_score: float
    doc_ids: List[str] = field(default_factory=list)

