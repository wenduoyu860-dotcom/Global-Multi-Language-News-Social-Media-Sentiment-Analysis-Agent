from typing import Any, Dict

from offline_agent.pipeline import run_pipeline


def run_once(size: int = 5000) -> Dict[str, Any]:
    return run_pipeline(size=size)

