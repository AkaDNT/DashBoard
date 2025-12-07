"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useGetOrderStatusDistributionQuery } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function OrderStatusDonutChart() {
  const { data = [], isLoading, isError } =
    useGetOrderStatusDistributionQuery();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Loading order status...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600">
        Failed to load order status.
      </div>
    );
  }

  const labels = data.map((d) => d.status);
  const series = data.map((d) => d.count);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    labels,
    legend: {
      position: "bottom",
      fontSize: "11px",
    },
    dataLabels: { enabled: false },
    colors: ["#6366F1", "#22C55E", "#F97316", "#EF4444", "#0EA5E9", "#6B7280"],
    tooltip: {
      y: {
        formatter: (val: number) => `${val} orders`,
      },
    },
  };

  const total = series.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Order Status
        </h3>
        <span className="text-xs text-gray-400">
          Total: {total.toLocaleString("vi-VN")}
        </span>
      </div>

      {series.length === 0 ? (
        <p className="text-sm text-gray-400">No orders.</p>
      ) : (
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={260}
        />
      )}
    </div>
  );
}
