import { useEffect, useMemo, useState } from "react";
import TrendChart from "./components/TrendChart.jsx";

const API = "http://127.0.0.1:8090";

function defaultPayload() {
  return {
    generated_at: new Date().toISOString(),
    kpis: {
      documents_processed: 0,
      token_consumed: 0,
      summary_accuracy: 0,
      trend_coverage: 0,
      report_generation_minutes: 0
    },
    top_trends: [],
    risk_alerts: [],
    regional_insights: []
  };
}

export default function App() {
  const [payload, setPayload] = useState(defaultPayload);
  const [status, setStatus] = useState("connecting");

  const kpiCards = useMemo(
    () => [
      ["Documents", payload.kpis.documents_processed?.toLocaleString?.() || "0"],
      ["Tokens", payload.kpis.token_consumed?.toLocaleString?.() || "0"],
      ["Accuracy", `${((payload.kpis.summary_accuracy || 0) * 100).toFixed(2)}%`],
      ["Coverage", `${((payload.kpis.trend_coverage || 0) * 100).toFixed(2)}%`]
    ],
    [payload]
  );

  useEffect(() => {
    let ws;

    const loadInit = async () => {
      try {
        const res = await fetch(`${API}/ui`);
        const data = await res.json();
        setPayload(data);
      } catch {
        setStatus("offline");
      }
    };

    loadInit();
    try {
      ws = new WebSocket("ws://127.0.0.1:8090/ws/ui");
      ws.onopen = () => setStatus("live");
      ws.onmessage = (ev) => {
        setPayload(JSON.parse(ev.data));
      };
      ws.onerror = () => setStatus("degraded");
      ws.onclose = () => setStatus("closed");
    } catch {
      setStatus("offline");
    }

    return () => ws && ws.close();
  }, []);

  return (
    <div className="page">
      <header className="header">
        <h1>Global Intel Command Center</h1>
        <span className={`status ${status}`}>{status}</span>
      </header>

      <section className="kpiGrid">
        {kpiCards.map(([title, value]) => (
          <article key={title} className="card">
            <p>{title}</p>
            <h2>{value}</h2>
          </article>
        ))}
      </section>

      <section className="grid">
        <article className="card large">
          <h3>Trend Momentum</h3>
          <TrendChart data={payload.top_trends || []} />
        </article>
        <article className="card">
          <h3>Risk Alerts</h3>
          <ul className="list">
            {(payload.risk_alerts || []).slice(0, 6).map((r) => (
              <li key={r.alert_id}>
                <strong>{r.title}</strong>
                <small>{r.severity}</small>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

