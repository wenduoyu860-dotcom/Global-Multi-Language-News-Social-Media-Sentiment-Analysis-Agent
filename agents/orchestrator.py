from typing import Dict, Iterable, List

from .base import AgentContext
from .executor import run_pipeline_with_plan, write_execution_log
from .registry import AgentRegistry
from .roles import AnalyzeAgent, ClusterAgent, CrawlerAgent, PreprocessAgent, ReporterAgent


def _build_registry() -> AgentRegistry:
    r = AgentRegistry()
    for agent in (CrawlerAgent, PreprocessAgent, AnalyzeAgent, ClusterAgent, ReporterAgent):
        r.register(agent)
    return r


def run_workflow(size: int = 5000, pipeline: Iterable[str] | None = None) -> Dict:
    registry = _build_registry()
    steps = list(pipeline or ["crawler", "preprocess", "analyze", "cluster", "reporter"])
    ctx = AgentContext(payload={"size": size})
    for step in steps:
        ctx = registry.get(step).run(ctx)
    return {
        "steps": steps,
        "report": ctx.shared.get("report", {}),
        "stats": {
            "raw_docs": len(ctx.shared.get("raw_docs", [])),
            "docs": len(ctx.shared.get("docs", [])),
            "enriched": len(ctx.shared.get("enriched", [])),
            "clusters": len(ctx.shared.get("clusters", [])),
        },
    }


def run_workflow_advanced(size: int = 5000) -> Dict:
    registry = _build_registry()
    ctx = AgentContext(payload={"size": size})
    stage_plan: List[List[str]] = [
        ["crawler"],
        ["preprocess"],
        ["analyze"],
        ["cluster"],
        ["reporter"],
    ]
    results = run_pipeline_with_plan(registry, ctx, stage_plan=stage_plan, max_workers=3, max_retries=2)
    write_execution_log(results)
    return {
        "report": ctx.shared.get("report", {}),
        "results": [r.__dict__ for r in results],
        "stats": {
            "raw_docs": len(ctx.shared.get("raw_docs", [])),
            "docs": len(ctx.shared.get("docs", [])),
            "enriched": len(ctx.shared.get("enriched", [])),
            "clusters": len(ctx.shared.get("clusters", [])),
        },
    }

