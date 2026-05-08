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

const MOCK_TOPICS = [
  { title: "全球AI监管收紧推动算力合规升级", region: "欧美", momentum: 92.4 },
  { title: "中东航运扰动带动能源风险情绪上行", region: "中东非", momentum: 88.1 },
  { title: "亚太跨境电商促销引发消费热度增长", region: "亚太", momentum: 85.6 },
  { title: "主要经济体降息预期引导金融舆情分化", region: "欧美", momentum: 81.9 },
  { title: "半导体供应链恢复预期提升科技情绪", region: "亚太", momentum: 79.3 }
];

const MOCK_RISKS = [
  { alert_id: "r-001", title: "能源运输路线舆情突增", severity: "critical" },
  { alert_id: "r-002", title: "区域政策不确定性引发负面讨论", severity: "high" },
  { alert_id: "r-003", title: "金融板块传闻扩散速度异常", severity: "high" },
  { alert_id: "r-004", title: "品牌口碑出现两极化趋势", severity: "medium" }
];

const MOCK_REGIONS = [
  { region: "亚太", key_signals: ["科技与消费话题并行升温", "社交平台传播速度上升"], sentiment_shift: 0.12 },
  { region: "欧美", key_signals: ["监管话题占比提升", "金融预期分歧扩大"], sentiment_shift: -0.05 },
  { region: "中东非", key_signals: ["能源事件驱动强", "风险标签密度上升"], sentiment_shift: -0.14 }
];

function buildDemoPayload(seed = 0) {
  const wave = Math.sin(seed / 2);
  const docs = 1035000 + Math.floor(seed * 1200 + wave * 18000);
  const token = 4890000 + Math.floor(seed * 6000 + wave * 45000);
  const accuracy = 0.926 + (wave + 1) * 0.008;
  const coverage = 0.948 + (wave + 1) * 0.006;
  return {
    generated_at: new Date().toISOString(),
    kpis: {
      documents_processed: docs,
      token_consumed: token,
      summary_accuracy: Math.min(0.98, accuracy),
      trend_coverage: Math.min(0.99, coverage),
      report_generation_minutes: 18.5 + (seed % 4)
    },
    top_trends: MOCK_TOPICS.map((item, idx) => ({
      rank: idx + 1,
      cluster_id: `cluster-${idx + 1}`,
      title: item.title,
      momentum_score: Number((item.momentum + wave * 3 + idx).toFixed(2)),
      regions: [item.region]
    })),
    risk_alerts: MOCK_RISKS,
    regional_insights: MOCK_REGIONS
  };
}

export default function App() {
  const [payload, setPayload] = useState(() => buildDemoPayload(1));
  const [status, setStatus] = useState("connecting");
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [tick, setTick] = useState(1);
  const [filters, setFilters] = useState({
    region: "全部",
    industry: "全部",
    language: "全部",
    window: "24h"
  });

  const kpiCards = useMemo(
    () => [
      ["处理文档量", payload.kpis.documents_processed?.toLocaleString?.() || "0"],
      ["Token消耗", payload.kpis.token_consumed?.toLocaleString?.() || "0"],
      ["摘要准确率", `${((payload.kpis.summary_accuracy || 0) * 100).toFixed(2)}%`],
      ["热点覆盖率", `${((payload.kpis.trend_coverage || 0) * 100).toFixed(2)}%`]
    ],
    [payload]
  );

  useEffect(() => {
    let ws;
    const loadInit = async () => {
      try {
        const res = await fetch(`${API}/ui`);
        const data = await res.json();
        if (data && data.kpis) {
          setPayload(data);
          setIsDemoMode(false);
        }
      } catch {
        setStatus("offline");
      }
    };
    loadInit();
    try {
      ws = new WebSocket("ws://127.0.0.1:8090/ws/ui");
      ws.onopen = () => setStatus("live");
      ws.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        if (data && data.kpis) {
          setPayload(data);
          setIsDemoMode(false);
        }
      };
      ws.onerror = () => setStatus("degraded");
      ws.onclose = () => setStatus("closed");
    } catch {
      setStatus("offline");
    }
    return () => ws && ws.close();
  }, []);

  useEffect(() => {
    if (!isDemoMode) {
      return;
    }
    const timer = setInterval(() => {
      setTick((v) => v + 1);
    }, 2500);
    return () => clearInterval(timer);
  }, [isDemoMode]);

  useEffect(() => {
    if (isDemoMode) {
      setPayload(buildDemoPayload(tick));
      setStatus("demo");
    }
  }, [tick, isDemoMode]);

  const timelineItems = useMemo(
    () => [
      { time: "09:10", event: "亚太社交热词异动，消费类话题升温" },
      { time: "10:45", event: "欧美监管议题增长，AI合规讨论进入高位" },
      { time: "12:20", event: "中东非能源风险标签触发高优先告警" },
      { time: "13:05", event: "多语种摘要刷新完成，报告草稿自动回填" }
    ],
    []
  );

  const sourceMix = useMemo(
    () => [
      ["新闻站点", 42],
      ["社交媒体", 36],
      ["博客", 13],
      ["论坛", 9]
    ],
    []
  );

  const modelMix = useMemo(
    () => [
      ["GPT 系列", 48],
      ["Claude", 31],
      ["MiMo", 21]
    ],
    []
  );

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const headlines = useMemo(
    () => [
      "【快讯】亚太科技话题 30 分钟热度提升 12%",
      "【监控】欧美监管舆情关键词出现持续共振",
      "【预警】中东非能源风险标签升至高优先级",
      "【报告】多语言摘要任务最新批次已完成"
    ],
    []
  );

  const aiSuggestions = useMemo(
    () => [
      "建议将“能源运输路线”话题升级为一级监控并追加人审。",
      "建议对“金融传闻扩散”关联源做可信度分层，降低误报。",
      "建议在亚太区域追加日语与西语翻译预算，提高覆盖率。",
      "建议将负向情绪阈值从 0.78 下调到 0.74，提升早预警能力。"
    ],
    []
  );

  const taskProgress = useMemo(
    () => [
      { name: "抓取任务", value: 96 },
      { name: "预处理任务", value: 91 },
      { name: "摘要任务", value: 88 },
      { name: "情感任务", value: 93 },
      { name: "聚类任务", value: 84 },
      { name: "报告编排", value: 79 }
    ],
    []
  );

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Global Intel Command Center</h1>
          <p className="subtitle">全球多语言新闻与社交舆情智能分析平台</p>
        </div>
        <span className={`status ${status}`}>{status}</span>
      </header>

      <section className="card actionBar">
        <div className="actionLeft">
          <button type="button">刷新全局</button>
          <button type="button">导出日报</button>
          <button type="button">分享链接</button>
        </div>
        <div className="actionRight">
          <span>当前模式：{isDemoMode ? "演示模式" : "实时模式"}</span>
          <span>报告窗口：{filters.window}</span>
        </div>
      </section>

      <section className="ticker card">
        <strong>实时播报</strong>
        <div className="tickerTrack">
          <div className="tickerText">
            {headlines.join("   ·   ")}   ·   {headlines.join("   ·   ")}
          </div>
        </div>
      </section>

      <section className="card toolbar">
        <div className="toolbarRow">
          <label>
            地区
            <select value={filters.region} onChange={(e) => handleFilter("region", e.target.value)}>
              <option>全部</option>
              <option>亚太</option>
              <option>欧美</option>
              <option>中东非</option>
            </select>
          </label>
          <label>
            行业
            <select value={filters.industry} onChange={(e) => handleFilter("industry", e.target.value)}>
              <option>全部</option>
              <option>科技</option>
              <option>金融</option>
              <option>能源</option>
              <option>消费</option>
            </select>
          </label>
          <label>
            语言
            <select value={filters.language} onChange={(e) => handleFilter("language", e.target.value)}>
              <option>全部</option>
              <option>中文</option>
              <option>英语</option>
              <option>日语</option>
              <option>西班牙语</option>
            </select>
          </label>
          <label>
            时间窗
            <select value={filters.window} onChange={(e) => handleFilter("window", e.target.value)}>
              <option>6h</option>
              <option>24h</option>
              <option>3d</option>
              <option>7d</option>
            </select>
          </label>
        </div>
      </section>

      <section className="kpiGrid">
        {kpiCards.map(([title, value]) => (
          <article key={title} className="card">
            <p>{title}</p>
            <h2>{value}</h2>
          </article>
        ))}
      </section>

      <section className="grid thirds">
        <article className="card">
          <div className="cardHead">
            <h3>AI策略建议</h3>
            <span className="tag success">Copilot</span>
          </div>
          <ul className="list">
            {aiSuggestions.slice(0, 3).map((item) => (
              <li key={item}>
                <strong>{item}</strong>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <div className="cardHead">
            <h3>执行进度</h3>
            <span className="tag">Pipeline</span>
          </div>
          <ul className="mixList">
            {taskProgress.map((task) => (
              <li key={task.name}>
                <div className="mixLabel"><span>{task.name}</span><b>{task.value}%</b></div>
                <div className="mixBar"><i style={{ width: `${task.value}%` }} /></div>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <div className="cardHead">
            <h3>告警中心</h3>
            <span className="tag danger">P1 / P2</span>
          </div>
          <ul className="list">
            <li><strong>P1: 能源路由波动升级</strong><small>2m 前</small></li>
            <li><strong>P1: 金融传闻扩散异常</strong><small>9m 前</small></li>
            <li><strong>P2: 品牌情绪分化扩大</strong><small>14m 前</small></li>
          </ul>
        </article>
      </section>

      <section className="grid">
        <article className="card large">
          <div className="cardHead">
            <h3>趋势动量监测</h3>
            <span className="tag">实时滚动</span>
          </div>
          <TrendChart data={payload.top_trends || []} />
        </article>
        <article className="card">
          <div className="cardHead">
            <h3>风险预警</h3>
            <span className="tag danger">{(payload.risk_alerts || []).length}</span>
          </div>
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

      <section className="grid thirds">
        <article className="card">
          <div className="cardHead">
            <h3>系统运行状态</h3>
            <span className="tag">SLA 99.9%</span>
          </div>
          <div className="statusRows">
            <div><span>抓取链路</span><b>98.7%</b></div>
            <div><span>摘要任务</span><b>97.9%</b></div>
            <div><span>RAG 命中率</span><b>82.4%</b></div>
            <div><span>缓存命中率</span><b>41.2%</b></div>
          </div>
        </article>
        <article className="card">
          <div className="cardHead">
            <h3>数据来源占比</h3>
            <span className="tag">今日</span>
          </div>
          <ul className="mixList">
            {sourceMix.map(([name, ratio]) => (
              <li key={name}>
                <div className="mixLabel"><span>{name}</span><b>{ratio}%</b></div>
                <div className="mixBar"><i style={{ width: `${ratio}%` }} /></div>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <div className="cardHead">
            <h3>模型调用占比</h3>
            <span className="tag">Agent 路由</span>
          </div>
          <ul className="mixList">
            {modelMix.map(([name, ratio]) => (
              <li key={name}>
                <div className="mixLabel"><span>{name}</span><b>{ratio}%</b></div>
                <div className="mixBar"><i style={{ width: `${ratio}%` }} /></div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <div className="cardHead">
            <h3>事件时间线</h3>
            <span className="tag">自动更新</span>
          </div>
          <ul className="timeline">
            {timelineItems.map((item) => (
              <li key={item.time + item.event}>
                <span>{item.time}</span>
                <p>{item.event}</p>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <div className="cardHead">
            <h3>报告产出状态</h3>
            <span className="tag success">已就绪</span>
          </div>
          <ul className="list">
            <li><strong>日报 JSON</strong><small>latest_report.json</small></li>
            <li><strong>报告 Markdown</strong><small>latest_report.md</small></li>
            <li><strong>Excel 导出</strong><small>latest_report.xlsx</small></li>
            <li><strong>PDF 导出</strong><small>latest_report.pdf</small></li>
          </ul>
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <div className="cardHead">
            <h3>热点榜单</h3>
            <span className="tag">TOP {(payload.top_trends || []).length}</span>
          </div>
          <ul className="list">
            {(payload.top_trends || []).slice(0, 5).map((t) => (
              <li key={t.cluster_id}>
                <strong>{t.title}</strong>
                <small>{t.momentum_score}</small>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <div className="cardHead">
            <h3>区域洞察</h3>
            <span className="tag">更新中</span>
          </div>
          <ul className="list">
            {(payload.regional_insights || []).slice(0, 3).map((region) => (
              <li key={region.region}>
                <strong>{region.region}</strong>
                <small>{region.sentiment_shift > 0 ? "+" : ""}{region.sentiment_shift}</small>
              </li>
            ))}
          </ul>
          <p className="updatedAt">最后更新：{new Date(payload.generated_at).toLocaleString("zh-CN")}</p>
        </article>
      </section>
    </div>
  );
}

