import json
from pathlib import Path

from agents.orchestrator import run_workflow_advanced


if __name__ == "__main__":
    result = run_workflow_advanced(size=8000)
    out = Path("output")
    out.mkdir(exist_ok=True)
    (out / "multi_agent_report.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result["stats"], ensure_ascii=False, indent=2))

