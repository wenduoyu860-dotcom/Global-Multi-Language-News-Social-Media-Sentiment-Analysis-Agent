from collections import defaultdict
from random import random
from typing import Dict, List
from uuid import uuid4

from .models import Cluster, EnrichedDocument


def cluster_documents(docs: List[EnrichedDocument]) -> List[Cluster]:
    buckets: Dict[tuple[str, str, str], List[EnrichedDocument]] = defaultdict(list)
    for doc in docs:
        topic = doc.topics[0] if doc.topics else "general"
        buckets[(topic, doc.region, doc.industry)].append(doc)

    clusters: List[Cluster] = []
    for (topic, region, industry), items in buckets.items():
        negatives = [x for x in items if x.sentiment_label == "negative"]
        sentiment = "negative" if len(negatives) > len(items) / 2 else "mixed"
        risk = "high" if any(x.risk_level == "high" for x in items) else "medium" if negatives else "low"
        momentum = min(99.0, len(items) * 0.8 + random() * 20)
        clusters.append(
            Cluster(
                cluster_id=uuid4().hex[:12],
                topic=topic,
                region=region,
                industry=industry,
                sentiment=sentiment,
                risk_level=risk,
                momentum_score=round(momentum, 2),
                doc_ids=[x.doc_id for x in items],
            )
        )
    clusters.sort(key=lambda x: x.momentum_score, reverse=True)
    return clusters

