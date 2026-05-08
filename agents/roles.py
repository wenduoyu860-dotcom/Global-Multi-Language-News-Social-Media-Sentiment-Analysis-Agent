from .base import AgentContext, BaseAgent
from offline_agent.ai_engine import enrich_documents
from offline_agent.clustering import cluster_documents
from offline_agent.connectors import generate_mock_documents
from offline_agent.preprocessor import deduplicate
from offline_agent.reporting import build_daily_report


class CrawlerAgent(BaseAgent):
    name = "crawler"

    def run(self, ctx: AgentContext) -> AgentContext:
        size = int(ctx.payload.get("size", 5000))
        ctx.shared["raw_docs"] = generate_mock_documents(size=size)
        return ctx


class PreprocessAgent(BaseAgent):
    name = "preprocess"

    def run(self, ctx: AgentContext) -> AgentContext:
        raw_docs = ctx.shared.get("raw_docs", [])
        ctx.shared["docs"] = deduplicate(raw_docs)
        return ctx


class AnalyzeAgent(BaseAgent):
    name = "analyze"

    def run(self, ctx: AgentContext) -> AgentContext:
        docs = ctx.shared.get("docs", [])
        ctx.shared["enriched"] = enrich_documents(docs)
        return ctx


class ClusterAgent(BaseAgent):
    name = "cluster"

    def run(self, ctx: AgentContext) -> AgentContext:
        enriched = ctx.shared.get("enriched", [])
        ctx.shared["clusters"] = cluster_documents(enriched)
        return ctx


class ReporterAgent(BaseAgent):
    name = "reporter"

    def run(self, ctx: AgentContext) -> AgentContext:
        enriched = ctx.shared.get("enriched", [])
        clusters = ctx.shared.get("clusters", [])
        ctx.shared["report"] = build_daily_report(enriched, clusters)
        return ctx

