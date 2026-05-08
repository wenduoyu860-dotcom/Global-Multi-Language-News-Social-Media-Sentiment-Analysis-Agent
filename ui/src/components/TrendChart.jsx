import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export default function TrendChart({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const labels = data.map((x) => x.title?.slice(0, 16) || "n/a");
    const values = data.map((x) => Number(x.momentum_score || 0));
    chart.setOption({
      backgroundColor: "transparent",
      grid: { left: 30, right: 10, top: 30, bottom: 40 },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: { color: "#b8c8ef", interval: 0, rotate: 24 }
      },
      yAxis: { type: "value", axisLabel: { color: "#b8c8ef" } },
      series: [
        {
          type: "bar",
          data: values,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#6af2d5" },
              { offset: 1, color: "#6c8fff" }
            ])
          }
        }
      ]
    });
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
  }, [data]);

  return <div ref={ref} style={{ width: "100%", height: 320 }} />;
}

