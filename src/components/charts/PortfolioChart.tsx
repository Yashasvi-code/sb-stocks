"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PortfolioChartProps {
  portfolio: Array<{
    stock: { symbol: string };
    currentValue: number;
    investedValue: number;
  }>;
}

export function PortfolioChart({ portfolio }: PortfolioChartProps) {
  const chartRef = useRef<ChartJS<"doughnut">>(null);

  const data = {
    labels: portfolio.map((p) => p.stock.symbol),
    datasets: [
      {
        data: portfolio.map((p) => p.currentValue),
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#ec4899",
          "#06b6d4",
          "#84cc16",
          "#f97316",
          "#6366f1",
        ],
        borderWidth: 2,
        borderColor: "#1f2937",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#9ca3af",
          font: { size: 12 },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: { label: string; parsed: number }) {
            const value = context.parsed;
            const total = portfolio.reduce((sum, p) => sum + p.currentValue, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (portfolio.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No portfolio data to display
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <Doughnut ref={chartRef} data={data} options={options} />
    </div>
  );
}

interface PerformanceChartProps {
  data: Array<{ date: string; value: number }>;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Portfolio Value",
        data: data.map((d) => d.value),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(156, 163, 175, 0.1)" },
        ticks: { color: "#9ca3af" },
      },
      y: {
        grid: { color: "rgba(156, 163, 175, 0.1)" },
        ticks: {
          color: "#9ca3af",
          callback: function (value: string | number) {
            return "$" + Number(value).toLocaleString();
          },
        },
      },
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No performance data to display
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
