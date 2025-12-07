"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useGetPaymentMethodStatsQuery } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function PaymentMethodChart() {
  const { data = [], isLoading, isError } = useGetPaymentMethodStatsQuery();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Loading payment stats...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600">
        Failed to load payment stats.
      </div>
    );
  }

  const labels = data.map((d) => d.paymentMethod);
  const series = data.map((d) => d.ordersCount);
  const total = series.reduce((a, b) => a + b, 0);

  const options: ApexOptions = {
    chart: {
      type: "pie",
      fontFamily: "Outfit, sans-serif",
    },
    labels,
    legend: {
      position: "bottom",
      fontSize: "11px",
    },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (val: number) => {
          const percent =
            total > 0 ? ((val / total) * 100).toFixed(1) + "%" : "";
          return `${val} orders (${percent})`;
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Payment Methods
        </h3>
        <span className="text-xs text-gray-400">
          {total.toLocaleString("vi-VN")} orders
        </span>
      </div>

      {series.length === 0 ? (
        <p className="text-sm text-gray-400">No data.</p>
      ) : (
        <ReactApexChart
          options={options}
          series={series}
          type="pie"
          height={240}
        />
      )}
    </div>
  );
}
