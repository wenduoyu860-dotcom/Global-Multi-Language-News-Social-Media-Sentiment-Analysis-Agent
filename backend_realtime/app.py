import asyncio
import json
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .services.pipeline_runner import run_once


app = FastAPI(title="Global Intel Realtime API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT = Path("output")
REPORT_FILE = OUTPUT / "latest_report.json"
UI_FILE = OUTPUT / "ui_payload.json"


def _read_json(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


@app.get("/health")
async def health() -> Dict[str, Any]:
    return {"ok": True}


@app.get("/report")
async def report() -> Dict[str, Any]:
    data = _read_json(REPORT_FILE)
    if data:
        return data
    run_once(size=5000)
    return _read_json(REPORT_FILE)


@app.get("/ui")
async def ui() -> Dict[str, Any]:
    data = _read_json(UI_FILE)
    if data:
        return data
    run_once(size=5000)
    return _read_json(UI_FILE)


@app.post("/pipeline/run")
async def run_pipeline(size: int = 5000) -> Dict[str, Any]:
    return run_once(size=size)


@app.websocket("/ws/ui")
async def ws_ui(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            if not UI_FILE.exists():
                run_once(size=5000)
            payload = _read_json(UI_FILE)
            await websocket.send_json(payload)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        return
