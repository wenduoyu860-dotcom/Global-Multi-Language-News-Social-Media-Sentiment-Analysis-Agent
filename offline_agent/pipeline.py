from dataclasses import asdict
from time import perf_counter
from typing import Dict

from .ai_engine import enrich_documents
from .clustering import cluster_documents
from .connectors import generate_mock_documents
from .exporters import export_pdf, export_xlsx
from .preprocessor import deduplicate
from .reporting import build_daily_report, render_report_markdown
from .storage import ensure_output_dir, save_clusters_csv, save_docs_csv, save_json, save_markdown


def run_pipeline(size: int = 5000) -> Dict:
    start = perf_counter()
    raw_docs = generate_mock_documents(size=size)
    docs = deduplicate(raw_docs)
    enriched = enrich_documents(docs)
    clusters = cluster_documents(enriched)
    report = build_daily_report(enriched, clusters)

    output = ensure_output_dir()
    save_json(output / "latest_report.json", report)
    save_markdown(output / "latest_report.md", render_report_markdown(report))
    export_xlsx(report, output / "latest_report.xlsx")
    export_pdf(
        [
            "Daily Global Intelligence Report",
            f"report_id: {report['report_id']}",
            f"date: {report['report_date']}",
            f"documents_processed: {report['kpis']['documents_processed']}",
            f"token_consumed: {report['kpis']['token_consumed']}",
            f"summary: {report['executive_summary'][:120]}",
        ],
        output / "latest_report.pdf",
    )
    save_docs_csv(output / "documents.csv", enriched)
    save_clusters_csv(output / "clusters.csv", clusters)
    save_json(
        output / "ui_payload.json",
        {
            "kpis": report["kpis"],
            "top_trends": report["top_trends"],
            "risk_alerts": report["risk_alerts"],
            "regional_insights": report["regional_insights"],
            "generated_at": report["generated_at"],
        },
    )

    elapsed = perf_counter() - start
    return {
        "elapsed_seconds": round(elapsed, 3),
        "documents_in": len(raw_docs),
        "documents_out": len(enriched),
        "clusters": len(clusters),
        "report_id": report["report_id"],
    }


def debug_snapshot(size: int = 200) -> Dict:
    raw_docs = generate_mock_documents(size=size)
    docs = deduplicate(raw_docs)
    enriched = enrich_documents(docs)
    return {
        "first_raw": asdict(raw_docs[0]),
        "first_enriched": asdict(enriched[0]),
        "count": len(enriched),
    }

