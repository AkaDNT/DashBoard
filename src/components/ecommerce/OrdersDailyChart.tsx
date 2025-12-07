"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useGetDailyOrderStatsQuery } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const RANGE_OPTIONS = [7, 30, 90];

export default function OrdersDailyChart() {
  const [range, setRange] = useState<number>(30);
  const { data = [], isLoading, isError } = useGetDailyOrderStatsQuery({
    days: range,
  });

  const categories = data.map((d) =>
    new Intl.DateTimeFormat("vi-VN", { month: "2-digit", day: "2-digit" }).format(
      new Date(d.date)
    )
  );

  const series = [
    {
      name: "Orders",
      data: data.map((d) => d.totalOrders),
    },
    {
      name: "Revenue",
      data: data.map((d) => d.revenue),
    },
  ];

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      height: 220,
      toolbar: { show: false },
    },
    colors: ["#465fff", "#00b894"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "11px" } },
    },
    yaxis: [
      {
        seriesName: "Orders",
        labels: {
          style: { fontSize: "11px" },
          formatter: (val) => val.toFixed(0),
        },
      },
      {
        opposite: true,
        seriesName: "Revenue",
        labels: {
          style: { fontSize: "11px" },
          formatter: (val) => `${(val / 1_000_000).toFixed(1)}M`,
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        {
          formatter: (val?: number) =>
            val != null ? `${val.toFixed(0)} orders` : "",
        },
        {
          formatter: (val?: number) =>
            val != null
              ? val.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                })
              : "",
        },
      ],
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: "11px",
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Loading daily orders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600">
        Failed to load daily orders.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Orders & Revenue (Daily)
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            Last {range} days
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs dark:border-gray-700 dark:bg-gray-900">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 ${
                range === r
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] pl-2 xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={220}
          />
        </div>
      </div>
    </div>
  );
}
