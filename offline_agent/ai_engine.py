from random import random
from typing import List
from uuid import uuid4

from .models import EnrichedDocument, RawDocument
from .preprocessor import fingerprint


POSITIVE_KEYS = ("recovery", "rise", "growth", "expand")
NEGATIVE_KEYS = ("disruption", "risk", "conflict", "drop", "concerns")


def translate_to_pivot(text: str, language: str, pivot: str = "en") -> str:
    if language == pivot:
        return text
    return f"[translated-{language}-to-{pivot}] {text}"


def summarize(text: str, max_len: int = 150) -> str:
    if len(text) <= max_len:
        return text
    return text[: max_len - 3] + "..."


def detect_sentiment(text: str) -> tuple[str, float]:
    low = text.lower()
    pos_hits = sum(1 for key in POSITIVE_KEYS if key in low)
    neg_hits = sum(1 for key in NEGATIVE_KEYS if key in low)
    if neg_hits > pos_hits:
        return "negative", min(1.0, 0.5 + 0.1 * neg_hits + random() * 0.2)
    if pos_hits > neg_hits:
        return "positive", min(1.0, 0.5 + 0.1 * pos_hits + random() * 0.2)
    return "neutral", 0.5 + random() * 0.2


def extract_topics(title: str, content: str) -> List[str]:
    text = f"{title} {content}".lower()
    candidates = {
        "ai": ("ai", "model", "chip"),
        "energy": ("oil", "energy", "route"),
        "finance": ("rate", "bank", "policy"),
        "consumer": ("consumer", "spending", "ecommerce"),
    }
    output = [topic for topic, keys in candidates.items() if any(k in text for k in keys)]
    return output or ["general"]


def risk_level(sentiment_label: str, sentiment_score: float) -> str:
    if sentiment_label == "negative" and sentiment_score >= 0.8:
        return "high"
    if sentiment_label == "negative":
        return "medium"
    return "low"


def enrich_documents(raw_docs: List[RawDocument]) -> List[EnrichedDocument]:
    enriched: List[EnrichedDocument] = []
    for doc in raw_docs:
        translated = translate_to_pivot(doc.content, doc.language)
        summary = summarize(translated)
        label, score = detect_sentiment(translated)
        topics = extract_topics(doc.title, translated)
        enriched.append(
            EnrichedDocument(
                doc_id=uuid4().hex,
                source_id=doc.source_id,
                source_type=doc.source_type,
                title=doc.title,
                content=doc.content,
                language_original=doc.language,
                language_pivot="en",
                translated_content=translated,
                summary=summary,
                sentiment_label=label,
                sentiment_score=round(score, 3),
                topics=topics,
                risk_level=risk_level(label, score),
                region=doc.region,
                industry=doc.industry,
                published_at=doc.published_at,
                fingerprint=fingerprint(doc.title + doc.content),
            )
        )
    return enriched

