const state = {
  region: "all",
  industry: "all",
  sentiment: "all",
  ticks: 0,
  usePayload: false
};

const topicPool = [
  { title: "AI 监管与数据合规", region: "欧美", industry: "科技" },
  { title: "新能源价格波动", region: "中东非", industry: "能源" },
  { title: "跨境电商促销热度", region: "亚太", industry: "消费" },
  { title: "央行利率政策预期", region: "欧美", industry: "金融" },
  { title: "芯片供应链恢复", region: "亚太", industry: "科技" },
  { title: "地缘风险与油价", region: "中东非", industry: "能源" },
  { title: "移动支付渗透增长", region: "亚太", industry: "金融" },
  { title: "社交平台内容审查", region: "欧美", industry: "科技" }
];

const riskPool = [
  { title: "中东能源运输紧张升级", level: "high", text: "负面情绪 3h 内增长 28%" },
  { title: "某品牌舆情两极分化", level: "medium", text: "微博与 Reddit 观点冲突增强" },
  { title: "金融板块传闻传播加速", level: "high", text: "传播速度超过 7 日均值 1.9x" },
  { title: "区域性政策不确定性", level: "medium", text: "多语种讨论热度持续抬升" }
];

const stages = [
  "抓取",
  "清洗",
  "摘要",
  "情感",
  "聚类",
  "报告"
];

const els = {
  clock: document.getElementById("clock"),
  docs: document.getElementById("kpiDocs"),
  token: document.getElementById("kpiToken"),
  acc: document.getElementById("kpiAccuracy"),
  time: document.getElementById("kpiTime"),
  riskCount: document.getElementById("riskCount"),
  riskList: document.getElementById("riskList"),
  topicList: document.getElementById("topicList"),
  pipeline: document.getElementById("pipeline"),
  refreshBtn: document.getElementById("refreshBtn"),
  region: document.getElementById("regionFilter"),
  industry: document.getElementById("industryFilter"),
  sentiment: document.getElementById("sentimentFilter"),
  canvas: document.getElementById("trendCanvas")
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatInt(num) {
  return num.toLocaleString("en-US");
}

function updateClock() {
  const now = new Date();
  els.clock.textContent = now.toLocaleString("zh-CN");
}

function matchFilter(item) {
  return (state.region === "all" || item.region === state.region) &&
    (state.industry === "all" || item.industry === state.industry);
}

function generateKPIs() {
  if (state.usePayload && state.payload) {
    const k = state.payload.kpis;
    els.docs.textContent = formatInt(k.documents_processed || 0);
    els.token.textContent = formatInt(k.token_consumed || 0);
    els.acc.textContent = `${((k.summary_accuracy || 0) * 100).toFixed(2)}%`;
    els.time.textContent = `${(k.report_generation_minutes || 0).toFixed(1)} min`;
    return;
  }
  const docs = 980000 + rand(0, 90000);
  const token = 4600000 + rand(0, 700000);
  const acc = 0.91 + Math.random() * 0.04;
  const minutes = 22 + Math.random() * 10;

  els.docs.textContent = formatInt(docs);
  els.token.textContent = formatInt(token);
  els.acc.textContent = `${(acc * 100).toFixed(2)}%`;
  els.time.textContent = `${minutes.toFixed(1)} min`;
}

function renderRisks() {
  if (state.usePayload && state.payload) {
    const items = (state.payload.risk_alerts || []).map((r) => ({
      title: r.title,
      level: r.severity === "critical" ? "high" : "medium",
      text: r.description
    }));
    els.riskCount.textContent = String(items.length);
    els.riskList.innerHTML = items
      .map(
        (r) => `<li class="risk-item ${r.level === "high" ? "high" : ""}">
          <strong>${r.title}</strong>
          <p>${r.text}</p>
        </li>`
      )
      .join("");
    return;
  }
  const count = rand(2, 4);
  const items = [...riskPool].sort(() => Math.random() - 0.5).slice(0, count);
  els.riskCount.textContent = String(items.length);
  els.riskList.innerHTML = items
    .map(
      (r) => `<li class="risk-item ${r.level === "high" ? "high" : ""}">
        <strong>${r.title}</strong>
        <p>${r.text}</p>
      </li>`
    )
    .join("");
}

function renderTopics() {
  if (state.usePayload && state.payload) {
    const items = state.payload.top_trends || [];
    els.topicList.innerHTML = items
      .slice(0, 6)
      .map(
        (t) => `<div class="topic-item">
          <span>${t.title}</span>
          <span class="topic-score">${Number(t.momentum_score || 0).toFixed(1)}</span>
        </div>`
      )
      .join("");
    return;
  }
  const filtered = topicPool.filter(matchFilter);
  const chosen = (filtered.length ? filtered : topicPool).slice(0, 6);
  els.topicList.innerHTML = chosen
    .map(
      (t) => `<div class="topic-item">
        <span>${t.title}</span>
        <span class="topic-score">${rand(72, 99)}</span>
      </div>`
    )
    .join("");
}

function renderPipeline() {
  els.pipeline.innerHTML = stages
    .map((name) => {
      const p = rand(78, 99);
      return `<div class="stage">
        <h4>${name}</h4>
        <div class="bar"><span style="width:${p}%"></span></div>
      </div>`;
    })
    .join("");
}

function drawTrend() {
  const canvas = els.canvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(10,16,30,0.95)";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  for (let i = 1; i <= 5; i++) {
    const y = (h / 6) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const points = 14;
  const gap = w / (points - 1);
  const values = Array.from({ length: points }, (_, i) => {
    const base = 50 + Math.sin((i + state.ticks * 0.6) / 2) * 18;
    return base + rand(-8, 8);
  });

  const toY = (v) => h - ((v - 20) / 70) * (h - 30) - 10;

  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "rgba(80,227,194,0.35)");
  gradient.addColorStop(1, "rgba(80,227,194,0)");

  ctx.beginPath();
  ctx.moveTo(0, toY(values[0]));
  values.forEach((v, i) => ctx.lineTo(i * gap, toY(v)));
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#67f0cf";
  values.forEach((v, i) => {
    const x = i * gap;
    const y = toY(v);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  values.forEach((v, i) => {
    const x = i * gap;
    const y = toY(v);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#a9f7e7";
    ctx.fill();
  });
}

function tick() {
  state.ticks += 1;
  generateKPIs();
  renderRisks();
  renderTopics();
  renderPipeline();
  drawTrend();
}

async function tryLoadPayload() {
  const candidates = [
    "../output/ui_payload.json",
    "http://127.0.0.1:8088/ui"
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        continue;
      }
      state.payload = await res.json();
      state.usePayload = true;
      return true;
    } catch (err) {
      continue;
    }
  }
  return false;
}

function bindEvents() {
  els.refreshBtn.addEventListener("click", tick);
  els.region.addEventListener("change", (e) => {
    state.region = e.target.value;
    renderTopics();
  });
  els.industry.addEventListener("change", (e) => {
    state.industry = e.target.value;
    renderTopics();
  });
  els.sentiment.addEventListener("change", (e) => {
    state.sentiment = e.target.value;
    tick();
  });
}

async function boot() {
  bindEvents();
  updateClock();
  await tryLoadPayload();
  tick();
  setInterval(updateClock, 1000);
  setInterval(() => {
    tick();
  }, 6000);
}

boot();
