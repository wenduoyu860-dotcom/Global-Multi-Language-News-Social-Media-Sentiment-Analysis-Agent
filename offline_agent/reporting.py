from collections import Counter
from datetime import datetime
from statistics import mean
from typing import Dict, List
from uuid import uuid4

from .models import Cluster, EnrichedDocument


def build_daily_report(docs: List[EnrichedDocument], clusters: List[Cluster]) -> Dict:
    sentiment_counter = Counter(x.sentiment_label for x in docs)
    avg_accuracy = 0.93
    coverage = 0.96

    top_trends = []
    for i, c in enumerate(clusters[:6], start=1):
        top_trends.append(
            {
                "rank": i,
                "cluster_id": c.cluster_id,
                "title": f"{c.topic.upper()} trend in {c.region}",
                "why_it_matters": f"Signal volume grows with momentum score {c.momentum_score}.",
                "sentiment": c.sentiment,
                "momentum_score": c.momentum_score,
                "risk_level": c.risk_level,
                "regions": [c.region],
                "evidence_doc_ids": c.doc_ids[:10],
            }
        )

    risk_alerts = [
        {
            "alert_id": f"alert-{c.cluster_id}",
            "severity": "critical" if c.risk_level == "high" else "medium",
            "title": f"Risk signal on {c.topic}",
            "description": f"Cluster {c.cluster_id} shows elevated negative intensity.",
            "related_cluster_ids": [c.cluster_id],
            "recommended_actions": [
                "Review source evidence in detail.",
                "Trigger domain analyst validation.",
            ],
        }
        for c in clusters
        if c.risk_level in {"high", "medium"}
    ][:5]

    by_region = {}
    for doc in docs:
        by_region.setdefault(doc.region, []).append(doc)

    regional_insights = []
    for region, items in by_region.items():
        regional_insights.append(
            {
                "region": region,
                "key_signals": [
                    f"{len(items)} docs collected",
                    f"dominant sentiment: {Counter(x.sentiment_label for x in items).most_common(1)[0][0]}",
                ],
                "sentiment_shift": round(mean(x.sentiment_score for x in items) - 0.5, 3),
            }
        )

    return {
        "report_id": uuid4().hex,
        "report_date": datetime.utcnow().date().isoformat(),
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "scope": {
            "regions": sorted({x.region for x in docs}),
            "industries": sorted({x.industry for x in docs}),
            "languages": sorted({x.language_original for x in docs}),
        },
        "kpis": {
            "documents_processed": len(docs),
            "token_consumed": len(docs) * 5,
            "summary_accuracy": avg_accuracy,
            "trend_coverage": coverage,
            "report_generation_minutes": 8.5,
            "cache_hit_rate": 0.41,
            "cost_per_1k_docs": 2.3,
        },
        "executive_summary": (
            f"Processed {len(docs)} multilingual signals. "
            f"Top sentiment distribution: {dict(sentiment_counter)}. "
            f"Generated {len(clusters)} trend clusters and {len(risk_alerts)} risk alerts."
        ),
        "top_trends": top_trends,
        "risk_alerts": risk_alerts,
        "regional_insights": regional_insights,
        "industry_insights": [
            {"industry": "科技", "highlights": ["AI governance and chip supply remain dominant."]},
            {"industry": "金融", "highlights": ["Rate expectation narratives are accelerating."]},
        ],
        "methodology": {
            "data_sources": ["news", "social", "blog"],
            "model_stack": ["offline-rule-engine", "mock-translation", "mock-clustering"],
            "notes": "Offline deterministic simulation for local development and demo.",
        },
    }


def render_report_markdown(report: Dict) -> str:
    lines = [
        "# 每日全球舆情与趋势报告",
        "",
        f"- 报告编号: {report['report_id']}",
        f"- 报告日期: {report['report_date']}",
        f"- 处理量: {report['kpis']['documents_processed']}",
        "",
        "## 执行摘要",
        report["executive_summary"],
        "",
        "## Top 趋势",
    ]
    for item in report["top_trends"]:
        lines.extend(
            [
                f"### {item['rank']}. {item['title']}",
                f"- 动量分: {item['momentum_score']}",
                f"- 情绪: {item['sentiment']}",
                f"- 风险: {item['risk_level']}",
            ]
        )
    return "\n".join(lines)

