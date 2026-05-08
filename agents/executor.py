from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List

from .base import AgentContext
from .registry import AgentRegistry


@dataclass
class StageResult:
    stage: str
    ok: bool
    attempts: int
    error: str = ""


def _run_step_with_retry(registry: AgentRegistry, step: str, ctx: AgentContext, max_retries: int) -> StageResult:
    attempts = 0
    while attempts <= max_retries:
        attempts += 1
        try:
            registry.get(step).run(ctx)
            return StageResult(stage=step, ok=True, attempts=attempts)
        except Exception as exc:  # pragma: no cover - runtime safety
            if attempts > max_retries:
                return StageResult(stage=step, ok=False, attempts=attempts, error=str(exc))
    return StageResult(stage=step, ok=False, attempts=attempts, error="unknown")


def run_pipeline_with_plan(
    registry: AgentRegistry,
    ctx: AgentContext,
    stage_plan: Iterable[Iterable[str]],
    max_workers: int = 4,
    max_retries: int = 1,
) -> List[StageResult]:
    results: List[StageResult] = []
    for stage_group in stage_plan:
        steps = list(stage_group)
        if len(steps) == 1:
            results.append(_run_step_with_retry(registry, steps[0], ctx, max_retries))
            continue
        with ThreadPoolExecutor(max_workers=max_workers) as pool:
            future_map = {
                pool.submit(_run_step_with_retry, registry, step, ctx, max_retries): step
                for step in steps
            }
            for future in as_completed(future_map):
                results.append(future.result())
    return results


def write_execution_log(results: List[StageResult], path: str = "output/agent_execution.log") -> None:
    output = Path(path)
    output.parent.mkdir(parents=True, exist_ok=True)
    lines = [f"[{datetime.utcnow().isoformat()}Z] agent execution summary"]
    for r in results:
        status = "OK" if r.ok else "FAIL"
        lines.append(f"{r.stage} status={status} attempts={r.attempts} error={r.error}")
    output.write_text("\n".join(lines), encoding="utf-8")

