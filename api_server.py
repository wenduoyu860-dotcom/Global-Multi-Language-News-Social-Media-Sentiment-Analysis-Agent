import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse


class Handler(BaseHTTPRequestHandler):
    def _json(self, payload, code=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        report_path = Path("output/latest_report.json")
        ui_path = Path("output/ui_payload.json")

        if path == "/health":
            return self._json({"ok": True})
        if path == "/report":
            if not report_path.exists():
                return self._json({"error": "report not found, run main.py first"}, 404)
            return self._json(json.loads(report_path.read_text(encoding="utf-8")))
        if path == "/ui":
            if not ui_path.exists():
                return self._json({"error": "ui payload not found, run main.py first"}, 404)
            return self._json(json.loads(ui_path.read_text(encoding="utf-8")))

        self._json({"error": "not found"}, 404)


def run(host: str = "127.0.0.1", port: int = 8088) -> None:
    server = HTTPServer((host, port), Handler)
    print(f"API serving at http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()

