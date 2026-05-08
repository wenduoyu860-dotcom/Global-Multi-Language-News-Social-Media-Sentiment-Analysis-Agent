# 每日全球舆情与趋势报告

- 报告编号：`{{report_id}}`
- 报告日期：`{{report_date}}`
- 生成时间：`{{generated_at}}`
- 覆盖范围：地区 `{{scope.regions}}`，行业 `{{scope.industries}}`，语言 `{{scope.languages}}`

## 一、执行摘要

{{executive_summary}}

## 二、核心指标

- 处理文本量：`{{kpis.documents_processed}}`
- Token 消耗：`{{kpis.token_consumed}}`
- 摘要准确率：`{{kpis.summary_accuracy}}`
- 热点覆盖率：`{{kpis.trend_coverage}}`
- 报告生成时长（分钟）：`{{kpis.report_generation_minutes}}`
- 缓存命中率：`{{kpis.cache_hit_rate}}`
- 每千条成本：`{{kpis.cost_per_1k_docs}}`

## 三、今日 Top 趋势

{{#each top_trends}}
### {{rank}}. {{title}}（Cluster: {{cluster_id}}）
- 重要性：{{why_it_matters}}
- 情绪：{{sentiment}}，动量分：{{momentum_score}}，风险等级：{{risk_level}}
- 影响区域：{{regions}}
- 证据链：{{evidence_doc_ids}}
{{/each}}

## 四、风险预警

{{#if risk_alerts.length}}
{{#each risk_alerts}}
### [{{severity}}] {{title}}（Alert: {{alert_id}}）
- 描述：{{description}}
- 关联事件：{{related_cluster_ids}}
- 建议动作：
  - {{recommended_actions}}
{{/each}}
{{else}}
今日未发现高等级风险预警。
{{/if}}

## 五、区域洞察

{{#each regional_insights}}
### {{region}}
- 关键信号：
  - {{key_signals}}
- 情绪变化：{{sentiment_shift}}
{{/each}}

## 六、行业洞察

{{#each industry_insights}}
### {{industry}}
- 重点观察：
  - {{highlights}}
{{/each}}

## 七、方法与说明

- 数据来源：{{methodology.data_sources}}
- 模型栈：{{methodology.model_stack}}
- 说明：{{methodology.notes}}
